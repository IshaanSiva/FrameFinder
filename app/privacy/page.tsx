import { Metadata } from "next";
import LegalPageShell, {
  LegalSection,
  LegalDivider,
  LegalList,
  LegalCallout,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — FrameFinder",
  description: "How FrameFinder collects, stores, and uses your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      badge="Legal"
      title="Privacy Policy"
      subtitle="We keep this straightforward. Here's what we collect, why, and how to delete it."
      lastUpdated="June 2026"
    >
      <LegalCallout>
        <strong>Short version:</strong> We store your account info (via Clerk), your saved
        reports (in Supabase), and your subscription status (via Stripe). The text and PDFs
        you analyze are sent to Google's Gemini API to generate reports. Don't submit
        sensitive personal data you wouldn't want processed by a third-party AI service.
      </LegalCallout>

      <LegalDivider />

      <LegalSection title="What We Collect">
        <p>
          When you use FrameFinder, we may collect or handle the following:
        </p>
        <LegalList
          items={[
            "Content you submit — pasted text or uploaded PDF content that you choose to analyze.",
            "Account information — your Clerk user ID, and email address if you provide one during sign-up.",
            "Usage data — analysis count, PDF upload count, current plan (Free or Pro), and when your usage period started.",
            "Saved reports — the AI analysis reports generated from your submissions, stored in our Supabase database.",
            "Payment information — handled entirely by Stripe. We do not store card numbers, CVVs, or full payment details.",
            "Subscription status — your plan, Stripe customer ID, Stripe subscription ID, and trial status.",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      <LegalSection title="How We Use Your Data">
        <LegalList
          items={[
            "To provide the service — run rhetorical analysis and return a report.",
            "To store saved reports — so you can review past analyses.",
            "To enforce usage limits — tracking analysis count and PDF uploads per period.",
            "To manage your subscription — knowing your plan so we can gate Pro features correctly.",
            "To maintain reliability — logs and error tracking to keep the service running.",
          ]}
        />
        <p>
          We do not sell your data. We do not use your submitted content to train AI models.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="AI Processing (Gemini API)">
        <p>
          Text and PDF content you submit for analysis is sent to{" "}
          <strong>Google's Gemini API</strong> to generate the rhetorical analysis report.
          This means your submitted content is processed by Google's AI infrastructure,
          and Google's privacy policies and terms apply to that processing.
        </p>
        <p>
          <strong>Please do not submit:</strong> confidential business data, private personal
          information about yourself or others, medical records, legal documents containing
          privileged information, or any content you do not have permission to share with
          a third-party service.
        </p>
        <p>
          FrameFinder is designed for analyzing publicly available text — articles, speeches,
          op-eds, academic excerpts, and similar materials.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Authentication (Clerk)">
        <p>
          User authentication is handled by <strong>Clerk</strong>. When you sign up or log
          in, Clerk collects and manages your identity information (email, password or OAuth
          tokens). Clerk's privacy policy governs that data. We receive a user ID from Clerk
          which we use to associate your reports and subscription with your account.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Payments (Stripe)">
        <p>
          Subscription payments are processed by <strong>Stripe</strong>. When you enter
          payment details, that information goes directly to Stripe — we never see or store
          your full card number. We store only the Stripe customer ID and subscription ID
          needed to manage your plan status. Stripe's privacy policy governs payment data.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Data Retention">
        <LegalList
          items={[
            "Saved reports — retained until you request deletion or delete your account.",
            "Usage counters — reset each usage period (weekly for Free, monthly for Pro).",
            "Stripe records — retained per Stripe's policies; we cannot delete Stripe's internal billing records.",
            "Clerk account data — retained until you delete your account through Clerk or request deletion from us.",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Cookies and Tracking">
        <p>
          FrameFinder itself does not set tracking cookies. However, Clerk (authentication)
          and Stripe (payments) may set cookies as part of their services. These are
          functional cookies required for login sessions and payment processing, not
          advertising or behavioral tracking.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Children's Privacy">
        <p>
          FrameFinder is not directed at children under 13. If you are under 13, please do
          not create an account or submit content. If we become aware that we have collected
          data from a child under 13 without parental consent, we will delete it promptly.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Your Rights and Data Deletion">
        <p>
          You can request deletion of your account data and saved reports by contacting us.
          We will process deletion requests within a reasonable timeframe.
        </p>
        <LegalCallout>
          {/* PLACEHOLDER — update this email before launch */}
          To request data deletion or ask privacy questions, email:{" "}
          <a
            href="mailto:support@framefinder.app"
            className="font-semibold text-emerald-700 underline"
          >
            support@framefinder.app
          </a>{" "}
          with the subject line <strong>"Privacy Request"</strong>.
        </LegalCallout>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Changes to This Policy">
        <p>
          We may update this policy as the service evolves. When we do, we'll update the
          "last updated" date at the top of this page. Continued use of FrameFinder after
          changes means you accept the updated policy.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
