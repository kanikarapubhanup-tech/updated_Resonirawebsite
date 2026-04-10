import React, { useEffect, useRef, useState } from 'react';
import configLoader from '../utils/configLoader';

const ChatHistorySidebar = ({ messages = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const historyRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`va-history-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        title={isOpen ? 'Hide Chat History' : 'Show Chat History'}
      >
        <span className="va-history-icon">💬</span>
        <span className="va-message-count">{messages.length}</span>
      </button>

      {/* Sidebar */}
      <div className={`va-chat-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="va-sidebar-header">
          <h3>Chat History</h3>
          <button className="va-close-sidebar" onClick={toggleSidebar}>×</button>
        </div>

        <div className="va-sidebar-content" ref={historyRef}>
          {messages.map((message, index) => (
            <div key={index} className={`va-history-message ${message.role}`}>
              <div className="va-history-avatar">
                {message.role === 'user' ? '👤' : 'J'}
              </div>
              <div className="va-history-bubble">
                <div className="va-history-header">
                  <span className="va-history-name">
                    {message.role === 'user' ? 'You' : (configLoader.getConfig()?.ai?.personality?.name || 'Jessi')}
                  </span>
                  <span className="va-history-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="va-history-text">{message.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="va-sidebar-footer">
          <small>{messages.length} messages</small>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="va-sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default ChatHistorySidebar;

