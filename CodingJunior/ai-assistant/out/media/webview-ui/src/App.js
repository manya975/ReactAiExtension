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
const highlight_js_1 = __importDefault(require("highlight.js"));
require("highlight.js/styles/github.css");
const marked_1 = require("marked");
const react_1 = __importStar(require("react"));
marked_1.marked.setOptions({
    highlight: (code, lang) => {
        return highlight_js_1.default.highlightAuto(code, [lang]).value;
    }
});
const App = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.type === 'aiReply') {
                setMessages((prev) => [...prev, `🤖 ${msg.text}`]);
            }
        });
    }, []);
    const sendMessage = () => {
        if (!input.trim())
            return;
        setMessages((prev) => [...prev, `👤 ${input}`]);
        vscode.postMessage({ type: 'userMessage', text: input });
        setInput('');
    };
    return (react_1.default.createElement("div", { style: { padding: 20 } },
        react_1.default.createElement("div", { style: { height: '300px', overflowY: 'auto', marginBottom: 10 } }, messages.map((msg, i) => (react_1.default.createElement("div", { key: i, dangerouslySetInnerHTML: { __html: marked_1.marked.parse(msg) } })))),
        react_1.default.createElement("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask me something... (use @filename to attach)", style: { width: '80%' } }),
        react_1.default.createElement("button", { onClick: sendMessage, style: { marginLeft: 10 } }, "Send")));
};
exports.default = App;
