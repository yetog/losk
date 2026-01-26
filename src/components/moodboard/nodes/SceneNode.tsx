import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Film, MapPin, Users, Sparkles } from 'lucide-react';

export interface SceneNodeData {
  sceneId: string;
  title: string;
  location?: string;
  characters?: string[];
  mood?: 'action' | 'emotional' | 'suspense' | 'comedy' | 'dramatic';
  description?: string;
}

const moodColors: Record<string, { bg: string; text: string; icon: string }> = {
  action: { bg: 'bg-red-500/20', text: 'text-red-400', icon: 'border-red-500/50' },
  emotional: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'border-blue-500/50' },
  suspense: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'border-purple-500/50' },
  comedy: { bg: 'bg-green-500/20', text: 'text-green-400', icon: 'border-green-500/50' },
  dramatic: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: 'border-orange-500/50' }
};

export const SceneNode = memo(({ data, selected }: NodeProps<SceneNodeData>) => {
  const mood = moodColors[data.mood || 'dramatic'] || moodColors.dramatic;

  return (
    <div
      className={`bg-gray-900 rounded-lg border-2 min-w-[200px] max-w-[280px] transition-all ${mood.icon} ${
        selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-400 border-2 border-gray-900"
      />

      {/* Header */}
      <div className={`flex items-center gap-2 p-3 border-b border-gray-700 ${mood.bg}`}>
        <Film className={`w-5 h-5 ${mood.text}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">
            {data.title}
          </p>
        </div>
        {data.mood && (
          <span className={`text-xs px-2 py-0.5 rounded ${mood.bg} ${mood.text} capitalize`}>
            {data.mood}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Location */}
        {data.location && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{data.location}</span>
          </div>
        )}

        {/* Characters */}
        {data.characters && data.characters.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span className="truncate">{data.characters.join(', ')}</span>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-2">
            {data.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-400 border-2 border-gray-900"
      />
    </div>
  );
});

SceneNode.displayName = 'SceneNode';
