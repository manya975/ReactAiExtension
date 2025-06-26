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
// extension.ts
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
dotenv.config();
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('ai-assistant.openChat', () => {
        const panel = vscode.window.createWebviewPanel('aiChat', 'Gemini AI Chat Assistant', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        });
        const scriptPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'bundle.js'));
        const scriptUri = panel.webview.asWebviewUri(scriptPath);
        panel.webview.html = getWebviewHtml(scriptUri.toString());
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'userMessage') {
                const prompt = message.text;
                const aiReply = await getGeminiResponse(prompt);
                panel.webview.postMessage({ type: 'aiReply', text: aiReply });
            }
        });
    }));
}
function getWebviewHtml(scriptUri) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Gemini Chat</title></head>
<body>
  <div id="root"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}
// ✅ Gemini API Integration
async function getGeminiResponse(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        vscode.window.showErrorMessage('Gemini API key not found in .env file.');
        return '🔒 Missing API key.';
    }
    try {
        const res = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 No response';
    }
    catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        return '❌ Failed to get response from Gemini';
    }
}
function deactivate() { }
