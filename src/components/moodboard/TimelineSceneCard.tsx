import { memo } from 'react';
import { MapPin, Clock, ExternalLink } from 'lucide-react';

export interface TimelineScene {
  number: number;
  title: string;
  location: string;
  timeOfDay: string;
  markerId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  volumeId: number;
}

interface TimelineSceneCardProps {
  scene: TimelineScene;
  isActive?: boolean;
  onClick?: () => void;
}

export const TimelineSceneCard = memo(({ scene, isActive, onClick }: TimelineSceneCardProps) => {
  // Color based on scene content (action, dialogue, etc.)
  const getSceneColor = () => {
    const loc = scene.location.toLowerCase();
    if (loc.includes('arena') || loc.includes('combat') || loc.includes('battle')) {
      return 'border-red-500/50 bg-red-500/10';
    }
    if (loc.includes('int.')) {
      return 'border-blue-500/50 bg-blue-500/10';
    }
    if (loc.includes('ext.')) {
      return 'border-green-500/50 bg-green-500/10';
    }
    return 'border-yellow-500/50 bg-yellow-500/10';
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex-shrink-0 w-48 rounded-lg border-2 overflow-hidden cursor-pointer
        transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${isActive ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-950' : ''}
        ${getSceneColor()}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-yellow-400">
            S{scene.number}
          </span>
          <span className="text-xs text-gray-500">
            V{scene.volumeId} Ch.{scene.chapterNumber}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h4 className="text-sm font-medium text-gray-200 line-clamp-2 min-h-[2.5rem]">
          {scene.title}
        </h4>

        {scene.location && (
          <div className="flex items-start gap-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{scene.location}</span>
          </div>
        )}

        {scene.timeOfDay && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{scene.timeOfDay}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-black/20 border-t border-white/10">
        <a
          href={`/story?volume=${scene.volumeId}&chapter=${scene.chapterId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <span>Read chapter</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

TimelineSceneCard.displayName = 'TimelineSceneCard';
