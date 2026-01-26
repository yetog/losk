import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Trash2,
  Maximize2,
  Minimize2,
  BookOpen,
  Wand2,
  CheckCircle,
  Users,
  Lightbulb,
  Loader2,
  FileText
} from 'lucide-react';
import { ionosAI, type AIResponse } from '@/services/ionosAI';
import { useAIContext } from '@/context/AIContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { context, getFormattedContext } = useAIContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role,
      content,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowQuickActions(false);
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Get formatted context from provider
      const formattedContext = getFormattedContext();
      const response = await ionosAI.chat(userMessage, formattedContext);
      if (response.success) {
        addMessage('assistant', response.content);
      } else {
        addMessage('assistant', `Error: ${response.error}`);
      }
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string, prompt: string) => {
    setShowQuickActions(false);
    addMessage('user', action);
    setIsLoading(true);

    try {
      // Get formatted context from provider
      const formattedContext = getFormattedContext();
      const response = await ionosAI.chat(prompt, formattedContext);
      if (response.success) {
        addMessage('assistant', response.content);
      } else {
        addMessage('assistant', `Error: ${response.error}`);
      }
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    ionosAI.clearHistory();
    setShowQuickActions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if we have meaningful context
  const hasContext = context.primaryContext.length > 0 || context.structuredContext !== null;
  const hasSelectedText = context.selectedText.length > 0;

  const quickActions = [
    {
      icon: <Wand2 className="w-4 h-4" />,
      label: 'Improve Text',
      action: 'Improve the current text',
      prompt: hasSelectedText
        ? `Please improve this selected text for better flow and impact:\n\n"${context.selectedText}"`
        : hasContext
          ? 'Please improve the current content for better flow, clarity, and impact.'
          : 'Please share some text you\'d like me to improve.'
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Check Consistency',
      action: 'Check for consistency issues',
      prompt: hasContext
        ? 'Review the current content for consistency with LOSK lore, character behavior, and world rules.'
        : 'Share some text and I\'ll check it for consistency with LOSK lore.'
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Character Help',
      action: 'Help with character dialogue',
      prompt: context.structuredContext?.type === 'character'
        ? `Help me write dialogue for ${context.structuredContext.data.name} that matches their personality.`
        : 'Which character do you need help with? I can suggest dialogue that matches their personality.'
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Plot Ideas',
      action: 'Suggest plot developments',
      prompt: context.structuredContext?.type === 'chapter'
        ? `Based on the current chapter "${context.structuredContext.data.title}", suggest what could happen next or how to develop the current scene.`
        : 'What part of the story are you working on? I can suggest plot developments or scene ideas.'
    }
  ];

  // Floating button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg z-50"
        size="icon"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  const containerClass = isExpanded
    ? 'fixed inset-4 z-50'
    : 'fixed bottom-6 right-6 w-96 h-[600px] z-50';

  return (
    <div className={`${containerClass} bg-gray-900 rounded-xl border border-yellow-500/30 shadow-2xl flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-300">LOSK Bible</h3>
            <p className="text-xs text-gray-500">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="h-8 w-8 text-gray-400 hover:text-white"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 text-gray-400 hover:text-white"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Context indicator */}
      {hasContext && (
        <div className="flex-shrink-0 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="flex items-center gap-2 text-xs text-yellow-300">
            <FileText className="w-3 h-3" />
            <span className="truncate">
              {context.structuredContext?.type === 'chapter' && `Chapter: ${context.structuredContext.data.title}`}
              {context.structuredContext?.type === 'character' && `Character: ${context.structuredContext.data.name}`}
              {context.structuredContext?.type === 'fight' && `Fight: ${context.structuredContext.data.title}`}
              {context.structuredContext?.type === 'scene' && `Scene: ${context.structuredContext.data.title}`}
              {!context.structuredContext && `Page: ${context.currentPage}`}
            </span>
            {hasSelectedText && (
              <span className="px-1.5 py-0.5 bg-yellow-500/30 rounded text-yellow-200">
                Text Selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && showQuickActions && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              How can I help?
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              I know everything about LOSK - characters, lore, plot, and style.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2 h-auto py-3 px-3 text-left border-gray-700 hover:border-yellow-500/50 hover:bg-yellow-500/10"
                  onClick={() => handleQuickAction(qa.action, qa.prompt)}
                >
                  <span className="text-yellow-400">{qa.icon}</span>
                  <span className="text-xs text-gray-300">{qa.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-yellow-900' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-900/95">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about LOSK lore, characters, or get writing help..."
            className="flex-1 min-h-[44px] max-h-32 bg-gray-800 border-gray-700 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black self-end"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
