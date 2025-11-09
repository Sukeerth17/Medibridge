import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { chatbotAPI, isAuthenticated, getUserInfo } from '../lib/api';

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const info = getUserInfo();
    setUserInfo(info);

    // Welcome message
    setMessages([
      {
        type: 'bot',
        text: `Hello ${info?.name || 'there'}! 👋 I'm your MediBridge Health Assistant. I can help you with:\n\n• Understanding your medications\n• Basic health questions\n• Navigation through the app\n• Medicine reminders and tracking\n\nHow can I help you today?`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatbotAPI.query(inputText);
      
      const botMessage = {
        type: 'bot',
        text: response.response || response.message || 'I received your question. Let me help you with that.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot query failed:', error);
      
      const errorMessage = {
        type: 'bot',
        text: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'What is Paracetamol used for?',
    'How do I track my medicines?',
    'When should I take my medication?',
    'What are common side effects?',
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.headerTitle}>🤖 Health Assistant</h1>
        <div style={styles.userBadge}>
          {userInfo?.name || 'Patient'}
        </div>
      </header>

      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.message,
                  backgroundColor: msg.type === 'user' ? '#0070F3' : '#f0f0f0',
                  color: msg.type === 'user' ? 'white' : '#333',
                }}
              >
                <div style={styles.messageText}>{msg.text}</div>
                <div style={{
                  ...styles.messageTime,
                  color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : '#999',
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.messageWrapper}>
              <div style={{...styles.message, backgroundColor: '#f0f0f0'}}>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div style={styles.quickQuestionsContainer}>
            <h3 style={styles.quickQuestionsTitle}>Quick Questions:</h3>
            <div style={styles.quickQuestionsGrid}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  style={styles.quickQuestionBtn}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} style={styles.inputForm}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your health question..."
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              ...styles.sendBtn,
              opacity: loading || !inputText.trim() ? 0.5 : 1,
            }}
            disabled={loading || !inputText.trim()}
          >
            {loading ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'white',
    padding: '15px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#0070F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
  },
  userBadge: {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#666',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '20px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '70%',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '5px',
  },
  messageTime: {
    fontSize: '11px',
    textAlign: 'right',
  },
  typingIndicator: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  quickQuestionsContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  quickQuestionsTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#666',
  },
  quickQuestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },
  quickQuestionBtn: {
    padding: '12px 16px',
    backgroundColor: '#f0f7ff',
    border: '1px solid #0070F3',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0070F3',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  inputForm: {
    display: 'flex',
    gap: '10px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px 24px',
    backgroundColor: '#0070F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
  },
};