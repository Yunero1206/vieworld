import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Lock, Package, Heart, Truck, Monitor, Check, X, SlidersHorizontal, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { DisplayRoomScene } from '../components/DisplayRoom';
import { productRoomPreviewItem } from '../world/display';
import { isDemoSignedIn } from '../world/account';
import { WorldPanel } from '../components/WorldPanel';
import { ProductVisual } from '../components/ProductVisual';
import { Product } from '../domain/types';
import { DELIVERY_LABELS, DELIVERY_SUMMARIES, ownedDigitalLook, ownsDigitalProduct, productDisplayTitle } from '../world/merchCatalog';
import { merchImageUrl } from '../world/merchImages';
import { ORDER_LABELS } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { SearchCombobox } from '../components/SearchCombobox';
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
      src={merchImageUrl(image)}
      alt={`${productDisplayTitle(product.title)}, ${digital || product.delivery === 'digital' ? 'bản số' : 'bản vật lý'}`}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  ) : (
    <ProductVisual productId={product.id} title={product.title} />
  );
}

export function FanShopView() {
  const { state, dispatch } = useApp();
  const signedIn = isDemoSignedIn(state);
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
  const [tryStance, setTryStance] = useState<'default' | 'cheer'>('default');
  const [showFormatModal, setShowFormatModal] = useState(false);
  const openedHere = useRef(false);

  const selectedId = params.get('product');
  const candidate = selectedId ? state.products[selectedId] : undefined;
  const selected = candidate?.tenantId === state.activeTenantId ? candidate : undefined;
  const world = worldId ? state.worlds[worldId] : undefined;
  const allProducts = useMemo(() => Object.values(state.products).filter(product => product.tenantId === state.activeTenantId), [state.products, state.activeTenantId]);
  const categories = availableShopCategories(allProducts);
  const ownOrders = Object.values(state.orders).filter(o => o.tenantId === state.activeTenantId && o.fanId === state.fanProfile.id);
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
  const basePreviewLook = signedIn ? ownedDigitalLook(state) : {};
  const previewLook = previewEditionProduct?.digitalSlot ? { ...basePreviewLook, [previewEditionProduct.digitalSlot]: previewEditionProduct.digitalItemId } : basePreviewLook;
  const owned = signedIn && !!previewEditionProduct && ownsDigitalProduct(state, previewEditionProduct);

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
          <p>Những món gắn với âm nhạc và kỷ niệm. Chọn phiên bản hợp với bạn.</p>
          <button type="button" className="fw-hero-discover" onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
            Khám phá bộ sưu tập <ArrowRight size={17} />
          </button>
        </div>
        <div className="vw-shop-hero-art" aria-label={`Một vài món từ ${heroName}`}>
          {heroFamilies.map(family => <div key={family.key}><MerchArt product={family.primaryProduct} eager /></div>)}
        </div>
      </header>


      <div className="fw-shop-layout fw-shop-fullwidth" id="shop-catalog">
        <section>
          <div className="fw-shop-toolbar">
            <SearchCombobox className="fw-shop-search-box" value={query} onChange={setQuery}
              label="Tìm sản phẩm" placeholder="Tìm sản phẩm, album, lightstick…"
              suggestions={productFamilies.filter(family => filter === 'all' || family.worldId === filter).map(family => ({ id: family.primaryProduct.id, keywords: family.artistName, label: family.title, context: `${family.artistName} · ${SHOP_CATEGORY_LABELS[shopCategory(family.primaryProduct)]}` }))}
              onSelect={item => openProduct(item.id)} />

            <button
              type="button"
              className={`fw-text-button fw-filter-btn ${hasActiveFilters ? 'is-active' : ''}`}
              onClick={() => setFilterDrawerOpen(true)}
              aria-label="Bộ lọc sản phẩm"
            >
              <SlidersHorizontal size={16} />
              <span>Lọc</span>
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

          <div className="vw-shop-browse-row">
            <nav className="fw-shop-categories" aria-label={`Danh mục ${shopTitle}`}>
              {categories.map(id => <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>{SHOP_CATEGORY_LABELS[id]}</button>)}
            </nav>
            <button type="button" className="vw-shop-preview-toggle" aria-pressed={previewOnly} onClick={() => updateParam('preview', previewOnly ? 'false' : 'true')}><Monitor size={16}/>Có thể thử trong My Space</button>
          </div>
          {filter !== 'all' && <div className="vw-shop-active-scope"><button type="button" onClick={() => worldId ? navigate('/shop') : setFilter('all')} aria-label={`Bỏ lọc nghệ sĩ ${state.worlds[filter]?.name || filter}`}>{state.worlds[filter]?.name || filter}<X size={14}/></button><span>Đang xem vật phẩm của world này</span></div>}

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
            <p className="fw-catalog-count">{filteredFamilies.length} món <span>· Bản trải nghiệm</span></p>
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
                    <small className="fw-product-subline">{fam.artistName}</small>
                    <h2>{productDisplayTitle(delivery === 'all' ? fam.title : repProduct.title)}</h2>
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
          <span>Bản vật lý và bản số khác nhau thế nào?</span>
        </button>
      </div>

      <footer className="fw-shop-footnote">
        Đây là bản trải nghiệm. Hình ảnh minh họa ý tưởng; VieSHOP chưa thu tiền hay giao hàng thật.
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

            <div className="vw-shop-filter-options"><label><input type="checkbox" checked={preorderOnly} onChange={event => updateParam('preorder', event.target.checked ? 'true' : 'false', 'false')}/>Chỉ món đặt trước</label><label><input type="checkbox" checked={previewOnly} onChange={event => updateParam('preview', event.target.checked ? 'true' : 'false', 'false')}/>Có thể thử trong My Space</label></div>

            <div className="vw-shop-filter-price"><label>Giá từ (₫)<input type="number" min="0" step="10000" value={params.get('min') || ''} onChange={event => updateParam('min', event.target.value, '')}/></label><label>Đến (₫)<input type="number" min="0" step="10000" value={params.get('max') || ''} onChange={event => updateParam('max', event.target.value, '')}/></label></div>

            <label className="vw-shop-filter-sort">Sắp xếp<select aria-label="Sắp xếp sản phẩm" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Nổi bật</option><option value="low">Giá tăng dần</option><option value="high">Giá giảm dần</option></select></label>

            <div className="fw-filter-group">
              <h3>Phiên bản</h3>
              <p className="fw-filter-hint">Bạn muốn món đồ ngoài đời, trong VieWorld hay cả hai?</p>
              <div className="fw-filter-chip-grid">
                <button
                  type="button"
                  className={`fw-filter-select-chip ${delivery === 'all' ? 'is-selected' : ''}`}
                  onClick={() => setDelivery('all')}
                >
                  Tất cả
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
            {previewTab === 'avatar' && previewCapabilities.avatar ? (
              <>
                <div className="vw-shop-preview-avatar">
                  <AvatarRenderer
                    role="fan"
                    size="preview"
                    appearance={signedIn ? state.fanProfile.avatarPreset : 'original'}
                    displayName={signedIn ? state.fanProfile.displayName : 'Khách'}
                    accessoryId={signedIn ? state.fanProfile.wardrobeChoice?.accessoryId : undefined}
                    digitalLook={previewLook}
                  />
                </div>
                <div className="vw-shop-stance-controls" role="group" aria-label="Tư thế thử đồ">
                  <button
                    type="button"
                    className={`vw-shop-stance-btn ${tryStance === 'default' ? 'active' : ''}`}
                    onClick={() => setTryStance('default')}
                    aria-pressed={tryStance === 'default'}
                  >
                    Tư thế đứng chào
                  </button>
                  <button
                    type="button"
                    className={`vw-shop-stance-btn ${tryStance === 'cheer' ? 'active' : ''}`}
                    onClick={() => setTryStance('cheer')}
                    aria-pressed={tryStance === 'cheer'}
                  >
                    Vẫy lightstick
                  </button>
                </div>
              </>
            ) : (
              <div className="vw-shop-preview-room vw-room-preview-shared">
                <DisplayRoomScene compact fan={{name:signedIn ? state.fanProfile.displayName : 'Khách',appearance:signedIn ? state.fanProfile.avatarPreset : 'original',look:basePreviewLook,accessory:signedIn ? state.fanProfile.wardrobeChoice?.accessoryId : undefined}}
                  items={[productRoomPreviewItem(trying)]} onSelect={() => {}}/>
              </div>
            )}
            <p className="fw-muted">Đây là hình xem trước. Chỉ phiên bản ghi rõ kèm vật phẩm số mới mở khóa trong My Space.</p>
            {previewTab === 'avatar' && owned && previewEditionProduct && <button type="button" className="fw-button" onClick={() => dispatch({ type: 'EQUIP_DIGITAL_PRODUCT', productId: previewEditionProduct.id })}><Check size={16}/>Mặc và lưu</button>}
            <button type="button" className="fw-text-button" onClick={() => setFittingDrawerOpen(false)}>Quay lại món đồ</button>
          </div>
        </WorldPanel>
      )}

      {/* A short, shared explanation of what each edition contains. */}
      {showFormatModal && (
        <WorldPanel title="Chọn phiên bản" onClose={() => setShowFormatModal(false)}>
          <div className="fw-format-explainer-modal">
            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Truck size={20} className="fw-format-icon" />
                <div>
                  <h3>Bản vật lý</h3>
                  <small>Món đồ ngoài đời</small>
                </div>
              </div>
              <p>Áo, album hoặc lightstick để cầm và trưng bày. Không tự mở khóa vật phẩm trong VieWorld.</p>
            </div>

            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Monitor size={20} className="fw-format-icon" />
                <div>
                  <h3>Bản số</h3>
                  <small>Dùng trong VieWorld</small>
                </div>
              </div>
              <p>Vật phẩm cho avatar hoặc căn phòng của bạn. Không có món đồ được giao ngoài đời.</p>
            </div>

            <div className="fw-format-card">
              <div className="fw-format-card-header">
                <Package size={20} className="fw-format-icon" />
                <div>
                  <h3>Cả hai</h3>
                  <small>Một món ngoài đời, một vật phẩm trong VieWorld</small>
                </div>
              </div>
              <p>Gồm bản vật lý và bản số tương ứng. Xem từng sản phẩm để biết món số dùng được ở đâu.</p>
            </div>
            <p className="fw-muted">VieSHOP hiện là bản trải nghiệm, chưa thu tiền hay giao hàng thật.</p>
          </div>
        </WorldPanel>
      )}

      {/* Product Detail Modal */}
      {selectedId && !fittingDrawerOpen && (
        <WorldPanel title={selected ? productDisplayTitle(selected.title) : 'Không tìm thấy món đồ'} onClose={close} variant="product">
          {selected ? (
            <div className="fw-product-detail-layout">
              <div className="fw-product-detail-media">
              {selected.digitalImage && selected.delivery !== 'digital' && <div className="fw-product-photo-tabs" aria-label="Xem ảnh sản phẩm">
                <button
                  aria-pressed={!digitalPhoto}
                  onClick={() => setDigitalPhoto(false)}
                >
                  Ảnh sản phẩm
                </button>
                <button
                  aria-pressed={digitalPhoto}
                  onClick={() => setDigitalPhoto(true)}
                >
                  Ảnh trong My Space
                </button>
              </div>}

              <div className="fw-product-detail-art">
                <MerchArt product={selected} digital={digitalPhoto} />
              </div>
              <small className="fw-muted">{digitalPhoto ? 'Hình xem trước trong My Space; quyền sử dụng tùy phiên bản bạn chọn.' : 'Hình minh họa phiên bản đang chọn.'}</small>
              </div>

              <div className="fw-product-detail-info">
              <p className="fw-eyebrow">{state.worlds[selected.worldId]?.name}{selected.releaseType === 'pre_order' ? ' · Đặt trước' : ''}</p>
              <p className="fw-product-edition">{DELIVERY_LABELS[selected.delivery || 'physical']} <span>{DELIVERY_SUMMARIES[selected.delivery || 'physical']}</span></p>

              <h3 className="fw-product-price">{selected.previewOnly ? 'Ý tưởng · Chưa mở bán' : <>{productPrice(selected).compareAt && <del className="vw-shop-old-price">{productPrice(selected).compareAt}</del>}{productPrice(selected).current}</>}</h3>

              {variants.length > 1 && (
                <section className="fw-product-detail-section">
                <h3>Chọn phiên bản</h3>
                <div className="fw-variant-selector" aria-label="Chọn phiên bản sản phẩm">
                  {variants.map(p => (
                    <button
                      key={p.id}
                      aria-pressed={p.id === selected.id}
                      onClick={() => openProduct(p.id)}
                    >
                      <strong>{DELIVERY_LABELS[p.delivery || 'physical']}</strong>
                      <small>{productPrice(p).current}</small>
                    </button>
                  ))}
                </div>
                </section>
              )}

              {/* Fulfillment is tied to the selected edition, not to every photo. */}
              <div className="fw-fulfillment-badge">
                {selected.delivery === 'physical' && (
                  <p><Truck size={16} /><span>{selected.estimatedShipping || 'Thông tin giao nhận có trong đơn.'}</span></p>
                )}
                {selected.delivery === 'digital' && (
                  <p><Monitor size={16} /><span>Vào My Space sau khi đơn được xác nhận. Không giao hàng.</span></p>
                )}
                {selected.delivery === 'bundle' && (
                  <p><Package size={16} /><span>Bản vật lý theo đơn. Bản số vào My Space sau khi xác nhận.</span></p>
                )}
              </div>

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

              {tryProduct && (tryProduct.avatar || tryProduct.room) && <button type="button" className="fw-text-button vw-shop-detail-preview" onClick={() => { setTrying(selected); setPreviewTab(tryProduct.avatar ? 'avatar' : 'room'); setFittingDrawerOpen(true); }}>Thử trong My Space <ArrowRight size={16}/></button>}

              {!selected.previewOnly && unavailable && <p>Món này hiện đã hết hàng.</p>}

              {locked && (
                <p className="fw-locked">
                  <Lock size={17} /> Món này cần quyền lợi hợp lệ. <Link to="/me?panel=membership">Xem quyền lợi</Link>
                </p>
              )}

              {selected.previewOnly ? <p className="vw-shop-concept-note">Đây là ý tưởng để xem trước, chưa mở bán.{selected.category === 'membership' && <> <Link to="/me?panel=membership">Xem hội viên →</Link></>}</p> : (
                <button
                  className="fw-button fw-buy"
                  onClick={buy}
                  disabled={!!unavailable || locked || !!(selected.sizes && !size)}
                >
                  {unavailable ? 'Hết hàng' : locked ? 'Chưa đủ điều kiện' : selected.sizes && !size ? 'Chọn kích cỡ trước' : 'Thêm vào giỏ'}
                  <ShoppingBag size={18} />
                </button>
              )}

              {added && !state.lastError && (
                <p role="status" className="v5-added">
                  Đã thêm vào giỏ. <Link to="/cart">Xem giỏ →</Link>
                </p>
              )}

              {state.lastError && <p role="alert">{state.lastError.message}</p>}

              <details className="fw-product-includes" open>
                <summary>Phiên bản này gồm</summary>
                <ul className="fw-includes">
                  {(selected.includes || ['1 món đồ ngoài đời', 'Không kèm vật phẩm trong VieWorld']).map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              {selected.description && <p>{selected.description}</p>}

              <p className="fw-muted">
                Bản trải nghiệm, không thu tiền. Món đồ vào Bộ sưu tập khi đơn hoàn tất.
              </p>

              <details className="fw-product-terms">
                <summary>Giao nhận và quyền sử dụng</summary>
                <p>
                  Bản trải nghiệm không cần thẻ hay địa chỉ thật. Bản số vào My Space khi nhận; đơn vật lý chỉ mô phỏng hành trình giao hàng.
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
              </div>
            </div>
          ) : (
            <p>Món này không còn trong danh mục. Đóng để tiếp tục xem cửa hàng.</p>
          )}
        </WorldPanel>
      )}
    </div>
  );
}
