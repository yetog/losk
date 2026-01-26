import { useState, useEffect, useRef } from 'react';
import { Chapter } from '@/game/data/storyContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Play, Pause, Square, ChevronLeft, ChevronRight, Type, MessageSquare, Trash2 } from 'lucide-react';
import { ttsManager } from '@/utils/textToSpeech';
import { loadChapterNote, saveChapterNote, deleteChapterNote } from '@/utils/notesManager';
import gsap from 'gsap';

interface ChapterReaderProps {
  chapter: Chapter;
  onBack: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onMarkRead: (chapterId: string) => void;
}

type FontSize = 'small' | 'medium' | 'large';

const ChapterReader = ({ 
  chapter, 
  onBack, 
  onNextChapter, 
  onPrevChapter,
  hasNext,
  hasPrev,
  onMarkRead
}: ChapterReaderProps) => {
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fontSizeClasses = {
    small: 'text-base leading-relaxed',
    medium: 'text-lg leading-loose',
    large: 'text-xl leading-loose'
  };

  useEffect(() => {
    // Animate entrance
    gsap.from('.chapter-content', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Mark as read when component mounts
    onMarkRead(chapter.id);

    // Load note for this chapter
    const savedNote = loadChapterNote(chapter.id);
    setCurrentNote(savedNote?.note || '');
    setNotesExpanded(false);

    // Cleanup TTS on unmount
    return () => {
      ttsManager.stop();
      setIsTTSPlaying(false);
      setIsTTSPaused(false);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [chapter.id, onMarkRead]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPrevChapter?.();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNextChapter?.();
      } else if (e.key === ' ' && isTTSPlaying) {
        e.preventDefault();
        handleTTSToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onNextChapter, onPrevChapter, hasNext, hasPrev, isTTSPlaying]);

  const handleTTSPlay = () => {
    if (!ttsManager.isSupported()) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    const voices = ttsManager.getVoices();
    const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];

    ttsManager.speak(chapter.content, {
      rate: 1.0,
      voice: defaultVoice,
      onEnd: () => {
        setIsTTSPlaying(false);
        setIsTTSPaused(false);
      }
    });

    setIsTTSPlaying(true);
    setIsTTSPaused(false);
  };

  const handleTTSPause = () => {
    ttsManager.pause();
    setIsTTSPaused(true);
  };

  const handleTTSResume = () => {
    ttsManager.resume();
    setIsTTSPaused(false);
  };

  const handleTTSStop = () => {
    ttsManager.stop();
    setIsTTSPlaying(false);
    setIsTTSPaused(false);
  };

  const handleTTSToggle = () => {
    if (isTTSPaused) {
      handleTTSResume();
    } else {
      handleTTSPause();
    }
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'small') return 'medium';
      if (prev === 'medium') return 'large';
      return 'small';
    });
  };

  const handleNoteChange = (value: string) => {
    setCurrentNote(value);
    
    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        saveChapterNote(chapter.id, value);
      } else {
        deleteChapterNote(chapter.id);
      }
    }, 1000);
  };

  const handleDeleteNote = () => {
    setCurrentNote('');
    deleteChapterNote(chapter.id);
    setNotesExpanded(false);
  };

  const savedNote = loadChapterNote(chapter.id);
  const lastEditedDate = savedNote?.lastEdited 
    ? new Date(savedNote.lastEdited).toLocaleDateString() 
    : null;

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header Controls */}
      <div className="relative z-10 p-4 md:p-6 border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Font Size Toggle */}
              <button
                onClick={cycleFontSize}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title="Change font size"
              >
                <Type className="w-5 h-5" />
                <span className="hidden md:inline text-sm uppercase">{fontSize}</span>
              </button>

              {/* TTS Controls */}
              {!isTTSPlaying ? (
                <button
                  onClick={handleTTSPlay}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="hidden md:inline">Listen</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTTSToggle}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                  >
                    {isTTSPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleTTSStop}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Chapter {chapter.chapterNumber}</div>
            <h1 className="text-2xl md:text-4xl font-bold text-yellow-300">{chapter.title}</h1>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="chapter-content max-w-4xl mx-auto p-6 md:p-12">
          <div className={`${fontSizeClasses[fontSize]} text-gray-100 whitespace-pre-wrap`}>
            {chapter.content}
          </div>

          {/* Notes Section */}
          <div className="mt-12 border-t border-yellow-400/30 pt-8">
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition-colors mb-4"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">My Notes</span>
              {savedNote && !notesExpanded && (
                <span className="text-sm text-gray-400 ml-2">
                  (Last edited: {lastEditedDate})
                </span>
              )}
            </button>

            {notesExpanded && (
              <div className="space-y-3">
                <textarea
                  value={currentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Add your thoughts about this chapter..."
                  className="w-full min-h-[200px] p-4 rounded-lg bg-gray-800/50 border border-yellow-400/30 text-gray-100 placeholder:text-gray-500 focus:border-yellow-400/60 focus:outline-none resize-y"
                  maxLength={5000}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {currentNote.length} / 5000 characters
                  </span>
                  {currentNote.trim() && (
                    <button
                      onClick={handleDeleteNote}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Note
                    </button>
                  )}
                </div>
                {lastEditedDate && (
                  <p className="text-xs text-gray-500">
                    Auto-saved • Last edited: {lastEditedDate}
                  </p>
                )}
              </div>
            )}

            {!notesExpanded && currentNote.trim() && (
              <div className="p-4 rounded-lg bg-gray-800/30 border border-yellow-400/20">
                <p className="text-gray-300 text-sm line-clamp-3">{currentNote}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Navigation */}
      <div className="relative z-10 p-4 md:p-6 border-t border-yellow-400/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:inline">Previous</span>
          </button>

          <div className="text-center text-sm text-gray-400">
            <div>{chapter.estimatedReadTime} min read • {chapter.wordCount.toLocaleString()} words</div>
          </div>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;
