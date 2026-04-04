import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const getInitialData = (id: string) => ({
  title: "סידור עבודה",
  bg_color: "#ffffff",
  text_color: "#000000",
  days: [
    { id: 1, name: 'ראשון', time: '17:00', limit: 25, waiters: [] },
    { id: 2, name: 'שני', time: '17:00', limit: 15, waiters: [] },
    { id: 3, name: 'שלישי', time: '17:00', limit: 32, waiters: [] },
    { id: 4, name: 'רביעי', time: '17:00', limit: 22, waiters: [] },
    { id: 5, name: 'חמישי', time: '17:00', limit: 29, waiters: [] },
    { id: 6, name: 'שישי', time: '09:30', limit: 15, waiters: [] },
  ]
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('room') || 'default';
  const data: any = await kv.get(`schedule_${roomId}`);
  return NextResponse.json(data || getInitialData(roomId));
}

export async function POST(request: Request) {
  const body = await request.json();
  const roomId = body.roomId || 'default';
  let data: any = await kv.get(`schedule_${roomId}`) || getInitialData(roomId);

  if (body.type === 'ADMIN_UPDATE') {
    data = { ...data, ...body.payload };
  } else if (body.type === 'RESET_DAY') {
    data.days = data.days.map((d: any) => d.id === body.dayId ? { ...d, waiters: [] } : d);
  } else if (body.type === 'REGISTER') {
    data.days = data.days.map((d: any) => 
      d.name === body.dayName ? { ...d, waiters: [...d.waiters, body.waiterName] } : d
    );
  }

  await kv.set(`schedule_${roomId}`, data);
  return NextResponse.json(data);
}