import { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ImagePlus, Maximize2, RefreshCw, X } from 'lucide-react';

export interface ImageNodeData {
  label: string;
  src: string;
  caption?: string;
  tags?: string[];
  width?: number;
  height?: number;
}

export const ImageNode = memo(({ id, data, selected }: NodeProps<ImageNodeData>) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const hasImage = data.src && !imageError;

  // Update node data helper
  const updateNodeData = useCallback((updates: Partial<ImageNodeData>) => {
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

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateNodeData({
        src: dataUrl,
        label: data.label === 'New Image' ? file.name.replace(/\.[^/.]+$/, '') : data.label,
        caption: data.caption || 'Uploaded image'
      });
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  // Click to upload
  const handleClick = () => {
    if (!hasImage) {
      fileInputRef.current?.click();
    }
  };

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Replace image
  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`bg-gray-900 rounded-lg border-2 overflow-hidden transition-all ${
        selected
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
          : isDragOver
            ? 'border-yellow-500 bg-yellow-500/10'
            : 'border-gray-700 hover:border-gray-500'
      }`}
      style={{
        width: data.width || 200,
        minHeight: 150
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-400 border-2 border-gray-900"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image or Upload Placeholder */}
      <div
        className={`relative aspect-[4/3] bg-gray-800 overflow-hidden ${!hasImage ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {hasImage ? (
          <>
            <img
              src={data.src}
              alt={data.label}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />

            {/* Hover overlay with actions */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                <button
                  onClick={handleReplace}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Replace image"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Upload placeholder */
          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${
            isDragOver ? 'bg-yellow-500/20' : 'hover:bg-gray-700/50'
          }`}>
            <ImagePlus className={`w-8 h-8 ${isDragOver ? 'text-yellow-400' : 'text-gray-500'}`} />
            <span className={`text-xs ${isDragOver ? 'text-yellow-300' : 'text-gray-500'}`}>
              {isDragOver ? 'Drop image here' : 'Click or drag to add'}
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="p-2">
        <p className="text-sm font-medium text-gray-200 truncate">{data.label}</p>
        {data.caption && (
          <p className="text-xs text-gray-400 truncate mt-1">{data.caption}</p>
        )}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 border-2 border-gray-900"
      />
    </div>
  );
});

ImageNode.displayName = 'ImageNode';
