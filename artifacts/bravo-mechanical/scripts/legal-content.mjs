// Full static text of the legal pages for prerendering.
//
// Twilio/TCR (and other automated compliance verifiers) fetch
// /privacy-policy and /terms-and-conditions WITHOUT executing JavaScript.
// Before this file existed those URLs prerendered only a title and
// one-line description, which failed A2P 10DLC campaign verification
// (errors 30908 privacy-policy-not-verified / 30882 terms issues).
//
// KEEP IN SYNC with the React pages, which remain the styled source for
// browsers: src/pages/PrivacyPolicy.tsx and src/pages/TermsAndConditions.tsx.

export const PRIVACY_POLICY_HTML = `
<p>Bravo Mechanical LLC ("Bravo Mechanical," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what we collect, how we use it, who we share it with, and the choices you have. It applies to <a href="https://bravomechanicalny.com">https://bravomechanicalny.com</a> and to phone, text, and email communications between you and Bravo Mechanical.</p>
<h2>1. Information We Collect</h2>
<p>We collect only what we need to respond to your service request and deliver HVAC services:</p>
<ul>
<li><strong>Contact information</strong> you submit through our website forms or by phone: name, phone number, email, service address or ZIP code, and the message you send us.</li>
<li><strong>Service-request details</strong> such as the equipment involved, the issue you describe, urgency, and any photos or attachments you choose to share.</li>
<li><strong>SMS content</strong> exchanged between you and our text-messaging system, including timestamps and delivery receipts.</li>
<li><strong>Marketing-attribution data</strong> from URL parameters (UTM tags, Google click ID, Facebook click ID) and your referring page, used to understand which channels send us new customers.</li>
<li><strong>Usage data</strong> collected by analytics tools (see Section 5): pages viewed, approximate location derived from IP, device type, browser, and how you interact with the site.</li>
</ul>
<h2>2. How We Use Your Information</h2>
<ul>
<li>Respond to service requests, schedule appointments, and provide quotes.</li>
<li>Confirm appointments and send service updates by phone, text, and email.</li>
<li>Send invoices and follow up on outstanding balances.</li>
<li>Provide customer support and warranty service.</li>
<li>Improve the website and understand which marketing channels work.</li>
<li>Comply with legal obligations and enforce our Terms.</li>
</ul>
<p>We do not use information collected through this site to make automated decisions that produce legal or similarly significant effects about you.</p>
<h2>3. SMS Communications</h2>
<p>When you provide your phone number through one of our forms or by calling us, and check the consent box at the form, you agree to receive SMS messages from Bravo Mechanical LLC related to your service request, appointment confirmations, updates, follow-ups, invoicing, and customer care, including via automated messaging systems.</p>
<ul>
<li><strong>Message frequency:</strong> varies depending on your interaction with our services.</li>
<li><strong>Message and data rates may apply.</strong></li>
<li><strong>Reply STOP</strong> to any message to opt out at any time.</li>
<li><strong>Reply HELP</strong> for assistance, or contact us at the phone or email below.</li>
<li><strong>Consent is not a condition of purchase.</strong></li>
<li><strong>Carriers are not liable for delayed or undelivered messages.</strong></li>
</ul>
<p><strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</strong> Text messaging originator opt-in data and consent (your phone number and the fact that you agreed to receive texts) are never sold, rented, or shared with any third parties or affiliates. This information is used solely to deliver the messages you request and is excluded from all other data-sharing described in this policy.</p>
<h2>4. Third-Party Service Providers</h2>
<p>We use the following third-party service providers ("subcontractors") to operate our business. Each is a processor that receives only the data needed to perform its function on our behalf; none receives your information for its own marketing, and, as stated above, text-messaging opt-in data and consent are never shared for marketing or promotional purposes:</p>
<ul>
<li><strong>Supabase (database, authentication, edge functions):</strong> stores your contact information, service requests, and CRM data on Postgres infrastructure with encryption at rest and in transit. <a href="https://supabase.com/privacy">Privacy Policy</a></li>
<li><strong>Twilio (SMS delivery):</strong> transmits text messages between you and Bravo Mechanical. Receives your phone number and message content. <a href="https://www.twilio.com/legal/privacy">Privacy Policy</a></li>
<li><strong>Google Analytics 4 (analytics):</strong> measures site traffic and conversions. Receives anonymized IP, page views, device and browser type, and referrer. <a href="https://policies.google.com/privacy">Privacy Policy</a> · <a href="https://tools.google.com/dlpage/gaoptout">Opt-out</a></li>
<li><strong>Google Maps (embedded map on Contact page):</strong> Google receives your IP and request data when the map loads. <a href="https://policies.google.com/privacy">Privacy Policy</a></li>
</ul>
<p>We do not sell or rent your personal information to anyone.</p>
<h2>5. Cookies and Analytics</h2>
<p>Our site uses Google Analytics 4, which sets first-party cookies (typically _ga and _ga_*) to measure how visitors use the site. We do not use advertising cookies, retargeting pixels, or session-recording tools.</p>
<p>You can disable analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</a>, by using a browser that blocks tracking, or by clearing cookies through your browser settings.</p>
<p>We may use small functional cookies to remember your preferences (for example, the open/closed state of an admin sidebar). These are essential for the page to work and do not track you across sites.</p>
<h2>6. Data Security</h2>
<p>We take reasonable administrative, technical, and physical measures to protect your information, consistent with the New York SHIELD Act. These include encryption in transit (HTTPS), encryption at rest in our database, access controls limiting customer data to authorized staff, and routine review of our systems. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
<h2>7. Data Retention</h2>
<p>We retain your contact information and service history for as long as you remain a customer and for a reasonable period afterward to honor warranty obligations, comply with tax and recordkeeping laws, and resolve disputes. SMS opt-in records are retained for as long as required to demonstrate consent.</p>
<h2>8. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal information by contacting us at the address below. We will respond within a reasonable time, subject to verification of your identity and any legal obligations that require us to retain certain records.</p>
<p>California residents have additional rights under the CCPA/CPRA (right to know, delete, correct, opt out of sale or sharing). We do not sell or share personal information as those terms are defined under California law.</p>
<h2>9. Children's Privacy</h2>
<p>Our services are not directed to children under 13, and we do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us and we will delete it.</p>
<h2>10. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will provide reasonable advance notice (typically 30 days) by posting the updated policy on this page and, where appropriate, by email.</p>
<h2>11. SMS Terms</h2>
<p>Please review our <a href="/terms-and-conditions">Terms and Conditions</a>, which include detailed SMS program terms.</p>
<h2>12. Contact Information</h2>
<p>Bravo Mechanical LLC<br/>1 Fowler Avenue, Yonkers, NY 10701 — serving all of Westchester County, NY<br/>Phone: <a href="tel:+19143619142">(914) 361-9142</a><br/>Email: <a href="mailto:info@bravomechanicalny.com">info@bravomechanicalny.com</a></p>
`;

export const TERMS_HTML = `
<h2>Part A. Website Terms of Use</h2>
<p>These Website Terms of Use ("Terms") govern your use of <a href="https://bravomechanicalny.com">https://bravomechanicalny.com</a> (the "Site"), operated by Bravo Mechanical LLC ("Bravo Mechanical," "we," "our," or "us"). By accessing or using the Site, requesting service, or submitting any form, you agree to these Terms. If you do not agree, please do not use the Site.</p>
<h3>1. Service Disclaimers</h3>
<p>The information on this Site, including descriptions of HVAC services and pricing ranges, is provided for general informational purposes only and is subject to change without notice. The Site does not constitute professional engineering, legal, or tax advice.</p>
<p><strong>Estimates and quotes shown on the Site are not binding offers.</strong> Final pricing depends on the specific equipment selected, site conditions, permitting, and other factors that can only be assessed after an in-person evaluation by a Bravo Mechanical technician.</p>
<p><strong>Emergency service:</strong> While we make every effort to respond quickly to emergency calls, response times depend on technician availability, weather, call volume, and your location. Phone calls are the fastest way to reach us for urgent service.</p>
<h3>2. Acceptable Use</h3>
<p>You agree not to:</p>
<ul>
<li>Submit false, misleading, or fraudulent information through any form on the Site.</li>
<li>Use the Site or our SMS or email channels to harass, abuse, defame, or threaten any person.</li>
<li>Scrape, copy, or republish substantial portions of the Site without our written permission.</li>
<li>Attempt to gain unauthorized access to any portion of the Site, our database, or our administrative systems.</li>
<li>Introduce viruses, malware, or other harmful code, or otherwise interfere with the Site's operation.</li>
<li>Use the Site for any unlawful purpose.</li>
</ul>
<h3>3. Intellectual Property</h3>
<p>The Site, including its design, text, graphics, logos, photographs, and software, is owned by Bravo Mechanical LLC or its licensors and is protected by United States copyright, trademark, and other intellectual property laws. You may view and download pages of the Site for your personal, non-commercial use only. All other use requires our prior written permission.</p>
<h3>4. Maintenance Plans and Service Agreements</h3>
<p>Any preventive maintenance plan or service agreement is governed by the separate written agreement signed at the time of purchase. <strong>Maintenance plans offered by Bravo Mechanical do not auto-renew.</strong> At the end of the plan term, you will be invited to renew. No charge will be made without your express agreement to a new term.</p>
<h3>5. Disclaimer of Warranties</h3>
<p>The Site is provided "as is" and "as available," without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or uninterrupted availability. We do not warrant that the Site will be error-free, secure, or continuously available.</p>
<p>This disclaimer applies to the Site only. Warranties on installed equipment and labor are governed by the manufacturer's warranty and any separate written warranty we provide at the time of service.</p>
<h3>6. Limitation of Liability</h3>
<p>To the maximum extent permitted by law, Bravo Mechanical LLC and its owners, employees, and contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising out of or in connection with your use of the Site, even if advised of the possibility of such damages.</p>
<p>Our aggregate liability arising from or related to use of the Site shall not exceed one hundred dollars ($100). Liability for HVAC services performed by Bravo Mechanical is governed by the separate written agreement, invoice, or work authorization signed at the time of service.</p>
<p>Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above may not apply to you.</p>
<h3>7. Indemnification</h3>
<p>You agree to indemnify, defend, and hold Bravo Mechanical LLC harmless from any claim, demand, loss, or expense (including reasonable attorneys' fees) arising out of your breach of these Terms, your misuse of the Site, or your violation of any applicable law.</p>
<h3>8. Third-Party Links</h3>
<p>The Site may contain links to third-party websites, including Google Maps, our Google Business Profile, and our social media pages. We are not responsible for the content, privacy practices, or availability of any third-party site. Visiting a linked site is at your own risk.</p>
<h3>9. Governing Law and Venue</h3>
<p>These Terms are governed by the laws of the State of New York, without regard to its conflict-of-laws principles. Any dispute arising from these Terms or your use of the Site shall be brought exclusively in the state or federal courts located in Westchester County, New York, and you consent to the personal jurisdiction of those courts. Nothing in this section limits any non-waivable rights you may have under applicable consumer-protection laws.</p>
<h3>10. Changes to These Terms</h3>
<p>We may update these Terms from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will provide reasonable advance notice (typically 15 days) by posting the updated Terms on this page. Your continued use of the Site after the effective date of any change constitutes your acceptance of the updated Terms.</p>
<h3>11. Severability</h3>
<p>If any provision of these Terms is held to be invalid or unenforceable, that provision will be enforced to the maximum extent permitted, and the remaining provisions will continue in full force and effect.</p>
<h2>Part B. SMS Program Terms</h2>
<p>These SMS Program Terms govern text messages exchanged between you and Bravo Mechanical LLC. By providing your phone number on a Bravo Mechanical form or by phone <strong>and checking the consent box at the form</strong>, you agree to these SMS Program Terms.</p>
<h3>12. Program Description</h3>
<p>When you opt in, you consent to receive SMS messages from Bravo Mechanical LLC related to your HVAC service request, appointment confirmations and updates, customer care, follow-ups, invoicing and payment reminders, and occasional service reminders, including via automated messaging systems.</p>
<h3>13. Message Frequency</h3>
<p>Message frequency may vary depending on your interaction with our services.</p>
<h3>14. Message and Data Rates</h3>
<p>Message and data rates may apply, depending on your mobile carrier plan.</p>
<h3>15. Opt-Out Instructions</h3>
<p>You can opt out of SMS messages at any time by replying <strong>STOP</strong> to any message. After you reply STOP, we will send a single confirmation message and you will not receive further SMS messages from us unless you opt back in.</p>
<h3>16. Help Instructions</h3>
<p>For help, reply <strong>HELP</strong> to any message, or contact us at <a href="tel:+19143619142">(914) 361-9142</a> or <a href="mailto:info@bravomechanicalny.com">info@bravomechanicalny.com</a>.</p>
<h3>17. Consent</h3>
<p>Consent to receive SMS messages is not a condition of purchase or of receiving HVAC services from Bravo Mechanical.</p>
<p>SMS opt-in data and consent records will not be shared with third parties or affiliates for marketing or promotional purposes.</p>
<h3>18. Opt-In Methods</h3>
<p>You may opt in to receive SMS messages by:</p>
<ul>
<li>Submitting a Bravo Mechanical website form with the consent checkbox checked,</li>
<li>Providing your phone number to a Bravo Mechanical representative by phone and confirming you wish to receive texts, or</li>
<li>Texting <strong>START</strong> or <strong>JOIN</strong> to a Bravo Mechanical SMS number.</li>
</ul>
<h3>19. SMS Provider</h3>
<p>Our text messages are delivered via Twilio Inc. Your phone number and message content are transmitted through Twilio's platform to deliver SMS messages to you. See Twilio's <a href="https://www.twilio.com/legal/privacy">Privacy Policy</a>.</p>
<h3>20. Carrier Liability</h3>
<p>Wireless carriers are not liable for delayed or undelivered messages.</p>
<h3>21. Privacy</h3>
<p>Your information will be handled in accordance with our <a href="/privacy-policy">Privacy Policy</a>.</p>
<h2>Contact</h2>
<p>Bravo Mechanical LLC<br/>1 Fowler Avenue, Yonkers, NY 10701 — serving all of Westchester County, NY<br/>Phone: <a href="tel:+19143619142">(914) 361-9142</a><br/>Email: <a href="mailto:info@bravomechanicalny.com">info@bravomechanicalny.com</a></p>
`;
