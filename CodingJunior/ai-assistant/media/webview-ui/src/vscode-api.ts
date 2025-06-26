if (!window.vscode) {
    window.vscode = acquireVsCodeApi();
  }
  
  export const vscode = window.vscode;
  