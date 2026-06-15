import { Metadata } from "next";
import LegalPageShell, {
  LegalSection,
  LegalDivider,
  LegalList,
  LegalCallout,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — FrameFinder",
  description: "How subscriptions, trials, and refunds work on FrameFinder.",
};

export default function RefundsPage() {
  return (
    <LegalPageShell
      badge="Legal"
      title="Refund & Cancellation Policy"
      subtitle="Straightforward rules for trials, billing, and cancellations."
      lastUpdated="June 2026"
    >
      <LegalCallout>
        <strong>Short version:</strong> You get a 7-day free trial (once per account).
        Cancel any time through the customer portal. Pro access continues until the end of
        your current billing period. Refunds are reviewed case by case — contact us and
        we'll work with you.
      </LegalCallout>

      <LegalDivider />

      <LegalSection title="Free Trial">
        <p>
          Every new Student Pro subscriber receives a <strong>7-day free trial</strong> on
          their first subscription. During the trial, you have full access to all Pro
          features with no charge.
        </p>
        <LegalList
          items={[
            "One free trial per Clerk account — this cannot be reset by canceling and resubscribing.",
            "If you cancel before the 7-day trial ends, you will not be charged.",
            "If you do not cancel before the trial ends, billing begins automatically at the current subscription price.",
            "Trial eligibility is determined at checkout — if you have already used a trial, you will be charged immediately on subscribe.",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      <LegalSection title="How to Cancel">
        <p>
          You can cancel your Student Pro subscription at any time through the customer
          portal. To access it:
        </p>
        <LegalList
          items={[
            'Go to the Pricing page (/pricing) while signed in.',
            'Click "Manage Subscription" on the Student Pro card.',
            "You will be taken to the Stripe customer portal where you can cancel, change, or review your subscription.",
          ]}
        />
        <p>
          Cancellation takes effect at the end of your current billing period. You will
          not be charged again after that.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Access After Cancellation">
        <LegalList
          items={[
            "After canceling, you retain Pro access until the end of the billing period you have already paid for.",
            "At period end, your account automatically reverts to the Free plan.",
            "Your saved reports are preserved — cancellation does not delete your data.",
            "Free plan limits apply after downgrade (3 analyses/week, 1,200 word limit, 1 PDF/week).",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Refund Policy">
        <p>
          We do not offer automatic refunds for subscription charges. However, we review
          refund requests on a case-by-case basis and will work with you in good faith if
          something went wrong.
        </p>
        <LegalList
          items={[
            "If you were charged in error (e.g., trial did not apply correctly), contact us promptly.",
            "If you experienced a significant service outage that prevented you from using a paid period, we will consider a partial credit or refund.",
            "Refunds legally required under consumer protection laws in your jurisdiction will be honored.",
            "We cannot refund charges that occurred because you did not cancel before the trial ended.",
          ]}
        />
        <LegalCallout>
          {/* PLACEHOLDER — update this email before launch */}
          For refund requests, email{" "}
          <a
            href="mailto:support@framefinder.app"
            className="font-semibold text-emerald-700 underline"
          >
            support@framefinder.app
          </a>{" "}
          with subject <strong>"Billing Support"</strong> and include the email address on
          your account. Please contact us within 14 days of the charge in question.
        </LegalCallout>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="No Second Free Trial">
        <p>
          The 7-day free trial is available once per Clerk account. If you cancel a Pro
          subscription and later resubscribe, you will not receive another trial period —
          billing will begin immediately on resubscription. This is enforced at the account
          level and cannot be bypassed by creating a new Stripe customer record.
        </p>
      </LegalSection>

      <LegalDivider />

      <LegalSection title="Price Changes">
        <p>
          We reserve the right to change the Student Pro subscription price. If we do, we
          will provide advance notice via the app or email, and the change will apply at
          your next billing cycle. You may cancel before the new price takes effect if you
          do not agree.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
