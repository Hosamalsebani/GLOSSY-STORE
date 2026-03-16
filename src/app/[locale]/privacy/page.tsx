import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations('Footer'); // Can reuse translations or add specific ones

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="mb-6">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information that you provide directly to us, including your personal details (name, email address, phone number), billing and shipping addresses, payment information, and any communications you have with us.
            </p>
            <p className="mb-4">
              We also automatically collect certain information when you visit, use or navigate the Website, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Website and other technical information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use personal information collected via our Website for a variety of business purposes, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
              <li>To send you administrative information, such as updates to our terms, conditions, and policies.</li>
              <li>To deliver targeted advertising to you, with your consent.</li>
              <li>To respond to user inquiries/offer support to users.</li>
              <li>To improve our Website, products, services, marketing, and your overall customer experience.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">
              We may process or share your data that we hold based on the following legal bases:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Vendors, Consultants and Other Third-Party Service Providers:</strong> We may share your data with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf.</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">4. Security of Your Information</h2>
            <p className="mb-4">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Website is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-luxury-black)] mb-4">5. Contact Us</h2>
            <p className="mb-4">
              If you have questions or comments about this policy, you may email us at privacy@example.com or by post to:
            </p>
            <address className="not-italic text-gray-500">
              Luxury Store Inc.<br />
              123 Fashion Avenue<br />
              New York, NY 10001<br />
              United States
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
