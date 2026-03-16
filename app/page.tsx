"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Shield, MessageSquare, RotateCcw, AlertCircle } from 'lucide-react';

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
    
    const day = days.find(d => d.id === dayId);
    if (day.waiters.includes(userName)) return alert("אתה כבר רשום ליום זה");

    const updatedDays = days.map(day => {
      if (day.id === dayId && day.waiters.length < day.limit) {
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
  };

  const resetAll = async () => {
    if (!confirm("האם אתה בטוח שברצונך לאפס את כל הסידור?")) return;
    setLoading(true);
    await fetch('/api/schedule', { method: 'DELETE' });
    await fetchData();
  };

  const sendToWhatsApp = () => {
    let text = "*📋 סידור עבודה מלצרים - מתחם האירועים*\n\n";
    days.forEach(d => {
      text += `*📅 יום ${d.name} (${d.time}):*\n👥 ${d.waiters.join(", ") || "אין רשומים עדיין"}\n\n`;
    });
    text += "_עודכן אוטומטית דרך המערכת של יורי_";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-bold">טוען נתונים מהענן...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-800" dir="rtl">
      {/* כפתור כניסת מנהל מוצנע */}
      <button onClick={() => setIsAdmin(!isAdmin)} className="fixed top-4 left-4 bg-slate-200 text-slate-500 p-2 rounded-full hover:bg-slate-800 hover:text-white transition-all z-50">
        <Shield size={18} />
      </button>

      <div className="max-w-xl mx-auto pt-6 pb-20">
        {/* כותרת מעוצבת */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Waiter<span className="text-blue-600">App</span>
          </h1>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium italic">ניהול סידור עבודה - יורי</p>
        </header>

        {/* קלט שם משתמש - רק אם לא מנהל */}
        {!isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 mb-8 border border-white">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">פרטי זיהוי</h2>
            <input 
              type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="רשום כאן את שמך המלא..." 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-bold"
            />
          </div>
        )}

        {/* לוח בקרה למנהל */}
        {isAdmin && (
          <div className="bg-slate-900 p-6 rounded-2xl mb-8 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Shield size={18} className="text-blue-400" /> פאנל ניהול מערכת
            </h2>
            <div className="flex gap-3">
              <button onClick={sendToWhatsApp} className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl flex items-center gap-2 flex-1 justify-center font-bold transition-all active:scale-95">
                <MessageSquare size={18} /> וואטסאפ
              </button>
              <button onClick={resetAll} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl flex items-center gap-2 flex-1 justify-center font-bold transition-all active:scale-95 border border-red-500/20">
                <RotateCcw size={18} /> איפוס שבוע
              </button>
            </div>
          </div>
        )}

        {/* רשימת הימים */}
        <div className="grid gap-5">
          {days.map((day) => {
            const isFull = day.waiters.length >= day.limit;
            const isSignedUp = day.waiters.includes(userName);
            const remaining = day.limit - day.waiters.length;
            const progress = (day.waiters.length / day.limit) * 100;

            return (
              <div key={day.id} className={`group bg-white p-5 rounded-2xl shadow-md border-2 transition-all duration-300 ${isSignedUp ? 'border-green-500 bg-green-50/30' : 'border-transparent hover:border-blue-100 hover:shadow-lg'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-xl text-slate-800">יום {day.name}</h3>
                      {remaining <= 3 && remaining > 0 && !isFull && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertCircle size={10} /> נשארו רק {remaining} מקומות!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <span className="flex items-center gap-1"><Clock size={14} /> {day.time}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {day.waiters.length}/{day.limit}</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={isFull || isSignedUp || isAdmin || !userName}
                    onClick={() => signUp(day.id)}
                    className={`h-12 px-6 rounded-xl font-black transition-all active:scale-90 ${
                      isSignedUp ? "bg-green-500 text-white cursor-default" : 
                      isFull ? "bg-slate-100 text-slate-400 cursor-not-allowed" : 
                      !userName ? "bg-blue-100 text-blue-300 cursor-not-allowed" :
                      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300"
                    }`}
                  >
                    {isSignedUp ? <CheckCircle size={24} /> : isFull ? "מלא" : "הירשם"}
                  </button>
                </div>

                {/* פס התקדמות תפוסה */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${isFull ? 'bg-red-500' : progress > 80 ? 'bg-orange-400' : 'bg-blue-500'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* רשימת שמות קטנה למטה */}
                {day.waiters.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 transition-all">
                    {day.waiters.map((name: string, idx: number) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-100">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}