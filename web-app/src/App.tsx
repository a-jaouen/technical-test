import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PokemonApp } from "./components/PokemonApp";
import { ThemeProvider } from "./components/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    // Pokemon data never changes: what is loaded stays valid for the whole visit
    queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PokemonApp />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
