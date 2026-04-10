# Meta API 세팅 가이드

## 토큰 권한 (필수)

현재 토큰 권한: `ads_management`, `ads_read`, `business_management`, `public_profile`

### 추가 필요한 권한 (크리에이티브 자동 생성용)
- `pages_manage_ads` — 페이지 대신 광고 크리에이티브 생성
- `pages_read_engagement` — 페이지 정보 조회

### 토큰 재발급 방법
1. https://developers.facebook.com/tools/explorer/ 접속
2. 앱: `Branrise` 선택
3. 권한 추가: `ads_management`, `pages_manage_ads`, `pages_read_engagement`
4. Generate Access Token → 로그인 → 토큰 복사
5. `.env`의 `META_ACCESS_TOKEN` 교체

### 장기 토큰 변환 (60일)
```bash
curl -s "https://graph.facebook.com/v25.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=APP_ID&\
client_secret=APP_SECRET&\
fb_exchange_token=SHORT_TOKEN"
```

## 앱 설정

- 앱 ID: `967934719097551`
- 앱 모드: **라이브** (2026-04-11 전환 완료)
- 개인정보처리방침 URL: `https://brandrise.kr`

## 광고 계정

| 키 | 계정 ID | 페이지 ID | Instagram |
|----|---------|----------|-----------|
| brandrise | act_1445966157231215 | 993429050523253 | @brandrise_kr |

## 이번 세팅에서 발견된 이슈 & 수정 사항

1. **예산 센트 변환 버그**: KRW 계정은 센트 변환 불필요 → `* 100` 제거
2. **입찰 전략**: `LOWEST_COST_WITHOUT_CAP` 명시 필요 (기본값이 BID_CAP으로 설정됨)
3. **Advantage 타겟 플래그**: API v25+에서 `targeting_automation.advantage_audience` 필수
4. **관심사 ID**: 하드코딩 ID는 유효하지 않음 → API 검색으로 실제 ID 확인 필요
5. **페이지 권한**: `pages_manage_ads` 없으면 크리에이티브 생성 불가
