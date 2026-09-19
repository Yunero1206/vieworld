import { ownedDigitalLook } from '../world/merchCatalog';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Lock, Package, Search, Heart, Truck, Monitor, Check, X, SlidersHorizontal, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { WorldPanel } from '../components/WorldPanel';
import { ProductVisual } from '../components/ProductVisual';
import { Product } from '../domain/types';
import { DELIVERY_LABELS, MERCH_IMAGE_ROOT, ownsDigitalProduct } from '../world/merchCatalog';
import { ORDER_LABELS } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { getTenantConfig } from '../domain/tenantConfig';

const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const categories = [
  ['all', 'Tất cả'],
  ['merch', 'Merch & Lightstick'],
  ['album', 'Album / CD'],
  ['membership', 'Pass & Membership'],
];

interface ProductFamily {
  key: string;
  familyId?: string;
  title: string;
  worldId: string;
  artistName: string;
  category: string;
  variants: Product[];
  formatsLabel: string;
  minPrice: number;
  maxPrice: number;
  priceDisplay: string;
  primaryProduct: Product;
  digitalTwinProduct?: Product;
  previewOnly: boolean;
}

function MerchArt({ product, digital = false }: { product: Product; digital?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = digital ? product.digitalImage : product.image;
  useEffect(() => setFailed(false), [image]);
  return image && !failed ? (
    <img
      src={`${MERCH_IMAGE_ROOT}/${image}.png`}
      alt={`${product.title} · ${digital || product.delivery === 'digital' ? 'minh họa digital' : 'thiết kế hàng thật'} · thiết kế kỷ niệm`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <ProductVisual productId={product.id} title={product.title} />
  );
}

export function FanShopView() {
  const { state, dispatch } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const shopTitle = tenantConfig.labels.shopTitle || 'VieSHOP';
  const { worldId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const query = params.get('q') || '';
  const filter = params.get('artist') || worldId || 'all';
  const category = params.get('category') || 'all';
  const delivery = params.get('delivery') || 'all';
  const sort = params.get('sort') || 'featured';
  const savedOnly = params.get('saved') === 'true';

  const [size, setSize] = useState('');
  const [digitalPhoto, setDigitalPhoto] = useState(false);
  const [trying, setTrying] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [fittingDrawerOpen, setFittingDrawerOpen] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const openedHere = useRef(false);

  const selectedId = params.get('product');
  const selected = selectedId ? state.products[selectedId] : undefined;
  const world = worldId ? state.worlds[worldId] : undefined;
  const allProducts = Object.values(state.products);
  const ownOrders = Object.values(state.orders).filter(o => o.fanId === state.fanProfile.id);
  const saved = state.fanProfile.savedProductIds || [];

  useEffect(() => {
    setSize('');
    setDigitalPhoto(false);
    setAdded(false);
  }, [selectedId]);

  const updateParam = (key: string, value: string, defaultValue = 'all') => {
    const next = new URLSearchParams(params);
    if (!value || value === defaultValue || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  const setQuery = (q: string) => updateParam('q', q, '');
  const setFilter = (f: string) => updateParam('artist', f, worldId || 'all');
  const setCategory = (c: string) => updateParam('category', c, 'all');
  const setDelivery = (d: string) => updateParam('delivery', d, 'all');
  const setSort = (s: string) => updateParam('sort', s, 'featured');
  const setSavedOnly = (s: boolean) => updateParam('saved', s ? 'true' : 'false', 'false');

  const clearAllFilters = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    next.delete('artist');
    next.delete('delivery');
    next.delete('saved');
    setParams(next, { replace: true });
  };

  const openProduct = (id: string) => {
    if (!selectedId) openedHere.current = true;
    const next = new URLSearchParams(params);
    next.set('product', id);
    setParams(next, { replace: !!selectedId });
  };

  const close = () => {
    if (openedHere.current) {
      openedHere.current = false;
      navigate(-1);
    } else {
      const next = new URLSearchParams(params);
      next.delete('product');
      setParams(next, { replace: true });
    }
  };

  const eligible = selected?.requiredBenefitId ? state.benefits[selected.requiredBenefitId] : undefined;
  const locked = !!selected?.requiredBenefitId && (!eligible || !['eligible', 'claimed'].includes(eligible.status));
  const unavailable = selected && (!selected.isAvailable || selected.stockCount <= 0);
  const variants = selected ? allProducts.filter(p => (p.familyId || p.id) === (selected.familyId || selected.id)) : [];
  const digitalTwin = (p: Product) => allProducts.find(x => (x.familyId || x.id) === (p.familyId || p.id) && x.delivery === 'digital' && x.digitalSlot);
  const tryProduct = selected && digitalTwin(selected);
  const previewLook = trying?.digitalSlot ? { ...ownedDigitalLook(state), [trying.digitalSlot]: trying.digitalItemId } : ownedDigitalLook(state);
  const owned = !!trying && ownsDigitalProduct(state, trying);

  // Group all products into Product Families
  const productFamilies = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of allProducts) {
      const key = p.familyId || p.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    const families: ProductFamily[] = [];
    for (const [key, vars] of map.entries()) {
      const primary = vars.find(v => v.delivery === 'physical') || vars[0];
      const prices = vars.map(v => v.priceVND);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const isPreview = vars.every(v => v.previewOnly);

      const formatSet = new Set(vars.map(v => v.delivery || 'physical'));
      const formatLabels: string[] = [];
      if (formatSet.has('physical')) formatLabels.push('Hàng thật');
      if (formatSet.has('digital')) formatLabels.push('Digital');
      if (formatSet.has('bundle')) formatLabels.push('Duo');

      const twin = vars.find(v => v.delivery === 'digital' && v.digitalSlot);

      let priceDisplay = '';
      if (isPreview) {
        priceDisplay = 'Xem thông tin';
      } else if (minPrice === maxPrice) {
        priceDisplay = money(minPrice);
      } else {
        priceDisplay = `${money(minPrice)} – ${money(maxPrice)}`;
      }

      families.push({
        key,
        familyId: primary.familyId,
        title: primary.title,
        worldId: primary.worldId || 'artist-a',
        artistName: state.worlds[primary.worldId]?.name || 'VieWorld',
        category: primary.category || 'merch',
        variants: vars,
        formatsLabel: formatLabels.join(' · '),
        minPrice,
        maxPrice,
        priceDisplay,
        primaryProduct: primary,
        digitalTwinProduct: twin,
        previewOnly: isPreview,
      });
    }
    return families;
  }, [allProducts, state.worlds]);

  // Filter and sort product families
  const filteredFamilies = useMemo(() => {
    return productFamilies.filter(fam => {
      if (filter !== 'all' && fam.worldId !== filter) return false;
      if (category === 'merch' && fam.category !== 'merch') return false;
      if (category === 'album' && fam.category !== 'album') return false;
      if (category === 'membership' && !['membership', 'ticket'].includes(fam.category)) return false;
      if (category === 'ticket' && fam.category !== 'ticket') return false;
      if (delivery !== 'all' && !fam.variants.some(v => (v.delivery || 'physical') === delivery)) return false;
      if (savedOnly && !fam.variants.some(v => saved.includes(v.id))) return false;
      if (query && !matchesVietnameseQuery(fam.title, query) && !fam.variants.some(v => matchesVietnameseQuery(v.title, query))) return false;
      return true;
    }).sort((a, b) => {
      if (sort === 'low') return a.minPrice - b.minPrice;
      if (sort === 'high') return b.maxPrice - a.maxPrice;
      return Number(!!b.familyId) - Number(!!a.familyId);
    });
  }, [productFamilies, filter, category, delivery, savedOnly, query, sort, saved]);

  const hasActiveFilters = query || (filter !== 'all' && filter !== worldId) || delivery !== 'all' || savedOnly;
  const activeFilterCount = (query ? 1 : 0) + (filter !== 'all' && filter !== worldId ? 1 : 0) + (delivery !== 'all' ? 1 : 0) + (savedOnly ? 1 : 0);

  function buy() {
    if (!selected || locked || unavailable || selected.previewOnly || (selected.sizes && !size)) return;
    dispatch({ type: 'ADD_TO_CART', productId: selected.id, optionLabel: size || undefined });
    setAdded(true);
  }

  if (worldId && !world) {
    return (
      <div className="fw-empty">
        <h1>Chưa tìm thấy cửa hàng này</h1>
        <Link className="fw-button" to="/shop">Về {shopTitle}</Link>
      </div>
    );
  }

  const dressingRoom = (compact = false) => (
    <aside className={`fw-fitting-room ${compact ? 'compact' : ''}`} aria-label="Phòng thử đồ digital">
      <p className="fw-eyebrow">PHÒNG THỬ ĐỒ KỸ THUẬT SỐ</p>
      <h2>Định hình phong cách của bạn.</h2>
      <div className="fw-fitting-mirror">
        <AvatarRenderer
          role="fan"
          size="preview"
          appearance={state.fanProfile.avatarPreset}
          displayName={state.fanProfile.displayName}
          accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
          digitalLook={previewLook}
        />
      </div>
      <p>{trying ? trying.title : 'Chọn áo, nón hoặc lightstick để thử trên avatar.'}</p>
      <small>
        {trying
          ? owned
            ? 'Bạn đã sở hữu bản digital này.'
            : 'Đang thử · Chưa sở hữu · Chưa đổi diện mạo đã lưu'
          : 'Mua hàng thật không tự tặng đồ digital.'}
      </small>
      {trying && (
        <div>
          {owned ? (
            <button className="fw-button" onClick={() => dispatch({ type: 'EQUIP_DIGITAL_PRODUCT', productId: trying.id })}>
              <Check size={16} /> Mặc và lưu
            </button>
          ) : (
            <button className="fw-button" onClick={() => openProduct(trying.id)}>
              Xem bản digital <ArrowRight size={15} />
            </button>
          )}
          <button className="fw-text-button" onClick={() => setTrying(null)}>
            <X size={15} /> Bỏ thử
          </button>
        </div>
      )}
      <Link className="fw-text-button" to="/me?panel=wardrobe">
        Về tủ đồ cá nhân →
      </Link>
    </aside>
  );

  return (
    <div className="fw-shop-page fw-shop-v2">
      <header className="fw-shop-story">
        <div className="fw-shop-story-copy">
          <p className="fw-eyebrow">{shopTitle.toUpperCase()} · BỘ SƯU TẬP ĐẶC BIỆT · STAR CLUB</p>
          <h1>Ngoài đời. Trong world.<br /><em>Vẫn là điều mình thích.</em></h1>
          <p>Áo mặc đi concert. Lightstick cầm trong world.<br />Mỗi phiên bản đều ghi rõ những gì bạn nhận.</p>
          <button
            className="fw-text-button fw-hero-discover"
            onClick={() => {
              setCategory('merch');
              setDelivery('all');
              document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Khám phá Star Club <ArrowRight size={17} />
          </button>
        </div>
        <button
          onClick={() => openProduct('product-lightstick-real')}
          aria-label="Khám phá Star Light lightstick"
          className="fw-shop-spotlight-card"
        >
          <div className="fw-spotlight-media">
            <MerchArt product={state.products['product-lightstick-real'] || allProducts[0]} />
          </div>
          <div className="fw-spotlight-badge">
            <span className="fw-spotlight-pill">NỔI BẬT</span>
            <span>STAR LIGHT <small>Thiết kế kỷ niệm mẫu</small></span>
          </div>
        </button>
      </header>

      <nav className="fw-shop-categories" aria-label={`Danh mục ${shopTitle}`}>
        {categories.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Compact Digital Fitting Room Strip */}
      <div className="fw-fitting-strip" aria-label="Phòng thử đồ digital">
        <div className="fw-fitting-strip-left">
          <div className="fw-fitting-strip-avatar">
            <AvatarRenderer
              role="fan"
              size="sm"
              appearance={state.fanProfile.avatarPreset}
              displayName={state.fanProfile.displayName}
              accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
              digitalLook={previewLook}
            />
          </div>
          <div className="fw-fitting-strip-text">
            <strong>Phòng thử đồ Digital</strong>
            <span>
              {trying
                ? `Đang thử: ${trying.title}. Xem trước trang phục trên avatar.`
                : 'Thử ngay trang phục và lightstick lên avatar của bạn trước khi chọn mua.'}
            </span>
          </div>
        </div>
        <div className="fw-fitting-strip-actions">
          <button
            type="button"
            className="fw-button fw-fitting-strip-btn"
            onClick={() => setFittingDrawerOpen(true)}
          >
            {trying ? 'Xem diện mạo đầy đủ →' : `Thử với ${state.fanProfile.displayName} →`}
          </button>
          {trying && (
            <button
              type="button"
              className="fw-text-button"
              onClick={() => setTrying(null)}
            >
              Bỏ thử
            </button>
          )}
        </div>
      </div>

      <div className="fw-shop-layout fw-shop-fullwidth" id="shop-catalog">
        <section>
          <div className="fw-shop-toolbar">
            <div className="fw-search fw-shop-search-box">
              <Search size={16} className="fw-shop-search-icon" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm, album, lightstick muốn mua..."
                aria-label="Tìm sản phẩm"
              />
              {query && (
                <button
                  type="button"
                  className="fw-shop-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Xóa từ khóa"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`fw-text-button fw-filter-btn ${hasActiveFilters ? 'is-active' : ''}`}
              onClick={() => setFilterDrawerOpen(true)}
              aria-label="Bộ lọc sản phẩm"
            >
              <SlidersHorizontal size={16} />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && <span className="fw-filter-count">({activeFilterCount})</span>}
            </button>

            <button
              className="fw-text-button fw-saved-btn"
              aria-pressed={savedOnly}
              onClick={() => setSavedOnly(!savedOnly)}
            >
              <Heart size={16} fill={savedOnly ? 'currentColor' : 'none'} />
              <span>Đã lưu</span>
              {saved.length > 0 && <small>({saved.length})</small>}
            </button>

            <select
              aria-label="Sắp xếp sản phẩm"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="featured">Bộ sưu tập</option>
              <option value="low">Giá tăng dần</option>
              <option value="high">Giá giảm dần</option>
            </select>
          </div>

          {/* Applied filters strip */}
          {hasActiveFilters && (
            <div className="fw-applied-filters" aria-label="Bộ lọc đang áp dụng">
              <span className="fw-applied-label">Đang chọn:</span>
              {query && (
                <button type="button" className="fw-applied-chip" onClick={() => setQuery('')}>
                  "{query}" <X size={12} />
                </button>
              )}
              {filter !== 'all' && filter !== worldId && (
                <button type="button" className="fw-applied-chip" onClick={() => setFilter('all')}>
                  {state.worlds[filter]?.name || filter} <X size={12} />
                </button>
              )}
              {delivery !== 'all' && (
                <button type="button" className="fw-applied-chip" onClick={() => setDelivery('all')}>
                  {DELIVERY_LABELS[delivery as keyof typeof DELIVERY_LABELS] || delivery} <X size={12} />
                </button>
              )}
              {savedOnly && (
                <button type="button" className="fw-applied-chip" onClick={() => setSavedOnly(false)}>
                  Đã lưu ({saved.length}) <X size={12} />
                </button>
              )}
              <button type="button" className="fw-applied-clear-all" onClick={clearAllFilters}>
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="fw-catalog-meta">
            <p className="fw-catalog-count">{filteredFamilies.length} thiết kế · Giá và tồn kho mô phỏng</p>
          </div>

          {!filteredFamilies.length && (
            <div className="fw-empty">
              <Package size={30} />
              <h2>Chưa có món phù hợp.</h2>
              <p>Thử danh mục khác hoặc bỏ bớt bộ lọc.</p>
              <button className="fw-button" onClick={clearAllFilters}>
                Xem tất cả
              </button>
            </div>
          )}

          <div className="fw-product-grid">
            {filteredFamilies.map(fam => {
              // Representative product for variant selection/card display
              const repProduct = (delivery !== 'all'
                ? fam.variants.find(v => (v.delivery || 'physical') === delivery)
                : null) || fam.primaryProduct;
              const isSaved = fam.variants.some(v => saved.includes(v.id));

              return (
                <article className="fw-product-tile" key={fam.key}>
                  <button
                    className="fw-product"
                    onClick={() => openProduct(repProduct.id)}
                  >
                    <div className="fw-product-art">
                      <MerchArt product={repProduct} />
                      <span className="fw-product-delivery-pill">
                        {repProduct.previewOnly ? 'Thiết kế mẫu' : DELIVERY_LABELS[repProduct.delivery || 'physical']}
                      </span>
                      <i><ArrowRight size={20} /></i>
                    </div>
                    <small className="fw-product-subline">
                      {fam.artistName} · {repProduct.previewOnly ? 'Chưa mở bán' : !repProduct.isAvailable || repProduct.stockCount <= 0 ? 'Hết hàng' : repProduct.releaseType === 'pre_order' ? 'Pre-order · Đợt 1' : repProduct.delivery === 'digital' ? 'Digital tức thì' : fam.formatsLabel}
                    </small>
                    <h2>{fam.title}</h2>
                    <strong>{fam.priceDisplay}</strong>
                  </button>
                  <div className="fw-product-extra">
                    <button
                      className="fw-text-button fw-product-fav"
                      aria-label={`${isSaved ? 'Bỏ lưu' : 'Lưu'} ${fam.primaryProduct.title}`}
                      aria-pressed={isSaved}
                      onClick={() => dispatch({ type: 'TOGGLE_SAVED_PRODUCT', productId: fam.primaryProduct.id })}
                    >
                      <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                    {fam.digitalTwinProduct && (
                      <button
                        type="button"
                        className="fw-text-button fw-product-try"
                        onClick={() => {
                          setTrying(fam.digitalTwinProduct!);
                          openProduct(fam.primaryProduct.id);
                        }}
                      >
                        Thử digital
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Format explainer text link */}
      <div className="fw-format-explainer-row">
        <button
          type="button"
          className="fw-format-explainer-link"
          onClick={() => setShowFormatModal(true)}
        >
          <Info size={15} />
          <span>Hàng thật, Digital và Duo khác nhau thế nào? →</span>
        </button>
      </div>

      <footer className="fw-shop-footnote">
        {shopTitle} · Không gian lưu giữ quà lưu niệm và vật phẩm đồng hành cùng nghệ sĩ. Trong giai đoạn trải nghiệm, hình ảnh đóng vai trò bản dựng ý tưởng (concept preview); không thu tiền hay phát hành vé thương mại ngoài đời thực.
      </footer>

      {/* Filter Drawer Modal */}
      {filterDrawerOpen && (
        <WorldPanel title="Bộ lọc sản phẩm" onClose={() => setFilterDrawerOpen(false)}>
          <div className="fw-filter-drawer-body">
            <div className="fw-filter-group">
              <h3>Nghệ sĩ & Chương trình</h3>
              <div className="fw-filter-chip-grid">
                <button
                  type="button"
                  className={`fw-filter-select-chip ${filter === 'all' ? 'is-selected' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tất cả nghệ sĩ
                </button>
                {Object.values(state.worlds).map(w => (
                  <button
                    key={w.id}
                    type="button"
                    className={`fw-filter-select-chip ${filter === w.id ? 'is-selected' : ''}`}
                    onClick={() => setFilter(w.id)}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="fw-filter-group">
              <h3>Hình thức nhận sản phẩm</h3>
              <div className="fw-filter-chip-grid">
                <button
                  type="button"
                  className={`fw-filter-select-chip ${delivery === 'all' ? 'is-selected' : ''}`}
                  onClick={() => setDelivery('all')}
                >
                  Mọi phiên bản
                </button>
                {Object.entries(DELIVERY_LABELS).map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    className={`fw-filter-select-chip ${delivery === k ? 'is-selected' : ''}`}
                    onClick={() => setDelivery(k)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="fw-filter-drawer-footer">
              <button
                type="button"
                className="fw-button"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Áp dụng bộ lọc
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="fw-text-button"
                  onClick={() => {
                    clearAllFilters();
                    setFilterDrawerOpen(false);
                  }}
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </WorldPanel>
      )}

      {/* Digital Fitting Drawer Modal */}
      {fittingDrawerOpen && (
        <WorldPanel title="Phòng thử đồ Digital" onClose={() => setFittingDrawerOpen(false)}>
          <div className="fw-fitting-modal-content">
            <div className="fw-fitting-mirror">
              <AvatarRenderer
                role="fan"
                size="preview"
                appearance={state.fanProfile.avatarPreset}
                displayName={state.fanProfile.displayName}
                accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
                digitalLook={previewLook}
              />
            </div>
            <h3>{trying ? trying.title : 'Chọn đồ để thử trên avatar'}</h3>
            <p className="fw-muted">
              {trying
                ? owned
                  ? 'Bạn đã sở hữu bản digital này trong tủ đồ.'
                  : 'Đang thử · Chưa sở hữu · Chưa đổi diện mạo đã lưu'
                : 'Bấm "Thử digital" ở bất kỳ trang phục hoặc lightstick nào để xem trước diện mạo.'}
            </p>
            {trying && (
              <div className="fw-fitting-modal-buttons">
                {owned ? (
                  <button
                    type="button"
                    className="fw-button"
                    onClick={() => dispatch({ type: 'EQUIP_DIGITAL_PRODUCT', productId: trying.id })}
                  >
                    <Check size={16} /> Mặc và lưu
                  </button>
                ) : (
                  <button
                    type="button"
                    className="fw-button"
                    onClick={() => {
                      setFittingDrawerOpen(false);
                      openProduct(trying.id);
                    }}
                  >
                    Xem bản digital <ArrowRight size={15} />
                  </button>
                )}
                <button
                  type="button"
                  className="fw-text-button"
                  onClick={() => setTrying(null)}
                >
                  <X size={15} /> Bỏ thử
                </button>
              </div>
            )}
            <div className="fw-fitting-modal-links">
              <Link to="/me?panel=wardrobe" className="fw-text-button">
                Về tủ đồ cá nhân trong My Space →
              </Link>
            </div>
          </div>
        </WorldPanel>
      )}

      {/* Format Explainer Modal */}
      {showFormatModal && (
        <WorldPanel title="Hình thức sản phẩm tại VieSHOP" onClose={() => setShowFormatModal(false)}>
          <div className="fw-format-explainer-modal">
            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Truck size={20} className="fw-format-icon" />
                <div>
                  <h3>Hàng thật (Physical)</h3>
                  <small>Giao nhận tận nơi theo tiến độ sản xuất</small>
                </div>
              </div>
              <p>Áo thun, nón vải, đĩa CD/Vinyl, băng cassette và lightstick chính thức được gia công và gửi tận nơi theo từng đợt đặt trước hoặc sẵn kho. Không tự động mở khóa trang phục digital cho avatar.</p>
            </div>

            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Monitor size={20} className="fw-format-icon" />
                <div>
                  <h3>Digital (Kỹ thuật số)</h3>
                  <small>Vật phẩm 2.5D cho avatar VieWorld</small>
                </div>
              </div>
              <p>Vật phẩm kỹ thuật số thiết kế riêng cho không gian VieWorld. Kích hoạt trực tiếp vào Tủ đồ cá nhân My Space và hiển thị khi bạn tham gia các buổi Live, Concert hoặc dạo quanh thế giới. Không giao hàng vật lý.</p>
            </div>

            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Package size={20} className="fw-format-icon" />
                <div>
                  <h3>Gói Duo Set (Hàng thật + Digital)</h3>
                  <small>Trọn vẹn ngoài đời thực & trong world</small>
                </div>
              </div>
              <p>Combo gồm cả sản phẩm vật lý nhận qua giao nhận thực tế VÀ mở khóa ngay phiên bản trang phục kỹ thuật số tương ứng cho avatar của bạn trong VieWorld.</p>
            </div>
          </div>
        </WorldPanel>
      )}

      {/* Product Detail Modal */}
      {selectedId && (
        <WorldPanel title={selected?.title || 'Không tìm thấy món đồ'} onClose={close}>
          {selected ? (
            <>
              <div className="fw-product-photo-tabs">
                <button
                  aria-pressed={!digitalPhoto}
                  onClick={() => setDigitalPhoto(false)}
                >
                  {selected.delivery === 'digital' ? 'Ảnh vật phẩm digital' : 'Ảnh hàng thật'}
                </button>
                {selected.digitalImage && selected.delivery !== 'digital' && (
                  <button
                    aria-pressed={digitalPhoto}
                    onClick={() => setDigitalPhoto(true)}
                  >
                    Bản digital tương ứng
                  </button>
                )}
              </div>

              <div className="fw-product-detail-art">
                <MerchArt product={selected} digital={digitalPhoto} />
              </div>
              <small className="fw-muted">Thiết kế mẫu · Digital được thể hiện riêng với hàng thật</small>

              {variants.length > 1 && (
                <div className="fw-variant-selector" aria-label="Chọn phiên bản sản phẩm">
                  {variants.map(p => (
                    <button
                      key={p.id}
                      aria-pressed={p.id === selected.id}
                      onClick={() => openProduct(p.id)}
                    >
                      {DELIVERY_LABELS[p.delivery || 'physical']}
                    </button>
                  ))}
                </div>
              )}

              <p className="fw-eyebrow">
                {state.worlds[selected.worldId]?.name} / {DELIVERY_LABELS[selected.delivery || 'physical']}
                {selected.releaseType === 'pre_order' ? ' · PRE-ORDER' : ''}
              </p>

              <h3 className="fw-product-price">
                {selected.previewOnly ? 'Mẫu trưng bày · Chưa mở bán' : money(selected.priceVND)}
              </h3>

              {/* Fulfillment clarity badge */}
              <div className="fw-fulfillment-badge">
                {selected.delivery === 'physical' && (
                  <p><Truck size={15} /><span>{selected.estimatedShipping || 'Dự kiến giao hàng: Tháng 10/2026'}{selected.batchLabel ? ` (${selected.batchLabel})` : ''}</span></p>
                )}
                {selected.delivery === 'digital' && (
                  <p><Monitor size={15} /><span>Kích hoạt ngay vào My Space & Tủ đồ cá nhân sau khi xác nhận</span></p>
                )}
                {selected.delivery === 'bundle' && (
                  <p><Package size={15} /><span>Giao hàng vật lý + Mở khóa trang phục digital cho avatar</span></p>
                )}
              </div>

              {selected.description && <p>{selected.description}</p>}

              <h3>Bạn nhận được</h3>
              <ul className="fw-includes">
                {(selected.includes || ['1 món merchandise vật lý trong bản mô phỏng', 'Không kèm vật phẩm digital']).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {selected.sizes && (
                <label className="fw-size-select">
                  Kích cỡ{' '}
                  <select
                    aria-label="Kích cỡ"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                  >
                    <option value="">Chọn size</option>
                    {selected.sizes.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}

              {tryProduct && (
                <div className="fw-dialog-tryon-box">
                  <button
                    className="fw-text-button"
                    onClick={() => setTrying(trying ? null : tryProduct)}
                  >
                    Thử lên avatar · không mua
                  </button>
                  {trying && dressingRoom(true)}
                </div>
              )}

              {!selected.previewOnly && (
                <p>{unavailable ? 'Món này hiện đã hết hàng.' : `Còn ${selected.stockCount} suất trong danh mục mô phỏng.`}</p>
              )}

              {locked && (
                <p className="fw-locked">
                  <Lock size={17} /> Món này cần quyền lợi hợp lệ. <Link to="/me?panel=membership">Xem quyền lợi</Link>
                </p>
              )}

              {selected.previewOnly ? (
                <Link
                  className="fw-button fw-buy"
                  to={selected.category === 'membership' ? '/me?panel=membership' : '/worlds/artist-a?panel=concerts'}
                >
                  {selected.category === 'membership' ? 'Xem chương trình hội viên' : 'Xem lịch concert · Không phải mua vé'}
                </Link>
              ) : (
                <button
                  className="fw-button fw-buy"
                  onClick={buy}
                  disabled={!!unavailable || locked || !!(selected.sizes && !size)}
                >
                  {unavailable ? 'Hết hàng' : locked ? 'Chưa đủ điều kiện' : selected.sizes && !size ? 'Chọn kích cỡ trước' : 'Thêm vào giỏ đồ'}
                  <ShoppingBag size={18} />
                </button>
              )}

              {added && !state.lastError && (
                <p role="status" className="v5-added">
                  Đã thêm vào giỏ đồ. <Link to="/cart">Xem giỏ & chốt đơn →</Link>
                </p>
              )}

              {state.lastError && <p role="alert">{state.lastError.message}</p>}

              <p className="fw-muted">
                Trải nghiệm an toàn: Không thu tiền thật. Thử đồ để xem trước diện mạo trên avatar trước khi quyết định thêm vào bộ sưu tập cá nhân.
              </p>

              <details className="fw-product-terms">
                <summary>Giao nhận, đổi trả & quyền sử dụng</summary>
                <p>
                  Hướng dẫn trải nghiệm: Trong phiên bản thử nghiệm, bạn không cần nhập thông tin thẻ hay địa chỉ thực tế. Vật phẩm digital sẽ được thêm vào tủ đồ ngay khi nhận; vật phẩm vật lý được mô phỏng theo dõi qua hành trình đơn hàng {shopTitle}.
                </p>
              </details>

              {ownOrders.filter(o => o.productId === selected.id).map(o => (
                <Link key={o.id} className="fw-destination" to={`/orders/${o.id}`}>
                  <Package />
                  <div>
                    <strong>Đơn của bạn</strong>
                    <p>{ORDER_LABELS[o.status]}</p>
                  </div>
                  <ArrowRight />
                </Link>
              ))}
            </>
          ) : (
            <p>Món này không còn trong danh mục. Đóng để tiếp tục xem cửa hàng.</p>
          )}
        </WorldPanel>
      )}
    </div>
  );
}
