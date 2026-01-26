import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MapPin, Sun, Moon, Sunrise, Sunset, Cloud, ImagePlus, ChevronDown } from 'lucide-react';

export interface LocationNodeData {
  name: string;
  environment: 'INT' | 'EXT' | 'INT/EXT';
  timeOfDay: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK' | 'CONTINUOUS';
  atmosphere: 'calm' | 'tense' | 'chaotic' | 'mysterious' | 'romantic' | 'ominous';
  description?: string;
  referenceImage?: string;
}

const timeIcons: Record<string, React.ReactNode> = {
  DAY: <Sun className="w-4 h-4 text-yellow-400" />,
  NIGHT: <Moon className="w-4 h-4 text-blue-300" />,
  DAWN: <Sunrise className="w-4 h-4 text-orange-400" />,
  DUSK: <Sunset className="w-4 h-4 text-purple-400" />,
  CONTINUOUS: <Cloud className="w-4 h-4 text-gray-400" />
};

const atmosphereStyles: Record<string, { bg: string; text: string; border: string }> = {
  calm: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  tense: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  chaotic: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  mysterious: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  romantic: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  ominous: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' }
};

const environmentColors: Record<string, string> = {
  INT: 'bg-blue-500/20 text-blue-300',
  EXT: 'bg-green-500/20 text-green-300',
  'INT/EXT': 'bg-yellow-500/20 text-yellow-300'
};

export const LocationNode = memo(({ id, data, selected }: NodeProps<LocationNodeData>) => {
  const [isEditing, setIsEditing] = useState(!data.name || data.name === 'New Location');
  const [editName, setEditName] = useState(data.name || '');
  const [showAtmosphereSelect, setShowAtmosphereSelect] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const style = atmosphereStyles[data.atmosphere] || atmosphereStyles.calm;

  // Update node data helper
  const updateNodeData = useCallback((updates: Partial<LocationNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...updates }
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  // Handle name save
  const handleNameSave = () => {
    updateNodeData({ name: editName || 'Unnamed Location' });
    setIsEditing(false);
  };

  // Handle environment cycle
  const cycleEnvironment = () => {
    const envs: LocationNodeData['environment'][] = ['INT', 'EXT', 'INT/EXT'];
    const currentIdx = envs.indexOf(data.environment);
    const nextEnv = envs[(currentIdx + 1) % envs.length];
    updateNodeData({ environment: nextEnv });
  };

  // Handle time of day cycle
  const cycleTimeOfDay = () => {
    const times: LocationNodeData['timeOfDay'][] = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS'];
    const currentIdx = times.indexOf(data.timeOfDay);
    const nextTime = times[(currentIdx + 1) % times.length];
    updateNodeData({ timeOfDay: nextTime });
  };

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      updateNodeData({ referenceImage: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className={`bg-gray-900 rounded-lg border-2 min-w-[260px] max-w-[320px] transition-all ${style.border} ${
        selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-emerald-400 border-2 border-gray-900"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className={`flex items-center gap-2 p-3 border-b border-gray-700 ${style.bg}`}>
        <MapPin className={`w-5 h-5 ${style.text}`} />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="w-full bg-transparent border-b border-gray-500 focus:border-yellow-400 outline-none text-sm font-medium text-gray-200"
              placeholder="Location name..."
              autoFocus
            />
          ) : (
            <p
              className="text-sm font-medium text-gray-200 truncate cursor-pointer hover:text-yellow-300"
              onClick={() => setIsEditing(true)}
            >
              {data.name || 'Unnamed Location'}
            </p>
          )}
        </div>
      </div>

      {/* Reference Image */}
      <div
        className="relative h-24 bg-gray-800 cursor-pointer overflow-hidden"
        onClick={() => fileInputRef.current?.click()}
      >
        {data.referenceImage ? (
          <img
            src={data.referenceImage}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-gray-700/50 transition-colors">
            <ImagePlus className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Add reference image</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3">
        {/* Environment & Time Row */}
        <div className="flex items-center gap-2">
          {/* Environment toggle */}
          <button
            onClick={cycleEnvironment}
            className={`px-2 py-1 rounded text-xs font-medium ${environmentColors[data.environment]} hover:opacity-80 transition-opacity`}
          >
            {data.environment}
          </button>

          {/* Time of day */}
          <button
            onClick={cycleTimeOfDay}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
            title={data.timeOfDay}
          >
            {timeIcons[data.timeOfDay]}
            <span className="text-xs text-gray-300">{data.timeOfDay}</span>
          </button>
        </div>

        {/* Atmosphere selector */}
        <div className="relative">
          <button
            onClick={() => setShowAtmosphereSelect(!showAtmosphereSelect)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${style.border} ${style.bg} transition-colors`}
          >
            <span className={`text-sm capitalize ${style.text}`}>{data.atmosphere}</span>
            <ChevronDown className={`w-4 h-4 ${style.text} transition-transform ${showAtmosphereSelect ? 'rotate-180' : ''}`} />
          </button>

          {showAtmosphereSelect && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {Object.entries(atmosphereStyles).map(([atm, atmStyle]) => (
                <button
                  key={atm}
                  onClick={() => {
                    updateNodeData({ atmosphere: atm as LocationNodeData['atmosphere'] });
                    setShowAtmosphereSelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-gray-700 transition-colors ${
                    data.atmosphere === atm ? `${atmStyle.bg} ${atmStyle.text}` : 'text-gray-300'
                  }`}
                >
                  {atm}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <textarea
          value={data.description || ''}
          onChange={(e) => updateNodeData({ description: e.target.value })}
          placeholder="Describe the location vibe..."
          className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 placeholder-gray-500 resize-none focus:border-yellow-500 focus:outline-none"
          rows={2}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-400 border-2 border-gray-900"
      />
    </div>
  );
});

LocationNode.displayName = 'LocationNode';
