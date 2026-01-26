import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, ExternalLink } from 'lucide-react';

export interface CharacterNodeData {
  characterId: string;
  name: string;
  portrait: string;
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  species?: string;
  icon?: string;
}

const roleColors: Record<string, string> = {
  protagonist: 'border-yellow-500/50 bg-yellow-500/10',
  antagonist: 'border-red-500/50 bg-red-500/10',
  supporting: 'border-blue-500/50 bg-blue-500/10',
  minor: 'border-gray-500/50 bg-gray-500/10'
};

export const CharacterNode = memo(({ data, selected }: NodeProps<CharacterNodeData>) => {
  const [imageError, setImageError] = useState(false);
  const roleClass = roleColors[data.role || 'supporting'] || roleColors.supporting;

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden min-w-[160px] transition-all ${roleClass} ${
        selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-400 border-2 border-gray-900"
      />

      {/* Portrait */}
      <div className="relative aspect-[3/4] bg-gray-800 overflow-hidden">
        {!imageError && data.portrait ? (
          <img
            src={data.portrait}
            alt={data.name}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <User className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center gap-2">
            {data.icon && <span className="text-lg">{data.icon}</span>}
            <div>
              <p className="text-sm font-bold text-white">{data.name}</p>
              {data.species && (
                <p className="text-xs text-gray-300">{data.species}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded capitalize ${
            data.role === 'protagonist' ? 'bg-yellow-500/30 text-yellow-300' :
            data.role === 'antagonist' ? 'bg-red-500/30 text-red-300' :
            'bg-gray-500/30 text-gray-300'
          }`}
        >
          {data.role || 'character'}
        </span>
        <a
          href={`/characters`}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 border-2 border-gray-900"
      />
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';
