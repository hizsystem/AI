# #001 — huenic-storage.ts delete-then-put 레이스 + 캐시 미적용

## 요약
`huenic-storage.ts`의 save 함수들이 `allowOverwrite: true` 없이 delete→put 패턴을 사용.
삭제-쓰기 사이 데이터 공백 + del 실패 시 Blob 누적 위험.
읽기에서 `cache: "no-store"` 미적용으로 stale 데이터 반환 가능.

## 수정 파일
- content-calendar/src/lib/huenic-storage.ts

## 수정 내용
1. `del` import 및 delete-then-put 패턴 제거
2. `allowOverwrite: true` 추가 (storage.ts와 동일 패턴)
3. fetch에 `cache: "no-store"` 추가 (4곳 중 2곳 누락분)

## 근본 원인
storage.ts 수정 시 huenic-storage.ts를 동시에 업데이트하지 않아 패턴 불일치 발생.
두 파일이 같은 Vercel Blob 스토어를 공유하므로 한쪽의 불안정이 전체에 영향.

## 재발 방지
- Blob 저장 로직 수정 시 storage.ts와 huenic-storage.ts 모두 확인
- save 함수는 항상 `addRandomSuffix: false` + `allowOverwrite: true` 쌍으로 사용
- get 함수의 fetch에는 항상 `cache: "no-store"` 적용

## Tags
blob, vercel, storage, huenic, race-condition, cache
