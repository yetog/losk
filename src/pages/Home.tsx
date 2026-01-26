import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { BookOpen, Users, Image, BarChart3 } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems: MenuItem[] = [
    {
      id: 'story',
      label: 'READ STORY',
      description: 'Read the Legend of the Soul King manuscripts',
      icon: <BookOpen className="w-8 h-8" />,
      route: '/story',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'characters',
      label: 'CHARACTERS',
      description: 'Explore character bios, abilities, and artwork',
      icon: <Users className="w-8 h-8" />,
      route: '/characters',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'gallery',
      label: 'GALLERY',
      description: 'Mood boards, storyboards, and visual planning',
      icon: <Image className="w-8 h-8" />,
      route: '/gallery',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      description: 'Analytics, progress tracking, and manuscript analysis',
      icon: <BarChart3 className="w-8 h-8" />,
      route: '/dashboard',
      color: 'from-green-400 to-green-600'
    }
  ];

  useEffect(() => {
    // Animate title entrance
    gsap.fromTo('.app-title',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    );

    // Animate subtitle
    gsap.fromTo('.app-subtitle',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
    );

    // Animate menu items
    gsap.fromTo('.menu-item',
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
    );

    // Animate footer
    gsap.fromTo('.footer-hint',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 1, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case 'ArrowDown':
          setSelectedIndex(prev => (prev + 1) % menuItems.length);
          break;
        case 'Enter':
          navigate(menuItems[selectedIndex].route);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigate, menuItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="app-title text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-4 tracking-wider">
            LOSK
          </h1>
          <div className="h-1 w-48 md:w-64 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-4" />
          <p className="app-subtitle text-gray-400 text-lg md:text-xl tracking-wide">
            CREATIVE STUDIO
          </p>
          <p className="app-subtitle text-gray-500 text-sm mt-2">
            Legend of the Soul King
          </p>
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          {menuItems.map((item, index) => {
            const isSelected = selectedIndex === index;

            return (
              <button
                key={item.id}
                className={`menu-item w-full p-5 rounded-xl border-2 transition-all duration-300 text-left flex items-center gap-4 group ${
                  isSelected
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 shadow-lg shadow-yellow-400/20 scale-[1.02]'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/80'
                }`}
                onClick={() => navigate(item.route)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} ${
                  isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                } transition-opacity`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl md:text-2xl font-bold tracking-wide transition-colors ${
                    isSelected ? 'text-yellow-300' : 'text-gray-200 group-hover:text-white'
                  }`}>
                    {item.label}
                  </h2>
                  <p className={`text-sm transition-colors ${
                    isSelected ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {item.description}
                  </p>
                </div>
                <div className={`w-2 h-12 rounded-full transition-all ${
                  isSelected ? 'bg-yellow-400' : 'bg-gray-700'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="footer-hint text-center text-gray-600 mt-8 text-sm">
          Use Arrow Keys and Enter to navigate
        </p>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-4 right-4 text-gray-600 text-xs">
        v1.0 Creative Studio
      </div>
    </div>
  );
};

export default Home;
