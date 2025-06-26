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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
// Load .env variables (for OPENAI_API_KEY)
dotenv.config();
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('ai-assistant.openChat', () => {
        const panel = vscode.window.createWebviewPanel('aiChat', 'Open AI Chat Assistant', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        });
        const scriptPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'bundle.js'));
        const scriptUri = panel.webview.asWebviewUri(scriptPath);
        panel.webview.html = getWebviewHtml(scriptUri.toString());
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            if (message.type === 'userMessage') {
                const prompt = message.text;
                const aiReply = yield getAIResponse(prompt);
                panel.webview.postMessage({ type: 'aiReply', text: aiReply });
            }
        }));
    }));
}
function getWebviewHtml(scriptUri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Chat Assistant</title>
</head>
<body>
  <div id="root"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}
function getAIResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            vscode.window.showErrorMessage('OpenAI API key not found in .env file.');
            return 'API key error';
        }
        try {
            const response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful coding assistant.' },
                    { role: 'user', content: prompt }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error(error);
            return '❌ Failed to get response from OpenAI';
        }
    });
}
function deactivate() { }
