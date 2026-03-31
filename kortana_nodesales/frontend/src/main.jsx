import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// ── Global MetaMask / ethers v6 compatibility shim ────────────────────────────
// ethers v6 BrowserProvider calls provider.addListener() internally, but
// MetaMask only exposes .on(). Patch every injected provider at boot so any
// BrowserProvider instantiation — regardless of call site — works with MetaMask.
(function shimEthereumProviders() {
  try {
    function patchProvider(p) {
      if (p && typeof p.on === "function" && typeof p.addListener !== "function") {
        p.addListener    = p.on.bind(p);
        p.removeListener = (p.removeListener || p.off || function () {}).bind(p);
      }
    }
    if (window.ethereum) {
      patchProvider(window.ethereum);
      // also patch every provider in the multi-wallet providers array
      if (Array.isArray(window.ethereum.providers)) {
        window.ethereum.providers.forEach(patchProvider);
      }
    }
  } catch {}
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   30_000,  // 30 s
      retry:       2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color:      "#fff",
              border:     "1px solid #243052",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
