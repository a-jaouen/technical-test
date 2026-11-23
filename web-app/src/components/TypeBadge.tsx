import type { TypeName } from "../types/pokemon";
import { label, TYPE_COLORS } from "../utils/pokemon";

export function TypeBadge({ type }: { type: TypeName }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {label(type)}
    </span>
  );
}
