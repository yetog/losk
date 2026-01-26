import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storyVolumes, getVolumeById, getChapterById, Volume, Scene } from '@/game/data/storyContent';
import { useAIContext } from '@/context/AIContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Book,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Type,
  Play,
  Pause,
  Square,
  MessageSquare,
  Trash2,
  BarChart3,
  List,
  X,
  Check,
  Volume2,
  SkipBack,
  SkipForward,
  Settings,
  Mic
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ttsManager } from '@/utils/textToSpeech';
import { loadChapterNote, saveChapterNote, deleteChapterNote } from '@/utils/notesManager';
import gsap from 'gsap';

type ViewState = 'volumes' | 'chapters' | 'reader';
type FontSize = 'small' | 'medium' | 'large';

const Story = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageContext, setStructuredContext, setSelectedText } = useAIContext();

  // View state
  const [viewState, setViewState] = useState<ViewState>('volumes');
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Reader state
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [currentNote, setCurrentNote] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [sceneSidebarOpen, setSceneSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // TTS state
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [currentUIIndex, setCurrentUIIndex] = useState(-1); // UI paragraph index (includes headers)
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsProgress, setTtsProgress] = useState({ current: 0, total: 0 });
  const [showTTSPanel, setShowTTSPanel] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [ttsToUIMap, setTtsToUIMap] = useState<number[]>([]); // Maps TTS index to UI index

  // Progress tracking
  const [readChapters, setReadChapters] = useState<string[]>(() => {
    const saved = localStorage.getItem('losk_story_progress');
    return saved ? JSON.parse(saved).readChapters || [] : [];
  });

  // Handle URL params on mount
  useEffect(() => {
    const volumeParam = searchParams.get('volume');
    const chapterParam = searchParams.get('chapter');

    if (volumeParam && chapterParam) {
      setSelectedVolume(parseInt(volumeParam));
      setSelectedChapter(chapterParam);
      setViewState('reader');
    } else if (volumeParam) {
      setSelectedVolume(parseInt(volumeParam));
      setViewState('chapters');
    }
  }, [searchParams]);

  // Animate on view change
  useEffect(() => {
    // Use fromTo to ensure elements always end at opacity: 1
    gsap.fromTo('.animate-in',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [viewState]);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = ttsManager.getVoices();
      setAvailableVoices(voices);
      // Default to first English voice
      const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (defaultVoice && !selectedVoice) {
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    // Voices may load async
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Load notes and parse paragraphs when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      const chapter = getChapterById(selectedChapter);
      const savedNote = loadChapterNote(selectedChapter);
      setCurrentNote(savedNote?.note || '');
      setNotesExpanded(false);

      // Parse paragraphs for display (includes headers)
      if (chapter) {
        const parsed = ttsManager.parseContent(chapter.content);
        setParagraphs(parsed);
        paragraphRefs.current = parsed.map(() => null);

        // Build TTS-to-UI index mapping
        // TTS skips headers, so we map each TTS index to its corresponding UI index
        const mapping: number[] = [];
        parsed.forEach((p, uiIndex) => {
          if (!p.startsWith('##')) {
            mapping.push(uiIndex);
          }
        });
        setTtsToUIMap(mapping);
      }

      // Mark as read
      markChapterRead(selectedChapter);

      // Reset TTS state
      setCurrentUIIndex(-1);
      setTtsProgress({ current: 0, total: 0 });
    }

    return () => {
      ttsManager.stop();
      setIsTTSPlaying(false);
      setIsTTSPaused(false);
      setCurrentUIIndex(-1);
    };
  }, [selectedChapter]);

  const markChapterRead = (chapterId: string) => {
    if (!readChapters.includes(chapterId)) {
      const updated = [...readChapters, chapterId];
      setReadChapters(updated);
      localStorage.setItem('losk_story_progress', JSON.stringify({ readChapters: updated }));
    }
  };

  // Update AI context when chapter changes
  useEffect(() => {
    if (viewState === 'reader' && selectedChapter && selectedVolume) {
      const chapter = getChapterById(selectedChapter);
      if (chapter) {
        // Set page context with chapter content
        setPageContext('story', chapter.content);

        // Set structured context with chapter metadata
        setStructuredContext('chapter', {
          title: chapter.title,
          volumeId: selectedVolume,
          chapterNumber: chapter.chapterNumber,
          wordCount: chapter.wordCount,
          scenes: chapter.scenes
        });
      }
    } else if (viewState === 'volumes') {
      setPageContext('story/volumes', '');
    } else if (viewState === 'chapters' && selectedVolume) {
      const volume = getVolumeById(selectedVolume);
      setPageContext('story/chapters', volume?.description || '');
    }
  }, [viewState, selectedChapter, selectedVolume, setPageContext, setStructuredContext]);

  // Handle text selection for AI context
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString().trim());
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [setSelectedText]);

  const handleVolumeSelect = (volumeId: number) => {
    setSelectedVolume(volumeId);
    setViewState('chapters');
    setSearchParams({ volume: volumeId.toString() });
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setViewState('reader');
    setSearchParams({ volume: selectedVolume!.toString(), chapter: chapterId });
  };

  const handleBack = () => {
    if (viewState === 'reader') {
      setViewState('chapters');
      setSelectedChapter(null);
      setSearchParams({ volume: selectedVolume!.toString() });
      ttsManager.stop();
    } else if (viewState === 'chapters') {
      setViewState('volumes');
      setSelectedVolume(null);
      setSearchParams({});
    }
  };

  // TTS Handlers
  const handleTTSPlay = (startFromUIIndex?: number) => {
    const chapter = getChapterById(selectedChapter!);
    if (!chapter || !ttsManager.isSupported()) return;

    const ttsOptions = {
      rate: ttsRate,
      voice: selectedVoice || undefined,
      onParagraphStart: (ttsIndex: number) => {
        // Map TTS index back to UI index for highlighting
        const uiIndex = ttsToUIMap[ttsIndex] ?? -1;
        setCurrentUIIndex(uiIndex);
        // Auto-scroll to current paragraph
        const paragraphEl = paragraphRefs.current[uiIndex];
        if (paragraphEl) {
          paragraphEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      onProgress: (current: number, total: number) => {
        setTtsProgress({ current, total });
      },
      onComplete: () => {
        setIsTTSPlaying(false);
        setIsTTSPaused(false);
        setCurrentUIIndex(-1);
      }
    };

    if (startFromUIIndex !== undefined) {
      ttsManager.speakFromParagraph(chapter.content, startFromUIIndex, ttsOptions);
    } else {
      ttsManager.speak(chapter.content, ttsOptions);
    }

    setIsTTSPlaying(true);
    setIsTTSPaused(false);
    setShowTTSPanel(true);
  };

  const handleTTSToggle = () => {
    if (isTTSPaused) {
      ttsManager.resume();
      setIsTTSPaused(false);
    } else {
      ttsManager.pause();
      setIsTTSPaused(true);
    }
  };

  const handleTTSStop = () => {
    ttsManager.stop();
    setIsTTSPlaying(false);
    setIsTTSPaused(false);
    setCurrentUIIndex(-1);
    setTtsProgress({ current: 0, total: 0 });
  };

  const handleTTSNext = () => {
    ttsManager.nextParagraph();
  };

  const handleTTSPrev = () => {
    ttsManager.previousParagraph();
  };

  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setTtsRate(newRate);
    ttsManager.setRate(newRate);
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      ttsManager.setVoice(voice);
    }
  };

  const handleParagraphClick = (index: number) => {
    const chapter = getChapterById(selectedChapter!);
    if (!chapter) return;

    if (isTTSPlaying) {
      // Jump to this UI paragraph (handles header-to-TTS mapping)
      ttsManager.goToUIParagraph(index, paragraphs);
    } else {
      // Start playing from this paragraph
      handleTTSPlay(index);
    }
  };

  // Notes handlers
  const handleNoteChange = (value: string) => {
    setCurrentNote(value);
    if (selectedChapter) {
      if (value.trim()) {
        saveChapterNote(selectedChapter, value);
      } else {
        deleteChapterNote(selectedChapter);
      }
    }
  };

  // Navigation
  const getAdjacentChapters = () => {
    if (!selectedVolume || !selectedChapter) return { prev: null, next: null };
    const volume = getVolumeById(selectedVolume);
    if (!volume) return { prev: null, next: null };

    const currentIndex = volume.chapters.findIndex(c => c.id === selectedChapter);
    return {
      prev: currentIndex > 0 ? volume.chapters[currentIndex - 1].id : null,
      next: currentIndex < volume.chapters.length - 1 ? volume.chapters[currentIndex + 1].id : null
    };
  };

  const { prev, next } = getAdjacentChapters();
  const currentVolume = selectedVolume ? getVolumeById(selectedVolume) : null;
  const currentChapter = selectedChapter ? getChapterById(selectedChapter) : null;

  const fontSizeClasses = {
    small: 'text-base leading-relaxed',
    medium: 'text-lg leading-loose',
    large: 'text-xl leading-loose'
  };

  // Scroll to a specific scene
  const scrollToScene = (sceneNumber: number) => {
    const marker = document.getElementById(`scene-marker-${sceneNumber}`);
    if (marker) {
      marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Flash highlight effect
      marker.classList.add('bg-yellow-400/20');
      setTimeout(() => marker.classList.remove('bg-yellow-400/20'), 1500);
    }
  };

  // Render content as clickable paragraphs with TTS highlighting
  const renderClickableParagraphs = () => {
    if (paragraphs.length === 0) return null;

    // Pre-compute scene numbers by scanning paragraphs
    let sceneCounter = 0;
    const sceneNumberMap = new Map<number, number>();
    paragraphs.forEach((p, idx) => {
      if (p.match(/^##\s*(INT\.|EXT\.|INT\/EXT\.)/)) {
        sceneCounter++;
        sceneNumberMap.set(idx, sceneCounter);
      }
    });

    return paragraphs.map((paragraph, index) => {
      const isCurrentlyReading = currentUIIndex === index;
      const isSceneHeader = paragraph.startsWith('##');
      const sceneNumber = sceneNumberMap.get(index);

      return (
        <div
          key={index}
          id={sceneNumber ? `scene-marker-${sceneNumber}` : undefined}
          ref={(el) => { paragraphRefs.current[index] = el; }}
          onClick={() => handleParagraphClick(index)}
          className={`
            relative cursor-pointer rounded-lg transition-all duration-300 -mx-2 px-2 py-1
            ${isCurrentlyReading
              ? 'bg-yellow-400/20 border-l-4 border-yellow-400 pl-4'
              : 'hover:bg-gray-800/30 border-l-4 border-transparent'
            }
            ${isSceneHeader ? 'mt-8 mb-4' : 'mb-4'}
          `}
          title={isTTSPlaying ? 'Click to jump here' : 'Click to start reading from here'}
        >
          {isSceneHeader ? (
            <p className="text-yellow-400/80 font-mono text-sm uppercase tracking-wider">
              {paragraph.replace(/^##\s*/, '')}
            </p>
          ) : (
            <p className="whitespace-pre-wrap">{paragraph}</p>
          )}

          {/* Play indicator on hover when not playing */}
          {!isTTSPlaying && !isSceneHeader && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 text-yellow-400" />
            </div>
          )}
        </div>
      );
    });
  };

  // Render TTS Control Panel
  const renderTTSPanel = () => {
    if (!showTTSPanel && !isTTSPlaying) return null;

    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 shadow-2xl min-w-[320px] max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-yellow-300">Audio Reader</span>
          </div>
          <button
            onClick={() => setShowTTSPanel(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        {ttsProgress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Paragraph {ttsProgress.current} of {ttsProgress.total}</span>
              <span>{Math.round((ttsProgress.current / ttsProgress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${(ttsProgress.current / ttsProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleTTSPrev}
            disabled={!isTTSPlaying}
            className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
            title="Previous paragraph"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {!isTTSPlaying ? (
            <button
              onClick={() => handleTTSPlay()}
              className="p-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors"
              title="Play"
            >
              <Play className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleTTSToggle}
              className="p-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors"
              title={isTTSPaused ? 'Resume' : 'Pause'}
            >
              {isTTSPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={handleTTSNext}
            disabled={!isTTSPlaying}
            className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
            title="Next paragraph"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={handleTTSStop}
            disabled={!isTTSPlaying}
            className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors text-red-400"
            title="Stop"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Speed</span>
            <span className="text-yellow-300 font-mono">{ttsRate.toFixed(1)}x</span>
          </div>
          <Slider
            value={[ttsRate]}
            onValueChange={handleRateChange}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span>1x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Voice Selection */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </div>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
          >
            {availableVoices
              .filter(v => v.lang.startsWith('en'))
              .map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name.replace(/Microsoft |Google /, '')}
                </option>
              ))
            }
          </select>
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Click any paragraph to jump there
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewState !== 'volumes' ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline">Back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline">Home</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold text-yellow-300">
                  {viewState === 'volumes' && 'Legend of the Soul King'}
                  {viewState === 'chapters' && currentVolume?.title}
                  {viewState === 'reader' && currentChapter?.title}
                </h1>
                {viewState === 'reader' && (
                  <p className="text-xs text-gray-400">Chapter {currentChapter?.chapterNumber}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewState === 'reader' && (
              <>
                <button
                  onClick={() => setFontSize(f => f === 'small' ? 'medium' : f === 'medium' ? 'large' : 'small')}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  title="Change font size"
                >
                  <Type className="w-5 h-5" />
                </button>

                {!isTTSPlaying ? (
                  <button
                    onClick={() => { handleTTSPlay(); setShowTTSPanel(true); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span className="hidden md:inline">Listen</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowTTSPanel(!showTTSPanel)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span className="hidden md:inline">
                      {ttsProgress.current}/{ttsProgress.total}
                    </span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Volumes View */}
        {viewState === 'volumes' && (
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {storyVolumes.map((volume, index) => {
                  const readInVolume = readChapters.filter(id =>
                    volume.chapters.some(c => c.id === id)
                  ).length;
                  const progress = Math.round((readInVolume / volume.chapters.length) * 100);
                  const totalWords = volume.chapters.reduce((sum, c) => sum + c.wordCount, 0);

                  return (
                    <button
                      key={volume.id}
                      onClick={() => handleVolumeSelect(volume.id)}
                      className="animate-in bg-gray-800/50 rounded-xl p-6 border-2 border-gray-700 hover:border-yellow-400 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Book className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <h2 className="text-xl font-bold text-yellow-300">{volume.title}</h2>
                          <p className="text-sm text-gray-400">{volume.chapters.length} chapters</p>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{volume.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-yellow-300">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{totalWords.toLocaleString()} words total</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Chapters View */}
        {viewState === 'chapters' && currentVolume && (
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <p className="text-gray-400">{currentVolume.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{currentVolume.chapters.length} chapters</span>
                  <span>•</span>
                  <span>
                    {readChapters.filter(id => currentVolume.chapters.some(c => c.id === id)).length} read
                  </span>
                </div>
              </div>

              <div className="space-y-3 pb-8">
                {currentVolume.chapters.map(chapter => {
                  const isRead = readChapters.includes(chapter.id);
                  const isShort = chapter.wordCount < 500;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleChapterSelect(chapter.id)}
                      className={`animate-in w-full bg-gray-800/50 rounded-lg p-5 border-2 transition-all text-left hover:scale-[1.02] ${
                        isShort ? 'border-red-500/30 hover:border-red-400' : 'border-gray-700 hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              isRead ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'
                            }`}>
                              Chapter {chapter.chapterNumber}
                            </span>
                            {isRead && <Check className="w-4 h-4 text-green-400" />}
                            {isShort && (
                              <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300">
                                Summary Only
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-yellow-300">{chapter.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {chapter.estimatedReadTime} min
                            </span>
                            <span>{chapter.wordCount.toLocaleString()} words</span>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Reader View */}
        {viewState === 'reader' && currentChapter && (
          <>
            <div className="flex h-[calc(100vh-8rem)]">
              {/* Scene Sidebar */}
              <div className={`${sceneSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-700/50 bg-gray-900/50 flex-shrink-0`}>
                <div className="w-72 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <h3 className="font-semibold text-yellow-300">Scenes</h3>
                    <span className="text-xs text-gray-500">{currentChapter.scenes.length} scenes</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {currentChapter.scenes.map((scene, index) => (
                        <button
                          key={scene.markerId}
                          onClick={() => scrollToScene(scene.number)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors group mb-1"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center justify-center font-medium">
                              {scene.number}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-200 group-hover:text-yellow-300 truncate">
                                {scene.title}
                              </p>
                              {scene.location && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {scene.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 relative">
                {/* Sidebar Toggle Button */}
                <button
                  onClick={() => setSceneSidebarOpen(!sceneSidebarOpen)}
                  className={`absolute top-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all ${
                    sceneSidebarOpen ? 'left-4' : 'left-4'
                  }`}
                >
                  {sceneSidebarOpen ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  <span className="text-sm">{sceneSidebarOpen ? 'Close' : 'Scenes'}</span>
                </button>

                <ScrollArea className="h-full">
                  <div ref={contentRef} className="animate-in max-w-4xl mx-auto p-6 md:p-12 pt-16">
                    <div className={`${fontSizeClasses[fontSize]} text-gray-100 group`}>
                      {renderClickableParagraphs()}
                    </div>

                    {/* Notes Section */}
                    <div className="mt-12 border-t border-yellow-400/30 pt-8">
                      <button
                        onClick={() => setNotesExpanded(!notesExpanded)}
                        className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition-colors mb-4"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-semibold">My Notes</span>
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
                            <span className="text-gray-400">{currentNote.length} / 5000</span>
                            {currentNote.trim() && (
                              <button
                                onClick={() => { setCurrentNote(''); deleteChapterNote(currentChapter.id); }}
                                className="flex items-center gap-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" /> Clear
                              </button>
                            )}
                          </div>
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
              </div>
            </div>

            {/* TTS Control Panel */}
            {renderTTSPanel()}

            {/* Footer Navigation */}
            <div className="border-t border-yellow-400/30 bg-black/50 backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <button
                  onClick={() => prev && handleChapterSelect(prev)}
                  disabled={!prev}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden md:inline">Previous</span>
                </button>

                <div className="text-center text-sm text-gray-400">
                  {currentChapter.estimatedReadTime} min • {currentChapter.wordCount.toLocaleString()} words
                </div>

                <button
                  onClick={() => next && handleChapterSelect(next)}
                  disabled={!next}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Story;
