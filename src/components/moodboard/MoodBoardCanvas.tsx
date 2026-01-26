import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Save,
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ImageNode } from './nodes/ImageNode';
import { TextNode } from './nodes/TextNode';
import { ChapterNode } from './nodes/ChapterNode';
import { CharacterNode } from './nodes/CharacterNode';
import { SceneNode } from './nodes/SceneNode';
import { LocationNode } from './nodes/LocationNode';
import { MoodBoardSidebar } from './MoodBoardSidebar';
import { initialNodes, initialEdges, emptyNodes, emptyEdges } from './initialElements';

// Register custom node types
const nodeTypes = {
  image: ImageNode,
  text: TextNode,
  chapter: ChapterNode,
  character: CharacterNode,
  scene: SceneNode,
  location: LocationNode,
};

// Board data structure
interface BoardData {
  id: string;
  name: string;
  nodes: Node[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'losk_moodboards';

let nodeId = 100;
const generateNodeId = () => `node-${nodeId++}`;

const MoodBoardCanvasInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [boardName, setBoardName] = useState('Untitled Board');
  const [savedBoards, setSavedBoards] = useState<BoardData[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Load saved boards on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const boards = JSON.parse(stored);
        setSavedBoards(boards);
      } catch (e) {
        console.error('Failed to load boards:', e);
      }
    }
  }, []);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: '#fbbf24' }
    }, eds)),
    [setEdges]
  );

  // Drag over handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler - add new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeData) return;

      try {
        const parsedData = JSON.parse(nodeData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: generateNodeId(),
          type: parsedData.type,
          position,
          data: parsedData.data,
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (e) {
        console.error('Failed to parse dropped data:', e);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  // Save current board
  const saveBoard = () => {
    const board: BoardData = {
      id: currentBoardId || `board-${Date.now()}`,
      name: boardName,
      nodes,
      edges,
      createdAt: currentBoardId
        ? savedBoards.find(b => b.id === currentBoardId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBoards = currentBoardId
      ? savedBoards.map(b => b.id === currentBoardId ? board : b)
      : [...savedBoards, board];

    setSavedBoards(updatedBoards);
    setCurrentBoardId(board.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBoards));
    console.log('Board saved:', board.name);
  };

  // Load a board
  const loadBoard = (board: BoardData) => {
    setNodes(board.nodes);
    setEdges(board.edges);
    setBoardName(board.name);
    setCurrentBoardId(board.id);
  };

  // Create new board
  const newBoard = () => {
    setNodes(emptyNodes);
    setEdges(emptyEdges);
    setBoardName('Untitled Board');
    setCurrentBoardId(null);
  };

  // Delete current board
  const deleteBoard = () => {
    if (!currentBoardId) return;
    const updatedBoards = savedBoards.filter(b => b.id !== currentBoardId);
    setSavedBoards(updatedBoards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBoards));
    newBoard();
  };

  // Export board as JSON
  const exportBoard = () => {
    const board: BoardData = {
      id: currentBoardId || `board-${Date.now()}`,
      name: boardName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle image upload from sidebar
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newNode: Node = {
        id: generateNodeId(),
        type: 'image',
        position: { x: 400, y: 200 },
        data: {
          label: file.name.replace(/\.[^/.]+$/, ''),
          src: dataUrl,
          caption: 'Uploaded image',
          tags: ['uploaded']
        }
      };
      setNodes((nds) => nds.concat(newNode));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen flex bg-gray-950">
      {/* Sidebar */}
      <MoodBoardSidebar onUploadImage={handleImageUpload} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-48 bg-gray-800 border-gray-700 text-sm"
              placeholder="Board name"
            />

            {savedBoards.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  {savedBoards.map(board => (
                    <DropdownMenuItem
                      key={board.id}
                      onClick={() => loadBoard(board)}
                      className="text-gray-200 hover:bg-gray-800 cursor-pointer"
                    >
                      {board.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={newBoard}>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button variant="outline" size="sm" onClick={saveBoard}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={exportBoard}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {currentBoardId && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteBoard}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Controls className="bg-gray-900 border-gray-700 text-gray-400" />
            <MiniMap
              zoomable
              pannable
              className="bg-gray-900 border border-gray-700 rounded-lg"
              nodeColor={(n) => {
                switch (n.type) {
                  case 'image': return '#eab308';
                  case 'text': return '#fbbf24';
                  case 'chapter': return '#3b82f6';
                  case 'character': return '#a855f7';
                  case 'scene': return '#22c55e';
                  case 'location': return '#10b981';
                  default: return '#6b7280';
                }
              }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#374151"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider
export const MoodBoardCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <MoodBoardCanvasInner />
    </ReactFlowProvider>
  );
};
