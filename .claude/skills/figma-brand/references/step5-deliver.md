# Step 5: 납품

모든 작업이 완료되면 사용자에게 결과를 전달한다.

## 전달 내용

### 1. 피그마 파일 링크
```
피그마 브랜드 가이드가 추가됐어:
https://www.figma.com/design/{fileKey}?node-id={nodeId}
```

### 2. 저장된 파일 경로
```
브랜드 분석 문서: clients/{brand}/brand-analysis.md
HTML 백업: clients/{brand}/brand-guide.html
```

### 3. 후처리 안내
```
웬디(디자이너)에게 전달할 사항:
1. 폰트 교체: Inter → Pretendard (피그마 데스크톱에 Pretendard 설치 필요)
2. 로고 교체: 텍스트 로고를 실제 로고 이미지로 교체
3. 제품 사진: 플레이스홀더 영역에 실제 제품 사진 배치
4. 컬러 미세 조정: AI가 역추적한 컬러 → 실제 브랜드 컬러로 보정
5. 전체 레이아웃 다듬기
```

## 완료 메시지 템플릿

```
{브랜드명} 브랜드 가이드 생성 완료!

피그마: {URL}
분석 문서: clients/{brand}/brand-analysis.md

포함된 섹션:
✅ Cover
✅ Brand Identity
✅ Brand Colors (6컬러 + 제품별 페어링)
✅ Typefaces
✅ Logo Usage Rules
✅ Tone of Voice
{조건부 섹션 체크 표시}

웬디 전달 시 참고:
- Inter → Pretendard 폰트 교체 필요
- 로고를 실제 이미지로 교체
- 컬러 미세 조정 (AI 역추적 기반이라 보정 필요할 수 있음)
```
