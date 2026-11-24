import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PokemonApp } from "./components/PokemonApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: "always",
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PokemonApp />
    </QueryClientProvider>
  );
}
