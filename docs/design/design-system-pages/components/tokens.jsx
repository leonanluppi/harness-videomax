// Design tokens for Videomax — two directions

const VM_TOKENS = {
  A: {
    name: 'Ember',
    tagline: 'Warm paper · creator studio',
    // surfaces
    paper:      'oklch(0.985 0.005 80)',   // warm cream
    surface:    '#ffffff',
    panel:      'oklch(0.975 0.007 75)',
    sunken:     'oklch(0.955 0.01 75)',
    line:       'oklch(0.92 0.012 70)',
    lineStrong: 'oklch(0.86 0.015 65)',
    // ink
    ink:        'oklch(0.18 0.02 50)',
    ink2:       'oklch(0.32 0.015 50)',
    muted:      'oklch(0.52 0.012 60)',
    faint:      'oklch(0.68 0.01 60)',
    // accent
    accent:     '#F97316',
    accentHi:   '#EA580C',
    accentLo:   '#FFF1E6',
    accentInk:  '#7A2E05',
    // status
    ok:         'oklch(0.62 0.15 155)',
    okBg:       'oklch(0.95 0.04 155)',
    warn:       'oklch(0.72 0.15 75)',
    warnBg:     'oklch(0.96 0.05 80)',
    err:        'oklch(0.58 0.18 28)',
    errBg:      'oklch(0.95 0.04 28)',
    info:       'oklch(0.55 0.13 250)',
    infoBg:     'oklch(0.95 0.025 250)',
    // shadows
    shadowSm:   '0 1px 2px rgba(30,15,5,0.06)',
    shadowMd:   '0 1px 2px rgba(30,15,5,0.06), 0 4px 14px rgba(30,15,5,0.08)',
    shadowLg:   '0 2px 4px rgba(30,15,5,0.06), 0 12px 32px rgba(30,15,5,0.10)',
  },
  B: {
    name: 'Signal',
    tagline: 'Dark studio · electric orange',
    paper:      'oklch(0.14 0.012 250)',
    surface:    'oklch(0.17 0.013 250)',
    panel:      'oklch(0.19 0.014 250)',
    sunken:     'oklch(0.12 0.011 250)',
    line:       'oklch(0.26 0.015 250)',
    lineStrong: 'oklch(0.34 0.018 250)',
    ink:        'oklch(0.97 0.008 80)',
    ink2:       'oklch(0.88 0.01 80)',
    muted:      'oklch(0.65 0.015 250)',
    faint:      'oklch(0.48 0.015 250)',
    accent:     '#FB8B3D',
    accentHi:   '#F97316',
    accentLo:   'oklch(0.26 0.07 50)',
    accentInk:  '#FFD9B8',
    ok:         'oklch(0.75 0.15 155)',
    okBg:       'oklch(0.26 0.06 155)',
    warn:       'oklch(0.82 0.14 85)',
    warnBg:     'oklch(0.28 0.06 85)',
    err:        'oklch(0.72 0.17 28)',
    errBg:      'oklch(0.28 0.07 28)',
    info:       'oklch(0.72 0.12 250)',
    infoBg:     'oklch(0.26 0.05 250)',
    shadowSm:   '0 1px 2px rgba(0,0,0,0.4)',
    shadowMd:   '0 1px 2px rgba(0,0,0,0.4), 0 4px 14px rgba(0,0,0,0.5)',
    shadowLg:   '0 2px 4px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.6)',
  },
};

// Videomax mark — play triangle inscribed in square, with a single
// "transcription segment" line cutting across. Uses currentColor.
function VMMark({ size = 22, stroke = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         style={{ display: 'block', flexShrink: 0 }}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5"
            stroke="currentColor" strokeWidth={stroke} />
      <path d="M9 8.2 L16.5 12 L9 15.8 Z"
            fill="currentColor" />
      <line x1="2.5" y1="17.5" x2="21.5" y2="17.5"
            stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
            opacity="0.35" />
    </svg>
  );
}

function VMWordmark({ t, size = 18, withMark = true, tight = true }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.42,
      color: t.ink, fontFamily: 'Geist, ui-sans-serif',
    }}>
      {withMark && (
        <span style={{ color: t.accent }}>
          <VMMark size={size * 1.15} />
        </span>
      )}
      <span style={{
        fontSize: size, fontWeight: 600,
        letterSpacing: tight ? '-0.02em' : 0,
        lineHeight: 1,
      }}>
        videomax<span style={{ color: t.accent }}>.</span>
      </span>
    </div>
  );
}

Object.assign(window, { VM_TOKENS, VMMark, VMWordmark });
