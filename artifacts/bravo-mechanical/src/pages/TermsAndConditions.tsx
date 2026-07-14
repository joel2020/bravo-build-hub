import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const contactEmail = "info@bravomechanicalny.com";
const contactEmailHref = `mailto:${contactEmail}`;

const TermsAndConditions = () => {
  useSeo({
    title: "Terms and Conditions | Bravo Mechanical LLC",
    description: "Website Terms of Use and SMS program terms for Bravo Mechanical LLC, including service disclaimers, limitation of liability, governing law, and consumer rights.",
    canonical: `${SITE.siteUrl}/terms-and-conditions`,
  });

  return (
    <Layout>
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">Terms and Conditions</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {SITE.legalLastUpdated}</p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-10 text-base leading-relaxed text-muted-foreground">
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This page is informational and does not constitute legal advice. For specific legal questions, consult a qualified New York attorney.
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Part A. Website Terms of Use</h2>
            <p>
              These Website Terms of Use ("Terms") govern your use of{" "}
              <a href={SITE.siteUrl} className="font-semibold text-foreground hover:text-accent">{SITE.siteUrl}</a>{" "}
              (the "Site"), operated by Bravo Mechanical LLC ("Bravo Mechanical," "we," "our," or "us"). By accessing or using the Site, requesting service, or submitting any form, you agree to these Terms. If you do not agree, please do not use the Site.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">1. Service Disclaimers</h3>
            <p>
              The information on this Site, including descriptions of HVAC services and pricing ranges, is provided for general informational purposes only and is subject to change without notice. The Site does not constitute professional engineering, legal, or tax advice.
            </p>
            <p>
              <strong>Estimates and quotes shown on the Site are not binding offers.</strong> Final pricing depends on the specific equipment selected, site conditions, permitting, and other factors that can only be assessed after an in-person evaluation by a Bravo Mechanical technician.
            </p>
            <p>
              <strong>Emergency service:</strong> While we make every effort to respond quickly to emergency calls, response times depend on technician availability, weather, call volume, and your location. Phone calls are the fastest way to reach us for urgent service.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">2. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Submit false, misleading, or fraudulent information through any form on the Site.</li>
              <li>Use the Site or our SMS or email channels to harass, abuse, defame, or threaten any person.</li>
              <li>Scrape, copy, or republish substantial portions of the Site without our written permission.</li>
              <li>Attempt to gain unauthorized access to any portion of the Site, our database, or our administrative systems.</li>
              <li>Introduce viruses, malware, or other harmful code, or otherwise interfere with the Site's operation.</li>
              <li>Use the Site for any unlawful purpose.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">3. Intellectual Property</h3>
            <p>
              The Site, including its design, text, graphics, logos, photographs, and software, is owned by Bravo Mechanical LLC or its licensors and is protected by United States copyright, trademark, and other intellectual property laws. You may view and download pages of the Site for your personal, non-commercial use only. All other use requires our prior written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">4. Maintenance Plans and Service Agreements</h3>
            <p>
              Any preventive maintenance plan or service agreement is governed by the separate written agreement signed at the time of purchase. <strong>Maintenance plans offered by Bravo Mechanical do not auto-renew.</strong> At the end of the plan term, you will be invited to renew. No charge will be made without your express agreement to a new term.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">5. Disclaimer of Warranties</h3>
            <p>
              The Site is provided "as is" and "as available," without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or uninterrupted availability. We do not warrant that the Site will be error-free, secure, or continuously available.
            </p>
            <p>
              This disclaimer applies to the Site only. Warranties on installed equipment and labor are governed by the manufacturer's warranty and any separate written warranty we provide at the time of service.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">6. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, Bravo Mechanical LLC and its owners, employees, and contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising out of or in connection with your use of the Site, even if advised of the possibility of such damages.
            </p>
            <p>
              Our aggregate liability arising from or related to use of the Site shall not exceed one hundred dollars ($100). Liability for HVAC services performed by Bravo Mechanical is governed by the separate written agreement, invoice, or work authorization signed at the time of service.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above may not apply to you.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">7. Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold Bravo Mechanical LLC harmless from any claim, demand, loss, or expense (including reasonable attorneys' fees) arising out of your breach of these Terms, your misuse of the Site, or your violation of any applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">8. Third-Party Links</h3>
            <p>
              The Site may contain links to third-party websites, including Google Maps, our Google Business Profile, and our social media pages. We are not responsible for the content, privacy practices, or availability of any third-party site. Visiting a linked site is at your own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">9. Governing Law and Venue</h3>
            <p>
              These Terms are governed by the laws of the State of New York, without regard to its conflict-of-laws principles. Any dispute arising from these Terms or your use of the Site shall be brought exclusively in the state or federal courts located in Westchester County, New York, and you consent to the personal jurisdiction of those courts. Nothing in this section limits any non-waivable rights you may have under applicable consumer-protection laws.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">10. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will provide reasonable advance notice (typically 15 days) by posting the updated Terms on this page. Your continued use of the Site after the effective date of any change constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">11. Severability</h3>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, that provision will be enforced to the maximum extent permitted, and the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <hr className="border-border/60" />

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Part B. SMS Program Terms</h2>
            <p>
              These SMS Program Terms govern text messages exchanged between you and Bravo Mechanical LLC. By providing your phone number on a Bravo Mechanical form or by phone <strong>and checking the consent box at the form</strong>, you agree to these SMS Program Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">12. Program Description</h3>
            <p>
              When you opt in, you consent to receive SMS messages from Bravo Mechanical LLC related to your HVAC service request, appointment confirmations and updates, customer care, follow-ups, invoicing and payment reminders, and occasional service reminders, including via automated messaging systems.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">13. Message Frequency</h3>
            <p>Message frequency may vary depending on your interaction with our services.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">14. Message and Data Rates</h3>
            <p>Message and data rates may apply, depending on your mobile carrier plan.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">15. Opt-Out Instructions</h3>
            <p>You can opt out of SMS messages at any time by replying <strong>STOP</strong> to any message. After you reply STOP, we will send a single confirmation message and you will not receive further SMS messages from us unless you opt back in.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">16. Help Instructions</h3>
            <p>For help, reply <strong>HELP</strong> to any message, or contact us at <a href={SITE.phoneHref} className="font-semibold text-foreground hover:text-accent">{SITE.phone}</a> or <a href={contactEmailHref} className="font-semibold text-foreground hover:text-accent break-all">{contactEmail}</a>.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">17. Consent</h3>
            <p>Consent to receive SMS messages is not a condition of purchase or of receiving HVAC services from Bravo Mechanical.</p>
            <p>SMS opt-in data and consent records will not be shared with third parties or affiliates for marketing or promotional purposes.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">18. Opt-In Methods</h3>
            <p>You may opt in to receive SMS messages by:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Submitting a Bravo Mechanical website form with the consent checkbox checked,</li>
              <li>Providing your phone number to a Bravo Mechanical representative by phone and confirming you wish to receive texts, or</li>
              <li>Texting <strong>START</strong> or <strong>JOIN</strong> to a Bravo Mechanical SMS number.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">19. SMS Provider</h3>
            <p>
              Our text messages are delivered via Twilio Inc. Your phone number and message content are transmitted through Twilio's platform to deliver SMS messages to you. See Twilio's{" "}
              <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent">Privacy Policy</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">20. Carrier Liability</h3>
            <p>Wireless carriers are not liable for delayed or undelivered messages.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground">21. Privacy</h3>
            <p>
              Your information will be handled in accordance with our{" "}
              <Link to="/privacy-policy" className="font-semibold text-foreground hover:text-accent">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <hr className="border-border/60" />

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Contact</h2>
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

export default TermsAndConditions;
