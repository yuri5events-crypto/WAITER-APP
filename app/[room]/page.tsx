"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, Shield, Edit2, X, RotateCcw, Save, Palette, Settings } from 'lucide-react';

export default function WaiterApp() {
  const [roomId, setRoomId] = useState('1'); // ברירת מחדל חדר 1
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDayId, setEditDayId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('r') || '1';
    setRoomId(room);
    const savedName = localStorage.getItem('waiter_name');
    if (savedName) setUserName(savedName);
    fetchData(room);
  }, []);

  const fetchData = async (r: string) => {
    const res = await fetch(`/api/schedule?room=${r}`);
    setData(await res.json());
    setLoading(false);
  };

  const handleAdminUpdate = async (payload: any) => {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADMIN_UPDATE', roomId, payload }),
    });
    setData(await res.json());
    setEditDayId(null);
  };

  const register = async (dayName: string) => {
    if (!userName.trim()) return alert("נא להזין שם");
    localStorage.setItem('waiter_name', userName);
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'REGISTER', roomId, dayName, waiterName: userName }),
    });
    setData(await res.json());
  };

  const resetDay = async (dayId: number) => {
    if (!confirm("לאפס את כל הרשומים ליום זה?")) return;
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'RESET_DAY', roomId, dayId }),
    });
    setData(await res.json());
  };

  if (loading) return <div className="p-10 text-center">טוען...</div>;

  return (
    <div style={{ backgroundColor: data.bg_color || '#ffffff', color: data.text_color || '#000000' }} className="min-h-screen py-8 px-4 font-sans transition-colors duration-500" dir="rtl">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 relative border-b pb-6 border-gray-200">
           <button onClick={() => {
             const p = prompt("סיסמה:");
             if(p === "0908") setIsAdmin(!isAdmin);
           }} className="absolute left-0 top-0 opacity-20 hover:opacity-100 transition-opacity">
             <Shield size={20} />
           </button>
           
           {isAdmin ? (
             <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 mb-4 text-black">
                <p className="font-bold text-sm">ניהול כותרת וצבעים:</p>
                <input className="w-full p-2 border rounded" value={data.title} onChange={(e) => handleAdminUpdate({ title: e.target.value })} placeholder="כותרת" />
                <div className="flex gap-4 justify-center">
                   <label className="text-xs">רקע: <input type="color" value={data.bg_color} onChange={(e) => handleAdminUpdate({ bg_color: e.target.value })} /></label>
                   <label className="text-xs">טקסט: <input type="color" value={data.text_color} onChange={(e) => handleAdminUpdate({ text_color: e.target.value })} /></label>
                </div>
                <div className="flex justify-center gap-2">
                   {[1,2,3,4].map(num => (
                     <button key={num} onClick={() => window.location.href = `?r=${num}`} className={`px-3 py-1 rounded text-xs ${roomId === String(num) ? 'bg-black text-white' : 'bg-gray-200'}`}>חדר {num}</button>
                   ))}
                </div>
             </div>
           ) : (
             <h1 className="text-4xl font-light tracking-tight">{data.title}</h1>
           )}
        </div>

        {/* Input */}
        <div className="mb-10">
          <input
            placeholder="הכנס שם מלא"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-gray-300 py-3 text-2xl text-center focus:border-black outline-none transition-colors"
          />
        </div>

        {/* List */}
        <div className="space-y-12">
          {data.days.map((day: any) => {
            const isFull = day.waiters.length >= day.limit;
            const isRegistered = day.waiters.includes(userName);

            return (
              <div key={day.id} className="group border-b border-gray-100 pb-8 last:border-0">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-2xl font-medium">יום {day.name}</h2>
                    <p className="text-sm opacity-60 flex items-center gap-1"><Clock size={14}/> {day.time}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-widest opacity-40">מקומות שנותרו</p>
                    <p className={`text-2xl font-light ${isFull ? 'text-red-500' : ''}`}>{day.limit - day.waiters.length}</p>
                  </div>
                </div>

                {/* Admin Row */}
                {isAdmin && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 flex flex-wrap gap-2 items-center text-black">
                     <input type="text" className="w-20 p-1 text-xs border rounded" value={day.time} onChange={(e) => {
                        const newDays = data.days.map((d: any) => d.id === day.id ? {...d, time: e.target.value} : d);
                        handleAdminUpdate({ days: newDays });
                     }} />
                     <input type="number" className="w-14 p-1 text-xs border rounded" value={day.limit} onChange={(e) => {
                        const newDays = data.days.map((d: any) => d.id === day.id ? {...d, limit: parseInt(e.target.value)} : d);
                        handleAdminUpdate({ days: newDays });
                     }} />
                     <button onClick={() => resetDay(day.id)} className="text-red-500 p-1 hover:bg-red-100 rounded"><RotateCcw size={16}/></button>
                     <div className="w-full text-[10px] opacity-60">רשומים: {day.waiters.join(', ') || 'אין'}</div>
                  </div>
                )}

                <button
                  onClick={() => register(day.name)}
                  disabled={isFull || isRegistered || !userName}
                  className={`w-full py-4 rounded-full border-2 transition-all font-bold ${
                    isRegistered ? 'bg-black text-white border-black' : 
                    isFull ? 'border-gray-200 text-gray-300' : 
                    'border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {isRegistered ? 'אתה רשום' : isFull ? 'ההרשמה נסגרה' : 'הירשם ליום זה'}
                </button>
              </div>
            );
          })}
        </div>

        <footer className="mt-20 py-10 border-t border-gray-100 text-center">
           <p className="text-[10px] opacity-30 tracking-[0.2em] font-light">
             מערכת ניהול צוות | בניה ופיתוח: בנימינוב יורי
           </p>
        </footer>
      </div>
    </div>
  );
}