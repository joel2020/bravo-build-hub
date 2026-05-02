import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const contactEmail = "info@bravomechanicalny.com";
const contactEmailHref = `mailto:${contactEmail}`;

const TermsAndConditions = () => {
  useSeo({
    title: "Terms and Conditions | Bravo Mechanical LLC",
    description: "SMS Terms and Conditions for Bravo Mechanical LLC, including program description, message frequency, opt-out instructions, help instructions, and privacy information.",
    canonical: `${SITE.siteUrl}/terms-and-conditions`,
  });

  return (
    <Layout>
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">Terms and Conditions</h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-8 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Program Description</h2>
            <p>
              By providing your phone number, you consent to receive SMS messages from Bravo Mechanical LLC related to HVAC services, including appointment confirmations, updates, customer care, and occasional service reminders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Message Frequency</h2>
            <p>Message frequency may vary depending on your interaction with our services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Message and Data Rates</h2>
            <p>Message and data rates may apply.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Opt-Out Instructions</h2>
            <p>Reply STOP to unsubscribe.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Help Instructions</h2>
            <p>Reply HELP for assistance.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Consent</h2>
            <p>Consent to receive SMS messages is not a condition of purchase.</p>
            <p>SMS opt-in data and consent will not be shared with third parties or affiliates for marketing or promotional purposes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Opt-In Methods</h2>
            <p>You may opt in to receive SMS messages by:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Website form</li>
              <li>Phone booking</li>
              <li>Texting START or JOIN</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Privacy</h2>
            <p>
              Your information will be handled in accordance with our{" "}
              <Link to="/privacy-policy" className="font-semibold text-foreground hover:text-accent">
                Privacy Policy
              </Link>
              {" "}at https://bravomechanicalny.com/privacy-policy
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Liability</h2>
            <p>Carriers are not liable for delayed or undelivered messages.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Contact</h2>
            <address className="not-italic">
              Bravo Mechanical LLC
              <br />
              Phone: <a href={SITE.phoneHref} className="font-semibold text-foreground hover:text-accent">{SITE.phone}</a>
              <br />
              Email: <a href={contactEmailHref} className="font-semibold text-foreground hover:text-accent break-all">{contactEmail}</a>
            </address>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default TermsAndConditions;
