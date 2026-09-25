import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Lock, Package, Search, Heart, Truck, Monitor, Check, X, SlidersHorizontal, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { WorldPanel } from '../components/WorldPanel';
import { ProductVisual } from '../components/ProductVisual';
import { Product } from '../domain/types';
import { DELIVERY_LABELS, MERCH_IMAGE_ROOT, ownedDigitalLook, ownsDigitalProduct } from '../world/merchCatalog';
import { ORDER_LABELS } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { getTenantConfig } from '../domain/tenantConfig';
import { availableShopCategories, getPreviewCapabilities, previewEdition, productBadge, productPrice, shopCategory, SHOP_CATEGORY_LABELS } from '../world/shopPresentation';


interface ProductFamily {
  key: string;
  title: string;
  worldId: string;
  artistName: string;
  variants: Product[];
  primaryProduct: Product;
  previewOnly: boolean;
}

function MerchArt({ product, digital = false, eager = false }: { product: Product; digital?: boolean; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = digital ? product.digitalImage : product.image;
  useEffect(() => setFailed(false), [image]);
  return image && !failed ? (
    <img
      src={`${MERCH_IMAGE_ROOT}/${image}.png`}
      alt={`${product.title} · ${digital || product.delivery === 'digital' ? 'minh họa digital' : 'thiết kế hàng thật'} · thiết kế kỷ niệm`}
      loading={eager ? 'eager' : 'lazy'}
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
  const availability = params.get('availability') || 'all';
  const preorderOnly = params.get('preorder') === 'true';
  const previewOnly = params.get('preview') === 'true';
  const minPrice = Number(params.get('min') || 0);
  const maxPrice = Number(params.get('max') || 0);

  const [size, setSize] = useState('');
  const [digitalPhoto, setDigitalPhoto] = useState(false);
  const [trying, setTrying] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [fittingDrawerOpen, setFittingDrawerOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'avatar' | 'room'>('avatar');
  const [showFormatModal, setShowFormatModal] = useState(false);
  const openedHere = useRef(false);

  const selectedId = params.get('product');
  const selected = selectedId ? state.products[selectedId] : undefined;
  const world = worldId ? state.worlds[worldId] : undefined;
  const allProducts = useMemo(() => Object.values(state.products).filter(product => product.tenantId === state.activeTenantId), [state.products, state.activeTenantId]);
  const categories = availableShopCategories(allProducts);
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
    setParams(next, { replace: key === 'q' || key === 'min' || key === 'max' });
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
    next.delete('delivery');
    next.delete('saved');
    next.delete('availability');
    next.delete('preorder');
    next.delete('preview');
    next.delete('min');
    next.delete('max');
    next.delete('sort');
    next.delete('category');
    setParams(next);
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

  const cartCount = (state.cart || []).reduce((sum, item) => sum + item.quantity, 0);
  const eligible = selected?.requiredBenefitId ? state.benefits[selected.requiredBenefitId] : undefined;
  const locked = !!selected?.requiredBenefitId && (!eligible || !['eligible', 'claimed'].includes(eligible.status));
  const unavailable = selected && (!selected.isAvailable || selected.stockCount <= 0);
  const variants = selected ? allProducts.filter(p => (p.familyId || p.id) === (selected.familyId || selected.id)) : [];
  const digitalTwin = (p: Product) => previewEdition(p, allProducts);
  const tryProduct = selected && getPreviewCapabilities(selected, allProducts);
  const previewEditionProduct = trying && digitalTwin(trying);
  const previewCapabilities = trying && getPreviewCapabilities(trying, allProducts);
  const previewLook = previewEditionProduct?.digitalSlot ? { ...ownedDigitalLook(state), [previewEditionProduct.digitalSlot]: previewEditionProduct.digitalItemId } : ownedDigitalLook(state);
  const owned = !!previewEditionProduct && ownsDigitalProduct(state, previewEditionProduct);

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
      const primary = vars.find(v => v.delivery === 'physical' && v.isAvailable && v.stockCount > 0)
        || vars.find(v => v.isAvailable && v.stockCount > 0)
        || vars.find(v => v.delivery === 'physical')
        || vars[0];
      const isPreview = vars.every(v => v.previewOnly);

      families.push({
        key,
        title: primary.title,
        worldId: primary.worldId || 'artist-a',
        artistName: state.worlds[primary.worldId]?.name || 'VieWorld',
        variants: vars,
        primaryProduct: primary,
        previewOnly: isPreview,
      });
    }
    return families;
  }, [allProducts, state.worlds]);

  // Filter and sort product families
  const filteredFamilies = useMemo(() => {
    return productFamilies.filter(fam => {
      if (filter !== 'all' && fam.worldId !== filter) return false;
      if (category !== 'all' && shopCategory(fam.primaryProduct) !== category) return false;
      if (delivery !== 'all' && !fam.variants.some(v => (v.delivery || 'physical') === delivery)) return false;
      if (savedOnly && !fam.variants.some(v => saved.includes(v.id))) return false;
      if (preorderOnly && !fam.variants.some(v => v.releaseType === 'pre_order')) return false;
      if (previewOnly && !fam.variants.some(v => { const capabilities = getPreviewCapabilities(v, allProducts); return capabilities.avatar || capabilities.room; })) return false;
      if (availability === 'available' && (fam.previewOnly || !fam.primaryProduct.isAvailable || fam.primaryProduct.stockCount <= 0)) return false;
      if (availability === 'sold-out' && (fam.previewOnly || (fam.primaryProduct.isAvailable && fam.primaryProduct.stockCount > 0))) return false;
      if (availability === 'concept' && !fam.previewOnly) return false;
      if (Number.isFinite(minPrice) && minPrice > 0 && fam.primaryProduct.priceVND < minPrice) return false;
      if (Number.isFinite(maxPrice) && maxPrice > 0 && fam.primaryProduct.priceVND > maxPrice) return false;
      if (query && !matchesVietnameseQuery(fam.title, query) && !fam.variants.some(v => matchesVietnameseQuery(v.title, query))) return false;
      return true;
    }).sort((a, b) => {
      if (sort === 'low') return a.primaryProduct.priceVND - b.primaryProduct.priceVND;
      if (sort === 'high') return b.primaryProduct.priceVND - a.primaryProduct.priceVND;
      return Number(!!b.primaryProduct.familyId) - Number(!!a.primaryProduct.familyId);
    });
  }, [productFamilies, filter, category, delivery, savedOnly, query, sort, saved, preorderOnly, previewOnly, availability, minPrice, maxPrice, allProducts]);

  const hasActiveFilters = !!query || delivery !== 'all' || savedOnly || availability !== 'all' || preorderOnly || previewOnly || minPrice > 0 || maxPrice > 0;
  const activeFilterCount = (query ? 1 : 0) + (delivery !== 'all' ? 1 : 0) + (savedOnly ? 1 : 0) + (availability !== 'all' ? 1 : 0) + (preorderOnly ? 1 : 0) + (previewOnly ? 1 : 0) + (minPrice > 0 || maxPrice > 0 ? 1 : 0);
  const heroWorldId = filter === 'all' ? 'artist-a' : filter;
  const heroFamilies = productFamilies.filter(family => family.worldId === heroWorldId && family.primaryProduct.image && !family.previewOnly).slice(0, 4);
  const heroName = filter === 'all' ? 'STAR CLUB · HANOI 2026' : `${state.worlds[filter]?.name || 'ARTIST WORLD'} · VIESHOP`;

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

  return (
    <div className="fw-shop-page fw-shop-v2">
      <header className="fw-shop-story vw-shop-hero">
        <div className="fw-shop-story-copy">
          <p className="fw-eyebrow">{heroName}</p>
          <h1>Ngoài đời. Trong world.<br /><em>Vẫn là điều mình thích.</em></h1>
          <p>Những món gắn với âm nhạc và kỷ niệm — chọn đúng phiên bản bạn muốn mang về.</p>
          <button type="button" className="fw-hero-discover" onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
            Khám phá bộ sưu tập <ArrowRight size={17} />
          </button>
        </div>
        <div className="vw-shop-hero-art" aria-label={`Một vài món từ ${heroName}`}>
          {heroFamilies.map(family => <div key={family.key}><MerchArt product={family.primaryProduct} eager /></div>)}
        </div>
      </header>

      <nav className="fw-shop-categories" aria-label={`Danh mục ${shopTitle}`}>
        {categories.map(id => (
          <button
            key={id}
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {SHOP_CATEGORY_LABELS[id]}
          </button>
        ))}
      </nav>

      <div className="fw-fitting-strip vw-shop-try-strip" aria-label="Thử trong My Space">
        <img src="/images/myspace-room-v2.png" alt="Một góc phòng My Space" loading="lazy" />
        <div className="fw-fitting-strip-text"><strong>Thử trong My Space</strong><span>Xem vật phẩm này trên avatar hoặc trong phòng của bạn trước khi chọn.</span></div>
        <button type="button" className="fw-fitting-strip-btn" onClick={() => { updateParam('preview', 'true'); document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>Xem món có thể thử <ArrowRight size={16}/></button>
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

            <Link
              to="/cart"
              className="fw-button fw-shop-cart-link"
              aria-label={`Mở giỏ hàng${cartCount > 0 ? `, ${cartCount} món` : ''}`}
            >
              <ShoppingBag size={15} />
              <span>Giỏ hàng</span>
              {cartCount > 0 && <span className="vw-shop-cart-count">{cartCount}</span>}
            </Link>
          </div>

          <div className="vw-shop-artist-row"><span>Nghệ sĩ</span><button type="button" aria-pressed={filter === 'all'} onClick={() => worldId ? navigate('/shop') : setFilter('all')}>Tất cả</button>{Object.values(state.worlds).filter(w => w.type === 'artist' && w.tenantId === state.activeTenantId && allProducts.some(p => p.worldId === w.id)).map(w => <button key={w.id} type="button" aria-pressed={filter === w.id} onClick={() => worldId ? navigate(`/shop?artist=${w.id}`) : setFilter(w.id)}>{w.name}</button>)}{filter !== 'all' && <button type="button" className="vw-shop-scope" onClick={() => navigate('/shop')} aria-label={`Bỏ lọc nghệ sĩ ${state.worlds[filter]?.name || filter}`}>Bỏ lọc nghệ sĩ <X size={14}/></button>}</div>

          {/* Applied filters strip */}
          {hasActiveFilters && (
            <div className="fw-applied-filters" aria-label="Bộ lọc đang áp dụng">
              <span className="fw-applied-label">Đang chọn:</span>
              {query && (
                <button type="button" className="fw-applied-chip" onClick={() => setQuery('')}>
                  "{query}" <X size={12} />
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
            <Link to="/me?section=collection" className="vw-shop-owned-link">Đồ của tôi <ArrowRight size={14}/></Link>
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
              const badge = productBadge(repProduct);
              const preview = getPreviewCapabilities(repProduct, allProducts);
              const price = productPrice(repProduct);

              return (
                <article className="fw-product-tile" key={fam.key}>
                  <button
                    className="fw-product"
                    onClick={() => openProduct(repProduct.id)}
                  >
                    <div className="fw-product-art">
                      <MerchArt product={repProduct} />
                      {badge && <span className="fw-product-delivery-pill">{badge}</span>}
                    </div>
                    <small className="fw-product-subline">
                      {fam.artistName}{repProduct.batchLabel && repProduct.releaseType !== 'pre_order' && !repProduct.previewOnly ? ` · ${repProduct.batchLabel}` : ''}
                    </small>
                    <h2>{delivery === 'all' ? fam.title : repProduct.title}</h2>
                    {fam.previewOnly ? <strong>Xem thông tin</strong> : <p className="vw-shop-card-price">{price.compareAt && <del>{price.compareAt}</del>}<strong>{price.current}</strong></p>}
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
                    {(preview.avatar || preview.room) && (
                      <button
                        type="button"
                        className="fw-text-button fw-product-try"
                        onClick={() => {
                          setTrying(repProduct);
                          setPreviewTab(preview.avatar ? 'avatar' : 'room');
                          setFittingDrawerOpen(true);
                        }}
                      >
                        Thử trong My Space
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
              <h3>Nghệ sĩ</h3>
              <div className="fw-filter-chip-grid">
                <button
                  type="button"
                  className={`fw-filter-select-chip ${filter === 'all' ? 'is-selected' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tất cả nghệ sĩ
                </button>
                {Object.values(state.worlds).filter(w => w.type === 'artist' && w.tenantId === state.activeTenantId && allProducts.some(p => p.worldId === w.id)).map(w => (
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

            <div className="fw-filter-group"><h3>Tình trạng</h3><div className="fw-filter-chip-grid">{[['all', 'Tất cả'], ['available', 'Có thể chọn'], ['sold-out', 'Hết hàng'], ['concept', 'Concept']].map(([key, label]) => <button key={key} type="button" className={`fw-filter-select-chip ${availability === key ? 'is-selected' : ''}`} onClick={() => updateParam('availability', key, 'all')}>{label}</button>)}</div></div>

            <div className="vw-shop-filter-options"><label><input type="checkbox" checked={preorderOnly} onChange={event => updateParam('preorder', event.target.checked ? 'true' : 'false', 'false')}/>Chỉ xem pre-order</label><label><input type="checkbox" checked={previewOnly} onChange={event => updateParam('preview', event.target.checked ? 'true' : 'false', 'false')}/>Có thể thử trong My Space</label></div>

            <div className="vw-shop-filter-price"><label>Giá từ (₫)<input type="number" min="0" step="10000" value={params.get('min') || ''} onChange={event => updateParam('min', event.target.value, '')}/></label><label>Đến (₫)<input type="number" min="0" step="10000" value={params.get('max') || ''} onChange={event => updateParam('max', event.target.value, '')}/></label></div>

            <label className="vw-shop-filter-sort">Sắp xếp<select aria-label="Sắp xếp sản phẩm" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Nổi bật</option><option value="low">Giá tăng dần</option><option value="high">Giá giảm dần</option></select></label>

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

      {fittingDrawerOpen && trying && previewCapabilities && (
        <WorldPanel title="Thử trong My Space" onClose={() => setFittingDrawerOpen(false)}>
          <div className="vw-shop-preview">
            <h3>{trying.title}</h3>
            {previewCapabilities.avatar && previewCapabilities.room && <div className="vw-shop-preview-tabs"><button type="button" aria-pressed={previewTab === 'avatar'} onClick={() => setPreviewTab('avatar')}>Trên avatar</button><button type="button" aria-pressed={previewTab === 'room'} onClick={() => setPreviewTab('room')}>Trong phòng</button></div>}
            {previewTab === 'avatar' && previewCapabilities.avatar ? <div className="vw-shop-preview-avatar"><AvatarRenderer role="fan" size="preview" appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} accessoryId={state.fanProfile.wardrobeChoice?.accessoryId} digitalLook={previewLook}/></div> : <div className="vw-shop-preview-room"><img src="/images/myspace-room-v2.png" alt="Phòng My Space"/><div className={`vw-shop-preview-object ${trying.category === 'album' ? 'is-album' : trying.category === 'ticket' ? 'is-ticket' : /lightstick/.test(trying.image || '') ? 'is-lightstick' : 'is-clothing'}`}><MerchArt product={trying}/></div></div>}
            <p className="fw-muted">Chỉ là hình xem trước. Bản hàng thật không tự mở khóa đồ digital, trừ khi phiên bản đã chọn ghi rõ kèm digital.</p>
            {previewTab === 'avatar' && owned && previewEditionProduct && <button type="button" className="fw-button" onClick={() => dispatch({ type: 'EQUIP_DIGITAL_PRODUCT', productId: previewEditionProduct.id })}><Check size={16}/>Mặc và lưu</button>}
            <button type="button" className="fw-text-button" onClick={() => setFittingDrawerOpen(false)}>Quay lại món đồ</button>
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
      {selectedId && !fittingDrawerOpen && (
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
              <small className="fw-muted">Hình minh họa của phiên bản đang chọn; bản digital được thể hiện riêng với hàng thật.</small>

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

              <h3 className="fw-product-price">{selected.previewOnly ? 'Concept · Chưa mở bán' : <>{productPrice(selected).compareAt && <del className="vw-shop-old-price">{productPrice(selected).compareAt}</del>}{productPrice(selected).current}</>}</h3>

              {/* Fulfillment clarity badge */}
              <div className="fw-fulfillment-badge">
                {selected.delivery === 'physical' && (
                  <p><Truck size={15} /><span>{selected.estimatedShipping || 'Xem thông tin giao nhận khi chốt đơn.'}{selected.batchLabel ? ` (${selected.batchLabel})` : ''}</span></p>
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

              {tryProduct && (tryProduct.avatar || tryProduct.room) && <button type="button" className="fw-text-button vw-shop-detail-preview" onClick={() => { setTrying(selected); setPreviewTab(tryProduct.avatar ? 'avatar' : 'room'); setFittingDrawerOpen(true); }}>Thử trong My Space · không mua <ArrowRight size={16}/></button>}

              {!selected.previewOnly && unavailable && <p>Món này hiện đã hết hàng.</p>}

              {locked && (
                <p className="fw-locked">
                  <Lock size={17} /> Món này cần quyền lợi hợp lệ. <Link to="/me?panel=membership">Xem quyền lợi</Link>
                </p>
              )}

              {selected.previewOnly ? <p className="vw-shop-concept-note">Đây là thiết kế concept để xem trước, chưa thể thêm vào giỏ.{selected.category === 'membership' && <> <Link to="/me?panel=membership">Xem chương trình hội viên →</Link></>}</p> : (
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
                Giao dịch thử nghiệm, không thu tiền thật. Vật phẩm chỉ vào Bộ sưu tập sau khi đơn được bàn giao.
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
