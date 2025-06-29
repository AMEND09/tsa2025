import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, Send, X, Minimize2, Maximize2, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  farmData: any; // Data to send to AI for context
  apiKey?: string; // Optional API key prop
}

type AIProvider = 'gemini' | 'ollama';

interface AIConfig {
  provider: AIProvider;
  geminiApiKey?: string;
  ollamaEndpoint: string;
  ollamaModel: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ farmData, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    // Load AI config from localStorage
    try {
      const savedConfig = localStorage.getItem('agrimind-ai-config');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading AI config from localStorage:', error);
    }
    return {
      provider: 'ollama' as AIProvider,
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      geminiApiKey: ''
    };
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for available Ollama models
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Function to fetch available Ollama models
  const fetchOllamaModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch(`${aiConfig.ollamaEndpoint}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const modelNames = data.models?.map((model: any) => model.name) || [];
        setAvailableModels(modelNames);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching Ollama models:', err);
      setError(`Failed to fetch Ollama models: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Auto-fetch Ollama models when provider is ollama or endpoint changes
  useEffect(() => {
    if (aiConfig.provider === 'ollama') {
      fetchOllamaModels();
    }
  }, [aiConfig.provider, aiConfig.ollamaEndpoint]);

  // Initialize AI based on provider
  useEffect(() => {
    const initializeAI = () => {
      if (aiConfig.provider === 'gemini') {
        // Try to get API key from environment variable, prop, aiConfig, or localStorage
        const key = apiKey || 
                    aiConfig.geminiApiKey ||
                    import.meta.env.VITE_GEMINI_API_KEY || 
                    localStorage.getItem('gemini_api_key');
        
        if (key) {
          try {
            const ai = new GoogleGenerativeAI(key);
            setGenAI(ai);
            setError(null);
          } catch (err) {
            setError('Failed to initialize Gemini AI. Please check your API key.');
            console.error('Gemini AI initialization error:', err);
          }
        } else {
          setError('No Gemini API key found. Please configure your API key in settings.');
        }
      } else if (aiConfig.provider === 'ollama') {
        // For Ollama, test the connection and validate the model
        setGenAI(null);
        
        // If we have available models but the current model isn't in the list, 
        // update to the first available model
        if (availableModels.length > 0 && !availableModels.includes(aiConfig.ollamaModel)) {
          setAiConfig(prev => ({ ...prev, ollamaModel: availableModels[0] }));
        }
        
        setError(null);
      }
    };

    initializeAI();
  }, [apiKey, aiConfig, availableModels]);

  // Save AI config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('agrimind-ai-config', JSON.stringify(aiConfig));
    } catch (error) {
      console.error('Error saving AI config to localStorage:', error);
    }
  }, [aiConfig]);

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

  const sendMessageToOllama = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch(`${aiConfig.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  };

  const sendMessageToGemini = async (prompt: string): Promise<string> => {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if AI is properly configured
    if (aiConfig.provider === 'gemini' && !genAI) {
      setError('Gemini AI not initialized. Please check your API key in settings.');
      return;
    }

    if (aiConfig.provider === 'ollama' && availableModels.length === 0) {
      setError('No Ollama models available. Please ensure Ollama is running and has models installed.');
      return;
    }

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
      const farmContext = formatFarmDataForContext();
      
      const prompt = `You are AgriMind AI, a smart farming assistant focused on helping farmers improve their farm's
      sustainability. You have access to the user's farm data below. Please analyze their question and provide helpful,
      actionable advice based on their specific farm situation.
      
      Farm Data Context:
      ${farmContext}
      
      User Question: ${userMessage.content}
      
      Please provide a helpful response that takes into account their specific farm data, plans, and current situation. 
      Keep responses concise but informative. If you notice any issues or opportunities for improvement in their data, mention them.`;

      let responseText: string;

      if (aiConfig.provider === 'ollama') {
        responseText = await sendMessageToOllama(prompt);
      } else {
        responseText = await sendMessageToGemini(prompt);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message to AI:', err);
      let errorMsg = 'Failed to get response from AI assistant.';
      
      if (err.message?.includes('fetch')) {
        errorMsg = 'Cannot connect to Ollama. Please ensure Ollama is running on ' + aiConfig.ollamaEndpoint;
      } else if (err.message?.includes('API key')) {
        errorMsg = 'Invalid API key. Please check your Gemini API key in settings.';
      }
      
      setError(errorMsg);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again or check your settings.`,
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

  // Component to handle thinking blocks with expand/collapse
  const ThinkingBlock: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="my-2 border border-gray-300 rounded-lg bg-gray-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-600 flex items-center">
            {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
            AI Thinking Process
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-200">
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-100 p-2 rounded mt-2">
              {content}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to parse content and extract thinking blocks
  const parseThinkingContent = (content: string) => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = thinkRegex.exec(content)) !== null) {
      // Add content before the thinking block
      if (match.index > lastIndex) {
        const beforeContent = content.slice(lastIndex, match.index).trim();
        if (beforeContent) {
          parts.push({ type: 'text', content: beforeContent });
        }
      }

      // Add the thinking block
      parts.push({ type: 'thinking', content: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining content after the last thinking block
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex).trim();
      if (remainingContent) {
        parts.push({ type: 'text', content: remainingContent });
      }
    }

    // If no thinking blocks found, return the original content as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content });
    }

    return parts;
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
              <span className="text-xs bg-green-500 px-2 py-1 rounded">
                {aiConfig.provider === 'ollama' ? 'Ollama' : 'Gemini'}
              </span>
            </CardTitle>
            <div className="flex gap-1">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-green-700 p-1 h-8 w-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>AI Assistant Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider">AI Provider</Label>
                      <Select
                        value={aiConfig.provider}
                        onValueChange={(value: AIProvider) => setAiConfig(prev => ({ ...prev, provider: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {aiConfig.provider === 'ollama' && (
                      <>
                        <div>
                          <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
                          <Input
                            id="ollama-endpoint"
                            value={aiConfig.ollamaEndpoint}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                            placeholder="http://localhost:11434"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ollama-model">Ollama Model</Label>
                          <Select
                            value={aiConfig.ollamaModel}
                            onValueChange={(value) => setAiConfig(prev => ({ ...prev, ollamaModel: value }))}
                            disabled={isLoadingModels}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingModels ? (
                                <SelectItem value="loading" disabled>
                                  Loading models...
                                </SelectItem>
                              ) : availableModels.length > 0 ? (
                                availableModels.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-models" disabled>
                                  No models found
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={fetchOllamaModels} 
                            disabled={isLoadingModels}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            {isLoadingModels ? 'Loading...' : 'Refresh Models'}
                          </Button>
                          {/* Connection status indicator */}
                          <div className="mt-2 text-xs">
                            {isLoadingModels ? (
                              <span className="text-blue-600">Connecting to Ollama...</span>
                            ) : availableModels.length > 0 ? (
                              <span className="text-green-600">
                                ✓ Connected to Ollama ({availableModels.length} models available)
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ Cannot connect to Ollama. Make sure it's running on {aiConfig.ollamaEndpoint}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {aiConfig.provider === 'gemini' && (
                      <div>
                        <Label htmlFor="gemini-key">Gemini API Key</Label>
                        <Input
                          id="gemini-key"
                          type="password"
                          value={aiConfig.geminiApiKey || ''}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                          placeholder="Enter your Gemini API key"
                        />
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      {aiConfig.provider === 'ollama' ? (
                        <div>
                          <p>Ollama models are automatically detected when connected.</p>
                          <p className="mt-1">Make sure Ollama is running locally and has models installed.</p>
                          <p className="mt-1 text-xs">
                            Run <code className="bg-gray-100 px-1 rounded">ollama list</code> to see installed models.
                          </p>
                        </div>
                      ) : (
                        <p>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                        {parseThinkingContent(message.content).map((part, index) => (
                          <div key={index}>
                            {part.type === 'thinking' ? (
                              <ThinkingBlock content={part.content} />
                            ) : (
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
                                {part.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        ))}
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
                  disabled={isLoading || (aiConfig.provider === 'gemini' && !genAI)}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || (aiConfig.provider === 'gemini' && !genAI)}
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
