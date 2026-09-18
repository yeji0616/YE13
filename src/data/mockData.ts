import { User, JobTemplate, HandoverDocument } from '../types';

export const INITIAL_USERS: User[] = [
  // 1. 관리자 / 팀장 (최종 결재 승인자)
  {
    id: 'user_manager_1',
    name: '박성훈',
    email: 'sh.park@techcorp.co.kr',
    role: 'manager',
    department: '플랫폼기획팀',
    position: '팀장 / 플랫폼기획 리드',
    avatarBg: 'bg-slate-700',
  },
  {
    id: 'user_manager_2',
    name: '윤서연',
    email: 'sy.yoon@techcorp.co.kr',
    role: 'manager',
    department: '서비스기획·마케팅팀',
    position: '팀장 / 마케팅 본부장',
    avatarBg: 'bg-purple-600',
  },
  // 2. 인수인 (업무 전달자 / 작성자)
  {
    id: 'user_giver_1',
    name: '김민수',
    email: 'minsu.kim@techcorp.co.kr',
    role: 'handover_giver',
    department: '플랫폼기획팀',
    position: '시니어 플랫폼 기획자',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'user_giver_2',
    name: '한지우',
    email: 'jiwoo.han@techcorp.co.kr',
    role: 'handover_giver',
    department: '서비스기획·마케팅팀',
    position: '선임 프로덕트 매니저 (PM)',
    avatarBg: 'bg-cyan-600',
  },
  // 3. 인수자 (업무 인수자 / 후임자)
  {
    id: 'user_receiver_1',
    name: '이지은',
    email: 'jieun.lee@techcorp.co.kr',
    role: 'handover_receiver',
    department: '플랫폼기획팀',
    position: '주임 플랫폼 기획자',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'user_receiver_2',
    name: '강태양',
    email: 'taeyang.kang@techcorp.co.kr',
    role: 'handover_receiver',
    department: '서비스기획·마케팅팀',
    position: '그로스 매니저 (후임자)',
    avatarBg: 'bg-orange-600',
  },
];

export const STANDARD_TEMPLATES: JobTemplate[] = [
  {
    id: 'template_dev',
    jobTitle: '소프트웨어 개발 (Frontend/Backend)',
    category: '개발',
    description: '소스코드 레포지토리, 배포 파이프라인, 모니터링 대시보드 및 인프라 자격증명 표준 인수인계 항목',
    isStandard: true,
    itemCount: 8,
    items: [
      {
        category: 'routine',
        title: '일일 스크럼 및 주간 릴리즈 배포 절차 인계',
        description: '매주 목요일 정기 배포 프로세스(Staging QA 승인 -> Production Blue/Green 릴리즈) 및 롤백 매뉴얼',
        priority: 'high',
        isSensitive: false,
        suggestedLinks: [
          { title: '배포 위키 가이드', url: 'https://wiki.internal.techcorp/deploy' }
        ]
      },
      {
        category: 'routine',
        title: 'Sentry / Datadog 온콜 에러 모니터링 및 알람 대응',
        description: 'Slack #alert-fe 채널 핑 대응 기준 및 장애 등급별(P0~P3) 에스컬레이션 체계',
        priority: 'medium',
        isSensitive: false,
        suggestedLinks: [
          { title: '장애 대응 런북', url: 'https://wiki.internal.techcorp/incident-runbook' }
        ]
      },
      {
        category: 'projects',
        title: '신규 디자인 시스템 v2.0 컴포넌트 마이그레이션',
        description: '현재 75% 전환 완료 상태. 남은 모듈(DatePicker, DataGrid)의 리팩토링 스펙 및 디자인팀 협업 Jira 티켓 인계',
        priority: 'high',
        isSensitive: false,
        suggestedLinks: [
          { title: 'Jira 에픽 링크', url: 'https://jira.internal.techcorp/browse/FE-892' }
        ]
      },
      {
        category: 'projects',
        title: 'Core Web Vitals 성능 최적화 (LCP 1.8초 달성 프로젝트)',
        description: '이미지 CDN 캐시 정책 조정 및 번들 스플리팅 작업 현황 요약',
        priority: 'medium',
        isSensitive: false,
      },
      {
        category: 'documents_accounts',
        title: 'AWS Production 콘솔 및 클라우드 인프라 접근 계정',
        description: '개발자 IAM 역할(Developer-PowerUser) 할당 및 MFA 등록 확인 절차',
        priority: 'high',
        isSensitive: true,
        sampleSensitiveCredential: {
          accountName: 'AWS Prod Console (IAM)',
          loginId: 'jieun.lee@techcorp.co.kr',
          passwordMasked: 'P@ssw0rd!#2026SecureDeploy',
          otpOrAccessGuide: '1Password Vault [Engineering-Shared] 내 등록 완료. 개인 YubiKey MFA 등록 필수.',
          url: 'https://techcorp.signin.aws.amazon.com/console'
        }
      },
      {
        category: 'documents_accounts',
        title: 'GitHub Organization 및 NPM Private Registry 배포 토큰',
        description: '사내 공통 UI 라이브러리 발행용 NPM Automation Token 보관 위치 및 갱신 주기',
        priority: 'high',
        isSensitive: true,
        sampleSensitiveCredential: {
          accountName: 'NPM Private Token (Automation)',
          loginId: 'bot-fe-release',
          passwordMasked: 'npm_secr3t_token_9f823a9d214c',
          otpOrAccessGuide: 'GitHub Secrets [NPM_TOKEN]에 자동 주입되어 있음.',
        }
      },
      {
        category: 'contacts',
        title: '클라우드 인프라 IDC 엔지니어 및 보안팀 담당자 연락망',
        description: '비상 네트워크 점검 시 핫라인: 보안팀 이준호 수석 (내선 3042, 010-9988-1234)',
        priority: 'medium',
        isSensitive: false,
      },
      {
        category: 'contacts',
        title: 'UX 디자인팀 리드 및 제품 기획 PO 연락처',
        description: '디자인 시스템 싱크: 박하린 수석 디자이너 (Slack @halin.park)',
        priority: 'medium',
        isSensitive: false,
      }
    ]
  },
  {
    id: 'template_marketing',
    jobTitle: '퍼포먼스 / 브랜드 마케팅',
    category: '마케팅',
    description: '광고 매체사 관리자 계정, 마케팅 예산 트래커, 대행사 계약서 및 소재 에셋 드라이브 인수인계',
    isStandard: true,
    itemCount: 6,
    items: [
      {
        category: 'routine',
        title: '일일 광고 ROAS 리포트 작성 및 비드 단가 최적화',
        description: 'Google Ads, Meta Business Manager, Naver Search 광고 일일 소진액 취합 스프레드시트 관리',
        priority: 'high',
        isSensitive: false,
      },
      {
        category: 'projects',
        title: '2026 하반기 브랜드 리브랜딩 캠페인 런칭',
        description: '영상 프로덕션 및 옥외광고 집행 일정표, 인플루언서 20인 섭외 현황',
        priority: 'high',
        isSensitive: false,
      },
      {
        category: 'documents_accounts',
        title: 'Meta Business Manager 및 Google Ads 마스터 계정',
        description: '월 집행 한도 1억원 법인카드 연동 계정 권한 이전',
        priority: 'high',
        isSensitive: true,
        sampleSensitiveCredential: {
          accountName: 'Meta Ads Manager Master',
          loginId: 'admaster@techcorp.co.kr',
          passwordMasked: 'M@rketingAds2026$$',
          otpOrAccessGuide: '2단계 인증 번호는 팀 공용 슬랙 채널 #mkt-auth봇 연동',
        }
      },
      {
        category: 'contacts',
        title: '종합광고대행사 담당 AE 및 매체 렙사 연락망',
        description: '제일기획 담당: 강동원 팀장 (010-5544-2211, dw.kang@adagency.com)',
        priority: 'high',
        isSensitive: false,
      }
    ]
  },
  {
    id: 'template_hr',
    jobTitle: '인사 / 피플앤컬처 (HR & 총무)',
    category: '인사/HR',
    description: '채용 ATS 시스템, 노무사 자문 채널, 근로계약서 관리 대장 및 사내 복리후생 파트너사 목록',
    isStandard: true,
    itemCount: 5,
    items: [
      {
        category: 'routine',
        title: '신규 입사자 온보딩 웰컴 패키지 및 장비 지급 프로세스',
        description: '입사 D-3 장비 수령(IT지원팀), D-Day 근로계약서 전자서명 및 사원증 발급',
        priority: 'high',
        isSensitive: false,
      },
      {
        category: 'documents_accounts',
        title: '원티드 / 그리팅 채용 ATS 관리자 및 고용노동부 포털 계정',
        description: '공고 등록 및 지원자 이력서 열람 권한 이전',
        priority: 'high',
        isSensitive: true,
        sampleSensitiveCredential: {
          accountName: 'Greeting ATS Admin',
          loginId: 'hr-admin@techcorp.co.kr',
          passwordMasked: 'HrGreetingP@ss2026!',
          otpOrAccessGuide: 'Google OTP 등록 필요',
        }
      },
      {
        category: 'contacts',
        title: '사내 지정 노무법인 대표 노무사 핫라인',
        description: '법무법인 한결: 신재혁 공인노무사 (02-555-1234, jh.shin@lawhr.co.kr)',
        priority: 'medium',
        isSensitive: false,
      }
    ]
  },
  {
    id: 'template_finance',
    jobTitle: '재무 / 회계 (Accounting & Finance)',
    category: '재무/회계',
    description: 'ERP 전표 승인, 부가세/원천세 신고 스케줄, 주거래 은행 법인 OTP 및 공인인증서 보관함',
    isStandard: true,
    itemCount: 5,
    items: [
      {
        category: 'routine',
        title: '월말 세금계산서 발행 및 법인카드 경비 마감',
        description: '매월 25일까지 영수증 증빙 확인 및 익월 10일 원천세 홈택스 신고',
        priority: 'high',
        isSensitive: false,
      },
      {
        category: 'documents_accounts',
        title: '국민은행/하나은행 기업 인터넷뱅킹 마스터 공인인증서 & OTP',
        description: '재무팀 금고 2번함 보관. 비밀번호 변경 및 전자결재 라인 변경',
        priority: 'high',
        isSensitive: true,
        sampleSensitiveCredential: {
          accountName: 'KB국민 기업인터넷뱅킹',
          loginId: 'techcorp_corp',
          passwordMasked: 'Kb#Finance9988!@',
          otpOrAccessGuide: '물리 OTP 카드 2호기 (금고 보관)',
        }
      },
      {
        category: 'contacts',
        title: '회계감사 삼일회계법인 담당 회계사',
        description: '삼일PwC: 유태오 회계사 (010-4422-9876)',
        priority: 'high',
        isSensitive: false,
      }
    ]
  }
];

export const INITIAL_HANDOVERS: HandoverDocument[] = [
  {
    id: 'handover_doc_001',
    title: '플랫폼 서비스 기획 및 UI/UX 시스템 인수인계서',
    department: '플랫폼기획팀',
    jobRole: '시니어 플랫폼 기획자',
    giverId: 'user_giver_1',
    giverName: '김민수',
    giverPosition: '시니어 플랫폼 기획자',
    giverEmail: 'minsu.kim@techcorp.co.kr',
    receiverId: 'user_receiver_1',
    receiverName: '이지은',
    receiverPosition: '주임 플랫폼 기획자',
    receiverEmail: 'jieun.lee@techcorp.co.kr',
    managerId: 'user_manager_1',
    managerName: '박성훈',
    managerPosition: '팀장 (플랫폼기획 리드)',
    managerEmail: 'sh.park@techcorp.co.kr',
    startDate: '2026-09-01',
    dueDate: '2026-09-30',
    status: 'reviewing',
    templateOriginId: 'template_dev',
    history: [
      {
        id: 'hist_1',
        timestamp: '2026-09-01 10:00',
        action: '인수인계서 생성',
        userName: '김민수',
        userRole: 'handover_giver',
        detail: '개발 표준 템플릿 기반으로 인수인계서 초안을 작성했습니다.'
      },
      {
        id: 'hist_2',
        timestamp: '2026-09-10 14:30',
        action: '인수자 검토 요청',
        userName: '김민수',
        userRole: 'handover_giver',
        detail: '정기 업무 및 중요 계정 정리를 완료하여 인수자 이지은 님에게 검토를 요청했습니다.'
      },
      {
        id: 'hist_3',
        timestamp: '2026-09-15 11:20',
        action: '인수 항목 확인',
        userName: '이지은',
        userRole: 'handover_receiver',
        detail: 'AWS 콘솔 및 일일 릴리즈 프로세스 확인 완료 처리.'
      }
    ],
    items: [
      {
        id: 'item_101',
        handoverId: 'handover_doc_001',
        category: 'routine',
        title: '정기 주간 배포 파이프라인 운영 및 핫픽스 롤백 절차',
        description: '매주 목요일 오후 3시 프로덕션 릴리즈. GitHub Actions 배포 워크플로우 실행 및 슬랙 릴리즈 알림 전송. 이슈 발생 시 이전 태그로 즉시 롤백하는 3단계 가이드 숙지.',
        priority: 'high',
        status: 'receiver_confirmed',
        targetDate: '2026-09-10',
        links: [
          { id: 'l1', title: '배포 파이프라인 가이드 위키', url: 'https://wiki.techcorp.internal/deploy-runbook' },
          { id: 'l2', title: 'GitHub Actions Releases', url: 'https://github.com/techcorp/platform-web/actions' }
        ],
        attachments: [
          { id: 'att1', name: '릴리즈_체크리스트_v2.pdf', size: '1.2MB', type: 'application/pdf' }
        ],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        giverNotes: '이지은 님과 함께 9월 10일 실제 스테이징 배포 리허설 1회 완료했습니다.',
        receiverFeedback: '배포 스크립트 실행 권한 부여받았고 정상 작동 확인했습니다.',
        confirmedAt: '2026-09-10 15:40',
        comments: [
          {
            id: 'c1',
            itemId: 'item_101',
            authorId: 'user_receiver_1',
            authorName: '이지은',
            authorRole: 'handover_receiver',
            authorPosition: '주임 개발자',
            content: '민수 님, 스테이징 환경에서 캐시 퍼지 API 호출 토큰은 어디서 갱신하나요?',
            createdAt: '2026-09-09 16:30',
            isResolved: true
          },
          {
            id: 'c2',
            itemId: 'item_101',
            authorId: 'user_giver_1',
            authorName: '김민수',
            authorRole: 'handover_giver',
            authorPosition: '시니어 개발자',
            content: '클라우드플레어 대시보드 API Tokens 메뉴에서 "Purge-Staging" 토큰 재발급받으시면 됩니다! 위키에 내용 추가해두었습니다.',
            createdAt: '2026-09-09 17:15',
            isResolved: true
          }
        ]
      },
      {
        id: 'item_102',
        handoverId: 'handover_doc_001',
        category: 'routine',
        title: 'Datadog 프론트엔드 RUM 및 Sentry 에러 트래킹 온콜 대응',
        description: 'Sentry unhandled exception 발생 시 Slack #dev-error-fe 채널 인입. P0(사용자 결제 불가), P1(핵심 기능 오류) 발생 시 30분 내 핫픽스 브랜치 개설.',
        priority: 'high',
        status: 'giver_completed',
        targetDate: '2026-09-18',
        links: [
          { id: 'l3', title: 'Sentry 대시보드', url: 'https://sentry.io/techcorp/frontend' }
        ],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        giverNotes: '알람 룰 설정 완료되어 있으며, 이지은 님 슬랙 멘션 그룹에 추가했습니다.',
        comments: [
          {
            id: 'c3',
            itemId: 'item_102',
            authorId: 'user_receiver_1',
            authorName: '이지은',
            authorRole: 'handover_receiver',
            authorPosition: '주임 개발자',
            content: '센트리 프로젝트 알람 필터링 규칙 추가 설명 부탁드립니다.',
            createdAt: '2026-09-16 10:00',
            isResolved: false
          }
        ]
      },
      {
        id: 'item_103',
        handoverId: 'handover_doc_001',
        category: 'projects',
        title: '공통 디자인 시스템 v2.0 컴포넌트 마이그레이션 프로젝트',
        description: '레거시 CSS-in-JS를 Tailwind + Radix UI 기반으로 전면 개편 중. 전체 40개 컴포넌트 중 32개 완료. 잔여 컴포넌트(Complex Table, DateRangePicker) 구조 및 Figma 토큰 동기화 작업 인계.',
        priority: 'high',
        status: 'in_progress',
        targetDate: '2026-09-25',
        links: [
          { id: 'l4', title: 'Storybook 디자인시스템 문서', url: 'https://design.techcorp.internal' },
          { id: 'l5', title: 'Figma Token Sync 가이드', url: 'https://figma.com/file/techcorp-design-system' }
        ],
        attachments: [
          { id: 'att2', name: 'DesignSystem_v2_Roadmap.pdf', size: '3.4MB', type: 'application/pdf' }
        ],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        giverNotes: '디자인팀 박하린 수석과 매주 화요일 11시 위클리 싱크가 잡혀있습니다.',
        comments: []
      },
      {
        id: 'item_104',
        handoverId: 'handover_doc_001',
        category: 'projects',
        title: '글로벌 다국어 i18n 확장 및 번역 플랫폼 TMS 연동',
        description: 'Lokalise API 자동 번역 파이프라인. 한국어/영어/일본어 리소스 키 관리 원칙 및 PR 시 자동 번역 검증 GitHub Bot 세팅.',
        priority: 'medium',
        status: 'giver_completed',
        targetDate: '2026-09-22',
        links: [],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        comments: []
      },
      {
        id: 'item_105',
        handoverId: 'handover_doc_001',
        category: 'documents_accounts',
        title: 'AWS Production 콘솔 및 CDN / S3 호스팅 인프라 관리자 계정',
        description: '플랫폼 정적 에셋 버킷(s3://techcorp-cdn-assets) 및 CloudFront 캐시 무효화 권한을 가진 IAM 계정 인계. 반드시 개인 2단계 인증(MFA) 활성화 필요.',
        priority: 'high',
        status: 'receiver_confirmed',
        targetDate: '2026-09-12',
        links: [
          { id: 'l6', title: 'AWS 콘솔 로그인 URL', url: 'https://techcorp.signin.aws.amazon.com/console' }
        ],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: true,
        sensitiveCredential: {
          accountName: 'AWS Platform-Frontend IAM',
          loginId: 'jieun.lee@techcorp.co.kr',
          passwordMasked: 'AWS-Prod#2026!PlatformSecureKey',
          otpOrAccessGuide: '1Password [TechCorp Engineering Vault]에 등록됨. 최초 로그인 시 비밀번호 변경 강제 설정됨.',
          url: 'https://techcorp.signin.aws.amazon.com/console'
        },
        giverNotes: 'IAM 정책 할당 완료했고 콘솔 정상 로그인 확인되었습니다.',
        receiverFeedback: 'MFA 등록 완료 및 CloudFront 캐시 무효화 테스트 성공했습니다.',
        confirmedAt: '2026-09-12 11:30',
        comments: []
      },
      {
        id: 'item_106',
        handoverId: 'handover_doc_001',
        category: 'documents_accounts',
        title: 'Figma Enterprise Organization 관리자 권한 및 UI 에셋 드라이브',
        description: '전사 디자인 시스템 라이브러리 게시 권한을 보유한 에디터 라이선스 계정 정보 및 Google Shared Drive 아카이브.',
        priority: 'medium',
        status: 'giver_completed',
        targetDate: '2026-09-15',
        links: [
          { id: 'l7', title: 'Google Drive UI Assets', url: 'https://drive.google.com/drive/folders/techcorp-fe' }
        ],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: true,
        sensitiveCredential: {
          accountName: 'Figma Org Editor Account',
          loginId: 'frontend-admin@techcorp.co.kr',
          passwordMasked: 'Figm@2026PlatformDesign#Key',
          otpOrAccessGuide: 'SSO 구글 워크스페이스 로그인 연동됨.',
          url: 'https://www.figma.com'
        },
        comments: []
      },
      {
        id: 'item_107',
        handoverId: 'handover_doc_001',
        category: 'contacts',
        title: '클라우드 보안 및 인프라 IDC 엔지니어 비상 연락망',
        description: '인프라 비상 장애 시 24시간 에스컬레이션 핫라인 및 Slack 전용 채널 (#infra-hotline)',
        priority: 'high',
        status: 'receiver_confirmed',
        targetDate: '2026-09-14',
        links: [],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        giverNotes: '인프라팀 최준혁 수석 (010-3321-9876, 내선 2014) / 비상 핫라인 등록 완료',
        confirmedAt: '2026-09-14 16:00',
        comments: []
      },
      {
        id: 'item_108',
        handoverId: 'handover_doc_001',
        category: 'contacts',
        title: '외부 결제 PG사(토스페이먼츠) 기술지원 담당 매니저',
        description: '웹 결제 SDK 및 가상계좌 웹훅 이슈 발생 시 다이렉트 컨택 포인트',
        priority: 'medium',
        status: 'giver_completed',
        targetDate: '2026-09-20',
        links: [],
        attachments: [],
        receiverId: 'user_receiver_1',
        receiverName: '이지은',
        isSensitive: false,
        giverNotes: '토스페이먼츠 기술지원: support-pg@tosspayments.com / 카카오톡 채널 [토스페이먼츠 개발자센터]',
        comments: []
      }
    ]
  },
  {
    id: 'handover_doc_002',
    title: '서비스 기획 및 그로스 마케팅 캠페인 인수인계서',
    department: '서비스기획·마케팅팀',
    jobRole: '선임 프로덕트 매니저 (PM)',
    giverId: 'user_giver_2',
    giverName: '한지우',
    giverPosition: '선임 프로덕트 매니저 (PM)',
    giverEmail: 'jiwoo.han@techcorp.co.kr',
    receiverId: 'user_receiver_2',
    receiverName: '강태양',
    receiverPosition: '그로스 매니저 (후임자)',
    receiverEmail: 'taeyang.kang@techcorp.co.kr',
    managerId: 'user_manager_2',
    managerName: '윤서연',
    managerPosition: '팀장 (마케팅 본부장)',
    managerEmail: 'sy.yoon@techcorp.co.kr',
    startDate: '2026-09-05',
    dueDate: '2026-09-28',
    status: 'approval_requested',
    templateOriginId: 'template_marketing',
    history: [
      {
        id: 'hist_m1',
        timestamp: '2026-09-05 09:00',
        action: '인수인계서 생성',
        userName: '한지우',
        userRole: 'handover_giver'
      },
      {
        id: 'hist_m2',
        timestamp: '2026-09-16 18:00',
        action: '인수 확인 완료 및 승인 요청',
        userName: '강태양',
        userRole: 'handover_receiver',
        detail: '모든 광고계정 이전 및 매체사 정산 확인을 마쳐 관리자 최종 승인을 요청했습니다.'
      }
    ],
    items: [
      {
        id: 'item_201',
        handoverId: 'handover_doc_002',
        category: 'routine',
        title: '일일 광고 매체별 집행 리포트 및 ROAS 성과 분석',
        description: 'Google, Meta, 카카오모먼트 일일 비용 취합 대시보드 업데이트',
        priority: 'high',
        status: 'receiver_confirmed',
        targetDate: '2026-09-10',
        links: [],
        attachments: [],
        receiverId: 'user_receiver_2',
        receiverName: '강태양',
        isSensitive: false,
        confirmedAt: '2026-09-12 10:00',
        comments: []
      },
      {
        id: 'item_202',
        handoverId: 'handover_doc_002',
        category: 'documents_accounts',
        title: 'Meta 광고관리자 비즈니스 계정 마스터 권한 이전',
        description: '월 5,000만원 한도 법인카드 연동 비즈니스 관리자 최고관리자 이전',
        priority: 'high',
        status: 'receiver_confirmed',
        targetDate: '2026-09-14',
        links: [],
        attachments: [],
        receiverId: 'user_receiver_2',
        receiverName: '강태양',
        isSensitive: true,
        sensitiveCredential: {
          accountName: 'Meta Business Manager',
          loginId: 'admanager@techcorp.co.kr',
          passwordMasked: 'MetaGrowth2026Secure$$',
          otpOrAccessGuide: '마스터 이메일 계정 2단계 인증 번호 필요'
        },
        confirmedAt: '2026-09-14 15:00',
        comments: []
      }
    ]
  }
];
