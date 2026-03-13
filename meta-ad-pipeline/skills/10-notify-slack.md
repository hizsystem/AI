# Skill 10: notify-slack

> Slack 채널로 컨펌 요청 전송

## 호출
orchestrator (게이팅 포인트에서 자동 호출)

## 프로세스
1. 현재 단계 + 산출물 요약 메시지 작성
2. Slack 채널로 전송 (MCP slack 도구 사용)
3. 사용자 응답 대기
4. 응답을 다음 에이전트에 전달

## 메시지 포맷
```
🔔 [brandrise Pipeline] 컨펌 요청

📌 프로젝트: {project_name}
📍 단계: {step_name}
📋 요약: {summary}

선택지:
1️⃣ {option_1}
2️⃣ {option_2}
3️⃣ 수정 요청

💬 번호로 응답해주세요.
```

## 피드백 기록
사용자 응답 중 수정 요청이 있으면 feedback/feedback.md에 기록.
