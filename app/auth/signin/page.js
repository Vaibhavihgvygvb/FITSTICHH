'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (r?.ok) { toast.success('Signed in'); router.push('/account'); }
    else toast.error('Invalid email or password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white p-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl tracking-tight">FITSTICH.</h1>
          <p className="text-neutral-500 text-sm mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-none" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-none" />
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-none bg-black hover:bg-neutral-800 text-xs uppercase tracking-[0.2em]">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-neutral-400">or</span></div>
        </div>
        <Button onClick={() => signIn('google', { callbackUrl: '/account' })} variant="outline" className="w-full h-12 rounded-none border-black text-xs uppercase tracking-[0.2em]">
          Continue with Google
        </Button>
        <p className="text-center text-sm text-neutral-500 mt-6">
          No account? <a href="/auth/signup" className="underline underline-offset-4 hover:text-black">Sign up</a>
        </p>
        <p className="text-center text-xs text-neutral-400 mt-2">
          <a href="/" className="hover:text-black">← Back to store</a>
        </p>
      </div>
    </div>
  );
}
