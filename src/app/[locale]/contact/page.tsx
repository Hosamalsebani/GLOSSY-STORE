'use client';

import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ContactPage() {
  const t = useTranslations('Footer'); // Can reuse translations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('*').limit(1).single();
        if (data) setStoreSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, [supabase]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] text-center mb-4">Contact Us</h1>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
          We're here to help. Reach out to us for any inquiries about our products, orders, or services.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-6">Get in Touch</h2>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-full text-[var(--color-rose-gold)]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-luxury-black)] mb-1">Our Boutiques</h3>
                <p className="text-gray-500 whitespace-pre-line">
                  {storeSettings?.store_address || '123 Fashion Avenue\nNew York, NY 10001\nUnited States'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-full text-[var(--color-rose-gold)]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-luxury-black)] mb-1">Phone Number</h3>
                <p className="text-gray-500" dir="ltr">{storeSettings?.contact_phone || '+1 (555) 123-4567'}</p>
                <p className="text-sm text-gray-400 mt-1">Available during business hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-full text-[var(--color-rose-gold)]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-luxury-black)] mb-1">Email Support</h3>
                <p className="text-gray-500">{storeSettings?.contact_email || 'support@luxurystore.com'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-full text-[var(--color-rose-gold)]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-luxury-black)] mb-1">Business Hours</h3>
                <p className="text-gray-500 whitespace-pre-line">
                  {storeSettings?.business_hours || 'Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST\nSunday: Closed'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8">
            <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-6">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-medium text-[var(--color-luxury-black)] mb-2">Message Sent</h3>
                <p className="text-gray-500 mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      id="first-name" 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      id="last-name" 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow" 
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    id="subject" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow bg-white"
                  >
                    <option value="">Select a subject...</option>
                    <option value="order">Order Support</option>
                    <option value="product">Product Question</option>
                    <option value="return">Returns & Exchanges</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-black)] focus:border-transparent outline-none transition-shadow resize-y" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[var(--color-luxury-black)] text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-wider text-sm font-medium"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
