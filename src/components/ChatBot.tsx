import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  farmData: any; // Data to send to Gemini for context
  apiKey?: string; // Optional API key prop
}

export const ChatBot: React.FC<ChatBotProps> = ({ farmData, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load messages from localStorage on initialization
    try {
      const savedMessages = localStorage.getItem('agrimind-chat-messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat messages from localStorage:', error);
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI
  useEffect(() => {
    const initializeAI = () => {
      // Try to get API key from environment variable, prop, or localStorage
      // In Vite, environment variables are accessed via import.meta.env
      const key = apiKey || 
                  import.meta.env.VITE_GEMINI_API_KEY || 
                  localStorage.getItem('gemini_api_key');
      
      if (key) {
        try {
          const ai = new GoogleGenerativeAI(key);
          setGenAI(ai);
          setError(null);
        } catch (err) {
          setError('Failed to initialize AI. Please check your API key.');
          console.error('AI initialization error:', err);
        }
      } else {
        setError('No API key found. Please set VITE_GEMINI_API_KEY or provide an API key.');
      }
    };

    initializeAI();
  }, [apiKey]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('agrimind-chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages to localStorage:', error);
    }
  }, [messages]);

  const formatFarmDataForContext = () => {
    try {
      const context = {
        farms: farmData.farms || [],
        cropPlanEvents: farmData.cropPlanEvents || [],
        plantingPlans: farmData.plantingPlans || [],
        fertilizerPlans: farmData.fertilizerPlans || [],
        pestManagementPlans: farmData.pestManagementPlans || [],
        irrigationPlans: farmData.irrigationPlans || [],
        livestockList: farmData.livestockList || [],
        fuelRecords: farmData.fuelRecords || [],
        soilRecords: farmData.soilRecords || [],
        emissionSources: farmData.emissionSources || [],
        energyRecords: farmData.energyRecords || [],
        sustainabilityMetrics: farmData.sustainabilityMetrics || {},
        summary: {
          totalFarms: farmData.farms?.length || 0,
          totalLivestock: farmData.livestockList?.length || 0,
          totalPlans: (farmData.plantingPlans?.length || 0) + 
                    (farmData.fertilizerPlans?.length || 0) + 
                    (farmData.pestManagementPlans?.length || 0),
          activeIssues: farmData.issues?.length || 0
        }
      };
      
      return JSON.stringify(context, null, 2);
    } catch (error) {
      console.error('Error formatting farm data:', error);
      return 'Error formatting farm data for context.';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !genAI || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const farmContext = formatFarmDataForContext();
      
      const prompt = `You are AgriMind AI, a smart farming assistant focused on helping the user improve their farm's
      sustainability. You have access to the user's farm data below. Please analyze their question and provide helpful,
      actionable advice based on their specific farm situation.
      
      Farm Data Context:
      ${farmContext}
      
      User Question: ${userMessage.content}
      
      Please provide a helpful response that takes into account their specific farm data, plans, and current situation. 
      Keep responses concise but informative. If you notice any issues or opportunities for improvement in their data, mention them.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message to Gemini:', err);
      setError(err.message || 'Failed to get response from AI assistant.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Also clear from localStorage
    try {
      localStorage.removeItem('agrimind-chat-messages');
    } catch (error) {
      console.error('Error clearing chat messages from localStorage:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50"
        size="sm"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-200 ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-[500px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl">
        <CardHeader className="pb-2 bg-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AgriMind AI Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-green-700 p-1 h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                {error}
                {error.includes('API key') && (
                  <div className="mt-1 text-xs">
                    Set your Gemini API key in environment variable VITE_GEMINI_API_KEY
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Ask me anything about your farm data!</p>
                  <p className="text-xs mt-1">I can help analyze your crops, plans, livestock, and sustainability metrics.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800 border'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 last:mb-0">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 last:mb-0">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => (
                              <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-2 last:mb-0">
                                {children}
                              </pre>
                            ),
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm border">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-3 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your farm data..."
                  disabled={isLoading || !genAI}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || !genAI}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {messages.length > 0 && (
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-gray-500 h-6"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
