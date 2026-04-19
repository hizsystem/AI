# 휴닉 주간 리포트 & KPI 운영 가이드 (내부용)

> **목적**: BRANDRISE 대시보드(`hiz-brand-dashboard.vercel.app/clients/huenic`)에서
> 주간 리포트·KPI를 돌리기 위한 내부 절차·책임·복구 매뉴얼.
>
> 관련 문서:
> - 휴닉팀 입력 가이드: `clients/huenic/sheets/시트-입력-가이드.md`
> - 운영 철학: `clients/huenic/project-operation-plan.md` (코치, not 플레이어)
> - 시트 원본: [HUENIC 대시보드 데이터](https://docs.google.com/spreadsheets/d/1v77o182cd9Wuw52csuaavWlfLlm3hCVcGOETk39MocA)
> - 대시보드: [hiz-brand-dashboard](https://hiz-brand-dashboard.vercel.app/clients/huenic)

## 1. 데이터 흐름 (한 장 요약)

```
Google Sheets (원본 수치)  ──CSV 파싱──▶  Next.js API  ──▶  대시보드 탭
                                           ▲
Vercel Blob (코멘트/계획/가이드) ──────────┘ (API에서 머지)
```

- **시트(원본)**: 메트릭·베스트콘텐츠·트렌드 — 인국님이 주간/월말 입력
- **Blob(주관 데이터)**: 주간 코멘트, 다음주 계획, 가이드 시리즈 — 대시보드 UI에서 Green이 입력
- **API 머지**: `/api/huenic/[brand]/reports/[week]`가 두 소스를 합쳐 응답

## 2. 주간·월간 운영 루틴

### 금요일 (매주, 휴닉팀 5분 + HIZ 11분)
| # | 담당 | 작업 | 위치 | 소요 |
|---|------|------|------|------|
| 1 | 인국 | `주간성과` 한 줄 (팔로워·게시물·참여율·도달) | 시트 | 3분 |
| 2 | 인국 | `베스트콘텐츠` 1~3개 | 시트 | 2분 |
| 3 | Green | 대시보드 주간 리포트 탭 열어 **코멘트 + 다음주 계획** 작성 | 대시보드 | 10분 |
| 4 | Green | 스크린샷 → 슬랙 `#huenic`에 공유 | 슬랙 | 1분 |

> ℹ️ `ER추이` / `참여율추이` 탭은 연동이 제거됐습니다. KPI 참여율 차트는 `주간성과`의
> `참여율` 컬럼에서 자동 생성되므로 인국님의 주간 입력은 **2개 탭**만 필요합니다.

### 월말 (매월 마지막 영업일, 휴닉팀 7분 + HIZ 30분)
| # | 담당 | 작업 | 위치 | 소요 |
|---|------|------|------|------|
| 1 | 인국 | `월간KPI` 한 줄 (브랜드별) | 시트 | 5분 |
| 2 | 인국 | `팔로워추이` 월 단위 갱신 | 시트 | 2분 |
| 3 | Green | KPI 탭 확인 + 월간 리포트 HTML 작성 | `/report` 스킬 | 30분 |
| 4 | Green | 대표(지나님) 전달, 다음달 플래닝 회의 준비 | 슬랙/노션 | — |

## 3. 시트 양식 — 필수 필드 (요약)

상세는 `clients/huenic/sheets/시트-입력-가이드.md` 참고. 아래는 체크리스트.

### `주간성과`
`브랜드 | 주차 | 기간 | 팔로워 | 팔로워증감 | 게시물수 | 참여율 | 참여율증감 | 최고좋아요 | 도달 | 도달증감`
- 브랜드: **베지어트** / **빙커** (한글)
- 주차: **`2026-W16`** 형식 (ISO week)
- 숫자는 콤마·`%` 없이

### `월간KPI`
`브랜드 | 연도 | 월 | 팔로워 | 팔로워증감 | 팔로워증감률 | 월간게시물 | 게시물증감 | 게시물증감률 | 평균참여율 | 참여율증감 | 월간도달 | 도달증감 | 도달증감률`

### `베스트콘텐츠`
`브랜드 | 주차 | 제목 | 유형 | 좋아요 | 댓글`
- 유형: **피드 / 릴스 / 스토리**

### `팔로워추이`
`브랜드 | 월 | 전체 | 자연유입 | 광고`
- 월: `2025-11`, `2025-12`, `2026-01`... (누적 시계열)

## 4. 대시보드 사용법

### 주간 리포트 탭 (`?tab=report`)
- 상단 좌우 화살표로 주차 이동
- 데이터 없으면 "이 주의 리포트가 아직 없습니다" — 시트에 해당 주차 행 추가하면 5분 내 자동 반영 (시트 API `revalidate: 300`)
- **코멘트**(잘한 점·개선할 점·시도해볼 것) + **다음주 계획** 은 여기서 직접 편집 → Blob 저장

### KPI 탭 (`?tab=kpi`)
- 월 전환 가능
- 월간KPI 시트에 해당 `연도·월` 행 없으면 404 → 빈 상태

### 가이드 탭 (`?tab=guide`)
- 베지어트 8개 시리즈 / 빙커 3개 시리즈
- "수정" 버튼으로 훅·레퍼런스·예시 편집 → Blob 저장

## 5. 복구 & 트러블슈팅

| 증상 | 원인 | 조치 |
|------|------|------|
| 가이드 탭이 상단 메뉴에서 사라짐 | admin UI 저장 중 `ig-guide` 블록 누락 | 자동 복원 (union merge) + 수동: `node content-calendar/scripts/fix-huenic-guide-tab.mjs` |
| 가이드 탭 본문 비어 있음 | Blob `huenic/{brand}/guide.json` 손상 | `curl -X POST {host}/api/huenic/{brand}/guide/reseed` (배포에 있다면) 또는 관리자 복구 |
| 주간 리포트 "아직 없음" | 시트에 해당 주차 행 없음 | `주간성과` 탭에 행 추가 |
| KPI "아직 없음" | 시트에 해당 월 행 없음 | `월간KPI` 탭에 행 추가 |
| 수치 반영 지연 | 시트 CSV 캐시 | 5분 후 재로드 / 필요 시 재배포 |
| 관리자 설정 반영 안 됨 | 람다 메모리 캐시 | **TTL 60초 내 자동 반영** (2026-04-19 e3a7f49 배포 후) |

## 6. 재발 방지 아키텍처 (2026-04-19 적용)

1. **Union merge**: `DEFAULT_PROJECT_CONFIGS`에 선언된 블록은 Blob에서 지워도 자동 복원
2. **CONFIG_CACHE TTL 60초**: Blob 수정 시 최대 60초 내 반영
3. **복구 스크립트**: `content-calendar/scripts/fix-huenic-guide-tab.mjs` (자동 백업)
4. **가이드 시드 폴백**: `content-calendar/src/data/huenic-seed/{veggiet,vinker}-guide.json`

## 7. 관련 파일 인덱스

### 앱 코드
- 라우트: `content-calendar/src/app/clients/[slug]/page.tsx`
- 대시보드: `content-calendar/src/components/DashboardClient.tsx`
- 탭 컴포넌트: `content-calendar/src/components/huenic/{Calendar,WeeklyReport,Kpi,Guide,Moodboard,Ref}Tab.tsx`
- API: `content-calendar/src/app/api/huenic/[brand]/{reports,kpi,guide,refs}/`
- 스토리지: `content-calendar/src/lib/huenic-storage.ts`
- 설정 저장소: `content-calendar/src/lib/client-config-storage.ts`
- 시트 파서: `content-calendar/src/lib/google-sheets.ts`

### 운영·클라이언트 문서
- 휴닉팀 입력 가이드: `clients/huenic/sheets/시트-입력-가이드.md`
- 프로젝트 운영 플랜: `clients/huenic/project-operation-plan.md`
- 킥오프 랩업: `clients/huenic/kickoff-meeting-wrap-20260318.md`

## 8. 현재 상태 (2026-04-19 기준)

| 항목 | 상태 | 비고 |
|------|------|------|
| 가이드 탭 (베지어트·빙커) | ✅ 복원 완료 | Blob 재시드 + union merge 배포됨 |
| W16 주간성과 (4/13~4/19) | ⚠️ 시트 입력 대기 | 인국님 요청 필요 → `slack-sheet-input-request-20260419.md` 참고 |
| 2026-04 월간KPI | ⚠️ 4/30 입력 예정 | 휴닉팀과 아직 요청·합의 안 됨 |
| 팔로워추이 2026-04 | ⚠️ 4/30 입력 예정 | 동상 |
| 휴닉팀 주간 입력 루틴 | ❌ **미정립** | 이번에 공식 런칭 필요 |

## 9. 다음 액션 (Green)

1. [ ] 인국님께 슬랙 메시지 발송 → `slack-sheet-input-request-20260419.md`
2. [ ] W16 입력 완료 후 코멘트·다음주 계획 작성 (예상: 4/22 화)
3. [ ] 4/30 월간 루틴 사전 리마인드 슬랙 (4/28 월요일에)
4. [ ] 첫 주간 리포트 지나님께 공유 (프로세스 가시화)
