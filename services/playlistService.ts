
import { Channel } from '../types';

export const PLAYLIST_URLS = [
    "https://raw.githubusercontent.com/Miguel179-spe/tvlion/refs/heads/peliculas/LiveTV.m3u"
];

export async function fetchAndParsePlaylist(): Promise<Channel[]> {
    for (const url of PLAYLIST_URLS) {
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) continue;
            
            const text = await response.text();
            if (!text.includes('#EXTINF')) continue;
            
            return parseM3U(text);
        } catch (error) {
            console.error(`Error fetching playlist from ${url}:`, error);
        }
    }
    return [];
}

function parseM3U(text: string): Channel[] {
    const lines = text.split('\n');
    const channels: Channel[] = [];
    let currentGroup = 'General';
    let currentName = '';
    let currentLogo = '';
    let channelId = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#EXTINF:')) {
            const groupMatch = trimmed.match(/group-title="([^"]+)"/i);
            const nameMatch = trimmed.match(/,(.+)$/);
            const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/i);
            
            if (groupMatch) currentGroup = groupMatch[1];
            if (nameMatch) currentName = nameMatch[1].trim();
            if (logoMatch) currentLogo = logoMatch[1];
        } else if (trimmed.startsWith('http')) {
            channels.push({
                id: channelId++,
                name: currentName || `Channel ${channelId}`,
                group: currentGroup || 'General',
                url: trimmed,
                logo: currentLogo,
            });
            // Reset for next entry
            currentName = '';
            currentLogo = '';
            currentGroup = 'General';
        }
    }

    return channels.sort((a, b) => 
        a.group.localeCompare(b.group) || a.name.localeCompare(b.name)
    );
}
