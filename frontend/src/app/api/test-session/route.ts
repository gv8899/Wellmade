import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user,
        userId: (session as any).userId,
        roles: (session as any).roles,
        hasBackendToken: !!(session as any).backendToken,
        backendTokenLength: (session as any).backendToken?.length,
        provider: (session as any).provider
      } : null
    });
  } catch (error) {
    console.error('Test session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}