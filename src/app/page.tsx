import { redirect } from 'next/navigation';

export default function RootPage() {
  // Default to Arabic to match the project's defaultLocale
  redirect('/ar');
}
