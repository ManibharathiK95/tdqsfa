import React from 'react';
import { DepartmentId, User, CompanySettings } from '../types';
import { DEPARTMENTS } from '../data/initialData';
import { CompanyLogo } from './CompanyLogo';
import {
  Building2,
  Compass,
  Layers,
  Calculator,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  companySettings: CompanySettings;
  activeDeptId: DepartmentId;
  onSelectDepartment: (deptId: DepartmentId) => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  companySettings,
  activeDeptId,
  onSelectDepartment,
  onOpenAdminModal,
  onLogout,
}) => {
  const getDeptIcon = (id: DepartmentId) => {
    switch (id) {
      case 'design':
        return <Compass className="w-4 h-4" />;
      case 'rebar':
        return <Layers className="w-4 h-4" />;
      case 'qs':
        return <Calculator className="w-4 h-4" />;
      case 'architecture':
        return <Building2 className="w-4 h-4" />;
      default:
        return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  // Restrict visible department tabs for non-admin users according to requirements:
  // "important dash board shows same for all - but inside as per account user, only that department, no other department shown"
  const visibleDepartments = DEPARTMENTS.filter((dept) => {
    if (currentUser.role === 'admin' || currentUser.departmentId === 'all') {
      return true;
    }
    return dept.id === currentUser.departmentId;
  });

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 text-white shadow-lg">
      {/* Top Bar: Company Branding + User Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center space-x-3">
            <CompanyLogo size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
                  {companySettings.companyName || 'Thulir Design & QS Services FZE'}
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                  F&amp;A ERP
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-300 mt-1">
                TDQS F&amp;A PORTAL • Financial &amp; Departmental Operations System
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Admin Settings Button */}
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold rounded-xl transition-all shadow-sm"
                title="Admin Settings & User PIN Management"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Admin Settings</span>
              </button>
            )}

            {/* Current User Badge */}
            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
              <div
                className={`w-7 h-7 rounded-lg ${
                  currentUser.role === 'admin' ? 'bg-emerald-600' : 'bg-emerald-700'
                } text-white flex items-center justify-center font-extrabold text-xs shadow-sm`}
              >
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-semibold text-emerald-400 capitalize">
                  {currentUser.role === 'admin' ? 'System Administrator' : `${currentUser.departmentId} Staff`}
                </p>
              </div>
            </div>

            {/* Log Out / Lock Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold rounded-xl transition-all shadow-sm"
              title="Lock Session / Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Department Tabs Bar */}
      <div className="bg-black border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {/* Overall Executive Dashboard */}
            <button
              onClick={() => onSelectDepartment('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeDeptId === 'all'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 border border-emerald-500'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Executive Dashboard (Overall)</span>
            </button>

            {/* Department-Specific Tabs (Filtered for specific user) */}
            {visibleDepartments.map((dept) => {
              const isActive = activeDeptId === dept.id;

              return (
                <button
                  key={dept.id}
                  onClick={() => onSelectDepartment(dept.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 border border-emerald-500'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                  }`}
                >
                  {getDeptIcon(dept.id)}
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
