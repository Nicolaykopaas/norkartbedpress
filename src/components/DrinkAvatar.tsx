import { useState } from 'react';
import type { DrinkId } from '../types/pubgolf';
import { PROFILER, type Profil } from '../data/profiler';

function Hode({ p }: { p: Profil }) {
  return (
    <g>
      {p.harStil === 'langt' && (
        <path
          d="M58 70 Q60 30 100 30 Q140 30 142 70 L146 130 Q100 140 54 130 Z"
          fill={p.har}
        />
      )}
      <rect x="90" y="108" width="20" height="18" fill={p.hud} />
      <ellipse cx="100" cy="80" rx="34" ry="38" fill={p.hud} />
      {p.harStil === 'kort' && (
        <path
          d="M66 74 Q64 40 100 40 Q136 40 134 74 Q120 56 100 58 Q80 56 66 74 Z"
          fill={p.har}
        />
      )}
      {p.harStil === 'langt' && (
        <path
          d="M66 72 Q70 42 100 42 Q130 42 134 72 Q112 52 90 60 Q76 64 66 72 Z"
          fill={p.har}
        />
      )}
      {p.harStil === 'bolle' && (
        <>
          <circle cx="100" cy="36" r="14" fill={p.har} />
          <path
            d="M66 74 Q64 44 100 44 Q136 44 134 74 Q118 58 100 58 Q82 58 66 74 Z"
            fill={p.har}
          />
        </>
      )}
      {p.harStil === 'skallet' && (
        <path
          d="M66 86 Q64 72 70 64 L72 88 Z M134 86 Q136 72 130 64 L128 88 Z"
          fill={p.har}
        />
      )}
      {p.harStil === 'caps' && (
        <>
          <path d="M64 70 Q66 38 100 38 Q134 38 136 70 Z" fill={p.genser} />
          <rect x="96" y="64" width="58" height="8" rx="4" fill={p.genser} />
        </>
      )}
      {p.skjegg && (
        <path
          d="M70 90 Q72 122 100 122 Q128 122 130 90 Q118 104 100 104 Q82 104 70 90 Z"
          fill={p.har}
        />
      )}
      <circle cx="87" cy="80" r="3.5" fill="#1f2937" />
      <circle cx="113" cy="80" r="3.5" fill="#1f2937" />
      <path
        d="M86 70 L94 68 M106 68 L114 70"
        stroke="#1f2937"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M88 98 Q100 108 112 98"
        stroke="#9a3412"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="94" r="5" fill="#f87171" opacity="0.35" />
      <circle cx="120" cy="94" r="5" fill="#f87171" opacity="0.35" />
    </g>
  );
}

/** Drinken sitter i hånda ved (150, 150) */
function Drink({ p }: { p: Profil }) {
  switch (p.glass) {
    case 'pint':
    case 'stout':
      return (
        <g>
          <path
            d="M132 118 L168 118 L164 178 L136 178 Z"
            fill="#e0f2fe"
            opacity="0.6"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path d="M134 128 L166 128 L163 176 L137 176 Z" fill={p.drikke} />
          <path d="M132 118 L168 118 L167 130 L133 130 Z" fill={p.skum} />
          {p.glass === 'stout' && (
            <text
              x="150"
              y="160"
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#e7d9b8"
            >
              G
            </text>
          )}
        </g>
      );
    case 'boks':
      return (
        <g>
          <rect
            x="136"
            y="122"
            width="28"
            height="54"
            rx="5"
            fill={p.drikke}
            stroke="#64748b"
            strokeWidth="2"
          />
          <rect x="136" y="140" width="28" height="14" fill="#f472b6" />
          <rect x="142" y="118" width="16" height="5" rx="2" fill="#94a3b8" />
        </g>
      );
    case 'shot':
      return (
        <g>
          <path
            d="M138 146 L162 146 L159 176 L141 176 Z"
            fill="#e0f2fe"
            opacity="0.7"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M140 154 L160 154 L158 174 L142 174 Z"
            fill="#fbbf24"
            opacity="0.8"
          />
        </g>
      );
    case 'highball':
      return (
        <g>
          <rect
            x="136"
            y="116"
            width="28"
            height="62"
            rx="3"
            fill={p.drikke}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <circle cx="146" cy="136" r="3" fill="#fff" />
          <circle cx="154" cy="150" r="2.5" fill="#fff" />
          <circle
            cx="164"
            cy="118"
            r="9"
            fill="#84cc16"
            stroke="#fff"
            strokeWidth="2"
          />
          <rect
            x="152"
            y="100"
            width="3"
            height="30"
            fill="#ef4444"
            transform="rotate(12 152 100)"
          />
        </g>
      );
    case 'vin':
      return (
        <g>
          <path
            d="M136 118 Q136 150 150 152 Q164 150 164 118 Z"
            fill="#e0f2fe"
            opacity="0.6"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M137 132 Q139 149 150 150 Q161 149 163 132 Z"
            fill={p.drikke}
          />
          <rect x="148.5" y="152" width="3" height="20" fill="#94a3b8" />
          <ellipse cx="150" cy="174" rx="12" ry="3" fill="#94a3b8" />
        </g>
      );
    case 'flaske':
      return (
        <g>
          <rect x="138" y="132" width="24" height="46" rx="6" fill={p.drikke} />
          <rect x="145" y="110" width="10" height="24" rx="3" fill={p.drikke} />
          <rect x="138" y="146" width="24" height="14" fill="#fef9c3" />
          <text
            x="150"
            y="157"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill="#166534"
          >
            0,0
          </text>
        </g>
      );
  }
}

function Illustrasjon({ id }: { id: DrinkId }) {
  const p = PROFILER[id];
  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${p.profilnavn} med ${id}`}
    >
      <rect width="200" height="200" fill={p.bakgrunn} />
      <path d="M40 200 Q42 140 100 132 Q158 140 160 200 Z" fill={p.genser} />
      <Hode p={p} />
      <path
        d="M150 200 L152 168"
        stroke={p.genser}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <Drink p={p} />
      <circle cx="150" cy="166" r="9" fill={p.hud} />
    </svg>
  );
}

/** Viser public/drinks/<id>.jpg hvis den finnes, ellers en tegnet person. */
export function DrinkAvatar({ id }: { id: DrinkId }) {
  const [feil, setFeil] = useState(false);
  const bilde = `${import.meta.env.BASE_URL}drinks/${id}.jpg`;
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {feil ? (
        <Illustrasjon id={id} />
      ) : (
        <img
          src={bilde}
          alt={PROFILER[id].profilnavn}
          draggable={false}
          onError={() => setFeil(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
