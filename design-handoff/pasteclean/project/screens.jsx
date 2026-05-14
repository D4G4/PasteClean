// screens.jsx — Editor, Templates, Settings, Gmail Preview Modal

// ─────────────────────────────────────────────────────────────
// Icons (24px stroke icons in SF-style line weights)
// ─────────────────────────────────────────────────────────────
const Icon = {
  pencil: (c) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 4.5l3 3L8 19H5v-3L16.5 4.5z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M14.5 6.5l3 3" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  bookmark: (c, filled) => (
    <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
      <path d="M5 3.5h14V23l-7-4.5L5 23V3.5z" stroke={c} strokeWidth="1.6"
            strokeLinejoin="round" fill={filled ? c : 'none'}/>
    </svg>
  ),
  gear: (c) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1 2.3 2.5-.6.6 2.5 2.3 1-.6 2.5 2.3 1-.6 2.5 1.7 1.8-1.7 1.8.6 2.5-2.3 1 .6 2.5-2.5.6L13 21.6 12 19.3 11 21.6l-1-2.3-2.5.6-.6-2.5-2.3-1 .6-2.5L2.8 13l1.7-1.8L2.8 9.4l2.3-1L4.5 5.9l2.5-.6L7.6 3 10 3.7 11 1.4 12 3z"
            stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3.2" stroke={c} strokeWidth="1.4"/>
    </svg>
  ),
  eye: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.7"/>
    </svg>
  ),
  chevDown: (c) => (
    <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
      <path d="M1 1.5L7 7.5l6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevRight: (c) => (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  check: (c) => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <path d="M1.5 7.5l5 5L16.5 1.5" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2v16M2 10h16" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  // Toolbar icons
  bold: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5.5 3h5a3.5 3.5 0 010 7h-5V3zm0 7h6a3.5 3.5 0 010 7h-6v-7z"
            stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  italic: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M8 3h8M4 17h8M12 3l-4 14" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  underline: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 3v7a5 5 0 0010 0V3M4 18h12" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  strike: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10h14M6 5.5a4 4 0 014-2.5c2 0 3.5 1.2 4 3M6 14.5c.5 1.8 2 3 4 3 2.5 0 4-1.5 4-3.5"
            stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  link: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M9 11a3.5 3.5 0 005 0l3-3a3.5 3.5 0 00-5-5l-1.5 1.5M11 9a3.5 3.5 0 00-5 0l-3 3a3.5 3.5 0 005 5l1.5-1.5"
            stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bullet: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="3" cy="5" r="1.2" fill={c}/>
      <circle cx="3" cy="10" r="1.2" fill={c}/>
      <circle cx="3" cy="15" r="1.2" fill={c}/>
      <path d="M7 5h11M7 10h11M7 15h11" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  numbered: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <text x="0.5" y="7" fill={c} fontSize="6" fontFamily="-apple-system" fontWeight="600">1.</text>
      <text x="0.5" y="12" fill={c} fontSize="6" fontFamily="-apple-system" fontWeight="600">2.</text>
      <text x="0.5" y="17" fill={c} fontSize="6" fontFamily="-apple-system" fontWeight="600">3.</text>
      <path d="M7 5h11M7 10h11M7 15h11" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  quote: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6c0-1.5 1-2.5 2.5-2.5M3 6v3.5h3.5V6H3zm0 0c0 3 1.5 4.5 3.5 5M11 6c0-1.5 1-2.5 2.5-2.5M11 6v3.5h3.5V6H11zm0 0c0 3 1.5 4.5 3.5 5"
            stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  code: (c) => (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
      <path d="M7 5L2 10l5 5M15 5l5 5-5 5M13 4l-4 12"
            stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  heading: (c, level) => (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
      <path d="M3 3v14M11 3v14M3 10h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <text x="14" y="17" fill={c} fontSize="9" fontWeight="700" fontFamily="-apple-system">{level || '1'}</text>
    </svg>
  ),
  xCircle: (c) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill={c} opacity="0.12"/>
      <path d="M9.5 9.5l9 9M18.5 9.5l-9 9" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// Brand logo mark — clipboard glyph with a paste sparkle.
// ─────────────────────────────────────────────────────────────
function BrandMark({ size = 32, color = '#fff', bg = 'rgba(255,255,255,0.18)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.25)',
    }}>
      <svg width={size * 0.56} height={size * 0.62} viewBox="0 0 18 20" fill="none">
        <path d="M5 3h8a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
              stroke={color} strokeWidth="1.4"/>
        <path d="M7 2h4a1 1 0 011 1v1H6V3a1 1 0 011-1z" fill={color}/>
        <path d="M7 11.5l1.7 1.7L12 9.5" stroke={color} strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  );
}

// Adjust a hex color by a perceptual delta for header gradients without
// pulling in a color lib. Keeps tint coherent across all 5 brand options.
function tintHex(hex, dl) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const adj = (v) => Math.max(0, Math.min(255, v + dl));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

// ─────────────────────────────────────────────────────────────
// Editor screen — compose-mail layout with branded hero
// ─────────────────────────────────────────────────────────────
function EditorScreen({ dark, accent, content, setContent,
                        toAddr, setToAddr, subject, setSubject,
                        composeFields = true,
                        onCopy, copied, onOpenPreview }) {
  const editorRef = React.useRef(null);
  const [activeFormats, setActiveFormats] = React.useState(new Set());
  const [headingOpen, setHeadingOpen] = React.useState(false);

  // Initialise contentEditable HTML once; React re-renders shouldn't blow away
  // the user's caret on each keystroke.
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []); // eslint-disable-line

  const refreshFormats = () => {
    const s = new Set();
    ['bold', 'italic', 'underline', 'strikeThrough',
     'insertUnorderedList', 'insertOrderedList'].forEach((cmd) => {
      try { if (document.queryCommandState(cmd)) s.add(cmd); } catch (e) {}
    });
    // Heading detection via formatBlock value
    try {
      const v = document.queryCommandValue('formatBlock');
      if (v && /h[1-3]/i.test(v)) s.add(v.toLowerCase());
      else if (v && /blockquote/i.test(v)) s.add('blockquote');
      else if (v && /pre/i.test(v)) s.add('pre');
    } catch (e) {}
    setActiveFormats(s);
  };

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setContent(editorRef.current.innerHTML);
    refreshFormats();
  };

  const setBlock = (tag) => {
    exec('formatBlock', tag);
    setHeadingOpen(false);
  };

  const onInput = () => {
    setContent(editorRef.current.innerHTML);
    refreshFormats();
  };

  const fg = dark ? '#fff' : '#1c1c1e';
  const fgMuted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const fgFaint = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const bg = dark ? '#000' : '#fff';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.18)';
  const toolBg = dark ? '#1c1c1e' : '#f6f6f8';
  const toolBtn = dark ? '#2c2c2e' : 'transparent';
  const toolActive = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';
  const fieldLabel = dark ? 'rgba(235,235,245,0.55)' : 'rgba(60,60,67,0.6)';

  const heroTop = tintHex(accent, 14);
  const heroBot = tintHex(accent, -22);

  const ToolBtn = ({ name, label, onClick, active, custom }) => (
    <button onClick={onClick} aria-label={label}
      style={{
        width: 38, height: 36, borderRadius: 8, border: 'none',
        background: active ? toolActive : toolBtn,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, padding: 0, cursor: 'pointer',
      }}>
      {custom || Icon[name](fg)}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
      {/* Branded hero — solid brand color, white text/icons. Status bar
          contrast is handled by the parent via the dark prop on IOSStatusBar
          on a per-screen basis; here we accept light status bar over color. */}
      <div style={{
        position: 'relative', zIndex: 5,
        paddingTop: 56, paddingBottom: 14,
        paddingLeft: 18, paddingRight: 12,
        background: `linear-gradient(155deg, ${heroTop} 0%, ${accent} 45%, ${heroBot} 100%)`,
        color: '#fff',
      }}>
        {/* Subtle highlight stripe at the very top to lift the gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'rgba(255,255,255,0.22)',
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <BrandMark size={32} color="#fff" bg="rgba(255,255,255,0.2)" />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
                fontFamily: '-apple-system, "SF Pro Display", system-ui',
                lineHeight: 1.1,
              }}>PasteClean</div>
              <div style={{
                fontSize: 11, fontWeight: 500,
                color: 'rgba(255,255,255,0.78)',
                fontFamily: '-apple-system, system-ui',
                letterSpacing: 0.2,
                marginTop: 2, textTransform: 'uppercase',
              }}>New draft</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onOpenPreview} aria-label="Preview"
              style={{
                width: 36, height: 36, borderRadius: 18, border: 'none',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.25)',
              }}>
              {Icon.eye('#fff')}
            </button>
            <button onClick={onCopy}
              style={{
                height: 36, borderRadius: 18, border: 'none',
                padding: '0 16px',
                background: copied ? '#34c759' : '#fff',
                color: copied ? '#fff' : accent,
                fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
                fontFamily: '-apple-system, "SF Pro Text", system-ui',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
                transition: 'background 0.18s ease, color 0.18s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
              {copied && Icon.check('#fff')}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Compose fields — To / Subject. Hidden when the user wants a
          minimalist focused-writing surface ("Give me Gmail feels" off). */}
      {composeFields && (
      <div style={{ background: bg, borderBottom: `0.5px solid ${sep}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', minHeight: 42,
          padding: '0 18px', borderBottom: `0.5px solid ${sep}`,
        }}>
          <div style={{
            width: 56, fontSize: 13, fontWeight: 500, color: fieldLabel,
            fontFamily: '-apple-system, system-ui', letterSpacing: -0.1,
          }}>To</div>
          {toAddr && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 26, padding: '0 10px',
              background: dark ? 'rgba(110,85,255,0.18)' : `${accent}1a`,
              color: accent, borderRadius: 13,
              fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
              fontFamily: '-apple-system, system-ui',
              maxWidth: '100%',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 8, background: accent,
                color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '-apple-system, system-ui',
              }}>{toAddr.slice(0, 1).toUpperCase()}</div>
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{toAddr}</span>
            </div>
          )}
          <input
            value={''}
            onChange={() => {}}
            placeholder={toAddr ? '' : 'Recipient'}
            style={{
              flex: 1, minWidth: 40, height: 32, marginLeft: toAddr ? 6 : 0,
              border: 'none', outline: 'none', background: 'transparent',
              color: fg, fontSize: 15, letterSpacing: -0.2,
              fontFamily: '-apple-system, system-ui',
            }}
          />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', minHeight: 42,
          padding: '0 18px',
        }}>
          <div style={{
            width: 56, fontSize: 13, fontWeight: 500, color: fieldLabel,
            fontFamily: '-apple-system, system-ui', letterSpacing: -0.1,
          }}>Subject</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            style={{
              flex: 1, height: 32, border: 'none', outline: 'none',
              background: 'transparent', color: fg,
              fontSize: 16, fontWeight: 600, letterSpacing: -0.3,
              fontFamily: '-apple-system, "SF Pro Text", system-ui',
            }}
          />
        </div>
      </div>
      )}

      {/* Editor body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={onInput}
          onKeyUp={refreshFormats}
          onMouseUp={refreshFormats}
          spellCheck={false}
          data-placeholder="Start writing your email here..."
          className="pc-editor"
          style={{
            minHeight: '100%',
            padding: '14px 20px 24px',
            fontSize: 16,
            lineHeight: 1.45,
            color: fg,
            fontFamily: '-apple-system, "SF Pro Text", system-ui',
            outline: 'none',
            letterSpacing: -0.2,
          }}
        />
      </div>

      {/* Formatting toolbar */}
      <div style={{
        position: 'relative', zIndex: 6,
        background: toolBg,
        borderTop: `0.5px solid ${sep}`,
        padding: '8px 10px 8px',
      }}>
        <div style={{
          display: 'flex', gap: 2, overflowX: 'auto', alignItems: 'center',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }} className="pc-toolbar-scroll">
          <ToolBtn name="bold" label="Bold" active={activeFormats.has('bold')}
                   onClick={() => exec('bold')} />
          <ToolBtn name="italic" label="Italic" active={activeFormats.has('italic')}
                   onClick={() => exec('italic')} />
          <ToolBtn name="underline" label="Underline" active={activeFormats.has('underline')}
                   onClick={() => exec('underline')} />
          <ToolBtn name="strike" label="Strikethrough" active={activeFormats.has('strikeThrough')}
                   onClick={() => exec('strikeThrough')} />
          <div style={{ width: 1, height: 22, background: fgFaint, margin: '0 6px', flexShrink: 0 }} />
          <ToolBtn name="link" label="Link"
                   onClick={() => {
                     const url = prompt('Link URL:');
                     if (url) exec('createLink', url);
                   }} />
          {/* Heading dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setHeadingOpen(!headingOpen)}
              style={{
                height: 36, borderRadius: 8, border: 'none',
                background: headingOpen ? toolActive : toolBtn,
                padding: '0 8px',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 14, fontWeight: 600, color: fg,
                fontFamily: '-apple-system, system-ui',
                cursor: 'pointer',
              }}>
              H {Icon.chevDown(fgMuted)}
            </button>
            {headingOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
                background: dark ? '#2c2c2e' : '#fff',
                borderRadius: 12, padding: 4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.08)',
                minWidth: 110, zIndex: 30,
              }}>
                {[
                  { label: 'Heading 1', tag: 'H1', size: 22 },
                  { label: 'Heading 2', tag: 'H2', size: 18 },
                  { label: 'Heading 3', tag: 'H3', size: 16 },
                  { label: 'Body', tag: 'P', size: 14 },
                ].map((o) => (
                  <button key={o.tag} onClick={() => setBlock(o.tag)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', borderRadius: 8, border: 'none',
                      background: 'transparent', color: fg,
                      fontSize: o.size, fontWeight: o.tag === 'P' ? 400 : 700,
                      fontFamily: '-apple-system, system-ui',
                      cursor: 'pointer',
                      letterSpacing: -0.2,
                    }}>{o.label}</button>
                ))}
              </div>
            )}
          </div>
          <ToolBtn name="bullet" label="Bullet list"
                   active={activeFormats.has('insertUnorderedList')}
                   onClick={() => exec('insertUnorderedList')} />
          <ToolBtn name="numbered" label="Numbered list"
                   active={activeFormats.has('insertOrderedList')}
                   onClick={() => exec('insertOrderedList')} />
          <ToolBtn name="quote" label="Quote"
                   active={activeFormats.has('blockquote')}
                   onClick={() => setBlock('BLOCKQUOTE')} />
          <ToolBtn name="code" label="Code"
                   active={activeFormats.has('pre')}
                   onClick={() => setBlock('PRE')} />
        </div>
      </div>

      {/* Keyboard */}
      <IOSKeyboard dark={dark} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Gmail Preview modal
// ─────────────────────────────────────────────────────────────
function PreviewModal({ open, onClose, content, dark, accent, onCopy, copied }) {
  const [mode, setMode] = React.useState('safe'); // safe | original

  // Declared before any early return so hook order stays stable. The "Gmail
  // Safe" sanitization mock strips inline color/bg styles so the email renders
  // in Gmail's default Arial/14px/black-on-white; "Original" keeps it as-is.
  const safeHTML = React.useMemo(() => {
    if (mode === 'original') return content;
    return content
      .replace(/style="[^"]*"/g, '')
      .replace(/color="[^"]*"/g, '')
      .replace(/bgcolor="[^"]*"/g, '');
  }, [content, mode]);

  if (!open) return null;

  const fg = dark ? '#fff' : '#1c1c1e';
  const fgMuted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.18)';
  const sheetBg = dark ? '#1c1c1e' : '#f2f2f7';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
    }} onClick={onClose}>
      {/* Sheet */}
      <div onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: 64, flex: 1,
          background: sheetBg,
          borderTopLeftRadius: 14, borderTopRightRadius: 14,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'pcSheetUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}>
        {/* Grabber + close */}
        <div style={{
          paddingTop: 8, paddingBottom: 4,
          display: 'flex', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ width: 36, height: 5, borderRadius: 3, background: dark ? '#48484a' : '#d1d1d6' }} />
          <button onClick={onClose}
            style={{
              position: 'absolute', right: 12, top: 6,
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            }}>
            {Icon.xCircle(fgMuted)}
          </button>
        </div>

        {/* Title */}
        <div style={{
          padding: '4px 20px 14px',
          fontSize: 20, fontWeight: 700, color: fg, letterSpacing: -0.4,
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
        }}>Preview</div>

        {/* Mode toggle */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex', padding: 3, borderRadius: 9,
            background: dark ? '#2c2c2e' : '#e5e5ea',
          }}>
            <button onClick={() => setMode('safe')}
              style={{
                flex: 1, height: 34, borderRadius: 7, border: 'none', cursor: 'pointer',
                background: mode === 'safe' ? accent : 'transparent',
                color: mode === 'safe' ? '#fff' : fg,
                fontSize: 14, fontWeight: 600,
                fontFamily: '-apple-system, system-ui',
                letterSpacing: -0.2,
                transition: 'background 0.18s',
              }}>Gmail Safe</button>
            <button onClick={() => setMode('original')}
              style={{
                flex: 1, height: 34, borderRadius: 7, border: 'none', cursor: 'pointer',
                background: mode === 'original' ? '#FFCC00' : 'transparent',
                color: mode === 'original' ? '#1c1c1e' : fg,
                fontSize: 14, fontWeight: 600,
                fontFamily: '-apple-system, system-ui',
                letterSpacing: -0.2,
                transition: 'background 0.18s',
              }}>Original</button>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ padding: '0 20px 14px' }}>
          {mode === 'safe' ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10,
              background: dark ? 'rgba(52,199,89,0.18)' : 'rgba(52,199,89,0.12)',
              color: dark ? '#30d158' : '#248a3d',
              fontSize: 13, fontWeight: 600,
              fontFamily: '-apple-system, system-ui',
              letterSpacing: -0.1,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: 9, background: '#34c759',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="9" viewBox="0 0 11 9"><path d="M1 4.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Sanitized — safe for Gmail
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10,
              background: dark ? 'rgba(255,204,0,0.18)' : 'rgba(255,204,0,0.18)',
              color: dark ? '#ffd60a' : '#9a6700',
              fontSize: 13, fontWeight: 600,
              fontFamily: '-apple-system, system-ui',
              letterSpacing: -0.1,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: 9, background: '#FFCC00',
                color: '#1c1c1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                fontFamily: '-apple-system, system-ui',
              }}>!</span>
              Original — may have dark mode issues
            </div>
          )}
        </div>

        {/* WebView mock — always white background, Arial 14px */}
        <div style={{ flex: 1, minHeight: 0, padding: '0 16px 12px' }}>
          <div style={{
            height: '100%', borderRadius: 12, overflow: 'hidden',
            background: '#fff',
            border: '0.5px solid rgba(60,60,67,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Gmail-style faux address strip */}
            <div style={{
              padding: '12px 16px 8px',
              fontFamily: 'Arial, sans-serif',
              fontSize: 12, color: '#5f6368',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <div style={{ marginBottom: 2 }}><span style={{ color: '#202124', fontWeight: 600 }}>Subject:</span> Email preview</div>
              <div><span style={{ color: '#202124', fontWeight: 600 }}>To:</span> recipient@example.com</div>
            </div>
            <div
              style={{
                flex: 1, overflow: 'auto',
                padding: '14px 16px',
                fontFamily: 'Arial, sans-serif',
                fontSize: 14, lineHeight: 1.5,
                color: '#202124', background: '#fff',
              }}
              dangerouslySetInnerHTML={{ __html: safeHTML || '<p style="color:#9aa0a6">Your email will appear here…</p>' }}
            />
          </div>
        </div>

        {/* Copy for Gmail button */}
        <div style={{
          padding: '8px 16px 28px',
          borderTop: `0.5px solid ${sep}`,
          background: sheetBg,
        }}>
          <button onClick={onCopy}
            style={{
              width: '100%', height: 50, borderRadius: 14, border: 'none',
              background: copied ? '#34c759' : accent,
              color: '#fff',
              fontSize: 17, fontWeight: 600, letterSpacing: -0.2,
              fontFamily: '-apple-system, "SF Pro Text", system-ui',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}>
            {copied && Icon.check('#fff')}
            {copied ? 'Copied!' : 'Copy for Gmail'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Templates screen (empty + populated)
// ─────────────────────────────────────────────────────────────
const SAMPLE_TEMPLATES = [
  {
    id: 't1', title: 'Cold outreach',
    snippet: 'Hi {{name}}, I came across your work on…',
    accent: '#FFE5D9',
  },
  {
    id: 't2', title: 'Meeting follow-up',
    snippet: 'Great chatting earlier. As discussed, here are the next steps…',
    accent: '#E1F0FF',
  },
  {
    id: 't3', title: 'Weekly update',
    snippet: 'Quick summary of this week — wins, blockers, and what\'s next.',
    accent: '#E8F8E9',
  },
  {
    id: 't4', title: 'Polite decline',
    snippet: 'Thanks so much for the offer — unfortunately I won\'t be able to…',
    accent: '#FFF4D6',
  },
  {
    id: 't5', title: 'Bug report',
    snippet: 'Repro steps, expected vs actual, environment details.',
    accent: '#F0E5FF',
  },
  {
    id: 't6', title: 'Intro email',
    snippet: 'Hey {{a}}, meet {{b}} — I think you two should know each other.',
    accent: '#FFE2EF',
  },
];

function TemplatesScreen({ dark, accent, populated }) {
  const fg = dark ? '#fff' : '#1c1c1e';
  const fgMuted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const fgFaint = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const bg = dark ? '#000' : '#f2f2f7';
  const cardBg = dark ? '#1c1c1e' : '#fff';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.18)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
      {/* Header */}
      <div style={{
        paddingTop: 56, paddingBottom: 6, paddingLeft: 20, paddingRight: 12,
        background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(242,242,247,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: 34, fontWeight: 700, color: fg, letterSpacing: 0.36,
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
        }}>Templates</div>
        <button aria-label="New template"
          style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {Icon.plus(accent)}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 16px 100px' }}>
        {!populated ? (
          // Empty state
          <div style={{
            paddingTop: 96, display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', padding: '96px 32px 0',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: 24,
              background: dark ? '#1c1c1e' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 22,
              boxShadow: dark ? 'none' : '0 0.5px 0 rgba(0,0,0,0.04)',
            }}>
              <svg width="40" height="44" viewBox="0 0 40 44" fill="none">
                <path d="M6 4h28v36L20 31 6 40V4z" stroke={accent} strokeWidth="2.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: fg, letterSpacing: -0.4,
              marginBottom: 8,
              fontFamily: '-apple-system, "SF Pro Display", system-ui',
            }}>No templates yet</div>
            <div style={{
              fontSize: 15, color: fgMuted, lineHeight: 1.4, maxWidth: 260,
              fontFamily: '-apple-system, system-ui',
              letterSpacing: -0.2,
            }}>Save your frequently used email formats as templates for quick access.</div>
            <button
              style={{
                marginTop: 22, height: 44, padding: '0 22px', borderRadius: 22,
                border: 'none', background: accent, color: '#fff',
                fontSize: 15, fontWeight: 600, letterSpacing: -0.2,
                fontFamily: '-apple-system, system-ui',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
              {Icon.plus('#fff')}
              New template
            </button>
          </div>
        ) : (
          // Populated grid
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 8,
          }}>
            {SAMPLE_TEMPLATES.map((t) => (
              <div key={t.id} style={{
                aspectRatio: '1 / 1.18',
                background: cardBg, borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer',
                border: dark ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Preview swatch */}
                <div style={{
                  height: 76, background: dark ? '#2c2c2e' : t.accent,
                  position: 'relative', flexShrink: 0,
                  padding: '10px 12px',
                }}>
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 10, color: dark ? 'rgba(255,255,255,0.7)' : '#1c1c1e',
                    lineHeight: 1.4,
                  }}>
                    <div style={{ width: '60%', height: 4, background: 'currentColor', opacity: 0.4, borderRadius: 2, marginBottom: 4 }} />
                    <div style={{ width: '95%', height: 3, background: 'currentColor', opacity: 0.25, borderRadius: 2, marginBottom: 3 }} />
                    <div style={{ width: '88%', height: 3, background: 'currentColor', opacity: 0.25, borderRadius: 2, marginBottom: 3 }} />
                    <div style={{ width: '72%', height: 3, background: 'currentColor', opacity: 0.25, borderRadius: 2 }} />
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2,
                    fontFamily: '-apple-system, system-ui',
                    marginBottom: 4,
                  }}>{t.title}</div>
                  <div style={{
                    fontSize: 12, color: fgMuted, lineHeight: 1.35,
                    fontFamily: '-apple-system, system-ui',
                    letterSpacing: -0.1,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{t.snippet}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings screen
// ─────────────────────────────────────────────────────────────
function SettingsScreen({ dark, accent, fontSize, setFontSize, textColor, setTextColor }) {
  const fg = dark ? '#fff' : '#1c1c1e';
  const fgMuted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const fgFaint = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const bg = dark ? '#000' : '#f2f2f7';
  const cardBg = dark ? '#1c1c1e' : '#fff';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.18)';

  const Row = ({ title, detail, chevron = true, last, onClick, rightColor }) => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', minHeight: 44,
      padding: '0 16px', position: 'relative',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{
        flex: 1, color: fg, fontSize: 17, letterSpacing: -0.4,
        fontFamily: '-apple-system, system-ui',
      }}>{title}</div>
      {rightColor && (
        <div style={{
          width: 22, height: 22, borderRadius: 11, background: rightColor,
          marginRight: 8, boxShadow: '0 0 0 0.5px rgba(0,0,0,0.1) inset',
        }} />
      )}
      {detail && (
        <span style={{ color: fgMuted, fontSize: 17, marginRight: 6, letterSpacing: -0.4 }}>
          {detail}
        </span>
      )}
      {chevron && Icon.chevRight(fgFaint)}
      {!last && (
        <div style={{
          position: 'absolute', bottom: 0, left: 16, right: 0, height: 0.5, background: sep,
        }} />
      )}
    </div>
  );

  const Section = ({ header, children, footer }) => (
    <div style={{ marginBottom: 24 }}>
      {header && (
        <div style={{
          fontSize: 13, color: fgMuted, padding: '0 32px 6px',
          letterSpacing: -0.08, textTransform: 'uppercase',
          fontFamily: '-apple-system, system-ui', fontWeight: 400,
        }}>{header}</div>
      )}
      <div style={{
        background: cardBg, borderRadius: 12,
        margin: '0 16px', overflow: 'hidden',
      }}>{children}</div>
      {footer && (
        <div style={{
          fontSize: 13, color: fgMuted, padding: '6px 32px 0',
          letterSpacing: -0.08, lineHeight: 1.35,
          fontFamily: '-apple-system, system-ui',
        }}>{footer}</div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
      {/* Header */}
      <div style={{
        paddingTop: 56, paddingBottom: 6, paddingLeft: 20, paddingRight: 20,
        background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(242,242,247,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}>
        <div style={{
          fontSize: 34, fontWeight: 700, color: fg, letterSpacing: 0.36,
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
        }}>Settings</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 0 100px' }}>
        <Section header="Defaults">
          <Row title="Default Font Size" detail={`${fontSize}px`} />
          <Row title="Default Text Color" rightColor={textColor} last />
        </Section>

        <Section header="About">
          <Row title="Version" detail="1.0.0" chevron={false} />
          <Row title="How It Works" last />
        </Section>

        <Section header="Support">
          <Row title="Send Feedback" />
          <Row title="Rate PasteClean" />
          <Row title="Privacy Policy" last />
        </Section>

        <div style={{
          padding: '8px 32px 24px',
          fontSize: 13, color: fgMuted, lineHeight: 1.4, textAlign: 'center',
          fontFamily: '-apple-system, system-ui', letterSpacing: -0.08,
        }}>
          PasteClean keeps your formatting intact when pasting into Gmail. We strip dark-mode and inline styles that Gmail would render as invisible white-on-white.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, EditorScreen, PreviewModal, TemplatesScreen, SettingsScreen,
});
