/**
 * TORCH — Badge Constants
 * Badge enum and SVG icon data (reused from draft screen).
 */

export const Badge = {
  FOOTBALL: 'FOOTBALL',
  CLEAT: 'CLEAT',
  HELMET: 'HELMET',
  CLIPBOARD: 'CLIPBOARD',
  GLOVE: 'GLOVE',
  SPEED_LINES: 'SPEED_LINES',
  CROSSHAIR: 'CROSSHAIR',
  BOLT: 'BOLT',
  PADLOCK: 'PADLOCK',
  BRICK: 'BRICK',
  FLAME: 'FLAME',
  EYE: 'EYE',
};

export const BADGE_LABELS = {
  FOOTBALL: 'Arm Talent',
  CLEAT: 'Pure Speed',
  HELMET: 'Toughness',
  CLIPBOARD: 'Football IQ',
  GLOVE: 'Sure Hands',
  SPEED_LINES: 'Explosive',
  CROSSHAIR: 'Precision',
  BOLT: 'Quick Twitch',
  PADLOCK: 'Lockdown',
  BRICK: 'Immovable',
  FLAME: 'Clutch',
  EYE: 'Vision',
};

/**
 * Returns SVG markup for a badge icon. Same SVGs used in the draft screen.
 * @param {string} badge - Badge constant
 * @param {string} color - Fill/stroke color
 * @returns {string} SVG markup
 */
export function badgeSvg(badge, color) {
  const s = 'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"';
  const f = ` fill="${color}"`;
  const st = ` stroke="${color}" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (badge) {
    case 'FOOTBALL':
      return `<svg ${s}><ellipse cx="8" cy="8" rx="6" ry="4"${f}/><line x1="5" y1="6" x2="5" y2="10" stroke="#000" stroke-width="0.6"/><line x1="8" y1="6" x2="8" y2="10" stroke="#000" stroke-width="0.6"/><line x1="11" y1="6" x2="11" y2="10" stroke="#000" stroke-width="0.6"/></svg>`;
    case 'CLEAT':
      return `<svg ${s}><path d="M3,11 L4,5 Q5,3 7,3 L12,3 Q13,3 13,4 L13,7 L14,8 L14,11 Q14,12 13,12 L4,12 Q3,12 3,11 Z"${f}/><line x1="5" y1="12" x2="5" y2="14" stroke="${color}" stroke-width="1"/><line x1="8" y1="12" x2="8" y2="14" stroke="${color}" stroke-width="1"/><line x1="11" y1="12" x2="11" y2="14" stroke="${color}" stroke-width="1"/></svg>`;
    case 'HELMET':
      return `<svg ${s}><path d="M4,12 L4,7 Q4,3 8,3 Q12,3 12,7 L12,9 L14,9 L14,11 L12,11 L12,12 Z"${f}/><rect x="12" y="6" width="2" height="2" rx="0.5" fill="#000" opacity="0.3"/></svg>`;
    case 'CLIPBOARD':
      return `<svg ${s}><rect x="3" y="3" width="10" height="12" rx="1"${st}/><rect x="6" y="1" width="4" height="3" rx="1"${st}/><line x1="5.5" y1="7" x2="10.5" y2="7"${st}/><line x1="5.5" y1="9.5" x2="10.5" y2="9.5"${st}/><line x1="5.5" y1="12" x2="8.5" y2="12"${st}/></svg>`;
    case 'GLOVE':
      return `<svg ${s}><path d="M5,14 L5,7 L4,4 Q4,2.5 5,3 L6,5 L6,3 Q6,1.5 7,2 L7.5,5 L8,2.5 Q8,1 9,1.5 L9.5,5 L10,3.5 Q10,2 11,2.5 L11,7 L12,6 Q13,5.5 13,7 L12,10 L11,14 Z"${f}/></svg>`;
    case 'SPEED_LINES':
      return `<svg ${s}><line x1="3" y1="4" x2="13" y2="4"${st}/><line x1="3" y1="8" x2="13" y2="8"${st}/><line x1="3" y1="12" x2="13" y2="12"${st}/><polygon points="11,2 14,4 11,6" fill="${color}"/><polygon points="11,6 14,8 11,10" fill="${color}"/><polygon points="11,10 14,12 11,14" fill="${color}"/></svg>`;
    case 'CROSSHAIR':
      return `<svg ${s}><circle cx="8" cy="8" r="5"${st}/><circle cx="8" cy="8" r="2"${st}/><line x1="8" y1="1" x2="8" y2="4"${st}/><line x1="8" y1="12" x2="8" y2="15"${st}/><line x1="1" y1="8" x2="4" y2="8"${st}/><line x1="12" y1="8" x2="15" y2="8"${st}/></svg>`;
    case 'BOLT':
      return `<svg ${s}><polygon points="9,1 4,9 7.5,9 6,15 12,7 8.5,7 10,1"${f}/></svg>`;
    case 'PADLOCK':
      return `<svg ${s}><rect x="3.5" y="7" width="9" height="7" rx="1.5"${f}/><path d="M5.5,7 L5.5,5 Q5.5,2 8,2 Q10.5,2 10.5,5 L10.5,7"${st}/><circle cx="8" cy="10.5" r="1" fill="#000" opacity="0.3"/></svg>`;
    case 'BRICK':
      return `<svg ${s}><rect x="2" y="4" width="5.5" height="3.5" rx="0.5"${f}/><rect x="8.5" y="4" width="5.5" height="3.5" rx="0.5"${f}/><rect x="2" y="8.5" width="5.5" height="3.5" rx="0.5"${f}/><rect x="8.5" y="8.5" width="5.5" height="3.5" rx="0.5"${f}/></svg>`;
    case 'FLAME':
      return `<svg ${s}><path d="M8,1 Q12,5 11,9 Q10.5,11 9,12 Q10,10 9,8 Q8,10 8,12 Q7,10 7,8 Q6,10 7,12 Q5.5,11 5,9 Q4,5 8,1 Z"${f}/></svg>`;
    case 'EYE':
      return `<svg ${s}><path d="M1,8 Q4,3 8,3 Q12,3 15,8 Q12,13 8,13 Q4,13 1,8 Z"${st}/><circle cx="8" cy="8" r="2.5"${f}/></svg>`;
    default:
      return '';
  }
}
