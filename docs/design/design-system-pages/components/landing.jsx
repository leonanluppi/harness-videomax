// ─── Landing page ───────────────────────────────────────────────────────
function VMLanding({ t }) {
  const [active, setActive] = React.useState(2);
  const segments = [
    { t: '00:00', text: "So the first thing we do is drop the video straight into the browser." },
    { t: '00:12', text: "No sign-up gates, no clip length limits — just the raw file." },
    { t: '00:28', text: "A couple seconds in, the pipeline picks it up and starts transcribing.", lang: 'EN' },
    { t: '00:47', text: "You can actually watch the segments stream in, word by word." },
    { t: '01:09', text: "Then the summary lands at the bottom with the key topics pulled out." },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.paper, color: t.ink,
      fontFamily: 'Geist, ui-sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', borderBottom: `1px solid ${t.line}`,
      }}>
        <VMWordmark t={t} size={18} />
        <nav style={{ display:'flex', alignItems:'center', gap: 18, fontSize: 13, color: t.ink2 }}>
          <span style={{ color: t.ink2 }}>Log in</span>
          <VMButton t={t} variant="solid" size="md" icon={<I.arrowR/>}>Create account</VMButton>
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        padding: '64px 48px 32px',
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center',
      }}>
        <div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 8,
            padding:'5px 10px 5px 6px', borderRadius: 999,
            background: t.accentLo, color: t.accentInk,
            fontSize: 11, fontWeight: 500,
            border: `1px solid ${t.line}`,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 999, background: t.accent,
              color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}><I.sparkle/></span>
            Automatic transcription · searchable library
          </div>
          <h1 style={{
            fontSize: 68, lineHeight: 1.02, letterSpacing: '-0.035em',
            fontWeight: 600, margin: '22px 0 20px',
            color: t.ink, textWrap: 'balance',
          }}>
            Upload a video.<br/>
            <span style={{ color: t.muted }}>Read it in </span>
            <span style={{ color: t.accent }}>three minutes</span><span style={{ color: t.muted }}>.</span>
          </h1>
          <p style={{
            fontSize: 17, lineHeight: 1.55, color: t.ink2, maxWidth: 520,
            margin: 0,
          }}>
            Videomax turns hours of lectures, interviews, and raw footage into
            timestamped transcripts and clean summaries you can actually search.
            Drop in a file, walk away, come back to something you can read.
          </p>
          <div style={{ display:'flex', gap: 10, marginTop: 28 }}>
            <VMButton t={t} variant="solid" size="lg" icon={<I.upload/>}>Create account</VMButton>
            <VMButton t={t} variant="outline" size="lg">Log in</VMButton>
          </div>
        </div>

        {/* Interactive demo panel */}
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`,
          borderRadius: 12, boxShadow: t.shadowLg, overflow: 'hidden',
        }}>
          {/* chrome */}
          <div style={{
            display:'flex', alignItems:'center', gap: 8,
            padding:'10px 14px', borderBottom: `1px solid ${t.line}`,
            background: t.panel,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: t.lineStrong }}/>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: t.lineStrong }}/>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: t.lineStrong }}/>
            <div style={{
              marginLeft: 8, fontFamily:'"Geist Mono", monospace', fontSize: 11,
              color: t.muted,
            }}>videomax.app/demo</div>
            <div style={{ flex: 1 }}/>
            <VMBadge t={t} tone="ok" dot>Ready · EN</VMBadge>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr' }}>
            {/* player */}
            <div style={{ padding: 14, borderRight: `1px solid ${t.line}` }}>
              <VMThumb t={t} hue={35} label="INTERVIEW · TAKE 02" duration="14:28">
                <div style={{
                  position:'absolute', inset:0, display:'flex',
                  alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 999,
                    background: t.accent, color: '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                  }}><I.play/></div>
                </div>
              </VMThumb>
              {/* summary teaser */}
              <div style={{
                marginTop: 14, padding: '12px 12px',
                background: t.sunken, borderRadius: 6,
                border: `1px solid ${t.line}`,
              }}>
                <div style={{
                  fontFamily:'"Geist Mono", monospace', fontSize: 10,
                  color: t.muted, textTransform:'uppercase',
                  letterSpacing:'0.08em', marginBottom: 6,
                }}>Summary · overview</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: t.ink2 }}>
                  A walk-through of the first-upload flow, from drop-zone to
                  ready-to-read transcript. Covers file limits, the pipeline's
                  three stages, and how the summary block is assembled.
                </div>
              </div>
            </div>
            {/* transcription */}
            <div style={{ padding: '10px 4px 10px 10px' }}>
              <div style={{
                display:'flex', alignItems:'center', gap: 6,
                padding:'0 8px 8px',
              }}>
                <I.search style={{ color: t.muted }}/>
                <span style={{ fontSize: 12, color: t.faint }}>Search transcript…</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {segments.map((s, i) => {
                  const on = i === active;
                  return (
                    <div key={i}
                         onClick={() => setActive(i)}
                         style={{
                           display:'grid', gridTemplateColumns:'48px 1fr', gap: 10,
                           padding:'8px 10px', cursor:'pointer',
                           background: on ? t.accentLo : 'transparent',
                           borderLeft: on ? `2px solid ${t.accent}` : '2px solid transparent',
                           borderRadius: 4,
                         }}>
                      <span style={{
                        fontFamily:'"Geist Mono", monospace', fontSize: 11,
                        color: on ? t.accentInk : t.muted,
                      }}>{s.t}</span>
                      <span style={{
                        fontSize: 12.5, lineHeight: 1.5,
                        color: on ? t.ink : t.ink2,
                      }}>{s.text}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{
                marginTop: 8, padding: '8px 10px',
                fontFamily:'"Geist Mono", monospace', fontSize: 10,
                color: t.muted, display:'flex', alignItems:'center', gap: 8,
              }}>
                <span style={{ color: t.accent }}>▸</span>
                CLICK A SEGMENT → VIDEO JUMPS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How-it-works strip */}
      <section style={{
        padding: '16px 48px 48px',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 1,
          background: t.line, border: `1px solid ${t.line}`,
          borderRadius: 8, overflow:'hidden',
        }}>
          {[
            { n:'01', i:<I.upload/>, h:'Drop it in',    d:'Drag a file up to 2 GB into the library. We handle the weird codecs.' },
            { n:'02', i:<I.mic/>,    h:'We transcribe', d:'Language is detected automatically and the transcript streams in as timestamped segments you can click.' },
            { n:'03', i:<I.doc/>,    h:'You read',      d:'An AI-written overview plus key topics lands below the player. The transcript sits in a side-panel.' },
          ].map((s, i) => (
            <div key={i} style={{
              background: t.surface, padding: '22px 24px',
              display:'flex', flexDirection:'column', gap: 10,
            }}>
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <span style={{
                  fontFamily:'"Geist Mono", monospace', fontSize: 11,
                  color: t.accent, letterSpacing:'0.06em',
                }}>STEP {s.n}</span>
                <span style={{ color: t.muted }}>{s.i}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:'-0.02em' }}>{s.h}</div>
              <div style={{ fontSize: 13, color: t.ink2, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <VMFooter t={t} style={{ marginTop: 'auto' }}/>
    </div>
  );
}

Object.assign(window, { VMLanding });
