import React, { useId, useState } from 'react';
import { SpeechBubble } from './SpeechBubble';
import {
  CharacterRole,
  getAccessoryById,
  FAN_CHARACTER_SPEC,
  ARTIST_A_CHARACTER_SPEC,
} from '../world/assetManifest';

export interface AvatarRendererProps {
  role?: CharacterRole;
  artistId?: string;
  appearance?: 'original' | 'wave' | 'bob' | 'curl';
  accessoryId?: string;
  outfitId?: string;
  digitalLook?: { shirt?: string; hat?: string; lightstick?: string };
  size?: 'sm' | 'md' | 'lg' | 'preview';
  displayName?: string;
  reducedMotion?: boolean;
  isFrozen?: boolean;
  speechText?: string;
  className?: string;
  testId?: string;
  ariaLabel?: string;
}

const SIZE_DIMENSIONS = {
  sm: { width: 36, height: 36 },
  md: { width: 56, height: 56 },
  lg: { width: 110, height: 130 },
  preview: { width: 140, height: 160 },
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  role = 'fan',
  artistId,
  appearance = 'original',
  accessoryId,
  outfitId,
  digitalLook,
  size = 'md',
  displayName = 'Avatar',
  reducedMotion = false,
  isFrozen = false,
  speechText,
  className = '',
  testId,
  ariaLabel,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const svgId = useId().replace(/:/g, '');
  const { width, height } = SIZE_DIMENSIONS[size];
  const accessory = getAccessoryById(accessoryId);
  const isUnknownAccessory = Boolean(accessoryId && !accessory);

  const defaultLabel =
    role === 'artist'
      ? `Avatar 2D Nghệ sĩ ${displayName}`
      : `Avatar 2D của ${displayName}${accessory ? ` (Đang đeo: ${accessory.name})` : ''}`;

  const getArtistAvatarSrc = () => {
    const key = `${displayName || ''} ${artistId || ''}`.toLowerCase();
    if (key.includes('mira')) return '/images/characters-v4/avatar-artist-mira.webp';
    if (key.includes('kai')) return '/images/characters-v4/avatar-artist-kai.webp';
    if (key.includes('neon')) return '/images/characters-v4/avatar-neon-sessions.webp';
    return '/images/characters-v4/avatar-artist-a.webp';
  };

  const characterSrc =
    role === 'fan'
      ? ['wave', 'bob', 'curl'].includes(appearance)
        ? `/images/world-v8/fan-${['wave', 'bob', 'curl'].indexOf(appearance) + 1}.webp`
        : '/images/characters-v4/fan.webp'
      : getArtistAvatarSrc();

  return (
    <div
      className={`avatar-renderer avatar-renderer--${role} avatar-renderer--${size} ${
        isFrozen || reducedMotion ? 'frozen' : 'idle-breathing'
      } ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
        filter: isFrozen ? 'grayscale(25%)' : 'none',
        opacity: isFrozen ? 0.75 : 1,
        transition: 'filter 200ms ease, opacity 200ms ease',
      }}
      data-testid={testId || `avatar-renderer-${role}`}
      data-role={role}
      data-size={size}
      data-accessory={accessory?.id || 'none'}
      data-accessory-fallback={isUnknownAccessory ? 'true' : undefined}
      aria-label={ariaLabel || defaultLabel}
      role="img"
    >
      {speechText && <SpeechBubble text={speechText} />}
      {!imageFailed ? <>
        <img className="vx-character-art" src={characterSrc} alt="" draggable={false} decoding="async" onError={()=>setImageFailed(true)}/>
        <svg className="vx-character-layers" viewBox="0 0 200 250" fill="none" aria-hidden="true">
          {(digitalLook?.shirt || (role==='artist'&&outfitId&&outfitId!=='midnight_jacket')) && <g fill={outfitId&&!['midnight_jacket','festival_hoodie','acoustic_shirt'].includes(outfitId)?'#374151':undefined} data-testid={digitalLook?.shirt?'digital-shirt':outfitId&&!['midnight_jacket','festival_hoodie','acoustic_shirt'].includes(outfitId)?'fallback-avatar-torso':'artist-outfit'}>
            <path d="M73 126Q100 139 127 126L137 146L136 183Q100 190 64 183L63 146Z" fill={role==='fan'?(digitalLook?.shirt==='mira-hoodie'?'#c4b5fd':digitalLook?.shirt==='kai-bomber'?'#334155':'#e9e3cd'):outfitId==='festival_hoodie'?'#a66469':outfitId==='acoustic_shirt'?'#dbceb4':'#374151'} stroke="#827762" strokeWidth="1"/>
            <path d="M82 128Q100 145 118 128" stroke="#fcf7e9" strokeWidth="3"/>
            {role==='fan'&&<path d="M86 150L89 157H97L91 162L93 170L86 165L79 170L81 162L75 157H83Z" fill={digitalLook?.shirt==='kai-bomber'?'#06b6d4':digitalLook?.shirt==='mira-hoodie'?'#a78bfa':'#57735d'}/>}
          </g>}
          {digitalLook?.hat&&<g data-testid="digital-hat"><path d="M40 49Q41 5 100 6Q159 7 160 49Q102 67 40 49Z" fill="#698063" stroke="#344b38"/><path d="M40 49Q103 35 166 54Q107 72 40 55Z" fill="#445c46"/></g>}
          {digitalLook?.lightstick&&<g data-testid="digital-lightstick"><path d="M156 184L159 156" stroke="#849b8b" strokeWidth="5"/><circle cx="160" cy="149" r="10" fill={digitalLook.lightstick==='mira-lightstick'?'#e9d5ff':digitalLook.lightstick==='kai-lightstick'?'#cffafe':'#e5f1e0'} stroke={digitalLook.lightstick==='mira-lightstick'?'#9333ea':digitalLook.lightstick==='kai-lightstick'?'#06b6d4':'#7f9d88'}/><path d="M160 140L163 147H170L165 152L167 159L160 155L153 159L155 152L150 147H157Z" fill={digitalLook.lightstick==='mira-lightstick'?'#a855f7':digitalLook.lightstick==='kai-lightstick'?'#0891b2':'#a9c2a3'}/></g>}
          {accessory?.id==='accessory_classic'&&<g data-testid={role==='artist'?'star-badge-accessory':'preview-accessory-star'}><path d="M120 139L123 145H130L125 150L127 157L120 153L113 157L115 150L110 145H117Z" fill="#e0b465" stroke="#856a3e"/></g>}
          {accessory?.id==='earpiece_glow'&&<g data-testid={role==='artist'?'earpiece-glow-accessory':'preview-accessory-earpiece'}><circle cx="147" cy="99" r="5" fill="#8ec8b4" stroke="#426b5d"/></g>}
          {accessory?.id==='visor_neon'&&<g data-testid={role==='artist'?'visor-neon-accessory':'preview-accessory-visor'}><rect x="59" y="84" width="82" height="20" rx="8" fill="#537e86" fillOpacity=".8" stroke="#c9e8df"/><path d="M67 89H132" stroke="#d7eeed"/></g>}
        </svg>
      </> : role === 'fan' ? (
        /* FAN AVATAR: 2.5D Matte-Clay Miniature (per approved fan-character-sheet.png) */
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Clay diffuse lighting gradients */}
            <radialGradient id={`${svgId}-fanClayHeadGlow`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="70%" stopColor={FAN_CHARACTER_SPEC.palette.skin} />
              <stop offset="100%" stopColor={FAN_CHARACTER_SPEC.palette.skinShadow} />
            </radialGradient>

            <linearGradient id={`${svgId}-fanHoodieClay`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFDF7" />
              <stop offset="60%" stopColor={FAN_CHARACTER_SPEC.palette.hoodie} />
              <stop offset="100%" stopColor={FAN_CHARACTER_SPEC.palette.hoodieShadow} />
            </linearGradient>

            <linearGradient id={`${svgId}-fanJeansClay`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="100%" stopColor={FAN_CHARACTER_SPEC.palette.jeans} />
            </linearGradient>

            <radialGradient id={`${svgId}-fanStageAura`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(101, 81, 200, 0.25)" />
              <stop offset="100%" stopColor="rgba(101, 81, 200, 0)" />
            </radialGradient>
          </defs>

          {/* Soft Ground Shadow */}
          <ellipse cx="100" cy="226" rx="46" ry="10" fill="rgba(0, 0, 0, 0.14)" />

          {/* Stage Aura (only for md, lg, preview) */}
          {size !== 'sm' && (
            <circle cx="100" cy="110" r="70" fill={`url(#${svgId}-fanStageAura)`} />
          )}

          {/* Indigo Rolled Jeans Legs */}
          <rect x="78" y="196" width="18" height="26" rx="6" fill={`url(#${svgId}-fanJeansClay)`} />
          <rect x="104" y="196" width="18" height="26" rx="6" fill={`url(#${svgId}-fanJeansClay)`} />

          {/* White Clay Sneakers */}
          <ellipse cx="87" cy="224" rx="12" ry="6" fill={FAN_CHARACTER_SPEC.palette.shoes} stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="113" cy="224" rx="12" ry="6" fill={FAN_CHARACTER_SPEC.palette.shoes} stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Cream Zip Hoodie Torso */}
          <path
            d="M58 206C58 168 76 154 100 154C124 154 142 168 142 206V212H58V206Z"
            fill={digitalLook?.shirt ? '#eee7d3' : `url(#${svgId}-fanHoodieClay)`}
            stroke="#E5E7EB"
            strokeWidth="2.5"
          />

          {/* Hoodie Pockets & Zipper Line */}
          {digitalLook?.shirt && <g data-testid="digital-shirt"><path d="M84 159Q100 170 116 159" stroke="#53664d" strokeWidth="7"/><path d="M76 177L79 183H86L81 188L83 195L76 191L69 195L71 188L66 183H73Z" fill="#53664d"/></g>}
          {!digitalLook?.shirt && <g><line x1="100" y1="156" x2="100" y2="210" stroke={FAN_CHARACTER_SPEC.palette.hoodieZip} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 188Q84 200 96 200" stroke="#CBD5E1" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M128 188Q116 200 104 200" stroke="#CBD5E1" strokeWidth="2" fill="none" strokeLinecap="round" /></g>}

          {/* Neck & Collar */}
          <rect x="91" y="128" width="18" height="30" rx="6" fill="#FCD34D" />
          <path d="M84 154Q100 162 116 154" stroke="#D1D5DB" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Round Matte-Clay Head */}
          <circle
            cx="100"
            cy="104"
            r="44"
            fill={`url(#${svgId}-fanClayHeadGlow)`}
            stroke="#20212B"
            strokeWidth="2.5"
          />

          {/* Textured Clay Hair */}
          <path
            d="M58 98C58 60 76 48 100 48C124 48 142 60 142 98C132 86 122 86 100 92C78 86 68 86 58 98Z"
            fill={FAN_CHARACTER_SPEC.palette.hair}
          />
          <path
            d="M74 54C84 50 116 50 126 54C114 52 86 52 74 54Z"
            fill={FAN_CHARACTER_SPEC.palette.hairHighlight}
            opacity="0.7"
          />

          {/* Expressive Clay Eyes */}
          {digitalLook?.hat && <g data-testid="digital-hat"><path d="M53 95Q55 42 99 43Q143 43 147 95Z" fill="#667658" stroke="#34482e" strokeWidth="2"/><path d="M54 94Q108 78 155 103Q102 112 54 101Z" fill="#485c3e"/><path d="M98 56L102 65H112L104 71L107 80L98 74L89 80L92 71L84 65H94Z" fill="#f3ead3"/></g>}
          {digitalLook?.lightstick && <g data-testid="digital-lightstick" transform="rotate(-12 150 185)"><rect x="147" y="164" width="10" height="44" rx="5" fill="#f5eacc" stroke="#8e936e"/><circle cx="152" cy="149" r="20" fill="#d1fae5" fillOpacity=".8" stroke="#79a18d" strokeWidth="2"/><path d="M152 134L156 144H166L158 151L161 161L152 155L143 161L146 151L138 144H148Z" fill="#53664d"/></g>}
          <ellipse cx="86" cy="106" rx="4.5" ry="6" fill="#1E1B4B" />
          <ellipse cx="114" cy="106" rx="4.5" ry="6" fill="#1E1B4B" />
          <circle cx="88" cy="104" r="1.5" fill="#FFFFFF" />
          <circle cx="116" cy="104" r="1.5" fill="#FFFFFF" />

          {/* Gentle Warm Clay Smile */}
          <path d="M94 122C97 126 103 126 106 122" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />

          {/* Subtle Rosy Cheeks */}
          <circle cx="78" cy="116" r="6" fill="#F43F5E" opacity="0.25" />
          <circle cx="122" cy="116" r="6" fill="#F43F5E" opacity="0.25" />

          {/* ACCESSORY 1: Huy hiệu Ngôi sao Cổ điển (accessory_classic) */}
          {accessory?.id === 'accessory_classic' && (
            <g data-testid="preview-accessory-star" className="accessory-layer accessory-star">
              {/* Outer Golden Aura */}
              <circle cx="82" cy="176" r="14" fill={accessory.glowColor || 'rgba(245, 158, 11, 0.4)'} />
              {/* 5-Point Golden Star Clay Badge */}
              <polygon
                points="82,164 86,173 95,173 88,179 91,188 82,183 73,188 76,179 69,173 78,173"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="1.5"
              />
              <circle cx="82" cy="176" r="3" fill="#FEF08A" />
            </g>
          )}

          {/* ACCESSORY 2: Tai nghe Neon Phát sáng (earpiece_glow) */}
          {accessory?.id === 'earpiece_glow' && (
            <g data-testid="preview-accessory-earpiece" className="accessory-layer accessory-earpiece">
              {/* Glowing Pulse Aura */}
              <circle cx="143" cy="107" r="11" fill="rgba(16, 185, 129, 0.35)" />
              {/* Outer Ring */}
              <circle cx="143" cy="107" r="7" stroke="#10B981" strokeWidth="2" />
              {/* Inner Mint Clay Earpiece Capsule */}
              <circle cx="143" cy="107" r="4.5" fill="#34D399" />
              {/* Clip band behind ear */}
              <path d="M141 101C138 97 134 99 133 103" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* ACCESSORY 3: Kính thực tế ảo Cyber (visor_neon) */}
          {accessory?.id === 'visor_neon' && (
            <g data-testid="preview-accessory-visor" className="accessory-layer accessory-visor">
              {/* Cyber Visor Visor Shell */}
              <rect
                x="70"
                y="98"
                width="60"
                height="16"
                rx="5"
                fill="rgba(139, 92, 246, 0.85)"
                stroke="#06B6D4"
                strokeWidth="2"
              />
              {/* Holographic Specular Line */}
              <line x1="74" y1="106" x2="126" y2="106" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 2" opacity="0.9" />
              {/* Side Mount Fasteners */}
              <circle cx="70" cy="106" r="3" fill="#06B6D4" />
              <circle cx="130" cy="106" r="3" fill="#06B6D4" />
            </g>
          )}
        </svg>
      ) : (
        /* ARTIST AVATAR: 2.5D Indie Acoustic Singer (per approved artist-a-character-sheet.png) */
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`${svgId}-artistClayHeadGlow`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="70%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FCD34D" />
            </radialGradient>

            <linearGradient id={`${svgId}-artistSweaterClay`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="50%" stopColor={ARTIST_A_CHARACTER_SPEC.palette.sweater} />
              <stop offset="100%" stopColor={ARTIST_A_CHARACTER_SPEC.palette.sweaterShadow} />
            </linearGradient>

            <radialGradient id={`${svgId}-artistStageAura`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(169, 229, 212, 0.25)" />
              <stop offset="100%" stopColor="rgba(169, 229, 212, 0)" />
            </radialGradient>
          </defs>

          {/* Soft Ground Shadow */}
          <ellipse cx="100" cy="226" rx="48" ry="10" fill="rgba(0, 0, 0, 0.14)" />

          {/* Stage Spotlight Aura */}
          {size !== 'sm' && (
            <circle cx="100" cy="110" r="70" fill={`url(#${svgId}-artistStageAura)`} />
          )}

          {/* Cream Trousers Legs */}
          <rect x="78" y="196" width="18" height="26" rx="5" fill={ARTIST_A_CHARACTER_SPEC.palette.pants} stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="104" y="196" width="18" height="26" rx="5" fill={ARTIST_A_CHARACTER_SPEC.palette.pants} stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Casual Shoes */}
          <ellipse cx="87" cy="224" rx="12" ry="5.5" fill="#D8B4FE" />
          <ellipse cx="113" cy="224" rx="12" ry="5.5" fill="#D8B4FE" />

          {/* Lavender Oversized Knit Sweater Torso */}
          <path
            d="M54 208C54 168 74 152 100 152C126 152 146 168 146 208V214H54V208Z"
            data-testid={outfitId && !['midnight_jacket', 'festival_hoodie', 'acoustic_shirt'].includes(outfitId) ? 'fallback-avatar-torso' : undefined}
            fill={!outfitId ? `url(#${svgId}-artistSweaterClay)` : outfitId === 'midnight_jacket' ? '#29273F' : outfitId === 'festival_hoodie' ? '#B84F61' : outfitId === 'acoustic_shirt' ? '#E8DAC3' : '#374151'}
            stroke="#8B5CF6"
            strokeWidth="2.5"
          />

          {/* V-neck stitch */}
          <path d="M78 152L100 178L122 152" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Acoustic Guitar on Shoulder Strap */}
          <g className="artist-guitar-prop">
            {/* Guitar Body */}
            <path
              d="M125 174C135 166 148 174 148 186C148 198 136 208 122 208C110 208 104 198 108 188C112 178 118 180 125 174Z"
              fill={ARTIST_A_CHARACTER_SPEC.palette.guitarWood}
              stroke="#92400E"
              strokeWidth="1.5"
            />
            {/* Soundhole */}
            <circle cx="128" cy="190" r="5" fill="#451A03" />
            {/* Guitar Neck & Strings */}
            <line x1="128" y1="184" x2="146" y2="152" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
            <line x1="126" y1="186" x2="144" y2="154" stroke="#FDFBF7" strokeWidth="1" />
          </g>

          {/* Neck */}
          <rect x="91" y="128" width="18" height="30" rx="6" fill="#FCD34D" />

          {/* Artist Round Clay Head */}
          <circle
            cx="100"
            cy="104"
            r="44"
            fill={`url(#${svgId}-artistClayHeadGlow)`}
            stroke="#20212B"
            strokeWidth="2.5"
          />

          {/* Gentle Indie Haircut */}
          <path
            d="M58 98C58 62 76 50 100 50C124 50 142 62 142 98C130 88 120 88 100 94C80 88 70 88 58 98Z"
            fill={ARTIST_A_CHARACTER_SPEC.palette.hair}
          />

          {/* Artist Eyes */}
          <ellipse cx="86" cy="106" rx="4.5" ry="6" fill="#1E1B4B" />
          <ellipse cx="114" cy="106" rx="4.5" ry="6" fill="#1E1B4B" />
          <circle cx="88" cy="104" r="1.5" fill="#FFFFFF" />
          <circle cx="116" cy="104" r="1.5" fill="#FFFFFF" />

          {/* Gentle Smile */}
          <path d="M94 122C97 125 103 125 106 122" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
          {accessory?.id === 'earpiece_glow' && <g data-testid="earpiece-glow-accessory"><circle cx="143" cy="107" r="9" fill="#34D399" opacity=".3" /><circle cx="143" cy="107" r="5" fill="#34D399" stroke="#047857" strokeWidth="2" /></g>}
          {accessory?.id === 'visor_neon' && <g data-testid="visor-neon-accessory"><rect x="69" y="98" width="62" height="17" rx="5" fill="#7545AA" stroke="#67E8F9" strokeWidth="2" /><path d="M76 104H122" stroke="#FFF" opacity=".7" /></g>}
          {accessory?.id === 'accessory_classic' && <g data-testid="star-badge-accessory"><path d="M78 171L82 180H92L84 186L87 196L78 190L69 196L72 186L64 180H74Z" fill="#FBBF24" stroke="#B45309" /></g>}
        </svg>
      )}
    </div>
  );
};
