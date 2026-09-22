// Shared footer used across landing, auth, and app shell.
// Slim bar — wordmark left, copyright + legal links right. Mono type for micro-labels.

function VMFooter({ t, variant = 'light', style = {} }) {
  // 'light' = sits over paper/surface; 'dim' = sits over panel/sunken
  const bg = variant === 'dim' ? t.sunken : 'transparent';
  return (
    <footer style={{
      padding: '14px 24px',
      borderTop: `1px solid ${t.line}`,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      fontSize: 11.5,
      color: t.muted,
      fontFamily: '"Geist Mono", ui-monospace, monospace',
      letterSpacing: '0.02em',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <VMWordmark t={t} size={12} />
        <span style={{ color: t.faint }}>© 2026</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ cursor: 'pointer' }}>Privacy</span>
        <span style={{ cursor: 'pointer' }}>Terms</span>
        <span style={{ cursor: 'pointer' }}>Contact</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          paddingLeft: 14, borderLeft: `1px solid ${t.line}`,
          color: t.faint,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: t.ok }}/>
          All systems operational
        </span>
      </div>
    </footer>
  );
}

Object.assign(window, { VMFooter });
