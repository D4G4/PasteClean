// app.jsx — Phone shell, tab bar, app-level state

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#FF6B5C",
  "templatesPopulated": true,
  "showFrame": true,
  "composeFields": true,
  "showOnboarding": true,
  "alwaysOpenGmail": false
}/*EDITMODE-END*/;

const SAMPLE_EMAIL = `<p>Hi Sam,</p>
<p>Thanks for jumping on the call yesterday — sharing a quick recap and the action items so we're aligned:</p>
<h2>Next steps</h2>
<ul>
  <li><b>Design handoff</b> — Friday EOD</li>
  <li><b>Engineering kickoff</b> — Monday standup</li>
  <li><b>Beta launch</b> — last week of May</li>
</ul>
<p>Let me know if anything looks off. <i>Excited to ship this.</i></p>
<p>— Alex</p>`;

// Gmail handoff toast — slides up from the bottom after Copy succeeds.
// Offers a one-tap "Open Gmail" action plus a remembered preference so power
// users can collapse the two-step flow into one.
function GmailHandoffToast({ open, onClose, onOpen, alwaysOpen, setAlwaysOpen, dark, accent }) {
  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [open, onClose]);
  if (!open) return null;
  const fg = dark ? '#fff' : '#1c1c1e';
  const muted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? 'rgba(44,44,46,0.96)' : 'rgba(255,255,255,0.98)';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.16)';
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 28, zIndex: 80,
      borderRadius: 18, background: bg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.08)',
      border: `0.5px solid ${sep}`,
      padding: '14px 14px 12px',
      fontFamily: '-apple-system, "SF Pro Text", system-ui',
      animation: 'pcToastUp 0.28s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <style>{`@keyframes pcToastUp { from { transform: translateY(110%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16, background: '#34c75922',
          color: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="13" viewBox="0 0 11 9"><path d="M1 4.5l3 3 6-6" stroke="#34c759" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>Copied — open Gmail?</div>
          <div style={{ fontSize: 12.5, color: muted, letterSpacing: -0.1 }}>Paste your sanitized email in the compose window.</div>
        </div>
        <button onClick={onClose} aria-label="Dismiss" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          width: 28, height: 28, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: muted,
        }}>
          <svg width="11" height="11" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={{
          flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(120,120,128,0.24)' : 'rgba(120,120,128,0.16)',
          color: fg, fontSize: 14, fontWeight: 600, letterSpacing: -0.2,
          fontFamily: '-apple-system, "SF Pro Text", system-ui',
        }}>Not now</button>
        <button onClick={onOpen} style={{
          flex: 1.4, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: accent, color: '#fff',
          fontSize: 14, fontWeight: 600, letterSpacing: -0.2,
          fontFamily: '-apple-system, "SF Pro Text", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          Open Gmail
          <svg width="11" height="11" viewBox="0 0 12 12"><path d="M3 1h7v7M10 1L1 10" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
        </button>
      </div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${sep}`,
        cursor: 'pointer',
      }}>
        <div onClick={(e) => { e.preventDefault(); setAlwaysOpen(!alwaysOpen); }}
          style={{
            width: 18, height: 18, borderRadius: 5,
            background: alwaysOpen ? accent : 'transparent',
            border: `1.5px solid ${alwaysOpen ? accent : muted}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s, border-color 0.15s',
          }}>
          {alwaysOpen && (
            <svg width="10" height="8" viewBox="0 0 11 9"><path d="M1 4.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>
        <span style={{ fontSize: 12.5, color: fg, letterSpacing: -0.1 }}>
          Always copy + open Gmail
        </span>
      </label>
    </div>
  );
}

function PhoneFrame({ dark, showFrame, statusBarDark, children }) {
  // statusBarDark forces the status bar icons to light/dark independently
  // of the device dark prop — needed when a screen renders a colored hero
  // under the bar (black icons on violet are unreadable).
  const sb = statusBarDark != null ? statusBarDark : dark;
  if (!showFrame) {
    // Full-bleed mode for screenshots — strip the bezel but keep the
    // status bar / home indicator so the screen stays self-contained.
    return (
      <div style={{
        width: 402, height: 874, overflow: 'hidden',
        position: 'relative', background: dark ? '#000' : '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        borderRadius: 4,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <IOSStatusBar dark={sb} />
        </div>
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: dark ? '#000' : '#fff',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }} />
      {/* status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={sb} />
      </div>
      {/* screen content */}
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
        }} />
      </div>
    </div>
  );
}

function TabBar({ tab, setTab, dark, accent }) {
  const fg = dark ? '#fff' : '#1c1c1e';
  const inactive = dark ? 'rgba(235,235,245,0.45)' : 'rgba(60,60,67,0.55)';
  const bg = dark ? 'rgba(28,28,30,0.85)' : 'rgba(255,255,255,0.85)';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.18)';

  const tabs = [
    { id: 'editor', label: 'Editor', icon: 'pencil' },
    { id: 'templates', label: 'Templates', icon: 'bookmark' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingBottom: 28, paddingTop: 8,
      background: bg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${sep}`,
      display: 'flex',
    }}>
      {tabs.map((tb) => {
        const active = tab === tb.id;
        const color = active ? accent : inactive;
        return (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{
              flex: 1, height: 50, border: 'none', background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: 0, cursor: 'pointer',
            }}>
            {tb.icon === 'pencil' && Icon.pencil(color)}
            {tb.icon === 'bookmark' && Icon.bookmark(color, active)}
            {tb.icon === 'gear' && Icon.gear(color)}
            <div style={{
              fontSize: 10, fontWeight: 500, color, letterSpacing: 0.1,
              fontFamily: '-apple-system, system-ui',
            }}>{tb.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('editor');
  const [content, setContent] = React.useState(SAMPLE_EMAIL);
  const [toAddr, setToAddr] = React.useState('sam@example.com');
  const [subject, setSubject] = React.useState('Project recap & next steps');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(15);
  const [textColor, setTextColor] = React.useState('#1c1c1e');
  // Gmail handoff toast — appears after Copy succeeds. If user has opted into
  // "Always copy + open Gmail", we skip the toast and pretend to launch Gmail.
  const [gmailToast, setGmailToast] = React.useState(false);

  const dark = t.dark;
  const accent = t.accent;
  const onboarding = t.showOnboarding;

  const doCopy = React.useCallback(() => {
    try {
      const blob = new Blob([content], { type: 'text/html' });
      // ClipboardItem may not exist in all iframes — fall back to text.
      if (window.ClipboardItem && navigator.clipboard?.write) {
        navigator.clipboard.write([new window.ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([content.replace(/<[^>]+>/g, '')], { type: 'text/plain' }),
        })]).catch(() => {});
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(content).catch(() => {});
      }
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    // Open Gmail directly if the user has previously opted in; otherwise
    // show the handoff toast.
    if (t.alwaysOpenGmail) {
      // Stub — in a real app this would deeplink to googlegmail://co
    } else {
      setGmailToast(true);
    }
  }, [content, t.alwaysOpenGmail]);

  const stageBg = dark
    ? 'radial-gradient(ellipse at 50% 30%, #1c1c1e 0%, #0a0a0a 60%)'
    : 'radial-gradient(ellipse at 50% 30%, #fafafa 0%, #e8e8ec 60%)';

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: stageBg, padding: 24, boxSizing: 'border-box',
    }}>
      {/* Global editor styles — placeholder, list/heading rhythm */}
      <style>{`
        .pc-editor:empty::before {
          content: attr(data-placeholder);
          color: ${dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)'};
          pointer-events: none;
        }
        .pc-editor h1, .pc-editor h2, .pc-editor h3 {
          margin: 18px 0 6px; letter-spacing: -0.4px;
        }
        .pc-editor h1 { font-size: 26px; font-weight: 700; }
        .pc-editor h2 { font-size: 21px; font-weight: 700; }
        .pc-editor h3 { font-size: 18px; font-weight: 600; }
        .pc-editor p { margin: 0 0 10px; }
        .pc-editor ul, .pc-editor ol { margin: 0 0 10px; padding-left: 22px; }
        .pc-editor li { margin: 2px 0; }
        .pc-editor blockquote {
          margin: 6px 0; padding: 2px 0 2px 12px;
          border-left: 3px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(60,60,67,0.3)'};
          color: ${dark ? 'rgba(235,235,245,0.7)' : 'rgba(60,60,67,0.7)'};
          font-style: italic;
        }
        .pc-editor pre {
          margin: 6px 0; padding: 10px 12px; border-radius: 8px;
          background: ${dark ? '#1c1c1e' : '#f2f2f7'};
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          font-size: 14px; white-space: pre-wrap;
        }
        .pc-editor a { color: ${accent}; text-decoration: underline; }
        .pc-toolbar-scroll::-webkit-scrollbar { display: none; }

        @keyframes pcSheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <PhoneFrame dark={onboarding ? false : dark} showFrame={t.showFrame}
                  statusBarDark={onboarding ? false : (tab === 'editor' ? true : dark)}>
        {onboarding && (
          <Onboarding
            accent={accent}
            setAccent={(v) => setTweak('accent', v)}
            onDone={() => setTweak('showOnboarding', false)}
          />
        )}
        {!onboarding && tab === 'editor' && (
          <EditorScreen
            dark={dark} accent={accent}
            content={content} setContent={setContent}
            toAddr={toAddr} setToAddr={setToAddr}
            subject={subject} setSubject={setSubject}
            composeFields={t.composeFields}
            onCopy={doCopy} copied={copied}
            onOpenPreview={() => setPreviewOpen(true)}
          />
        )}
        {!onboarding && tab === 'templates' && (
          <TemplatesScreen
            dark={dark} accent={accent}
            populated={t.templatesPopulated}
          />
        )}
        {!onboarding && tab === 'settings' && (
          <SettingsScreen
            dark={dark} accent={accent}
            fontSize={fontSize} setFontSize={setFontSize}
            textColor={textColor} setTextColor={setTextColor}
          />
        )}

        {/* Tab bar — hidden on editor (keyboard is up) and during onboarding */}
        {!onboarding && tab !== 'editor' && (
          <TabBar tab={tab} setTab={setTab} dark={dark} accent={accent} />
        )}

        {/* Floating mini tab bar on editor — pinned to absolute bottom */}
        {!onboarding && tab === 'editor' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
            pointerEvents: 'none',
          }}>
            <FloatingNav tab={tab} setTab={setTab} dark={dark} accent={accent} />
          </div>
        )}

        <PreviewModal
          open={previewOpen} onClose={() => setPreviewOpen(false)}
          content={content} dark={dark} accent={accent}
          onCopy={doCopy} copied={copied}
        />
        <GmailHandoffToast
          open={gmailToast}
          onClose={() => setGmailToast(false)}
          onOpen={() => setGmailToast(false)}
          alwaysOpen={t.alwaysOpenGmail}
          setAlwaysOpen={(v) => setTweak('alwaysOpenGmail', v)}
          dark={dark} accent={accent}
        />
      </PhoneFrame>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakToggle label="Dark mode" value={t.dark}
                       onChange={(v) => setTweak('dark', v)} />
          <TweakColor label="Brand" value={t.accent}
                      options={['#6E55FF', '#007AFF', '#FF6B5C', '#00B894', '#1c1c1e']}
                      onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection label="Content">
          <TweakToggle label="Give me Gmail feels" value={t.composeFields}
                       onChange={(v) => setTweak('composeFields', v)} />
          <TweakToggle label="Templates populated" value={t.templatesPopulated}
                       onChange={(v) => setTweak('templatesPopulated', v)} />
        </TweakSection>
        <TweakSection label="Frame">
          <TweakToggle label="Show device bezel" value={t.showFrame}
                       onChange={(v) => setTweak('showFrame', v)} />
          <TweakToggle label="Show onboarding" value={t.showOnboarding}
                       onChange={(v) => setTweak('showOnboarding', v)} />
        </TweakSection>
        <TweakSection label="Quick jump">
          <div style={{ display: 'flex', gap: 6 }}>
            {['editor', 'templates', 'settings'].map((id) => (
              <button key={id} onClick={() => setTab(id)}
                className="twk-btn secondary"
                style={{ flex: 1, textTransform: 'capitalize' }}>{id}</button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Pinned-to-bottom floating nav on the editor tab — gives the user a way
// back to Templates / Settings without dismissing the keyboard. Sits above
// the keyboard via overlay; iOS apps with full-time keyboards use the same
// pattern (Things 3, Bear, Drafts).
function FloatingNav({ tab, setTab, dark, accent }) {
  const inactive = dark ? 'rgba(235,235,245,0.5)' : 'rgba(60,60,67,0.55)';
  return (
    <div style={{
      position: 'absolute', left: 12, bottom: 6, zIndex: 55,
      display: 'flex', gap: 4, pointerEvents: 'auto',
      padding: 4, borderRadius: 22,
      background: dark ? 'rgba(44,44,46,0.85)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)',
    }}>
      {[
        { id: 'editor', icon: 'pencil' },
        { id: 'templates', icon: 'bookmark' },
        { id: 'settings', icon: 'gear' },
      ].map((tb) => {
        const active = tab === tb.id;
        const color = active ? accent : inactive;
        return (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{
              width: 34, height: 34, borderRadius: 17, border: 'none',
              background: active ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, cursor: 'pointer',
            }}>
            {tb.icon === 'pencil' && Icon.pencil(color)}
            {tb.icon === 'bookmark' && Icon.bookmark(color, active)}
            {tb.icon === 'gear' && Icon.gear(color)}
          </button>
        );
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
