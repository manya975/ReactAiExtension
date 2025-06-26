import React, { useEffect, useState } from 'react';
import './App.css';
import { vscode } from './vscode-api';

function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    vscode.postMessage({ type: 'userMessage', text: input });
    setInput('');
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.role === 'ai') {
        setMessages((prev) => [...prev, message]);
      }
    });
  }, []);

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message (for files type @filename.fileExtension)" />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;