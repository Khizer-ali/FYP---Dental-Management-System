<<<<<<< HEAD
import { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  };

  return (
    <div className="chatbox">
      <h3>AI Chatbot</h3>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
      />

      <button onClick={sendMessage}>Send</button>

      {loading ? <p>Thinking...</p> : <p><b>Bot:</b> {reply}</p>}
    </div>
  );
}

export default Chatbot;
=======
import { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  };

  return (
    <div className="chatbox">
      <h3>AI Chatbot</h3>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
      />

      <button onClick={sendMessage}>Send</button>

      {loading ? <p>Thinking...</p> : <p><b>Bot:</b> {reply}</p>}
    </div>
  );
}

export default Chatbot;
>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
