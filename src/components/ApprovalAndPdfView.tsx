import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import {
  CATEGORY_META,
  HANDOVER_STATUS_META,
  getDocumentStats,
} from '../utils/formatters';
import {
  Printer,
  FileDown,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  Calendar,
  User,
  AlertTriangle,
  Lock,
  ChevronDown,
  Send,
  Award,
} from 'lucide-react';

export const ApprovalAndPdfView: React.FC = () => {
  const {
    activeDocument,
    documents,
    setActiveDocumentId,
    approveHandover,
    rejectHandover,
    currentUser,
  } = useHandover();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('인수인계 항목 및 후임자 확인 결과 이상 없으므로 최종 승인합니다.');
  const [rejectNotes, setRejectNotes] = useState('');

  if (!activeDocument) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <p>선택된 인수인계서가 없습니다.</p>
      </div>
    );
  }

  const stats = getDocumentStats(activeDocument);
  const statusMeta = HANDOVER_STATUS_META[activeDocument.status];
  const isApproved = activeDocument.status === 'approved';
  const isManager = currentUser.role === 'manager' || currentUser.id === activeDocument.managerId;

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    approveHandover(activeDocument.id, approvalNotes);
    setApprovalModalOpen(false);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectNotes) return;
    rejectHandover(activeDocument.id, rejectNotes);
    setRejectModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5 no-print">
        {/* Upper Row: Document Selector on left, Status & Approval badges side-by-side on right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              인수인계서 선택:
            </span>
            <select
              value={activeDocument.id}
              onChange={(e) => setActiveDocumentId(e.target.value)}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200/70 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.department})
                </option>
              ))}
            </select>
          </div>

          {/* 최종승인완료랑 전자서명승인완료됨 옆으로 나란히 */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap shrink-0 inline-flex items-center ${statusMeta.badgeColor}`}
            >
              {statusMeta.label}
            </span>

            {isApproved ? (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>전자서명 승인 완료됨 ({activeDocument.approvedAt})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="px-3.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>보완 요청 (반려)</span>
                </button>

                <button
                  onClick={() => setApprovalModalOpen(true)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>팀장 최종 승인 결재</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lower Row: PDF 인쇄 버튼 바로 밑 오른쪽 배치 */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>PDF 인쇄 / 내보내기</span>
          </button>
        </div>
      </div>

      {/* Official A4 Corporate Handover Document */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-300 p-8 sm:p-12 print-shadow-none text-slate-900 space-y-8 print:p-0 print:border-none">
        {/* Document Header & Approval Matrix */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b-2 border-slate-900 pb-6 gap-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
              TECHCORP ENTERPRISE · FORM NO. HR-2026-HO
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              업 무 인 수 인 계 서
            </h1>
            <p className="text-xs text-slate-500">
              문서 고유번호: #{activeDocument.id} | 기안일자: {activeDocument.startDate} | 목표일: {activeDocument.dueDate}
            </p>
          </div>

          {/* Official Electronic Approval Box (결재란) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden shrink-0 text-center">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-700">
              결 재 라 인
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-300 text-xs">
              {/* Giver */}
              <div className="w-20 sm:w-24">
                <div className="bg-slate-50 py-1 font-semibold text-[10px] text-slate-600 border-b border-slate-300">
                  인수인 (기안)
                </div>
                <div className="h-16 flex flex-col items-center justify-center relative p-1">
                  <span className="font-bold text-slate-800">{activeDocument.giverName}</span>
                  <div className="w-9 h-9 border-2 border-indigo-600 text-indigo-700 rounded-full flex items-center justify-center text-[9px] font-black transform -rotate-12 absolute opacity-80 pointer-events-none">
                    인수인<br/>서명
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-200 py-0.5">
                  {activeDocument.startDate}
                </div>
              </div>

              {/* Receiver */}
              <div className="w-20 sm:w-24">
                <div className="bg-slate-50 py-1 font-semibold text-[10px] text-slate-600 border-b border-slate-300">
                  인수자 (확인)
                </div>
                <div className="h-16 flex flex-col items-center justify-center relative p-1">
                  <span className="font-bold text-slate-800">{activeDocument.receiverName}</span>
                  {stats.receiverConfirmedCount > 0 && (
                    <div className="w-9 h-9 border-2 border-emerald-600 text-emerald-700 rounded-full flex items-center justify-center text-[9px] font-black transform -rotate-6 absolute opacity-85 pointer-events-none">
                      인수자<br/>서명
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-200 py-0.5">
                  {stats.receiverConfirmedCount === stats.total ? '완료' : '진행중'}
                </div>
              </div>

              {/* Manager */}
              <div className="w-20 sm:w-24">
                <div className="bg-slate-50 py-1 font-semibold text-[10px] text-slate-600 border-b border-slate-300">
                  팀장 (승인)
                </div>
                <div className="h-16 flex flex-col items-center justify-center relative p-1">
                  <span className="font-bold text-slate-800">{activeDocument.managerName}</span>
                  {isApproved && (
                    <div className="w-10 h-10 border-2 border-rose-600 text-rose-700 rounded-full flex items-center justify-center text-[9px] font-black transform -rotate-12 absolute opacity-90 pointer-events-none bg-rose-50/20">
                      최종<br/>승인
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-200 py-0.5">
                  {isApproved ? activeDocument.approvedAt?.split(' ')[0] : '결재대기'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Basic Parties Information Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            1. 기본 인적사항 및 직무 정보
          </h3>

          <table className="w-full border border-slate-300 text-xs">
            <tbody>
              <tr className="border-b border-slate-300">
                <th className="w-1/6 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  소속 부서
                </th>
                <td className="w-2/6 p-2.5 border-r border-slate-300">{activeDocument.department}</td>
                <th className="w-1/6 bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  담당 직무
                </th>
                <td className="w-2/6 p-2.5">{activeDocument.jobRole}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  인수인 (퇴사/이동)
                </th>
                <td className="p-2.5 border-r border-slate-300">
                  <span className="font-bold">{activeDocument.giverName}</span> (
                  {activeDocument.giverPosition}) · {activeDocument.giverEmail}
                </td>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  인수자 (후임)
                </th>
                <td className="p-2.5">
                  <span className="font-bold">{activeDocument.receiverName}</span> (
                  {activeDocument.receiverPosition}) · {activeDocument.receiverEmail}
                </td>
              </tr>
              <tr>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  인수인계 기간
                </th>
                <td className="p-2.5 border-r border-slate-300">
                  {activeDocument.startDate} ~ {activeDocument.dueDate}
                </td>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 border-r border-slate-300 text-left">
                  인수 진행률
                </th>
                <td className="p-2.5">
                  <span className="font-bold text-emerald-700">{stats.receiverProgressRate}%</span>{' '}
                  ({stats.receiverConfirmedCount} / {stats.total} 항목 완료)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Detailed Checklist Categories Table */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            2. 인수인계 상세 체크리스트 내역
          </h3>

          {(['routine', 'projects', 'documents_accounts', 'contacts'] as const).map((categoryKey) => {
            const meta = CATEGORY_META[categoryKey];
            const catItems = activeDocument.items.filter((i) => i.category === categoryKey);

            if (catItems.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    {meta.label} ({meta.enLabel}) - {catItems.length}건
                  </span>
                  <span className="text-[11px] text-slate-500">{meta.desc}</span>
                </div>

                <table className="w-full border border-slate-300 text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <tr>
                      <th className="w-12 p-2 text-center border-r border-slate-300">No.</th>
                      <th className="w-20 p-2 text-center border-r border-slate-300">중요도</th>
                      <th className="w-1/3 p-2 text-left border-r border-slate-300">업무명 및 세부 절차</th>
                      <th className="w-1/4 p-2 text-left border-r border-slate-300">관련 링크/계정/증빙</th>
                      <th className="w-24 p-2 text-center border-r border-slate-300 whitespace-nowrap">인수인 완료</th>
                      <th className="w-28 p-2 text-center whitespace-nowrap">인수자 확인</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {catItems.map((item, idx) => {
                      const isGiverDone =
                        item.status === 'giver_completed' || item.status === 'receiver_confirmed';
                      const isReceiverDone = item.status === 'receiver_confirmed';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2 text-center border-r border-slate-300 text-slate-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.priority === 'high' ? '상' : item.priority === 'medium' ? '중' : '하'}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-300 space-y-1">
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                            {item.giverNotes && (
                              <p className="text-[10px] text-slate-500 italic">
                                [인수인 메모] {item.giverNotes}
                              </p>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-300 space-y-1 text-[11px]">
                            {item.isSensitive && item.sensitiveCredential && (
                              <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900 font-mono text-[10px]">
                                <span className="font-bold">[보안 계정]</span>{' '}
                                {item.sensitiveCredential.accountName}
                                <br />
                                ID: {item.sensitiveCredential.loginId || '-'}
                                <br />
                                PW: •••••••••••••••• (보안 마스킹 보관)
                              </div>
                            )}

                            {item.links?.map((l) => (
                              <div key={l.id} className="truncate text-indigo-700">
                                🔗 {l.title}: {l.url}
                              </div>
                            ))}

                            {item.attachments?.map((a) => (
                              <div key={a.id} className="truncate text-slate-600">
                                📎 {a.name} ({a.size})
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-center border-r border-slate-300 whitespace-nowrap">
                            {isGiverDone ? (
                              <span className="font-bold text-indigo-700 whitespace-nowrap">완료 ✔</span>
                            ) : (
                              <span className="text-slate-400 whitespace-nowrap">대기</span>
                            )}
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            {isReceiverDone ? (
                              <span className="font-bold text-emerald-700 whitespace-nowrap inline-block">확인 완료 ✔</span>
                            ) : (
                              <span className="text-amber-600 font-medium whitespace-nowrap">검토중</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* 3. Approval Notes & Signatures Box */}
        <div className="space-y-3 pt-4 border-t-2 border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            3. 팀장 종합 승인 의견 및 피드백
          </h3>

          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2">
            <p className="font-semibold text-slate-800">
              승인자: {activeDocument.managerName} ({activeDocument.managerPosition})
            </p>
            <p className="text-slate-700 leading-relaxed italic whitespace-pre-wrap">
              "{activeDocument.approvalNotes || '팀장 최종 승인 결재가 진행 중입니다.'}"
            </p>
            {activeDocument.rejectedNotes && (
              <p className="text-rose-700 font-semibold">
                [보완 요청 내역] {activeDocument.rejectedNotes}
              </p>
            )}
          </div>

          {/* Legal Pledge / Corporate Confirmation */}
          <div className="text-center pt-8 space-y-4">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              본 인수인계서에 명시된 모든 업무, 문서 및 계정 권한은 후임자에게 성실히 인계되었으며,<br />
              인수인 및 인수자는 업무 공백이 발생하지 않도록 상호 충분히 확인 및 합의하였음을 확인합니다.
            </p>

            <div className="text-sm font-bold text-slate-900 pt-2">
              {activeDocument.dueDate.split('-')[0]}년 {activeDocument.dueDate.split('-')[1]}월 {activeDocument.dueDate.split('-')[2]}일
            </div>

            <div className="flex justify-center gap-12 text-xs pt-2">
              <div>
                인수인: <strong className="font-bold">{activeDocument.giverName}</strong> (서명/인)
              </div>
              <div>
                인수자: <strong className="font-bold">{activeDocument.receiverName}</strong> (서명/인)
              </div>
              <div>
                부서장(승인): <strong className="font-bold">{activeDocument.managerName}</strong> (인)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">팀장 최종 승인 결재</h3>
            </div>
            <p className="text-xs text-slate-500">
              인수인계 내용을 확인하고 전자결재를 최종 승인합니다. 승인 후 공식 전자결재 인장이 날인됩니다.
            </p>

            <form onSubmit={handleApprove} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  팀장 종합 승인 의견
                </label>
                <textarea
                  rows={3}
                  required
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  최종 승인 및 전자서명 날인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-700">
              <XCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">인수인계 보완 요청 (반려)</h3>
            </div>
            <p className="text-xs text-slate-500">
              미진한 항목이나 추가 설명이 필요한 사항을 인수인 및 인수자에게 전달하여 재작성을 요청합니다.
            </p>

            <form onSubmit={handleReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  보완 요청 사유 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="예: 클라우드 인프라 접근 계정 테스트가 아직 완료되지 않았으니 추가 리허설 후 재요청 바랍니다."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  보완 요청 전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
