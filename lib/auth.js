import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const db = await getDb();
          const user = await db.collection('users').findOne({ email: credentials.email.toLowerCase().trim() });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return { id: user.userId, email: user.email, name: user.name };
        } catch { return null; }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.provider === 'google') {
        const db = await getDb();
        const existing = await db.collection('users').findOne({ email: token.email });
        if (!existing) {
          const userId = `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
          await db.collection('users').insertOne({
            userId, email: token.email, name: token.name, provider: 'google',
            createdAt: new Date(),
          });
          token.id = userId;
        } else {
          token.id = existing.userId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
