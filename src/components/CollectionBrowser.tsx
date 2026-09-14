import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DISPLAY_FIXTURES, ownedCollection, displayedItems, type DisplaySlot } from '../world/display';
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

  const items = displayedItems(state);
  const options = ownedCollection(state);
  const filtered = filterDisplayItems(options, { slot, query, artist, from, to });

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

  return (
    <section className="v8-collection">
      <nav className="v8-tabs" aria-label="Nội dung bộ sưu tập">
        <button aria-pressed={!journey} onClick={() => setJourney(false)}>
          Vật phẩm của tôi
        </button>
        <button aria-pressed={journey} onClick={() => setJourney(true)}>
          Hành trình & thành tựu
        </button>
      </nav>
      {journey ? (
        <ArchiveCollection />
      ) : (
        <>
          <header className="v5-section-heading">
            <div>
              <h2>Những điều mình giữ</h2>
              <p>Riêng tư cho đến khi bạn chọn đặt một món vào phòng.</p>
            </div>
            <Link className="fw-text-button" to="/me">
              Xem Phòng trưng bày ↗
            </Link>
          </header>
          <label className="v8-search">
            Tìm trong bộ sưu tập
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tên áo, album, buổi diễn…"
            />
          </label>
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
                <article key={item.id} className="v8-collection-item">
                  {item.image ? (
                    <img src={`${MERCH_IMAGE_ROOT}/${item.image}.png`} alt="" loading="lazy" />
                  ) : (
                    <div className="v8-achievement-art">✦</div>
                  )}
                  <small>{state.worlds[item.worldId || '']?.name || 'Hành trình của mình'}</small>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  {item.collectedAt && <time>{formatCollectionDate(item.collectedAt)}</time>}

                  {item.isDisplayCompatible && item.slot ? (
                    <>
                      <small>Vị trí: {fixture?.label}</small>
                      {current && !selected && (
                        <small>Sẽ thay “{current.title}”; món cũ vẫn ở bộ sưu tập.</small>
                      )}
                      <button
                        className="fw-button"
                        onClick={() => {
                          dispatch({
                            type: 'SET_DISPLAY_SLOT',
                            slot: item.slot!,
                            itemId: selected ? undefined : item.id,
                          });
                          setNotice(
                            selected
                              ? 'Đã cất món. Bộ sưu tập vẫn được giữ nguyên.'
                              : `Đã đặt ${item.title} vào Phòng trưng bày công khai.`
                          );
                        }}
                      >
                        {selected ? 'Cất khỏi Phòng trưng bày' : 'Đặt vào Phòng trưng bày'}
                      </button>
                      {selected && <strong className="v8-public-label">✓ Đang trưng bày công khai</strong>}
                    </>
                  ) : (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <div className="v8-empty">
              <h3>Chưa có món phù hợp</h3>
              <p>
                Thử bỏ bớt bộ lọc. Vé kỷ niệm và mốc thành tựu nằm trong Hành trình; đồ mua xuất hiện sau khi đã nhận.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                <button className="fw-button" onClick={clear}>
                  Xem tất cả vật phẩm
                </button>
                <button className="fw-text-button" onClick={() => setJourney(true)}>
                  Xem hành trình →
                </button>
                <Link className="fw-text-button" to="/shop">
                  Ghé {tenantConfig.labels.shopTitle} →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
