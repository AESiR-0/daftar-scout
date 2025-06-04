import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[80%] bg-[#0e0e0e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-center">
              Daftar Privacy Policy
            </CardTitle>
            <p className="text-sm text-gray-400 text-center mt-2">
              <strong>Effective Date:</strong> June 15, 2025
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4 text-justify">
              <section className="mb-8">
                <p className="text-base md:text-lg leading-relaxed">
                  At Daftar, we take your privacy seriously. As part of our
                  commitment to transparency and security, this Privacy Policy
                  outlines how we collect, process, and protect your data. As we
                  are still in beta, our practices and software are evolving. By
                  using Daftar, you agree to the terms described below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-base leading-relaxed">
                  Daftar is in beta, which means we are continually improving the
                  software to provide the best experience. We use Google
                  authentication solely to verify your identity and store only the
                  necessary data for user sessions. We do not explore or access
                  any additional details from your Google account. Your privacy
                  and security are our priority, and we are committed to only
                  using the authentication data needed for your login experience.
                </p>
                <p className="text-base leading-relaxed mt-4">
                  Additionally, we host our software on AWS to provide a
                  scalable and secure environment for our users. As part of our
                  ongoing development, user interactions with the software may be
                  logged for analysis and optimization purposes. However, we
                  ensure that this data is handled by Google’s Privacy Policy and
                  AWS’s Privacy Practices, adhering to industry standards for
                  data protection.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  2. Data We Collect
                </h2>
                <h3 className="text-xl font-medium mb-2">
                  Authentication Data:
                </h3>
                <p className="text-base leading-relaxed">
                  When you sign in to Daftar using Google Sign-In, we only collect
                  essential information necessary for authentication, including
                  your email address and name. We do not store any sensitive data
                  such as passwords. This data is processed in line with Google’s
                  Privacy Policy, and your interactions with Google are governed
                  by their terms.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  IP Address & Session Data:
                </h3>
                <p className="text-base leading-relaxed">
                  We collect IP address and session data to monitor usage and
                  ensure a secure user experience. This data is stored
                  temporarily and does not contain personal or sensitive details.
                  Our software does not delve deeper into collecting personally
                  identifiable information beyond what&apos;s necessary for
                  authentication.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">Usage Data:</h3>
                <p className="text-base leading-relaxed">
                  We also gather data about how you interact with Daftar, such as
                  pages viewed, features used, and timestamps. This information
                  is anonymized and stored for service improvement and
                  performance monitoring.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  3. How We Use Your Data
                </h2>
                <h3 className="text-xl font-medium mb-2">
                  Authentication & Access Control:
                </h3>
                <p className="text-base leading-relaxed">
                  We use your Google authentication data solely to manage your
                  login process and maintain session security. This process
                  ensures that you can securely access Daftar without us storing
                  sensitive login information.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  Data Logging for Service Improvement:
                </h3>
                <p className="text-base leading-relaxed">
                  We collect session data (such as your IP address) for
                  diagnostics, troubleshooting, and performance optimization.
                  This helps us ensure that Daftar functions properly during the
                  beta phase and provides you with a stable experience.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  4. Data Storage & Security
                </h2>
                <p className="text-base leading-relaxed">
                  As part of our commitment to security, Daftar is hosted on
                  AWS, which provides a secure cloud infrastructure. AWS
                  ensures that data is stored in an encrypted environment using
                  industry-standard encryption methods.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  Data Encryption:
                </h3>
                <p className="text-base leading-relaxed">
                  All data, including your session data, is encrypted in transit
                  using TLS 1.2 or higher, and at rest using AES-256 encryption.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  Access Control:
                </h3>
                <p className="text-base leading-relaxed">
                  Strict access control policies are in place to ensure that only
                  authorized personnel can access the system. We rely on
                  role-based access control (RBAC) to manage this.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  Regular Security Audits:
                </h3>
                <p className="text-base leading-relaxed">
                  We conduct regular security audits and apply security patches to
                  ensure that the software remains secure and protected against
                  emerging threats.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  5. Third-Party Services
                </h2>
                <h3 className="text-xl font-medium mb-2">Google:</h3>
                <p className="text-base leading-relaxed">
                  Your authentication data is processed by Google through OAuth
                  2.0. Google’s privacy policies govern how your data is handled
                  during authentication. We don’t store or process any further
                  sensitive data through Google beyond what is required for the
                  authentication process.
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">
                  Google Authentication & Privacy:
                </h3>
                <p className="text-base leading-relaxed">
                  As part of Daftar&apos;s authentication process, we use Google
                  OAuth 2.0 to verify your identity when you sign in. This allows
                  you to use your existing Google account for a streamlined,
                  secure login process. Below, we outline how we handle your data
                  during this process and Google&apos;s role in protecting your
                  information:
                </p>
                <ul className="list-disc pl-6 text-base leading-relaxed mt-2">
                  <li className="mb-2">
                    <strong>OAuth 2.0 Authentication:</strong> We rely on
                    Google’s OAuth 2.0 protocol to authenticate users. This allows
                    Daftar to securely access only the email address and basic
                    profile information (such as name) associated with your Google
                    account.
                  </li>
                  <li className="mb-2">
                    <strong>Minimal Data Access:</strong> Daftar does not ask for
                    or access any other information stored in your Google account,
                    such as emails, contacts, calendar events, or documents. We
                    only retrieve basic data necessary for your user
                    authentication (email and name). This data is stored
                    temporarily and used strictly for login management.
                  </li>
                  <li className="mb-2">
                    <strong>No Storage of Sensitive Data:</strong> Daftar does not
                    store any sensitive information such as passwords or personal
                    documents. We never have access to or retain your Google
                    password, and we do not have the capability to view or alter
                    your Google account details beyond the minimal data required
                    for authentication.
                  </li>
                  <li className="mb-2">
                    <strong>Google’s Privacy Practices:</strong> Google has
                    stringent privacy and security practices in place, governed by
                    its Privacy Policy. When you use Google Sign-In, your
                    interactions with Google are subject to their privacy and data
                    protection practices.
                  </li>
                  <li className="mb-2">
                    <strong>Data Retention by Google:</strong> Google retains your
                    authentication data for as long as necessary to provide the
                    authentication service. This data is stored securely by
                    Google.
                  </li>
                  <li className="mb-2">
                    <strong>Google’s Security Measures:</strong> Google employs
                    industry-standard encryption methods and other security
                    measures to ensure that your authentication data is protected.
                  </li>
                </ul>
                <p className="text-base leading-relaxed mt-2">
                  For more information, refer to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Google’s Privacy Policy
                  </a>
                  .
                </p>
                <h3 className="text-xl font-medium mb-2 mt-4">AWS:</h3>
                <p className="text-base leading-relaxed">
                  Daftar is hosted on AWS, a trusted platform that provides
                  cloud hosting services. AWS’s policies govern how your data
                  is stored and processed. We ensure that AWS follows industry
                  standards for data protection and privacy.
                </p>
                <p className="text-base leading-relaxed mt-2">
                  We use AWS as our backend infrastructure for storing user
                  data and session information. AWS provides a scalable and
                  secure database. AWS processes your data in accordance with 
                  its own privacy policies, and we ensure that AWS complies with 
                  industry-standard data protection measures.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  6. Data Retention
                </h2>
                <p className="text-base leading-relaxed">
                  We retain your data only as long as necessary to provide the
                  services you have requested. If you choose to delete your
                  account, your data will be removed from our systems after a
                  period of 30 days, unless retention is required for audit,
                  compliance, or legal obligations. During the beta phase, some
                  data may be retained for debugging and platform improvement
                  purposes. Logs will be retained for no more than 100 days for
                  debugging and performance analysis.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  7. Your Rights Over Your Data
                </h2>
                <p className="text-base leading-relaxed">
                  As a user, you have all the rights regarding your data. You
                  maintain ownership of your data at all times. Daftar acts as a
                  data processor and processes your data only for the purposes
                  specified in this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  8. Sharing, Transfer, or Disclosure of Google User Data
                </h2>
                <p className="text-base leading-relaxed">
                  Daftar does not sell, share, or disclose your Google user data to third parties, except as required to operate and improve our services, and only under the conditions described below:
                </p>
                <ul className="list-disc pl-6 text-base leading-relaxed mt-2">
                <li className="mb-2">
                  <strong>Cloud Infrastructure (AWS):</strong> We use Amazon Web Services (AWS EC2 and S3) to host our application and store session-related data. Your Google authentication data (such as your name and email address) is processed and stored securely on our AWS servers, solely for the purposes of providing access and managing sessions. AWS complies with industry-standard data protection regulations and does not access your data for any purpose outside of providing cloud services.
                </li>
                <li className="mb-2">
                  <strong>No Unauthorized Third Parties:</strong> We do not share or transfer your Google user data to any unauthorized third parties. Only Daftar’s authorized internal personnel have access to this data, and only for the purpose of operating the service.
                </li>
                <li className="mb-2">
                  <strong>Legal Compliance:</strong> We may disclose your Google user data if legally required (e.g., court order, legal process, or government request), and only when necessary to comply with applicable laws, protect our rights, or ensure the safety of users.
                </li>
                <li className="mb-2">
                  <strong>No Third-Party Advertising:</strong> Daftar does not use, disclose, or share your Google user data for advertising or marketing purposes, nor do we allow any third-party advertisers access to this data.
                </li>
                <li className="mb-2">
                  <strong>No Cross-Border Transfers Without Safeguards:</strong> If data needs to be processed or accessed outside your country, it is done only through trusted infrastructure providers like AWS with appropriate legal safeguards and compliance measures in place.
                </li>
                <li className="mb-2">
                  <strong>Internal Data Access Controls:</strong> We strictly enforce internal data access controls and ensure that all data handlers within Daftar follow confidentiality agreements and security protocols.
                </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  9. Cookies & Tracking
                </h2>
                <p className="text-base leading-relaxed">
                  We may use cookies and session tracking technologies for the
                  purpose of improving your user experience. These technologies
                  help us remember your preferences and enhance software
                  usability.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  10. Security Measures
                </h2>
                <p className="text-base leading-relaxed">
                  We employ standard data protection practices, including
                  encryption, access controls, and regular security audits to
                  safeguard your data. In the event of a data security breach, we
                  will notify you promptly within 72 working hours by applicable
                  laws. However, we are not liable for any losses or damages
                  arising from such incidents.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-base leading-relaxed">
                  Since Daftar is currently in beta, this policy may be updated
                  frequently as we improve the software. Any significant changes
                  to this policy will be communicated to you via email or through
                  the software.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  12. Grievance Redressal
                </h2>
                <p className="text-base leading-relaxed">
                  If you have any grievances or concerns about your data or this
                  Privacy Policy, please contact us at the support tab in your
                  profile. We will address your concerns within a reasonable time
                  frame, in compliance with Indian data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-base leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy
                  or how we handle your data, please contact us through the
                  support tab in your profile.
                </p>
                <p className="text-base leading-relaxed mt-4">
                  <strong>Tech Team</strong>
                  <br />
                  Daftar OS
                </p>
              </section>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Daftar's Privacy Policy",
  description:
    "Learn how Daftar collects, processes, and protects your data in our Privacy Policy.",
};