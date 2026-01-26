import React, { useState, useMemo, useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Film,
  BookOpen,
  Layers
} from 'lucide-react';
import { storyVolumes } from '@/game/data/storyContent';
import { TimelineSceneCard, type TimelineScene } from './TimelineSceneCard';

type ZoomLevel = 'compact' | 'normal' | 'expanded';

export const StoryboardTimeline: React.FC = () => {
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('normal');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build flat list of all scenes with chapter context
  const allScenes: TimelineScene[] = useMemo(() => {
    const scenes: TimelineScene[] = [];

    storyVolumes.forEach(volume => {
      volume.chapters.forEach(chapter => {
        chapter.scenes.forEach(scene => {
          scenes.push({
            number: scene.number,
            title: scene.title,
            location: scene.location,
            timeOfDay: scene.timeOfDay,
            markerId: scene.markerId,
            chapterId: chapter.id,
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.title,
            volumeId: volume.id
          });
        });
      });
    });

    return scenes;
  }, []);

  // Filter scenes based on selection
  const filteredScenes = useMemo(() => {
    return allScenes.filter(scene => {
      if (selectedVolume !== 'all' && scene.volumeId !== parseInt(selectedVolume)) {
        return false;
      }
      if (selectedChapter !== 'all' && scene.chapterId !== selectedChapter) {
        return false;
      }
      return true;
    });
  }, [allScenes, selectedVolume, selectedChapter]);

  // Get chapters for selected volume
  const availableChapters = useMemo(() => {
    if (selectedVolume === 'all') {
      return storyVolumes.flatMap(v => v.chapters);
    }
    const volume = storyVolumes.find(v => v.id === parseInt(selectedVolume));
    return volume?.chapters || [];
  }, [selectedVolume]);

  // Group scenes by chapter for timeline rendering
  const scenesByChapter = useMemo(() => {
    const grouped: Record<string, TimelineScene[]> = {};
    filteredScenes.forEach(scene => {
      if (!grouped[scene.chapterId]) {
        grouped[scene.chapterId] = [];
      }
      grouped[scene.chapterId].push(scene);
    });
    return grouped;
  }, [filteredScenes]);

  // Zoom handling
  const handleZoomIn = () => {
    if (zoomLevel === 'compact') setZoomLevel('normal');
    else if (zoomLevel === 'normal') setZoomLevel('expanded');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'expanded') setZoomLevel('normal');
    else if (zoomLevel === 'normal') setZoomLevel('compact');
  };

  const handleReset = () => {
    setSelectedVolume('all');
    setSelectedChapter('all');
    setZoomLevel('normal');
    setActiveSceneId(null);
  };

  const cardWidth = {
    compact: 'w-32',
    normal: 'w-48',
    expanded: 'w-64'
  }[zoomLevel];

  const cardGap = {
    compact: 'gap-2',
    normal: 'gap-4',
    expanded: 'gap-6'
  }[zoomLevel];

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header / Controls */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-200">Storyboard Timeline</h2>
            </div>

            <Badge variant="outline" className="text-gray-400">
              {filteredScenes.length} scenes
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume Filter */}
            <Select value={selectedVolume} onValueChange={(v) => {
              setSelectedVolume(v);
              setSelectedChapter('all');
            }}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700">
                <Layers className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Volume" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Volumes</SelectItem>
                {storyVolumes.map(v => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    Volume {v.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chapter Filter */}
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700">
                <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 max-h-64">
                <SelectItem value="all">All Chapters</SelectItem>
                {availableChapters.map(ch => (
                  <SelectItem key={ch.id} value={ch.id}>
                    Ch. {ch.chapterNumber}: {ch.title.substring(0, 20)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel === 'compact'}
                className="h-8 w-8"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-500 w-16 text-center capitalize">
                {zoomLevel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel === 'expanded'}
                className="h-8 w-8"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-6 min-h-full">
            {Object.entries(scenesByChapter).length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No scenes found for the selected filters
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(scenesByChapter).map(([chapterId, scenes]) => {
                  const firstScene = scenes[0];
                  return (
                    <div key={chapterId}>
                      {/* Chapter Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-400">
                            {firstScene.chapterNumber}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-200">
                            {firstScene.chapterTitle}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Volume {firstScene.volumeId} • {scenes.length} scenes
                          </p>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent ml-4" />
                      </div>

                      {/* Timeline Row */}
                      <div className="relative pl-11">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />

                        {/* Scene Cards */}
                        <div className={`flex ${cardGap} overflow-x-auto pb-4`}>
                          {scenes.map((scene, idx) => (
                            <React.Fragment key={scene.markerId}>
                              {/* Connection dot */}
                              <div className="absolute left-[14px] w-2 h-2 rounded-full bg-yellow-500"
                                   style={{ top: `${idx === 0 ? 28 : 28}px` }} />

                              <TimelineSceneCard
                                scene={scene}
                                isActive={activeSceneId === scene.markerId}
                                onClick={() => setActiveSceneId(scene.markerId)}
                              />
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Total: {allScenes.length} scenes across {storyVolumes.length} volumes
          </span>
          <span>
            Showing: {filteredScenes.length} scenes
          </span>
        </div>
      </div>
    </div>
  );
};
