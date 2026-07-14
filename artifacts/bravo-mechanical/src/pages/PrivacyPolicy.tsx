import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const contactEmail = "info@bravomechanicalny.com";
const contactEmailHref = `mailto:${contactEmail}`;

const PrivacyPolicy = () => {
  useSeo({
    title: "Privacy Policy | Bravo Mechanical LLC",
    description: "Privacy Policy for Bravo Mechanical LLC, including SMS communications, data sharing, third-party processors, cookies and analytics, data security, and your rights under New York law.",
    canonical: `${SITE.siteUrl}/privacy-policy`,
  });

  return (
    <Layout>
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {SITE.legalLastUpdated}</p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-8 text-base leading-relaxed text-muted-foreground">
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This page is informational and does not constitute legal advice. For legal questions, consult a qualified New York attorney.
          </div>

          <p>
            Bravo Mechanical LLC ("Bravo Mechanical," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what we collect, how we use it, who we share it with, and the choices you have. It applies to{" "}
            <a href={SITE.siteUrl} className="font-semibold text-foreground hover:text-accent">{SITE.siteUrl}</a>{" "}
            and to phone, text, and email communications between you and Bravo Mechanical.
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">1. Information We Collect</h2>
            <p>We collect only what we need to respond to your service request and deliver HVAC services:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong>Contact information</strong> you submit through our website forms or by phone: name, phone number, email, service address or ZIP code, and the message you send us.</li>
              <li><strong>Service-request details</strong> such as the equipment involved, the issue you describe, urgency, and any photos or attachments you choose to share.</li>
              <li><strong>SMS content</strong> exchanged between you and our text-messaging system, including timestamps and delivery receipts.</li>
              <li><strong>Marketing-attribution data</strong> from URL parameters (UTM tags, Google click ID, Facebook click ID) and your referring page, used to understand which channels send us new customers.</li>
              <li><strong>Usage data</strong> collected by analytics tools (see Section 5): pages viewed, approximate location derived from IP, device type, browser, and how you interact with the site.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Respond to service requests, schedule appointments, and provide quotes.</li>
              <li>Confirm appointments and send service updates by phone, text, and email.</li>
              <li>Send invoices and follow up on outstanding balances.</li>
              <li>Provide customer support and warranty service.</li>
              <li>Improve the website and understand which marketing channels work.</li>
              <li>Comply with legal obligations and enforce our Terms.</li>
            </ul>
            <p>
              We do not use information collected through this site to make automated decisions that produce legal or similarly significant effects about you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">3. SMS Communications</h2>
            <p>
              When you provide your phone number through one of our forms or by calling us, and check the consent box at the form, you agree to receive SMS messages from Bravo Mechanical LLC related to your service request, appointment confirmations, updates, follow-ups, invoicing, and customer care, including via automated messaging systems.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong>Message frequency:</strong> varies depending on your interaction with our services.</li>
              <li><strong>Message and data rates may apply.</strong></li>
              <li><strong>Reply STOP</strong> to any message to opt out at any time.</li>
              <li><strong>Reply HELP</strong> for assistance, or contact us at the phone or email below.</li>
              <li><strong>Consent is not a condition of purchase.</strong></li>
              <li><strong>Carriers are not liable for delayed or undelivered messages.</strong></li>
            </ul>
            <p>
              <strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</strong> Text messaging originator opt-in data and consent (your phone number and the fact that you agreed to receive texts) are never sold, rented, or shared with any third parties or affiliates. This information is used solely to deliver the messages you request and is excluded from all other data-sharing described in this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">4. Third-Party Service Providers</h2>
            <p>We use the following third-party service providers ("subcontractors") to operate our business. Each is a processor that receives only the data needed to perform its function on our behalf; none receives your information for its own marketing, and, as stated above, text-messaging opt-in data and consent are never shared for marketing or promotional purposes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Supabase (database, authentication, edge functions):</strong> stores your contact information, service requests, and CRM data on Postgres infrastructure with encryption at rest and in transit.{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Privacy Policy</a>
              </li>
              <li>
                <strong>Twilio (SMS delivery):</strong> transmits text messages between you and Bravo Mechanical. Receives your phone number and message content.{" "}
                <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Privacy Policy</a>
              </li>
              <li>
                <strong>Google Analytics 4 (analytics):</strong> measures site traffic and conversions. Receives anonymized IP, page views, device and browser type, and referrer.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Privacy Policy</a>{" "}·{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Opt-out</a>
              </li>
              <li>
                <strong>Google Maps (embedded map on Contact page):</strong> Google receives your IP and request data when the map loads.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Privacy Policy</a>
              </li>
            </ul>
            <p>We do not sell or rent your personal information to anyone.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">5. Cookies and Analytics</h2>
            <p>
              Our site uses Google Analytics 4, which sets first-party cookies (typically <code className="text-foreground">_ga</code> and <code className="text-foreground">_ga_*</code>) to measure how visitors use the site. We do not use advertising cookies, retargeting pixels, or session-recording tools.
            </p>
            <p>
              You can disable analytics by installing the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Google Analytics opt-out browser add-on</a>, by using a browser that blocks tracking, or by clearing cookies through your browser settings.
            </p>
            <p>
              We may use small functional cookies to remember your preferences (for example, the open/closed state of an admin sidebar). These are essential for the page to work and do not track you across sites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">6. Data Security</h2>
            <p>
              We take reasonable administrative, technical, and physical measures to protect your information, consistent with the New York SHIELD Act. These include encryption in transit (HTTPS), encryption at rest in our database, access controls limiting customer data to authorized staff, and routine review of our systems. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">7. Data Retention</h2>
            <p>
              We retain your contact information and service history for as long as you remain a customer and for a reasonable period afterward to honor warranty obligations, comply with tax and recordkeeping laws, and resolve disputes. SMS opt-in records are retained for as long as required to demonstrate consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">8. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information by contacting us at the address below. We will respond within a reasonable time, subject to verification of your identity and any legal obligations that require us to retain certain records.
            </p>
            <p>
              California residents have additional rights under the CCPA/CPRA (right to know, delete, correct, opt out of sale or sharing). We do not sell or share personal information as those terms are defined under California law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">9. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13, and we do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us and we will delete it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will provide reasonable advance notice (typically 30 days) by posting the updated policy on this page and, where appropriate, by email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">11. SMS Terms</h2>
            <p>
              Please review our{" "}
              <Link to="/terms-and-conditions" className="font-semibold text-foreground hover:text-accent">
                Terms and Conditions
              </Link>
              , which include detailed SMS program terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">12. Contact Information</h2>
            <address className="not-italic">
              Bravo Mechanical LLC
              <br />
              {SITE.area}
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

export default PrivacyPolicy;
