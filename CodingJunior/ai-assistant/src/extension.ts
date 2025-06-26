import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('chat-assistant.startChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'chatAssistant',
        'Chat Assistant',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'media', 'webview-ui', 'build'))
          ]
        }
      );

      const appPath = path.join(context.extensionPath, 'media', 'webview-ui', 'build');
      const indexPath = path.join(appPath, 'index.html');
      let html = fs.readFileSync(indexPath, 'utf8');

      html = html.replace(
        /<head>/,
        `<head><base href="${panel.webview.asWebviewUri(vscode.Uri.file(appPath))}/">`
      );

      html = html.replace(/(src|href)="(.+?)"/g, (_match, p1, p2) => {
        const resourcePath = vscode.Uri.file(path.join(appPath, p2));
        return `${p1}="${panel.webview.asWebviewUri(resourcePath)}"`;
      });

      panel.webview.html = html;

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'userMessage') {
          let content = msg.text;

          const match = content.match(/@(\S+)/);
          if (match) {
            const filename = match[1];
            try {
              const fileUri = vscode.Uri.joinPath(
                vscode.workspace.workspaceFolders![0].uri,
                filename
              );
              const fileContent = await vscode.workspace.fs.readFile(fileUri);
              const decoded = new TextDecoder().decode(fileContent);
              content = content.replace(`@${filename}`, `File content of ${filename}:\n${decoded}`);
            } catch (error) {
              content += `\n\nCould not read file: ${filename}`;
            }
          }

          const response = await askAI(content);
          panel.webview.postMessage({ role: 'ai', content: response });
        }
      });
    })
  );
}

async function askAI(prompt: string): Promise<string> {
  const payload = {
    model: 'mistralai/mistral-7b-instruct',
    messages: [{ role: 'user', content: prompt }]
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer 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`
  };

  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, { headers });
    return res.data.choices[0].message.content;
  } catch (error: any) {
    return `Failed to contact AI: ${error.message}`;
  }
}

export function deactivate() {}
