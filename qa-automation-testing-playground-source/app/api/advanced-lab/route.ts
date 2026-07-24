import { NextRequest, NextResponse } from "next/server";

const messages: Record<number, string> = {
  400: "Malformed request parameters",
  401: "Authentication token is missing or expired",
  403: "The authenticated role cannot access this order",
  404: "Order ADV-404 was not found",
  409: "Order reference already exists",
  415: "Content-Type must be application/json",
  422: "The request is valid JSON but fails business validation",
  429: "Rate limit exceeded; retry after 2 seconds",
  500: "Controlled internal service failure",
};

export async function GET(request: NextRequest) {
  const status = Number(request.nextUrl.searchParams.get("status") || 200);
  const auth = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  const cookie = request.cookies.get("orderflow_session")?.value;

  if (request.nextUrl.searchParams.get("auth") === "required" && !auth && !apiKey) {
    return NextResponse.json({ error: messages[401], code: "AUTH_REQUIRED" }, { status: 401 });
  }
  if (request.nextUrl.searchParams.get("token") === "expired") {
    return NextResponse.json({ error: messages[401], code: "TOKEN_EXPIRED" }, { status: 401 });
  }
  if (messages[status]) {
    const headers = status === 429 ? { "Retry-After": "2", "X-RateLimit-Remaining": "0" } : undefined;
    return NextResponse.json({ error: messages[status], status, traceId: `ADV-${status}-TRACE` }, { status, headers });
  }
  return NextResponse.json({
    order: { id: "ADV-2048", customer: "Sadwika", status: "Ready", total: 59.96 },
    request: { query: Object.fromEntries(request.nextUrl.searchParams), authenticated: Boolean(auth || apiKey), session: Boolean(cookie) },
    schemaVersion: "1.0",
  }, { headers: { "X-Correlation-ID": "ORDERFLOW-ADV-2048", "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: messages[415] }, { status: 415 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: messages[400] }, { status: 400 });
  if (!body.customer || Number(body.total) <= 0) return NextResponse.json({ error: messages[422] }, { status: 422 });
  if (body.reference === "DUPLICATE") return NextResponse.json({ error: messages[409] }, { status: 409 });
  return NextResponse.json({ id: `ADV-${Date.now()}`, ...body }, { status: 201 });
}
