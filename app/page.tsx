"use client";
import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Shield, RotateCcw, Edit2, Save, X, Trophy } from 'lucide-react';

export default function WaiterApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ limit: 0, time: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/schedule');
      const result = await response.json();
      setData(result);
      setNewTitle(result.title);
    } catch (e) { console.error("שגיאה בטעינה"); }
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

  if (loading) return <div className="flex justify-center items-center h-screen font-bold">טוען מערכת...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 dir-rtl" dir="rtl">
      <div className="max-w-2xl mx-auto">
        
        {/* כותרת דינמית */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-b-4 border-amber-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
             <button onClick={toggleAdmin} className={`${isAdmin ? 'text-amber-600' : 'text-gray-300'} hover:text-amber-500`}>
                <Shield size={20} />
             </button>
          </div>
          
          <div className="text-center">
            {isEditingTitle ? (
              <div className="flex gap-2 justify-center">
                <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} className="border-2 border-amber-200 rounded-xl px-4 py-1 text-xl font-bold focus:outline-none focus:border-amber-500" />
                <button onClick={updateTitle} className="bg-green-500 text-white p-2 rounded-xl"><CheckCircle /></button>
              </div>
            ) : (
              <h1 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
                {data?.title}
                {isAdmin && <Edit2 size={18} className="cursor-pointer text-gray-400" onClick={()=>setIsEditingTitle(true)} />}
              </h1>
            )}
            <p className="text-gray-500 mt-2 font-medium">מתחם אירועים יוקרתי - ניהול סידור עבודה</p>
          </div>
        </div>

        {/* הזנת שם */}
        <div className="bg-amber-500 rounded-2xl p-4 mb-8 shadow-lg flex gap-3">
          <input
            placeholder="מה השם שלך?"
            value={userName}
            onChange={(e)=>setUserName(e.target.value)}
            className="flex-1 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none shadow-inner"
          />
        </div>

        {/* רשימת ימים */}
        <div className="space-y-6">
          {data?.days.map((day: any) => {
            const isFull = day.waiters.length >= day.limit;
            const progress = (day.waiters.length / day.limit) * 100;
            
            return (
              <div key={day.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">יום {day.name}</h2>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">
                      <Clock size={16} /> {day.time}
                    </div>
                  </div>

                  {/* פס התקדמות פסיכולוגי */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className={progress > 80 ? 'text-red-500 animate-pulse' : 'text-amber-600'}>
                        {progress > 90 ? '🔥 מקומות אחרונים בהחלט!' : 'סטטוס הרשמה:'}
                      </span>
                      {isAdmin && <span className="text-slate-400">{day.waiters.length}/{day.limit}</span>}
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${progress > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* רשימת המלצרים */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {day.waiters.map((w: string, i: number) => (
                      <span key={i} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div> {w}
                      </span>
                    ))}
                    {day.waiters.length === 0 && <span className="text-slate-300 italic text-sm">היה הראשון להירשם...</span>}
                  </div>

                  <button
                    onClick={() => addWaiter(day.name)}
                    disabled={isFull}
                    className={`w