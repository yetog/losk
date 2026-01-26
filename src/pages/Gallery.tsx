import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layers, Film, Sparkles } from 'lucide-react';
import { MoodBoardCanvas, StoryboardTimeline, SoraPromptGenerator } from '@/components/moodboard';
import { useAIContext } from '@/context/AIContext';

const Gallery = () => {
  const navigate = useNavigate();
  const { setPageContext } = useAIContext();
  const [activeTab, setActiveTab] = useState('moodboard');

  // Update AI context based on active tab
  useEffect(() => {
    const tabContextMap: Record<string, string> = {
      'moodboard': 'Using Mood Board - visual planning canvas for scenes, characters, and locations',
      'timeline': 'Using Storyboard Timeline - scene-by-scene visual planning',
      'sora': 'Using AI Prompt Generator - creating prompts for Sora AI video generation'
    };
    setPageContext(`gallery/${activeTab}`, tabContextMap[activeTab] || '');
  }, [activeTab, setPageContext]);

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>

            <div className="h-6 w-px bg-gray-700" />

            <h1 className="text-lg font-semibold text-yellow-300">Visual Studio</h1>
          </div>

          {/* Tabs in Header */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger
                value="moodboard"
                className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300"
              >
                <Layers className="w-4 h-4 mr-2" />
                Mood Board
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300"
              >
                <Film className="w-4 h-4 mr-2" />
                Storyboard
              </TabsTrigger>
              <TabsTrigger
                value="sora"
                className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Prompts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-24" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'moodboard' && <MoodBoardCanvas />}
        {activeTab === 'timeline' && <StoryboardTimeline />}
        {activeTab === 'sora' && <SoraPromptGenerator />}
      </main>
    </div>
  );
};

export default Gallery;
