"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, Shield, MessageSquare } from 'lucide-react';

export default function WaiterApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  
  // הגדרות ברירת מחדל למשמרות
  const [days, setDays] = useState<any[]>([
    { id: 1, name: 'ראשון', active: true, type: 'ערב', time: '17:00', limit: 25, waiters: [] },
    { id: 2, name: 'שני', active: true, type: 'ערב', time: '17:00', limit: 15, waiters: [] },
    { id: 3, name: 'שלישי', active: true, type: 'ערב', time: '17:00', limit: 32, waiters: [] },
    { id: 4, name: 'רביעי', active: true, type: 'ערב', time: '17:00', limit: 22, waiters: [] },
    { id: 5, name: 'חמישי', active: true, type: 'ערב', time: '17:00', limit: 29, waiters: [] },
    { id: 6, name: 'שישי', active: true, type: 'בוקר', time: '09:30', limit: 15, waiters: [] },
  ]);

  const signUp = (dayId: number) => {
    if (!userName.trim()) return alert("אנא הכנס שם מלא");
    setDays(days.map(day => {
      if (day.id === dayId && day.waiters.length < day.limit && !day.waiters.includes(userName)) {
        return { ...day, waiters: [...day.waiters, userName] };
      }
      return day;
    }));
    alert("נרשמת בהצלחה!");
  };

  const updateLimit = (id: number, newLimit: number) => {
    setDays(days.map(d => d.id === id ? { ...d, limit: newLimit } : d));
  };

  const sendToWhatsApp = () => {
    let text = "*סידור עבודה מלצרים:*\n\n";
    days.filter(d => d.active).forEach(d => {
      text += `*יום ${d.name} (${d.type} ${d.time}):*\n${d.waiters.join(", ") || "אין רשומים"}\n\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dir-rtl text-right" dir="rtl">
      {/* כפתור החלפת מצב למנהל - לצורך פיתוח בלבד */}
      <button onClick={() => setIsAdmin(!isAdmin)} className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100">
        <Shield size={20} />
      </button>

      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">סידור עבודה למלצרים</h1>
          <p className="text-gray-600">בחר משמרת והשתבץ בקלות</p>
        </header>

        {!isAdmin && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-blue-100">
            <label className="block text-sm font-bold mb-2">שם המלצר/ית:</label>
            <input 
              type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="הכנס שם מלא..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {isAdmin && (
          <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-yellow-800">מצב מנהל - עריכת מכסות</h2>
              <button onClick={sendToWhatsApp} className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
                <MessageSquare size={16} /> שלח רשימה לוואטסאפ
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {days.map((day) => (
            <div key={day.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">יום {day.name}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock size={14} /> {day.type} ב-{day.time}
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium mt-1">
                  <Users size={14} /> {day.waiters.length} / {day.limit} מלצרים
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <input 
                    type="number" value={day.limit} onChange={(e) => updateLimit(day.id, parseInt(e.target.value))}
                    className="w-16 p-2 border rounded text-center"
                  />
                ) : (
                  <button 
                    disabled={day.waiters.length >= day.limit || day.waiters.includes(userName)}
                    onClick={() => signUp(day.id)}
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
                      day.waiters.includes(userName) ? "bg-green-500" : 
                      day.waiters.length >= day.limit ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700 shadow-md"
                    }`}
                  >
                    {day.waiters.includes(userName) ? <CheckCircle size={20} /> : 
                     day.waiters.length >= day.limit ? "מלא" : "הירשם"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}