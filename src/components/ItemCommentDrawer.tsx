import React, { useState } from 'react';
import { useHandover } from '../context/HandoverContext';
import { ChecklistItem } from '../types';
import {
  X,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';

interface ItemCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChecklistItem | null;
  handoverId: string;
}

export const ItemCommentDrawer: React.FC<ItemCommentDrawerProps> = ({
  isOpen,
  onClose,
  item,
  handoverId,
}) => {
  const { addComment, toggleCommentResolved, currentUser } = useHandover();
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !item) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(handoverId, item.id, newComment.trim());
    setNewComment('');
  };

  const comments = item.comments || [];
  const unresolvedCount = comments.filter((c) => !c.isResolved).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900">질의응답 및 피드백</h4>
                {unresolvedCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    미해결 {unresolvedCount}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    모두 완료
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {item.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item context snippet */}
        <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-0.5">업무 상세 내용 요약:</p>
          <p className="line-clamp-2 leading-relaxed text-slate-600">{item.description}</p>
        </div>

        {/* Comments stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">등록된 피드백이나 질문이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                인수 내용 중 추가 설명이 필요하거나 보완할 사항이 있다면 아래에 댓글을 남겨보세요.
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const isMine = c.authorId === currentUser.id;
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    c.isResolved
                      ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                      : isMine
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{c.authorName}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          c.authorRole === 'handover_giver'
                            ? 'bg-indigo-100 text-indigo-800'
                            : c.authorRole === 'handover_receiver'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {c.authorRole === 'handover_giver'
                          ? '인수인'
                          : c.authorRole === 'handover_receiver'
                          ? '인수자'
                          : '관리자'}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.authorPosition}</span>
                    </div>

                    <button
                      onClick={() => toggleCommentResolved(handoverId, item.id, c.id)}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        c.isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={c.isResolved ? '해결 완료됨 (클릭 시 미해결 변경)' : '해결 완료 처리'}
                    >
                      {c.isResolved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>해결됨</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span>해결 체크</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{c.createdAt}</span>
                    {c.isResolved && <span className="text-emerald-600 font-medium">조치 완료</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-slate-500">
            <CornerDownRight className="w-3 h-3 text-indigo-600" />
            <span>
              <span className="font-semibold text-slate-700">{currentUser.name}</span> (
              {currentUser.role === 'handover_giver'
                ? '인수인'
                : currentUser.role === 'handover_receiver'
                ? '인수자'
                : '관리자'}
              ) 계정으로 작성 중
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="피드백 또는 궁금한 점을 입력하세요..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>등록</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
