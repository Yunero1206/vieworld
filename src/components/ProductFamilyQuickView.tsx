import { useState, useEffect, useRef } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Product } from '../domain/types';
import { ProductFamily } from '../world/moments';
import { MERCH_IMAGE_ROOT, DELIVERY_LABELS } from '../world/merchCatalog';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { useApp } from '../context/AppContext';
import { checkProductEligibility } from '../world/commerce';

interface ProductFamilyQuickViewProps {
  family: ProductFamily | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, quantity?: number) => boolean | void;
}

export function ProductFamilyQuickView({
  family,
  isOpen,
  onClose,
  onAddToCart,
}: ProductFamilyQuickViewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(isOpen, onClose, panelRef);

  const { state } = useApp();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Sync selected variant when family changes
  useEffect(() => {
    if (family && family.variants.length > 0) {
      const defaultVariant = family.variants[0];
      setSelectedVariantId(defaultVariant.id);
      setSelectedSize(defaultVariant.sizes?.[0] || '');
      setQuantity(1);
      setAddedNotice(false);
    }
  }, [family]);

  if (!isOpen || !family) return null;

  const currentVariant = family.variants.find(v => v.id === selectedVariantId) || family.variants[0];
  const isDigital = currentVariant?.delivery === 'digital';
  const isBundle = currentVariant?.delivery === 'bundle';
  const hasSizes = (currentVariant?.sizes?.length ?? 0) > 0;
  const totalPrice = (currentVariant?.priceVND || 0) * quantity;
  const eligibility = checkProductEligibility(state, currentVariant, selectedSize || undefined, quantity);

  const handleVariantSelect = (variant: Product) => {
    setSelectedVariantId(variant.id);
    if (variant.sizes?.length) {
      setSelectedSize(variant.sizes[0]);
    } else {
      setSelectedSize('');
    }
    if (variant.delivery === 'digital') {
      setQuantity(1);
    }
    setAddedNotice(false);
  };

  const handleAdd = () => {
    if (!currentVariant || !eligibility.eligible) return;
    const result = onAddToCart(currentVariant, selectedSize || undefined, quantity);
    if (result !== false) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };


  const displayImage = currentVariant?.image || family.image;

  return (
    <div className="moments-drawer-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="moments-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết ${family.title}`}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <header className="moments-drawer-header">
          <div className="moments-drawer-title-group">
            <span className="moments-drawer-eyebrow">
              {family.variantCount > 1 ? `${family.variantCount} phiên bản` : 'Phiên bản chính thức'}
            </span>
            <h2 className="moments-drawer-title">{family.title}</h2>
          </div>
          <button
            type="button"
            className="moments-drawer-close-btn"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </header>

        <div className="moments-drawer-body">
          {/* Product Image */}
          <div className="moments-drawer-media">
            <img
              src={`${MERCH_IMAGE_ROOT}/${displayImage}.png`}
              alt={currentVariant?.title || family.title}
              className="moments-drawer-img"
            />
            {currentVariant?.delivery && (
              <span className={`moments-delivery-tag moments-tag-${currentVariant.delivery}`}>
                {DELIVERY_LABELS[currentVariant.delivery] || currentVariant.delivery}
              </span>
            )}
          </div>

          {/* Description */}
          {family.description && (
            <p className="moments-drawer-desc">{family.description}</p>
          )}

          {/* Variant Selector */}
          <div className="moments-drawer-section">
            <label className="moments-field-label">Chọn phiên bản</label>
            <div className="moments-variant-options" role="radiogroup" aria-label="Phiên bản sản phẩm">
              {family.variants.map(v => {
                const isSelected = v.id === currentVariant.id;
                const label = DELIVERY_LABELS[v.delivery || 'physical'] || 'Hàng thật';
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`moments-variant-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleVariantSelect(v)}
                  >
                    <div className="moments-variant-radio-dot">
                      {isSelected && <span className="moments-radio-inner" />}
                    </div>
                    <div className="moments-variant-text">
                      <strong>{label}</strong>
                      {v.batchLabel && <span className="moments-batch-sub">{v.batchLabel}</span>}
                    </div>
                    <span className="moments-variant-price">
                      {v.priceVND.toLocaleString('vi-VN')} ₫
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector (If physical or bundle) */}
          {hasSizes && !isDigital && (
            <div className="moments-drawer-section">
              <label className="moments-field-label">Kích thước</label>
              <div className="moments-size-pills" role="radiogroup" aria-label="Kích thước sản phẩm">
                {currentVariant.sizes!.map(size => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    className={`moments-size-pill ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Digital / Bundle Notes */}
          {isDigital && (
            <div className="moments-drawer-note moments-note-digital">
              <span>Trang phục & phụ kiện kích hoạt trực tiếp vào My Space sau xác nhận. Tương thích với avatar VieWorld.</span>
            </div>
          )}

          {isBundle && (
            <div className="moments-drawer-note moments-note-bundle" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Kèm vật phẩm digital:</strong> Hàng vật lý và phiên bản dùng trong My Space. Vật phẩm được thêm vào Bộ sưu tập khi đơn hoàn tất.</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="moments-drawer-section moments-quantity-row">
            <label className="moments-field-label">Số lượng</label>
            <div className="moments-quantity-stepper">
              <button
                type="button"
                className="moments-qty-btn"
                disabled={quantity <= 1 || isDigital}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <span className="moments-qty-value">{quantity}</span>
              <button
                type="button"
                className="moments-qty-btn"
                disabled={quantity >= 10 || isDigital}
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer with CTA */}
        <footer className="moments-drawer-footer">
          <div className="moments-drawer-total">
            <span className="moments-total-label">Tạm tính:</span>
            <strong className="moments-total-price">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <button
              type="button"
              className="moments-drawer-add-btn"
              onClick={handleAdd}
              disabled={!currentVariant || !eligibility.eligible}
              title={!eligibility.eligible ? eligibility.reason : undefined}
            >
              {addedNotice ? (
                <>
                  <Check size={16} />
                  <span>Đã thêm vào giỏ</span>
                </>
              ) : (currentVariant?.stockCount ?? 0) <= 0 ? (
                <span>Hết hàng</span>
              ) : hasSizes && !selectedSize ? (
                <span>Chọn kích cỡ</span>
              ) : !eligibility.eligible ? (
                <span>Chưa đủ điều kiện</span>
              ) : (
                <span>Thêm vào giỏ</span>
              )}
            </button>
            {!eligibility.eligible && eligibility.reason && (
              <span style={{ fontSize: '11px', color: '#DC2626', maxWidth: '220px', textAlign: 'right' }}>
                {eligibility.reason}
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
