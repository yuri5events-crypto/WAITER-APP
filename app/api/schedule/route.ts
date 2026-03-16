import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

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
    const data = await kv.get('waiter_schedule');
    return NextResponse.json(data || INITIAL_DATA);
  } catch (error) {
    return NextResponse.json(INITIAL_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data: any = await kv.get('waiter_schedule') || INITIAL_DATA;
    
    let updatedData;

    // בדיקה אם זו עריכת הגדרות יום או הרשמת מלצר רגילה
    if (body.type === 'UPDATE_DAY') {
      updatedData = data.map((day: any) => 
        day.id === body.dayId ? { ...day, limit: parseInt(body.limit), time: body.time } : day
      );
    } else {
      updatedData = data.map((day: any) => {
        if (day.id === body.dayId && !day.waiters.includes(body.userName) && day.waiters.length < day.limit) {
          return { ...day, waiters: [...day.waiters, body.userName] };
        }
        return day;
      });
    }

    await kv.set('waiter_schedule', updatedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  await kv.set('waiter_schedule', INITIAL_DATA);
  return NextResponse.json({ success: true });
}