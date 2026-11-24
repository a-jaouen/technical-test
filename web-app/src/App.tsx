import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PokemonApp } from "./components/PokemonApp";
import { ThemeProvider } from "./components/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Pokemon data never changes: what is loaded stays valid for the whole visit
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 1,
      // Offline, fail with an error to retry instead of waiting silently for the network
      networkMode: "always",
    },
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
