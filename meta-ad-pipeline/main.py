#!/usr/bin/env python3
"""
Meta Ad Creative Pipeline - 메인 오케스트레이터
5단계 에이전트 파이프라인을 순차 실행하고, 최종 이미지를 생성한다.

사용법:
  python main.py                    # 전체 파이프라인 실행
  python main.py --from 3           # Agent 3부터 실행 (이전 산출물 재사용)
  python main.py --only 5           # Agent 5만 실행
  python main.py --generate-images  # 이미지 생성만 실행 (05_prompts.json 필요)
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent))

import gemini_client
from agents import (
    agent_01_info_collector,
    agent_02_researcher,
    agent_03_copywriter,
    agent_04_designer,
    agent_05_prompt_engineer,
)


AGENTS = [
    (1, "정보수집", agent_01_info_collector),
    (2, "리서치", agent_02_researcher),
    (3, "카피라이팅", agent_03_copywriter),
    (4, "디자인", agent_04_designer),
    (5, "프롬프팅", agent_05_prompt_engineer),
]


def run_pipeline(from_agent: int = 1, only_agent: int | None = None):
    """에이전트 파이프라인 실행"""
    print("=" * 60)
    print("  Meta Ad Creative Pipeline")
    print("  datarise x Gemini 3 Pro")
    print("=" * 60)

    start_time = time.time()

    for agent_id, name, module in AGENTS:
        if only_agent and agent_id != only_agent:
            continue
        if agent_id < from_agent:
            print(f"\n[Skip] Agent {agent_id} ({name}) — 이전 산출물 재사용")
            continue

        print(f"\n{'─' * 60}")
        print(f"  Agent {agent_id}/5: {name}")
        print(f"{'─' * 60}")

        try:
            module.run()
        except json.JSONDecodeError as e:
            print(f"  [오류] JSON 파싱 실패: {e}")
            print(f"  → Agent {agent_id} 재실행이 필요합니다")
            sys.exit(1)
        except Exception as e:
            print(f"  [오류] Agent {agent_id} 실행 실패: {e}")
            sys.exit(1)

    elapsed = time.time() - start_time
    print(f"\n{'=' * 60}")
    print(f"  파이프라인 완료! (소요시간: {elapsed:.1f}초)")
    print(f"  산출물: outputs/ 디렉토리 확인")
    print(f"{'=' * 60}")


def generate_images():
    """05_prompts.json을 기반으로 실제 이미지 생성"""
    print("\n" + "=" * 60)
    print("  이미지 생성 시작 (Gemini Imagen)")
    print("=" * 60)

    prompts_data = gemini_client.load_output("05_prompts.json")
    if not prompts_data:
        print("[오류] 05_prompts.json이 없습니다. 파이프라인을 먼저 실행하세요.")
        sys.exit(1)

    config = gemini_client.load_config()
    images_dir = Path(__file__).parent / config["paths"]["images_dir"]
    images_dir.mkdir(parents=True, exist_ok=True)

    prompts = prompts_data.get("prompts", [])
    total = len(prompts)

    print(f"  생성할 이미지: {total}개\n")

    for i, prompt_item in enumerate(prompts, 1):
        filename = prompt_item.get("filename", f"image_{i:02d}.png")
        prompt_text = prompt_item.get("prompt", "")
        output_path = str(images_dir / filename)

        print(f"  [{i}/{total}] {filename}...")
        try:
            gemini_client.generate_image(
                prompt=prompt_text,
                output_path=output_path,
            )
        except Exception as e:
            print(f"  [실패] {filename}: {e}")
            continue

        # Rate limit 방지
        if i < total:
            time.sleep(2)

    print(f"\n{'=' * 60}")
    print(f"  이미지 생성 완료! ({images_dir})")
    print(f"{'=' * 60}")


def main():
    parser = argparse.ArgumentParser(description="Meta Ad Creative Pipeline")
    parser.add_argument(
        "--from", dest="from_agent", type=int, default=1,
        help="시작할 에이전트 번호 (1-5, 기본: 1)"
    )
    parser.add_argument(
        "--only", dest="only_agent", type=int, default=None,
        help="특정 에이전트만 실행 (1-5)"
    )
    parser.add_argument(
        "--generate-images", action="store_true",
        help="이미지 생성만 실행 (05_prompts.json 필요)"
    )
    parser.add_argument(
        "--full", action="store_true",
        help="파이프라인 + 이미지 생성까지 전체 실행"
    )

    args = parser.parse_args()

    if args.generate_images:
        generate_images()
    elif args.full:
        run_pipeline(from_agent=args.from_agent, only_agent=args.only_agent)
        generate_images()
    else:
        run_pipeline(from_agent=args.from_agent, only_agent=args.only_agent)


if __name__ == "__main__":
    main()
