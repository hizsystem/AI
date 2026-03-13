# Skill 07: merge-render

> 배경 이미지 + HTML 합성 → 최종 PNG 렌더링

## 호출 에이전트
developer

## 프로세스
1. 배경 이미지를 base64로 변환
2. HTML에 배경 레이어 + 반투명 오버레이 주입
3. Playwright로 최종 PNG 렌더링 (2500ms 폰트 대기)

## 실행
```bash
python3 merge_and_render.py
# 또는 단일 파일:
python3 html_to_png.py templates/{project}.html outputs/images/{project}.png
```

## 오버레이 규칙
- 다크 테마: rgba(배경색, 0.75-0.82)
- 라이트 테마: rgba(배경색, 0.80-0.88)
- 텍스트 가독성 우선

## 산출물
outputs/images/{project}_final.png
