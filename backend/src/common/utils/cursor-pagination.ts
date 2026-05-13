export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export function encodeCursor(id: string, timestamp: Date): string {
  return Buffer.from(`${id}:${timestamp.toISOString()}`).toString('base64');
}

export function decodeCursor(cursor: string): { id: string; timestamp: Date } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [id, timestampStr] = decoded.split(':');
    return { id, timestamp: new Date(timestampStr) };
  } catch {
    return null;
  }
}

export async function cursorPaginate<T extends { id: string; createdAt: Date }>(
  fetchFn: (cursor: { id: string; timestamp: Date } | null, limit: number) => Promise<T[]>,
  cursor?: string,
  limit: number = 20,
): Promise<CursorPaginatedResult<T>> {
  const parsedCursor = cursor ? decodeCursor(cursor) : null;
  const take = Math.min(Math.max(limit, 1), 100);
  const data = await fetchFn(parsedCursor, take + 1);

  const hasMore = data.length > take;
  const items = data.slice(0, take);
  const lastItem = items[items.length - 1];
  const nextCursor = lastItem ? encodeCursor(lastItem.id, lastItem.createdAt) : null;

  return { data: items, nextCursor, hasMore };
}
