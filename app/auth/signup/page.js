'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error); setLoading(false); return; }
      const signInR = await signIn('credentials', { email, password, redirect: false });
      if (signInR?.ok) { toast.success('Account created!'); router.push('/account'); }
      else toast.error('Signed up but login failed. Please sign in.');
    } catch { toast.error('Something went wrong'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white p-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl tracking-tight">FITSTICH.</h1>
          <p className="text-neutral-500 text-sm mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-none" />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-none" />
          <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-none" />
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-none bg-black hover:bg-neutral-800 text-xs uppercase tracking-[0.2em]">
            {loading ? 'Creating...' : 'Create account'}
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
          Already have an account? <a href="/auth/signin" className="underline underline-offset-4 hover:text-black">Sign in</a>
        </p>
        <p className="text-center text-xs text-neutral-400 mt-2">
          <a href="/" className="hover:text-black">← Back to store</a>
        </p>
      </div>
    </div>
  );
}
