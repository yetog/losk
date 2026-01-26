
import React from 'react';
import { characterData } from '../../game/data/characterData';

interface CharacterDescriptionSidebarProps {
  hoveredCharacter: string | null;
}

const CharacterDescriptionSidebar: React.FC<CharacterDescriptionSidebarProps> = ({
  hoveredCharacter
}) => {
  const character = hoveredCharacter ? characterData[hoveredCharacter] : null;

  return (
    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-80 bg-black bg-opacity-80 rounded-lg p-6 border border-gray-700">
      <h3 className="text-yellow-400 font-bold text-lg mb-4 text-center">
        CHARACTER INFO
      </h3>
      
      {character ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{character.icon}</span>
            <div>
              <h4 className="text-xl font-bold text-yellow-400">{character.name}</h4>
              <p className="text-sm text-gray-300">{character.species}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-bold text-yellow-300">STATS</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Power</span>
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Speed</span>
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Technique</span>
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
            <h5 className="font-bold text-yellow-300 mb-2">FIGHTING STYLE</h5>
            <p className="text-sm text-gray-200 leading-relaxed">{character.style}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">🔍</p>
          <p>Hover over a character to see their details</p>
        </div>
      )}
    </div>
  );
};

export default CharacterDescriptionSidebar;
