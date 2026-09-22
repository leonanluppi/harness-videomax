// ─── Auth screens (login + register) ────────────────────────────────────
function VMAuthShell({ t, children, side }) {
  return (
    <div style={{
      width:'100%', height:'100%', background: t.paper, color: t.ink,
      fontFamily:'Geist, ui-sans-serif',
      display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr auto',
    }}>
      {/* Left brand panel */}
      <div style={{
        background: t.panel, borderRight: `1px solid ${t.line}`,
        padding: '28px 32px', display:'flex', flexDirection:'column',
        position:'relative', overflow:'hidden',
      }}>
        <VMWordmark t={t} size={16} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap: 20 }}>
          <div style={{
            fontFamily:'"Geist Mono", monospace', fontSize: 11,
            color: t.accent, letterSpacing:'0.08em',
          }}>VIDEOMAX · PRIVATE LIBRARY</div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing:'-0.025em', lineHeight: 1.08 }}>
            Your videos,<br/>transcribed and<br/>searchable.
          </div>
          {/* mini demo card */}
          <div style={{
            marginTop: 12, background: t.surface, border: `1px solid ${t.line}`,
            borderRadius: 8, overflow:'hidden', boxShadow: t.shadowMd,
          }}>
            <VMThumb t={t} hue={35} label="LECTURE · WEEK 04" duration="48:12"/>
            <div style={{ padding:'10px 12px', borderTop: `1px solid ${t.line}` }}>
              {[
                { t:'12:04', x:'Okay, so the loss function here...' },
                { t:'12:11', x:'...and that gradient tells us the direction.', on:true },
                { t:'12:19', x:'Which is why backprop just works.' },
              ].map((s,i)=>(
                <div key={i} style={{
                  display:'grid', gridTemplateColumns:'44px 1fr', gap: 8,
                  padding:'5px 6px',
                  background: s.on ? t.accentLo : 'transparent',
                  borderLeft: s.on ? `2px solid ${t.accent}` : '2px solid transparent',
                  borderRadius: 3, margin:'1px 0',
                }}>
                  <span style={{
                    fontFamily:'"Geist Mono", monospace', fontSize: 10.5,
                    color: s.on ? t.accentInk : t.muted,
                  }}>{s.t}</span>
                  <span style={{ fontSize: 11.5, color: s.on ? t.ink : t.ink2 }}>{s.x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          fontFamily:'"Geist Mono", monospace', fontSize: 10,
          color: t.muted, letterSpacing:'0.06em',
        }}>{side}</div>
      </div>
      {/* Right form */}
      <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column' }}>
        {children}
      </div>
      {/* Footer spans both columns */}
      <div style={{ gridColumn: '1 / -1' }}>
        <VMFooter t={t} variant="dim"/>
      </div>
    </div>
  );
}

function VMField({ t, label, value, placeholder, hint, mono=false, error, type='text' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: t.ink2 }}>{label}</label>
      <div style={{
        height: 38, padding:'0 12px',
        background: t.surface, border: `1px solid ${error ? t.err : t.lineStrong}`,
        borderRadius: 6, display:'flex', alignItems:'center',
        fontSize: 13, color: value ? t.ink : t.faint,
        fontFamily: mono ? '"Geist Mono", monospace' : 'Geist, ui-sans-serif',
      }}>
        {type === 'password' ? '••••••••••' : (value || placeholder)}
      </div>
      {hint && !error && <div style={{ fontSize: 11, color: t.muted }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: t.err }}>{error}</div>}
    </div>
  );
}

function VMLogin({ t }) {
  return (
    <VMAuthShell t={t} side="SECURE COOKIE · 30 DAY SESSION">
      <div style={{ textAlign:'right', fontSize: 12, color: t.muted }}>
        No account? <span style={{ color: t.accent, fontWeight: 500 }}>Create one →</span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth: 380, width:'100%', margin:'0 auto' }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing:'-0.02em', marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 22 }}>Sign in to open your library.</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          <VMField t={t} label="Email" value="camila@studio.co" mono/>
          <VMField t={t} label="Password" type="password" value="x"/>
          <VMButton t={t} variant="solid" size="lg" style={{ marginTop: 4, width:'100%' }}>Sign in</VMButton>
        </div>
      </div>
      <div style={{ fontSize: 11, color: t.faint, textAlign:'center', fontFamily:'"Geist Mono", monospace', letterSpacing:'0.04em' }}>
        VIDEOMAX
      </div>
    </VMAuthShell>
  );
}

function VMRegister({ t }) {
  return (
    <VMAuthShell t={t} side="PASSWORD ≥ 8 CHARS · 1 LETTER + 1 NUMBER">
      <div style={{ textAlign:'right', fontSize: 12, color: t.muted }}>
        Have an account? <span style={{ color: t.accent, fontWeight: 500 }}>Sign in →</span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth: 380, width:'100%', margin:'0 auto' }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing:'-0.02em', marginBottom: 4 }}>Create your library</div>
        <div style={{ fontSize: 13, color: t.muted, marginBottom: 22 }}>Free forever · unlimited videos.</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          <VMField t={t} label="Full name" value="Camila Rocha"/>
          <VMField t={t} label="Email" value="camila@studio.co" mono/>
          <VMField t={t} label="Password" type="password" value="x" hint="8+ chars · at least one letter and one number"/>
          <VMField t={t} label="Confirm password" type="password" value="x"/>
          <VMButton t={t} variant="solid" size="lg" style={{ marginTop: 4, width:'100%' }}>Create account</VMButton>
        </div>
        <div style={{
          marginTop: 16, fontSize: 11, color: t.muted, textAlign:'center',
        }}>By creating an account you agree to our Terms and Privacy notice.</div>
      </div>
      <div style={{ fontSize: 11, color: t.faint, textAlign:'center', fontFamily:'"Geist Mono", monospace', letterSpacing:'0.04em' }}>
        VIDEOMAX
      </div>
    </VMAuthShell>
  );
}

Object.assign(window, { VMLogin, VMRegister });
