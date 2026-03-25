# Step 4: Figma 캡처 + 후처리

생성된 HTML을 피그마에 캡처하고, missing font를 교체한다.

## 4-1. 로컬 서버 기동

```bash
cd {brand-guide.html이 있는 디렉토리}
python3 -m http.server {포트} &
```
- 포트는 8765~8770 범위에서 빈 포트 사용
- `run_in_background`로 실행

## 4-2. Figma 캡처

```
1. generate_figma_design(outputMode: "existingFile", fileKey: {피그마 파일 키})
   → captureId 획득

2. open "http://localhost:{포트}/brand-guide.html#figmacapture={captureId}&figmaendpoint=...&figmadelay=3000"
   → 브라우저에서 캡처 실행

3. sleep 8 → generate_figma_design(captureId: {captureId})로 폴링
   → status가 completed일 때까지 반복 (최대 10회)
```

## 4-3. Missing Font 교체 (use_figma)

캡처 완료 후 반드시 실행한다. Figma 서버에 Pretendard가 없어서 한글 텍스트가 렌더링되지 않는 문제를 해결한다.

```javascript
// 1. 캡처된 프레임 찾기
const page = figma.root.children.find(p => p.name.includes("{페이지명}"));
await figma.setCurrentPageAsync(page);

// 이름이 정확하지 않을 수 있으므로 텍스트 내용으로 검색
const allText = page.findAll(n => n.type === "TEXT" && n.characters && n.characters.includes("Brand Identity"));
// 텍스트의 최상위 부모 프레임을 guideNode로 사용

// 2. 모든 텍스트 노드에서 Pretendard → Inter 교체
const textNodes = guideNode.findAll(n => n.type === "TEXT");
const weightMap = {
  "Light": "Light",
  "Regular": "Regular",
  "Medium": "Medium",
  "Semi Bold": "Semi Bold",
  "Bold": "Bold",
  "Extra Bold": "Extra Bold"
};

for (const t of textNodes) {
  if (t.fontName === figma.mixed) {
    // mixed font 처리: 글자별로 순회
    for (let i = 0; i < t.characters.length; i++) {
      const fn = t.getRangeFontName(i, i + 1);
      if (fn.family === "Pretendard") {
        const newStyle = weightMap[fn.style] || "Regular";
        await figma.loadFontAsync({ family: "Inter", style: newStyle });
        t.setRangeFontName(i, i + 1, { family: "Inter", style: newStyle });
      }
    }
  } else if (t.fontName && t.fontName.family === "Pretendard") {
    const newStyle = weightMap[t.fontName.style] || "Regular";
    await figma.loadFontAsync({ family: "Inter", style: newStyle });
    t.fontName = { family: "Inter", style: newStyle };
  }
}
```

## 4-4. 서버 종료

캡처 완료 후 로컬 서버가 자동 종료되지 않으면 수동 종료 불필요 (백그라운드 프로세스가 자연 종료됨).

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 텍스트 안 보임 | Missing font (Pretendard) | use_figma로 Inter 교체 (4-3) |
| 텍스트 컬러 흰색 | 인라인 style 누락 | HTML에 인라인 color 추가 후 재캡처 |
| 캡처 pending 지속 | 서버 미기동 또는 URL 오류 | 서버 상태 확인, 포트 변경 |
| 노드 ID not found | 페이지 전환 필요 | setCurrentPageAsync 후 텍스트 내용으로 검색 |
| 폰트 교체 에러 | fontName이 mixed | 글자별 getRangeFontName으로 처리 |
