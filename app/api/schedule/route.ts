import { createClient } from '@vercel/kv';
import { NextResponse } from 'next/server';

// חיבור לפי השם שמופיע אצלך ב-Vercel
const kv = createClient({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_URL!.split('@')[1].split(':')[0], // חילוץ אוטומטי של הטוקן
});

const INITIAL_DATA = [
  { id: 1, name: 'ראשון', time: '17:00', limit: 25, waiters: [] },
  { id: 2, name: 'שני', time: '17:00', limit: 15, waiters: [] },
  { id: 3, name: 'שלישי', time: '17:00', limit: 32, waiters: [] },
  { id: 4, name: 'רביעי', time: '17:00', limit: 22, waiters: [] },
  { id: 5, name: 'חמישי', time: '17:00', limit: 29, waiters: [] },
  { id: 6, name: 'שישי', time: '09:30', limit: 15, waiters: [] },
];

export async function GET() {
  try {
    let data = await kv.get('waiter_schedule');
    if (!data) {
      await kv.set('waiter_schedule', INITIAL_DATA);
      data = INITIAL_DATA;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Connection Error:", error);
    return NextResponse.json(INITIAL_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const { dayId, userName } = await request.json();
    const data: any = await kv.get('waiter_schedule') || INITIAL_DATA;
    
    const updatedData = data.map((day: any) => {
      if (day.id === dayId && !day.waiters.includes(userName) && day.waiters.length < day.limit) {
        return { ...day, waiters: [...day.waiters, userName] };
      }
      return day;
    });

    await kv.set('waiter_schedule', updatedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}

export async function DELETE() {
  await kv.set('waiter_schedule', INITIAL_DATA);
  return NextResponse.json({ success: true });
}