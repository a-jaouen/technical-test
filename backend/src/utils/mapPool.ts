/**
 * Like `Promise.all(items.map(task))`, but with at most `concurrency` tasks running at once
 */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = Array.from<R>({ length: items.length });
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));

  return results;
}
