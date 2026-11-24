import type { TypeName } from "../types/pokemon";
import { label, TYPE_COLORS } from "../utils/pokemon";

/**
 * Row of coloured badges naming the types of a pokemon
 * @param props.types - Types shown, main type first
 */
export function TypeBadges({ types }: { types: TypeName[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {types.map((type) => (
        <span
          key={type}
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: TYPE_COLORS[type] }}
        >
          {label(type)}
        </span>
      ))}
    </div>
  );
}
