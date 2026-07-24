import type { Metadata } from "next";
import "./alignment.css";
import "./advanced/advanced.css";

export const metadata: Metadata = {
  title: "OrderFlow QA Lab | QA Automation Testing Playground",
  description: "A guided, real-world QA learning lab covering cart calculations, checkout validation, asynchronous order tracking, popups, and iframe payments.",
};

export default function QALabLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
