"""
Slack 알림 메시지 포매터
파이프라인 게이팅 포인트에서 Slack 컨펌 메시지를 생성한다.
실제 전송은 Claude Code MCP (mcp__plugin_slack_slack__slack_send_message) 사용.
"""
from __future__ import annotations

import json
from pathlib import Path


# 파이프라인 설정 로드
CONFIG_PATH = Path(__file__).parent.parent / "config" / "pipeline.json"


def load_config() -> dict:
    """pipeline.json 설정 로드"""
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    return {}


def get_channel_id() -> str:
    """Slack 채널 ID 반환"""
    config = load_config()
    return config.get("slack", {}).get("channel_id", "")


# ─── 메시지 포맷 함수들 ────────────────────────────────────


def format_research_confirm(
    project_name: str,
    target_audience: str,
    key_message: str,
    direction_options: list[str],
) -> str:
    """컨펌 1: 리서치 완료 → 방향성 승인 메시지"""
    options_text = "\n".join(
        f"{i+1}\ufe0f\u20e3 {opt}" for i, opt in enumerate(direction_options)
    )

    return f""":bell: *[brandrise Pipeline] 컨펌 요청 — 리서치 완료*

:pushpin: *프로젝트:* {project_name}
:round_pushpin: *단계:* 리서치 → 방향성 승인
:dart: *타겟:* {target_audience}

:memo: *핵심 메시지:*
> {key_message}

*방향성 선택:*
{options_text}
{len(direction_options)+1}\ufe0f\u20e3 수정 요청

:speech_balloon: 번호로 응답해주세요."""


def format_copy_confirm(
    project_name: str,
    copies: list[dict],
) -> str:
    """컨펌 2: 카피 완료 → 시안 선택 메시지

    copies: [{"label": "A안 - 문제 해결형", "headline": "...", "sub_copy": "..."}]
    """
    copy_blocks = []
    for i, copy in enumerate(copies):
        block = f"""{i+1}\ufe0f\u20e3 *{copy['label']}*
> :speaking_head_in_silhouette: _{copy['headline']}_
> :page_facing_up: {copy.get('sub_copy', '')}"""
        copy_blocks.append(block)

    copies_text = "\n\n".join(copy_blocks)

    return f""":bell: *[brandrise Pipeline] 컨펌 요청 — 카피 시안 선택*

:pushpin: *프로젝트:* {project_name}
:round_pushpin: *단계:* 카피 → 시안 선택

{copies_text}

{len(copies)+1}\ufe0f\u20e3 수정 요청

:speech_balloon: 번호로 응답해주세요. 수정 사항이 있으면 자유롭게 적어주세요."""


def format_render_confirm(
    project_name: str,
    image_count: int,
    image_names: list[str],
    qa_score: int | None = None,
) -> str:
    """컨펌 3: 최종 렌더 → PNG 승인 메시지"""
    files_text = "\n".join(f"  :white_check_mark: `{name}`" for name in image_names)
    qa_text = f"\n:bar_chart: *QA 점수:* {qa_score}점" if qa_score else ""

    return f""":bell: *[brandrise Pipeline] 컨펌 요청 — 최종 PNG 승인*

:pushpin: *프로젝트:* {project_name}
:round_pushpin: *단계:* 렌더링 → 최종 승인{qa_text}

:frame_with_picture: *생성된 이미지 ({image_count}장):*
{files_text}

_이미지를 확인한 후 응답해주세요._

1\ufe0f\u20e3 승인 — 이대로 진행
2\ufe0f\u20e3 수정 요청 — 피드백과 함께 응답

:speech_balloon: 번호로 응답해주세요."""


def format_completion(
    project_name: str,
    image_count: int,
    duration_mins: int | None = None,
) -> str:
    """파이프라인 완료 알림"""
    time_text = f" | :stopwatch: {duration_mins}분" if duration_mins else ""

    return f""":tada: *[brandrise Pipeline] 완료!*

:pushpin: *프로젝트:* {project_name}
:frame_with_picture: *최종 이미지:* {image_count}장{time_text}

`outputs/images/` 폴더에서 최종 파일을 확인하세요."""


def format_error(
    project_name: str,
    step_name: str,
    error_message: str,
) -> str:
    """에러 알림"""
    return f""":rotating_light: *[brandrise Pipeline] 오류 발생*

:pushpin: *프로젝트:* {project_name}
:round_pushpin: *단계:* {step_name}
:x: *오류:* {error_message}

파이프라인이 일시 중지되었습니다. 확인 후 재시작해주세요."""


# ─── CLI 테스트 ─────────────────────────────────────────


if __name__ == "__main__":
    print("=== 메시지 포맷 테스트 ===\n")

    print("--- 컨펌 1: 리서치 ---")
    msg1 = format_research_confirm(
        project_name="베지어트 리브랜딩 광고",
        target_audience="뷰티/헬스 스타트업 대표",
        key_message="리브랜딩으로 올리브베러 입점에 성공한 실제 사례",
        direction_options=[
            "성공사례 중심 — Before/After 비교",
            "데이터 중심 — 매출 상승 수치 강조",
        ],
    )
    print(msg1)

    print("\n--- 컨펌 2: 카피 ---")
    msg2 = format_copy_confirm(
        project_name="베지어트 리브랜딩 광고",
        copies=[
            {
                "label": "A안 - 직접 화법",
                "headline": "리브랜딩 1년 만에 올리브베러 입점",
                "sub_copy": "좋은 제품인데 안 팔린다면, 브랜드를 의심하세요.",
            },
            {
                "label": "B안 - 질문형",
                "headline": "왜 같은 제품인데 매출이 3배 차이날까?",
                "sub_copy": "답은 브랜딩에 있었습니다.",
            },
        ],
    )
    print(msg2)

    print("\n--- 컨펌 3: 최종 렌더 ---")
    msg3 = format_render_confirm(
        project_name="베지어트 리브랜딩 광고",
        image_count=1,
        image_names=["ad_veggiet_final.png"],
        qa_score=100,
    )
    print(msg3)

    print(f"\n채널 ID: {get_channel_id()}")
