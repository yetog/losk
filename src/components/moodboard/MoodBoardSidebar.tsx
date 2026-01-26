import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Image,
  StickyNote,
  BookOpen,
  User,
  Film,
  Search,
  Folder,
  MapPin
} from 'lucide-react';
import {
  artworkCatalog,
  getArtworkByCategory,
  searchArtwork,
  type ArtworkCategory
} from '@/game/data/artworkData';
import { storyVolumes } from '@/game/data/storyContent';
import { characterData, getAllCharacterIds } from '@/game/data/characterData';

interface MoodBoardSidebarProps {
  onUploadImage?: (file: File) => void;
}

const nodeTemplates = [
  {
    type: 'image',
    label: 'Image',
    description: 'Add an image or reference',
    icon: <Image className="w-5 h-5" />,
    color: 'text-yellow-400',
    data: {
      label: 'New Image',
      src: '',
      caption: '',
      tags: []
    }
  },
  {
    type: 'text',
    label: 'Note',
    description: 'Add a text note',
    icon: <StickyNote className="w-5 h-5" />,
    color: 'text-yellow-400',
    data: {
      label: 'Note',
      content: 'Your notes here...',
      color: 'yellow'
    }
  },
  {
    type: 'chapter',
    label: 'Chapter',
    description: 'Link to a story chapter',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-blue-400',
    data: {
      chapterId: '',
      title: 'Chapter',
      volumeId: 1,
      chapterNumber: 1
    }
  },
  {
    type: 'character',
    label: 'Character',
    description: 'Add a character card',
    icon: <User className="w-5 h-5" />,
    color: 'text-purple-400',
    data: {
      characterId: '',
      name: 'Character',
      portrait: '',
      role: 'supporting'
    }
  },
  {
    type: 'scene',
    label: 'Scene',
    description: 'Plot point or scene marker',
    icon: <Film className="w-5 h-5" />,
    color: 'text-green-400',
    data: {
      sceneId: '',
      title: 'Scene',
      location: '',
      mood: 'dramatic'
    }
  },
  {
    type: 'location',
    label: 'Location',
    description: 'Environment with mood and vibe',
    icon: <MapPin className="w-5 h-5" />,
    color: 'text-emerald-400',
    data: {
      name: 'New Location',
      environment: 'INT',
      timeOfDay: 'DAY',
      atmosphere: 'calm',
      description: ''
    }
  }
];

const categories: { key: ArtworkCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'character', label: 'Characters' },
  { key: 'location', label: 'Locations' },
  { key: 'reference', label: 'References' }
];

export const MoodBoardSidebar: React.FC<MoodBoardSidebarProps> = ({ onUploadImage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory | 'all'>('all');

  // Filter artwork based on search and category
  const filteredArtwork = useMemo(() => {
    let results = selectedCategory === 'all'
      ? artworkCatalog
      : getArtworkByCategory(selectedCategory);

    if (searchQuery.trim()) {
      const searched = searchArtwork(searchQuery);
      results = results.filter(item => searched.some(s => s.id === item.id));
    }

    return results.slice(0, 50); // Limit for performance
  }, [searchQuery, selectedCategory]);

  // Drag handlers
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: nodeData
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onArtworkDragStart = (event: React.DragEvent, artwork: typeof artworkCatalog[0]) => {
    const nodeData = {
      label: artwork.filename.replace(/\.[^/.]+$/, ''), // Remove extension
      src: `file://${artwork.path}`,
      caption: artwork.character || artwork.category,
      tags: artwork.tags
    };
    onDragStart(event, 'image', nodeData);
  };

  // Handle file upload
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
    event.target.value = ''; // Reset for next upload
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <Tabs defaultValue="artwork" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
        </TabsList>

        {/* Artwork Tab */}
        <TabsContent value="artwork" className="flex-1 flex flex-col m-0 p-0">
          {/* Search */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search artwork..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map(cat => (
                <Badge
                  key={cat.key}
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-yellow-500 text-black'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Artwork grid */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-2">
                {filteredArtwork.length} images • Drag to canvas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredArtwork.map(artwork => (
                  <div
                    key={artwork.id}
                    draggable
                    onDragStart={(e) => onArtworkDragStart(e, artwork)}
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-colors">
                      <img
                        src={`file://${artwork.path}`}
                        alt={artwork.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><rect width="24" height="24" fill="%23333"/><text x="12" y="16" text-anchor="middle" font-size="8">?</text></svg>';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {artwork.filename}
                    </p>
                  </div>
                ))}
              </div>

              {/* Upload button */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <label className="block">
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-yellow-500/50 cursor-pointer transition-colors">
                    <Image className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <p className="text-xs text-gray-500">
                Drag nodes to the canvas
              </p>

              {/* Node templates */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Node Types
                </h3>
                {nodeTemplates.map((template, index) => (
                  <Card
                    key={index}
                    draggable
                    onDragStart={(e) => onDragStart(e, template.type, template.data)}
                    className="cursor-grab active:cursor-grabbing bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={template.color}>{template.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200">
                            {template.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick add characters */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Characters
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {getAllCharacterIds().map(id => {
                    const char = characterData[id];
                    return (
                      <Card
                        key={id}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'character', {
                          characterId: id,
                          name: char.name,
                          portrait: char.portrait,
                          role: 'supporting',
                          species: char.species,
                          icon: char.icon
                        })}
                        className="cursor-grab active:cursor-grabbing bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors"
                      >
                        <CardContent className="p-2 flex items-center gap-2">
                          <span className="text-lg">{char.icon}</span>
                          <span className="text-xs text-gray-300 truncate">{char.name}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Quick add chapters */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Chapters
                </h3>
                {storyVolumes.slice(0, 1).map(volume => (
                  <div key={volume.id} className="space-y-1">
                    <p className="text-xs text-gray-500">Volume {volume.id}</p>
                    {volume.chapters.slice(0, 3).map(chapter => (
                      <Card
                        key={chapter.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'chapter', {
                          chapterId: chapter.id,
                          title: chapter.title,
                          volumeId: chapter.volumeId,
                          chapterNumber: chapter.chapterNumber,
                          wordCount: chapter.wordCount
                        })}
                        className="cursor-grab active:cursor-grabbing bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors"
                      >
                        <CardContent className="p-2">
                          <p className="text-xs text-gray-300 truncate">
                            Ch. {chapter.chapterNumber}: {chapter.title}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-xs text-yellow-300">
                  <strong>Tip:</strong> Connect nodes by dragging from one handle to another
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
