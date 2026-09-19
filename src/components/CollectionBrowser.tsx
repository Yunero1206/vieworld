import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Check, Award, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DISPLAY_FIXTURES, ownedCollection, displayedItems, type DisplaySlot, type DisplayItem } from '../world/display';
import { filterDisplayItems, formatCollectionDate } from '../world/displayFilter';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { ArchiveCollection } from './ArchiveCollection';
import { getTenantConfig } from '../domain/tenantConfig';

export function CollectionBrowser() {
  const { state, dispatch } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || params.get('custom');
  const slot: DisplaySlot | 'all' = DISPLAY_FIXTURES.some(f => f.slot === type) ? (type as DisplaySlot) : 'all';
  const [journey, setJourney] = useState(false);
  const [query, setQuery] = useState('');
  const [artist, setArtist] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<DisplayItem | null>(null);

  const items = displayedItems(state);
  const options = ownedCollection(state);
  const filtered = filterDisplayItems(options, { slot, query, artist, from, to });

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItemDetail(null);
    };
    if (selectedItemDetail) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedItemDetail]);

  const setType = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('section', 'collection');
    next.delete('custom');
    if (value === 'all') next.delete('type');
    else next.set('type', value);
    setParams(next, { replace: true });
  };

  const clear = () => {
    setType('all');
    setQuery('');
    setArtist('all');
    setFrom('');
    setTo('');
  };

  const fanFirstName = state.fanProfile.displayName.split(' ').pop() || state.fanProfile.displayName;

  return (
    <section className="v8-collection">
      {/* 2 Inner Tabs: Vật phẩm | Kỷ niệm & thành tựu */}
      <nav className="v8-tabs" aria-label="Nội dung bộ sưu tập">
        <button aria-pressed={!journey} onClick={() => setJourney(false)}>
          Vật phẩm
        </button>
        <button aria-pressed={journey} onClick={() => setJourney(true)}>
          Kỷ niệm & thành tựu
        </button>
      </nav>

      {journey ? (
        <ArchiveCollection />
      ) : (
        <>
          <header className="v5-section-heading v7-collection-heading">
            <div>
              <h2>Bộ sưu tập của {fanFirstName}</h2>
              <p>Những món và kỷ niệm bạn đã giữ lại qua các world.</p>
            </div>
            <Link className="fw-text-button" to="/me">
              Xem Phòng của tôi ↗
            </Link>
          </header>

          <div className="v8-search-bar-container">
            <label className="v8-search" aria-label="Tìm trong bộ sưu tập">
              <Search size={16} className="v8-search-icon" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm món đồ hoặc kỷ niệm theo tên…"
                aria-label="Tìm trong bộ sưu tập"
              />
              {query && (
                <button
                  type="button"
                  className="v8-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Xóa từ khóa"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <nav className="v8-tabs" aria-label="Loại vật phẩm">
            {[
              ['all', 'Tất cả'],
              ['shirt', 'Áo'],
              ['ticket', 'Vé & kỷ niệm'],
              ['disc', 'Đĩa'],
              ['lightstick', 'Lightstick'],
              ['achievement', 'Thành tựu'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={slot === id} onClick={() => setType(id)}>
                {label}
              </button>
            ))}
          </nav>

          <details className="v8-filters">
            <summary>
              Nghệ sĩ & thời gian{artist !== 'all' || from || to ? ' · Có bộ lọc đang dùng' : ''}
            </summary>
            <div>
              <label>
                Nghệ sĩ
                <select value={artist} onChange={e => setArtist(e.target.value)}>
                  <option value="all">Tất cả nghệ sĩ</option>
                  {Object.values(state.worlds).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Từ ngày
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </label>
              <label>
                Đến ngày
                <input
                  type="date"
                  min={from || undefined}
                  value={to}
                  onChange={e => setTo(e.target.value)}
                />
              </label>
            </div>
            <small>Món chưa có ngày nhận không hiện khi lọc thời gian.</small>
          </details>

          <div className="v5-section-heading">
            <span role="status">
              {filtered.length} món
              {artist !== 'all' ? ` · ${state.worlds[artist]?.name || artist}` : ''}
              {from ? ` · từ ${from}` : ''}
              {to ? ` · đến ${to}` : ''}
            </span>
            <button className="fw-text-button" onClick={clear}>
              Xóa bộ lọc
            </button>
          </div>

          <p className="v8-saved" role="status">
            {notice}
          </p>

          <div className="v8-item-grid">
            {filtered.map(item => {
              const current = item.slot ? items.find(i => i.slot === item.slot) : undefined;
              const selected = Boolean(item.slot && current?.id === item.id);
              const fixture = item.slot ? DISPLAY_FIXTURES.find(f => f.slot === item.slot) : undefined;

              return (
                <article
                  key={item.id}
                  className={`v8-collection-item ${selected ? 'is-displayed' : ''}`}
                  onClick={() => setSelectedItemDetail(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="v8-card-media-wrapper">
                    {item.image ? (
                      <img
                        src={
                          item.image.startsWith('shirt')
                            ? '/images/world-v6/shirt-cutout.webp'
                            : `${MERCH_IMAGE_ROOT}/${item.image}.png`
                        }
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <div className="v8-achievement-art">
                        <Award size={48} color="#D97706" />
                      </div>
                    )}
                    {fixture && <span className="v8-card-type-chip">{fixture.label}</span>}
                    {selected && (
                      <span className="v8-card-active-chip">
                        <Check size={12} /> Đang trưng bày
                      </span>
                    )}
                  </div>

                  <div className="v8-card-body">
                    <small className="v8-card-artist">
                      {state.worlds[item.worldId || '']?.name || 'Vật phẩm kỷ niệm'}
                    </small>
                    <h3 className="v8-card-title">{item.title}</h3>
                    <p className="v8-card-detail">{item.detail}</p>
                    {item.collectedAt && (
                      <time className="v8-card-date">{formatCollectionDate(item.collectedAt)}</time>
                    )}
                  </div>

                  <div className="v8-card-actions" onClick={e => e.stopPropagation()}>
                    {item.isDisplayCompatible && item.slot ? (
                      <>
                        {current && !selected && (
                          <small className="v8-slot-replace-hint">
                            Sẽ thay “{current.title}” trên kệ
                          </small>
                        )}
                        <button
                          className={`fw-button v8-action-btn ${selected ? 'is-active' : ''}`}
                          onClick={() => {
                            dispatch({
                              type: 'SET_DISPLAY_SLOT',
                              slot: item.slot!,
                              itemId: selected ? undefined : item.id,
                            });
                            setNotice(
                              selected
                                ? 'Đã cất món khỏi phòng. Bộ sưu tập vẫn được giữ nguyên.'
                                : `Đã trưng ${item.title} trong phòng.`
                            );
                          }}
                        >
                          {selected ? 'Cất khỏi phòng' : 'Trưng trong phòng'}
                        </button>
                        {selected && (
                          <strong className="v8-public-label">✓ Đang trưng tại {fixture?.label || 'phòng'}</strong>
                        )}
                      </>
                    ) : (
                      <div className="v8-item-locked-note">
                        <small style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                          Vật phẩm sưu tập cá nhân · Không có vị trí trên diorama phòng
                        </small>
                        {item.wearableSlot && (
                          <Link className="fw-text-button" to="/me?panel=wardrobe" style={{ fontSize: '13px' }}>
                            Mặc trong Tủ đồ →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {!filtered.length && (
            <div className="v8-empty">
              <h3>Chưa có món phù hợp</h3>
              <p>
                Thử bỏ bớt bộ lọc. Vé kỷ niệm và mốc thành tựu nằm trong Kỷ niệm & thành tựu; đồ mua xuất hiện sau khi đã nhận.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                <button className="fw-button" onClick={clear}>
                  Xem tất cả vật phẩm
                </button>
                <button className="fw-text-button" onClick={() => setJourney(true)}>
                  Xem kỷ niệm & thành tựu →
                </button>
                <Link className="fw-text-button" to="/shop">
                  Ghé {tenantConfig.labels.shopTitle} →
                </Link>
              </div>
            </div>
          )}

          {/* Item Provenance & Memory Archive Detail Drawer */}
          {selectedItemDetail && (
            <div className="v7-drawer-backdrop" onClick={() => setSelectedItemDetail(null)}>
              <div
                className="v7-slot-picker-drawer v7-collection-item-drawer"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Chi tiết ${selectedItemDetail.title}`}
              >
                <div className="v7-drawer-header">
                  <div>
                    <span className="v7-drawer-eyebrow">MEMORY ARCHIVE · CHI TIẾT VẬT PHẨM</span>
                    <h3>{selectedItemDetail.title}</h3>
                  </div>
                  <button
                    className="v7-drawer-close-btn"
                    onClick={() => setSelectedItemDetail(null)}
                    aria-label="Đóng"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="v7-drawer-body">
                  <div className="v7-archive-media">
                    {selectedItemDetail.image ? (
                      <img
                        src={
                          selectedItemDetail.image.startsWith('shirt')
                            ? '/images/world-v6/shirt-cutout.webp'
                            : `${MERCH_IMAGE_ROOT}/${selectedItemDetail.image}.png`
                        }
                        alt={selectedItemDetail.title}
                      />
                    ) : (
                      <div className="v7-archive-trophy">
                        <Award size={48} color="#D97706" />
                      </div>
                    )}
                  </div>

                  {/* Provenance breakdown */}
                  <div className="v7-provenance-meta-card">
                    <h4>Nguồn gốc & Lịch sử kỷ niệm</h4>
                    <dl className="v7-provenance-list">
                      <div className="v7-provenance-row">
                        <dt>Nghệ sĩ / World:</dt>
                        <dd>{state.worlds[selectedItemDetail.worldId || '']?.name || 'VieWorld Universe'}</dd>
                      </div>

                      <div className="v7-provenance-row">
                        <dt>Hình thức:</dt>
                        <dd>
                          {selectedItemDetail.deliveryKind === 'digital'
                            ? 'Kỹ thuật số (Digital)'
                            : selectedItemDetail.deliveryKind === 'physical'
                            ? 'Hiện vật (Physical)'
                            : 'Gói kết hợp (Bundle)'}
                        </dd>
                      </div>

                      <div className="v7-provenance-row">
                        <dt>Xuất xứ nhận:</dt>
                        <dd>
                          {selectedItemDetail.sourceType === 'event'
                            ? `Sự kiện: ${selectedItemDetail.eventName || selectedItemDetail.title}`
                            : selectedItemDetail.sourceType === 'achievement'
                            ? 'Cột mốc & thành tựu fandom'
                            : 'Đặt mua từ VieSHOP'}
                        </dd>
                      </div>

                      {selectedItemDetail.collectedAt && (
                        <div className="v7-provenance-row">
                          <dt>Thời gian lưu:</dt>
                          <dd>{formatCollectionDate(selectedItemDetail.collectedAt)}</dd>
                        </div>
                      )}

                      <div className="v7-provenance-row">
                        <dt>Trạng thái phòng:</dt>
                        <dd>
                          {selectedItemDetail.slot && items.some(i => i.id === selectedItemDetail.id) ? (
                            <span className="v7-status-active-pill">
                              <Check size={12} /> Đang trưng bày tại {DISPLAY_FIXTURES.find(f => f.slot === selectedItemDetail.slot)?.label}
                            </span>
                          ) : (
                            <span className="v7-status-stored-pill">
                              Lưu trữ trong bộ sưu tập (chưa đưa lên phòng)
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Private note section */}
                  <div className="v7-private-note-box">
                    <div className="v7-private-note-title">
                      <Lock size={13} />
                      <strong>Ghi chú riêng tư (Chỉ mình bạn thấy)</strong>
                    </div>
                    <p className="v7-private-note-text">
                      {selectedItemDetail.privateNote ||
                        'Chưa có ghi chú riêng cho món này. Ghi chú cá nhân luôn được giữ bí mật và không bao giờ xuất bản cho khách ghé thăm.'}
                    </p>
                  </div>

                  <div className="v7-drawer-actions">
                    {selectedItemDetail.isDisplayCompatible && selectedItemDetail.slot && (
                      <button
                        className="fw-button"
                        onClick={() => {
                          const isCurrentlyDisplayed = items.some(i => i.id === selectedItemDetail.id);
                          dispatch({
                            type: 'SET_DISPLAY_SLOT',
                            slot: selectedItemDetail.slot!,
                            itemId: isCurrentlyDisplayed ? undefined : selectedItemDetail.id,
                          });
                          setNotice(
                            isCurrentlyDisplayed
                              ? 'Đã cất món. Bộ sưu tập vẫn được giữ nguyên.'
                              : `Đã đặt ${selectedItemDetail.title} vào Phòng trưng bày.`
                          );
                          setSelectedItemDetail(null);
                        }}
                      >
                        {items.some(i => i.id === selectedItemDetail.id)
                          ? 'Cất khỏi Phòng trưng bày'
                          : 'Đặt vào Phòng trưng bày'}
                      </button>
                    )}

                    {selectedItemDetail.wearableSlot && (
                      <Link
                        to="/me?section=avatar"
                        className="fw-text-button"
                        onClick={() => setSelectedItemDetail(null)}
                      >
                        Mặc thử trên Avatar ↗
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
