import { CategoryType, Priority, ItemStatus, HandoverStatus, ChecklistItem, HandoverDocument } from '../types';

export const CATEGORY_META: Record<
  CategoryType,
  { label: string; enLabel: string; desc: string; badgeColor: string; iconBg: string }
> = {
  routine: {
    label: '정기 업무',
    enLabel: 'Routine Tasks',
    desc: '일일/주간/월간 정기 반복 업무 및 운영 매뉴얼',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  projects: {
    label: '진행 중 프로젝트',
    enLabel: 'Ongoing Projects',
    desc: '현재 진행 중인 프로젝트 마일스톤, 이슈 및 로드맵',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  documents_accounts: {
    label: '중요 문서/계정',
    enLabel: 'Documents & Accounts',
    desc: '관리자 계정 자격증명, 보안 권한 및 핵심 문서 아카이브',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  contacts: {
    label: '외부 연락처',
    enLabel: 'External Contacts',
    desc: '외부 협력사, 대행사, 고객사 및 비상 연락망',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; badgeColor: string; dotColor: string }
> = {
  high: {
    label: '중요도 상',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
  medium: {
    label: '중요도 중',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: '중요도 하',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-400',
  },
};

export const ITEM_STATUS_META: Record<
  ItemStatus,
  { label: string; badgeColor: string; step: number }
> = {
  pending: {
    label: '작성 대기',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    step: 1,
  },
  in_progress: {
    label: '정리 진행중',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    step: 2,
  },
  giver_completed: {
    label: '인수인 작성완료',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    step: 3,
  },
  receiver_confirmed: {
    label: '인수자 확인완료',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    step: 4,
  },
};

export const HANDOVER_STATUS_META: Record<
  HandoverStatus,
  { label: string; badgeColor: string; desc: string }
> = {
  draft: {
    label: '작성 중 (초안)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    desc: '인수인이 체크리스트 항목을 정리 중입니다.',
  },
  reviewing: {
    label: '인수자 확인 중',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: '인수자가 항목별 내용을 확인하고 피드백을 남기는 단계입니다.',
  },
  approval_requested: {
    label: '최종 승인 요청 (결재중)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    desc: '인수 확인이 완료되어 팀장의 최종 승인을 기다리고 있습니다.',
  },
  approved: {
    label: '최종 승인 완료',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    desc: '팀장 승인이 완료되어 인수인계가 공식 종결되었습니다.',
  },
  rejected: {
    label: '보완 요청 (반려)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: '보완이 필요한 사항이 있어 관리자가 재작성을 요청했습니다.',
  },
};

export function calculateProgress(items: ChecklistItem[]) {
  if (!items || items.length === 0) {
    return {
      total: 0,
      giverCompletedCount: 0,
      receiverConfirmedCount: 0,
      giverProgressRate: 0,
      receiverProgressRate: 0,
      overallProgressRate: 0,
    };
  }

  const total = items.length;
  const receiverConfirmedCount = items.filter((i) => i.status === 'receiver_confirmed').length;
  // Giver is done if it's either giver_completed OR receiver_confirmed
  const giverCompletedCount = items.filter(
    (i) => i.status === 'giver_completed' || i.status === 'receiver_confirmed'
  ).length;

  const giverProgressRate = Math.round((giverCompletedCount / total) * 100);
  const receiverProgressRate = Math.round((receiverConfirmedCount / total) * 100);
  // Overall weighted: 40% giver completion + 60% receiver confirmation
  const overallProgressRate = Math.round(giverProgressRate * 0.4 + receiverProgressRate * 0.6);

  return {
    total,
    giverCompletedCount,
    receiverConfirmedCount,
    giverProgressRate,
    receiverProgressRate,
    overallProgressRate,
  };
}

export function getDocumentStats(doc: HandoverDocument) {
  const progress = calculateProgress(doc.items);
  const unreadComments = doc.items.reduce((sum, item) => {
    return sum + (item.comments?.filter((c) => !c.isResolved).length || 0);
  }, 0);

  const sensitiveCount = doc.items.filter((i) => i.isSensitive).length;

  return {
    ...progress,
    unreadComments,
    sensitiveCount,
  };
}
