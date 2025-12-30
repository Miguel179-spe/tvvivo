
import React, { useMemo } from 'react';
import { Channel } from '../types';

interface SidebarProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  focusedIndex: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  isOpen,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  focusedIndex,
}) => {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    channels.forEach(ch => cats.add(ch.group));
    return Array.from(cats).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ch.group === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="w-80 h-screen bg-neutral-900 flex flex-col border-r border-neutral-800 transition-all duration-300">
      <div className="p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar canal..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none cursor-pointer"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">🎬 Todos los canales ({channels.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              📺 {cat} ({channels.filter(c => c.group === cat).length})
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 p-2 space-y-1">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-sm">No se encontraron canales</div>
        ) : (
          filteredChannels.map((channel, index) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                selectedChannel?.id === channel.id 
                ? 'bg-blue-600/20 border border-blue-500/30' 
                : 'hover:bg-neutral-800 border border-transparent'
              } ${focusedIndex === index ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="w-12 h-12 bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-neutral-700">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <span className="text-xs font-bold text-neutral-500">{channel.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-width-0 overflow-hidden">
                <div className="text-sm font-medium truncate">{channel.name}</div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  EN VIVO • {channel.group}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
