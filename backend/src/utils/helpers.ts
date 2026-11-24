import axios from "axios";

/**
 * Turn a slug into a readable label: "mr-mime" -> "Mr Mime", "special_attack" -> "Special Attack"
 * @param slug - Words separated by dashes or underscores
 */
export const label = (slug: string): string =>
  slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Turn a failed axios request into a short error for the logs: printed as is, an axios error would show the credentials sent with the request
 * @param error - What the request threw
 */
export const toRequestError = (error: unknown): unknown =>
  axios.isAxiosError(error)
    ? new Error(
        `Request to ${error.config?.baseURL ?? ""}${error.config?.url} failed: ${error.response?.status ?? error.message}`,
      )
    : error;

/**
 * Run a task on every item with a limited number of tasks running at once
 * @param items - Items to process
 * @param concurrency - How many tasks may run at once
 * @param task - Work done on each item
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
