import { redirect } from 'next/navigation';

export default function RootPage() {
  // Default to English. The middleware/proxy will handle more complex 
  // language detection, but this serves as a fallback entry point.
  redirect('/en');
}
