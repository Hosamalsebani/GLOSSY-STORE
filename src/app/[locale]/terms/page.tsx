import { useTranslations } from 'next-intl';

export default function TermsOfServicePage() {
  const t = useTranslations('Footer');

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] mb-8">Terms of Service</h1>

        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="mb-6">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p className="mb-8 italic bg-gray-50 p-4 rounded-lg border-l-4 border-[var(--color-rose-gold)]">
            Please read these terms and conditions carefully before using Our Service.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">1. Acknowledgment</h2>
            <p className="mb-4">
              These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
            </p>
            <p className="mb-4">
              Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">2. User Accounts</h2>
            <p className="mb-4">
              When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
            </p>
            <p className="mb-4">
              You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">3. Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content, features and functionality are and will remain the exclusive property of the Company and its licensors.
            </p>
            <p className="mb-4">
              The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Company.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">4. Limitation of Liability</h2>
            <p className="mb-4">
              Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">5. "AS IS" and "AS AVAILABLE" Disclaimer</h2>
            <p className="mb-4">
              The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its affiliates and its and their respective licensors and service providers, expressly disclaims all warranties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">6. Changes to These Terms and Conditions</h2>
            <p className="mb-4">
              We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms and Conditions, You can contact us:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>By visiting this page on our website: http://GLOSSY:3000/ar/contact</li>
              <li>By email: support@GLOSSY.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
