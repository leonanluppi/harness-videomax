// Shared UI primitives for Videomax mockups. Token-driven.

// ─── Icons ──────────────────────────────────────────────────────────────
const I = {
  search: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  upload: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v13"/><path d="m7 8 5-5 5 5"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>,
  grid: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  list: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  play: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 5v14l12-7z"/></svg>,
  folder: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  tag: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>,
  more: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  bell: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 16V11a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  x: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>,
  check: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m4 12 5 5L20 6"/></svg>,
  arrowR: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  plus: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  chev: (p={}) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>,
  sparkle: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2 13.9 8.1 20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z"/><path d="M19 3 19.7 5.3 22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.7z" opacity=".5"/></svg>,
  loop: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3M21 4v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3M3 20v-5h5"/></svg>,
  mic: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>,
  caption: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 13c0 1 1 2 2 2s2-1 2-1"/><path d="M13 13c0 1 1 2 2 2s2-1 2-1"/></svg>,
  doc: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 14h6M9 17h4"/></svg>,
};

// ─── Button ─────────────────────────────────────────────────────────────
function VMButton({ t, variant='solid', size='md', icon, children, style={}, ...p }) {
  const sz = { sm:{h:28,px:10,fs:12,g:6}, md:{h:32,px:12,fs:13,g:6}, lg:{h:40,px:16,fs:14,g:8} }[size];
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, gap: sz.g,
    fontFamily: 'Geist, ui-sans-serif', fontWeight: 500,
    letterSpacing: '-0.005em',
    borderRadius: 6, border: '1px solid transparent',
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all 120ms ease-out',
  };
  const variants = {
    solid: { background: t.accent, color: '#fff', boxShadow: t.shadowSm, borderColor: t.accentHi },
    outline: { background: t.surface, color: t.ink, borderColor: t.lineStrong },
    ghost: { background: 'transparent', color: t.ink2, borderColor: 'transparent' },
    dim: { background: t.sunken, color: t.ink2, borderColor: t.line },
  };
  return (
    <button {...p} style={{ ...base, ...variants[variant], ...style }}>
      {icon}{children}
    </button>
  );
}

// ─── Badge (status, tag, meta) ──────────────────────────────────────────
function VMBadge({ t, tone='neutral', children, mono=false, dot=false, style={} }) {
  const tones = {
    neutral: { bg: t.sunken, fg: t.ink2, bd: t.line },
    accent:  { bg: t.accentLo, fg: t.accentInk, bd: 'transparent' },
    ok:      { bg: t.okBg, fg: t.ok, bd: 'transparent' },
    warn:    { bg: t.warnBg, fg: t.warn, bd: 'transparent' },
    err:     { bg: t.errBg, fg: t.err, bd: 'transparent' },
    info:    { bg: t.infoBg, fg: t.info, bd: 'transparent' },
  };
  const c = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', height: 20, borderRadius: 4,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      fontSize: 11, fontWeight: 500,
      letterSpacing: mono ? '0' : '-0.005em',
      fontFamily: mono ? '"Geist Mono", ui-monospace, monospace' : 'Geist, ui-sans-serif',
      textTransform: mono ? 'none' : 'none',
      lineHeight: 1,
      ...style,
    }}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: 999, background: c.fg,
      }}/>}
      {children}
    </span>
  );
}

// ─── Input ──────────────────────────────────────────────────────────────
function VMInput({ t, icon, placeholder, value, trailing, style={} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 32, padding: '0 10px',
      background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: 6, color: t.ink,
      fontSize: 13, fontFamily: 'Geist, ui-sans-serif',
      boxShadow: t.shadowSm,
      ...style,
    }}>
      {icon && <span style={{ color: t.muted, display: 'flex' }}>{icon}</span>}
      <span style={{
        flex: 1, color: value ? t.ink : t.faint,
      }}>{value || placeholder}</span>
      {trailing}
    </div>
  );
}

// ─── Status pill (for pipeline stages) ──────────────────────────────────
function VMStatus({ t, stage }) {
  const map = {
    uploading:    { tone:'info',    label:'Uploading',    dot:true },
    validating:   { tone:'info',    label:'Validating',   dot:true },
    transcribing: { tone:'warn',    label:'Transcribing', dot:true },
    summarizing:  { tone:'accent',  label:'Summarizing',  dot:true },
    ready:        { tone:'ok',      label:'Ready',        dot:false },
    failed:       { tone:'err',     label:'Failed',       dot:false },
  };
  const s = map[stage];
  return <VMBadge t={t} tone={s.tone} dot={s.dot}>{s.label}</VMBadge>;
}

// ─── Waveform ───────────────────────────────────────────────────────────
function VMWaveform({ t, bars=52, active=0.4, height=28, color }) {
  // deterministic pseudo-random heights
  const hs = React.useMemo(() => {
    const arr = [];
    let x = 0.42;
    for (let i = 0; i < bars; i++) {
      x = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
      arr.push(Math.max(0.18, (x * 0.7 + 0.3) * env));
    }
    return arr;
  }, [bars]);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 2, height,
    }}>
      {hs.map((h,i) => {
        const isActive = i / bars <= active;
        return (
          <span key={i} style={{
            width: 2, height: `${h*100}%`,
            background: isActive ? (color || t.accent) : t.lineStrong,
            borderRadius: 1,
            opacity: isActive ? 1 : 0.7,
          }}/>
        );
      })}
    </div>
  );
}

// ─── Thumbnail placeholder ──────────────────────────────────────────────
function VMThumb({ t, hue=40, label, duration, ratio='16/9', children, style={} }) {
  return (
    <div style={{
      position:'relative', aspectRatio: ratio, width:'100%',
      background: `linear-gradient(135deg, oklch(0.32 0.02 ${hue}) 0%, oklch(0.18 0.03 ${hue+30}) 100%)`,
      borderRadius: 4, overflow:'hidden',
      ...style,
    }}>
      {/* diagonal stripe texture */}
      <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.08 }}>
        <defs>
          <pattern id={`s${hue}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#fff" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#s${hue})`}/>
      </svg>
      {label && (
        <div style={{
          position:'absolute', left: 8, top: 8,
          fontFamily:'"Geist Mono", monospace', fontSize: 10,
          color:'rgba(255,255,255,0.72)', letterSpacing:'0.04em',
        }}>{label}</div>
      )}
      {duration && (
        <div style={{
          position:'absolute', right: 6, bottom: 6,
          padding:'2px 5px', borderRadius: 3,
          background:'rgba(0,0,0,0.65)',
          fontFamily:'"Geist Mono", monospace', fontSize: 10,
          color:'#fff', letterSpacing:'0.02em',
        }}>{duration}</div>
      )}
      {children}
    </div>
  );
}

// ─── Divider label (section heading) ────────────────────────────────────
function VMSectionLabel({ t, children, right, style={} }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 10,
      fontFamily:'"Geist Mono", monospace', fontSize: 10,
      color: t.muted, textTransform:'uppercase', letterSpacing:'0.1em',
      ...style,
    }}>
      <span>{children}</span>
      <span style={{ flex:1, height: 1, background: t.line }}/>
      {right}
    </div>
  );
}

Object.assign(window, {
  I, VMButton, VMBadge, VMInput, VMStatus, VMWaveform, VMThumb, VMSectionLabel,
});
