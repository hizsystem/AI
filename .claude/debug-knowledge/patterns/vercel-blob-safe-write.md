# Pattern: Vercel Blob 안전한 쓰기

## applies_to
vercel, blob, storage, put, save

## 체크리스트
1. `addRandomSuffix: false` 사용 시 반드시 `allowOverwrite: true` 함께 설정
2. delete-then-put 패턴 사용 금지 (데이터 공백 구간 발생)
3. fetch로 Blob 읽을 때 `cache: "no-store"` 필수
4. 같은 Blob 스토어를 쓰는 모든 storage 파일을 동시에 수정

## 올바른 패턴
```typescript
await put(path, JSON.stringify(data), {
  access: "public",
  contentType: "application/json",
  addRandomSuffix: false,
  allowOverwrite: true,  // 필수
});
```

## 잘못된 패턴
```typescript
// 삭제 후 쓰기 — 레이스 컨디션 위험
await del(oldBlob.url);
await put(path, data, { addRandomSuffix: false });
```

## Related Issues
- #001
