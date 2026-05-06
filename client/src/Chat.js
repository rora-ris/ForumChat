import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

function Chat() {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const socketRef = useRef(null);
  const socketUrl =
    process.env.REACT_APP_SOCKET_URL || window.location.origin;

  const sendMessage = () => {
    const trimmed = message.trim();
    if (trimmed !== "" && socketRef.current) {
      socketRef.current.emit("send_message", trimmed);
      setMessage("");
    }
  };

  const clearMessages = () => {
    if (socketRef.current) {
      socketRef.current.emit("clear_messages");
    }
  };

  useEffect(() => {
    const socket = io(socketUrl);
    socketRef.current = socket;

    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    const handleChatHistory = (data) => {
      setMessageList(Array.isArray(data) ? data : []);
    };

    const handleChatCleared = () => {
      setMessageList([]);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_history", handleChatHistory);
    socket.on("chat_cleared", handleChatCleared);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_history", handleChatHistory);
      socket.off("chat_cleared", handleChatCleared);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <section className="chat">
      <div className="chat-header">
        <h2>Ruang Obrolan</h2>
        <div className="chat-actions">
          <button className="chat-clear" type="button" onClick={clearMessages}>
            Hapus Semua
          </button>
          <span className="chat-status">Online</span>
        </div>
      </div>
      <div className="chat-messages" aria-live="polite">
        {messageList.length === 0 ? (
          <div className="chat-empty">
            Belum ada pesan. Mulai percakapanmu di bawah.
          </div>
        ) : (
          messageList.map((msg, index) => (
            <div className="chat-message" key={index}>
              {msg}
            </div>
          ))
        )}
      </div>
      <div className="chat-input">
        <input
          className="chat-text"
          type="text"
          placeholder="Tulis pesan singkat..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send"
          type="button"
          onClick={sendMessage}
          disabled={message.trim() === ""}
        >
          Kirim
        </button>
      </div>
    </section>
  );
}

export default Chat;