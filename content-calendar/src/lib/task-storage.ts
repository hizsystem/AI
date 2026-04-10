import { put, list } from "@vercel/blob";
import type { TaskBoard } from "@/data/task-types";
import { DEFAULT_MEMBERS } from "@/data/task-types";

const BLOB_PATH = "tasks/board.json";

let CACHE: TaskBoard | null = null;

function emptyBoard(): TaskBoard {
  return {
    tasks: [],
    members: [...DEFAULT_MEMBERS],
    updatedAt: new Date().toISOString(),
  };
}

export async function getTaskBoard(): Promise<TaskBoard> {
  if (CACHE) return CACHE;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    CACHE = emptyBoard();
    return CACHE;
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as TaskBoard;
        CACHE = data;
        return data;
      }
    }
  } catch (e) {
    console.error("Task board read error:", e);
  }

  CACHE = emptyBoard();
  return CACHE;
}

export async function saveTaskBoard(board: TaskBoard): Promise<void> {
  board.updatedAt = new Date().toISOString();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    CACHE = board;
    return;
  }

  await put(BLOB_PATH, JSON.stringify(board), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  CACHE = board;
}
