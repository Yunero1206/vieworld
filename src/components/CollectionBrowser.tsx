import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, MoreHorizontal, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { displayAssetUrl, ownedCollection, type DisplayItem, type DisplaySlot } from '../world/display';
import { DISPLAY_SURFACES, itemFootprint, readDisplaySurfaces, validateSurfaceSelection } from '../world/displaySurfaces';
import { ArchiveCollection } from './ArchiveCollection';
import { matchesVietnameseQuery } from '../utils/textSearch';

type Mode = 'objects' | 'memories';
const objectCategories = [['all', 'Tất cả'], ['shirt', 'Áo'], ['ticket', 'Vé'], ['disc', 'Đĩa'], ['lightstick', 'Lightstick'], ['other', 'Khác']];
const memoryCategories = [['all', 'Tất cả'], ['concert', 'Concert'], ['fan-project', 'Fan project'], ['capsule', 'Capsule'], ['moment', 'Khoảnh khắc'], ['milestone', 'Dấu mốc']];

export function CollectionBrowser() {
  const { state, dispatch } = useApp();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>('objects');
  const [query, setQuery] = useState('');
  const [artist, setArtist] = useState('all');
  const [eventName, setEventName] = useState('all');
  const [year, setYear] = useState('all');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DisplayItem | null>(null);
  const [placing, setPlacing] = useState<DisplayItem | null>(null);
  const [notice, setNotice] = useState('');
  const category = params.get('type') || params.get('custom') || 'all';
  const owned = useMemo(() => ownedCollection(state), [state]);
  const surfaces = useMemo(() => readDisplaySurfaces(state.fanProfile, owned), [state.fanProfile, owned]);
  const categories = mode === 'objects' ? objectCategories : memoryCategories;
  const selectedCategory = categories.some(([id]) => id === category) ? category : 'all';
  const years = [...new Set(owned.map(item => item.collectedAt?.slice(0, 4)).filter((value): value is string => Boolean(value)))].sort().reverse();
  const events = [...new Set(owned.map(item => item.eventName).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'vi'));

  const filtered = owned.filter(item => {
    const memory = ['event', 'achievement', 'moment'].includes(item.sourceType || '');
    if ((mode === 'memories') !== memory) return false;
    if (selectedCategory !== 'all') {
      if (mode === 'objects' && (selectedCategory === 'other' ? ['shirt', 'ticket', 'disc', 'lightstick'].includes(item.slot || '') : item.slot !== selectedCategory)) return false;
      if (mode === 'memories' && (selectedCategory === 'milestone' ? item.sourceType !== 'achievement' : selectedCategory === 'capsule' ? item.category !== 'memory' : selectedCategory === 'concert' ? item.sourceType !== 'event' || item.category === 'memory' : selectedCategory === 'moment' ? item.sourceType !== 'moment' : item.category !== 'fan-project')) return false;
    }
    if (artist !== 'all' && item.worldId !== artist) return false;
    if (eventName !== 'all' && item.eventName !== eventName) return false;
    if (year !== 'all' && item.collectedAt?.slice(0, 4) !== year) return false;
    return matchesVietnameseQuery(`${item.title} ${item.eventName || ''} ${state.worlds[item.worldId || '']?.name || ''}`, query);
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuId(null); setDetail(null); setPlacing(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function setCategory(value: string) {
    const next = new URLSearchParams(params);
    next.set('section', 'collection');
    next.delete('custom');
    if (value === 'all') next.delete('type'); else next.set('type', value);
    setParams(next, { replace: true });
  }
  function displayedAt(itemId: string): DisplaySlot | undefined {
    return DISPLAY_SURFACES.find(surface => surfaces[surface.id].itemIds.includes(itemId))?.id;
  }
  function remove(item: DisplayItem) {
    const id = displayedAt(item.id);
    if (!id) return;
    const selection = surfaces[id];
    const itemIds = selection.itemIds.filter(value => value !== item.id);
    dispatch({ type: 'SET_DISPLAY_SURFACE', surfaceId: id, selection: { ...selection, itemIds, focalItemId: selection.focalItemId === item.id ? itemIds[0] : selection.focalItemId } });
    setMenuId(null);
    setNotice(`Đã cất ${item.title}. Món vẫn ở trong Bộ sưu tập.`);
  }
  function place(id: DisplaySlot, item: DisplayItem) {
    const oldId = displayedAt(item.id);
    if (oldId === id) { setPlacing(null); return; }
    const selection = { ...surfaces[id], itemIds: [...surfaces[id].itemIds, item.id], focalItemId: surfaces[id].focalItemId || item.id };
    const profile = oldId ? { ...state.fanProfile, displaySurfaces: { ...surfaces, [oldId]: { ...surfaces[oldId], itemIds: surfaces[oldId].itemIds.filter(value => value !== item.id) } } } : state.fanProfile;
    const problem = validateSurfaceSelection(profile, id, selection, owned);
    if (problem) { setNotice(problem); return; }
    if (oldId) remove(item);
    dispatch({ type: 'SET_DISPLAY_SURFACE', surfaceId: id, selection });
    setPlacing(null); setMenuId(null);
    setNotice(`Đã trưng ${item.title} ở ${DISPLAY_SURFACES.find(surface => surface.id === id)?.label}.`);
  }

  return <section className="myspace-collection" aria-label="Bộ sưu tập riêng">
    <nav className="myspace-mode-tabs" aria-label="Loại bộ sưu tập">
      <button type="button" aria-pressed={mode === 'objects'} onClick={() => { setMode('objects'); setCategory('all'); }}>Vật phẩm</button>
      <button type="button" aria-pressed={mode === 'memories'} onClick={() => { setMode('memories'); setCategory('all'); }}>Kỷ niệm & dấu mốc</button>
      <Link to="/me" className="myspace-room-link">Xem Phòng của tôi ↗</Link>
    </nav>
    <div className="myspace-collection-tools">
      <label className="myspace-collection-search"><Search size={18}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={mode === 'objects' ? 'Tìm vật phẩm trong bộ sưu tập…' : 'Tìm một kỷ niệm…'} aria-label="Tìm trong bộ sưu tập" /></label>
      <div className="myspace-collection-filter-row">
        <nav className="myspace-category-chips" aria-label="Danh mục">{categories.map(([id, label]) => <button key={id} type="button" aria-pressed={selectedCategory === id} onClick={() => setCategory(id)}>{label}</button>)}</nav>
        <details className="myspace-advanced-filters"><summary>Bộ lọc{artist !== 'all' || eventName !== 'all' || year !== 'all' ? ' · đang dùng' : ''}</summary><div>
          <label>Nghệ sĩ / World<select value={artist} onChange={event => setArtist(event.target.value)}><option value="all">Tất cả</option>{Object.values(state.worlds).filter(world => world.tenantId === state.activeTenantId).map(world => <option key={world.id} value={world.id}>{world.name}</option>)}</select></label>
          <label>Sự kiện<select value={eventName} onChange={event => setEventName(event.target.value)}><option value="all">Tất cả</option>{events.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Thời gian / năm<select value={year} onChange={event => setYear(event.target.value)}><option value="all">Tất cả</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <button type="button" onClick={() => { setArtist('all'); setEventName('all'); setYear('all'); setQuery(''); setCategory('all'); }}>Xóa bộ lọc</button>
        </div></details>
      </div>
    </div>
    <p className="myspace-collection-count" role="status">{filtered.length} {mode === 'objects' ? 'vật phẩm' : 'kỷ niệm & dấu mốc'}{notice ? ` · ${notice}` : ''}</p>
    <div className={`myspace-collection-grid ${mode === 'memories' ? 'is-memories' : ''}`}>
      {filtered.map(item => <article className={`myspace-object-card ${item.sourceType === 'achievement' ? 'is-milestone' : ''}`} key={item.id}>
        <div className="myspace-object-image">
          {displayAssetUrl(item) ? <img src={displayAssetUrl(item)} alt="" loading="lazy"/> : <div className="myspace-keepsake-emblem"><Award size={36}/><span>Dấu mốc</span></div>}
          <button className="myspace-object-menu-trigger" type="button" aria-label={`Tùy chọn ${item.title}`} aria-expanded={menuId === item.id} onClick={() => setMenuId(menuId === item.id ? null : item.id)}><MoreHorizontal size={19}/></button>
          {menuId === item.id && <div className="myspace-object-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setDetail(item); setMenuId(null); }}>Xem chi tiết</button>{item.isDisplayCompatible && <button type="button" role="menuitem" onClick={() => { setPlacing(item); setMenuId(null); }}>{displayedAt(item.id) ? 'Đổi vị trí' : 'Trưng trong phòng'}</button>}{displayedAt(item.id) && <><Link to="/me" role="menuitem" onClick={() => setMenuId(null)}>Xem trong phòng</Link><button type="button" role="menuitem" onClick={() => remove(item)}>Gỡ khỏi phòng</button></>}</div>}
        </div>
        <div className="myspace-object-caption"><h3>{item.title}</h3><p>{[state.worlds[item.worldId || '']?.name, item.eventName && item.eventName !== item.title ? item.eventName : undefined, item.collectedAt?.slice(0, 4)].filter(Boolean).join(' · ') || (item.sourceType === 'achievement' ? 'Một dấu mốc của bạn' : 'Bộ sưu tập của bạn')}</p></div>
      </article>)}
    </div>
    {!filtered.length && <div className="myspace-collection-empty"><p>Chưa có món nào phù hợp với lựa chọn này.</p><button type="button" onClick={() => { setQuery(''); setArtist('all'); setEventName('all'); setYear('all'); setCategory('all'); }}>Xem tất cả</button></div>}
    {mode === 'memories' && <details className="myspace-history-details"><summary>Xem lịch sử thẻ & dấu mốc đã ghi nhận</summary><ArchiveCollection/></details>}
    {detail && <div className="myspace-modal-backdrop" onClick={() => setDetail(null)}><div className="myspace-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết ${detail.title}`} onClick={event => event.stopPropagation()}><button className="myspace-modal-close" type="button" onClick={() => setDetail(null)} aria-label="Đóng"><X size={18}/></button><div className="myspace-modal-image">{displayAssetUrl(detail) ? <img src={displayAssetUrl(detail)} alt=""/> : <Award size={54}/>}</div><h2>{detail.title}</h2><p>{state.worlds[detail.worldId || '']?.name || 'Bộ sưu tập của bạn'}{detail.collectedAt ? ` · ${detail.collectedAt.slice(0, 10)}` : ''}</p><p>{detail.detail}</p>{detail.isDisplayCompatible && <button type="button" className="myspace-primary-action" onClick={() => { setPlacing(detail); setDetail(null); }}>{displayedAt(detail.id) ? 'Đổi vị trí trong phòng' : 'Trưng trong phòng'}</button>}</div></div>}
    {placing && <div className="myspace-modal-backdrop" onClick={() => setPlacing(null)}><div className="myspace-modal" role="dialog" aria-modal="true" aria-label={`Chọn chỗ trưng ${placing.title}`} onClick={event => event.stopPropagation()}><button className="myspace-modal-close" type="button" onClick={() => setPlacing(null)} aria-label="Đóng"><X size={18}/></button><h2>Chọn một góc cho {placing.title}</h2><p>Bạn chọn món; phòng tự sắp xếp. Món trong Bộ sưu tập vẫn luôn được giữ.</p><div className="myspace-surface-choices">{DISPLAY_SURFACES.filter(surface => placing.slot && surface.allowedItemTypes.includes(placing.slot)).map(surface => { const count = surfaces[surface.id].itemIds.length; const units = surfaces[surface.id].itemIds.reduce((sum, id) => sum + itemFootprint(owned.find(item => item.id === id) || placing), 0); const full = count >= surface.maxItems || (units + itemFootprint(placing) > surface.capacityUnits && displayedAt(placing.id) !== surface.id); return <button key={surface.id} type="button" disabled={full} onClick={() => place(surface.id, placing)}><strong>{surface.label}</strong><small>{displayedAt(placing.id) === surface.id ? 'Đang ở đây' : full ? 'Khu vực này đã đầy' : `${count}/${surface.maxItems} món`}</small></button>; })}</div>{notice && <p role="status">{notice}</p>}</div></div>}
  </section>;
}
