// lib/store.ts
// Bu, upload/route.ts VƏ ask/route.ts arasında PAYLAŞILAN yaddaşdır

export type DocumentChunk = { text: string; embedding: number[] };

export let documentChunks: DocumentChunk[] = [];

export function setChunks(chunks: DocumentChunk[]) {
  documentChunks = chunks;
}

export function getChunks() {
  return documentChunks;
}
