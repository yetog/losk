import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { BookOpen, ExternalLink, ChevronDown } from 'lucide-react';
import { storyVolumes } from '@/game/data/storyContent';

export interface ChapterNodeData {
  chapterId: string;
  title: string;
  volumeId: number;
  chapterNumber: number;
  summary?: string;
  wordCount?: number;
}

// Build flat list of all chapters for selector
const allChapters = storyVolumes.flatMap(volume =>
  volume.chapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    volumeId: volume.id,
    chapterNumber: chapter.chapterNumber,
    wordCount: chapter.wordCount || 0
  }))
);

export const ChapterNode = memo(({ id, data, selected }: NodeProps<ChapterNodeData>) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const hasChapter = data.chapterId && data.chapterId !== '';

  // Update node data
  const updateNodeData = useCallback((chapter: typeof allChapters[0]) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              chapterId: chapter.id,
              title: chapter.title,
              volumeId: chapter.volumeId,
              chapterNumber: chapter.chapterNumber,
              wordCount: chapter.wordCount
            }
          };
        }
        return node;
      })
    );
    setIsSelectOpen(false);
  }, [id, setNodes]);

  return (
    <div
      className={`bg-gray-900 rounded-lg border-2 min-w-[240px] transition-all ${
        selected
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
          : 'border-blue-500/50 hover:border-blue-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-gray-900"
      />

      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-blue-500/10">
        <BookOpen className="w-5 h-5 text-blue-400" />
        <div className="flex-1 min-w-0">
          {hasChapter ? (
            <>
              <p className="text-xs text-blue-400">
                Volume {data.volumeId} - Chapter {data.chapterNumber}
              </p>
              <p className="text-sm font-medium text-gray-200 truncate">
                {data.title}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-gray-400">
              Select a chapter...
            </p>
          )}
        </div>
      </div>

      {/* Chapter Selector or Content */}
      <div className="p-3 space-y-2">
        {/* Dropdown trigger */}
        <button
          onClick={() => setIsSelectOpen(!isSelectOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <span>{hasChapter ? 'Change Chapter' : 'Choose Chapter'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown list */}
        {isSelectOpen && (
          <div className="max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg">
            {storyVolumes.map(volume => (
              <div key={volume.id}>
                <div className="px-3 py-1.5 bg-gray-750 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0">
                  Volume {volume.id}
                </div>
                {volume.chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    onClick={() => updateNodeData({
                      id: chapter.id,
                      title: chapter.title,
                      volumeId: volume.id,
                      chapterNumber: chapter.chapterNumber,
                      wordCount: chapter.wordCount || 0
                    })}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${
                      data.chapterId === chapter.id ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300'
                    }`}
                  >
                    <p className="text-sm truncate">
                      Ch. {chapter.chapterNumber}: {chapter.title}
                    </p>
                    {chapter.wordCount && (
                      <p className="text-xs text-gray-500">
                        {chapter.wordCount.toLocaleString()} words
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Show details when chapter selected */}
        {hasChapter && !isSelectOpen && (
          <>
            {data.summary && (
              <p className="text-xs text-gray-400 line-clamp-3">
                {data.summary}
              </p>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              {data.wordCount && (
                <span className="text-gray-500">
                  {data.wordCount.toLocaleString()} words
                </span>
              )}
              <a
                href={`/story?volume=${data.volumeId}&chapter=${data.chapterId}`}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Read</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-gray-900"
      />
    </div>
  );
});

ChapterNode.displayName = 'ChapterNode';
