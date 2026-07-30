import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { KeyRound, UserCheck, Shield } from 'lucide-react';

interface PinLoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const PinLogin: React.FC<PinLoginProps> = ({ users, onLoginSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<User>(
    () => users.find((u) => u.role === 'admin') || users[0]
  );
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Auto login check whenever pin changes
  useEffect(() => {
    if (pin.length === 4) {
      // First check if matching selected user pin
      if (pin === selectedUser.pin) {
        onLoginSuccess(selectedUser);
        return;
      }
      // Or check if matching any other user pin
      const matchedUser = users.find((u) => u.pin === pin);
      if (matchedUser) {
        onLoginSuccess(matchedUser);
        return;
      }

      // If 4 digits entered and no user matched
      setErrorMsg('Incorrect 4-digit Security PIN. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  }, [pin, selectedUser, users, onLoginSuccess]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setErrorMsg(null);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setPin('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Forest Green Glow Accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-800/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-emerald-950/20 p-6 sm:p-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <CompanyLogo size="xl" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            TDQS F&amp;A PORTAL
          </h1>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            Thulir Design &amp; QS Services FZE
          </p>
          <p className="text-xs text-zinc-300 mt-0.5">
            Financial &amp; Accounting ERP Management System
          </p>
        </div>

        {/* User Selection Chips */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2.5">
            Select User Account:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {users.map((u) => {
              const isSelected = u.id === selectedUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-200'
                    } flex items-center justify-center font-bold text-xs shrink-0 shadow`}
                  >
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-tight text-white">{u.name}</p>
                    <p className="text-[11px] text-zinc-300 capitalize truncate mt-0.5">
                      {u.role === 'admin' ? 'System Admin' : u.departmentId}
                    </p>
                  </div>
                  {isSelected && <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Dots Indicator */}
        <div className={`mb-6 text-center ${isShaking ? 'animate-bounce' : ''}`}>
          <div className="text-xs font-semibold text-zinc-200 mb-2 flex items-center justify-center space-x-1.5">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>Enter 4-Digit Security PIN (Auto-Login)</span>
          </div>

          <div className="flex justify-center items-center space-x-3.5 my-3.5">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                    isFilled
                      ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50'
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-300 mt-2 bg-rose-950/70 border border-rose-800/80 rounded-lg py-1.5 px-3">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Keypad Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-zinc-900 hover:bg-emerald-800 active:bg-emerald-700 border border-zinc-800 active:scale-95 text-xl font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center tracking-wider"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-zinc-900 hover:bg-emerald-800 active:bg-emerald-700 border border-zinc-800 active:scale-95 text-xl font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-sm font-bold rounded-xl transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] font-medium text-zinc-300 flex items-center justify-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected Enterprise Portal • Thulir Design &amp; QS Services FZE</span>
          </p>
        </div>
      </div>
    </div>
  );
};
