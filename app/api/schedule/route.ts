import { createClient } from 'redis';
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
  const client = createClient({ url: process.env.REDIS_URL });
  try {
    await client.connect();
    let data = await client.get('waiter_schedule');
    if (!data) {
      await client.set('waiter_schedule', JSON.stringify(INITIAL_DATA));
      return NextResponse.json(INITIAL_DATA);
    }
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(INITIAL_DATA);
  } finally {
    await client.disconnect();
  }
}

export async function POST(request: Request) {
  const client = createClient({ url: process.env.REDIS_URL });
  try {
    const { dayId, userName } = await request.json();
    await client.connect();
    const rawData = await client.get('waiter_schedule');
    const data = rawData ? JSON.parse(rawData) : INITIAL_DATA;
    
    const updatedData = data.map((day: any) => {
      if (day.id === dayId && !day.waiters.includes(userName) && day.waiters.length < day.limit) {
        return { ...day, waiters: [...day.waiters, userName] };
      }
      return day;
    });

    await client.set('waiter_schedule', JSON.stringify(updatedData));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  } finally {
    await client.disconnect();
  }
}

export async function DELETE() {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  await client.set('waiter_schedule', JSON.stringify(INITIAL_DATA));
  await client.disconnect();
  return NextResponse.json({ success: true });
}