// lib/storage.ts
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDataPath(fileName: string) {
  ensureDataDir();
  return path.join(DATA_DIR, fileName);
}

export function readJson<T>(fileName: string, fallback: T): T {
  try {
    const filePath = getDataPath(fileName);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(fileName: string, data: T) {
  const filePath = getDataPath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getLastModified(fileName: string): string | null {
  try {
    const filePath = getDataPath(fileName);
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch {
    return null;
  }
}
