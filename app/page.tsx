"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Shield, Edit2, X, RotateCcw, Save } from 'lucide-react';

export default function WaiterApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/schedule');
      const result = await response.json();
      setData(result);
      setNewTitle(result.title);
    } catch (e) { console.error("טעינה נכשלה"); }
    setLoading(false);
  };

  const addWaiter = async (dayName: string) => {
    if (!userName.trim()) return alert("נא להזין שם");
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waiterName: userName, day: dayName }),
    });
    setData(await response.json());
    setUserName('');
  };

  const updateTitle = async () => {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'UPDATE_TITLE', title: newTitle }),
    });
    setData(await response.json());
    setIsEditingTitle(false);
  };

  const toggleAdmin = () => {
    if (!isAdmin) {
      const pass = prompt("הכנס סיסמת מנהל:");
      if (pass === "0908") setIsAdmin(true);
      else if (pass !== null) alert("סיסמה שגויה");
    } else {
      setIsAdmin(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-amber-600">טוען מערכת...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-b-8 border-amber-500 relative">
          <div className="absolute top-4 left-4">
             <button onClick={toggleAdmin} className={`${isAdmin ? 'text-amber-600' : 'text-gray-300'}`}>
                <Shield size={22} />
             </button>
          </div>
          <div className="text-center">
            {isEditingTitle ? (
              <div className="flex gap-2 justify-center items-center">
                <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} className="border-2 border-amber-200 rounded-xl px-4 py-2 text-xl font-bold text-center" />
                <button onClick={updateTitle} className="bg-green-500 text-white p-2 rounded-xl"><CheckCircle size={24} /></button>
              </div>
            ) : (
              <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
                {data?.title}
                {isAdmin && <Edit2 size={20} className="cursor-pointer text-gray-400" onClick={()=>setIsEditingTitle(true)} />}
              </h1>
            )}
            <p className="text-amber-600 mt-3 font-bold tracking-widest uppercase text-sm">Luxury Events Complex</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-10 border-2 border-amber-100">
          <input
            placeholder="מה השם שלך?"
            value={userName}
            onChange={(e)=>setUserName(e.target.value)}
            className="w-full bg-transparent px-6 py-4 text-xl font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-8">
          {data?.days.map((day: any) => {
            const isFull = day.waiters.length >= day.limit;
            const progress = (day.waiters.length / day.limit) * 100;
            return (
              <div key={day.id} className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-slate-800">יום {day.name}</h2>
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl font-bold border border-amber-100">
                      <Clock size={18} /> {day.time}
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="h-6 bg-slate-100 rounded-full p-1 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${progress > 85 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {day.waiters.map((w: string, i: number) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 text-amber-900 px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div> {w}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addWaiter(day.name)}
                    disabled={isFull}
                    className={`w-full py-5 rounded-2xl font-black text-2xl shadow-xl flex items-center justify-center gap-3 ${
                      isFull ? 'bg-slate-100 text-slate-400' : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {isFull ? <X size={28} /> : <Users size={28} />}
                    {isFull ? 'ההרשמה הסתיימה' : 'אני רוצה להירשם'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}