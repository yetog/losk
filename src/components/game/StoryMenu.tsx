import { useState, useEffect } from 'react';
import { storyVolumes } from '@/game/data/storyContent';
import { Lock, Book } from 'lucide-react';
import gsap from 'gsap';

interface StoryMenuProps {
  onVolumeSelect: (volumeId: number) => void;
  onBack: () => void;
}

const StoryMenu = ({ onVolumeSelect, onBack }: StoryMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectableVolumes = storyVolumes.filter(v => !v.isLocked);

  useEffect(() => {
    // Animate title entrance
    gsap.from('.story-title', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Animate volume cards
    gsap.from('.volume-card', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(selectableVolumes.length, prev + 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex === selectableVolumes.length) {
          onBack();
        } else {
          const volume = selectableVolumes[selectedIndex];
          if (!volume.isLocked) {
            onVolumeSelect(volume.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onVolumeSelect, onBack, selectableVolumes]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8 overflow-y-auto">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl max-h-[85vh] overflow-y-auto">
        {/* Title */}
        <h1 className="story-title text-4xl md:text-6xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text sticky top-0 bg-black/80 backdrop-blur-sm py-4 z-20">
          STORY SO FAR
        </h1>

        {/* Volume Grid - Scrollable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 px-4">
          {storyVolumes.map((volume, index) => {
            const isSelected = index === selectedIndex;
            
            return (
              <button
                key={volume.id}
                className={`volume-card relative p-6 md:p-8 rounded-xl border-2 transition-all duration-300 transform ${
                  volume.isLocked
                    ? 'bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-yellow-500/20 border-yellow-400 scale-105 shadow-lg shadow-yellow-400/50'
                    : 'bg-gray-800/80 border-gray-600 hover:border-yellow-400 hover:bg-gray-700/80'
                }`}
                onClick={() => !volume.isLocked && onVolumeSelect(volume.id)}
                disabled={volume.isLocked}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Book className={`w-8 h-8 ${volume.isLocked ? 'text-gray-500' : 'text-yellow-400'}`} />
                    <h2 className={`text-2xl md:text-3xl font-bold ${
                      volume.isLocked ? 'text-gray-400' : 'text-yellow-300'
                    }`}>
                      {volume.title}
                    </h2>
                  </div>
                  {volume.isLocked && (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                <p className={`text-lg mb-4 ${
                  volume.isLocked ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {volume.description}
                </p>

                {!volume.isLocked && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="text-sm font-medium">
                      {volume.chapters.length} Chapters
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            className={`volume-card px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300 transform ${
              selectedIndex === selectableVolumes.length
                ? 'bg-yellow-500 text-black scale-105'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            onClick={onBack}
          >
            BACK TO MENU
          </button>
        </div>

        {/* Navigation hint */}
        <p className="text-center text-gray-400 mt-8 text-sm md:text-base">
          Use Arrow Keys and Enter to navigate
        </p>
      </div>
    </div>
  );
};

export default StoryMenu;
