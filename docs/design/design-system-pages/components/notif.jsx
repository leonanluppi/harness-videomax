// ─── Notification panel (bottom-right) ──────────────────────────────────
function VMNotifPanel({ t, docked=false }) {
  const items = [
    { title:'Lecture 05 — RNN vs attention',            stage:'uploading',    pct: 62, hue:50 },
    { title:'Transformer lecture — week 04',            stage:'transcribing', pct: 43, hue:35 },
    { title:'Standup · 04-17 · backend',                stage:'summarizing',  pct: 85, hue:210 },
    { title:'Interview with Marisol (take 2)',          stage:'ready',        pct:100, hue:20  },
    { title:'Onboarding walkthrough (v2)',              stage:'failed',       pct: 30, hue:10, reason:'Transcription service unavailable' },
  ];
  const active = items.filter(i => !['ready','failed'].includes(i.stage)).length;

  return (
    <div style={{
      width: docked ? '100%' : 340,
      background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: 10, boxShadow: t.shadowLg, overflow:'hidden',
      fontFamily:'Geist, ui-sans-serif', color: t.ink,
    }}>
      {/* header */}
      <div style={{
        display:'flex', alignItems:'center', gap: 8,
        padding:'10px 14px', borderBottom: `1px solid ${t.line}`,
        background: t.panel,
      }}>
        <span style={{
          position:'relative', color: t.accent, display:'inline-flex',
        }}>
          <I.bell/>
          <span style={{
            position:'absolute', top: -3, right: -3, width: 7, height: 7,
            borderRadius: 999, background: t.accent,
            boxShadow: `0 0 0 2px ${t.panel}`,
          }}/>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing:'-0.01em' }}>Processing</span>
        <VMBadge t={t} tone="accent">{active} active</VMBadge>
        <span style={{ flex:1 }}/>
        <span style={{ color: t.muted, cursor:'pointer', display:'flex' }}><I.chev style={{ transform:'rotate(90deg)' }}/></span>
      </div>
      <div>
        {items.map((it, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'52px 1fr auto', gap: 10,
            padding:'10px 12px',
            borderBottom: i < items.length-1 ? `1px solid ${t.line}` : 'none',
            alignItems:'center',
          }}>
            <div style={{ width: 48, position:'relative' }}>
              <VMThumb t={t} hue={it.hue} ratio="16/10"/>
              {it.stage !== 'ready' && it.stage !== 'failed' && (
                <div style={{
                  position:'absolute', inset:0, borderRadius: 4,
                  background:'rgba(0,0,0,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontFamily:'"Geist Mono", monospace', fontSize: 10,
                }}>{it.pct}%</div>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 500, color: t.ink,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                marginBottom: 4,
              }}>{it.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <VMStatus t={t} stage={it.stage}/>
                {!['ready','failed'].includes(it.stage) && (
                  <div style={{
                    flex:1, height: 3, background: t.sunken, borderRadius: 999, overflow:'hidden',
                    maxWidth: 110,
                  }}>
                    <div style={{ width:`${it.pct}%`, height:'100%', background: t.accent }}/>
                  </div>
                )}
                {it.reason && <span style={{ fontSize: 10.5, color: t.err }}>{it.reason}</span>}
              </div>
            </div>
            <span style={{ color: t.muted, cursor:'pointer', display:'flex' }}>
              {['ready','failed'].includes(it.stage)
                ? <I.x/>
                : <I.loop/>}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        padding:'8px 14px',
        fontFamily:'"Geist Mono", monospace', fontSize: 10.5,
        color: t.muted, letterSpacing:'0.04em',
        borderTop: `1px solid ${t.line}`,
        display:'flex', justifyContent:'space-between',
      }}>
        <span>REAL-TIME · EN</span>
        <span style={{ color: t.accent, cursor:'pointer' }}>CLEAR DONE</span>
      </div>
    </div>
  );
}

Object.assign(window, { VMNotifPanel });
