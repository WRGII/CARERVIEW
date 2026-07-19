/// <reference types="vite/client" />

interface Window {
  plausible: (event: string, options?: { props?: Record<string, string> }) => void;
  gtag: (...args: unknown[]) => void;
  dataLayer: unknown[];
}
