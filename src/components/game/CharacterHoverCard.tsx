
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { characterData } from '../../game/data/characterData';

interface CharacterHoverCardProps {
  characterId: string;
  children: React.ReactNode;
}

const CharacterHoverCard: React.FC<CharacterHoverCardProps> = ({ characterId, children }) => {
  const character = characterData[characterId];
  
  if (!character) return <>{children}</>;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-900 border-gray-700 text-white p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{character.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-yellow-400">{character.name}</h3>
              <p className="text-sm text-gray-300">{character.species}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-yellow-300">STATS</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Power</span>
                <div className="flex">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 mx-0.5 ${
                        i < character.stats.power ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Speed</span>
                <div className="flex">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 mx-0.5 ${
                        i < character.stats.speed ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Technique</span>
                <div className="flex">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 mx-0.5 ${
                        i < character.stats.technique ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-yellow-300 mb-1">FIGHTING STYLE</h4>
            <p className="text-sm text-gray-200">{character.style}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CharacterHoverCard;
