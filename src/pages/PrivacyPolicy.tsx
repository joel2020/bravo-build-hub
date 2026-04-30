import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const contactEmail = "info@bravomechanicalny.com";
const contactEmailHref = `mailto:${contactEmail}`;

const PrivacyPolicy = () => {
  useSeo({
    title: "Privacy Policy | Bravo Mechanical LLC",
    description: "Privacy Policy for Bravo Mechanical LLC, including SMS communications, data sharing, data security, and contact information.",
    canonical: `${SITE.siteUrl}/privacy-policy`,
  });

  return (
    <Layout>
      <section className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">Privacy Policy</h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-8 text-base leading-relaxed text-muted-foreground">
          <p>Bravo Mechanical LLC ("we," "our," or "us") respects your privacy and is committed to protecting your personal information.</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Information We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email</li>
              <li>Service address</li>
              <li>SMS content</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">How We Use Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Service scheduling</li>
              <li>Provide customer support</li>
              <li>Appointment updates</li>
              <li>SMS communication</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">SMS Communications</h2>
            <p>
              By providing your phone number, you consent to receive SMS messages from Bravo Mechanical LLC related to service requests, appointment confirmations, updates, and customer care.
            </p>
            <p>
              Message frequency may vary.
              <br />
              Message and data rates may apply.
            </p>
            <p>
              Reply STOP to opt out.
              <br />
              Reply HELP for assistance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Terms and Conditions</h2>
            <p>
              Please review our{" "}
              <Link to="/terms-and-conditions" className="font-semibold text-foreground hover:text-accent">
                Terms and Conditions
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Data Sharing</h2>
            <p>We do not sell or rent your personal information.</p>
            <p>We may share data with trusted service providers (such as Twilio) solely to operate our business.</p>
            <p>SMS opt-in data and consent will not be shared with third parties or affiliates for marketing or promotional purposes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Data Security</h2>
            <p>We take reasonable measures to protect your information but cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Your Rights</h2>
            <p>You may request access, correction, or deletion of your information by contacting us.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-extrabold text-foreground">Contact Information</h2>
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

export default PrivacyPolicy;
