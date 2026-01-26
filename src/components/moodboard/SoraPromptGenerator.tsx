import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Copy,
  Download,
  Clock,
  Users,
  MapPin,
  Star,
  Filter,
  Check,
  Edit3,
  ChevronRight
} from 'lucide-react';
import {
  fightScenes,
  getFightScenesByVolume,
  getFightScenesByTier,
  getTopFightScenes,
  getTotalFightDuration,
  type FightScene
} from '@/game/data/fightSceneData';

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Marquee', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
  2: { label: 'Showcase', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
  3: { label: 'World-Building', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
  4: { label: 'Supporting', color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' }
};

interface FightSceneCardProps {
  scene: FightScene;
  onGeneratePrompt: () => void;
}

const FightSceneCard: React.FC<FightSceneCardProps> = ({ scene, onGeneratePrompt }) => {
  const tier = tierLabels[scene.priorityTier];

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-200 truncate">{scene.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Volume {scene.volumeId} • {scene.chapter} • Scene {scene.sceneNumber}
            </p>
          </div>
          <Badge className={`flex-shrink-0 border ${tier.color}`}>
            {tier.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{scene.durationStr}</span>
            <span className="text-gray-600">({scene.durationSeconds}s)</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{scene.location || 'Unknown'}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4 mt-0.5" />
            <span className="line-clamp-2">
              {scene.characters.join(', ') || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={onGeneratePrompt}
          className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Sora Prompt
        </Button>
      </div>
    </div>
  );
};

export const SoraPromptGenerator: React.FC = () => {
  const [filterVolume, setFilterVolume] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedScene, setSelectedScene] = useState<FightScene | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const totalDuration = getTotalFightDuration();

  // Filter fight scenes
  const filteredScenes = useMemo(() => {
    let scenes = [...fightScenes];

    if (filterVolume !== 'all') {
      scenes = getFightScenesByVolume(parseInt(filterVolume));
    }

    if (filterTier !== 'all') {
      const tierNum = parseInt(filterTier) as 1 | 2 | 3 | 4;
      scenes = scenes.filter(s => s.priorityTier === tierNum);
    }

    return scenes;
  }, [filterVolume, filterTier]);

  // Handle prompt generation
  const handleGeneratePrompt = (scene: FightScene) => {
    setSelectedScene(scene);
    setEditedPrompt(scene.promptTemplate);
    setCopied(false);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as markdown
  const handleExport = () => {
    if (!selectedScene) return;

    const content = `# Sora Prompt: ${selectedScene.title}

## Scene Info
- **Volume:** ${selectedScene.volumeId}
- **Chapter:** ${selectedScene.chapter}
- **Scene:** ${selectedScene.sceneNumber}
- **Duration:** ${selectedScene.durationStr}
- **Location:** ${selectedScene.location}
- **Characters:** ${selectedScene.characters.join(', ')}
- **Priority:** Tier ${selectedScene.priorityTier} (${tierLabels[selectedScene.priorityTier].label})

## Generated Prompt

\`\`\`
${editedPrompt}
\`\`\`

---
Generated by LOSK Creative Studio
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sora-prompt-${selectedScene.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export all prompts
  const handleExportAll = () => {
    const content = filteredScenes.map(scene => `# ${scene.title}

**Scene Info:** V${scene.volumeId} ${scene.chapter} S${scene.sceneNumber} | ${scene.durationStr} | ${tierLabels[scene.priorityTier].label}
**Location:** ${scene.location}
**Characters:** ${scene.characters.join(', ')}

## Prompt Template

\`\`\`
${scene.promptTemplate}
\`\`\`

---
`).join('\n\n');

    const blob = new Blob([`# LOSK Sora Prompts\n\nGenerated: ${new Date().toISOString()}\nTotal Scenes: ${filteredScenes.length}\n\n---\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `losk-sora-prompts-all.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-200">Sora AI Prompts</h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="outline">{fightScenes.length} fight scenes</Badge>
              <Badge variant="outline">{totalDuration.formatted} total</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume Filter */}
            <Select value={filterVolume} onValueChange={setFilterVolume}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Volume" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Volumes</SelectItem>
                <SelectItem value="1">Volume 1</SelectItem>
                <SelectItem value="2">Volume 2</SelectItem>
                <SelectItem value="3">Volume 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Tier Filter */}
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Tier 1: Marquee</SelectItem>
                <SelectItem value="2">Tier 2: Showcase</SelectItem>
                <SelectItem value="3">Tier 3: World-Building</SelectItem>
                <SelectItem value="4">Tier 4: Supporting</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Top Scenes Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-medium text-yellow-300">Top Priority Scenes</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              These marquee fights have the highest marketing value for Sora AI video generation.
            </p>
            <div className="flex flex-wrap gap-2">
              {getTopFightScenes(5).map(scene => (
                <Badge
                  key={scene.id}
                  className="cursor-pointer bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30"
                  onClick={() => handleGeneratePrompt(scene)}
                >
                  {scene.title}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Scene Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenes.map(scene => (
              <FightSceneCard
                key={scene.id}
                scene={scene}
                onGeneratePrompt={() => handleGeneratePrompt(scene)}
              />
            ))}
          </div>

          {filteredScenes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No fight scenes match the selected filters
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Prompt Dialog */}
      <Dialog open={!!selectedScene} onOpenChange={() => setSelectedScene(null)}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-300">
              <Sparkles className="w-5 h-5" />
              Sora Prompt: {selectedScene?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Scene Info */}
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">Volume {selectedScene?.volumeId}</Badge>
              <Badge variant="outline">{selectedScene?.chapter}</Badge>
              <Badge variant="outline">{selectedScene?.durationStr}</Badge>
              <Badge className={selectedScene ? tierLabels[selectedScene.priorityTier].color : ''}>
                {selectedScene && tierLabels[selectedScene.priorityTier].label}
              </Badge>
            </div>

            {/* Editable Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Generated Prompt
                </label>
                <Edit3 className="w-4 h-4 text-gray-500" />
              </div>
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[300px] bg-gray-800 border-gray-700 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedScene(null)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCopy} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
