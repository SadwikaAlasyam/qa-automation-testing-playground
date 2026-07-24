import type { Metadata } from "next";
import "../qa-lab/alignment.css";
import "../qa-lab/advanced/advanced.css";

export const metadata: Metadata = {
  title: "Advanced QA | QA Automation Testing Playground",
  description: "Advanced automation testing practice covering difficult UI behavior, REST Assured, authentication, SOAP, SQL, accessibility, and reliability.",
};

export default function AdvancedQALayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
