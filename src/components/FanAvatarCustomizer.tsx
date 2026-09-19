import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_ACCESSORIES, type FanProfile } from '../domain/types';
import { ownedDigitalLook } from '../world/merchCatalog';
import { AvatarRenderer } from './AvatarRenderer';

const presets = [
  ['original', 'Tóc nâu bồng'],
  ['wave', 'Tóc đen gợn'],
  ['bob', 'Tóc bob hạt dẻ'],
  ['curl', 'Tóc xoăn mềm'],
] as const;

export function FanAvatarCustomizer({ onBackToRoom }: { onBackToRoom?: () => void }) {
  const { state, dispatch } = useApp();
  const saved = state.fanProfile.avatarPreset || 'original';
  const savedAccessory = state.fanProfile.wardrobeChoice?.accessoryId || '';

  const [preset, setPreset] = useState<NonNullable<FanProfile['avatarPreset']>>(saved);
  const [accessory, setAccessory] = useState(savedAccessory);
  const [notice, setNotice] = useState('');

  const changed = preset !== saved || accessory !== savedAccessory;

  return (
    <section className="v8-avatar-editor" aria-label="Chỉnh avatar fan">
      <header className="v8-avatar-header">
        <div>
          <h2>Hôm nay, mình là…</h2>
          <p>Chọn một diện mạo và phụ kiện của riêng bạn. Tất cả các mẫu cơ bản đều miễn phí.</p>
        </div>
        <button
          type="button"
          className="fw-text-button"
          onClick={() => {
            if (onBackToRoom) onBackToRoom();
            else if (typeof window !== 'undefined') window.location.href = '/me';
          }}
        >
          Xem trong phòng ↗
        </button>
      </header>

      <div className="v8-avatar-layout">
        <div className="v8-avatar-preview">
          <AvatarRenderer
            key={preset}
            appearance={preset}
            accessoryId={accessory}
            digitalLook={ownedDigitalLook(state)}
            size="preview"
            displayName={state.fanProfile.displayName}
          />
          <strong>{state.fanProfile.displayName}</strong>
          <small>{changed ? 'Xem trước · chưa lưu' : 'Diện mạo đang dùng'}</small>
        </div>

        <div>
          <fieldset>
            <legend>Diện mạo</legend>
            <div className="v8-preset-grid">
              {presets.map(([id, label]) => (
                <button
                  key={id}
                  aria-label={label}
                  aria-pressed={preset === id}
                  onClick={() => {
                    setPreset(id);
                    setNotice('');
                  }}
                >
                  <AvatarRenderer appearance={id} size="md" reducedMotion />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Phụ kiện miễn phí</legend>
            <div className="v8-tabs">
              <button aria-pressed={!accessory} onClick={() => setAccessory('')}>
                Không đeo
              </button>
              {PRESET_ACCESSORIES.map(a => (
                <button
                  key={a.id}
                  aria-pressed={accessory === a.id}
                  onClick={() => setAccessory(a.id)}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="fw-muted">
            Đây là các mẫu diện mạo dựng sẵn, thể hiện cách bạn xuất hiện ở mọi không gian fandom. Trang phục digital đã sở hữu vẫn được giữ nguyên.
          </p>

          <div className="v8-tabs" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="fw-text-button"
              onClick={() => {
                setPreset(presets[Math.floor(Math.random() * presets.length)][0]);
                setAccessory(PRESET_ACCESSORIES[Math.floor(Math.random() * PRESET_ACCESSORIES.length)].id);
                setNotice('');
              }}
            >
              Chọn ngẫu nhiên ↻
            </button>
            <button
              type="button"
              className="fw-text-button"
              disabled={!changed}
              onClick={() => {
                setPreset(saved);
                setAccessory(savedAccessory);
                setNotice('Đã bỏ thay đổi chưa lưu.');
              }}
            >
              Hủy thay đổi
            </button>
            <button
              type="button"
              className="fw-button"
              disabled={!changed}
              onClick={() => {
                dispatch({ type: 'SET_AVATAR_PRESET', preset });
                dispatch({ type: 'EQUIP_WARDROBE', accessoryId: accessory });
                setNotice('Đã lưu diện mạo trên thiết bị này.');
              }}
            >
              Lưu avatar
            </button>
          </div>

          <p role="status">{notice}</p>
        </div>
      </div>
    </section>
  );
}
