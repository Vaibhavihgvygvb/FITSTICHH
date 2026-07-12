import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const userId = `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    await db.collection('users').insertOne({
      userId, email: normalizedEmail, name: name || normalizedEmail.split('@')[0],
      password: hashed, provider: 'credentials', createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, userId, email: normalizedEmail }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
