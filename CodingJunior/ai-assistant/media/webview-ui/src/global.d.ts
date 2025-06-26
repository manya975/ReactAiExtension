export { };

declare global {
  interface Window {
    vscode: {
      postMessage: (message: any) => void;
    };
  }

  function acquireVsCodeApi(): {
    postMessage: (message: any) => void;
  };
}
