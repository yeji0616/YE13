import React, { useState } from 'react';
import { useHandover, NavigationTab } from '../context/HandoverContext';
import { AuthModal } from './AuthModal';
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardCheck,
  FileSpreadsheet,
  FileCheck2,
  Plus,
  RotateCcw,
  User,
  Shield,
  ChevronDown,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onNewHandoverClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewHandoverClick }) => {
  const {
    currentUser,
    users,
    switchUser,
    isLoggedIn,
    isAuthModalOpen,
    openLoginModal,
    closeLoginModal,
    logout,
    activeTab,
    setActiveTab,
    unresolvedFeedbackCount,
    pendingApprovalCount,
    resetToDemoData,
    activeDocument,
  } = useHandover();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'editor',
      label: '체크리스트 & 확인',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'approval',
      label: '인수인계서',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
    },
    {
      id: 'dashboard',
      label: '전체 현황',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner / Corporate Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-indigo-300 font-medium">
            <Shield className="w-3.5 h-3.5" /> 업무 인수인계 관리 시스템
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            체크리스트 확인 및 인수인계서 결재
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={openLoginModal}
            className="flex items-center gap-1 text-slate-300 hover:text-indigo-300 transition-colors"
            title="사원 로그인 및 계정 인증"
          >
            <LogIn className="w-3 h-3 text-indigo-400" />
            <span>{isLoggedIn ? '계정 전환 / 로그인' : '사원 로그인'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              if (window.confirm('데모 기본 데이터(인수인계서 2건, 표준 템플릿 4종)로 초기화하시겠습니까?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="테스트용 원본 데이터로 리셋"
          >
            <RotateCcw className="w-3 h-3" />
            <span>데이터 초기화</span>
          </button>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Current Doc indicator */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => setActiveTab('editor')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group shrink-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div className="shrink-0">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight whitespace-nowrap block">
                  업무 인수인계 체크리스트
                </span>
                <p className="text-[11px] text-slate-500 font-normal leading-none mt-0.5 whitespace-nowrap">
                  체크리스트 확인 & 최종 승인
                </p>
              </div>
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 whitespace-nowrap ${
                        item.id === 'approval'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Login Button & New Button & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Standalone Explicit Login Button */}
            <button
              id="header-login-button"
              onClick={openLoginModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                !isLoggedIn
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-sm'
                  : 'border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-600'
              }`}
              title="사원 로그인 및 계정 인증"
            >
              <LogIn className={`w-4 h-4 ${!isLoggedIn ? 'text-white' : 'text-indigo-600'}`} />
              <span>로그인</span>
            </button>

            <button
              onClick={onNewHandoverClick}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">새 인수인계서</span>
              <span className="sm:hidden">작성</span>
            </button>

            {/* User Account / Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <div
                  className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs ${
                    isLoggedIn ? currentUser.avatarBg : 'bg-slate-400'
                  }`}
                >
                  {isLoggedIn ? currentUser.name.slice(0, 2) : '게'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">
                      {isLoggedIn ? currentUser.name : '게스트'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        !isLoggedIn
                          ? 'bg-slate-100 text-slate-600'
                          : currentUser.role === 'handover_giver'
                          ? 'bg-indigo-100 text-indigo-800'
                          : currentUser.role === 'handover_receiver'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {!isLoggedIn
                        ? '미로그인'
                        : currentUser.role === 'handover_giver'
                        ? '인수인'
                        : currentUser.role === 'handover_receiver'
                        ? '인수자'
                        : '관리자'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate max-w-[110px]">
                    {isLoggedIn ? currentUser.position : '로그인 필요'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isLoggedIn ? '현재 접속 계정' : '접속 상태'}
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {isLoggedIn ? `${currentUser.name} (${currentUser.email})` : '게스트 (로그인되지 않음)'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isLoggedIn ? `${currentUser.department} · ${currentUser.position}` : '인수인계 관리 권한을 위해 로그인하세요.'}
                    </p>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {/* Role groupings: Managers first, then Givers, then Receivers */}
                    {[
                      { role: 'manager' as const, title: '팀장 (결재 승인권자)', badgeBg: 'bg-purple-100 text-purple-800' },
                      { role: 'handover_giver' as const, title: '인수인 (업무 전달자)', badgeBg: 'bg-indigo-100 text-indigo-800' },
                      { role: 'handover_receiver' as const, title: '인수자 (업무 후임자)', badgeBg: 'bg-emerald-100 text-emerald-800' },
                    ].map((group) => {
                      const groupUsers = users.filter((u) => u.role === group.role);
                      if (groupUsers.length === 0) return null;
                      return (
                        <div key={group.role} className="py-1.5 first:pt-1 last:pb-1">
                          <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>{group.title}</span>
                            <span className="text-[9px] font-semibold text-slate-400">{groupUsers.length}명</span>
                          </p>
                          {groupUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                switchUser(u.id);
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                isLoggedIn && u.id === currentUser.id
                                  ? 'bg-indigo-50 text-indigo-900 font-bold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    u.role === 'handover_giver'
                                      ? 'bg-indigo-500'
                                      : u.role === 'handover_receiver'
                                      ? 'bg-emerald-500'
                                      : 'bg-purple-600'
                                  }`}
                                />
                                <div className="truncate">
                                  <span className="font-semibold">{u.name}</span>{' '}
                                  <span className="text-slate-400 text-[10px]">
                                    ({u.department} · {u.position.split('/')[0].trim()})
                                  </span>
                                </div>
                              </div>
                              {isLoggedIn && u.id === currentUser.id && (
                                <span className="text-[10px] text-indigo-600 font-bold shrink-0 ml-1">접속중</span>
                              )}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        openLoginModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>이메일 로그인 / 사원 인증</span>
                    </button>

                    {isLoggedIn && (
                      <button
                        onClick={() => {
                          logout();
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>로그아웃</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
