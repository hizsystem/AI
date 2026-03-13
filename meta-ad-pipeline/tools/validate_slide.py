"""
슬라이드 QA 검증 스크립트
PNG/HTML 산출물의 품질을 자동으로 검증한다.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def validate_png(png_path: str) -> dict:
    """PNG 파일 기술 검증"""
    path = Path(png_path)
    checks = []

    # 1. 파일 존재
    if not path.exists():
        return {"status": "fail", "score": 0, "checks": [
            {"item": "파일 존재", "status": "fail", "note": f"{png_path} 없음"}
        ]}

    # 2. 파일 크기 (메타 광고 제한: 30MB, 권장: 5MB 이하)
    size_mb = path.stat().st_size / (1024 * 1024)
    checks.append({
        "item": "파일 크기",
        "status": "pass" if size_mb < 5 else "warn" if size_mb < 30 else "fail",
        "note": f"{size_mb:.1f}MB" + (" (최적화 권장)" if size_mb >= 5 else "")
    })

    # 3. 파일 확장자
    checks.append({
        "item": "파일 형식",
        "status": "pass" if path.suffix.lower() == ".png" else "fail",
        "note": path.suffix
    })

    # 4. 이미지 크기 (1080x1080)
    try:
        # PIL 없이 PNG 헤더에서 크기 읽기
        with open(path, "rb") as f:
            f.read(8)  # PNG signature
            f.read(4)  # chunk length
            f.read(4)  # IHDR
            width = int.from_bytes(f.read(4), "big")
            height = int.from_bytes(f.read(4), "big")

        is_correct_size = width == 1080 and height == 1080
        checks.append({
            "item": "캔버스 크기",
            "status": "pass" if is_correct_size else "fail",
            "note": f"{width}x{height}" + ("" if is_correct_size else " (1080x1080 필요)")
        })
    except Exception as e:
        checks.append({
            "item": "캔버스 크기",
            "status": "warn",
            "note": f"확인 불가: {e}"
        })

    return checks


def validate_html(html_path: str) -> list:
    """HTML 슬라이드 콘텐츠 검증"""
    path = Path(html_path)
    checks = []

    if not path.exists():
        return [{"item": "HTML 파일", "status": "fail", "note": "파일 없음"}]

    content = path.read_text(encoding="utf-8")

    # 1. brandrise 로고
    has_logo = "brandrise" in content
    checks.append({
        "item": "brandrise 로고",
        "status": "pass" if has_logo else "fail",
        "note": "" if has_logo else "로고 텍스트 없음"
    })

    # 2. CTA 바
    has_cta = "cta-bar" in content or "cta_bar" in content
    checks.append({
        "item": "CTA 바",
        "status": "pass" if has_cta else "fail",
        "note": "" if has_cta else "CTA 바 클래스 없음"
    })

    # 3. Pretendard 폰트
    has_font = "pretendard" in content.lower() or "Pretendard" in content
    checks.append({
        "item": "Pretendard 폰트",
        "status": "pass" if has_font else "warn",
        "note": "" if has_font else "Pretendard 참조 없음"
    })

    # 4. 캔버스 설정
    has_canvas = "1080px" in content
    checks.append({
        "item": "1080px 캔버스",
        "status": "pass" if has_canvas else "fail",
        "note": "" if has_canvas else "1080px 설정 없음"
    })

    # 5. overflow hidden
    has_overflow = "overflow: hidden" in content or "overflow:hidden" in content
    checks.append({
        "item": "overflow hidden",
        "status": "pass" if has_overflow else "warn",
        "note": "" if has_overflow else "overflow hidden 없음 (텍스트 잘림 가능)"
    })

    # 6. 한국어 콘텐츠 존재
    import re
    korean_chars = re.findall(r'[\uac00-\ud7af]', content)
    has_korean = len(korean_chars) > 5
    checks.append({
        "item": "한국어 콘텐츠",
        "status": "pass" if has_korean else "warn",
        "note": f"{len(korean_chars)}자" if has_korean else "한국어 텍스트 부족"
    })

    return checks


def run_validation(target_path: str) -> dict:
    """전체 QA 검증 실행"""
    path = Path(target_path)
    all_checks = []

    # PNG 검증
    if path.suffix.lower() == ".png":
        all_checks.extend(validate_png(str(path)))

        # 대응하는 HTML 찾기
        html_candidates = [
            path.parent.parent / "merged_html" / path.with_suffix(".html").name,
            path.parent.parent.parent / "templates" / path.with_suffix(".html").name,
        ]
        for html_path in html_candidates:
            if html_path.exists():
                all_checks.extend(validate_html(str(html_path)))
                break

    # HTML 검증
    elif path.suffix.lower() == ".html":
        all_checks.extend(validate_html(str(path)))

    # 점수 계산
    total = len(all_checks)
    passed = sum(1 for c in all_checks if c["status"] == "pass")
    warned = sum(1 for c in all_checks if c["status"] == "warn")
    failed = sum(1 for c in all_checks if c["status"] == "fail")

    score = int((passed + warned * 0.5) / total * 100) if total > 0 else 0
    status = "pass" if score >= 80 and failed == 0 else "fail"

    report = {
        "status": status,
        "score": score,
        "summary": f"{passed} pass / {warned} warn / {failed} fail (총 {total}항목)",
        "checks": all_checks,
        "fixes_required": [c["item"] + ": " + c["note"] for c in all_checks if c["status"] == "fail"]
    }

    return report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python3 tools/validate_slide.py <파일경로>")
        print("  예시: python3 tools/validate_slide.py outputs/images/ad_veggiet_v2.png")
        sys.exit(1)

    target = sys.argv[1]
    report = run_validation(target)

    print(f"\n{'='*50}")
    print(f"  QA 검증 결과: {report['status'].upper()} ({report['score']}점)")
    print(f"  {report['summary']}")
    print(f"{'='*50}\n")

    for check in report["checks"]:
        icon = "✅" if check["status"] == "pass" else "⚠️" if check["status"] == "warn" else "❌"
        note = f" — {check['note']}" if check["note"] else ""
        print(f"  {icon} {check['item']}{note}")

    if report["fixes_required"]:
        print(f"\n  🔧 수정 필요:")
        for fix in report["fixes_required"]:
            print(f"     - {fix}")

    # JSON 저장 (선택)
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\n  📄 리포트 저장: {output_path}")

    print()
