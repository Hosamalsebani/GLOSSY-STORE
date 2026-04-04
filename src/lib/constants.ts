export interface PaymentMethod {
  id: string;
  color: string;
  bg: string;
  icon: string;
}

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: 'online_card', color: '#1A56DB', bg: '#EBF5FF', icon: '/images/payments/online_card.png' },
  { id: 'tadawul', color: '#008542', bg: '#ECFDF5', icon: '/images/payments/tadawul.png' },
  { id: 'edfaely', color: '#7C3AED', bg: '#F5F3FF', icon: '/images/payments/edfaely.png' },
  { id: 'sadad', color: '#F59E0B', bg: '#FFFBEB', icon: '/images/payments/sadad.png' },
  { id: 'yusr_pay', color: '#0891B2', bg: '#ECFEFF', icon: '/images/payments/yusr_pay.png' },
  { id: 'masrafi_pay', color: '#1E40AF', bg: '#EFF6FF', icon: '/images/payments/masrafi_pay.png' },
  { id: 'eva_card', color: '#E11D48', bg: '#FFF1F2', icon: '/images/payments/eva_card.png' },
  { id: 'wallet', color: '#D4AF37', bg: '#FFFBEB', icon: '/images/payments/wallet.png' },
  { id: 'cod', color: '#334155', bg: '#F8FAFC', icon: '/images/payments/cod.png' },
] as const;
