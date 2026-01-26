
import React from 'react';

interface Character {
  id: string;
  name: string;
  image: string;
}

interface CharacterGridProps {
  characters: Character[];
  selectedCharacter: string | null;
  onCharacterSelect: (characterId: string) => void;
  theme: string;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  selectedCharacter,
  onCharacterSelect,
  theme,
}) => {
  const getThemeClasses = (theme: string, isSelected: boolean) => {
    if (theme === 'yellow') {
      return isSelected 
        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 ring-2 ring-yellow-300'
        : 'border-gray-600 hover:border-yellow-600';
    }
    if (theme === 'blue') {
      return isSelected
        ? 'border-blue-400 shadow-lg shadow-blue-400/50 ring-2 ring-blue-300'
        : 'border-gray-600 hover:border-blue-600';
    }
    if (theme === 'red') {
      return isSelected
        ? 'border-red-400 shadow-lg shadow-red-400/50 ring-2 ring-red-300'
        : 'border-gray-600 hover:border-red-600';
    }
    return 'border-gray-600';
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      {characters.map((char) => {
        const isSelected = selectedCharacter === char.id;
        return (
          <button
            key={char.id}
            className={`relative w-40 h-52 rounded-lg overflow-hidden border-4 transition-all hover:scale-105 ${getThemeClasses(theme, isSelected)}`}
            onClick={() => onCharacterSelect(char.id)}
          >
            <img
              src={char.image}
              alt={char.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm font-bold py-2 text-center">
              {char.name}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CharacterGrid;
