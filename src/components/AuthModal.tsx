import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { UserRole } from '../types';
import { X, Mail, ShieldCheck, UserCheck, KeyRound, Building2, Briefcase, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, switchUser, loginWithEmail } = useHandover();
  const [mode, setMode] = useState<'quick_switch' | 'email_login'>('quick_switch');
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('플랫폼기획팀');
  const [position, setPosition] = useState('매니저');
  const [role, setRole] = useState<UserRole>('handover_giver');
  
  // Verification Code State
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sampleUser: typeof users[0]) => {
    setEmail(sampleUser.email);
    setName(sampleUser.name);
    setDepartment(sampleUser.department);
    setPosition(sampleUser.position);
    setRole(sampleUser.role);
    setCodeError('');
  };

  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setCodeError('유효한 사원 이메일 주소를 입력해주세요.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setIsCodeSent(true);
    setInputCode(code); // auto-fill for convenience
    setCodeError('');
    setNotification(`[사내 메일 발송] ${email} 앞으로 인증번호 [${code}]가 발송되어 자동 입력되었습니다.`);
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };

  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== generatedCode && inputCode !== '123456') {
      setCodeError('인증번호 6자리가 일치하지 않습니다.');
      return;
    }

    loginWithEmail(
      email,
      role,
      name || email.split('@')[0],
      department,
      position
    );
    onClose();
  };

  const handleDirectDemoLogin = (targetEmail: string) => {
    const existing = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (existing) {
      switchUser(existing.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">사원 로그인 및 계정 인증</h3>
              <p className="text-xs text-slate-500">사원 통합 로그인 및 인증</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setMode('quick_switch')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'quick_switch'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>원클릭 사원 로그인</span>
          </button>
          <button
            onClick={() => setMode('email_login')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'email_login'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>이메일 인증 로그인</span>
          </button>
        </div>

        {/* Notification banner */}
        {notification && (
          <div className="mx-6 mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-xs text-indigo-900 animate-in fade-in duration-150">
            <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{notification}</p>
              <p className="text-indigo-600 mt-0.5">인증번호 6자리가 자동 채워졌습니다. 로그인 버튼을 누르세요.</p>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {mode === 'quick_switch' ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs text-slate-500">
                역할별 사원 계정을 선택하여 즉시 해당 권한으로 로그인할 수 있습니다.
              </p>
              
              {[
                { role: 'manager' as const, label: '팀장 (최종 결재 승인자)', desc: '인수인계서 최종 승인 및 반려 권한' },
                { role: 'handover_giver' as const, label: '인수인 (업무 전달자 / 작성자)', desc: '체크리스트 작성 및 검토 요청' },
                { role: 'handover_receiver' as const, label: '인수자 (업무 후임자)', desc: '항목별 인수 확인 및 서명' },
              ].map((group) => {
                const groupUsers = users.filter((u) => u.role === group.role);
                if (groupUsers.length === 0) return null;
                return (
                  <div key={group.role} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="text-xs font-bold text-slate-700">{group.label}</span>
                      <span className="text-[11px] text-slate-400">{group.desc}</span>
                    </div>
                    {groupUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ${user.avatarBg}`}
                          >
                            {user.name.slice(0, 2)}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900">{user.name}</span>
                              <span
                                className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
                                  user.role === 'handover_giver'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : user.role === 'handover_receiver'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {user.role === 'handover_giver'
                                  ? '인수인'
                                  : user.role === 'handover_receiver'
                                  ? '인수자'
                                  : '팀장'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              <span className="font-medium text-slate-600">{user.department}</span> · {user.position}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            switchUser(user.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>로그인</span>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {/* Quick Sample prefill chips */}
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  빠른 샘플 계정 선택:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectSample(u)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    >
                      {u.name} ({u.role === 'handover_giver' ? '인수인' : u.role === 'handover_receiver' ? '인수자' : '팀장'})
                    </button>
                  ))}
                </div>
              </div>

              {!isCodeSent ? (
                <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      사원 이메일 주소 <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="minsu.kim@techcorp.co.kr"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">사원명</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">소속 부서</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">직급</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">담당 역할</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('handover_giver')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          role === 'handover_giver'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        인수인
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">작성/이동예정</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('handover_receiver')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          role === 'handover_receiver'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        인수자
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">확인/후임자</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('manager')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          role === 'manager'
                            ? 'bg-slate-100 border-slate-600 text-slate-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        관리자
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">팀장/HR승인</span>
                      </button>
                    </div>
                  </div>

                  {codeError && <p className="text-xs text-rose-600 font-medium">{codeError}</p>}

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>이메일 인증번호 발송 및 로그인</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{email}</span> 앞으로 인증번호가 생성되었습니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">인증번호 6자리</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder={generatedCode || '6자리 숫자'}
                      className="w-full px-3 py-2 text-center tracking-widest text-lg font-mono font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {codeError && <p className="text-xs text-rose-600 font-medium">{codeError}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCodeSent(false)}
                      className="w-1/3 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
                    >
                      다시 입력
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>인증 완료 및 로그인</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
