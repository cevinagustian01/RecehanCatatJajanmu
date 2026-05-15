import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { syncUser } from '@/lib/sync-user';
import crypto from 'crypto';

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const authUserId = authUser?.id;
    
    if (!authUserId) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const email = authUser?.email;
    const synced = email ? await syncUser(authUserId, email) : null;
    const userId = synced?.id;
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Delete existing pending verifications for this user
    await prisma.telegramVerification.deleteMany({
      where: { userId }
    });

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.telegramVerification.create({
      data: { userId, code, expiresAt }
    });

    return NextResponse.json({ success: true, code, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    console.error('[Telegram Generate Code Error]:', e);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
