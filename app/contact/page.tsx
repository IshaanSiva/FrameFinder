import { Metadata } from "next";
import Link from "next/link";
import { Mail, Trash2, CreditCard, Bug, Shield } from "lucide-react";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Contact & Support — FrameFinder",
  description: "Get help with your FrameFinder account, billing, or data.",
};

// PLACEHOLDER — replace with real support email before launch
const SUPPORT_EMAIL = "support@framefinder.app";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  subject: string;
  instructions: string[];
}

function ContactCard({ icon, title, subject, instructions }: ContactCardProps) {
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
        >
          {icon}
        </div>
        <h3 className="text-[14.5px] font-bold" style={{ color: "#1c2018" }}>
          {title}
        </h3>
      </div>
      <ol className="mb-4 space-y-1.5 pl-1 text-[13px]" style={{ color: "#687070" }}>
        {instructions.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-px flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-black"
              style={{ backgroundColor: "#e0ece0", color: "#2c5c34" }}
            >
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <a
        href={mailtoHref}
        className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all hover:-translate-y-px"
        style={{ backgroundColor: "#dce8dc", color: "#1e4028" }}
      >
        <Mail className="h-3.5 w-3.5" />
        Email us — {subject}
      </a>
    </div>
  );
}

export default function ContactPage() {
  return (
    <LegalPageShell
      badge="Support"
      title="Contact & Support"
      subtitle="Get help with your account, billing, data, or anything else."
      lastUpdated="June 2026"
    >
      {/* Support email banner */}
      <div
        className="mb-8 flex flex-col items-center gap-2 rounded-xl border py-6 text-center sm:flex-row sm:gap-4 sm:px-6 sm:text-left"
        style={{ backgroundColor: "#f0f7f0", borderColor: "#b8d4b8" }}
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
        >
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: "#1c2018" }}>
            General support
          </p>
          <p className="text-[12.5px]" style={{ color: "#687070" }}>
            For anything not covered below, email us directly:
          </p>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="ml-auto flex-shrink-0 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-[13px] font-semibold text-emerald-700 transition-all hover:-translate-y-px hover:bg-emerald-50"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      {/* Contact cards */}
      <div className="space-y-4">
        <ContactCard
          icon={<Trash2 className="h-4 w-4" />}
          title="Account & Data Deletion"
          subject="Account Deletion Request"
          instructions={[
            "Send an email to support with subject: \"Account Deletion Request\".",
            "Include the email address registered to your FrameFinder account.",
            "We will delete your saved reports and account data within a reasonable timeframe.",
            "Note: Stripe retains billing records per their own policies; Clerk account data is managed through Clerk.",
          ]}
        />

        <ContactCard
          icon={<CreditCard className="h-4 w-4" />}
          title="Billing & Subscription Help"
          subject="Billing Support"
          instructions={[
            "To cancel your subscription: go to the Pricing page → click \"Manage Subscription\" → cancel in the Stripe portal.",
            "For billing questions, unexpected charges, or refund requests: email us with subject \"Billing Support\".",
            "Include the email on your account and the approximate date of the charge.",
            "We review all billing issues in good faith and aim to respond within 2 business days.",
          ]}
        />

        <ContactCard
          icon={<Bug className="h-4 w-4" />}
          title="Bug Reports"
          subject="Bug Report"
          instructions={[
            "Email us with subject \"Bug Report\".",
            "Describe what you were doing when the issue occurred.",
            "Include your browser, operating system, and any error messages you saw.",
            "If the bug involves analysis output, include the type of content (e.g., \"history textbook excerpt\") — you don't need to paste the full text.",
          ]}
        />

        <ContactCard
          icon={<Shield className="h-4 w-4" />}
          title="Privacy & Data Requests"
          subject="Privacy Request"
          instructions={[
            "For data access requests (what we have stored about you): email with subject \"Privacy Request\".",
            "For data deletion requests: see \"Account & Data Deletion\" above.",
            "For questions about how your data is handled: see our Privacy Policy.",
            "We aim to respond to all privacy requests within 30 days.",
          ]}
        />
      </div>

      {/* Legal links */}
      <div
        className="mt-8 rounded-xl border p-5 text-[13px]"
        style={{ backgroundColor: "#fdfbf5", borderColor: "#e8e4da", color: "#7a8e7c" }}
      >
        <p className="mb-2 font-semibold" style={{ color: "#687070" }}>
          Also useful:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="text-emerald-700 hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-emerald-700 hover:underline">Terms of Service</Link>
          <Link href="/refunds" className="text-emerald-700 hover:underline">Refund Policy</Link>
          <Link href="/ai-disclaimer" className="text-emerald-700 hover:underline">AI Disclaimer</Link>
        </div>
      </div>

      {/* Response time note */}
      <p className="mt-6 text-center text-[11.5px]" style={{ color: "#a8bfaa" }}>
        FrameFinder is an early-stage product. We read every email and aim to respond
        within 2 business days for most requests.
      </p>
    </LegalPageShell>
  );
}
