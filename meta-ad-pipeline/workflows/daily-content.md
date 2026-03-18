# Daily Content Pipeline — Slack 연동 플로우

> Claude Code 세션에서 "오늘 콘텐츠 만들어줘" 한마디로 실행

## 전체 플로우

```
[아침] 주제 제안 → [Slack] 성민 확정 → [자동] 콘텐츠 제작
→ [Slack] 프리뷰 전송 → [Slack] 수정/컨펌 → [Slack] 최종 전달
```

## Step-by-Step

### Step 0: 세션 시작
트리거: `"오늘 콘텐츠 만들어줘"` 또는 `"daily"`

### Step 0.5: 세그먼트 확인 + 타겟 인사이트 로딩 (필수)

**⚠️ 이 단계를 건너뛰면 안 된다.**

1. **세그먼트 확인**: 오늘 콘텐츠의 타겟 세그먼트 결정 (기본값: 3-4)
   - `research/TARGET-SEGMENTS.md` 참조
2. **인사이트 로딩**: 세그먼트별 인사이트 파일 읽기
   - 세그먼트 2 (0-10억): `research/TARGET-INSIGHT.md`
   - **세그먼트 3-4 (10-100억)**: `research/TARGET-INSIGHT-MID.md` ← 최우선
3. 오늘 콘텐츠가 겨냥할 Pain Point 또는 Trigger 선정
4. Pain → Value → Proof 구조를 머릿속에 로딩

```
세그먼트 3-4 참조 섹션 (TARGET-INSIGHT-MID.md):
- §1 교차 Pain Point 맵 (공통 C1~C5 + 세그먼트별 고유)
- §2 통합 타겟 페르소나 (A: 전략 갈증형, B: 통합 갈증형)
- §3 Purchase Trigger TOP 5
- §4 핵심 메시지 프레임워크 (세그먼트별 톤 차이)
- §5 훅 카피 Best 20 (세그먼트별 10개씩)
- §8 메타 광고 소재 방향
```

### Step 1: 주제 제안 → Slack 전송
1. `feedback/feedback.md` 읽기 (이전 피드백 반영)
2. `context/` 폴더 참조 (포트폴리오, 서비스 라인업)
3. **인사이트 기반** 오늘의 주제 3안 생성
   - 각 주제에 "타겟 세그먼트 + 겨냥하는 Pain Point/Trigger" 명시
   - 세그먼트 3 예: `[Seg3 / Pain C2: CAC 상승] 광고비는 매달 오르는데, CAC를 줄이는 방법을 아세요?`
   - 세그먼트 4 예: `[Seg4 / Pain C4: 대행사 파편화] 대행사 3곳 쓰는데, 매출은 그대로라면?`
4. Slack으로 전송 (format_research_confirm)

```
Slack MCP: slack_send_message
채널: D065GRKNT4M (본인 DM)
```

**대기**: Slack 응답 확인

### Step 2: 응답 읽기 + 확정
1. Slack DM 최신 메시지 읽기
2. 선택된 주제 파싱
3. 수정 요청 시 → Step 1 재실행

```
Slack MCP: slack_read_channel
채널: D065GRKNT4M
limit: 5 (최근 5개)
```

### Step 3: 카피 생성 → Slack 전송
1. 확정된 주제로 카피 2-3안 작성
2. 각 안: 헤드라인 + 서브카피 + CTA
3. Slack으로 시안 전송 (format_copy_confirm)

**대기**: Slack 응답 확인

### Step 4: 응답 읽기 + 카피 확정
1. Slack DM 최신 메시지 읽기
2. 선택된 카피 확정
3. 수정 요청 시 → Step 3 재실행

### Step 5: 비주얼 제작
1. 확정된 카피로 HTML 템플릿 생성 (designer agent)
2. Gemini로 배경 이미지 생성 (generate_bg.py)
3. HTML + 배경 합성 (merge_and_render.py)
4. QA 검증 (validate_slide.py)

```bash
python3 generate_bg.py          # 배경 생성
python3 merge_and_render.py     # 합성 + 렌더링
python3 tools/validate_slide.py outputs/images/{name}.png
```

### Step 6: 프리뷰 → Slack 전송
1. QA 결과 포함하여 Slack 전송 (format_render_confirm)
2. 이미지 경로 안내 (로컬 파일 확인 요청)

**대기**: Slack 응답 확인

### Step 7: 수정 또는 승인
- **승인 (1)**: Step 8로 진행
- **수정 (2 + 피드백)**: feedback.md에 기록 → Step 5 재실행

### Step 8: 최종 전달
1. 최종 PNG + 인스타 캡션 생성
2. Slack으로 완료 알림 전송 (format_completion)
3. 파일 경로 안내

```
최종 산출물:
- outputs/images/{name}_final.png  (1080x1080 PNG)
- outputs/captions/{name}.txt      (인스타 캡션)
```

## 아침 스케줄링 (선택)

세션 종료 시 내일 아침 주제 제안을 예약할 수 있다:

```
Slack MCP: slack_schedule_message
채널: D065GRKNT4M
post_at: 내일 09:00 KST (Unix timestamp)
```

## 명령어 요약

| 명령어 | 동작 |
|--------|------|
| `오늘 콘텐츠 만들어줘` | 전체 플로우 실행 |
| `주제만 제안해줘` | Step 1만 실행 |
| `카피 써줘: {주제}` | Step 3부터 실행 |
| `이미지 만들어줘: {카피}` | Step 5부터 실행 |
| `내일 아침 예약해줘` | 스케줄 메시지 설정 |

## Slack 응답 읽기 규칙

1. 메시지 전송 후 `ts` 값 기억
2. `slack_read_channel`로 DM 최근 메시지 확인
3. 내가 보낸 메시지(bot) 이후 사용자 메시지가 있으면 → 응답으로 처리
4. 없으면 → "아직 응답이 없습니다. Slack을 확인해주세요." 안내
