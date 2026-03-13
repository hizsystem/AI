import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const client = formData.get("client") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9가-힣._-]/g, "_")
    .replace(/_{2,}/g, "_");
  const path = `uploads/${client || "general"}/${timestamp}-${safeName}`;

  // Production: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, path });
  }

  // Vercel serverless (no Blob token): use /tmp
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    const bytes = await file.arrayBuffer();
    const fs = await import("fs/promises");
    const tmpDir = `/tmp/uploads/${client || "general"}`;
    await fs.mkdir(tmpDir, { recursive: true });
    const tmpPath = `${tmpDir}/${timestamp}-${safeName}`;
    await fs.writeFile(tmpPath, Buffer.from(bytes));

    // Convert to base64 data URL for temporary use
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({ url: dataUrl, path, temporary: true });
  }

  // Local dev: save to public/uploads
  const bytes = await file.arrayBuffer();
  const fs = await import("fs/promises");
  const localDir = `${process.cwd()}/public/uploads/${client || "general"}`;
  await fs.mkdir(localDir, { recursive: true });
  const localPath = `${localDir}/${timestamp}-${safeName}`;
  await fs.writeFile(localPath, Buffer.from(bytes));

  const url = `/uploads/${client || "general"}/${timestamp}-${safeName}`;
  return NextResponse.json({ url, path });
}
