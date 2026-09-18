import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { HandoverStatus } from '../types';
import {
  HANDOVER_STATUS_META,
  calculateProgress,
  getDocumentStats,
} from '../utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Plus,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Search,
  Filter,
  LogIn,
} from 'lucide-react';

interface DashboardProps {
  onNewHandoverClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewHandoverClick }) => {
  const {
    documents,
    currentUser,
    isLoggedIn,
    openLoginModal,
    setActiveDocumentId,
    setActiveTab,
    unresolvedFeedbackCount,
    pendingReviewCount,
    pendingApprovalCount,
  } = useHandover();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Overall metric aggregations
  const totalDocs = documents.length;
  const allItems = documents.flatMap((d) => d.items);
  const aggregateProgress = calculateProgress(allItems);

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter =
      statusFilter === 'all' ? true : doc.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.giverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.receiverName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role-adaptive Greeting & Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-48 h-48 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {isLoggedIn ? (
                    <>
                      현재 접속: {currentUser.name} (
                      {currentUser.role === 'handover_giver'
                        ? '인수인 · 퇴사/부서이동'
                        : currentUser.role === 'handover_receiver'
                        ? '인수자 · 신규후임'
                        : '관리자 · 팀장/HR'}
                      )
                    </>
                  ) : (
                    '게스트 모드 (로그인 필요)'
                  )}
                </span>
              </div>

              <button
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 text-xs font-bold transition-all border border-indigo-400/30 cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-indigo-300" />
                <span>{isLoggedIn ? '계정 전환 / 로그인' : '사원 로그인'}</span>
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug break-keep sm:leading-tight">
              {isLoggedIn ? (
                currentUser.role === 'handover_giver'
                  ? `${currentUser.name} 님, 체계적인 인수인계로 업무 공백을 제로화하세요.`
                  : currentUser.role === 'handover_receiver'
                  ? `${currentUser.name} 님, 후임 인수인계 항목을 꼼꼼히 확인하고 피드백을 남기세요.`
                  : `${currentUser.name} 팀장님, 팀원들의 인수인계 진행률을 검토하고 승인하세요.`
              ) : (
                '업무 인수인계 체크리스트에 오신 것을 환영합니다.'
              )}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-normal lg:whitespace-nowrap">
              {isLoggedIn
                ? '표준 카테고리(정기 업무, 진행 프로젝트, 중요 문서/계정, 외부 연락처) 기반 체크리스트 관리 및 공식 전자결재 PDF 출력을 지원합니다.'
                : '사원 이메일 또는 원클릭 데모 계정으로 로그인하여 인수인계서를 작성, 검토, 결재 승인할 수 있습니다.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('editor')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>체크리스트 확인하기</span>
            </button>
            <button
              onClick={onNewHandoverClick}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-colors border border-white/10 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 인수인계서</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Docs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              진행 중 인수인계서
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalDocs}</span>
              <span className="text-xs text-slate-500 font-medium">건 등록됨</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="text-indigo-600 font-bold">{pendingReviewCount}건</span> 확인중
              <span className="text-slate-300">·</span>
              <span className="text-amber-600 font-bold">{pendingApprovalCount}건</span> 승인대기
            </div>
          </div>
        </div>

        {/* Card 2: Giver Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              인수인 작성 완료율
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {aggregateProgress.giverProgressRate}%
              </span>
              <span className="text-xs text-slate-400">
                ({aggregateProgress.giverCompletedCount} / {aggregateProgress.total} 항목)
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${aggregateProgress.giverProgressRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Receiver Confirmed Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              인수자 확인 완료율
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {aggregateProgress.receiverProgressRate}%
              </span>
              <span className="text-xs text-slate-400">
                ({aggregateProgress.receiverConfirmedCount} / {aggregateProgress.total} 항목)
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${aggregateProgress.receiverProgressRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Unresolved Feedbacks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              미처리 피드백 알림
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                unresolvedFeedbackCount > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  unresolvedFeedbackCount > 0 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {unresolvedFeedbackCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">건 질문/보완 대기</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {unresolvedFeedbackCount > 0
                ? '인수자의 보완 질의가 대기 중입니다'
                : '모든 댓글 피드백이 처리되었습니다'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Document List Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>인수인계 목록</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredDocs.length}건
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              진행 상태별 인수인계서와 각 당사자 간 진행률을 확인하세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="제목, 부서, 사원명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 w-full sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter('reviewing')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'reviewing'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                인수확인중
              </button>
              <button
                onClick={() => setStatusFilter('approval_requested')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'approval_requested'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                승인요청
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'approved'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                승인완료
              </button>
            </div>
          </div>
        </div>

        {/* List of Document Cards */}
        <div className="divide-y divide-slate-100">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">해당 조건의 인수인계서가 없습니다.</p>
              <button
                onClick={onNewHandoverClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 인수인계서 만들기
              </button>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const stats = getDocumentStats(doc);
              const statusMeta = HANDOVER_STATUS_META[doc.status];

              return (
                <div
                  key={doc.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                >
                  {/* Left: Document Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${statusMeta.badgeColor}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {doc.department}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        목표일: {doc.dueDate}
                      </span>
                      {stats.unreadComments > 0 && (
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          미처리 질문 {stats.unreadComments}건
                        </span>
                      )}
                    </div>

                    <div>
                      <h4
                        onClick={() => {
                          setActiveDocumentId(doc.id);
                          setActiveTab('editor');
                        }}
                        className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {doc.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.jobRole} 직무 인수인계 · 총 {stats.total}개 체크리스트 항목
                      </p>
                    </div>

                    {/* Parties (Giver -> Receiver -> Manager) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">인수인</span>
                        <span className="font-semibold text-slate-900">{doc.giverName}</span>
                        <span className="text-[10px] text-slate-400">({doc.giverPosition})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">인수자</span>
                        <span className="font-semibold text-slate-900">{doc.receiverName}</span>
                        <span className="text-[10px] text-slate-400">({doc.receiverPosition})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-700 uppercase">팀장/관리자</span>
                        <span className="font-semibold text-slate-900">{doc.managerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Dual Progress Meters */}
                  <div className="w-full lg:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 shrink-0">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">인수인 작성률</span>
                        <span className="text-blue-700 font-bold">{stats.giverProgressRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.giverProgressRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">인수자 확인율</span>
                        <span className="text-emerald-700 font-bold">
                          {stats.receiverProgressRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.receiverProgressRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setActiveDocumentId(doc.id);
                        setActiveTab('editor');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      체크리스트 편집
                    </button>
                    <button
                      onClick={() => {
                        setActiveDocumentId(doc.id);
                        setActiveTab('review');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                    >
                      인수 확인
                    </button>
                    <button
                      onClick={() => {
                        setActiveDocumentId(doc.id);
                        setActiveTab('approval');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span>인수인계서 결재</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
