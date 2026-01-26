import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StickyNote, Edit3 } from 'lucide-react';

export interface TextNodeData {
  label: string;
  content: string;
  color?: string;
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-yellow-500/20 border-yellow-500/50',
  blue: 'bg-blue-500/20 border-blue-500/50',
  green: 'bg-green-500/20 border-green-500/50',
  purple: 'bg-purple-500/20 border-purple-500/50',
  red: 'bg-red-500/20 border-red-500/50',
  gray: 'bg-gray-800 border-gray-600'
};

export const TextNode = memo(({ data, selected }: NodeProps<TextNodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClass = colorClasses[data.color || 'yellow'] || colorClasses.yellow;

  return (
    <div
      className={`rounded-lg border-2 min-w-[180px] max-w-[300px] transition-all ${colorClass} ${
        selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-400 border-2 border-gray-900"
      />

      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10">
        <StickyNote className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-gray-200 flex-1 truncate">
          {data.label}
        </span>
        {isHovered && (
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <Edit3 className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm text-gray-300 whitespace-pre-wrap">
          {data.content}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 border-2 border-gray-900"
      />
    </div>
  );
});

TextNode.displayName = 'TextNode';
