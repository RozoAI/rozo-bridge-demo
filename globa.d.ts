declare global {
  interface Window {
    Intercom?: (action: string, ...args: any[]) => void;
  }
}

export {};
