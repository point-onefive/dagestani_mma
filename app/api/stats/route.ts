import { NextResponse } from 'next/server';
import { loadStats } from '@/lib/dagestan';

export async function GET() {
  try {
    const stats = loadStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}
