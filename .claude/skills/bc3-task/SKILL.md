---
name: bc3-task
description: BC3T 대시보드에 태스크 추가/조회/수정. 어떤 워크트리에서든 "태스크 추가해줘"로 바로 반영.
triggers:
  - "태스크 추가"
  - "task 추가"
  - "태스크 확인"
  - "태스크 목록"
  - "bc3 task"
  - "bc3-task"
---

# BC3T Task 스킬

대시보드(hiz-brand-dashboard.vercel.app)의 Task Schedule에 태스크를 추가/조회/수정하는 스킬.
어떤 워크트리에서든 자연어로 태스크를 관리할 수 있다.

## API 엔드포인트

- **Base URL**: `https://hiz-brand-dashboard.vercel.app`
- **인증**: `Authorization: Bearer {ADMIN_PASSWORD}` 헤더 (ADMIN_PASSWORD는 사용자에게 1회 물어본 후 세션 내 재사용)

### 태스크 조회
```
GET /api/tasks
```

### 태스크 추가
```
POST /api/tasks
Content-Type: application/json

{
  "type": "task",
  "title": "태스크명",
  "projectSlug": "huenic",
  "assigneeId": "sumin",
  "status": "pending",
  "startDate": "2026-04-11",
  "endDate": "2026-04-18"
}
```

### 태스크 수정
```
PATCH /api/tasks
Content-Type: application/json

{
  "id": "태스크ID",
  "status": "done"
}
```

### 태스크 삭제
```
DELETE /api/tasks?id=태스크ID
```

## 프로젝트 슬러그 매핑

| 프로젝트 | slug |
|---------|------|
| HUENIC | `huenic` |
| 미례국밥 | `mirye-gukbap` |
| 댄싱컵 | `dancingcup` |
| 고벤처포럼 | `goventure` |
| 브랜드라이즈 | `brandrise` |
| HD현대오일뱅크 | `hdoilbank` |
| 명동식당 | `myeongdong` |

## 팀원 ID 매핑

| 이름 | id | 역할 |
|------|-----|------|
| 우성민 (Green) | `green` | Lead PM |
| 김남중 | `namjung` | PM |
| 이수민 | `sumin` | Designer |
| 나석환 | `seokhwan` | PM |
| 안지은 | `jieun` | PM |

## 상태값

| 상태 | 값 |
|------|-----|
| 대기 | `pending` |
| 진행중 | `in-progress` |
| 완료 | `done` |

## 실행 흐름

### 태스크 추가 시

1. 사용자 메시지에서 추출:
   - **태스크명** (필수)
   - **담당자** → 팀원 이름을 id로 매핑 (예: "이수민" → `sumin`)
   - **프로젝트** → 현재 워크트리 또는 대화 맥락에서 추론 (예: huenic 워크트리면 `huenic`)
   - **기간** → 시작일/종료일. 없으면 오늘~7일 후 기본값
   - **상태** → 없으면 `pending` 기본값

2. 추출한 정보를 확인:
   ```
   태스크: 브랜드덱 국문 초안
   프로젝트: HUENIC
   담당자: 이수민
   기간: 4/11 ~ 4/18
   상태: 대기
   
   이대로 추가할까요?
   ```

3. 사용자 확인 후 API 호출 (WebFetch 사용):
   - `POST /api/tasks` with `Authorization: Bearer {password}` 헤더
   - 비밀번호를 모르면 사용자에게 한 번만 물어본다

4. 결과 리포트:
   ```
   추가 완료! 대시보드에서 확인: https://hiz-brand-dashboard.vercel.app/admin
   ```

### 태스크 조회 시

1. API에서 전체 보드 조회
2. 프로젝트별 또는 담당자별로 그룹핑하여 표시:
   ```
   📋 현재 태스크 (5개)
   
   🌱 HUENIC (3)
     브랜드덱 국문 초안 | 이수민 | 진행중 | 4/11~4/18
     인스타 4월 기획안 | 인국 | 대기 | 4/14~4/20
     올영 체험단 시안 | 우성민 | 완료 | 4/7~4/11
   
   🍲 미례국밥 (2)
     촬영 디렉션 시트 | 김남중 | 진행중 | 4/10~4/15
     4월 콘텐츠 캘린더 | 우성민 | 대기 | 4/14~4/25
   ```

### 태스크 수정 시

1. 조회 후 해당 태스크 ID 찾기
2. PATCH로 상태/기간/담당자 변경

## 자연어 예시

사용자가 이렇게 말하면:

- "브랜드덱 이수민한테 추가해줘" → huenic(맥락), sumin, 오늘~+7일
- "인국님 인스타 기획 4/14~4/20" → inguk, 기간 지정
- "태스크 뭐 있어?" → 전체 조회
- "브랜드덱 완료 처리해줘" → 해당 태스크 done으로 변경
- "남중님 미례국밥 촬영 내일부터" → namjung, mirye-gukbap, 내일~+7일

## 주의사항

- API 호출 시 WebFetch 도구를 사용한다
- 인증이 필요하면 사용자에게 Admin 비밀번호를 물어본다 (첫 1회만)
- 프로젝트를 추론할 수 없으면 사용자에게 물어본다
- 날짜는 항상 YYYY-MM-DD 형식으로 변환한다
- 오늘 날짜는 시스템에서 자동 인식한다
