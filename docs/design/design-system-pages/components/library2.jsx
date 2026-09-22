// ─── Library (list) ─────────────────────────────────────────────────────
function VMLibraryList({ t }) {
  return (
    <VMAppShell t={t} currentNav="Courses · NLP" header={
      <>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:'-0.02em' }}>Courses · NLP</div>
        <VMBadge t={t}>12</VMBadge>
        <div style={{ flex:1 }}/>
        <VMInput t={t} icon={<I.search/>} placeholder="Search your library…" value="" style={{ width: 280 }}/>
        <div style={{ display:'flex', border: `1px solid ${t.line}`, borderRadius: 6, overflow:'hidden' }}>
          <div style={{ padding:'6px 8px', color: t.muted }}><I.grid/></div>
          <div style={{ padding:'6px 8px', background: t.accentLo, color: t.accent, borderLeft: `1px solid ${t.line}` }}><I.list/></div>
        </div>
        <VMButton t={t} variant="solid" size="md" icon={<I.upload/>}>Upload</VMButton>
      </>
    }>
      <div style={{ height:'100%', overflow:'auto' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'88px 1fr 110px 100px 120px 120px 40px',
          padding:'8px 24px', fontSize: 10.5, fontFamily:'"Geist Mono", monospace',
          color: t.muted, textTransform:'uppercase', letterSpacing:'0.08em',
          borderBottom: `1px solid ${t.line}`, background: t.panel,
          alignItems:'center', gap: 12,
        }}>
          <span>Thumb</span><span>Title · tags</span><span>Duration</span><span>Size</span><span>Uploaded</span><span>Status</span><span/>
        </div>
        {SAMPLE_VIDEOS.slice(0,7).map((v,i)=>(
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'88px 1fr 110px 100px 120px 120px 40px',
            padding:'10px 24px', alignItems:'center', gap: 12,
            borderBottom: `1px solid ${t.line}`,
            background: i%2===0 ? 'transparent' : t.sunken,
          }}>
            <div style={{ width: 72 }}>
              <VMThumb t={t} hue={v.hue} duration={v.dur} ratio="16/9"/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: t.ink, marginBottom: 3 }}>{v.title}</div>
              <div style={{ display:'flex', gap: 5 }}>
                {v.tags.map((tag,j)=>(
                  <span key={j} style={{
                    fontSize: 10.5, padding:'1px 6px', borderRadius: 3,
                    background: t.sunken, color: t.ink2,
                    fontFamily:'"Geist Mono", monospace',
                    border: `1px solid ${t.line}`,
                  }}>#{tag}</span>
                ))}
              </div>
            </div>
            <span style={{ fontFamily:'"Geist Mono", monospace', fontSize: 12, color: t.ink2 }}>{v.dur}</span>
            <span style={{ fontFamily:'"Geist Mono", monospace', fontSize: 12, color: t.muted }}>{v.size}</span>
            <span style={{ fontFamily:'"Geist Mono", monospace', fontSize: 12, color: t.muted }}>{v.when}</span>
            <span><VMStatus t={t} stage={v.status}/></span>
            <span style={{ color: t.muted, cursor:'pointer', justifySelf:'end' }}><I.more/></span>
          </div>
        ))}
      </div>
    </VMAppShell>
  );
}

// ─── Video detail ───────────────────────────────────────────────────────
const DETAIL_SEGMENTS = [
  { t:'00:00', x:'Alright welcome back to week four — today we go deep on attention.' },
  { t:'00:11', x:'I know the reading looked scary, but the math here is actually simpler than RNNs.' },
  { t:'00:24', x:'Remember the loss function we wrote down on Tuesday? Pull that up.' },
  { t:'00:41', x:'We had queries, keys, and values — three little projection matrices.' },
  { t:'00:58', x:"And the attention score is just a dot product, softmaxed.", on:true },
  { t:'01:12', x:'So every token can look at every other token, in parallel, in one matmul.' },
  { t:'01:29', x:'Which is why transformers train so much faster than the old seq-to-seq stuff.' },
  { t:'01:44', x:'Question from the back — yeah, positional encodings, we get there in ten.' },
  { t:'02:02', x:'Okay so the gradient here flows through the softmax directly…' },
  { t:'02:18', x:'…and that is literally the whole layer. Everything else is plumbing.' },
];

function VMVideoDetail({ t }) {
  return (
    <VMAppShell t={t} currentNav="Courses · NLP" header={
      <>
        <span style={{ color: t.muted, fontSize: 12, display:'flex', alignItems:'center', gap: 6 }}>
          <I.folder/> Courses · NLP <I.chev/>
        </span>
        <div style={{ fontSize: 15, fontWeight: 500, color: t.ink, letterSpacing:'-0.01em' }}>
          Transformer lecture — week 04
        </div>
        <VMStatus t={t} stage="ready"/>
        <div style={{ flex:1 }}/>
        <VMButton t={t} variant="ghost" size="md">Rename</VMButton>
        <VMButton t={t} variant="ghost" size="md">Move to folder</VMButton>
        <VMButton t={t} variant="outline" size="md" icon={<I.more/>}>More</VMButton>
      </>
    }>
      <div style={{
        display:'grid', gridTemplateColumns:'1.35fr 1fr', height:'100%',
      }}>
        {/* Left: player + summary */}
        <div style={{
          padding: 20, display:'flex', flexDirection:'column', gap: 16,
          borderRight: `1px solid ${t.line}`, overflow:'auto',
        }}>
          <div style={{
            background: '#000', borderRadius: 8, overflow:'hidden',
            boxShadow: t.shadowMd, aspectRatio:'16/9', position:'relative',
          }}>
            <VMThumb t={t} hue={35} ratio="16/9"/>
            <div style={{
              position:'absolute', inset:0, display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 999,
                background: t.accent, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 8px 28px rgba(0,0,0,0.4)',
              }}><I.play style={{ width: 22, height: 22 }}/></div>
            </div>
            {/* scrubber */}
            <div style={{
              position:'absolute', left:0, right:0, bottom:0,
              padding:'18px 16px 10px',
              background:'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))',
            }}>
              <div style={{
                height: 3, borderRadius: 999, background:'rgba(255,255,255,0.2)',
                overflow:'hidden', position:'relative',
              }}>
                <div style={{ width:'18%', height:'100%', background: t.accent }}/>
                <div style={{
                  position:'absolute', left:'18%', top:'50%', transform:'translate(-50%, -50%)',
                  width: 10, height: 10, borderRadius: 999, background: t.accent,
                  boxShadow:'0 0 0 3px rgba(249,115,22,0.25)',
                }}/>
              </div>
              <div style={{
                marginTop: 8, display:'flex', justifyContent:'space-between', alignItems:'center',
                fontFamily:'"Geist Mono", monospace', fontSize: 10.5, color:'rgba(255,255,255,0.85)',
              }}>
                <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
                  <span style={{ color:'#fff' }}>▶</span>
                  <span>00:58 / 48:12</span>
                </div>
                <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
                  <span>1.25×</span>
                  <span>CC</span>
                  <span>⛶</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap' }}>
            <VMBadge t={t} mono>EN · WHISPER</VMBadge>
            <VMBadge t={t} mono>MKV · 1.2 GB</VMBadge>
            <VMBadge t={t} tone="accent">#lecture</VMBadge>
            <VMBadge t={t} tone="accent">#rewatch</VMBadge>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize: 12, color: t.muted, fontFamily:'"Geist Mono", monospace' }}>UPLOADED 2H AGO</span>
          </div>

          {/* Summary */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8,
            padding: 20, boxShadow: t.shadowSm,
          }}>
            <div style={{
              display:'flex', alignItems:'center', gap: 8, marginBottom: 12,
            }}>
              <span style={{ color: t.accent, display:'flex' }}><I.sparkle/></span>
              <VMSectionLabel t={t} style={{ flex:1 }}>AI Summary · GPT-4.1 nano</VMSectionLabel>
              <VMBadge t={t} tone="ok" dot>Generated</VMBadge>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, marginBottom: 6, letterSpacing:'-0.01em' }}>Overview</div>
            <p style={{ fontSize: 14, lineHeight: 1.62, color: t.ink2, margin:'0 0 18px', textWrap:'pretty' }}>
              Week four of the NLP series covers the attention mechanism end-to-end.
              The lecture recaps the loss function from Tuesday, introduces the
              query / key / value projection triple, and walks through why the
              softmaxed dot product lets transformers parallelise what RNNs did
              sequentially. The last ten minutes return to positional encodings
              as promised.
            </p>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, marginBottom: 8, letterSpacing:'-0.01em' }}>Key topics</div>
            <ul style={{ margin: 0, paddingLeft: 16, display:'flex', flexDirection:'column', gap: 6 }}>
              {[
                'Why attention is just a matmul + softmax, not a magic trick',
                'Q / K / V projections — three weight matrices per head',
                'Parallelism advantage vs RNN/seq2seq backprop paths',
                'Gradient flow through the softmax layer',
                'Positional encodings (revisited at ~38:00)',
              ].map((x,i)=>(
                <li key={i} style={{ fontSize: 13.5, lineHeight: 1.5, color: t.ink2 }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: transcription */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px 10px', borderBottom: `1px solid ${t.line}` }}>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, letterSpacing:'-0.01em' }}>
                Transcription
              </div>
              <VMBadge t={t} mono>EN</VMBadge>
              <VMBadge t={t}>312 segments</VMBadge>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize: 11, color: t.muted, fontFamily:'"Geist Mono", monospace' }}>3 of 7</span>
              <span style={{ color: t.muted }}><I.chev style={{ transform:'rotate(180deg)' }}/></span>
              <span style={{ color: t.muted }}><I.chev/></span>
            </div>
            <VMInput t={t} icon={<I.search/>} placeholder="Search transcript…" value="attention" style={{ width:'100%' }}/>
          </div>
          <div style={{ flex:1, overflow:'auto', padding:'6px 8px 20px' }}>
            {DETAIL_SEGMENTS.map((s,i)=>(
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'52px 1fr', gap: 10,
                padding:'8px 12px', cursor:'pointer',
                background: s.on ? t.accentLo : 'transparent',
                borderLeft: s.on ? `2px solid ${t.accent}` : '2px solid transparent',
                borderRadius: 4, marginBottom: 1,
              }}>
                <span style={{
                  fontFamily:'"Geist Mono", monospace', fontSize: 11,
                  color: s.on ? t.accentInk : t.muted,
                }}>{s.t}</span>
                <span style={{
                  fontSize: 13.5, lineHeight: 1.55,
                  color: s.on ? t.ink : t.ink2,
                }}>
                  {s.x.split(/(attention)/i).map((part, j) =>
                    part.toLowerCase() === 'attention'
                      ? <mark key={j} style={{ background: t.accent, color:'#fff', padding:'0 3px', borderRadius: 2 }}>{part}</mark>
                      : <React.Fragment key={j}>{part}</React.Fragment>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VMAppShell>
  );
}

Object.assign(window, { VMLibraryList, VMVideoDetail, DETAIL_SEGMENTS });
