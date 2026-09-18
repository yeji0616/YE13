import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  HandoverDocument,
  ChecklistItem,
  JobTemplate,
  HandoverStatus
} from '../types';
import {
  INITIAL_USERS,
  STANDARD_TEMPLATES,
  INITIAL_HANDOVERS
} from '../data/mockData';

export type NavigationTab = 'dashboard' | 'editor' | 'review' | 'templates' | 'approval';

interface HandoverContextType {
  currentUser: User;
  users: User[];
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  documents: HandoverDocument[];
  activeDocument: HandoverDocument | null;
  activeDocumentId: string;
  templates: JobTemplate[];
  activeTab: NavigationTab;
  unresolvedFeedbackCount: number;
  pendingReviewCount: number;
  pendingApprovalCount: number;
  
  // Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  switchUser: (userId: string) => void;
  loginWithEmail: (email: string, role: UserRole, name: string, department: string, position: string) => void;
  logout: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  setActiveDocumentId: (id: string) => void;
  createHandoverDocument: (data: Partial<HandoverDocument>, templateId?: string) => string;
  updateHandoverDocument: (id: string, updates: Partial<HandoverDocument>) => void;
  deleteHandoverDocument: (id: string) => void;
  
  // Checklist Item Actions
  addItem: (handoverId: string, itemData: Omit<ChecklistItem, 'id' | 'handoverId' | 'comments'>) => void;
  updateItem: (handoverId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteItem: (handoverId: string, itemId: string) => void;
  confirmItemByReceiver: (handoverId: string, itemId: string, feedback?: string) => void;
  unconfirmItemByReceiver: (handoverId: string, itemId: string) => void;
  
  // Comments
  addComment: (handoverId: string, itemId: string, content: string) => void;
  toggleCommentResolved: (handoverId: string, itemId: string, commentId: string) => void;
  
  // Approval Workflow
  requestReview: (handoverId: string) => void;
  requestManagerApproval: (handoverId: string) => void;
  approveHandover: (handoverId: string, notes: string) => void;
  rejectHandover: (handoverId: string, notes: string) => void;
  
  // Templates
  saveAsTemplate: (jobTitle: string, category: string, description: string, items: ChecklistItem[]) => void;
  
  // Reset
  resetToDemoData: () => void;
}

const STORAGE_KEY_DOCS = 'handoverhub_docs_v3';
const STORAGE_KEY_TEMPLATES = 'handoverhub_templates_v3';
const STORAGE_KEY_USERS = 'handoverhub_users_v3';
const STORAGE_KEY_CURRENT_USER = 'handoverhub_current_user_v3';
const STORAGE_KEY_LOGGED_IN = 'handoverhub_is_logged_in_v3';

const HandoverContext = createContext<HandoverContextType | undefined>(undefined);

export const HandoverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed = (JSON.parse(saved) as User[]).filter((u) => u.id !== 'user_manager_hr');
        const existingIds = new Set(parsed.map((u) => u.id));
        const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGGED_IN);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openLoginModal = () => setIsAuthModalOpen(true);
  const closeLoginModal = () => setIsAuthModalOpen(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        if (user.id !== 'user_manager_hr' && INITIAL_USERS.some((u) => u.id === user.id)) {
          return user;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  });

  const [documents, setDocuments] = useState<HandoverDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    return saved ? JSON.parse(saved) : INITIAL_HANDOVERS;
  });

  const [templates, setTemplates] = useState<JobTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    return saved ? JSON.parse(saved) : STANDARD_TEMPLATES;
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string>(() => {
    return documents.length > 0 ? documents[0].id : '';
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('editor');

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGGED_IN, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const activeDocument = documents.find((doc) => doc.id === activeDocumentId) || documents[0] || null;

  // Unresolved comments across all documents (or active user's documents)
  const unresolvedFeedbackCount = documents.reduce((acc, doc) => {
    return (
      acc +
      doc.items.reduce((itemAcc, item) => {
        return itemAcc + (item.comments?.filter((c) => !c.isResolved).length || 0);
      }, 0)
    );
  }, 0);

  const pendingReviewCount = documents.filter((d) => d.status === 'reviewing').length;
  const pendingApprovalCount = documents.filter((d) => d.status === 'approval_requested').length;

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const loginWithEmail = (
    email: string,
    role: UserRole,
    name: string,
    department: string,
    position: string
  ) => {
    let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role,
        department,
        position,
        avatarBg:
          role === 'handover_giver'
            ? 'bg-indigo-600'
            : role === 'handover_receiver'
            ? 'bg-emerald-600'
            : 'bg-slate-700',
      };
      const updated = [...users, newUser];
      setUsers(updated);
      setCurrentUser(newUser);
    } else {
      const updatedUser = { ...existing, role, name, department, position };
      setUsers(users.map((u) => (u.id === existing.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
    }
    setIsLoggedIn(true);
  };

  const createHandoverDocument = (
    data: Partial<HandoverDocument>,
    templateId?: string
  ): string => {
    const newId = `handover_doc_${Date.now()}`;
    const selectedTemplate = templates.find((t) => t.id === templateId);

    let initialItems: ChecklistItem[] = [];
    if (selectedTemplate) {
      initialItems = selectedTemplate.items.map((tItem, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        handoverId: newId,
        category: tItem.category,
        title: tItem.title,
        description: tItem.description,
        priority: tItem.priority,
        status: 'pending',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        links: tItem.suggestedLinks?.map((l, lIdx) => ({ id: `l_${lIdx}`, ...l })) || [],
        attachments: [],
        receiverId: data.receiverId || 'user_receiver_1',
        receiverName: data.receiverName || '이지은',
        isSensitive: tItem.isSensitive,
        sensitiveCredential: tItem.sampleSensitiveCredential,
        comments: [],
      }));
    }

    const newDoc: HandoverDocument = {
      id: newId,
      title: data.title || '새 업무 인수인계서',
      department: data.department || currentUser.department,
      jobRole: data.jobRole || currentUser.position,
      giverId: currentUser.id,
      giverName: currentUser.name,
      giverPosition: currentUser.position,
      giverEmail: currentUser.email,
      receiverId: data.receiverId || 'user_receiver_1',
      receiverName: data.receiverName || '이지은',
      receiverPosition: data.receiverPosition || '주임',
      receiverEmail: data.receiverEmail || 'jieun.lee@techcorp.co.kr',
      managerId: data.managerId || 'user_manager_1',
      managerName: data.managerName || '박성훈',
      managerPosition: data.managerPosition || '팀장',
      managerEmail: data.managerEmail || 'sh.park@techcorp.co.kr',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate:
        data.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      templateOriginId: templateId,
      items: initialItems,
      history: [
        {
          id: `hist_${Date.now()}`,
          timestamp: new Date().toLocaleString('ko-KR'),
          action: '인수인계서 생성',
          userName: currentUser.name,
          userRole: currentUser.role,
          detail: templateId ? `템플릿 '${selectedTemplate?.jobTitle}' 적용` : '직접 항목 작성',
        },
      ],
    };

    setDocuments([newDoc, ...documents]);
    setActiveDocumentId(newId);
    setActiveTab('editor');
    return newId;
  };

  const updateHandoverDocument = (id: string, updates: Partial<HandoverDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) return doc;
        return {
          ...doc,
          ...updates,
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '인수인계 정보 업데이트',
              userName: currentUser.name,
              userRole: currentUser.role,
            },
          ],
        };
      })
    );
  };

  const deleteHandoverDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocumentId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      if (remaining.length > 0) {
        setActiveDocumentId(remaining[0].id);
      }
    }
  };

  const addItem = (
    handoverId: string,
    itemData: Omit<ChecklistItem, 'id' | 'handoverId' | 'comments'>
  ) => {
    const newItem: ChecklistItem = {
      ...itemData,
      id: `item_${Date.now()}`,
      handoverId,
      comments: [],
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: [...doc.items, newItem],
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '체크리스트 항목 추가',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: `"${newItem.title}" 추가됨`,
            },
          ],
        };
      })
    );
  };

  const updateItem = (handoverId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
        };
      })
    );
  };

  const deleteItem = (handoverId: string, itemId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  const confirmItemByReceiver = (handoverId: string, itemId: string, feedback?: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              status: 'receiver_confirmed',
              receiverFeedback: feedback || item.receiverFeedback,
              confirmedAt: new Date().toLocaleString('ko-KR'),
            };
          }),
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '인수자 확인 완료',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: feedback ? `확인 피드백: ${feedback}` : '내용 확인 및 승인 처리',
            },
          ],
        };
      })
    );
  };

  const unconfirmItemByReceiver = (handoverId: string, itemId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              status: 'giver_completed',
              confirmedAt: undefined,
            };
          }),
        };
      })
    );
  };

  const addComment = (handoverId: string, itemId: string, content: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      itemId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorPosition: currentUser.position,
      content,
      createdAt: new Date().toLocaleString('ko-KR'),
      isResolved: false,
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              comments: [...(item.comments || []), newComment],
            };
          }),
        };
      })
    );
  };

  const toggleCommentResolved = (handoverId: string, itemId: string, commentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          items: doc.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              comments: (item.comments || []).map((c) =>
                c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
              ),
            };
          }),
        };
      })
    );
  };

  const requestReview = (handoverId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          status: 'reviewing' as HandoverStatus,
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '인수자 검토 요청',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: '인수자 확인 및 피드백 검토를 요청했습니다.',
            },
          ],
        };
      })
    );
  };

  const requestManagerApproval = (handoverId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          status: 'approval_requested' as HandoverStatus,
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '팀장/관리자 최종 승인 요청',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: '인수 확인이 완료되어 관리자 최종 결재를 상신했습니다.',
            },
          ],
        };
      })
    );
  };

  const approveHandover = (handoverId: string, notes: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          status: 'approved' as HandoverStatus,
          approvalNotes: notes,
          approvedAt: new Date().toLocaleString('ko-KR'),
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '최종 인수인계 승인 완료',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: notes || '팀장 최종 승인 및 전자서명 완료',
            },
          ],
        };
      })
    );
  };

  const rejectHandover = (handoverId: string, notes: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== handoverId) return doc;
        return {
          ...doc,
          status: 'rejected' as HandoverStatus,
          rejectedNotes: notes,
          history: [
            ...doc.history,
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toLocaleString('ko-KR'),
              action: '인수인계 보완 요청 (반려)',
              userName: currentUser.name,
              userRole: currentUser.role,
              detail: notes,
            },
          ],
        };
      })
    );
  };

  const saveAsTemplate = (
    jobTitle: string,
    category: string,
    description: string,
    items: ChecklistItem[]
  ) => {
    const newTemplate: JobTemplate = {
      id: `template_custom_${Date.now()}`,
      jobTitle,
      category,
      description,
      isStandard: false,
      itemCount: items.length,
      items: items.map((it) => ({
        category: it.category,
        title: it.title,
        description: it.description,
        priority: it.priority,
        isSensitive: it.isSensitive,
        sampleSensitiveCredential: it.sensitiveCredential,
        suggestedLinks: it.links.map((l) => ({ title: l.title, url: l.url })),
      })),
    };

    setTemplates([...templates, newTemplate]);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_DOCS);
    localStorage.removeItem(STORAGE_KEY_TEMPLATES);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
    setIsLoggedIn(true);
    setDocuments(INITIAL_HANDOVERS);
    setTemplates(STANDARD_TEMPLATES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveDocumentId(INITIAL_HANDOVERS[0].id);
    setActiveTab('dashboard');
  };

  return (
    <HandoverContext.Provider
      value={{
        currentUser,
        users,
        isLoggedIn,
        isAuthModalOpen,
        openLoginModal,
        closeLoginModal,
        documents,
        activeDocument,
        activeDocumentId,
        templates,
        activeTab,
        unresolvedFeedbackCount,
        pendingReviewCount,
        pendingApprovalCount,
        switchUser,
        loginWithEmail,
        logout,
        setActiveTab,
        setActiveDocumentId,
        createHandoverDocument,
        updateHandoverDocument,
        deleteHandoverDocument,
        addItem,
        updateItem,
        deleteItem,
        confirmItemByReceiver,
        unconfirmItemByReceiver,
        addComment,
        toggleCommentResolved,
        requestReview,
        requestManagerApproval,
        approveHandover,
        rejectHandover,
        saveAsTemplate,
        resetToDemoData,
      }}
    >
      {children}
    </HandoverContext.Provider>
  );
};

export const useHandover = () => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider');
  }
  return context;
};
