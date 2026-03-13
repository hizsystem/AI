# Claude 메시지 (터미널 글씨 깨짐 대응)

## 질문: 상담 신청 폼이 Google Forms 맞나요?

광고 스크린샷에서 소스 URL이 `forms.gle/...` 로 보여서 물어보는 겁니다.

폼 플랫폼에 따라 전환 추적 자동화 방식이 달라져요:

| 플랫폼 | 픽셀 설치 | 전환 추적 방법 |
|--------|----------|--------------|
| Google Forms | 불가 | Google Sheets API로 응답 수집 |
| Tally/Typeform | 가능 | Webhook으로 실시간 전환 추적 |
| Notion Form | - | 이미 Notion MCP 연결되어 있어서 바로 연동 |
| 자체 랜딩페이지 | 가능 | 픽셀 + 전환 API 모두 가능 |

## 터미널 폰트 깨짐 해결 방법

터미널 설정에서 폰트를 변경하면 해결됩니다:

1. 터미널 > 설정 > 프로파일 > 텍스트 탭
2. 폰트를 다음 중 하나로 변경:
   - **D2Coding** (추천, 한글 코딩 폰트)
   - **Noto Sans Mono CJK KR**
   - **SF Mono** + 한글 fallback

또는 iTerm2를 사용 중이라면:
- Preferences > Profiles > Text > Font
- "Use a different font for non-ASCII text" 체크
- Non-ASCII font를 한글 지원 폰트로 설정
