'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/utils/cn';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Tag, 
  Loader2, 
  CheckCircle2, 
  X,
  ChevronRight,
  ChevronLeft,
  Lock,
  Smartphone,
  Globe,
  Check,
  ChevronDown,
  ShoppingBag,
  MapPin,
  CreditCard as PaymentIcon
} from 'lucide-react';
import { generateInvoicePDFUint8Array } from '@/utils/pdf-invoice';
import { motion, AnimatePresence } from 'framer-motion';
import { PAYMENT_METHODS, type PaymentMethod } from '@/lib/constants';

// DIN-style Typography Components
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2.5 block font-tajawal", className)}>
    {children}
  </label>
);

const getCheckoutSchema = (t: any) => z.object({
  email: z.string().email(t('validation.email')).optional().or(z.literal('')),
  firstName: z.string().min(2, t('validation.firstName')),
  lastName: z.string().min(2, t('validation.lastName')),
  city: z.string().min(1, t('validation.city')),
  country: z.string().min(1, t('validation.country')),
  phone: z.string().min(8, t('validation.phone')),
  paymentMethod: z.enum(['online_card', 'tadawul', 'edfaely', 'sadad', 'yusr_pay', 'masrafi_pay', 'eva_card', 'cod']),
});

type CheckoutFormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  city: string;
  country: string;
  paymentMethod: 'online_card' | 'tadawul' | 'edfaely' | 'sadad' | 'yusr_pay' | 'masrafi_pay' | 'eva_card' | 'cod';
};

const getPaymentInstructions = (methodId: string, locale: string) => {
  const instructions: Record<string, { ar: string; en: string; action: string }> = {
    online_card: { ar: 'سيتم تحويلك لبوابة الدفع الآمنة لإدخال بيانات بطاقتك.', en: 'You will be redirected to our secure payment gateway.', action: 'card_form' },
    tadawul: { ar: 'سيتم تحويلك لتطبيق تداول لإتمام الدفع.', en: 'You will be redirected to Tadawul app to complete payment.', action: 'redirect' },
    edfaely: { ar: 'سيتم إرسال رابط الدفع إلى هاتفك عبر إدفعلي.', en: 'A payment link will be sent to your phone via Edfaely.', action: 'phone' },
    sadad: { ar: 'أدخل رقم هاتفك المسجل في سداد لإتمام الدفع.', en: 'Enter your SADAD registered phone number to pay.', action: 'phone' },
    yusr_pay: { ar: 'سيتم تحويلك لبوابة يسر باي لإتمام الدفع بالتقسيط.', en: 'You will be redirected to Yusr Pay for installment payment.', action: 'redirect' },
    masrafi_pay: { ar: 'سيتم تحويلك لتطبيق مصرفي لإتمام الدفع.', en: 'You will be redirected to Masrafi app to pay.', action: 'redirect' },
    eva_card: { ar: 'أدخل بيانات بطاقة إيفا الخاصة بك لإتمام الدفع.', en: 'Enter your Eva Card details to complete payment.', action: 'card_form' },
    cod: { ar: 'الدفع نقداً عند الاستلام. لا حاجة لمعلومات إضافية.', en: 'Cash on delivery. No additional info needed.', action: 'none' },
  };
  const info = instructions[methodId] || instructions.cod;
  return { text: locale === 'ar' ? info.ar : info.en, action: info.action };
};

type ShippingRate = {
  id: string;
  city_name_en: string;
  city_name_ar: string;
  cost: number;
  active: boolean;
};

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('Checkout');
  const tHome = useTranslations('HomePage');
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

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(getCheckoutSchema(t)),
    defaultValues: {
      paymentMethod: 'online_card',
      country: locale === 'ar' ? 'ليبيا' : 'Libya',
      phone: '+218',
      email: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    async function fillUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const names = profile.full_name?.split(' ') || [];
          if (names[0]) setValue('firstName', names[0]);
          if (names.slice(1).join(' ')) setValue('lastName', names.slice(1).join(' '));
          if (profile.phone_number) setValue('phone', profile.phone_number);
          if (profile.email) setValue('email', profile.email);
        } else if (user.email) {
          setValue('email', user.email);
        }
      }
    }
    fillUserData();
  }, [supabase, setValue]);

  const cityValue = watch('city');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const paymentMethod = watch('paymentMethod');
  const currentPayment = PAYMENT_METHODS.find((m: PaymentMethod) => m.id === paymentMethod);
  const emailValue = watch('email');
  const phoneValue = watch('phone');

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
        } catch (e) { /* Silent fail */ }
      }
    };
    const trackCartDebounced = setTimeout(trackCart, 3000);
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
  const selectedCityInfo = shippingRates.find(c => 
    c.city_name_en === cityValue || c.city_name_ar === cityValue
  );
  
  const calculateFinalShipping = () => {
    if (appliedCoupon?.is_free_shipping) return 0;
    const threshold = storeSettings?.free_shipping_threshold ?? 150;
    if (threshold > 0 && subtotal >= threshold) return 0;
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
        setCouponError(locale === 'ar' ? 'كود الخصم غير صحيح.' : 'Invalid coupon code.');
        return;
      }
      if (!data.active) {
        setCouponError(locale === 'ar' ? 'هذا الكوبون غير فعال حالياً.' : 'This coupon is no longer active.');
        return;
      }
      if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
        setCouponError(locale === 'ar' ? 'انتهت صلاحية هذا الكوبون.' : 'This coupon has expired.');
        return;
      }
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        setCouponError(locale === 'ar' ? 'وصل هذا الكوبون للحد الأقصى للاستخدام.' : 'This coupon has reached its usage limit.');
        return;
      }

      setAppliedCoupon(data);
      setCouponInput('');
    } catch (err) {
      setCouponError(locale === 'ar' ? 'خطأ في تطبيق الكوبون.' : 'Error applying coupon.');
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
        setAuthError(t('errors.loginRequired'));
        setIsSubmitting(false);
        return;
      }

      const productIds = cart.filter(item => item.category !== 'Mystery Box').map(item => item.id);
      let productsWithCosts: any[] = [];

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, stock, cost_price')
          .in('id', productIds);

        if (productsData) {
          productsWithCosts = productsData;
          const outOfStock = productsData.filter(p => {
            const cartItem = cart.find(c => c.id === p.id);
            return cartItem && (p.stock ?? 0) < cartItem.quantity;
          });
          if (outOfStock.length > 0) {
            const names = outOfStock.map(p => p.name).join(', ');
            setAuthError(t('errors.stock', { names }));
            setIsSubmitting(false);
            return;
          }
        }
      }

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
          address: `${data.city}, ${data.country}`.trim(),
          region: data.city,
          cart_items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            image_url: item.image_url || (item.images && item.images[0]) || ''
          }))
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const productItems = cart.filter(item => item.category !== 'Mystery Box');
      if (productItems.length > 0) {
        const orderItems = productItems.map(item => {
          const productInfo = productsWithCosts.find(p => p.id === item.id);
          return {
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            cost_price: productInfo?.cost_price || 0
          };
        });
        await supabase.from('order_items').insert(orderItems);

        for (const item of productItems) {
          await supabase.rpc('decrement_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity
          });
        }
      }

      await supabase.from('abandoned_carts').update({ status: 'recovered' }).eq('user_id', user.id).eq('status', 'abandoned');

      const backgroundTasks = async () => {
        try {
          const emailTask = fetch('/api/checkout/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: `${data.firstName} ${data.lastName}`,
              customerPhone: data.phone,
              customerEmail: data.email,
              city: data.city,
              address: `${data.city}, ${data.country}`.trim(),
              total: total,
              items: cart.filter(item => item.category !== 'Mystery Box').map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              }))
            })
          }).catch(err => console.error('Admin email failed:', err));

          const pdfSmsTask = (async () => {
            try {
              const pdfUint8 = await generateInvoicePDFUint8Array(order);
              const fileName = `${order.id}_invoice.pdf`;
              await supabase.storage.from('invoices').upload(fileName, pdfUint8, { contentType: 'application/pdf', upsert: true });
              const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);
              
              await fetch('/api/notifications/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumber: data.phone,
                  message: locale === 'ar' 
                    ? `تم استلام طلبك #${order.id.slice(0, 8).toUpperCase()}! الإجمالي: ${total.toFixed(2)} د.ل.` 
                    : `Your order #${order.id.slice(0, 8).toUpperCase()} has been placed! Total: ${total.toFixed(2)} د.ل.`,
                  invoiceUrl: publicUrl
                }),
              });
            } catch (e) {
              console.error('PDF/SMS Task failed:', e);
            }
          })();

          await Promise.allSettled([emailTask, pdfSmsTask]);
        } catch (e) {
          console.error('Background tasks failed:', e);
        }
      };

      await backgroundTasks();

      const earnedPoints = Math.floor(total * multiplier);
      clearCart();
      router.push(`/checkout/confirmation?oid=${order.id}&pts=${earnedPoints}`);
    } catch (e) {
      setAuthError(t('errors.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] font-tajawal">
        <h1 className="text-4xl font-black mb-6 tracking-tight">{t('emptyCartTitle')}</h1>
        <p className="text-gray-400 mb-10 text-lg">{t('emptyCartMessage')}</p>
        <Link href="/shop" className="inline-flex h-16 px-12 items-center bg-black text-white rounded-full font-black text-xs uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-xl">
          {t('returnToShop')}
        </Link>
      </div>
    );
  }

  const isRtl = locale === 'ar';

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-10 lg:py-24 font-tajawal" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Simplified Global Progress Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
           <div>
             <Link href="/cart" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-black transition-all mb-8">
               {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
               {t('backToCart')}
             </Link>
             <h1 className="text-5xl md:text-7xl font-black text-black tracking-tight leading-none mb-4">
               {isRtl ? 'إتمام الطلب' : 'Checkout'}
             </h1>
             <p className="text-gray-400 text-sm font-medium">
               {isRtl ? 'أدخل تفاصيل الشحن لإكمال عملية الشراء' : 'Enter shipping details to complete your purchase'}
             </p>
           </div>
           
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xs font-black">01</div>
             <div className="w-12 h-[1px] bg-gray-200" />
             <div className="w-10 h-10 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center text-xs font-black">02</div>
             <div className="w-12 h-[1px] bg-gray-200" />
             <div className="w-10 h-10 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center text-xs font-black">03</div>
           </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Main Execution Flow */}
          <div className="w-full lg:w-[62%] space-y-16">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 rounded-3xl p-8 text-red-600 flex items-start gap-5 shadow-sm"
              >
                <ShieldCheck size={32} className="text-red-500 flex-shrink-0" />
                <div className="space-y-4">
                  <p className="font-black text-lg">{authError}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/login" className="h-10 px-6 bg-red-600 text-white rounded-full flex items-center text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                      {tHome('login')}
                    </Link>
                    <Link href="/register" className="h-10 px-6 bg-white border border-red-200 text-red-600 rounded-full flex items-center text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                      {t('createAccount')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: CONTACT (DIN Structured Layout) */}
            <section className="bg-white rounded-[3.5rem] p-10 lg:p-14 border border-gray-50 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg">01</div>
                <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                  {isRtl ? 'المعلومات الشخصية' : 'Personal Information'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                <div className="space-y-1.5">
                  <Label>{t('firstName')}</Label>
                  <input 
                    type="text" 
                    {...register('firstName')}
                    placeholder="E.g. Sarah"
                    className={cn(
                      "w-full h-16 bg-[#FDFDFD] border border-gray-100 rounded-2xl px-6 outline-none transition-all font-bold text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black",
                      errors.firstName && "border-red-200 bg-red-50/10"
                    )}
                  />
                  {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">{errors.firstName.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <Label>{t('lastName')}</Label>
                  <input 
                    type="text" 
                    {...register('lastName')}
                    placeholder="E.g. Ali"
                    className="w-full h-16 bg-[#FDFDFD] border border-gray-100 rounded-2xl px-6 outline-none transition-all font-bold text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 pt-4 border-t border-gray-50">
                  <div className="space-y-1.5">
                    <Label>{t('email')}</Label>
                    <input 
                      type="email" 
                      {...register('email')}
                      placeholder="sarah@example.com"
                      className="w-full h-16 bg-[#FDFDFD] border border-gray-100 rounded-2xl px-6 outline-none transition-all font-bold text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label>{t('phone')}</Label>
                    <div className="relative group">
                       <input 
                        type="tel" 
                        {...register('phone')}
                        className="w-full h-16 bg-[#FDFDFD] border border-gray-100 rounded-2xl px-6 ltr:pl-16 rtl:pr-16 outline-none transition-all font-bold text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black font-mono overflow-visible"
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 ltr:left-6 rtl:right-6 text-gray-400 font-black text-xs border-r border-gray-100 ltr:pr-3 rtl:pl-3 pointer-events-none">
                        +218
                      </div>
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2: ADDRESS (High Precision Grid) */}
            <section className="bg-white rounded-[3.5rem] p-10 lg:p-14 border border-gray-50 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg">02</div>
                <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                  {isRtl ? 'عنوان الشحن' : 'Shipping Address'}
                </h2>
              </div>
              
              <div className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-1.5">
                      <Label>{t('city')}</Label>
                      <div className="relative">
                        <select 
                          {...register('city')}
                          className="w-full h-16 bg-[#FDFDFD] border border-gray-100 rounded-2xl px-6 outline-none transition-all font-black text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black appearance-none cursor-pointer"
                        >
                          <option value="">{isLoadingShipping ? (isRtl ? 'جاري التحميل...' : 'Loading...') : t('selectCity')}</option>
                          {shippingRates.map(c => (
                            <option key={c.id} value={isRtl ? c.city_name_ar : c.city_name_en}>
                              {isRtl ? c.city_name_ar : c.city_name_en}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute top-1/2 -translate-y-1/2 ltr:right-6 rtl:left-6 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('country')}</Label>
                      <div className="h-16 flex items-center px-6 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-sm select-none">
                         {locale === 'ar' ? 'ليبيا' : 'Libya'}
                      </div>
                    </div>
                 </div>

                 <div className="p-8 bg-[#F4F1EA]/30 border border-[#D4AF37]/10 rounded-[2.5rem] flex items-start gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <MapPin size={24} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-2">{isRtl ? 'نصيحة للشحن' : 'SHIPPING TIP'}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{t('addressTip')}</p>
                    </div>
                 </div>
              </div>
            </section>

            {/* STEP 3: PAYMENT (International Branded Tiles) */}
            <section className="bg-white rounded-[3.5rem] p-10 lg:p-14 border border-gray-50 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg">03</div>
                  <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                    {isRtl ? 'طريقة الدفع' : 'Payment Method'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600">{isRtl ? 'دفع آمن' : 'SECURE PAY'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setValue('paymentMethod', method.id as any)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all group overflow-hidden h-40 md:h-48",
                        isSelected 
                          ? "bg-white border-black shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] scale-105 z-10" 
                          : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-100 hover:scale-[1.02]"
                      )}
                    >
                       <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                          <img 
                            src={method.icon} 
                            alt={t(method.id)} 
                            className={cn("w-full h-full object-contain transition-transform", isSelected ? "animate-pulse" : "opacity-60 group-hover:opacity-100")}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const span = document.createElement('span');
                                span.className = 'text-xs font-black uppercase tracking-wider';
                                span.style.color = method.color;
                                span.textContent = method.id.substring(0, 3);
                                parent.appendChild(span);
                              }
                            }}
                          />
                       </div>
                       <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", isSelected ? "text-black" : "text-gray-400 group-hover:text-gray-600")}>
                         {t(method.id)}
                       </span>
                       
                       {isSelected && (
                         <div className="absolute top-3 right-3 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" strokeWidth={3} />
                         </div>
                       )}
                    </button>
                  );
                })}
              </div>

              {/* Secure Method Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={paymentMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-3xl p-8 border border-gray-100"
                >
                  <p className="text-gray-600 text-sm font-bold leading-relaxed">
                    {getPaymentInstructions(paymentMethod, locale).text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </section>
          </div>

          {/* SIDEBAR: (Sticky High-Density Summary) */}
          <aside className="w-full lg:w-[38%] sticky top-32">
             <div className="bg-white rounded-[3.5rem] border border-gray-50 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] p-10 lg:p-14">
               <h3 className="text-2xl font-black text-black tracking-tight uppercase mb-10 pb-6 border-b border-gray-50 flex items-center justify-between">
                 {t('orderSummary')}
                 <span className="text-[10px] font-black bg-gray-100 px-3 py-1.5 rounded-full text-gray-500">{cart.length} ITEMS</span>
               </h3>

               {/* Density-Optimized Cart List */}
               <div className="space-y-8 mb-12 max-h-[35vh] overflow-y-auto ltr:pr-4 rtl:pl-4 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0 relative">
                         <img src={item.image_url || (item.images && item.images[0]) || ''} alt={item.name} className="w-full h-full object-cover" />
                         <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-xl font-bold ring-4 ring-white">
                           {item.quantity}
                         </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-black truncate mb-1">{item.name}</h4>
                        <div className="flex items-center justify-between">
                           <span className="text-xs uppercase tracking-widest text-[#9333EA] font-black">{item.category}</span>
                           <span className="text-sm font-black text-black">{(item.price * item.quantity).toFixed(0)} د.ل</span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>

               {/* High-Fidelity Discount Input */}
               <div className="mb-12">
                  {!appliedCoupon ? (
                    <div className="space-y-3">
                       <Label className="pl-1 uppercase tracking-[0.4em]">{isRtl ? 'كود الخصم' : 'PROMO CODE'}</Label>
                       <div className="flex gap-3 h-16">
                          <input 
                            type="text" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="G-SUMMER24"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-sm uppercase tracking-widest outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                          />
                          <button 
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-8 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-800 transition-all disabled:bg-gray-100"
                          >
                            {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : t('apply')}
                          </button>
                       </div>
                       {couponError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-2">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center justify-between ring-4 ring-emerald-50/50">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">{isRtl ? 'الكود المفعل' : 'ACTIVE PROMO'}</span>
                             <span className="text-sm font-black text-emerald-700 uppercase tracking-widest leading-none">{appliedCoupon.code}</span>
                          </div>
                       </div>
                       <button onClick={removeCoupon} className="w-10 h-10 rounded-full hover:bg-emerald-100 text-emerald-400 flex items-center justify-center transition-all">
                          <X size={18} />
                       </button>
                    </div>
                  )}
               </div>

               {/* The Final Statement (Total Area) */}
               <div className="space-y-6 pt-10 border-t-2 border-gray-50 mb-12">
                  <div className="flex justify-between items-center text-gray-400 text-xs font-black uppercase tracking-widest">
                    <span>{t('subtotal')}</span>
                    <span className="text-black">{subtotal.toFixed(2)} د.ل</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 text-xs font-black uppercase tracking-widest">
                    <span>{t('shipping')}</span>
                    <span className={cn("text-black", shipping === 0 && "text-emerald-500 italic")}>
                      {shipping === 0 ? (isRtl ? 'مجانـاً' : 'FREE') : `${shipping.toFixed(2)} د.ل`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-600 text-xs font-black uppercase tracking-widest">
                      <span>{t('discount')}</span>
                      <span>-{discountAmount.toFixed(2)} د.ل</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end pt-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-[#9333EA] uppercase tracking-[0.5em] mb-2">{isRtl ? 'المجموع الكلي' : 'GRAND TOTAL'}</span>
                       <div className="flex items-end gap-1">
                          <span className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">{total.toFixed(0)}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">{isRtl ? 'د.ل' : 'LYD'}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center gap-2 mb-1 justify-end">
                         <div className="w-4 h-4 bg-[#7e22ce] rounded-full" />
                         <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">+{Math.floor(total * multiplier)} Pts</span>
                       </div>
                       <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{isRtl ? 'نقاط الولاء المكتسبة' : 'POINTS EARNED'}</span>
                    </div>
                  </div>
               </div>

               {/* Final CTA: High-Contrast Luxury Button */}
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit"
                 disabled={isSubmitting || !isValid}
                 className={cn(
                   "w-full h-20 md:h-24 rounded-[2.5rem] flex items-center justify-center gap-5 transition-all text-sm md:text-md font-black uppercase tracking-[0.5em] shadow-2xl relative overflow-hidden",
                   isSubmitting || !isValid 
                     ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                     : "bg-black text-white hover:bg-[#111] shadow-black/10"
                 )}
               >
                 {isSubmitting ? (
                   <Loader2 className="animate-spin" size={24} />
                 ) : (
                   <>
                     {isRtl ? 'تأكيـد الطلب الآن' : 'CONFIRM ORDER NOW'}
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </>
                 )}
               </motion.button>
               
               <p className="text-center mt-8 text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">
                  {isRtl ? 'بالنقر على تأكيد، أنت توافق على شروط الخدمة' : 'By confirming, you agree to terms of service'}
               </p>
             </div>

             {/* Bottom Trust Icons */}
             <div className="mt-10 flex justify-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <ShieldCheck size={40} strokeWidth={1} />
                <CreditCard size={40} strokeWidth={1} />
                <Truck size={40} strokeWidth={1} />
             </div>
          </aside>
        </form>
      </div>
      
      {/* Custom Global Styles for the DIN vibe */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ddd;
        }
        
        input::placeholder {
           color: #ccc;
           font-weight: 500;
           letter-spacing: 0;
           text-transform: none;
        }
      `}</style>
    </div>
  );
}
