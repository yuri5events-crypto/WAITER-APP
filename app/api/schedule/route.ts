import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const INITIAL_DATA = {
  title: "סידור עבודה - מלצרים",
  days: [
    { id: 1, name: 'ראשון', time: '17:00', limit: 25, waiters: [] },
    { id: 2, name: 'שני', time: '17:00', limit: 15, waiters: [] },
    { id: 3, name: 'שלישי', time: '17:00', limit: 32, waiters: [] },
    { id: 4, name: 'רביעי', time: '17:00', limit: 22, waiters: [] },
    { id: 5, name: 'חמישי', time: '17:00', limit: 29, waiters: [] },
    { id: 6, name: 'שישי', time: '09:30', limit: 15, waiters: [] },
  ]
};

export async function GET() {
  try {
    const data = await kv.get('waiter_schedule');
    // מוודא שהנתונים קיימים ושיש להם את המבנה הנכון
    if (!data || !data.days) {
      await kv.set('waiter_schedule', INITIAL_DATA);
      return NextResponse.json(INITIAL_DATA);
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(INITIAL_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let currentData: any = await kv.get('waiter_schedule');
    
    if (!currentData || !currentData.days) {
      currentData = INITIAL_DATA;
    }

    let newData = { ...currentData };

    if (body.type === 'UPDATE_TITLE') {
      newData.title = body.title;
    } else {
      // הרשמה רגילה
      newData.days = currentData.days.map((day: any) => 
        day.name === body.day ? { ...day, waiters: [...(day.waiters || []), body.waiterName] } : day
      );
    }

    await kv.set('waiter_schedule', newData);
    return NextResponse.json(newData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}