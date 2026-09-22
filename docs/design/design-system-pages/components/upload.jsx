// ─── Upload page (/app/upload) ─────────────────────────────────────────
// Dedicated page with drag-zone, active upload queue, and library-side
// context. Sits inside the app shell.

function VMUploadPage({ t }) {
  const queue = [
    { name:'lecture-05-rnn-vs-attention.mkv', size:'1.4 GB', pct: 72, state:'uploading', eta:'1m 20s' },
    { name:'standup-0417-backend.mp4',        size:'492 MB', pct:100, state:'validating' },
    { name:'interview-marisol-take2.mov',     size:'318 MB', pct:100, state:'transcribing' },
  ];

  return (
    <VMAppShell t={t} currentNav="" header={
      <>
        <span style={{ color: t.muted, fontSize: 12, display:'flex', alignItems:'center', gap: 6 }}>
          <I.grid/> Library <I.chev/>
        </span>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:'-0.02em' }}>Upload video</div>
        <VMBadge t={t} tone="accent" dot>{queue.filter(q=>q.state!=='ready').length} in queue</VMBadge>
        <div style={{ flex:1 }}/>
        <VMButton t={t} variant="ghost" size="md">Back to library</VMButton>
      </>
    }>
      <div style={{
        padding: 28, height:'100%', overflow:'auto',
        display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 28,
      }}>
        {/* Left: drag zone + queue */}
        <div style={{ display:'flex', flexDirection:'column', gap: 20, minWidth: 0 }}>
          {/* Drag zone */}
          <div style={{
            position:'relative',
            background: t.surface,
            border: `1.5px dashed ${t.accent}`,
            borderRadius: 12,
            padding: '56px 32px',
            textAlign:'center',
            boxShadow: t.shadowSm,
            overflow:'hidden',
          }}>
            {/* subtle corner ticks */}
            {[
              { top: 10, left: 10 }, { top: 10, right: 10 },
              { bottom: 10, left: 10 }, { bottom: 10, right: 10 },
            ].map((pos,i)=>(
              <span key={i} style={{
                position:'absolute', width: 10, height: 10,
                borderTop: `1px solid ${t.accent}`,
                borderLeft: `1px solid ${t.accent}`,
                opacity: 0.5,
                ...pos,
                transform:
                  pos.right !== undefined && pos.bottom !== undefined ? 'rotate(180deg)' :
                  pos.right !== undefined ? 'rotate(90deg)' :
                  pos.bottom !== undefined ? 'rotate(-90deg)' : '',
              }}/>
            ))}

            <div style={{
              width: 64, height: 64, borderRadius: 14,
              margin: '0 auto 18px',
              background: t.accentLo, color: t.accent,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>
              <I.upload style={{ width: 28, height: 28 }}/>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 600, letterSpacing:'-0.02em', color: t.ink,
              marginBottom: 6,
            }}>
              Drop your video here
            </div>
            <div style={{
              fontSize: 13.5, color: t.ink2, marginBottom: 22, lineHeight: 1.5,
              maxWidth: 440, margin: '0 auto 22px',
            }}>
              Or pick a file from your computer. One file at a time —
              we queue the rest automatically.
            </div>
            <div style={{ display:'flex', gap: 10, justifyContent:'center' }}>
              <VMButton t={t} variant="solid" size="lg" icon={<I.upload/>}>
                Choose file
              </VMButton>
              <VMButton t={t} variant="outline" size="lg">
                Paste URL
              </VMButton>
            </div>
            <div style={{
              marginTop: 28, paddingTop: 20, borderTop: `1px dashed ${t.line}`,
              display:'flex', justifyContent:'center', gap: 28,
              fontFamily:'"Geist Mono", monospace', fontSize: 11,
              color: t.muted, letterSpacing:'0.04em',
            }}>
              <span>MP4 · MOV · MKV · WEBM · AVI</span>
              <span>·</span>
              <span>MAX 2 GB</span>
              <span>·</span>
              <span>UP TO 2 H</span>
            </div>
          </div>

          {/* Queue */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
            overflow:'hidden',
          }}>
            <div style={{
              padding:'12px 16px', borderBottom: `1px solid ${t.line}`,
              display:'flex', alignItems:'center', gap: 10,
              background: t.panel,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.ink, letterSpacing:'-0.01em' }}>
                In this session
              </span>
              <VMBadge t={t}>{queue.length}</VMBadge>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize: 11, color: t.muted, fontFamily:'"Geist Mono", monospace' }}>
                1 UPLOADING · 2 PROCESSING
              </span>
            </div>
            {queue.map((q, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'28px 1fr 120px 110px 28px',
                gap: 14, padding:'14px 16px', alignItems:'center',
                borderBottom: i < queue.length-1 ? `1px solid ${t.line}` : 'none',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: q.state==='uploading' ? t.accentLo : t.sunken,
                  color: q.state==='uploading' ? t.accent : t.muted,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  border: `1px solid ${t.line}`,
                }}><I.play/></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: t.ink,
                    fontFamily:'"Geist Mono", monospace',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    marginBottom: 5,
                  }}>{q.name}</div>
                  <div style={{
                    height: 3, background: t.sunken, borderRadius: 999, overflow:'hidden',
                  }}>
                    <div style={{
                      width:`${q.pct}%`, height:'100%',
                      background: q.state==='uploading' ? t.accent : t.lineStrong,
                    }}/>
                  </div>
                </div>
                <div style={{
                  fontFamily:'"Geist Mono", monospace', fontSize: 11, color: t.muted,
                }}>
                  {q.size} {q.eta && <span style={{ color: t.faint }}>· {q.eta}</span>}
                </div>
                <VMStatus t={t} stage={q.state}/>
                <span style={{ color: t.muted, cursor:'pointer', justifySelf:'end' }}>
                  <I.x/>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: context / tips */}
        <div style={{ display:'flex', flexDirection:'column', gap: 16, minWidth: 0 }}>
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
            padding: 18,
          }}>
            <VMSectionLabel t={t} style={{ marginBottom: 12 }}>What happens next</VMSectionLabel>
            {[
              { n:'01', h:'We validate the file',  d:'Codec + duration check. Unsupported files fail here with a clear reason.' },
              { n:'02', h:'Transcription runs',    d:'Language is detected automatically. You get timestamped segments you can click.' },
              { n:'03', h:'Summary is generated',  d:'An overview paragraph plus key topics, ready below the player.' },
            ].map((s,i)=>(
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'32px 1fr', gap: 12,
                padding:'10px 0',
                borderBottom: i < 2 ? `1px solid ${t.line}` : 'none',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: t.accentLo, color: t.accentInk,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'"Geist Mono", monospace', fontSize: 11, fontWeight: 600,
                }}>{s.n}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.ink, marginBottom: 3 }}>{s.h}</div>
                  <div style={{ fontSize: 12.5, color: t.ink2, lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: t.panel, border: `1px solid ${t.line}`, borderRadius: 10,
            padding: 18, display:'flex', gap: 12,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: t.infoBg, color: t.info,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0,
            }}>ⓘ</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: t.ink, marginBottom: 4 }}>
                You can keep browsing
              </div>
              <div style={{ fontSize: 12.5, color: t.ink2, lineHeight: 1.5 }}>
                Uploads and processing keep running in the background. Watch
                progress from the notification panel in the bottom-right corner.
              </div>
            </div>
          </div>

          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10,
            padding: 18,
          }}>
            <VMSectionLabel t={t} style={{ marginBottom: 10 }}>Recent uploads</VMSectionLabel>
            {SAMPLE_VIDEOS.slice(0, 3).map((v,i)=>(
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'60px 1fr auto', gap: 12,
                padding:'8px 0', alignItems:'center',
                borderBottom: i < 2 ? `1px solid ${t.line}` : 'none',
              }}>
                <div style={{ width: 56 }}>
                  <VMThumb t={t} hue={v.hue} duration={v.dur} ratio="16/9"/>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 500, color: t.ink,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    marginBottom: 3,
                  }}>{v.title}</div>
                  <div style={{ fontFamily:'"Geist Mono", monospace', fontSize: 10.5, color: t.muted }}>
                    {v.when.toUpperCase()} · {v.size}
                  </div>
                </div>
                <VMStatus t={t} stage={v.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VMAppShell>
  );
}

Object.assign(window, { VMUploadPage });
