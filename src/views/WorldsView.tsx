import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WorldCard } from '../components/WorldCard';
import { LayoutGrid, List, Search, Heart, Sparkles, Radio, Inbox } from 'lucide-react';

export const WorldsView: React.FC = () => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'followed' | 'artist' | 'ip'>('all');
  const [viewMode, setViewMode] = useState<'scenery' | 'list'>('scenery');

  const filteredWorlds = useMemo(() => {
    return Object.values(state.worlds).filter((world) => {
      // Search filter
      const matchesSearch =
        world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        world.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (filterType === 'followed') {
        return state.followedWorldIds.includes(world.id);
      }
      if (filterType === 'artist') {
        return world.type === 'artist';
      }
      if (filterType === 'ip') {
        return world.type === 'ip';
      }
      return true;
    });
  }, [state.worlds, state.followedWorldIds, searchQuery, filterType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="demo-badge">DANH MỤC THẾ GIỚI</span>
          <span className="tag">{Object.values(state.worlds).length} KHÔNG GIAN</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Các điểm đến người hâm mộ
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)' }}>
          Khám phá và theo dõi thế giới của nghệ sĩ hư cấu hoặc các chương trình âm nhạc độc quyền.
        </p>
      </header>

      {/* Filter and View Controls Bar */}
      <section
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nghệ sĩ hoặc show..."
              id="worlds-search-input"
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
              }}
            />
          </div>

          {/* View Mode Toggle Switcher (§3.2) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => setViewMode('scenery')}
              className="btn"
              style={{
                padding: '6px 10px',
                fontSize: 'var(--text-xs)',
                backgroundColor: viewMode === 'scenery' ? 'var(--surface)' : 'transparent',
                boxShadow: viewMode === 'scenery' ? 'var(--shadow-sm)' : 'none',
                color: viewMode === 'scenery' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: viewMode === 'scenery' ? '700' : '500',
              }}
              id="view-mode-scenery-btn"
              aria-label="Chế độ xem phong cảnh"
            >
              <LayoutGrid size={14} />
              <span>Phong cảnh</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn"
              style={{
                padding: '6px 10px',
                fontSize: 'var(--text-xs)',
                backgroundColor: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: viewMode === 'list' ? '700' : '500',
              }}
              id="view-mode-list-btn"
              aria-label="Chế độ xem danh sách"
            >
              <List size={14} />
              <span>Danh sách</span>
            </button>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`tag ${filterType === 'all' ? 'active-filter-tab' : ''}`}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              border: filterType === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filterType === 'all' ? '#EDE9FE' : 'var(--surface)',
              color: filterType === 'all' ? 'var(--primary)' : 'var(--ink)',
              fontWeight: '600',
            }}
            id="filter-all-btn"
          >
            Tất cả ({Object.keys(state.worlds).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('followed')}
            className={`tag ${filterType === 'followed' ? 'active-filter-tab' : ''}`}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              border: filterType === 'followed' ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filterType === 'followed' ? '#EDE9FE' : 'var(--surface)',
              color: filterType === 'followed' ? 'var(--primary)' : 'var(--ink)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            id="filter-followed-btn"
          >
            <Heart size={12} />
            <span>Đang theo dõi ({state.followedWorldIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('artist')}
            className={`tag ${filterType === 'artist' ? 'active-filter-tab' : ''}`}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              border: filterType === 'artist' ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filterType === 'artist' ? '#EDE9FE' : 'var(--surface)',
              color: filterType === 'artist' ? 'var(--primary)' : 'var(--ink)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            id="filter-artist-btn"
          >
            <Sparkles size={12} />
            <span>Nghệ sĩ ({Object.values(state.worlds).filter((w) => w.type === 'artist').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ip')}
            className={`tag ${filterType === 'ip' ? 'active-filter-tab' : ''}`}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              border: filterType === 'ip' ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filterType === 'ip' ? '#EDE9FE' : 'var(--surface)',
              color: filterType === 'ip' ? 'var(--primary)' : 'var(--ink)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            id="filter-ip-btn"
          >
            <Radio size={12} />
            <span>Chương trình IP ({Object.values(state.worlds).filter((w) => w.type === 'ip').length})</span>
          </button>
        </div>
      </section>

      {/* World List or Scenery Grid */}
      {filteredWorlds.length > 0 ? (
        viewMode === 'scenery' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredWorlds.map((w) => (
              <WorldCard key={w.id} world={w} viewMode="scenery" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredWorlds.map((w) => (
              <WorldCard key={w.id} world={w} viewMode="list" />
            ))}
          </div>
        )
      ) : (
        /* Useful Empty State (§3.2, §3.3) */
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '520px', margin: '20px auto' }}>
          <Inbox size={40} color="var(--muted)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: '6px' }}>
            Không tìm thấy thế giới phù hợp
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '16px' }}>
            {filterType === 'followed'
              ? 'Bạn chưa theo dõi không gian nào. Hãy khám phá và nhấn Theo dõi để cập nhật sự kiện mới.'
              : 'Thử điều chỉnh từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            Xem tất cả các thế giới
          </button>
        </div>
      )}
    </div>
  );
};
