import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AIContextData {
  // Current page/location
  currentPage: string;

  // Primary content context (e.g., current chapter text)
  primaryContext: string;

  // Structured data context (e.g., character info, scene data)
  structuredContext: {
    type: 'chapter' | 'character' | 'scene' | 'fight' | 'general';
    data: Record<string, any>;
  } | null;

  // Selected text (if user highlights something)
  selectedText: string;
}

interface AIContextValue {
  context: AIContextData;

  // Set the current page context
  setPageContext: (page: string, primaryContext?: string) => void;

  // Set structured data context
  setStructuredContext: (type: AIContextData['structuredContext']['type'], data: Record<string, any>) => void;

  // Set selected text (for "improve this" type actions)
  setSelectedText: (text: string) => void;

  // Clear all context
  clearContext: () => void;

  // Get formatted context string for AI prompt
  getFormattedContext: () => string;
}

const defaultContext: AIContextData = {
  currentPage: 'home',
  primaryContext: '',
  structuredContext: null,
  selectedText: ''
};

const AIContext = createContext<AIContextValue | null>(null);

export const AIContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<AIContextData>(defaultContext);

  const setPageContext = useCallback((page: string, primaryContext: string = '') => {
    setContext(prev => ({
      ...prev,
      currentPage: page,
      primaryContext: primaryContext.substring(0, 8000) // Limit context size
    }));
  }, []);

  const setStructuredContext = useCallback((
    type: AIContextData['structuredContext']['type'],
    data: Record<string, any>
  ) => {
    setContext(prev => ({
      ...prev,
      structuredContext: { type, data }
    }));
  }, []);

  const setSelectedText = useCallback((text: string) => {
    setContext(prev => ({
      ...prev,
      selectedText: text.substring(0, 2000) // Limit selection size
    }));
  }, []);

  const clearContext = useCallback(() => {
    setContext(defaultContext);
  }, []);

  const getFormattedContext = useCallback((): string => {
    const parts: string[] = [];

    // Add page context
    parts.push(`[Current Page: ${context.currentPage}]`);

    // Add selected text if any
    if (context.selectedText) {
      parts.push(`\n[Selected Text]\n"${context.selectedText}"`);
    }

    // Add structured context
    if (context.structuredContext) {
      const { type, data } = context.structuredContext;

      switch (type) {
        case 'chapter':
          parts.push(`\n[Current Chapter: ${data.title}]`);
          parts.push(`Volume ${data.volumeId}, Chapter ${data.chapterNumber}`);
          parts.push(`Word Count: ${data.wordCount}`);
          if (data.scenes?.length) {
            parts.push(`Scenes: ${data.scenes.map((s: any) => s.title).join(', ')}`);
          }
          break;

        case 'character':
          parts.push(`\n[Viewing Character: ${data.name}]`);
          parts.push(`Species: ${data.species}`);
          parts.push(`Role: ${data.role}`);
          if (data.abilities) {
            parts.push(`Abilities: ${data.abilities.join(', ')}`);
          }
          if (data.bio) {
            parts.push(`Bio: ${data.bio}`);
          }
          break;

        case 'scene':
          parts.push(`\n[Current Scene]`);
          parts.push(`Title: ${data.title}`);
          parts.push(`Location: ${data.location}`);
          if (data.characters) {
            parts.push(`Characters: ${data.characters.join(', ')}`);
          }
          break;

        case 'fight':
          parts.push(`\n[Fight Scene: ${data.title}]`);
          parts.push(`Volume ${data.volumeId}, ${data.chapter}`);
          parts.push(`Duration: ${data.durationStr}`);
          parts.push(`Characters: ${data.characters?.join(', ')}`);
          parts.push(`Location: ${data.location}`);
          parts.push(`Priority: Tier ${data.priorityTier}`);
          break;

        default:
          if (Object.keys(data).length > 0) {
            parts.push(`\n[Context Data]\n${JSON.stringify(data, null, 2)}`);
          }
      }
    }

    // Add primary content context (truncated)
    if (context.primaryContext) {
      const truncated = context.primaryContext.length > 4000
        ? context.primaryContext.substring(0, 4000) + '...[truncated]'
        : context.primaryContext;
      parts.push(`\n[Current Content]\n${truncated}`);
    }

    return parts.join('\n');
  }, [context]);

  return (
    <AIContext.Provider value={{
      context,
      setPageContext,
      setStructuredContext,
      setSelectedText,
      clearContext,
      getFormattedContext
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = (): AIContextValue => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};

export default AIContext;
