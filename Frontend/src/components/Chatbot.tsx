import React, { useRef, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

import police from './assets/Police.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { backend_url } from '@/components/Constant';
import "./Chatbot.css"

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('categories');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState({ width: 508, height: 540 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView, isOpen]);

  const categories = [
    { id: 'personal safety', title: 'Personal Safety', description: 'Tips and guidance for personal security' },
    { id: 'vehicle crime', title: 'Vehicle Crime', description: 'Report vehicle theft or related crimes' },
    { id: 'home security', title: 'Home Security', description: 'Tips for securing your home' },
    { id: 'computer and internet', title: 'Computer and Internet', description: 'Guidance on online safety' },
    { id: 'consumer fraud', title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
    { id: 'new crime trends', title: 'New Crime Trends', description: 'Stay updated on emerging crime patterns' },
    { id: 'youth and drugs', title: 'Youth Drugs', description: 'Resources for drug prevention and youth safety' },
    { id: 'general', title: 'General Chat', description: 'General queries and information' },
  ];

  const categoryResponses = {
    'personal safety': ['How can I assist you with personal safety?'],
    'vehicle crime': ['How can I assist you with vehicle-related crimes?'],
    'home security': ['How can I assist you with home security tips?'],
    'computer and internet': ['How can I assist you with computer and internet safety?'],
    'consumer fraud': ['How can I assist you with consumer fraud prevention?'],
    'new crime trends': ['How can I assist you with new crime trends?'],
    'youth and drugs': ['How can I assist you with youth drug prevention?'],
    'general': ['How can I help you today?'],
  };

  const cleanMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const handleCategorySelect = (categoryId: string) => {
    setCurrentView('chat');
    setCurrentCategory(categoryId);
    const responses = categoryResponses[categoryId] || ['How can I help you today?'];
    setMessages([{ text: responses.join('\n'), isUser: false }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { text: inputMessage, isUser: true }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const question =
        currentCategory === 'general'
          ? inputMessage
          : `${inputMessage} from ${currentCategory}`;

      const response = await fetch(`${backend_url}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from API');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let botResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;
        setMessages([...newMessages, { text: cleanMarkdown(botResponse), isUser: false }]);
      }

      setMessages([...newMessages, { text: cleanMarkdown(botResponse), isUser: false }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages([
        ...newMessages,
        { text: 'Error connecting to the server. Please try again later.', isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setCurrentView('categories');
    setMessages([]);
    setCurrentCategory(null);
    setIsLoading(false);
  };

  const handleResize = (event: any, { size }: any) => {
    setSize({ width: size.width, height: size.height });
  };

  return (
    <Draggable handle={null} bounds="body">
      <div className="position-fixed bottom-0 end-0 m-3 z-50">
        {!isOpen ? (
          <div
            className="position-relative d-flex align-items-center justify-content-center"
            style={{ minHeight: '90px' }}
            onClick={() => setIsOpen(true)}
          >
            <div style={{ position: 'relative', display: 'inline-block', top: '-25px' }}>
              <img src={police} alt="Kolkata Police" className="police-logo" />
              <span className="dot live-dot"></span>
            </div>
          </div>
        ) : (
          <Resizable
            width={size.width}
            height={size.height}
            onResize={handleResize}
            minConstraints={[400, 400]}
            maxConstraints={[800, 800]}
            resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']} // Enable all directions
          >
            <div
              className="container chatbod-area"
              style={{ width: `${size.width}px`, height: `${size.height}px`, display: 'flex', flexDirection: 'column', padding: 0 }}
            >
              {/* Header */}
              <div className="row" style={{ padding: 20, paddingBottom: 0 }}>
                <div
                  className="col-md-3 position-relative d-flex align-items-center justify-content-center"
                  style={{ minHeight: '90px' }}
                >
                  <div style={{ position: 'relative', display: 'inline-block', top: '-25px' }}>
                    <img src={police} alt="Kolkata Police" className="police-logo" />
                    <span className="dot live-dot"></span>
                  </div>
                </div>
                <div className="col-md-7">
                  <h2
                    className="d-flex justify-content-center"
                    style={{ fontSize: '30px', color: '#fff', fontWeight: 700 }}
                  >
                    Kolkata Police
                  </h2>
                  <h3
                    className="d-flex justify-content-center"
                    style={{ fontSize: '20px', color: '#4ade80' }}
                  >
                    Online - Ready to help
                  </h3>
                  <p style={{ color: '#fff', fontSize: '16px', textAlign: 'center' }}>
                    Welcome! How can we assist you today? <br />
                    <span style={{ color: '#ffc221', textAlign: 'center' ,fontSize: '19px'}}>
                     {currentView === 'categories'
        ? 'Please select a category:'
        : currentCategory
          ? categories.find(c => c.id === currentCategory)?.title
          : ''}
                    </span>
                  </p>
                  <br />
                </div>
                <div className="col-md-2 d-flex justify-content-end cross-img">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x-icon lucide-x"
                    onClick={() => setIsOpen(false)}
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
              </div>
              {/* Chat area and input */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {currentView === 'categories' ? (
                  <div id="wrapper" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="scrollbar" id="style-1" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', margin: 0 }}>
                      <div className="force-overflow">
                        {categories.map((category, index) => (
                          <div
                            key={category.id}
                            className={`blue-box${index === 0 ? '1' : ''} bg-opacity-50`}
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            <p style={{ fontSize: '18px', color: '#fff' }}>
                              <b style={{ fontSize: '18px' }}>{category.title}</b>
                              <br />
                              {category.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {/* Messages */}
                    <div className="scrollbar" id="style-1" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', margin: 0 }}>
                      <div className="force-overflow">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`d-flex ${message.isUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}
                          >
                            <div
                              className={`p-2 rounded ${message.isUser ? 'bg-success text-white' : 'bg-light text-dark'}`}
                              style={{ maxWidth: '80%' }}
                            >
                              {message.isUser ? (
                                <span>{message.text}</span>
                              ) : (
                                <ReactMarkdown>{message.text}</ReactMarkdown>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="d-flex justify-content-start">
                          <div
                            className="p-2 rounded bg-light text-dark"
                            style={{ maxWidth: '70%', fontSize: '0.9rem', marginBottom: '8px' }}
                          >
                            <span className="animate-pulse" style={{ fontSize: '0.85em' }}>Typing...</span>
                          </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    {/* Input and Back button */}
                    <div className="p-3" style={{ background: 'rgba(29,39,74,0.3)', backdropFilter: 'blur(2px)' }}>
                      <div className="d-flex gap-2 mb-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-grow-1"
                          disabled={isLoading}
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          disabled={isLoading}
                          style={{ background: 'rgba(76,175,80,0.7)', border: 'none' }}
                        >
                          <i className="fa fa-paper-plane" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetChat}
                        className="w-100"
                        style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        Back to Categories
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Resizable>
        )}
      </div>
    </Draggable>
  );
};

export default Chatbot;


