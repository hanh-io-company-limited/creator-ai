// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};