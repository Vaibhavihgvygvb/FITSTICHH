'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { CutButton, DraftButton, RuleInput } from '@/components/draft/controls';
import { GrainArrow, Notch } from '@/components/draft/marks';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const r = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (r?.ok) {
      toast.success('Signed in');
      router.push('/account');
    } else {
      setError('That email and password do not match an account.');
    }
  }

  return (
    <main className="sheet-fine tooth flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="font-display text-2xl tracking-[-0.05em]" style={{ fontWeight: 900 }}>
          FITSTICH
        </Link>

        <h1 className="display mt-12 text-[clamp(2rem,7vw,2.9rem)]">Open your file.</h1>

        <form onSubmit={submit} className="mt-10 flex flex-col gap-7">
          <div>
            <label htmlFor="email" className="annot mb-2 block text-graphite">
              Email
            </label>
            <RuleInput
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="annot mb-2 block text-graphite">
              Password
            </label>
            <RuleInput
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="annot flex items-center gap-2">
              <Notch size={8} dir="right" />
              {error}
            </p>
          )}

          <CutButton type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Checking…' : 'Sign in'}
          </CutButton>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-ink/20" />
          <span className="annot text-graphite">or</span>
          <span className="h-px flex-1 bg-ink/20" />
        </div>

        <DraftButton onClick={() => signIn('google', { callbackUrl: '/account' })} size="lg" className="w-full">
          Continue with Google
        </DraftButton>

        <p className="annot mt-10 flex items-center gap-3 text-graphite">
          <GrainArrow />
          New here?{' '}
          <Link href="/auth/signup" className="text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
