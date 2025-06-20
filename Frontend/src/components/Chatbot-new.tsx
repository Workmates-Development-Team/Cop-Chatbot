import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Send, MessageCircle, Shield, Car, Home, Globe, AlertTriangle, TrendingUp, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { backend_url } from '@/components/Constant';
import police from './assets/Police.png'
import logo from './assets/kp image.jpeg'
import chatBg from './assets/chatbot-white-bg 1.jpg';
import './Chatbot-new.css'

const sectionIcons: Record<string, React.ReactNode> = {
  'general': <MessageCircle className="w-5 h-5 mr-1" />,
  'personal safety': <Shield className="w-5 h-5 mr-1" />,
  'vehicle crime': <Car className="w-5 h-5 mr-1" />,
  'home security': <Home className="w-5 h-5 mr-1" />,
  'computer and internet': <Globe className="w-5 h-5 mr-1" />,
  'Consumer fraud': <AlertTriangle className="w-5 h-5 mr-1" />,
  'new crime trends': <TrendingUp className="w-5 h-5 mr-1" />,
  'youth and drugs': <User className="w-5 h-5 mr-1" />,
};

const categories = [
  { id: 'general', title: 'General', description: 'General queries and information' },
  { id: 'personal safety', title: 'Personal Safety', description: 'Tips and guidance for personal security' },
  { id: 'vehicle crime', title: 'Vehicle Crime', description: 'Report vehicle theft or related crimes' },
  { id: 'home security', title: 'Home Security', description: 'Tips for securing your home' },
  { id: 'computer and internet', title: 'Computer & Internet', description: 'Guidance on online safety' },
  { id: 'Consumer fraud', title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
  { id: 'new crime trends', title: 'New Crime Trends', description: 'Stay updated on emerging crime patterns' },
  { id: 'youth and drugs', title: 'Youth Drugs', description: 'Resources for drug prevention and youth safety' },
];

const categoryResponses: Record<string, string> = {
  'general': 'How can I help you today?',
  'personal safety': 'How can I assist you with personal safety?',
  'vehicle crime': 'How can I assist you with vehicle-related crimes?',
  'home security': 'How can I assist you with home security tips?',
  'computer and internet': 'How can I assist you with computer and internet safety?',
  'Consumer fraud': 'How can I assist you with consumer fraud prevention?',
  'new crime trends': 'How can I assist you with new crime trends?',
  'youth and drugs': 'How can I assist you with youth drug prevention?',
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('general');
  // Store messages per section
  const [sectionMessages, setSectionMessages] = useState<Record<string, { text: string; isUser: boolean; section: string }[]>>({
    general: [{
      text: categoryResponses['general'],
      isUser: false,
      section: 'general'
    }]
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState({ width: 520, height: 650 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Always use messages for the current section
  const messages = sectionMessages[currentCategory] || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentCategory]);

  // Clean Markdown by removing unwanted syntax (e.g., ** for bold)
  const cleanMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  // Switch section and preserve messages per section
  const handleSectionSwitch = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSectionMessages(prev => {
      // If this section has no messages, start with the welcome message
      if (!prev[categoryId] || prev[categoryId].length === 0) {
        return {
          ...prev,
          [categoryId]: [{
            text: categoryResponses[categoryId] || 'How can I help you?',
            isUser: false,
            section: categoryId,
          }]
        };
      }
      return prev;
    });
  };

  // Send message in the current section only
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMsg = { text: inputMessage, isUser: true, section: currentCategory };
    // Add user message ONCE
    setSectionMessages(prev => ({
      ...prev,
      [currentCategory]: [...(prev[currentCategory] || []), newUserMsg]
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const question =
        currentCategory === 'general'
          ? inputMessage
          : `${inputMessage} (category: ${currentCategory})`;

      const response = await fetch(`${backend_url}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error('Failed to fetch response from API');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      let botResponse = '';
      const decoder = new TextDecoder();

      // Add an empty bot message ONCE for streaming
      setSectionMessages(prev => ({
        ...prev,
        [currentCategory]: [
          ...(prev[currentCategory] || []),
          { text: '', isUser: false, section: currentCategory }
        ]
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;
        // Update only the last bot message
        setSectionMessages(prev => {
          const msgs = [...(prev[currentCategory] || [])];
          if (msgs.length > 0) {
            msgs[msgs.length - 1] = {
              text: cleanMarkdown(botResponse),
              isUser: false,
              section: currentCategory
            };
          }
          return {
            ...prev,
            [currentCategory]: msgs
          };
        });
      }
    } catch (error) {
      setSectionMessages(prev => ({
        ...prev,
        [currentCategory]: [
          ...(prev[currentCategory] || []),
          { text: 'Error connecting to the server. Please try again later.', isUser: false, section: currentCategory }
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResize = (event: any, { size }: { size: { width: number; height: number } }) => {
    setSize({ width: size.width, height: size.height });
  };

  return (
    <Draggable handle={null} bounds="body">
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <div className="relative cursor-pointer group" onClick={() => setIsOpen(true)}>
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <Avatar className="w-16 h-16 chatbot-drag-handle cursor-move">
                <AvatarImage
                  src={logo}
                  alt="Police Assistant"
                />
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">👮‍♂️</AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-16 right-0 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Need help? Click to chat!</span>
              </div>
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        ) : (
          <Resizable
            width={size.width}
            height={size.height}
            onResize={handleResize}
            minConstraints={[400, 500]}
            maxConstraints={[700, 900]}
            resizeHandles={['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw']}
          >
            <Card
              className="shadow-2xl flex flex-col"
              style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                backgroundImage: `url(${chatBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-3 border-white shadow-lg chatbot-drag-handle cursor-move">
                      <AvatarImage
                       src={logo}
                        alt="Police Assistant"
                      />
                      <AvatarFallback className="bg-blue-800 text-white text-lg font-bold">👮‍♂️</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg"> Kolkata Police Assistant</h3>
                    <div className="flex items-center gap-1">
                    
                      <p className="text-sm opacity-90 font-bold">Glorious Service-Since 1856</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Section Buttons */}
                <div className="p-4 pb-0">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`flex items-center px-3 py-1 rounded-full border transition-all duration-200 text-sm font-medium shadow-sm
                          ${currentCategory === cat.id
                            ? 'bg-blue-600 border-blue-700 text-white scale-105'
                            : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'}
                        `}
                        title={cat.title}
                        onClick={() => handleSectionSwitch(cat.id)}
                      >
                        {sectionIcons[cat.id] || cat.title[0]}
                        <span>{cat.title}</span>
                      </button>
                    ))}
                  </div>
                  <br/>
                </div>

                {/* Messages */}
                <div className="flex-1 px-4 pt-2 pb-4 overflow-y-auto space-y-3">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'
                        }`}
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
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                        <span className="animate-pulse">Typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input with solid background */}
                <div className="border-t p-4 bg-white">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 chat-input-solid"
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} size="sm" disabled={isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Resizable>
        )}
      </div>
    </Draggable>
  );
};

export default Chatbot;