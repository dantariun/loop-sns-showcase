# Loop — 개발 요구사항 정의서

> 작성일: 2026-11-09
> 목적: 일반 SNS 플랫폼의 **사용자 모바일 앱** 포트폴리오 프로젝트 (공개용)
> 연계 프로젝트
> - [sns-backend](https://github.com/dantariun/sns-backend) — `api-user` (8080) 의 API 계약을 따른다
> - [sns-admin](https://github.com/dantariun/sns-admin-dashboard) — 같은 도메인의 운영자 웹. 앱이 만든 콘텐츠를 관리하는 쪽

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Loop (저장소: `loop-sns-showcase`) |
| 유형 | 포트폴리오 (공개용) |
| 플랫폼 | iOS · Android **단일 코드베이스** (React Native) |
| 실서버 연동 | 없음 — 목업 데이터 기반 |
| 프레임워크 | Expo SDK 57 + React Native 0.86 + TypeScript |
| 주요 라이브러리 | Expo Router, TanStack Query, Zustand, NativeWind, Reanimated, FlashList |

### 1.1 세 프로젝트의 관계

```
                     ┌───────────────────────┐
                     │     sns-backend       │
                     │  (API 계약의 단일 출처) │
                     └───────────┬───────────┘
                     api-admin   │   api-user
                     (8081)      │   (8080)
                ┌────────────────┘        └────────────────┐
                ▼                                          ▼
        ┌───────────────┐                          ┌───────────────┐
        │  sns-admin    │                          │     Loop      │
        │ 운영자 웹(React)│                          │ 사용자 앱(RN)  │
        └───────────────┘                          └───────────────┘
           콘텐츠를 관리한다                           콘텐츠를 만든다
```

세 프로젝트는 **같은 도메인 모델을 공유**합니다. 회원·게시물·댓글·신고·공지·FAQ는
백엔드의 엔티티 정의를 기준으로 삼고, 앱은 그중 사용자에게 노출되는 면을 구현합니다.

### 1.2 목업으로 가는 이유

sns-admin 과 동일한 방침입니다. 앱의 포트폴리오 가치는 **화면·상태 관리·UX**에 있고,
백엔드 연동 여부는 그 가치를 바꾸지 않습니다. 또한 백엔드의 `api-user` 는 로드맵상
Phase 6~8 로 아직 미착수라, 연동을 전제하면 앱 진행이 백엔드에 묶입니다.

다만 **목업을 아무렇게나 만들지 않습니다.** 요청·응답 형식은 `sns-backend` 의
API 계약(§4.2)을 그대로 따르고, 데이터 접근은 Repository 인터페이스 뒤에 둡니다.
구현체만 교체하면 실 API 로 전환되는 구조를 유지합니다.

---

## 2. 기능 범위

### 2.1 포함 기능

`api-user` 의 기능 목록에 대응합니다.

| 영역 | 세부 기능 |
|------|-----------|
| **인증** | 로그인, SMS 인증, 회원가입(약관·정보 입력·프로필 설정), 닉네임 중복 확인, 계정 찾기, 비밀번호 재설정 |
| **홈 피드** | 팔로잉 피드 / 추천 피드 탭, 당겨서 새로고침, 무한 스크롤 |
| **게시물** | 상세 보기, 좋아요, 북마크, 신고, 관심없음, 작성(미디어 선택 → 미리보기 → 본문) |
| **댓글** | 목록, 작성, 수정, 삭제, 답글, 좋아요, 신고 |
| **검색** | 통합 검색(게시물·사용자), 자동완성, 인기 검색어, 검색 이력 |
| **프로필** | 내 프로필 / 타인 프로필, 프로필 편집, 팔로우·언팔로우, 팔로워·팔로잉 목록, 좋아요한 글·북마크 목록, 차단·신고 |
| **알림** | 알림 목록(유형별 탭), 미읽음 표시, 읽음 처리, 알림 수신 설정 |
| **채팅** | DM 목록, 대화방, 메시지 송수신, 읽음 처리, 메시지 요청 수락·거절 |
| **고객센터** | 공지사항 목록·상세, FAQ, 1:1 문의 작성·내역 |
| **설정** | 알림 토글, 화면 설정, 로그아웃, 회원 탈퇴 |

### 2.2 제외 기능

| 제외 항목 | 이유 |
|-----------|------|
| 상품·쇼핑·결제 | 커머스 영역. sns-admin 과 동일하게 SNS 범위로 한정 |
| 포인트·적립·출금 | 상동 |
| 실 서버 연동 (`api-user` 호출) | §1.2. Repository 교체 지점만 남겨 둠 |
| FCM 실제 푸시 수신 | 알림 **화면**은 구현, 디바이스 푸시 발송은 범위 밖 |
| WebSocket 실시간 채팅 | 채팅 **화면·송수신 흐름**은 구현, STOMP 연결은 범위 밖 |
| 소셜 로그인 SDK (카카오·네이버) | 외부 키 필요. 공개 저장소 범위 밖 |
| 실제 사진 라이브러리 접근 | 권한 흐름 대신 더미 미디어 그리드 사용 |
| 파일 업로드 (AWS S3) | 미디어 선택·미리보기 UI 는 구현. 실제 업로드는 목업 응답으로 대체 |

> 제외 항목은 "못 하는 것"이 아니라 **공개 포트폴리오에서 의도적으로 뺀 것**입니다.
> 각 항목은 교체 지점을 코드에 남겨 둡니다.

---

## 3. 화면 목록

Expo Router 파일 기반 라우팅 기준입니다.

```
/                                   스플래시 (데이터 워밍업 → 탭)

── 인증 (모달 스택)
/auth/login                         로그인
/auth/sms                           SMS 인증번호 입력
/auth/signup/terms                  약관 동의
/auth/signup/form                   계정 정보 입력
/auth/signup/profile                프로필 설정
/auth/find-account                  계정 찾기
/auth/reset-password                비밀번호 재설정

── 메인 탭
/(tabs)                             홈 피드 (팔로잉 / 추천)
/(tabs)/search                      검색
/(tabs)/write                       글쓰기 진입 (모달로 전환)
/(tabs)/activity                    알림
/(tabs)/profile                     내 프로필

── 게시물
/post/[id]                          게시물 상세 + 댓글
/post/[id]/likes                    좋아요한 사람
/write                              글쓰기 1 — 미디어 선택
/write/preview                      글쓰기 2 — 미리보기
/write/compose                      글쓰기 3 — 본문·해시태그
/write/location                     위치 태그 선택

── 프로필
/profile/[id]                       타인 프로필
/profile/[id]/follows               팔로워 / 팔로잉
/profile/edit                       프로필 편집
/profile/bookmarks                  북마크
/profile/liked                      좋아요한 게시물

── 검색
/search/result                      검색 결과 (게시물 / 사용자 탭)

── 채팅
/chat                               DM 목록
/chat/[id]                          대화방
/chat/requests                      메시지 요청

── 고객센터·설정
/settings                           설정
/settings/notifications             알림 수신 설정
/notices                            공지사항 목록
/notices/[id]                       공지사항 상세
/faqs                               FAQ
/inquiries                          1:1 문의 내역
/inquiries/new                      문의 작성
```

총 **34개 화면**.

---

## 4. 공통 요구사항

### 4.1 인증

- JWT Access / Refresh 토큰을 기기에 보관 (목업 단계에서도 동일한 흐름 유지)
- 미인증 상태로 보호 화면 접근 시 `/auth/login` 리다이렉트
- Access 만료 시 Refresh 로 자동 재발급 → 실패 시 로그아웃
- 토큰은 `expo-secure-store` 에 저장 (AsyncStorage 아님 — 민감 정보)

### 4.2 API 계약

목업 응답도 백엔드와 **같은 형식**을 사용합니다.

```json
// 성공 — 단건
{ "code": "SUCCESS", "data": { } }

// 성공 — 페이지
{ "code": "SUCCESS", "data": { "content": [], "totalElements": 120, "totalPages": 6, "number": 0, "size": 20 } }

// 실패
{ "code": "ERROR_CODE", "message": "에러 메시지" }
```

### 4.3 데이터 계층

```
features/*/use-*.ts      화면이 쓰는 쿼리·뮤테이션 훅
      ↓
data/repositories/       인터페이스 — 화면이 의존하는 유일한 계약
      ↓
data/mock/               목업 구현 (현재)     ← 교체 지점
data/http/               HTTP 구현 (미구현)
```

- 목업 구현도 **전부 `Promise` 를 반환**한다. 동기로 만들면 로딩·에러·재시도 경로가
  실제와 다른 모양이 되어 검증 가치가 사라진다
- 의도적 지연(200ms 내외)을 넣어 스켈레톤·당겨서 새로고침이 실제로 동작하는지 확인한다
- 서버 상태는 TanStack Query, 기기에만 존재하는 상태는 Zustand. **둘을 섞지 않는다**

### 4.4 상태 관리 규칙

| 구분 | 담당 | 예시 |
|------|------|------|
| 서버가 소유권을 갖는 데이터 | TanStack Query | 게시물, 사용자, 알림, 대화 |
| 기기에만 존재하는 선택 | Zustand | 알림 토글, 최근 검색어, 작성 중 초안 |

- 좋아요·팔로우·북마크 등 즉시성이 중요한 동작은 **낙관적 업데이트**. 실패 시 스냅샷 롤백
- 같은 데이터가 여러 화면에 떠 있을 수 있으므로, 쿼리 키 네임스페이스 단위로 일괄 갱신

### 4.5 디자인 시스템

- 색·치수 토큰을 **단일 출처**로 관리하고, 화면은 토큰 이름만 사용
- 라이트 / 다크 2벌 지원. 다크 대응은 같은 토큰을 다시 정의하는 것으로 끝낸다
- 공용 컴포넌트: Avatar, MediaBox, FollowButton, AppBar, Screen, EmptyState, LoadingState, ErrorState, Badge, BottomSheet
- 이미지 자산이 없으므로 아바타·미디어는 **시드 기반 색/그라데이션 플레이스홀더**로 렌더

### 4.6 접근성·UX

- 터치 대상 최소 44×44pt, 아이콘 버튼에 `accessibilityLabel` 부여
- 목록은 FlashList로 재활용 렌더링. 1,000건 스크롤에서 프레임 드랍 없을 것
- 키보드가 입력 필드를 가리지 않을 것 (KeyboardAvoidingView)
- 네트워크 실패 시 재시도 가능한 에러 상태를 화면마다 제공

---

## 5. 기술 스택

검증된 조합을 사용합니다. 개별 패키지의 최신 버전을 임의로 올리지 않고 **Expo SDK 가 검증한 매트릭스**를 따릅니다.

| 분류 | 기술 | 버전 |
|------|------|------|
| 런타임 | Expo SDK | 57 |
| | React Native | 0.86 (New Architecture) |
| | React | 19.2 |
| 언어 | TypeScript | 6.0 (strict) |
| 라우팅 | Expo Router | 57 (타입 세이프 라우트) |
| 서버 상태 | TanStack Query | 5 |
| 클라이언트 상태 | Zustand | 5 |
| 스타일 | NativeWind | 4.2 |
| | Tailwind CSS | 3.4 |
| 애니메이션 | Reanimated | 4.5 |
| 제스처 | Gesture Handler | 2.32 |
| 리스트 | FlashList | 2 |
| 그래픽 | react-native-svg | 15 |
| 보안 저장소 | expo-secure-store | SDK 57 |
| 린트·포맷 | Biome | 2.5 |
| 테스트 | Jest(jest-expo) + React Native Testing Library | 57 / 14 |
| E2E | Maestro | — |

> **NativeWind 5 / Tailwind 4 를 쓰지 않는 이유**: 작성 시점에 NativeWind 5는 RC 단계입니다.
> 기반 레이어는 안정 버전을 택합니다.

---

## 6. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| TypeScript | strict 모드, `any` 사용 금지 |
| 린트 | Biome 경고 0 |
| 테스트 | 데이터 계층·순수 함수 커버리지 우선. 화면은 핵심 흐름만 |
| 빌드 | `tsc --noEmit` · Biome · Jest 가 CI 에서 모두 통과 |
| 성능 | 피드 스크롤 60fps 유지, 콜드 스타트 3초 이내 |
| 플랫폼 | iOS 15+ / Android 7.0(API 24)+ |
| 민감 정보 | 저장소에 키·토큰·서버 주소 커밋 금지. `.env.example` 만 제공 |

---

## 7. 브랜치 전략 & 커밋 컨벤션

sns-backend 와 동일합니다.

```
main        기준 브랜치 — PR 병합만
feature/*   기능 개발
fix/*       버그 수정
docs/*      문서 작업
```

| 타입 | 설명 |
|------|------|
| `chore` | 초기화, 빌드 설정, 의존성 |
| `feat` | 기능 구현 |
| `fix` | 버그 수정 |
| `docs` | 문서 |
| `test` | 테스트 |
| `style` | 코드 스타일 (기능 변경 없음) |
| `refactor` | 리팩토링 |

---

## 8. 로컬 실행 방법

### 사전 요구사항

- Node.js 20+
- iOS 시뮬레이터: Xcode + iOS 시뮬레이터 런타임
- Android: Android Studio 에뮬레이터

### 실행

```bash
npm install
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run web        # 브라우저
```

> 네이티브 빌드가 필요 없습니다. 사용하는 네이티브 모듈이 전부 Expo 공식 모듈이라
> **Expo Go** 에서 그대로 동작합니다.

### 검증

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # Biome
npm test           # Jest
```
