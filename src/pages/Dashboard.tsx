import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Book,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Home,
  BookOpen
} from 'lucide-react';
import { storyVolumes, Volume, Chapter } from '@/game/data/storyContent';
import { useAIContext } from '@/context/AIContext';

interface VolumeStats {
  totalWords: number;
  totalChapters: number;
  totalScenes: number;
  avgChapterWords: number;
  shortScenes: { chapter: string; scene: string; words: number }[];
  readProgress: number;
}

interface Issue {
  type: 'short_scene' | 'missing_content' | 'placeholder';
  severity: 'critical' | 'warning' | 'info';
  location: string;
  description: string;
  wordCount?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { setPageContext } = useAIContext();
  const [selectedVolume, setSelectedVolume] = useState<number>(1);
  const [readChapters, setReadChapters] = useState<string[]>(() => {
    const saved = localStorage.getItem('losk_story_progress');
    return saved ? JSON.parse(saved).readChapters || [] : [];
  });

  // Set AI context for dashboard
  useEffect(() => {
    setPageContext('dashboard', 'Viewing manuscript analytics - word counts, progress, and content issues');
  }, [setPageContext]);

  // Calculate statistics for a volume
  const calculateVolumeStats = (volume: Volume): VolumeStats => {
    const totalWords = volume.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    const shortScenes: VolumeStats['shortScenes'] = [];

    // Detect short chapters (placeholder content)
    volume.chapters.forEach(ch => {
      if (ch.wordCount < 100) {
        shortScenes.push({
          chapter: ch.title,
          scene: 'Full chapter',
          words: ch.wordCount
        });
      }
    });

    const readInVolume = readChapters.filter(id =>
      volume.chapters.some(c => c.id === id)
    ).length;

    return {
      totalWords,
      totalChapters: volume.chapters.length,
      totalScenes: volume.chapters.length, // Simplified - actual scenes would need parsing
      avgChapterWords: Math.round(totalWords / volume.chapters.length),
      shortScenes,
      readProgress: Math.round((readInVolume / volume.chapters.length) * 100)
    };
  };

  // Detect issues across volumes
  const detectIssues = (): Issue[] => {
    const issues: Issue[] = [];

    storyVolumes.forEach(volume => {
      volume.chapters.forEach(chapter => {
        // Detect placeholder/short content
        if (chapter.wordCount < 100) {
          issues.push({
            type: 'placeholder',
            severity: 'critical',
            location: `Volume ${volume.id}, ${chapter.title}`,
            description: `Chapter has only ${chapter.wordCount} words - likely placeholder content`,
            wordCount: chapter.wordCount
          });
        } else if (chapter.wordCount < 500) {
          issues.push({
            type: 'short_scene',
            severity: 'warning',
            location: `Volume ${volume.id}, ${chapter.title}`,
            description: `Chapter is unusually short (${chapter.wordCount} words)`,
            wordCount: chapter.wordCount
          });
        }

        // Detect placeholder text patterns
        if (chapter.content.includes('Mission details') ||
            chapter.content.includes('events leading to') ||
            chapter.content.includes('[TBD]') ||
            chapter.content.includes('TODO')) {
          issues.push({
            type: 'placeholder',
            severity: 'critical',
            location: `Volume ${volume.id}, ${chapter.title}`,
            description: 'Contains placeholder text that needs to be replaced'
          });
        }
      });
    });

    return issues;
  };

  const currentVolume = storyVolumes.find(v => v.id === selectedVolume)!;
  const stats = calculateVolumeStats(currentVolume);
  const allIssues = detectIssues();
  const volumeIssues = allIssues.filter(i => i.location.includes(`Volume ${selectedVolume}`));

  // Calculate overall project stats
  const totalProjectWords = storyVolumes.reduce((sum, v) =>
    sum + v.chapters.reduce((s, c) => s + c.wordCount, 0), 0
  );
  const totalChaptersProject = storyVolumes.reduce((sum, v) => sum + v.chapters.length, 0);
  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-yellow-300">LOSK Review Dashboard</h1>
                <p className="text-sm text-gray-400">Manuscript Analysis & Progress Tracking</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/story')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden md:inline">Read Story</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-400 text-sm">Total Words</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalProjectWords.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">~{Math.round(totalProjectWords / 250)} pages</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <span className="text-gray-400 text-sm">Chapters</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalChaptersProject}</p>
            <p className="text-sm text-gray-500 mt-1">across {storyVolumes.length} volumes</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-gray-400 text-sm">Read Progress</span>
            </div>
            <p className="text-3xl font-bold text-white">{readChapters.length}/{totalChaptersProject}</p>
            <Progress value={(readChapters.length / totalChaptersProject) * 100} className="mt-2" />
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className={`w-6 h-6 ${criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`} />
              <span className="text-gray-400 text-sm">Issues Found</span>
            </div>
            <p className="text-3xl font-bold text-white">{allIssues.length}</p>
            <p className="text-sm text-gray-500 mt-1">{criticalIssues} critical</p>
          </div>
        </div>

        {/* Volume Selector */}
        <div className="flex gap-2 mb-6">
          {storyVolumes.map(volume => (
            <button
              key={volume.id}
              onClick={() => setSelectedVolume(volume.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedVolume === volume.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Volume {volume.id}
            </button>
          ))}
        </div>

        {/* Volume Detail Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="issues">Issues ({volumeIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Volume Stats */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">{currentVolume.title}</h3>
              <p className="text-gray-400 mb-6">{currentVolume.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Words</p>
                  <p className="text-2xl font-bold text-white">{stats.totalWords.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Chapters</p>
                  <p className="text-2xl font-bold text-white">{stats.totalChapters}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Avg. Chapter</p>
                  <p className="text-2xl font-bold text-white">{stats.avgChapterWords.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Read Progress</p>
                  <p className="text-2xl font-bold text-white">{stats.readProgress}%</p>
                </div>
              </div>
            </div>

            {/* Word Count Chart (simplified bar representation) */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-yellow-300 mb-4">Chapter Word Counts</h3>
              <div className="space-y-3">
                {currentVolume.chapters.map(chapter => {
                  const maxWords = Math.max(...currentVolume.chapters.map(c => c.wordCount));
                  const percentage = (chapter.wordCount / maxWords) * 100;
                  const isShort = chapter.wordCount < 500;

                  return (
                    <div key={chapter.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={isShort ? 'text-red-400' : 'text-gray-300'}>
                          Ch{chapter.chapterNumber}: {chapter.title}
                        </span>
                        <span className={isShort ? 'text-red-400' : 'text-gray-400'}>
                          {chapter.wordCount.toLocaleString()} words
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isShort ? 'bg-red-500' : 'bg-yellow-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chapters">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {currentVolume.chapters.map(chapter => {
                  const isRead = readChapters.includes(chapter.id);
                  const hasIssue = chapter.wordCount < 500;

                  return (
                    <div
                      key={chapter.id}
                      className={`bg-gray-800/50 rounded-lg p-4 border ${
                        hasIssue ? 'border-red-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isRead ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'
                            }`}>
                              Chapter {chapter.chapterNumber}
                            </span>
                            {hasIssue && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                Needs Work
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-yellow-300">{chapter.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {chapter.wordCount.toLocaleString()} words • {chapter.estimatedReadTime} min read
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/story?volume=${currentVolume.id}&chapter=${chapter.id}`)}
                          className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="issues">
            <ScrollArea className="h-[600px]">
              {volumeIssues.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-300">No issues found in this volume!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {volumeIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`bg-gray-800/50 rounded-lg p-4 border ${
                        issue.severity === 'critical' ? 'border-red-500/50' :
                        issue.severity === 'warning' ? 'border-yellow-500/50' :
                        'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          issue.severity === 'critical' ? 'text-red-400' :
                          issue.severity === 'warning' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            issue.severity === 'critical' ? 'text-red-300' :
                            issue.severity === 'warning' ? 'text-yellow-300' :
                            'text-gray-300'
                          }`}>
                            {issue.location}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
                          {issue.wordCount && (
                            <p className="text-xs text-gray-500 mt-1">Word count: {issue.wordCount}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
