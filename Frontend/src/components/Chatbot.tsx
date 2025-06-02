import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Send, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('categories');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState({ width: 384, height: 500 }); // Initial size (w-96 = 384px)

  // Categories
  const categories = [
    { id: 'personal safety', title: 'Personal Safety', description: 'Tips and guidance for personal security' },
    { id: 'vehicle crime', title: 'Vehicle Crime', description: 'Report vehicle theft or related crimes' },
    { id: 'home security', title: 'Home Security', description: 'Tips for securing your home' },
    { id: 'computer and internet', title: 'Computer and Internet', description: 'Guidance on online safety' },
    { id: 'Consumer fraud', title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
    { id: 'new crime trends', title: 'New Crime Trends', description: 'Stay updated on emerging crime patterns' },
    { id: 'youth and drugs', title: 'Youth Drugs', description: 'Resources for drug prevention and youth safety' },
    { id: 'general', title: 'General Chat', description: 'General queries and information' },
  ];

  // Category responses (for initial message only)
  const categoryResponses: Record<string, string[]> = {
    'personal safety': ['How can I assist you with personal safety?'],
    'vehicle crime': ['How can I assist you with vehicle-related crimes?'],
    'home security': ['How can I assist you with home security tips?'],
    'computer and internet': ['How can I assist you with computer and internet safety?'],
    'Consumer fraud': ['How can I assist you with Consumer fraud prevention?'],
    'new crime trends': ['How can I assist you with new crime trends?'],
    'youth and drugs': ['How can I assist you with youth drug prevention?'],
    'general': ['How can I help you today?'],
  };

  // Clean Markdown by removing unwanted syntax (e.g., ** for bold)
  const cleanMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove **bold** syntax
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
      // Construct the question based on category
      const question =
        currentCategory === 'general'
          ? inputMessage
          : `${inputMessage} from ${currentCategory}`;

      const response = await fetch('http://127.0.0.1:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

        // Optionally update UI incrementally
        setMessages([...newMessages, { text: cleanMarkdown(botResponse), isUser: false }]);
      }

      // Finalize the cleaned response
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

  const handleResize = (event: any, { size }: { size: { width: number; height: number } }) => {
    setSize({ width: size.width, height: size.height });
  };

  return (
    <Draggable handle=".chatbot-drag-handle" bounds="body">
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <div className="relative cursor-pointer group" onClick={() => setIsOpen(true)}>
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <Avatar className="w-16 h-16 chatbot-drag-handle cursor-move">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
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
            minConstraints={[300, 400]} // Minimum width and height
            maxConstraints={[600, 800]} // Maximum width and height
            resizeHandles={['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw']} // Enable resizing from all sides and corners
          >
            <Card
              className="shadow-2xl flex flex-col"
              style={{ width: `${size.width}px`, height: `${size.height}px` }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-3 border-white shadow-lg chatbot-drag-handle cursor-move">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                        alt="Police Assistant"
                      />
                      <AvatarFallback className="bg-blue-800 text-white text-lg font-bold">👮‍♂️</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Officer Assistant</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-sm opacity-90">Online - Ready to help</p>
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
              <div className="flex-1 overflow-hidden">
                {currentView === 'categories' ? (
                  <div className="p-4 space-y-3 h-full overflow-y-auto">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">👋 Welcome! How can we assist you today?</p>
                      <p className="text-xs text-gray-500 mt-1">Please select a category:</p>
                    </div>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        onClick={() => handleCategorySelect(category.id)}
                        className="w-full h-auto p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 flex flex-col items-start text-left"
                      >
                        <div className="font-medium text-gray-800">{category.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
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
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                          disabled={isLoading}
                        />
                        <Button onClick={handleSendMessage} size="sm" disabled={isLoading}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetChat} className="w-full text-xs">
                        Back to Categories
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Resizable>
        )}
      </div>
    </Draggable>
  );
};

export default Chatbot;