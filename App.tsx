
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Channel } from './types';
import { fetchAndParsePlaylist } from './services/playlistService';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  // Load Playlist
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchAndParsePlaylist();
      setChannels(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ch.group === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);

  const handleNext = useCallback(() => {
    if (filteredChannels.length === 0) return;
    const currentIndex = selectedChannel ? filteredChannels.findIndex(c => c.id === selectedChannel.id) : -1;
    const nextIndex = (currentIndex + 1) % filteredChannels.length;
    setSelectedChannel(filteredChannels[nextIndex]);
  }, [filteredChannels, selectedChannel]);

  const handlePrev = useCallback(() => {
    if (filteredChannels.length === 0) return;
    const currentIndex = selectedChannel ? filteredChannels.findIndex(c => c.id === selectedChannel.id) : -1;
    const prevIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
    setSelectedChannel(filteredChannels[prevIndex]);
  }, [filteredChannels, selectedChannel]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Basic Navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filteredChannels.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && filteredChannels[focusedIndex]) {
        setSelectedChannel(filteredChannels[focusedIndex]);
      }
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'Escape') {
      setSidebarOpen(prev => !prev);
    }
  }, [filteredChannels, focusedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-black">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-400 font-medium">Cargando canales...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        isOpen={sidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        focusedIndex={focusedIndex}
      />

      <div className="flex-1 flex flex-col relative h-full">
        <VideoPlayer 
          channel={selectedChannel} 
          onNext={handleNext}
          onPrev={handlePrev}
          toggleFullscreen={toggleFullscreen}
        />
        
        {/* Toggle Sidebar Button for Mobile/Touch */}
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 p-3 bg-neutral-900/80 border border-neutral-800 rounded-full hover:bg-blue-600 transition z-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
