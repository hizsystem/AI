# Debug Knowledge Index

> 이 파일은 디버깅 이슈와 패턴의 인덱스입니다.
> 에이전트가 자동으로 관리하며, 수동 편집도 가능합니다.
> ID 규칙: 최대 ID + 1, 3자리 zero-padding (001, 002, ...), 삭제된 ID 재사용 안 함.

## Issues

| ID | Title | Project | Tags | Occurrences | Status |
|----|-------|---------|------|-------------|--------|
| #001 | huenic-storage delete-then-put 레이스 + 캐시 미적용 | content-calendar | blob, vercel, storage, huenic, race-condition, cache | 1 | resolved |

## Patterns

| Pattern | Related Issues | Applies To |
|---------|---------------|------------|
| vercel-blob-safe-write | #001 | vercel, blob, storage, put, save |
