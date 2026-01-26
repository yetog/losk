import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Swords, Zap, Target, Heart, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { characterData, Character, getAllCharacterIds } from '@/game/data/characterData';
import { useAIContext } from '@/context/AIContext';
import gsap from 'gsap';

const Characters = () => {
  const navigate = useNavigate();
  const { setPageContext, setStructuredContext } = useAIContext();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [imageOffset, setImageOffset] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const characterIds = getAllCharacterIds();

  // Reset image offset when character changes
  useEffect(() => {
    if (selectedCharacter) {
      // Try to parse initial position from character data
      const char = characterData[selectedCharacter];
      if (char.imagePosition) {
        // Parse "center 15%" or similar formats
        const parts = char.imagePosition.split(' ');
        let x = 50, y = 50;
        parts.forEach(part => {
          if (part === 'center') x = 50;
          else if (part === 'left') x = 0;
          else if (part === 'right') x = 100;
          else if (part === 'top') y = 0;
          else if (part === 'bottom') y = 100;
          else if (part.includes('%')) {
            const val = parseInt(part);
            // If it's a single percentage, assume it's vertical
            if (parts.length === 1 || parts.indexOf(part) === 1) y = val;
            else x = val;
          }
        });
        setImageOffset({ x, y });
      } else {
        setImageOffset({ x: 50, y: 30 });
      }
    }
  }, [selectedCharacter]);

  const adjustImage = (dx: number, dy: number) => {
    setImageOffset(prev => ({
      x: Math.max(0, Math.min(100, prev.x + dx)),
      y: Math.max(0, Math.min(100, prev.y + dy))
    }));
  };

  const resetImagePosition = () => {
    setImageOffset({ x: 50, y: 30 });
  };

  useEffect(() => {
    gsap.fromTo('.character-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (selectedCharacter) {
      gsap.fromTo('.character-detail',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [selectedCharacter]);

  // Update AI context when character is selected
  useEffect(() => {
    if (selectedCharacter) {
      const char = characterData[selectedCharacter];
      if (char) {
        setPageContext('characters', `Viewing character: ${char.name}`);
        setStructuredContext('character', {
          name: char.name,
          species: char.species,
          role: char.style,
          abilities: char.specialMoves.map(m => m.name),
          stats: char.stats,
          bio: `${char.name} is a ${char.species} fighter with ${char.style.toLowerCase()}.`
        });
      }
    } else {
      setPageContext('characters', 'Browsing character encyclopedia');
    }
  }, [selectedCharacter, setPageContext, setStructuredContext]);

  const selected = selectedCharacter ? characterData[selectedCharacter] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-yellow-300">Characters</h1>
              <p className="text-sm text-gray-400">Explore the heroes and villains of LOSK</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characterIds.map(id => {
                const char = characterData[id];
                const isSelected = selectedCharacter === id;

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCharacter(id)}
                    className={`character-card relative rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                      isSelected
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {/* Character Image */}
                    <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                      <img
                        src={char.portrait}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ objectPosition: char.imagePosition || 'center 20%' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x400/1f2937/fbbf24?text=${char.name}`;
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      {/* Character info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{char.icon}</span>
                          <h3 className="text-lg font-bold text-white">{char.name}</h3>
                        </div>
                        <p className="text-sm text-gray-300">{char.species}</p>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Detail Panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="character-detail bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden sticky top-24">
                {/* Header with portrait */}
                <div
                  className="h-48 bg-cover relative group"
                  style={{
                    backgroundImage: `url(${selected.portrait})`,
                    backgroundPosition: `${imageOffset.x}% ${imageOffset.y}%`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                  {/* Image Position Controls - visible on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/70 rounded-lg p-1 backdrop-blur-sm">
                      <div className="grid grid-cols-3 gap-0.5">
                        <div />
                        <button
                          onClick={() => adjustImage(0, -10)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <div />
                        <button
                          onClick={() => adjustImage(-10, 0)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Move left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={resetImagePosition}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Reset position"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => adjustImage(10, 0)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Move right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div />
                        <button
                          onClick={() => adjustImage(0, 10)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <div />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selected.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                        <p className="text-yellow-400">{selected.species}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Swords className="w-5 h-5 text-red-400" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Power</span>
                              <span className="text-white font-medium">{selected.stats.power}/10</span>
                            </div>
                            <Progress value={selected.stats.power * 10} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Speed</span>
                              <span className="text-white font-medium">{selected.stats.speed}/10</span>
                            </div>
                            <Progress value={selected.stats.speed * 10} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Technique</span>
                              <span className="text-white font-medium">{selected.stats.technique}/10</span>
                            </div>
                            <Progress value={selected.stats.technique * 10} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-green-400" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Health</span>
                              <span className="text-white font-medium">{selected.health}</span>
                            </div>
                            <Progress value={(selected.health / 120) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fighting Style */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Fighting Style</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{selected.style}</p>
                    </div>

                    {/* Special Moves */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Abilities</h3>
                      <div className="space-y-3">
                        {selected.specialMoves.map((move, index) => (
                          <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                            <h4 className="font-semibold text-yellow-300 mb-1">{move.name}</h4>
                            <p className="text-sm text-gray-400">{move.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>DMG: {move.damage}</span>
                              <span>Startup: {move.startup}f</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Theme */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme Colors</h3>
                      <div className="flex gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border border-gray-600"
                          style={{ backgroundColor: selected.colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-12 h-12 rounded-lg border border-gray-600"
                          style={{ backgroundColor: selected.colors.secondary }}
                          title="Secondary"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-400">Select a character to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Characters;
