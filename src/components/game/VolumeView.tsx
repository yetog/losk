import { useState, useEffect } from 'react';
import { Volume } from '@/game/data/storyContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Book, Clock } from 'lucide-react';
import gsap from 'gsap';

interface VolumeViewProps {
  volume: Volume;
  onChapterSelect: (chapterId: string) => void;
  onBack: () => void;
  readChapters: string[];
}

const VolumeView = ({ volume, onChapterSelect, onBack, readChapters }: VolumeViewProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    gsap.from('.volume-header', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.chapter-item', {
      x: -50,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(volume.chapters.length, prev + 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex === volume.chapters.length) {
          onBack();
        } else {
          onChapterSelect(volume.chapters[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, volume.chapters, onChapterSelect, onBack]);

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="volume-header relative z-10 p-6 md:p-8 border-b border-yellow-400/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Book className="w-10 h-10 text-yellow-400" />
            <h1 className="text-3xl md:text-5xl font-bold text-yellow-300">
              {volume.title}
            </h1>
          </div>
          <p className="text-lg text-gray-300 mb-4">{volume.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{volume.chapters.length} Chapters</span>
            <span>•</span>
            <span>
              {readChapters.filter(id => volume.chapters.some(c => c.id === id)).length} Read
            </span>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <ScrollArea className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {volume.chapters.map((chapter, index) => {
            const isRead = readChapters.includes(chapter.id);
            const isSelected = index === selectedIndex;

            return (
              <button
                key={chapter.id}
                className={`chapter-item w-full p-6 rounded-lg border-2 transition-all duration-300 text-left transform ${
                  isSelected
                    ? 'bg-yellow-500/20 border-yellow-400 scale-105 shadow-lg shadow-yellow-400/30'
                    : 'bg-gray-800/80 border-gray-600 hover:border-yellow-400 hover:bg-gray-700/80'
                }`}
                onClick={() => onChapterSelect(chapter.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-medium px-3 py-1 rounded ${
                        isRead ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'
                      }`}>
                        Chapter {chapter.chapterNumber}
                      </span>
                      {isRead && (
                        <span className="text-green-400 text-sm">✓ Read</span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-300 mb-2">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{chapter.estimatedReadTime} min read</span>
                      </div>
                      <span>•</span>
                      <span>{chapter.wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Back Button */}
          <button
            className={`chapter-item w-full p-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
              selectedIndex === volume.chapters.length
                ? 'bg-yellow-500 border-yellow-400 text-black scale-105'
                : 'bg-gray-800 border-gray-600 text-white hover:border-yellow-400 hover:bg-gray-700'
            }`}
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-bold">BACK TO VOLUMES</span>
          </button>
        </div>
      </ScrollArea>

      {/* Navigation hint */}
      <div className="relative z-10 p-4 text-center text-gray-400 text-sm border-t border-gray-800">
        Use Arrow Keys and Enter to navigate • ESC to go back
      </div>
    </div>
  );
};

export default VolumeView;
