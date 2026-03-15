# 브랜드라이즈 캐러셀 템플릿 제작 가이드

mountain.chicken 스타일 기반 + 브랜드라이즈 오렌지(#FF9500) 적용.
HTML 레퍼런스 파일: `brandrise-carousel-template.html` (브라우저에서 열어 참고)

---

## 공통 설정

- **폰트**: Pretendard (없으면 Figma에서 Pretendard 검색하여 설치)
- **캔버스 사이즈**: 1080 x 1350 (Instagram 캐러셀 표준)
- **브랜드 컬러**: #FF9500 (오렌지)

---

## Slide 1: 표지 (인물사진 + 헤드라인)

### Figma에서 만들기

1. **프레임 생성**: `F` 키 > 1080 x 1350 입력

2. **배경 이미지 영역**
   - 프레임 선택 > Fill > 이미지 추가 (또는 회색 플레이스홀더 #2A2A2A)
   - 이미지 모드: **Fill** (비율 유지하며 채우기)

3. **하단 그라데이션 오버레이**
   - 프레임 내부에 Rectangle 생성: 1080 x 675 (하단 50%)
   - 위치: X=0, Y=675
   - Fill: Linear Gradient
     - 상단: rgba(0, 0, 0, 0) 투명
     - 중간: rgba(0, 0, 0, 0.4)
     - 하단: rgba(0, 0, 0, 0.85)

4. **브랜드 태그 (좌상단)**
   - 위치: X=60, Y=40
   - 오렌지 원: 44x44, Fill #FF9500, 텍스트 "B" (white, 20px, Black)
   - "BRANDRISE" 텍스트: white, 18px, SemiBold, letter-spacing 1px
   - 간격: 원과 텍스트 12px gap

5. **오렌지 액센트 라인**
   - 위치: 좌하단 X=60, Y=1180 (헤드라인 위)
   - Rectangle: 100 x 6, Fill #FF9500, radius 3

6. **헤드라인 텍스트**
   - 위치: X=60, Y=1210 (액센트 라인 아래 28px)
   - 폰트: Pretendard, ExtraBold, 86px
   - 색상: #FFFFFF
   - line-height: 1.2 (103px)
   - letter-spacing: -2
   - 예시: "크리에이터 이코노미에\n대한 환상과 단상"
   - 최대 너비: 960px (좌우 여백 60px씩)

7. **캐러셀 인디케이터 (하단 중앙)**
   - 위치: 하단 중앙, Y=1310
   - 활성 점: 24x8, radius 4, Fill #FF9500
   - 비활성 점: 8x8, 원, Fill rgba(255,255,255,0.4)
   - 총 5개, gap 8px

---

## Slide 2: 본문 슬라이드

### Figma에서 만들기

1. **프레임 생성**: 1080 x 1350, Fill #F6F0EB

2. **슬라이드 번호 뱃지**
   - 위치: X=60, Y=80
   - 원: 72x72, Fill #FF9500
   - 텍스트: "1", white, Pretendard ExtraBold, 36px, 중앙 정렬

3. **제목**
   - 위치: X=60, Y=188 (뱃지 아래 36px)
   - 폰트: Pretendard, ExtraBold, 68px
   - 색상: #1A1A1A
   - line-height: 1.25 (85px)
   - 예시: "크리에이터 이코노미의\n현실"
   - 최대 너비: 960px

4. **본문 텍스트**
   - 위치: X=60, Y=420
   - 폰트: Pretendard, Regular, 42px
   - 색상: #333333
   - line-height: 1.65 (69px)
   - 최대 너비: 960px
   - **하이라이트 텍스트**: 색상 #FF9500, Bold

5. **구분선**
   - 위치: Y=본문 아래 30px
   - Rectangle: 960 x 2, Fill rgba(0,0,0,0.08)

6. **인용문**
   - 좌측 오렌지 바: 6 x 높이, Fill #FF9500
   - 텍스트: 오렌지 바 우측 36px
   - 폰트: Pretendard, SemiBold, 46px, Italic
   - 색상: #1A1A1A
   - line-height: 1.45 (67px)

7. **하단 오렌지 바**
   - 위치: X=0, Y=1270
   - Rectangle: 1080 x 80, Fill #FF9500
   - 텍스트: "@brandrise_kr", white, SemiBold, 24px, 중앙 정렬

8. **캐러셀 인디케이터**
   - Slide 1과 동일, 위치 Y=1250 (오렌지 바 위)
   - 2번째 점 활성

---

## Slide 3: CTA 마지막 슬라이드

### Figma에서 만들기

1. **프레임 생성**: 1080 x 1350, Fill #1A1A1A

2. **로고 원 (중앙)**
   - 중앙 정렬, Y=440
   - 원: 120x120, Fill #FF9500
   - 텍스트: "B", white, Pretendard Black, 56px

3. **CTA 제목**
   - 중앙 정렬, Y=620 (로고 아래 56px)
   - 폰트: Pretendard, ExtraBold, 72px
   - 색상: #FFFFFF
   - line-height: 1.25 (90px)
   - text-align: center
   - 예시: "더 많은 인사이트가\n궁금하다면"

4. **서브 텍스트**
   - 중앙 정렬, Y=824
   - 폰트: Pretendard, Regular, 38px
   - 색상: #999999
   - 예시: "컨셉부터 운영까지 논스톱으로"

5. **CTA 버튼**
   - 중앙 정렬, Y=920 (서브 텍스트 아래 64px)
   - Auto Layout 프레임: padding 28 72, radius 60, Fill #FF9500
   - 텍스트: "DM으로 무료 상담 신청", white, Bold, 40px

6. **핸들**
   - 중앙 정렬, Y=1280
   - 텍스트: "@brandrise_kr", #666666, Medium, 24px

---

## 빠른 복제 팁

### 캐러셀 여러 장 만들기
1. Slide 2 프레임 선택 > `Cmd+D`로 복제
2. 숫자 뱃지: 1 → 2, 3, 4...
3. 텍스트만 교체

### 표지 배리에이션
1. Slide 1 프레임 선택 > `Cmd+D`로 복제
2. 배경 이미지만 교체
3. 헤드라인만 변경

### Export 설정
- 프레임 선택 > 우측 Export > PNG 2x (또는 JPG)
- 여러 프레임 동시 선택 후 한번에 Export 가능

---

## 컬러 팔레트 요약

| 용도 | 컬러 | HEX |
|------|------|-----|
| 브랜드 액센트 | 오렌지 | #FF9500 |
| 표지 배경 | 다크 | #1A1A1A ~ #2A2A2A |
| 본문 배경 | 베이지 | #F6F0EB |
| 제목 텍스트 (다크 bg) | 화이트 | #FFFFFF |
| 제목 텍스트 (라이트 bg) | 블랙 | #1A1A1A |
| 본문 텍스트 | 다크 그레이 | #333333 |
| 서브 텍스트 | 미디엄 그레이 | #999999 |
| 핸들 | 라이트 그레이 | #666666 |
| 하이라이트 | 오렌지 | #FF9500 |

## 타이포 요약

| 용도 | 폰트 | 사이즈 | 웨이트 |
|------|------|--------|--------|
| 표지 헤드라인 | Pretendard | 86px | ExtraBold |
| 본문 제목 | Pretendard | 68px | ExtraBold |
| CTA 제목 | Pretendard | 72px | ExtraBold |
| 본문 텍스트 | Pretendard | 42px | Regular |
| 인용문 | Pretendard | 46px | SemiBold |
| CTA 버튼 | Pretendard | 40px | Bold |
| CTA 서브 | Pretendard | 38px | Regular |
| 브랜드 태그 | Pretendard | 18px | SemiBold |
| 하단 바 / 핸들 | Pretendard | 24px | SemiBold/Medium |
