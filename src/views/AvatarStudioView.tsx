import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AvatarAsset, AvatarParts, SessionFormat } from '../domain/types';
import { AvatarStage } from '../components/AvatarStage';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Layers,
  Info,
  Check,
  FileCode,
  Lock,
  Radio,
  Eye,
  Activity,
  Box,
} from 'lucide-react';

interface PresetDefinition {
  name: string;
  description: string;
  parts: AvatarParts;
}

const PRESETS: Record<string, PresetDefinition> = {
  stage_classic: {
    name: 'Stage Classic (Sân khấu cổ điển)',
    description: 'Tóc chàm, áo vest nhung Midnight và tai nghe kiểm âm bạc hà.',
    parts: {
      base: 'stage_classic',
      outfit: 'midnight_jacket',
      accessory: 'earpiece_glow',
    },
  },
  cyber_neon: {
    name: 'Cyber Neon (Công nghệ tương lai)',
    description: 'Tóc tím gai, giáp dạ quang conduits và kính bảo hộ neon.',
    parts: {
      base: 'cyber_neon',
      outfit: 'cyber_suit',
      accessory: 'visor_neon',
    },
  },
  acoustic_minimal: {
    name: 'Acoustic Minimal (Mộc tối giản)',
    description: 'Tóc nâu ấm, áo hoodie lễ hội đỏ son và huy hiệu ngôi sao vàng.',
    parts: {
      base: 'acoustic_minimal',
      outfit: 'festival_hoodie',
      accessory: 'star_badge',
    },
  },
};

export const AvatarStudioView: React.FC = () => {
  const { state, dispatch } = useApp();

  // All avatar assets in state
  const avatarList = Object.values(state.avatarAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    avatarList[0]?.id || 'avatar-a-v1'
  );

  const selectedAsset = state.avatarAssets[selectedAssetId] || avatarList[0];
  const activeWorld = state.worlds[selectedAsset?.ownerWorldId || 'artist-a'];

  // Working state for edits
  const [workingParts, setWorkingParts] = useState<AvatarParts>(
    selectedAsset?.parts || {
      base: 'stage_classic',
      outfit: 'midnight_jacket',
      accessory: 'earpiece_glow',
    }
  );
  const [allowedContexts, setAllowedContexts] = useState<SessionFormat[]>(
    selectedAsset?.allowedContexts || ['dropin', 'listening', 'concert']
  );
  const [replayAllowed, setReplayAllowed] = useState<boolean>(
    selectedAsset?.replayAllowed ?? true
  );

  // Preview stage states
  const [previewPresence, setPreviewPresence] = useState<
    'present' | 'reconnecting' | 'disconnected' | 'absent'
  >('present');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [noticeMessage, setNoticeMessage] = useState<{
    type: 'success' | 'info' | 'warning';
    text: string;
  } | null>(null);

  // Synchronize working state when selecting a different asset
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    const asset = state.avatarAssets[assetId];
    if (asset) {
      setWorkingParts(asset.parts);
      setAllowedContexts(asset.allowedContexts);
      setReplayAllowed(asset.replayAllowed);
      setNoticeMessage(null);
    }
  };

  // Create a brand-new draft
  const handleCreateNewDraft = () => {
    const newDraftId = `avatar-${selectedAsset?.ownerWorldId || 'artist-a'}-v${Date.now().toString().slice(-4)}`;
    const newDraft: AvatarAsset = {
      id: newDraftId,
      tenantId: 'vieworld-demo',
      version: (selectedAsset?.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      ownerWorldId: selectedAsset?.ownerWorldId || 'artist-a',
      status: 'draft',
      allowedContexts: ['dropin'],
      replayAllowed: false,
      parts: { ...workingParts },
    };

    dispatch({
      type: 'SAVE_AVATAR_DRAFT',
      asset: newDraft,
    });

    setSelectedAssetId(newDraftId);
    setAllowedContexts(['dropin']);
    setReplayAllowed(false);
    setNoticeMessage({
      type: 'info',
      text: `Đã khởi tạo bản nháp mới [${newDraftId}]. Bản nháp chưa được duyệt và sẽ không hiển thị trên sân khấu người hâm mộ.`,
    });
  };

  // Apply a preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setWorkingParts({ ...preset.parts });
      setNoticeMessage({
        type: 'info',
        text: `Đã áp dụng mẫu phối "${preset.name}". Nhấn "Lưu bản nháp" hoặc "Mô phỏng phê duyệt" để xác nhận.`,
      });
    }
  };

  // Toggle context
  const handleToggleContext = (context: SessionFormat) => {
    if (allowedContexts.includes(context)) {
      if (allowedContexts.length === 1) {
        setNoticeMessage({
          type: 'warning',
          text: 'Avatar phải cho phép ít nhất một định dạng phiên tương tác.',
        });
        return;
      }
      setAllowedContexts(allowedContexts.filter((c) => c !== context));
    } else {
      setAllowedContexts([...allowedContexts, context]);
    }
  };

  // Save as draft
  const handleSaveDraft = () => {
    const draftId =
      selectedAsset?.status === 'draft'
        ? selectedAsset.id
        : `avatar-${selectedAsset?.ownerWorldId || 'artist-a'}-v${Date.now().toString().slice(-4)}`;

    const draftAsset: AvatarAsset = {
      id: draftId,
      tenantId: 'vieworld-demo',
      version: (selectedAsset?.version || 1) + (selectedAsset?.status === 'draft' ? 0 : 1),
      updatedAt: new Date().toISOString(),
      ownerWorldId: selectedAsset?.ownerWorldId || 'artist-a',
      status: 'draft',
      allowedContexts,
      replayAllowed,
      parts: { ...workingParts },
    };

    dispatch({
      type: 'SAVE_AVATAR_DRAFT',
      asset: draftAsset,
    });

    if (draftId !== selectedAssetId) {
      setSelectedAssetId(draftId);
    }

    setNoticeMessage({
      type: 'success',
      text: `Đã lưu bản nháp [${draftId}]. Đảm bảo an toàn: Bản nháp tách biệt hoàn toàn và không ảnh hưởng đến avatar đang chạy của nghệ sĩ.`,
    });
  };

  // Synthetic approve
  const handleSimulateApproval = () => {
    const simRef = `APPROVAL-SIM-2026-${Date.now().toString().slice(-4)}`;

    // First save the latest changes
    const targetAsset: AvatarAsset = {
      id: selectedAssetId,
      tenantId: 'vieworld-demo',
      version: selectedAsset?.version || 1,
      updatedAt: new Date().toISOString(),
      ownerWorldId: selectedAsset?.ownerWorldId || 'artist-a',
      status: 'draft',
      allowedContexts,
      replayAllowed,
      parts: { ...workingParts },
    };

    dispatch({
      type: 'SAVE_AVATAR_DRAFT',
      asset: targetAsset,
    });

    // Then approve
    dispatch({
      type: 'APPROVE_AVATAR_ASSET',
      assetId: selectedAssetId,
      approvalRef: simRef,
    });

    setNoticeMessage({
      type: 'success',
      text: `Mô phỏng phê duyệt thành công! Mã chứng thực: ${simRef}. Phiên bản này đã được kích hoạt làm avatar chính của thế giới ${activeWorld?.name || 'Artist A'}.`,
    });
  };

  // Set active (revert to this approved version)
  const handleSetActiveVersion = () => {
    if (selectedAsset.status !== 'approved') return;

    dispatch({
      type: 'REVERT_AVATAR_VERSION',
      worldId: selectedAsset.ownerWorldId,
      targetAssetId: selectedAsset.id,
    });

    setNoticeMessage({
      type: 'success',
      text: `Đã đặt phiên bản [${selectedAsset.id}] làm avatar đại diện chính của thế giới.`,
    });
  };

  // Retire asset
  const handleRetireAsset = () => {
    if (selectedAsset.status === 'retired') return;

    dispatch({
      type: 'RETIRE_AVATAR_ASSET',
      assetId: selectedAsset.id,
    });

    setNoticeMessage({
      type: 'warning',
      text: `Đã ngưng sử dụng (Retired) avatar [${selectedAsset.id}]. Tài sản này sẽ bị chặn khi tạo phiên mới, các phiên lịch sử vẫn được bảo toàn nguyên vẹn.`,
    });
  };

  // Construct working asset for live stage preview
  const workingPreviewAsset: AvatarAsset = {
    ...(selectedAsset || {
      id: 'preview',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '',
      ownerWorldId: 'artist-a',
      status: 'draft',
      allowedContexts: ['dropin'],
      replayAllowed: false,
      parts: workingParts,
    }),
    parts: workingParts,
    allowedContexts,
    replayAllowed,
  };

  const isCurrentWorldActive = activeWorld?.avatarAssetId === selectedAsset?.id;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Link
            to="/studio"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            ← Bàn điều khiển Studio
          </Link>
          <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>/</span>
          <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
            OPERATOR WORKSPACE · P11
          </span>
          <span className="demo-badge">DEMO</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--ink)' }}>
          Avatar Studio (Quản lý Tài sản Nghệ sĩ)
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Tùy biến linh kiện SVG 2D, kiểm soát định dạng cấp phép và phê duyệt mô phỏng vòng đời tài sản.
        </p>
      </div>

      {/* Governance & Architecture Disclosure Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          backgroundColor: '#F8FAFC',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: 'var(--text-xs)' }}>
          <ShieldCheck size={16} />
          <span>QUY TẮC BẢO VỆ DANH DỰ NGHỆ SĨ & MINH BẠCH TÀI SẢN (§2.3, §4, §7.2)</span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.6 }}>
          • <strong>Tài sản đồ họa 2D thuần túy:</strong> Hệ thống sử dụng các bộ phận vector SVG định sẵn. Nghiêm cấm và không cung cấp tính năng tải ảnh chụp người thật, quét khuôn mặt hay công nghệ Deepfake / Face Cloning.
          <br />
          • <strong>Cách ly bản nháp (Draft Isolation):</strong> Mọi bản nháp (Draft) tuyệt đối không xuất hiện trên sân khấu trực tiếp của khán giả cho đến khi có xác nhận phê duyệt.
          <br />
          • <strong>Bất biến lịch sử (Retirement Immutability):</strong> Tài sản khi ngưng dùng (Retired) sẽ bị từ chối khi mở phiên mới, nhưng toàn bộ bản ghi phiên quá khứ được giữ nguyên giá trị.
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor:
              noticeMessage.type === 'success'
                ? '#ECFDF5'
                : noticeMessage.type === 'warning'
                ? '#FEF3C7'
                : '#EFF6FF',
            border: `1px solid ${
              noticeMessage.type === 'success'
                ? '#A7F3D0'
                : noticeMessage.type === 'warning'
                ? '#FDE68A'
                : '#BFDBFE'
            }`,
            color:
              noticeMessage.type === 'success'
                ? '#065F46'
                : noticeMessage.type === 'warning'
                ? '#92400E'
                : '#1E40AF',
          }}
        >
          {noticeMessage.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : noticeMessage.type === 'warning' ? (
            <AlertTriangle size={16} />
          ) : (
            <Info size={16} />
          )}
          <span style={{ flex: 1 }}>{noticeMessage.text}</span>
          <button
            onClick={() => setNoticeMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Asset Selector & Version Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label htmlFor="asset-select" style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--ink)' }}>
            Chọn Phiên bản Tài sản:
          </label>
          <select
            id="asset-select"
            value={selectedAssetId}
            onChange={(e) => handleSelectAsset(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: 'var(--text-xs)',
              fontWeight: '600',
              color: 'var(--ink)',
            }}
          >
            {avatarList.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.id} · v{asset.version} ({asset.status.toUpperCase()})
                {state.worlds[asset.ownerWorldId]?.avatarAssetId === asset.id ? ' ★ Đang đại diện' : ''}
              </option>
            ))}
          </select>

          {/* Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {selectedAsset?.status === 'approved' && (
              <span
                className="tag"
                style={{ backgroundColor: '#DEF7EC', color: '#03543F', fontWeight: '700', fontSize: '11px' }}
              >
                ✓ ĐÃ PHÊ DUYỆT (APPROVED)
              </span>
            )}
            {selectedAsset?.status === 'draft' && (
              <span
                className="tag"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '700', fontSize: '11px' }}
              >
                ● BẢN NHÁP (DRAFT)
              </span>
            )}
            {selectedAsset?.status === 'retired' && (
              <span
                className="tag"
                style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: '700', fontSize: '11px' }}
              >
                ✕ ĐÃ NGƯNG DÙNG (RETIRED)
              </span>
            )}

            {isCurrentWorldActive && (
              <span
                className="tag"
                style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700', fontSize: '11px' }}
              >
                ★ ĐANG ĐẠI DIỆN THẾ GIỚI
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateNewDraft}
          className="btn btn-secondary"
          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Layers size={14} />
          + Tạo Bản Nháp Mới
        </button>
      </div>

      {/* Main Studio 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Stage Visualizer & Manifest Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stage Preview Card */}
          <div className="card" style={{ padding: '20px', overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                  Xem trước trực quan (Visualizer Preview)
                </h2>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  backgroundColor: '#F1F5F9',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Mã render: 2D SVG
              </span>
            </div>

            {/* Stage Preview Controls Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--surface)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '12px',
                border: '1px solid var(--border)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} color="var(--muted)" />
                <label style={{ color: 'var(--muted)', fontWeight: '600' }}>Mô phỏng hiện diện:</label>
                <select
                  value={previewPresence}
                  onChange={(e) =>
                    setPreviewPresence(
                      e.target.value as 'present' | 'reconnecting' | 'disconnected' | 'absent'
                    )
                  }
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                  }}
                >
                  <option value="present">Đang có mặt (present)</option>
                  <option value="reconnecting">Đang kết nối lại (reconnecting)</option>
                  <option value="disconnected">Mất kết nối (disconnected)</option>
                  <option value="absent">Vắng mặt (absent)</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
                <span>Chuyển động</span>
              </label>
            </div>

            {/* The Actual Stage Rendering */}
            <AvatarStage
              avatar={workingPreviewAsset}
              artistPresence={previewPresence}
              reducedMotion={!animationsEnabled}
            />

            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              Hiệu ứng hoạt họa nhàn rỗi (idle sway, breathing) phản ánh tức thì các bộ phận đã chọn.
            </div>
          </div>

          {/* Part Manifest Inspector */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileCode size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Hồ sơ Tài sản (Asset Manifest Inspector)
              </h2>
            </div>

            <table
              style={{
                width: '100%',
                fontSize: 'var(--text-xs)',
                borderCollapse: 'collapse',
                marginBottom: '16px',
              }}
            >
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600', width: '140px' }}>
                    Mã định danh (ID)
                  </td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: '700', color: 'var(--ink)' }}>
                    {selectedAsset?.id}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Phiên bản</td>
                  <td style={{ padding: '8px 0', fontWeight: '700', color: 'var(--ink)' }}>
                    v{selectedAsset?.version}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Trạng thái vòng đời</td>
                  <td style={{ padding: '8px 0' }}>
                    <span style={{ fontWeight: '700' }}>{selectedAsset?.status.toUpperCase()}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Mã Phê Duyệt</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', color: 'var(--ink)' }}>
                    {selectedAsset?.approvalRef || '(Chưa có — Cần duyệt mô phỏng)'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Linh kiện Nền (Base)</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>{workingParts.base}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Trang phục (Outfit)</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>{workingParts.outfit}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Phụ kiện (Accessory)</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>{workingParts.accessory}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Bối cảnh cho phép</td>
                  <td style={{ padding: '8px 0' }}>
                    {allowedContexts.map((c) => (
                      <span
                        key={c}
                        className="tag"
                        style={{
                          marginRight: '4px',
                          fontSize: '10px',
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--muted)', fontWeight: '600' }}>Cấp phép Replay</td>
                  <td style={{ padding: '8px 0', fontWeight: '700' }}>
                    {replayAllowed ? (
                      <span style={{ color: '#16A34A' }}>✓ Được phép lưu bản ghi</span>
                    ) : (
                      <span style={{ color: '#DC2626' }}>✕ Không cho phép xem lại</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Collapsible JSON Manifest */}
            <details style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>
                Xem Manifest JSON thô (Audit / Developer Payload)
              </summary>
              <pre
                style={{
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  overflowX: 'auto',
                  fontSize: '11px',
                  lineHeight: 1.4,
                }}
              >
                {JSON.stringify(workingPreviewAsset, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* Right Column: Customizer, Presets & Governance Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Presets Selection */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Mẫu Phối Định Sẵn (Presets)
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Part Customizer Controls */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Tùy biến Linh kiện Kiểm soát (Controlled Parts)
              </h2>
            </div>

            {/* Base Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="part-base"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: '700', marginBottom: '6px' }}
              >
                1. Tông màu & Tóc (Base Tone):
              </label>
              <select
                id="part-base"
                value={workingParts.base}
                onChange={(e) =>
                  setWorkingParts({ ...workingParts, base: e.target.value as AvatarParts['base'] })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink)',
                }}
              >
                <option value="stage_classic">Sân khấu Cổ điển (Tóc chàm · Hào quang Bạc hà)</option>
                <option value="cyber_neon">Cyber Neon (Tóc tím gai · Hào quang Xanh Cyan/Hồng)</option>
                <option value="acoustic_minimal">Acoustic Mộc (Tóc nâu ấm · Hào quang Hổ phách)</option>
              </select>
            </div>

            {/* Outfit Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="part-outfit"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: '700', marginBottom: '6px' }}
              >
                2. Trang phục Biểu diễn (Outfit):
              </label>
              <select
                id="part-outfit"
                value={workingParts.outfit}
                onChange={(e) =>
                  setWorkingParts({ ...workingParts, outfit: e.target.value as AvatarParts['outfit'] })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink)',
                }}
              >
                <option value="midnight_jacket">Midnight Velvet Suit (Vest nhung viền dạ quang)</option>
                <option value="festival_hoodie">Festival Crimson Hoodie (Áo nỉ có mũ đỏ son)</option>
                <option value="cyber_suit">Cyber Conduits (Giáp công nghệ đường truyền ánh sáng)</option>
              </select>
            </div>

            {/* Accessory Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="part-accessory"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: '700', marginBottom: '6px' }}
              >
                3. Phụ kiện Sân khấu (Accessory):
              </label>
              <select
                id="part-accessory"
                value={workingParts.accessory}
                onChange={(e) =>
                  setWorkingParts({
                    ...workingParts,
                    accessory: e.target.value as AvatarParts['accessory'],
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink)',
                }}
              >
                <option value="none">Không dùng phụ kiện (None)</option>
                <option value="earpiece_glow">Tai nghe kiểm âm In-Ear phát sáng (Earpiece Glow)</option>
                <option value="visor_neon">Kính bảo hộ Cyber Neon (Visor Neon)</option>
                <option value="star_badge">Huy hiệu Ngôi sao Vàng (Star Badge)</option>
              </select>
            </div>

            {/* Reserved Partner 3D Model Slot */}
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed #CBD5E1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Box size={16} color="var(--muted)" />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)' }}>
                  Ô Mô hình 3D Đối tác Độc quyền (Reserved Partner Rig)
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Dành riêng cho tệp tài sản 3D cao cấp (GLB/USDZ) từ xưởng hoạt hình đối tác được ủy quyền. Không sử dụng công cụ auto-rig tự động hóa hoặc nạp ảnh tự do (§2.3).
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--muted)',
                  backgroundColor: '#E2E8F0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                <Lock size={12} />
                <span>Slot để trống · Chế độ thiết kế 2D chuẩn</span>
              </div>
            </div>
          </div>

          {/* Usage Contexts & Replay Gating */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Radio size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Bối cảnh Sử dụng & Cấp phép (Usage Gating)
              </h2>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Định dạng Phiên được phép gán Avatar:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                  <input
                    type="checkbox"
                    checked={allowedContexts.includes('dropin')}
                    onChange={() => handleToggleContext('dropin')}
                  />
                  <span>
                    <strong>dropin</strong> — Gặp gỡ ngẫu nhiên thân mật
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                  <input
                    type="checkbox"
                    checked={allowedContexts.includes('listening')}
                    onChange={() => handleToggleContext('listening')}
                  />
                  <span>
                    <strong>listening</strong> — Phòng nghe nhạc / Listening Room
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                  <input
                    type="checkbox"
                    checked={allowedContexts.includes('concert')}
                    onChange={() => handleToggleContext('concert')}
                  />
                  <span>
                    <strong>concert</strong> — Đại nhạc hội ảo / Live House
                  </span>
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <input
                  type="checkbox"
                  checked={replayAllowed}
                  onChange={(e) => setReplayAllowed(e.target.checked)}
                />
                <span>
                  <strong>Cho phép Replay:</strong> Sau khi phiên kết thúc, video lưu trữ được phép hiển thị hình ảnh avatar này.
                </span>
              </label>
            </div>
          </div>

          {/* Operator Lifecycle Actions */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'var(--surface)' }}>
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: '0 0 14px 0' }}>
              Thao tác Vòng đời Tài sản (Lifecycle Actions)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  padding: '10px',
                }}
              >
                Lưu Bản Nháp (Save Draft)
              </button>

              {/* Simulated Approve Button */}
              <button
                onClick={handleSimulateApproval}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  padding: '10px',
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                }}
              >
                <Check size={16} />
                Mô Phỏng Phê Duyệt (Approve Asset)
              </button>

              {/* Set Active / Revert Button */}
              {selectedAsset?.status === 'approved' && !isCurrentWorldActive && (
                <button
                  onClick={handleSetActiveVersion}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 'var(--text-xs)',
                    padding: '10px',
                  }}
                >
                  Đặt Làm Avatar Hoạt Động Của Thế Giới
                </button>
              )}

              {/* Retire Button */}
              {selectedAsset?.status !== 'retired' && (
                <button
                  onClick={handleRetireAsset}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Archive size={14} />
                  Ngưng Sử Dụng (Retire Asset)
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: '14px',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#F8FAFC',
                fontSize: '11px',
                color: 'var(--muted)',
                lineHeight: 1.4,
              }}
            >
              * Nhãn <strong>Mô phỏng phê duyệt</strong> hiển thị minh bạch nhằm phân biệt với chứng thư ký duyệt sản xuất thực tế.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
