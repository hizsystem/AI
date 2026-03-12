#!/bin/bash
# 모든 워크트리를 순회하며 변경사항이 있으면 커밋+푸시
# 사용법: bash scripts/auto-commit-push.sh

echo "🔄 전체 워크트리 커밋+푸시 시작..."
echo ""

# 워크트리 목록
worktrees=(
  "/Users/wooseongmin/AI"
  "/Users/wooseongmin/AI/.worktrees/new-business"
  "/Users/wooseongmin/AI/.worktrees/goventure-forum"
  "/Users/wooseongmin/AI/.worktrees/bc3-team"
  "/Users/wooseongmin/AI/.worktrees/tapshopbar"
)

for dir in "${worktrees[@]}"; do
  if [ ! -d "$dir" ]; then
    continue
  fi

  cd "$dir"
  branch=$(git branch --show-current)

  # 변경사항 확인
  changes=$(git status --short | grep -v "^??" | wc -l | tr -d ' ')
  untracked=$(git status --short | grep "^??" | wc -l | tr -d ' ')

  if [ "$changes" -eq 0 ] && [ "$untracked" -eq 0 ]; then
    echo "✅ [$branch] 변경 없음 — $dir"
    continue
  fi

  echo "📦 [$branch] 변경 발견 (수정: $changes, 신규: $untracked) — $dir"

  # 모든 변경사항 스테이징 (.env 등 민감 파일 제외)
  git add -A
  git reset -- '*.env' '*.env.*' 'credentials*' '*.key' '*.pem' 2>/dev/null

  # 커밋
  timestamp=$(date "+%Y-%m-%d %H:%M")
  git commit -m "자동 저장: $timestamp [$branch]"

  # 푸시
  if git remote get-url origin &>/dev/null; then
    git push -u origin "$branch" && echo "   ✅ 푸시 완료" || echo "   ⚠️ 푸시 실패"
  else
    echo "   ⚠️ 원격 저장소 없음, 로컬 커밋만 완료"
  fi

  echo ""
done

echo "🏁 완료!"
