import { fileTypeFromBuffer } from "file-type";

export async function detectFileMimeType(buffer: Uint8Array): Promise<string | null> {
  const detected = await fileTypeFromBuffer(buffer);
  return detected?.mime ?? null;
}
