// ─── App shell (sidebar + header) ───────────────────────────────────────
function VMAppShell({ t, currentNav='All videos', children, header }) {
  const folders = [
    { name:'All videos', count: 42, icon: <I.grid/>, active: currentNav==='All videos' },
    { name:'Unfiled', count: 7, icon: <I.folder/>, active: currentNav==='Unfiled' },
  ];
  const userFolders = [
    { name:'Courses · NLP', count: 12, active: currentNav==='Courses · NLP' },
    { name:'Interviews Q2', count: 9 },
    { name:'Meetings · standups', count: 18 },
    { name:'Podcast raw', count: 3 },
    { name:'Travel archive', count: 5 },
  ];
  const tags = ['lecture', 'takeaway', 'draft', 'rewatch', 'transcribed-ok', 'portuguese'];

  return (
    <div style={{
      width:'100%', height:'100%', background: t.paper, color: t.ink,
      fontFamily:'Geist, ui-sans-serif',
      display:'grid', gridTemplateColumns:'232px 1fr', gridTemplateRows:'auto 1fr auto',
      gridTemplateAreas: '"side topbar" "side main" "foot foot"',
    }}>
      {/* Sidebar */}
      <aside style={{
        gridArea:'side', borderRight: `1px solid ${t.line}`,
        background: t.panel, display:'flex', flexDirection:'column',
      }}>
        <div style={{ padding:'14px 16px', borderBottom: `1px solid ${t.line}` }}>
          <VMWordmark t={t} size={15} />
        </div>
        <div style={{ padding:'12px 12px 6px' }}>
          <VMButton t={t} variant="solid" size="md" icon={<I.upload/>} style={{ width:'100%' }}>
            Upload video
          </VMButton>
        </div>
        <div style={{ padding:'6px 8px' }}>
          {folders.map((f,i) => (
            <SBItem key={i} t={t} {...f}/>
          ))}
        </div>
        <div style={{ padding:'10px 16px 4px' }}>
          <VMSectionLabel t={t} right={<span style={{ color: t.muted, cursor:'pointer' }}><I.plus/></span>}>
            Folders
          </VMSectionLabel>
        </div>
        <div style={{ padding:'4px 8px', flex: 1, overflow:'hidden' }}>
          {userFolders.map((f,i)=>(
            <SBItem key={i} t={t} name={f.name} count={f.count} icon={<I.folder/>} active={f.active}/>
          ))}
        </div>
        <div style={{ padding:'8px 16px 4px' }}>
          <VMSectionLabel t={t}>Tags</VMSectionLabel>
        </div>
        <div style={{ padding:'6px 12px 14px', display:'flex', flexWrap:'wrap', gap: 5 }}>
          {tags.map((tag,i)=>(
            <span key={i} style={{
              padding:'3px 7px', fontSize: 11, borderRadius: 4,
              background: i===2 ? t.accentLo : t.sunken,
              color: i===2 ? t.accentInk : t.ink2,
              border: `1px solid ${t.line}`,
              fontFamily:'"Geist Mono", monospace',
            }}>#{tag}</span>
          ))}
        </div>
        <div style={{
          borderTop: `1px solid ${t.line}`, padding:'10px 14px',
          display:'flex', alignItems:'center', gap: 8,
        }}>
          <span style={{
            width: 26, height: 26, borderRadius: 999,
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentHi})`,
            color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize: 11, fontWeight: 600,
          }}>CR</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.ink }}>Camila R.</div>
            <div style={{ fontSize: 10.5, color: t.muted, fontFamily:'"Geist Mono", monospace' }}>camila@studio.co</div>
          </div>
          <span style={{ color: t.muted, cursor:'pointer' }}><I.more/></span>
        </div>
      </aside>

      {/* Topbar */}
      <div style={{
        gridArea:'topbar', borderBottom: `1px solid ${t.line}`,
        padding:'10px 24px', display:'flex', alignItems:'center', gap: 12,
        background: t.surface,
      }}>
        {header}
      </div>

      {/* Main */}
      <main style={{ gridArea:'main', overflow:'hidden', position:'relative' }}>
        {children}
      </main>

      {/* Footer — spans full width */}
      <div style={{ gridArea:'foot' }}>
        <VMFooter t={t} variant="dim"/>
      </div>
    </div>
  );
}

function SBItem({ t, name, count, icon, active }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 9,
      padding:'6px 10px', borderRadius: 5, margin:'1px 0',
      background: active ? t.accentLo : 'transparent',
      color: active ? t.accentInk : t.ink2,
      fontSize: 13, fontWeight: active ? 500 : 400,
      cursor:'pointer',
      borderLeft: active ? `2px solid ${t.accent}` : '2px solid transparent',
      paddingLeft: active ? 8 : 10,
    }}>
      <span style={{ color: active ? t.accent : t.muted, display:'flex' }}>{icon}</span>
      <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</span>
      <span style={{
        fontFamily:'"Geist Mono", monospace', fontSize: 10.5,
        color: active ? t.accentInk : t.faint,
      }}>{count}</span>
    </div>
  );
}

// ─── Library (grid) ─────────────────────────────────────────────────────
const SAMPLE_VIDEOS = [
  { title:'Transformer lecture — week 04', dur:'48:12', size:'1.2 GB', when:'2h ago',  status:'transcribing', hue:35,  tags:['lecture','rewatch'],    folder:'Courses · NLP' },
  { title:'Interview with Marisol (take 2)', dur:'14:28', size:'318 MB', when:'today',  status:'ready',        hue:20,  tags:['takeaway'],             folder:'Interviews Q2' },
  { title:'Standup · 04-17 · backend', dur:'22:04', size:'492 MB', when:'Fri',  status:'summarizing',   hue:210, tags:['draft'],                folder:'Meetings · standups' },
  { title:'Podcast ep. 12 — raw audio track', dur:'1:08:44', size:'1.8 GB', when:'Thu',  status:'ready',        hue:60,  tags:['podcast','draft'],      folder:'Podcast raw' },
  { title:'Usability test · Pedro · v3 flow', dur:'31:10', size:'710 MB', when:'Wed',  status:'validating',    hue:280, tags:['rewatch'],              folder:'Unfiled' },
  { title:'Fieldnotes · Porto Alegre market', dur:'09:22', size:'198 MB', when:'Apr 10', status:'ready',        hue:140, tags:['travel'],               folder:'Travel archive' },
  { title:'Onboarding walkthrough (v2)', dur:'18:46', size:'402 MB', when:'Apr 08', status:'failed',       hue:10,  tags:['rewatch','draft'],      folder:'Meetings · standups' },
  { title:'Lecture 05 — RNN vs attention', dur:'52:30', size:'1.4 GB', when:'Apr 06', status:'ready',        hue:50,  tags:['lecture'],              folder:'Courses · NLP' },
];

function VMLibraryGrid({ t }) {
  return (
    <VMAppShell t={t} currentNav="All videos" header={
      <>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:'-0.02em' }}>All videos</div>
        <VMBadge t={t}>42</VMBadge>
        <div style={{ flex:1 }}/>
        <VMInput t={t} icon={<I.search/>} placeholder="Search your library…" value="" style={{ width: 280 }}/>
        <div style={{
          display:'flex', border: `1px solid ${t.line}`, borderRadius: 6, overflow:'hidden',
        }}>
          <div style={{ padding:'6px 8px', background: t.accentLo, color: t.accent }}><I.grid/></div>
          <div style={{ padding:'6px 8px', color: t.muted, borderLeft: `1px solid ${t.line}` }}><I.list/></div>
        </div>
        <VMButton t={t} variant="outline" size="md">Most recent <I.chev/></VMButton>
        <VMButton t={t} variant="solid" size="md" icon={<I.upload/>}>Upload</VMButton>
      </>
    }>
      {/* Active filters row */}
      <div style={{
        padding:'10px 24px', display:'flex', alignItems:'center', gap: 10,
        borderBottom: `1px solid ${t.line}`, fontSize: 12, color: t.muted,
      }}>
        <span style={{ fontFamily:'"Geist Mono", monospace' }}>FILTERS</span>
        <VMBadge t={t} tone="accent" style={{ cursor:'pointer' }}>#draft ✕</VMBadge>
        <VMBadge t={t} tone="neutral">+ add tag</VMBadge>
        <span style={{ flex:1 }}/>
        <span>Showing 8 of 42</span>
      </div>

      <div style={{
        padding: 24, display:'grid',
        gridTemplateColumns:'repeat(4, 1fr)', gap: 18,
        overflow:'auto', height:'calc(100% - 41px)',
      }}>
        {SAMPLE_VIDEOS.map((v,i)=>(
          <VMVideoCard key={i} t={t} v={v}/>
        ))}
      </div>
    </VMAppShell>
  );
}

function VMVideoCard({ t, v }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8,
      overflow:'hidden', boxShadow: t.shadowSm,
      display:'flex', flexDirection:'column',
    }}>
      <VMThumb t={t} hue={v.hue} duration={v.dur}>
        {v.status !== 'ready' && v.status !== 'failed' && (
          <div style={{
            position:'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55))',
          }}/>
        )}
        <div style={{ position:'absolute', left: 8, top: 8 }}>
          <VMStatus t={t} stage={v.status}/>
        </div>
      </VMThumb>
      <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap: 6 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: t.ink, lineHeight: 1.35,
          display:'-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{v.title}</div>
        <div style={{
          display:'flex', alignItems:'center', gap: 6,
          fontFamily:'"Geist Mono", monospace', fontSize: 10.5,
          color: t.muted,
        }}>
          <span>{v.size}</span>
          <span style={{ width:2, height:2, background: t.faint, borderRadius: 999 }}/>
          <span>{v.when.toUpperCase()}</span>
        </div>
        <div style={{ display:'flex', gap: 4, flexWrap:'wrap', marginTop: 2 }}>
          {v.tags.map((tag,i)=>(
            <span key={i} style={{
              fontSize: 10.5, padding:'1px 6px', borderRadius: 3,
              background: t.sunken, color: t.ink2,
              fontFamily:'"Geist Mono", monospace',
              border: `1px solid ${t.line}`,
            }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VMAppShell, VMLibraryGrid, SAMPLE_VIDEOS });
