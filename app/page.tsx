"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Shield, MessageSquare, RotateCcw } from 'lucide-react';

export default function WaiterApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/schedule');
      const data = await response.json();
      setDays(data);
    } catch (e) {
      console.error("טעינה נכשלה");
    }
    setLoading(false);
  };

  const signUp = async (dayId: number) => {
    if (!userName.trim()) return alert("אנא הכנס שם מלא");
    
    const updatedDays = days.map(day => {
      if (day.id === dayId && day.waiters.length < day.limit && !day.waiters.includes(userName)) {
        return { ...day, waiters: [...day.waiters, userName] };
      }
      return day;
    });

    setDays(updatedDays);
    
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayId, userName }),
    });
    
    alert("נרשמת בהצלחה!");
  };

  const resetAll = async () => {
    if (!confirm("האם אתה בטוח שברצונך לאפס את כל הסידור?")) return;
    setLoading(true);
    await fetch('/api/schedule', { method: 'DELETE' });
    await fetchData();
  };

  const sendToWhatsApp = () => {
    let text = "*סידור עבודה מלצרים:*\n\n";
    days.forEach(d => {
      text += `*יום ${d.name} (${d.time}):*\n${d.waiters.join(", ") || "אין רשומים"}\n\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (loading) return <div className="p-10 text-center font-bold">טוען נתונים מהענן...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <button onClick={() => setIsAdmin(!isAdmin)} className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full opacity-40 hover:opacity-100">
        <Shield size={20} />
      </button>

      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">סידור עבודה - יורי</h1>
          <p className="text-gray-600">מתחם האירועים</p>
        </header>

        {!isAdmin && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-blue-100">
            <label className="block text-sm font-bold mb-2">שם המלצר/ית:</label>
            <input 
              type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="הכנס שם מלא..." className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {isAdmin && (
          <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200 flex justify-between gap-2">
            <button onClick={sendToWhatsApp} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center">
              <MessageSquare size={18} /> שלח בוואטסאפ
            </button>
            <button onClick={resetAll} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center">
              <RotateCcw size={18} /> איפוס שבוע
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {days.map((day) => (
            <div key={day.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">יום {day.name}</h3>
                <div className="text-gray-500 text-sm">{day.time} | מקומות: {day.limit}</div>
                <div className="text-blue-600 font-medium mt-1">
                  <Users size={14} className="inline ml-1" /> {day.waiters.length} רשומים
                </div>
              </div>
              <button 
                disabled={day.waiters.length >= day.limit || day.waiters.includes(userName) || isAdmin}
                onClick={() => signUp(day.id)}
                className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
                  day.waiters.includes(userName) ? "bg-green-500" : 
                  day.waiters.length >= day.limit ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {day.waiters.includes(userName) ? <CheckCircle size={20} /> : "הירשם"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}