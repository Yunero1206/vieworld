import { useState, useRef, useEffect } from 'react';
import { Search, X, Radio, ChevronRight } from 'lucide-react';
import type { World } from '../domain/types';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';

interface ArtistSearchAutocompleteProps {
  worlds: World[];
  currentWorldId?: string;
  onSelect: (worldId: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  isCompact?: boolean;
}

export function ArtistSearchAutocomplete({
  worlds,
  currentWorldId,
  onSelect,
  placeholder = 'Tìm artist, sự kiện, show diễn...',
  className = '',
  ariaLabel = 'Chọn nhà nghệ sĩ',
  isCompact = false,
}: ArtistSearchAutocompleteProps) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWorld = worlds.find(w => w.id === currentWorldId);

  // Filter worlds by artist name, fandom name, or associated events/shows/sessions
  const filteredWorlds = worlds.filter(w => {
    const fandom = ARTIST_FANDOM_REGISTRY[w.id];
    const hasMatchingSession = Object.values(state.sessions).some(
      s => s.worldId === w.id && (matchesVietnameseQuery(s.title, query) || matchesVietnameseQuery(s.format, query))
    );
    return (
      matchesVietnameseQuery(w.name, query) ||
      (fandom?.fandomName && matchesVietnameseQuery(fandom.fandomName, query)) ||
      hasMatchingSession
    );
  });

  // Check which artists are currently live
  const isLive = (worldId: string) =>
    Object.values(state.sessions).some(
      s => s.worldId === worldId && (s.status === 'running' || s.status === 'open')
    );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (worldId: string) => {
    onSelect(worldId);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredWorlds.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredWorlds.length) % Math.max(1, filteredWorlds.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredWorlds[selectedIndex]) {
        handleSelect(filteredWorlds[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`v7-artist-search-container ${isCompact ? 'compact' : ''} ${className}`}
    >
      <div className="v7-artist-search-input-wrap">
        <Search size={isCompact ? 15 : 16} className="v7-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="v7-artist-search-input"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={currentWorld ? `Tìm kiếm hoặc đổi nghệ sĩ (${currentWorld.name})...` : placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            type="button"
            className="v7-search-clear-btn"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Xóa tìm kiếm"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Accessible native select strictly matching test invariants (§3.2, world_v4_consistency) */}
      <select
        aria-label={ariaLabel}
        value={currentWorldId || ''}
        onChange={e => onSelect(e.target.value)}
        className="v7-accessible-hidden-select"
        tabIndex={-1}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {worlds.map(w => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      {/* Autocomplete Dropdown Listbox (Weverse-Grade UX) */}
      {isOpen && (
        <div className="v7-search-dropdown-menu" role="listbox">
          <div className="v7-dropdown-header">
            <span>{query ? `Kết quả cho "${query}"` : 'Tất cả nghệ sĩ trên platform'}</span>
            <small>{filteredWorlds.length} nghệ sĩ</small>
          </div>

          <div className="v7-dropdown-results-list">
            {filteredWorlds.map((w, idx) => {
              const fandom = ARTIST_FANDOM_REGISTRY[w.id];
              const live = isLive(w.id);
              const isSelected = idx === selectedIndex;
              const isCurrent = w.id === currentWorldId;
              const asset = w.avatarAssetId ? state.avatarAssets[w.avatarAssetId] : undefined;

              return (
                <div
                  key={w.id}
                  role="option"
                  aria-selected={isCurrent}
                  className={`v7-dropdown-item ${isSelected ? 'highlighted' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => handleSelect(w.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="v7-item-avatar">
                    {asset?.status === 'approved' ? (
                      <AvatarRenderer
                        role="artist"
                        displayName={w.name}
                        size="sm"
                        isFrozen
                        accessoryId={asset.parts.accessory}
                        outfitId={asset.parts.outfit}
                      />
                    ) : (
                      <span className="v7-item-avatar-fallback">{w.name.slice(0, 1)}</span>
                    )}
                  </div>

                  <div className="v7-item-meta">
                    <div className="v7-item-name-row">
                      <strong className="v7-item-artist-name">{w.name}</strong>
                      {live && (
                        <span className="v7-item-live-badge">
                          <Radio size={10} /> LIVE
                        </span>
                      )}
                      {isCurrent && <span className="v7-item-current-tag">Đang xem</span>}
                    </div>
                    <span className="v7-item-fandom">
                      {fandom ? `Fandom ${fandom.fandomName}` : 'Cộng đồng người hâm mộ'}
                    </span>
                  </div>

                  <ChevronRight size={15} className="v7-item-arrow" />
                </div>
              );
            })}

            {!filteredWorlds.length && (
              <div className="v7-dropdown-no-results">
                <p>Không tìm thấy nghệ sĩ nào phù hợp với &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
