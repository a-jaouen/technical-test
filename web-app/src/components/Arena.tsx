import { Fragment } from "react";

import { BattleStatus, useBattle } from "../hooks/useBattle";
import type { PokemonSummary } from "../types/pokemon";
import { label } from "../utils/pokemon";
import { TypeBadge } from "./TypeBadge";

interface ArenaProps {
  fighters: PokemonSummary[];
  onClose: () => void;
}

/** Full screen view of a battle: the fighters, then the commentary as the chatbot writes it */
export function Arena({ fighters, onClose }: ArenaProps) {
  const battle = useBattle(fighters.map(({ id }) => ({ pokemonIds: [id] })));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Battle arena"
      className="fixed inset-0 z-20 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Arena</h2>
          <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5">
            Back to the list
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {fighters.map((fighter, index) => (
            <Fragment key={fighter.id}>
              {index > 0 && <span className="text-2xl font-bold text-amber-500">VS</span>}
              <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                <img
                  src={fighter.image}
                  alt=""
                  className="aspect-square h-auto w-full max-w-28 sm:max-w-40"
                />
                <span className="font-semibold">{label(fighter.name)}</span>
                <div className="flex flex-wrap justify-center gap-1">
                  {fighter.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        <div aria-live="polite" className="flex flex-col gap-3">
          {battle.text && <p className="leading-relaxed whitespace-pre-wrap">{battle.text}</p>}
          {battle.status === BattleStatus.Streaming && (
            <p className="animate-pulse text-slate-500 dark:text-slate-400">
              {battle.text ? "…" : "The battle is starting…"}
            </p>
          )}
          {battle.status === BattleStatus.Error && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              The battle could not be played: {battle.error}
            </p>
          )}
        </div>

        {battle.status !== BattleStatus.Streaming && (
          <button
            type="button"
            onClick={battle.restart}
            className="self-center rounded-md bg-amber-400 px-4 py-1.5 font-semibold text-slate-900"
          >
            {battle.status === BattleStatus.Error ? "Try again" : "Rematch"}
          </button>
        )}
      </div>
    </div>
  );
}
