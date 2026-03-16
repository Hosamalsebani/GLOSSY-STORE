'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from '@/i18n/routing';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Tag, 
  Loader2, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { generateInvoicePDFUint8Array } from '@/utils/pdf-invoice';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'Please select a city'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional().or(z.literal('')),
  phone: z.string().min(8, 'Valid phone number is required'),
  paymentMethod: z.enum(['card', 'cod']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type ShippingRate = {
  id: string;
  city_name_en: string;
  city_name_ar: string;
  cost: number;
  active: boolean;
};

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  const t = useTranslations('HomePage');
  const router = useRouter();
  const { cart, clearCart } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabase = createClient();
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [ratesResponse, settingsResponse] = await Promise.all([
          fetch('/api/shipping-rates'),
          supabase.from('store_settings').select('*').single()
        ]);
        
        const ratesData = await ratesResponse.json();
        if (Array.isArray(ratesData)) setShippingRates(ratesData);
        if (settingsResponse.data) setStoreSettings(settingsResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoadingShipping(false);
      }
    }
    fetchInitialData();
  }, []);

  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'card',
      country: 'Libya (ليبيا)',
      phone: '+218',
      email: '',
      postalCode: '',
    },
    mode: 'onTouched',
  });

  const cityValue = watch('city');
  const paymentMethod = watch('paymentMethod');
  const emailValue = watch('email');
  const phoneValue = watch('phone');

  // Track abandoned cart when user provides contact info
  useEffect(() => {
    const trackCart = async () => {
      if ((emailValue || (phoneValue && phoneValue.length > 8)) && cart.length > 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          await fetch('/api/abandoned-carts/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailValue,
              phone: phoneValue,
              cart: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                category: item.category,
                image_url: item.image_url || (item.images && item.images[0]) || ''
              })),
              userId: session?.user?.id
            })
          });
        } catch (e) {
          // Silent fail
        }
      }
    };

    const trackCartDebounced = setTimeout(trackCart, 3000); // 3 second debounce
    return () => clearTimeout(trackCartDebounced);
  }, [emailValue, phoneValue, cart, supabase]);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('loyalty_settings').select('value').eq('key', 'points_per_unit').single();
      if (data) setMultiplier(Number(data.value));
    };
    fetchSettings();
  }, [supabase]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Find shipping cost from dynamic rates
  const selectedCityInfo = shippingRates.find(c => 
    c.city_name_en === cityValue || c.city_name_ar === cityValue
  );
  
  // Calculate final shipping cost based on admin settings and coupons
  const calculateFinalShipping = () => {
    // 1. Check if coupon grants free shipping
    if (appliedCoupon?.is_free_shipping) return 0;
    
    // 2. Check if subtotal is over the admin threshold
    const threshold = storeSettings?.free_shipping_threshold ?? 150;
    if (threshold > 0 && subtotal >= threshold) return 0;
    
    // 3. Use city rate or fallback
    return selectedCityInfo ? selectedCityInfo.cost : (shippingRates.length > 0 ? 0 : 15);
  };

  const shipping = calculateFinalShipping();
  
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discount_amount > 0 ? appliedCoupon.discount_amount : (subtotal * appliedCoupon.discount_percentage) / 100) 
    : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.trim().toUpperCase())
        .single();

      if (error || !data) {
        setCouponError('Invalid coupon code.');
        return;
      }

      if (!data.active) {
        setCouponError('This coupon is no longer active.');
        return;
      }

      if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
        setCouponError('This coupon has expired.');
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        setCouponError('This coupon has reached its usage limit.');
        return;
      }

      setAppliedCoupon(data);
      setCouponInput('');
    } catch (err) {
      setCouponError('Error applying coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthError('You must be logged in to place an order.');
        setIsSubmitting(false);
        return;
      }

      // Validate stock for all cart items before ordering
      const productIds = cart.filter(item => item.category !== 'Mystery Box').map(item => item.id);
      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, stock')
          .in('id', productIds);

        if (productsData) {
          const outOfStock = productsData.filter(p => {
            const cartItem = cart.find(c => c.id === p.id);
            return cartItem && (p.stock ?? 0) < cartItem.quantity;
          });
          if (outOfStock.length > 0) {
            const names = outOfStock.map(p => p.name).join(', ');
            setAuthError(`Insufficient stock for: ${names}. Please reduce quantity or remove from cart.`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_cost: shipping,
          status: 'pending',
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
          customer_name: `${data.firstName} ${data.lastName}`,
          customer_email: data.email || null,
          customer_phone: data.phone,
          address: `${data.address}, ${data.country} ${data.postalCode ? data.postalCode : ''}`.trim(),
          region: data.city,
          cart_items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          }))
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert valid products to order_items for database relation compliance
      const productItems = cart.filter(item => item.category !== 'Mystery Box');
      if (productItems.length > 0) {
        const orderItems = productItems.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }));
        await supabase.from('order_items').insert(orderItems);

        // Decrement stock for each purchased product
        for (const item of productItems) {
          await supabase.rpc('decrement_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity
          }).then(({ error }) => {
            if (error) {
              // Fallback: manual decrement using update
              supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single()
                .then(({ data: prod }) => {
                  if (prod) {
                    supabase
                      .from('products')
                      .update({ stock: Math.max(0, (prod.stock || 0) - item.quantity) })
                      .eq('id', item.id);
                  }
                });
            }
          });
        }
      }

      // Send admin notification email (non-blocking — we don't want to delay checkout for email)
      try {
        await fetch('/api/checkout/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: `${data.firstName} ${data.lastName}`,
            customerPhone: data.phone,
            customerEmail: data.email || null,
            city: data.city,
            address: `${data.address}, ${data.country} ${data.postalCode || ''}`.trim(),
            total,
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });
      } catch (emailErr) {
        // Email failure should not block order completion
        console.warn('Admin notification email failed:', emailErr);
      }

      // Mark abandoned cart as recovered
      if (user) {
        await supabase
          .from('abandoned_carts')
          .update({ status: 'recovered', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('status', 'abandoned');
      }

      // Increment coupon used count
      if (appliedCoupon) {
        try {
          await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
        } catch (couponUsageErr) {
          // Fallback manual increment
          await supabase.from('coupons')
            .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
            .eq('id', appliedCoupon.id);
        }
      }

      const earnedPoints = Math.floor(total * multiplier);

      // --- PDF & SMS Integration ---
      try {
        const pdfUint8 = await generateInvoicePDFUint8Array(order);
        const fileName = `${order.id}_invoice.pdf`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, pdfUint8, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(fileName);

          // Trigger SMS Notification
          await fetch('/api/notifications/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: data.phone,
              message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been placed! Total: ${total.toFixed(2)} د.ل.`,
              invoiceUrl: publicUrl
            }),
          });
        }
      } catch (smsError) {
        console.warn('PDF/SMS generation failed:', smsError);
      }
      // ----------------------------

      clearCart();
      router.push(`/checkout/confirmation?oid=${order.id}&pts=${earnedPoints}`);
    } catch (e: any) {
      console.error('Checkout error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      setAuthError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[50vh]">
        <h1 className="text-3xl font-serif mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="px-8 py-3 bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] transition-colors uppercase tracking-widest text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/cart" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-luxury-black)] transition-colors mb-8 w-fit">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <div className="w-full lg:w-2/3 space-y-8">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4">
                <p className="font-medium flex items-center gap-2">
                  <ShieldCheck size={20} />
                  {authError}
                </p>
                <div className="mt-2 text-sm">
                  Please{' '}
                  <Link href="/login" className="underline font-bold hover:text-red-800">
                    log in
                  </Link>{' '}
                  or{' '}
                  <Link href="/register" className="underline font-bold hover:text-red-800">
                    create an account
                  </Link>{' '}
                  to continue.
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-serif mb-6 uppercase tracking-widest">Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                <input 
                  type="email" 
                  {...register('email')}
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                  placeholder="hello@example.com (Optional)"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-serif mb-6 uppercase tracking-widest text-[var(--color-luxury-black)]">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    {...register('firstName')}
                    className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    {...register('lastName')}
                    className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input 
                    type="text" 
                    {...register('address')}
                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                    placeholder="123 Luxury Ave, Suite 100"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select 
                    {...register('city')}
                    className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors bg-white`}
                  >
                    <option value="">{isLoadingShipping ? 'Loading cities...' : 'Select a city...'}</option>
                    {shippingRates.map(c => (
                      <option key={c.id} value={locale === 'ar' ? c.city_name_ar : c.city_name_en}>
                        {locale === 'ar' ? c.city_name_ar : c.city_name_en}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country (الدولة)</label>
                  <input 
                    type="text" 
                    {...register('country')}
                    defaultValue="Libya (ليبيا)"
                    readOnly
                    className="w-full border border-gray-100 bg-gray-50 px-4 py-3 outline-none text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code (Optional)</label>
                  <input 
                    type="text" 
                    {...register('postalCode')}
                    className={`w-full border ${errors.postalCode ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    {...register('phone')}
                    className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-200'} px-4 py-3 outline-none focus:border-[var(--color-luxury-black)] transition-colors`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-serif mb-6 uppercase tracking-widest text-[var(--color-luxury-black)]">Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`block p-4 border ${paymentMethod === 'card' ? 'border-[var(--color-luxury-black)] bg-gray-50' : 'border-gray-200'} cursor-pointer flex items-center justify-between transition-colors`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      value="card" 
                      {...register('paymentMethod')}
                      className="w-4 h-4 text-[var(--color-luxury-black)] focus:ring-[var(--color-luxury-black)] accent-[var(--color-luxury-black)]"
                    />
                    <span className="font-medium text-[var(--color-luxury-black)]">Credit / Debit Card</span>
                  </div>
                  <CreditCard className="text-gray-400" size={24} />
                </label>

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-gray-50 border border-gray-200 border-t-0 -mt-5 pt-8 space-y-4">
                     {/* Mock Stripe Elements */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Card Number</label>
                        <div className="w-full border border-gray-300 px-4 py-3 bg-white text-gray-400">
                          •••• •••• •••• ••••
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Expiration (MM/YY)</label>
                        <div className="w-full border border-gray-300 px-4 py-3 bg-white text-gray-400">
                          MM / YY
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CVC</label>
                        <div className="w-full border border-gray-300 px-4 py-3 bg-white text-gray-400">
                          •••
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <ShieldCheck size={14} className="text-green-600" /> Payments are secure and encrypted.
                    </p>
                  </div>
                )}

                <label className={`block p-4 border ${paymentMethod === 'cod' ? 'border-[var(--color-luxury-black)] bg-gray-50' : 'border-gray-200'} cursor-pointer flex items-center justify-between transition-colors`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      value="cod" 
                      {...register('paymentMethod')}
                      className="w-4 h-4 text-[var(--color-luxury-black)] focus:ring-[var(--color-luxury-black)] accent-[var(--color-luxury-black)]"
                    />
                    <span className="font-medium text-[var(--color-luxury-black)]">Cash on Delivery</span>
                  </div>
                  <Truck className="text-gray-400" size={24} />
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-serif mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">Your Order</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 flex-shrink-0 relative">
                       <img src={item.image_url || (item.images && item.images[0]) || ''} alt={item.name} className="w-full h-full object-cover" />
                       <span className="absolute -top-2 -right-2 bg-[var(--color-luxury-black)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                         {item.quantity}
                       </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-xs uppercase tracking-widest text-[var(--color-rose-gold)] mb-1 block">{item.brand}</span>
                      <h3 className="text-sm font-serif line-clamp-1">{item.name}</h3>
                      <span className="text-sm font-medium mt-1">{item.price * item.quantity} د.ل</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6 space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{subtotal} د.ل</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1"><Tag size={14} /> Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-{discountAmount} د.ل</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : `${shipping} د.ل`}</span>
                </div>
              </div>

              {/* Coupon Input Area */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-luxury-black)]"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="bg-[var(--color-luxury-black)] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[var(--color-rose-gold)] disabled:bg-gray-200 transition-colors"
                      >
                        {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs italic">{couponError}</p>}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 flex items-center justify-between rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                      <CheckCircle2 size={16} />
                      <span>{appliedCoupon.code} applied!</span>
                    </div>
                    <button 
                      type="button"
                      onClick={removeCoupon}
                      title="Remove Coupon"
                      className="text-emerald-500 hover:text-emerald-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--color-luxury-black)] pt-6 mb-8 flex justify-between items-center text-xl">
                <span className="font-serif uppercase tracking-widest">Total</span>
                <span className="font-medium">{total} د.ل</span>
              </div>

              <button 
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full bg-[var(--color-luxury-black)] text-white hover:bg-[var(--color-rose-gold)] disabled:bg-gray-300 disabled:cursor-not-allowed py-4 uppercase tracking-widest text-sm font-medium transition-colors flex justify-center items-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  `ادفع ${total} د.ل`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
