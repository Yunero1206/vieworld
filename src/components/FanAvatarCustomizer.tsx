import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRESET_ACCESSORIES, type FanProfile } from '../domain/types';
import { ownedDigitalLook, ownsDigitalProduct, MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { AvatarRenderer } from './AvatarRenderer';

const presets = [['original', 'Tóc nâu bồng'], ['wave', 'Tóc đen gợn'], ['bob', 'Tóc bob hạt dẻ'], ['curl', 'Tóc xoăn mềm']] as const;
type EditorTab = 'appearance' | 'outfit' | 'accessories';
type Look = NonNullable<FanProfile['digitalLook']>;

export function FanAvatarCustomizer({ onBackToRoom }: { onBackToRoom?: () => void }) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const savedPreset = state.fanProfile.avatarPreset || 'original';
  const savedAccessory = state.fanProfile.wardrobeChoice?.accessoryId || '';
  const savedLook = ownedDigitalLook(state);
  const [tab, setTab] = useState<EditorTab>('appearance');
  const [preset, setPreset] = useState<NonNullable<FanProfile['avatarPreset']>>(savedPreset);
  const [accessory, setAccessory] = useState(savedAccessory);
  const [look, setLook] = useState<Look>(savedLook);
  const [notice, setNotice] = useState('');
  const changed = preset !== savedPreset || accessory !== savedAccessory || (['shirt', 'hat', 'lightstick'] as const).some(slot => look[slot] !== savedLook[slot]);
  const digitalProducts = [...new Map(Object.values(state.products)
    .filter(product => product.digitalSlot && product.digitalItemId && ownsDigitalProduct(state, product))
    .map(product => [`${product.digitalSlot}:${product.digitalItemId}`, product])).values()];
  const shirts = digitalProducts.filter(product => product.digitalSlot === 'shirt');
  const accessories = digitalProducts.filter(product => product.digitalSlot === 'hat' || product.digitalSlot === 'lightstick');

  function reset() { setPreset(savedPreset); setAccessory(savedAccessory); setLook(savedLook); setNotice('Đã bỏ thay đổi chưa lưu.'); }
  function save() {
    if (preset !== savedPreset) dispatch({ type: 'SET_AVATAR_PRESET', preset });
    if (accessory !== savedAccessory) dispatch({ type: 'EQUIP_WARDROBE', accessoryId: accessory });
    (['shirt', 'hat', 'lightstick'] as const).forEach(slot => {
      if (look[slot] === savedLook[slot]) return;
      if (!look[slot]) dispatch({ type: 'REMOVE_DIGITAL_SLOT', slot });
      else {
        const product = digitalProducts.find(value => value.digitalSlot === slot && value.digitalItemId === look[slot]);
        if (product) dispatch({ type: 'EQUIP_DIGITAL_PRODUCT', productId: product.id });
      }
    });
    setNotice('Đã lưu avatar. Bạn sẽ xuất hiện như vậy trong VieWorld.');
  }

  return <section className="myspace-avatar-editor" aria-label="Chỉnh avatar fan">
    <header className="myspace-avatar-header"><div><h2>Hôm nay, mình là…</h2><p>Chọn cách bạn xuất hiện trong VieWorld.</p></div><button type="button" className="myspace-room-link" onClick={() => onBackToRoom ? onBackToRoom() : navigate('/me')}>Xem trong phòng ↗</button></header>
    <div className="myspace-avatar-layout">
      <div className="myspace-avatar-preview"><AvatarRenderer key={preset} appearance={preset} accessoryId={accessory} digitalLook={look} size="preview" displayName={state.fanProfile.displayName}/><span>{state.fanProfile.displayName}</span><small>{changed ? 'Xem trước · chưa lưu' : 'Diện mạo đang dùng'}</small></div>
      <div className="myspace-avatar-controls">
        <nav className="myspace-avatar-tabs" aria-label="Tùy chỉnh avatar">
          <button type="button" aria-pressed={tab === 'appearance'} onClick={() => setTab('appearance')}>Diện mạo</button>
          <button type="button" aria-pressed={tab === 'outfit'} onClick={() => setTab('outfit')}>Trang phục</button>
          <button type="button" aria-pressed={tab === 'accessories'} onClick={() => setTab('accessories')}>Phụ kiện</button>
        </nav>
        {tab === 'appearance' && <div className="myspace-avatar-panel"><h3>Kiểu tóc & biểu cảm</h3><div className="myspace-avatar-options">{presets.map(([id, label]) => <button type="button" key={id} aria-label={label} aria-pressed={preset === id} onClick={() => { setPreset(id); setNotice(''); }}><AvatarRenderer appearance={id} size="md" reducedMotion/><span>{label}</span>{preset === id && <Check size={15}/>}</button>)}</div><p>Mỗi mẫu diện mạo là một nhân vật dựng sẵn; màu tóc và khuôn mặt đi cùng mẫu để hình luôn khớp.</p></div>}
        {tab === 'outfit' && <div className="myspace-avatar-panel"><h3>Trang phục</h3><div className="myspace-avatar-options"><button type="button" aria-pressed={!look.shirt} onClick={() => setLook(value => ({ ...value, shirt: undefined }))}><AvatarRenderer appearance={preset} size="md" reducedMotion/><span>Trang phục cơ bản</span>{!look.shirt && <Check size={15}/>}</button>{shirts.map(product => <button type="button" key={product.id} aria-pressed={look.shirt === product.digitalItemId} onClick={() => setLook(value => ({ ...value, shirt: product.digitalItemId }))}><img src={`${MERCH_IMAGE_ROOT}/${product.digitalImage || product.image}.png`} alt=""/><span>{product.title.replace(' · Digital', '')}</span>{look.shirt === product.digitalItemId && <Check size={15}/>}</button>)}</div>{!shirts.length && <p>Trang phục digital đã nhận sẽ hiện ở đây. Mẫu cơ bản luôn dùng được.</p>}</div>}
        {tab === 'accessories' && <div className="myspace-avatar-panel"><h3>Phụ kiện đeo</h3><div className="myspace-avatar-options"><button type="button" aria-pressed={!accessory} onClick={() => setAccessory('')}><span className="myspace-avatar-option-symbol">○</span><span>Không đeo</span>{!accessory && <Check size={15}/>}</button>{PRESET_ACCESSORIES.map(value => <button type="button" key={value.id} aria-pressed={accessory === value.id} onClick={() => setAccessory(value.id)}><span className="myspace-avatar-option-symbol" style={{ color: value.previewColor }}>✦</span><span>{value.name}</span>{accessory === value.id && <Check size={15}/>}</button>)}</div><h3>Đầu & cầm tay</h3><div className="myspace-avatar-options">{accessories.map(product => <button type="button" key={product.id} aria-pressed={look[product.digitalSlot as 'hat' | 'lightstick'] === product.digitalItemId} onClick={() => setLook(value => ({ ...value, [product.digitalSlot!]: value[product.digitalSlot as 'hat' | 'lightstick'] === product.digitalItemId ? undefined : product.digitalItemId }))}><img src={`${MERCH_IMAGE_ROOT}/${product.digitalImage || product.image}.png`} alt=""/><span>{product.title.replace(' · Digital', '')}</span>{look[product.digitalSlot as 'hat' | 'lightstick'] === product.digitalItemId && <Check size={15}/>}</button>)}</div>{!accessories.length && <p>Phụ kiện digital đã nhận sẽ hiện ở đây.</p>}</div>}
        <div className="myspace-avatar-actions"><button type="button" onClick={() => { setPreset(presets[Math.floor(Math.random() * presets.length)][0]); setAccessory(PRESET_ACCESSORIES[Math.floor(Math.random() * (PRESET_ACCESSORIES.length + 1))]?.id || ''); setNotice(''); }}>Chọn ngẫu nhiên ↻</button><button type="button" disabled={!changed} onClick={reset}>Hủy thay đổi</button><button type="button" className="myspace-primary-action" disabled={!changed} onClick={save}>Lưu avatar</button></div><p role="status" className="myspace-avatar-notice">{notice}</p>
      </div>
    </div>
  </section>;
}
