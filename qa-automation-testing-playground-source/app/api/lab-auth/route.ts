import { and, desc, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { authEvents, labSessions, labUsers } from "../../../db/schema";

const cookieName = "orderflow_lab_session";
const toHex = (value: ArrayBuffer) => Array.from(new Uint8Array(value)).map(x => x.toString(16).padStart(2, "0")).join("");
const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 }, key, 256);
  return `pbkdf2$210000$${toHex(salt.buffer)}$${toHex(derived)}`;
};
const legacyHash = async (value: string) => toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`orderflow-lab:${value}`)));
const verifyPassword = async (password: string, stored: string) => {
  if (!stored.startsWith("pbkdf2$")) return stored === await legacyHash(password);
  const [kind, count, saltHex, expected] = stored.split("$");
  if (kind !== "pbkdf2" || !count || !saltHex || !expected) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(x => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const actual = toHex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: Number(count) }, key, 256));
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
};
const event = (username: string, action: string, result: string) => getDb().insert(authEvents).values({ username, action, result });

async function currentUser(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return null;
  const [row] = await getDb().select({ id: labUsers.id, username: labUsers.username, email: labUsers.email, role: labUsers.role, expiresAt: labSessions.expiresAt }).from(labSessions).innerJoin(labUsers, eq(labSessions.userId, labUsers.id)).where(and(eq(labSessions.token, token), gt(labSessions.expiresAt, new Date()))).limit(1);
  return row || null;
}

export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (request.nextUrl.searchParams.get("view") === "audit") {
    if (user.role !== "admin") return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    const events = await getDb().select().from(authEvents).orderBy(desc(authEvents.id)).limit(100);
    return NextResponse.json({ user, events });
  }
  return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Cross-origin authentication request blocked." }, { status: 403 });
  const body = await request.json() as { action?: string; username?: string; email?: string; password?: string; role?: string; adminCode?: string | null };
  const username = body.username?.trim() || "unknown";
  const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const ownerUsername = process.env.ADMIN_USERNAME || "Admin001";
  const hasOwnerCredentials =
    Boolean(process.env.ADMIN_INVITE_CODE) &&
    body.adminCode === process.env.ADMIN_INVITE_CODE &&
    body.email?.trim().toLowerCase() === ownerEmail &&
    username === ownerUsername;
  if (body.action === "owner-setup" || (body.action === "register" && hasOwnerCredentials)) {
    if (!process.env.ADMIN_INVITE_CODE || body.adminCode !== process.env.ADMIN_INVITE_CODE || body.email?.trim().toLowerCase() !== ownerEmail || username !== ownerUsername) {
      return NextResponse.json({ error: "Owner setup denied." }, { status: 403 });
    }
    if ((body.password?.length || 0) < 8) return NextResponse.json({ error: "Password must contain at least 8 characters." }, { status: 400 });
    const passwordHash = await hashPassword(body.password!);
    const database = env.DB;
    const conflicts = await database.prepare("SELECT id, email FROM lab_users WHERE lower(email) = lower(?) OR lower(username) = lower(?) ORDER BY CASE WHEN lower(email) = lower(?) THEN 0 ELSE 1 END, id").bind(ownerEmail, ownerUsername, ownerEmail).all<{ id: number; email: string }>();
    const existing = conflicts.results[0];
    if (existing) {
      const duplicateIds = conflicts.results.slice(1).map(row => row.id);
      const cleanupStatements = duplicateIds.flatMap(id => [
        database.prepare("DELETE FROM lab_sessions WHERE user_id = ?").bind(id),
        database.prepare("DELETE FROM lab_users WHERE id = ?").bind(id),
      ]);
      await database.batch([
        ...cleanupStatements,
        database.prepare("UPDATE lab_users SET username = ?, email = ?, password_hash = ?, role = 'admin' WHERE id = ?").bind(ownerUsername, ownerEmail, passwordHash, existing.id),
      ]);
    } else {
      await database.prepare("INSERT INTO lab_users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)").bind(ownerUsername, ownerEmail, passwordHash, Math.floor(Date.now() / 1000)).run();
    }
    await database.prepare("INSERT INTO auth_events (username, action, result, created_at) VALUES (?, 'OWNER_SETUP', 'SUCCESS', ?)").bind(ownerUsername, Math.floor(Date.now() / 1000)).run();
    return NextResponse.json({ user: { username: ownerUsername, role: "admin" }, configured: true });
  }
  if (body.action === "promote-owner") {
    if (!process.env.ADMIN_INVITE_CODE || body.adminCode !== process.env.ADMIN_INVITE_CODE) return NextResponse.json({ error: "Owner promotion denied." }, { status: 403 });
    const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!ownerEmail) return NextResponse.json({ error: "Owner email is not configured." }, { status: 500 });
    const [ownerByEmail] = await getDb().select().from(labUsers).where(eq(labUsers.email, ownerEmail)).limit(1);
    const [ownerByUsername] = ownerByEmail || !process.env.ADMIN_USERNAME ? [] : await getDb().select().from(labUsers).where(eq(labUsers.username, process.env.ADMIN_USERNAME)).limit(1);
    const registeredUsers = ownerByEmail || ownerByUsername ? [] : await getDb().select().from(labUsers).limit(20);
    const configuredUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const normalizedOwner = registeredUsers.find(user => user.email.trim().toLowerCase() === ownerEmail || user.username.trim().toLowerCase() === configuredUsername);
    const owner = ownerByEmail || ownerByUsername || normalizedOwner || (registeredUsers.length === 1 ? registeredUsers[0] : undefined);
    if (!owner) return NextResponse.json({ error: "Existing owner account was not found." }, { status: 404 });
    await getDb().update(labUsers).set({ role: "admin" }).where(eq(labUsers.id, owner.id));
    await event(owner.username, "ADMIN_PROMOTION", "SUCCESS");
    return NextResponse.json({ ok: true, username: owner.username, role: "admin" });
  }
  if (body.action === "register") {
    if (!/^[A-Za-z0-9_-]{3,24}$/.test(username) || !body.email?.includes("@") || (body.password?.length || 0) < 8) {
      await event(username, "REGISTER", "VALIDATION_FAILED");
      return NextResponse.json({ error: "Use a 3–24 character username, valid email, and password of at least 8 characters." }, { status: 400 });
    }
    const email = body.email!.trim().toLowerCase();
    let role = ["customer", "support"].includes(body.role || "") ? body.role! : "customer";
    const isOwnerInvite = email === process.env.ADMIN_EMAIL?.toLowerCase() && Boolean(process.env.ADMIN_INVITE_CODE) && body.adminCode === process.env.ADMIN_INVITE_CODE;
    if (isOwnerInvite) role = "admin";
    if (isOwnerInvite) {
      await getDb().delete(labUsers).where(eq(labUsers.username, username));
      await getDb().delete(labUsers).where(eq(labUsers.email, email));
    }
    if (body.role === "admin") {
      if (email !== process.env.ADMIN_EMAIL?.toLowerCase() || !process.env.ADMIN_INVITE_CODE || body.adminCode !== process.env.ADMIN_INVITE_CODE) {
        await event(username, "REGISTER_ADMIN", "DENIED");
        return NextResponse.json({ error: "Admin registration is restricted to the site owner." }, { status: 403 });
      }
      const [ownerByEmail] = await getDb().select().from(labUsers).where(eq(labUsers.email, email)).limit(1);
      const [ownerByUsername] = ownerByEmail ? [] : await getDb().select().from(labUsers).where(eq(labUsers.username, username)).limit(1);
      const existingOwnerAccount = ownerByEmail || ownerByUsername;
      if (existingOwnerAccount) {
        if (!await verifyPassword(body.password!, existingOwnerAccount.passwordHash)) {
          await event(username, "ADMIN_CLAIM", "PASSWORD_MISMATCH");
          return NextResponse.json({ error: "This owner account already exists. Enter its existing password to upgrade it." }, { status: 401 });
        }
        const [upgraded] = await getDb().update(labUsers).set({ role: "admin", passwordHash: await hashPassword(body.password!) }).where(eq(labUsers.id, existingOwnerAccount.id)).returning();
        await event(upgraded.username, "ADMIN_CLAIM", "SUCCESS");
        return NextResponse.json({ user: { username: upgraded.username, role: upgraded.role }, upgraded: true }, { status: 200 });
      }
      const [existingAdmin] = await getDb().select({ id: labUsers.id }).from(labUsers).where(eq(labUsers.role, "admin")).limit(1);
      if (existingAdmin) return NextResponse.json({ error: "The site administrator account already exists." }, { status: 409 });
      role = "admin";
    }
    try {
      const [user] = await getDb().insert(labUsers).values({ username, email, passwordHash: await hashPassword(body.password!), role }).returning();
      await event(username, "REGISTER", "SUCCESS");
      return NextResponse.json({ user: { username: user.username, role: user.role } }, { status: 201 });
    } catch {
      await event(username, "REGISTER", "DUPLICATE");
      return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }
  }
  if (body.action === "login") {
    const [user] = await getDb().select().from(labUsers).where(eq(labUsers.username, username)).limit(1);
    if (!user || !await verifyPassword(body.password || "", user.passwordHash)) {
      await event(username, "LOGIN", "INVALID_CREDENTIALS");
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }
    if (!user.passwordHash.startsWith("pbkdf2$")) await getDb().update(labUsers).set({ passwordHash: await hashPassword(body.password!) }).where(eq(labUsers.id, user.id));
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await getDb().insert(labSessions).values({ token, userId: user.id, expiresAt });
    await event(username, "LOGIN", "SUCCESS");
    const response = NextResponse.json({ user: { username: user.username, email: user.email, role: user.role }, expiresAt });
    response.cookies.set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", expires: expiresAt });
    return response;
  }
  if (body.action === "logout") {
    const token = request.cookies.get(cookieName)?.value;
    const user = await currentUser(request);
    if (token) await getDb().delete(labSessions).where(eq(labSessions.token, token));
    if (user) await event(user.username, "LOGOUT", "SUCCESS");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, "", { path: "/", expires: new Date(0) });
    return response;
  }
  if (body.action === "expire") {
    const token = request.cookies.get(cookieName)?.value;
    const user = await currentUser(request);
    if (token) await getDb().delete(labSessions).where(eq(labSessions.token, token));
    if (user) await event(user.username, "SESSION", "EXPIRED_BY_TEST");
    const response = NextResponse.json({ ok: true, message: "Session expired for testing." });
    response.cookies.set(cookieName, "", { path: "/", expires: new Date(0) });
    return response;
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
