import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { getPokemonPage } from "../api";
import type { PokemonSummary } from "../types/pokemon";

/** The largest page the backend accepts */
const PAGE_SIZE = 100;

export enum LoadStatus {
  Loading = "loading",
  Ready = "ready",
  Error = "error",
}

interface Pokemons {
  status: LoadStatus;
  /** The pokemon loaded so far, in pokedex order */
  pokemons: PokemonSummary[];
  /** How many pokemon exist, known once the first page has arrived */
  total?: number;
  error?: string;
  /** Resume loading after a failure */
  retry: () => void;
}

/**
 * Load all the pokemon, one page after the other, so the first ones show up right away
 */
export function usePokemons(): Pokemons {
  const { data, error, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    {
      queryKey: ["pokemons"],
      queryFn: ({ pageParam, signal }) => getPokemonPage(pageParam, PAGE_SIZE, signal),
      initialPageParam: 0,
      getNextPageParam: ({ offset, pokemons, total }) => {
        const next = offset + pokemons.length;
        return pokemons.length > 0 && next < total ? next : undefined;
      },
    },
  );

  // A later page failing keeps the ones already loaded, and its error until the retry has answered
  const failed = error !== null && !isFetchingNextPage;

  // Keep going until the last page, without waiting for the user to scroll
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !failed) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, failed, fetchNextPage]);

  const pokemons = useMemo(() => data?.pages.flatMap((page) => page.pokemons) ?? [], [data]);

  let status = LoadStatus.Loading;
  if (failed) status = LoadStatus.Error;
  else if (data && !hasNextPage) status = LoadStatus.Ready;

  return {
    status,
    pokemons,
    total: data?.pages[0]?.total,
    error: failed ? error.message : undefined,
    // Resume from the failed page: `refetch` would load every page again
    retry: () => void (data ? fetchNextPage() : refetch()),
  };
}
