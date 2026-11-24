import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getPokemonPage } from "../api";
import { MAX_PAGE_SIZE, type PokemonSummary } from "../types/pokemon";

export enum LoadStatus {
  Loading = "loading",
  Ready = "ready",
  Error = "error",
}

interface Pokemons {
  status: LoadStatus;
  pokemons: PokemonSummary[];
  total?: number;
  error?: string;
  retry: () => void;
}

/**
 * Load all the pokemon, one page after the other, so the first ones show up right away
 */
export function usePokemons(): Pokemons {
  const { data, error, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    {
      queryKey: ["pokemons"],
      queryFn: ({ pageParam, signal }) => getPokemonPage(pageParam, MAX_PAGE_SIZE, signal),
      initialPageParam: 0,
      getNextPageParam: ({ offset, pokemons, total }) => {
        const next = offset + pokemons.length;
        return pokemons.length > 0 && next < total ? next : undefined;
      },
    },
  );

  const failed = error !== null && !isFetchingNextPage;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !failed) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, failed, fetchNextPage]);

  const pokemons = data?.pages.flatMap((page) => page.pokemons) ?? [];

  let status = LoadStatus.Loading;
  if (failed) status = LoadStatus.Error;
  else if (data && !hasNextPage) status = LoadStatus.Ready;

  return {
    status,
    pokemons,
    total: data?.pages[0]?.total,
    error: failed ? error.message : undefined,
    retry: () => void (data ? fetchNextPage() : refetch()),
  };
}
