import { experimental_streamedQuery as streamedQuery, useQuery } from "@tanstack/react-query";

import { streamBattle } from "../api";
import type { BattleTeam } from "../types/pokemon";

export enum BattleStatus {
  Streaming = "streaming",
  Done = "done",
  Error = "error",
}

interface Battle {
  /** The commentary received so far */
  text: string;
  status: BattleStatus;
  error?: string;
  /** Play the battle again */
  restart: () => void;
}

/**
 * Run a battle between the given teams and follow its commentary as it is streamed
 */
export function useBattle(teams: BattleTeam[]): Battle {
  const { data, error, isError, isFetching, refetch } = useQuery({
    queryKey: ["battle", teams],
    queryFn: streamedQuery({
      streamFn: ({ signal }) => streamBattle(teams, signal),
      reducer: (text: string, chunk: string) => text + chunk,
      initialValue: "",
    }),
    // Every visit to the arena is a new battle: nothing is kept once it is left
    gcTime: 0,
    retry: false,
  });

  let status = BattleStatus.Done;
  if (isError) status = BattleStatus.Error;
  else if (isFetching) status = BattleStatus.Streaming;

  return { text: data ?? "", status, error: error?.message, restart: () => void refetch() };
}
