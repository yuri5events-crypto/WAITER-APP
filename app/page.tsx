"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Shield, MessageSquare, RotateCcw, AlertCircle, Edit2, Save, X } from 'lucide-react';

export default function WaiterApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ limit: 0, time: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/schedule');
      const data = await response.json();
      setDays(data);
    } catch (e) { console.error("טעינה נכשלה"); }
    setLoading(false);
  };

  const toggleAdmin = () => {
    if (!isAdmin) {
      const password = prompt("הכנס סיסמת מנהל:");
      if (password === "0908") {
        setIsAdmin(true);
      } else if (password !== null) {
        alert("סיסמה שגויה!");
      }
    } else {
      setIsAdmin(false);
      setEditingDay(null);
    }
  };

  const signUp = async (dayId: number) => {
    if (!userName.trim()) return alert("אנא הכנס שם מלא");
    const day = days.find(d => d.id === dayId);
    if (day.waiters.includes(userName)) return alert("אתה כבר רשום ליום זה");

    const updatedDays = days.map(d => d.id === dayId ? { ...d, waiters: [...d.waiters, userName] } : d);
    setDays(updatedDays);
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayId, userName }),
    });
  };

  const startEdit = (day: any) => {
    setEditingDay(day.id);
    setEditForm({ limit: day.limit, time: day.time });
  };

  const saveEdit = async (dayId: number) => {
    const updatedDays = days.map(d => d.id === dayId ? { ...d, limit: editForm.limit, time: editForm.time } : d);
    setDays(updatedDays);
    setEditingDay(null);
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'UPDATE_DAY', dayId, limit: editForm.limit, time: editForm.time }),
    });
  };

  const resetAll = async () => {
    if (!confirm("לאפס את כל הסידור?")) return;
    setLoading(true);
    await fetch('/api/schedule', { method: 'DELETE' });
    await fetchData();
  };

  const sendToWhatsApp = () => {
    let text = "*📋 סידור עבודה מלצרים - מתחם האירועים*\n\n";
    days.forEach(d => { text += `*📅 יום ${d.name} (${d.time}):*\n👥 ${d.waiters.join(", ") || "אין רשומים"}\n\n`; });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-800" dir="rtl">
      <button onClick={toggleAdmin} className={`fixed top-4 left-4 p-2 rounded-full transition-all z-50 shadow-md ${isAdmin ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
        <Shield size={18} />
      </button>

      <div className="max-w-xl mx-auto pt-6 pb-20">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight italic">
            Waiter<span className="text-blue-600">App</span>
          </h1>
          <p className="text-slate-500 font-bold">ניהול סידור עבודה - יורי</p>
        </header>

        {!isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 mb-8 border border-white">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">פרטי זיהוי</h2>
            <input 
              type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="רשום כאן את שמך המלא..." 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-lg font-bold transition-all"
            />
          </div>
        )}

        {isAdmin && (
          <div className="bg-slate-900 p-6 rounded-2xl mb-8 shadow-2xl text-white animate-in slide-in-from-top-4 duration-300">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Shield size={18} className="text-blue-400"/> פאנל ניהול (סיסמה מאושרת)</h3>
            <div className="flex gap-3">
              <button onClick={sendToWhatsApp} className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl flex-1 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"><MessageSquare size={18}/> שלח וואטסאפ</button>
              <button onClick={resetAll} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl flex-1 font-bold border border-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"><RotateCcw size={18}/> איפוס שבוע</button>
            </div>
          </div>
        )}

        <div className="grid gap-5">
          {days.map((day) => {
            const isFull = day.waiters.length >= day.limit;
            const isSignedUp = day.waiters.includes(userName);
            const remaining = day.limit - day.waiters.length;
            const progress = (day.waiters.length / day.limit) * 100;

            return (
              <div key={day.id} className={`bg-white p-5 rounded-2xl shadow-md border-2 transition-all duration-300 ${isSignedUp ? 'border-green-500 bg-green-50/30' : 'border-transparent'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-xl">יום {day.name}</h3>
                      {isAdmin && (
                        <button onClick={() => startEdit(day)} className="text-blue-500 p-1 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16}/></button>
                      )}
                      {remaining <= 3 && remaining > 0 && !isFull && !isAdmin && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 border border-orange-200">
                          <AlertCircle size={10}/> נשארו {remaining}!
                        </span>
                      )}
                    </div>
                    
                    {editingDay === day.id ? (
                      <div className="flex items-center gap-2 mt-2 bg-blue-50 p-2 rounded-lg animate-in zoom-in-95 duration-200">
                        <input type="text" className="border rounded px-2 py-1 w-24 text-sm font-bold outline-blue-500" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} />
                        <input type="number" className="border rounded px-2 py-1 w-16 text-sm font-bold outline-blue-500" value={editForm.limit} onChange={e => setEditForm({...editForm, limit: parseInt(e.target.value)})} />
                        <button onClick={() => saveEdit(day.id)} className="bg-green-600 text-white p-2 rounded-lg shadow-sm hover:bg-green-700"><Save size={16}/></button>
                        <button onClick={() => setEditingDay(null)} className="bg-white text-slate-400 p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><X size={16}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"><Clock size={14} /> {day.time}</span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"><Users size={14} /> {day.waiters.length}/{day.limit}</span>
                      </div>
                    )}
                  </div>
                  
                  {!isAdmin && (
                    <button 
                      disabled={isFull || isSignedUp || !userName}
                      onClick={() => signUp(day.id)}
                      className={`h-12 px-6 rounded-xl font-black transition-all active:scale-95 ${
                        isSignedUp ? "bg-green-500 text-white" : 
                        isFull ? "bg-slate-100 text-slate-400 cursor-not-allowed" : 
                        !userName ? "bg-blue-100 text-blue-300 cursor-not-allowed" :
                        "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300"
                      }`}
                    >
                      {isSignedUp ? <CheckCircle size={24} /> : isFull ? "מלא" : "הירשם"}
                    </button>
                  )}
                </div>

                {/* פס תפוסה */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${isFull ? 'bg-red-500' : progress > 80 ? 'bg-orange-400' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* רשימת רשומים */}
                {day.waiters.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in duration-500">
                    {day.waiters.map((name: string, idx: number) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm transition-all hover:bg-white">
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