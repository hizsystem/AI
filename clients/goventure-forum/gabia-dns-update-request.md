# 가비아 DNS 레코드 추가/수정 요청

**도메인**: goventureforum.com (확인 필요)
**요청일**: 2026-03-12
**목적**: 이메일 수신 포워딩(ImprovMX) 설정 추가

---

## 1. MX 레코드 추가 (신규)

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | mx1.improvmx.com | 10 |
| MX | @ | mx2.improvmx.com | 20 |

> 현재 MX 레코드가 비어있다면 위 내용을 추가해 주세요.

---

## 2. SPF 레코드 수정 (기존 TXT 레코드 업데이트)

| 항목 | 값 |
|------|-----|
| **기존** | `v=spf1 include:mail.stibee.com ~all` |
| **수정** | `v=spf1 include:mail.stibee.com include:spf.improvmx.com ~all` |

> 기존 SPF에 ImprovMX의 SPF 주소(`include:spf.improvmx.com`)를 추가합니다.

---

## 3. DKIM 및 DMARC — 변경 없음 (유지)

아래 기존 설정은 그대로 유지해 주세요:

- **DKIM**: `stb._domainkey` (스티비용)
- **DMARC**: `_dmarc`

---

## 변경 후 전체 DNS 레코드 예상 상태

| Type | Name | Value | Priority | 비고 |
|------|------|-------|----------|------|
| MX | @ | mx1.improvmx.com | 10 | **신규** |
| MX | @ | mx2.improvmx.com | 20 | **신규** |
| TXT | @ | v=spf1 include:mail.stibee.com include:spf.improvmx.com ~all | - | **수정** |
| TXT | stb._domainkey | (기존 DKIM 값) | - | 유지 |
| TXT | _dmarc | (기존 DMARC 값) | - | 유지 |

---

## 참고사항

- ImprovMX: 커스텀 도메인 이메일을 기존 이메일(Gmail 등)로 포워딩해주는 서비스
- MX 레코드 추가 후 반영까지 최대 24~48시간 소요될 수 있음
- SPF 레코드는 하나의 TXT 레코드에 통합해야 함 (별도 레코드로 분리 시 인증 실패 가능)
