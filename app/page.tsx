// Root — redirects to /home; middleware handles auth gating
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}
