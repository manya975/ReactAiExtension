"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('chat-assistant.startChat', () => {
        const panel = vscode.window.createWebviewPanel('chatAssistant', 'Chat Assistant', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media', 'webview-ui', 'build'))
            ]
        });
        const appPath = path.join(context.extensionPath, 'media', 'webview-ui', 'build');
        const indexPath = path.join(appPath, 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html.replace(/<head>/, `<head><base href="${panel.webview.asWebviewUri(vscode.Uri.file(appPath))}/">`);
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
                        const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, filename);
                        const fileContent = await vscode.workspace.fs.readFile(fileUri);
                        const decoded = new TextDecoder().decode(fileContent);
                        content = content.replace(`@${filename}`, `File content of ${filename}:\n${decoded}`);
                    }
                    catch (error) {
                        content += `\n\nCould not read file: ${filename}`;
                    }
                }
                const response = await askAI(content);
                panel.webview.postMessage({ role: 'ai', content: response });
            }
        });
    }));
}
async function askAI(prompt) {
    const payload = {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }]
    };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
    };
    try {
        const res = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', payload, { headers });
        return res.data.choices[0].message.content;
    }
    catch (error) {
        return `Failed to contact AI: ${error.message}`;
    }
}
function deactivate() { }
