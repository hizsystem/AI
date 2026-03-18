# Meta Ad Creative Team - Design Document

> 작성일: 2026-02-24
> 상태: 승인됨
> 목적: Gemini 3 Pro 기반 메타 광고 소재 자동 제작 파이프라인

---

## 아키텍처

- **오케스트레이터**: main.py (Team Lead)
- **AI 백엔드**: Gemini 3 Pro API (gemini_client.py)
- **에이전트**: Python 스크립트 5개 (Bash: run_agent로 실행)
- **데이터 전달**: JSON 파일 (outputs/)
- **최종 산출물**: JSON 5개 + PNG 13개 (카드뉴스 세트)

## 파이프라인 흐름

```
Phase 1 (순차): 정보수집 → 리서치 → 카피라이팅
Phase 2 (순차): 디자인 → 프롬프팅 → 이미지 생성
```

## 에이전트 구성

| # | 에이전트 | 인풋 | 아웃풋 |
|---|---------|------|-------|
| 1 | 정보수집 | 세일즈 플랜 + 클라이언트 브리프 | 01_product_info.json |
| 2 | 리서치 | product_info + 시장 데이터 | 02_research.json |
| 3 | 카피라이팅 | research + product_info | 03_copy.json |
| 4 | 디자인 | copy + research | 04_design.json |
| 5 | 프롬프팅 | design + copy | 05_prompts.json |

## 레퍼런스 분석 요약

### 레이아웃 3가지 타입
- Type A: 사진 + 텍스트 오버레이 (levigrowth, yopletter, workmore)
- Type B: 그래픽 디자인 (setoworks, litmers)
- Type C: 텍스트 온리 (de.blur, mountain.chicken)

### 카피 3단 구조
1. 훅 (도발적 질문/문제 제기)
2. 가치 (해결책/베네핏)
3. CTA (긴급성 + 행동 유도)

### 컬러 시스템
- 배경: 다크(70%) / 라이트(20%) / 사진(10%)
- CTA바: 블루(신뢰) / 골드(긴급) / 퍼플(프리미엄)
- 텍스트: 화이트 메인 + 컬러 강조

### 전환 장치
- 긴급성, 무료/저가, 권위, 숫자, 대비, 도발

## 참조 계정 (15개)
levigrowth_official, dalpha.ai, oz_coding_school, setoworks_official,
brdq_official, litmers_kr, workmore.seoul, nps.partners,
underdog_founders, pocketcompany_official, bbud_official,
mountain.chicken, de.blur, yopletter

## 13개 PNG 구성 (카드뉴스 세트)
- carousel_01~10.png (1080x1080, 캐러셀)
- single_01~02.png (1080x1080, 피드)
- thumbnail.png (1080x1920, 스토리/릴스)
