
import React, { useState } from 'react';
import ModeSelector from './ModeSelector';
import BattleOptionsSidebar from './BattleOptionsSidebar';
import CharacterDescriptionSidebar from './CharacterDescriptionSidebar';
import { AudioManager } from '../../game/systems/AudioManager';

interface CharacterSelectProps {
  selectedCharacters: {
    player1: string | null;
    player2: string | null;
  };
  onCharacterSelect: (player: 'player1' | 'player2', character: string) => void;
  onStartBattle: (mode: 'cpu' | 'versus' | 'cpu-cpu') => void;
  mode: 'cpu' | 'versus' | 'cpu-cpu' | null;
  setMode: (mode: 'cpu' | 'versus' | 'cpu-cpu' | null) => void;
  onBack: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

const characters = [
  { id: 'ren', name: 'Ren', image: '/losk/images/characters/Ren.jpg' },
  { id: 'kira', name: 'Kira', image: '/losk/images/characters/Kira.jpg' },
  { id: 'dante', name: 'Dante', image: '/losk/images/characters/Dante.jpg' },
  { id: 'liora', name: 'Liora', image: '/losk/images/characters/Liora.jpg' },
  { id: 'bradley', name: 'Bradley', image: '/losk/images/characters/Bradley.jpg' },
  { id: 'fasa', name: 'King Fasa', image: '/losk/images/characters/Fasa.jpg' },
];

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedCharacters,
  onCharacterSelect,
  onStartBattle,
  mode,
  setMode,
  onBack,
  difficulty,
  onDifficultyChange,
}) => {
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);
  const [isStartingBattle, setIsStartingBattle] = useState(false);
  const canStartBattle = selectedCharacters.player1 && selectedCharacters.player2 && mode;

  const getPlayerType = (player: 'player1' | 'player2') => {
    if (player === 'player1') {
      return mode === 'cpu-cpu' ? 'CPU 1' : 'PLAYER 1';
    }
    return mode === 'versus' ? 'PLAYER 2' : mode === 'cpu-cpu' ? 'CPU 2' : 'CPU';
  };

  const getCharacterBorderClasses = (characterId: string) => {
    const isPlayer1Selected = selectedCharacters.player1 === characterId;
    const isPlayer2Selected = selectedCharacters.player2 === characterId;
    const isHovered = hoveredCharacter === characterId;
    
    let classes = 'border-4 transition-all duration-300 hover:scale-105 ';
    
    if (isPlayer1Selected && isPlayer2Selected) {
      classes += 'border-yellow-400 ring-4 ring-yellow-300 shadow-2xl shadow-yellow-400/50 ';
    } else if (isPlayer1Selected) {
      classes += 'border-yellow-400 ring-4 ring-yellow-300 shadow-2xl shadow-yellow-400/50 ';
    } else if (isPlayer2Selected) {
      if (mode === 'versus') {
        classes += 'border-blue-400 ring-4 ring-blue-300 shadow-2xl shadow-blue-400/50 ';
      } else {
        classes += 'border-red-400 ring-4 ring-red-300 shadow-2xl shadow-red-400/50 ';
      }
    } else {
      classes += 'border-gray-600 ';
    }
    
    if (isHovered && !isPlayer1Selected && !isPlayer2Selected) {
      classes += 'border-yellow-300 ring-2 ring-yellow-200 shadow-xl shadow-yellow-300/30 ';
    }
    
    return classes;
  };

  const handleCharacterClick = (characterId: string) => {
    AudioManager.playSound('character_hover');
    
    // If no characters selected, select for player 1
    if (!selectedCharacters.player1 && !selectedCharacters.player2) {
      onCharacterSelect('player1', characterId);
    }
    // If only player 1 selected, select for player 2
    else if (selectedCharacters.player1 && !selectedCharacters.player2) {
      onCharacterSelect('player2', characterId);
    }
    // If only player 2 selected, select for player 1
    else if (!selectedCharacters.player1 && selectedCharacters.player2) {
      onCharacterSelect('player1', characterId);
    }
    // If both selected, replace player 1 selection
    else {
      onCharacterSelect('player1', characterId);
    }
  };

  const handleModeChange = (newMode: 'cpu' | 'versus' | 'cpu-cpu' | null) => {
    AudioManager.playSound('menu_select');
    setMode(newMode);
  };

  const handleStartBattle = () => {
    if (!canStartBattle) return;
    
    setIsStartingBattle(true);
    AudioManager.playSound('battle_start');
    
    // Small delay for UX feedback
    setTimeout(() => {
      onStartBattle(mode);
    }, 500);
  };

  const handleCharacterHover = (characterId: string) => {
    setHoveredCharacter(characterId);
    AudioManager.playSound('character_hover');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Header */}
      <div className="relative z-10 text-center mb-6 md:mb-10 px-4">
        <h1 className="text-3xl md:text-6xl font-bold text-yellow-400 mb-3 md:mb-6 text-shadow-lg animate-fade-in">
          SELECT FIGHTERS
        </h1>
        
        {/* Mode selector */}
        <ModeSelector mode={mode} setMode={handleModeChange} />

        {/* Instructions with smooth transitions */}
        <div className="h-10 md:h-12 flex items-center justify-center mt-4 md:mt-6">
          {!mode && (
            <p className="text-yellow-300 text-lg md:text-xl animate-pulse">
              First, select a game mode above
            </p>
          )}
          {mode && (!selectedCharacters.player1 || !selectedCharacters.player2) && (
            <p className="text-yellow-300 text-lg md:text-xl animate-fade-in">
              Click characters to select fighters for both sides
            </p>
          )}
          {canStartBattle && (
            <p className="text-green-400 text-lg md:text-xl animate-fade-in font-bold">
              Ready to battle! 🥊
            </p>
          )}
        </div>
      </div>

      {/* Character selection area - only show if mode is selected */}
      {mode && (
        <div className="relative z-10 flex-1 w-full max-w-7xl px-4 md:px-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            {/* Player 1 Info */}
            <div className="flex flex-col items-center lg:w-64 order-1 lg:order-1">
              <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-yellow-300 animate-slide-in-left">
                {getPlayerType('player1')}
              </h2>
              {selectedCharacters.player1 && (
                <div className="text-center animate-scale-in">
                  <div className="text-lg md:text-xl font-bold mb-2 text-yellow-300">✓ SELECTED</div>
                  <div className="text-base md:text-lg text-white">
                    {characters.find(c => c.id === selectedCharacters.player1)?.name}
                  </div>
                </div>
              )}
            </div>

            {/* Central Character Grid */}
            <div className="flex flex-col items-center order-2 lg:order-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10 mb-6 md:mb-8">
                {characters.map((char, index) => {
                  return (
                    <button
                      key={char.id}
                      className={`relative w-32 h-40 md:w-56 md:h-72 rounded-lg overflow-hidden ${getCharacterBorderClasses(char.id)} animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleCharacterClick(char.id)}
                      onMouseEnter={() => handleCharacterHover(char.id)}
                      onMouseLeave={() => setHoveredCharacter(null)}
                      disabled={isStartingBattle}
                    >
                      <img
                        src={char.image}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm md:text-lg font-bold py-2 md:py-3 text-center transition-all duration-300">
                        {char.name}
                      </div>
                      {/* Selection indicators with animations */}
                      {selectedCharacters.player1 === char.id && (
                        <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-yellow-400 text-black text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded animate-scale-in">
                          P1
                        </div>
                      )}
                      {selectedCharacters.player2 === char.id && (
                        <div className={`absolute top-2 md:top-3 right-2 md:right-3 text-black text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded animate-scale-in ${
                          mode === 'versus' ? 'bg-blue-400' : 'bg-red-400'
                        }`}>
                          {mode === 'versus' ? 'P2' : 'CPU'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player 2 Info */}
            <div className="flex flex-col items-center lg:w-64 order-3 lg:order-3">
              <h2 className={`text-xl md:text-3xl font-bold mb-4 md:mb-8 animate-slide-in-right ${
                mode === 'versus' ? 'text-blue-300' : 'text-red-300'
              }`}>
                {getPlayerType('player2')}
              </h2>
              {selectedCharacters.player2 && (
                <div className="text-center animate-scale-in">
                  <div className={`text-lg md:text-xl font-bold mb-2 ${
                    mode === 'versus' ? 'text-blue-300' : 'text-red-300'
                  }`}>✓ SELECTED</div>
                  <div className="text-base md:text-lg text-white">
                    {characters.find(c => c.id === selectedCharacters.player2)?.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Character Description Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <CharacterDescriptionSidebar hoveredCharacter={hoveredCharacter} />
      </div>

      {/* Battle Options Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <BattleOptionsSidebar 
          mode={mode}
          difficulty={difficulty}
          onDifficultyChange={(newDifficulty) => {
            AudioManager.playSound('menu_select');
            onDifficultyChange(newDifficulty);
          }}
        />
      </div>

      {/* Mobile Battle Options */}
      {mode && (
        <div className="lg:hidden relative z-10 w-full px-4 py-4 bg-black bg-opacity-80 border-t border-gray-700 animate-slide-in-up">
          <div className="max-w-md mx-auto">
            <h3 className="text-yellow-400 font-bold text-lg mb-3 text-center">
              BATTLE OPTIONS
            </h3>
            {(mode === 'cpu' || mode === 'cpu-cpu') && (
              <div className="space-y-2">
                <h4 className="font-bold text-yellow-300 text-sm">CPU Difficulty</h4>
                <div className="flex justify-center gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      className={`px-3 py-2 text-sm font-bold rounded transition-all duration-300 hover:scale-105 ${
                        difficulty === level
                          ? 'bg-yellow-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        AudioManager.playSound('menu_select');
                        onDifficultyChange(level as 'easy' | 'medium' | 'hard');
                      }}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full max-w-7xl px-4 md:px-8 pb-6 md:pb-10 space-y-4 md:space-y-0">
        <button
          className="px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          onClick={onBack}
          disabled={isStartingBattle}
        >
          ← BACK
        </button>

        {/* Start Battle Button */}
        {canStartBattle && (
          <button
            className={`px-12 md:px-16 py-4 md:py-6 text-xl md:text-3xl font-bold rounded-lg transition-all duration-300 transform shadow-2xl ${
              isStartingBattle 
                ? 'bg-green-600 text-white animate-pulse scale-110' 
                : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white hover:scale-110 shadow-yellow-600/50 animate-pulse'
            }`}
            onClick={handleStartBattle}
            disabled={isStartingBattle}
          >
            {isStartingBattle ? '⚡ STARTING... ⚡' : '🥊 START BATTLE 🥊'}
          </button>
        )}

        {/* Show what's missing */}
        {!canStartBattle && mode && !isStartingBattle && (
          <div className="text-center animate-fade-in">
            <div className="text-gray-400 text-base md:text-lg">
              {!selectedCharacters.player1 && !selectedCharacters.player2 ? 
                "Select both fighters to continue" :
                !selectedCharacters.player1 ? "Select Player 1 fighter" :
                "Select Player 2 fighter"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelect;
