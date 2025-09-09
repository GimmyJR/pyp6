import { NotificationHandlers } from '@/lib/notifications/handlers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await NotificationHandlers.sendPendingTransactionNotifications();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
