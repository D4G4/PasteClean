// onboarding.jsx — 5-screen onboarding flow
// Screens: Problem · How it works · Under the hood · 3-step flow · Theme picker

const ONB_ACCENT = '#007AFF'; // iOS system blue across onboarding

// ─────────────────────────────────────────────────────────────
// Illustrations
// ─────────────────────────────────────────────────────────────

// Side-by-side: original styled email vs Gmail's white-on-white catastrophe.
// Same content, same colors — only the background flips, exposing the bug.
function ProblemArt() {
  // The body content the user wrote. Same tokens on both sides; only the
  // surrounding chrome + bg differ. White text on the right disappears.
  const Body = ({ headerColor, bodyColor, mutedColor }) => (
    <div style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 9.5, lineHeight: 1.45, color: bodyColor,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div>Hey team,</div>
      <div>Quick notes from this morning's sync —</div>
      <div style={{ marginTop: 2 }}>
        • <span style={{ fontWeight: 700, color: headerColor }}>Beta signups:</span> <span style={{ color: '#34C759' }}>247</span> <span style={{ color: mutedColor }}>(+38)</span>
      </div>
      <div>
        • <span style={{ fontWeight: 700, color: headerColor }}>Blocker:</span> <span style={{ color: '#FF9F0A' }}>auth on Android</span>
      </div>
      <div>
        • <span style={{ fontWeight: 700, color: headerColor }}>Ship date:</span> <span style={{ color: '#34C759', fontWeight: 700 }}>May 28</span>
      </div>
      <div style={{marginTop: 3, color: mutedColor, fontSize: 9}}>\u2014 Sent from PasteClean</div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 22px 0',
      alignItems: 'stretch', justifyContent: 'center',
    }}>
      {/* Original — same Gmail UI, but in DARK MODE (where you wrote it) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'rgba(60,60,67,0.55)', fontFamily: '-apple-system, system-ui',
          paddingLeft: 4,
        }}>You wrote (dark mode)</div>
        <div style={{
          flex: 1, borderRadius: 14, background: '#202124', overflow: 'hidden',
          boxShadow: '0 10px 26px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
          aspectRatio: '0.78',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          {/* Subject row */}
          <div style={{
            padding: '8px 10px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 6,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: '#e8eaed',
              letterSpacing: -0.1, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1,
            }}>Q2 launch recap</div>
            <div style={{
              width: 14, height: 14, borderRadius: 7,
              border: '1px solid #9aa0a6', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="7" height="7" viewBox="0 0 8 8">
                <path d="M2 1l3 3-3 3" stroke="#9aa0a6" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
          {/* Inbox label chip */}
          <div style={{ padding: '0 10px 6px' }}>
            <span style={{
              display: 'inline-block', fontSize: 7, fontWeight: 500,
              color: '#9aa0a6', border: '1px solid #5f6368', borderRadius: 3,
              padding: '1px 4px', letterSpacing: 0.1,
            }}>Inbox</span>
          </div>
          {/* Sender row */}
          <div style={{
            padding: '0 10px 8px', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: '#8ab4f8',
              color: '#202124', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>M</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9.5, color: '#e8eaed', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                me
                <span style={{ fontSize: 8, color: '#9aa0a6', fontWeight: 400 }}>9:47 AM</span>
              </div>
              <div style={{ fontSize: 8, color: '#9aa0a6' }}>
                to Sam <span style={{ fontSize: 8 }}>▾</span>
              </div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M9 17l-5-5 5-5M20 12H4" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Body — white text reads fine on dark */}
          <div style={{ padding: '0 10px', flex: 1, position: 'relative' }}>
            <Body headerColor="#fff"
                  bodyColor="rgba(255,255,255,0.92)"
                  mutedColor="rgba(255,255,255,0.5)" />
            <div style={{
              position: 'absolute', bottom: 6, left: 10, right: 10,
              display: 'flex', gap: 5,
            }}>
              <div style={{
                fontSize: 8.5, color: '#9aa0a6', fontWeight: 500,
                border: '1px solid #5f6368', borderRadius: 14,
                padding: '2px 7px',
              }}>↶ Reply</div>
              <div style={{
                fontSize: 8.5, color: '#9aa0a6', fontWeight: 500,
                border: '1px solid #5f6368', borderRadius: 14,
                padding: '2px 7px',
              }}>↷ Forward</div>
            </div>
          </div>
        </div>
      </div>

      {/* In Gmail — real-ish sent UI: avatar, sender, To, subject, body, action row */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          color: '#FF3B30', fontFamily: '-apple-system, system-ui',
          paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 4,
        }}>In Gmail (light)</div>
        <div style={{
          flex: 1, borderRadius: 14, background: '#fff', overflow: 'hidden',
          border: '0.5px solid rgba(60,60,67,0.18)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column',
          aspectRatio: '0.78',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          {/* Subject row */}
          <div style={{
            padding: '8px 10px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 6,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: '#202124',
              letterSpacing: -0.1, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1,
            }}>Q2 launch recap</div>
            <div style={{
              width: 14, height: 14, borderRadius: 7,
              border: '1px solid #5f6368', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="7" height="7" viewBox="0 0 8 8">
                <path d="M2 1l3 3-3 3" stroke="#5f6368" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
          {/* Inbox label chip */}
          <div style={{ padding: '0 10px 6px' }}>
            <span style={{
              display: 'inline-block', fontSize: 7, fontWeight: 500,
              color: '#5f6368', border: '1px solid #dadce0', borderRadius: 3,
              padding: '1px 4px', letterSpacing: 0.1,
            }}>Inbox</span>
          </div>
          {/* Sender row */}
          <div style={{
            padding: '0 10px 8px', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: '#1a73e8',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>M</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9.5, color: '#202124', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                me
                <span style={{ fontSize: 8, color: '#5f6368', fontWeight: 400 }}>9:47 AM</span>
              </div>
              <div style={{ fontSize: 8, color: '#5f6368' }}>
                to Sam <span style={{ fontSize: 8 }}>▾</span>
              </div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M9 17l-5-5 5-5M20 12H4" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Body — same white text tokens as left side. Disappears. */}
          <div style={{ padding: '0 10px', flex: 1, position: 'relative' }}>
            <Body headerColor="#fff"
                  bodyColor="rgba(255,255,255,0.92)"
                  mutedColor="rgba(255,255,255,0.5)" />
            {/* Reply / Forward action chips — adds Gmail authenticity */}
            <div style={{
              position: 'absolute', bottom: 6, left: 10, right: 10,
              display: 'flex', gap: 5,
            }}>
              <div style={{
                fontSize: 8.5, color: '#5f6368', fontWeight: 500,
                border: '1px solid #dadce0', borderRadius: 14,
                padding: '2px 7px',
              }}>↶ Reply</div>
              <div style={{
                fontSize: 8.5, color: '#5f6368', fontWeight: 500,
                border: '1px solid #dadce0', borderRadius: 14,
                padding: '2px 7px',
              }}>↷ Forward</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A faithful miniature of the real PasteClean editor — violet hero,
// To/Subject rows, body, then formatting toolbar sitting on top of a
// keyboard sliver. The "Copy" pill pulses to draw the eye.
function HowArt({ accent = '#FF6B5C' }) {
  const violet = accent;
  return (
    <div style={{ padding: '28px 40px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '100%', borderRadius: 22, overflow: 'hidden', background: '#fff',
        border: '0.5px solid rgba(60,60,67,0.14)',
        boxShadow: '0 16px 36px rgba(0,0,0,0.12)',
        fontFamily: '-apple-system, system-ui',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Violet hero — app name + Copy */}
        <div style={{
          background: violet,
          padding: '12px 14px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="14" viewBox="0 0 14 16">
                <path d="M3 2h8a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#fff" strokeWidth="1.2" fill="none"/>
                <path d="M5 1h4a1 1 0 011 1v1H4V2a1 1 0 011-1z" fill="#fff"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: -0.2 }}>PasteClean</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#fff" strokeWidth="1.2"/>
                <circle cx="8" cy="8" r="2" fill="#fff"/>
              </svg>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -6, borderRadius: 99,
                background: 'rgba(255,255,255,0.35)',
                animation: 'pcOnbPulse 1.6s ease-out infinite',
              }} />
              <div style={{
                position: 'relative',
                padding: '5px 12px', borderRadius: 99, background: '#fff',
                color: violet, fontWeight: 700, fontSize: 12,
              }}>Copy</div>
            </div>
          </div>
        </div>

        {/* To row */}
        <div style={{
          padding: '8px 14px', borderBottom: '0.5px solid rgba(60,60,67,0.1)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11,
        }}>
          <span style={{ color: 'rgba(60,60,67,0.55)' }}>To</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#f2f2f7', borderRadius: 99, padding: '2px 7px 2px 3px',
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: 7, background: violet,
              color: '#fff', fontSize: 8, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>S</span>
            <span style={{ color: '#1c1c1e', fontWeight: 500 }}>Sam</span>
          </span>
        </div>
        {/* Subject row */}
        <div style={{
          padding: '6px 14px 8px', borderBottom: '0.5px solid rgba(60,60,67,0.1)',
          fontSize: 12, fontWeight: 600, color: '#1c1c1e', letterSpacing: -0.2,
        }}>Q2 launch recap</div>

        {/* Body */}
        <div style={{
          padding: '10px 14px 8px', fontSize: 11.5, color: '#1c1c1e', lineHeight: 1.5,
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          <div>Hi Sam,</div>
          <div>Quick recap from this morning's sync —</div>
          <div>• <b>Beta signups:</b> <span style={{ color: '#0a8a45', fontWeight: 600 }}>247</span> <span style={{
            position: 'relative', display: 'inline-block',
            color: 'rgba(60,60,67,0.55)', padding: '0 2px',
          }}>(+38 wk)<svg style={{
            position: 'absolute', inset: '-3px -4px', width: 'calc(100% + 8px)', height: 'calc(100% + 6px)',
            pointerEvents: 'none', overflow: 'visible',
          }} viewBox="0 0 100 40" preserveAspectRatio="none">
            <path d="M 8 22 C 0 12, 20 4, 50 4 C 88 4, 100 14, 96 22 C 92 32, 70 38, 40 36 C 12 34, 4 30, 8 22" stroke={violet} strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg></span></div>
          <div>• <b>Blocker:</b> <span style={{color:'#c2410c',fontWeight:600}}>auth on Android</span> — Maya on it</div>
          <div>• <b>Ship date:</b> <span style={{ color: '#0a8a45', fontWeight: 600 }}>May 28</span> ✓</div>
          {/* Pasted-from-dark-mode block — shows the editor handling pasted dark text */}
          <div style={{
            marginTop: 4, padding: '6px 8px',
            background: '#1c1c1e', color: '#fff',
            borderRadius: 5, fontSize: 10.5, lineHeight: 1.35,
            position: 'relative', border: `1px dashed ${violet}80`,
          }}>
            <div style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: 0.5,
              opacity: 0.5, marginBottom: 2,
              fontFamily: '-apple-system, system-ui',
            }}>PASTED FROM SLACK</div>
            <div>"Auth fix is in review — should ship by EOD."</div>
            <div style={{
              position: 'absolute', top: -6, right: -4,
              fontSize: 7.5, fontWeight: 700, color: '#fff',
              background: violet, padding: '2px 5px', borderRadius: 99,
              fontFamily: '-apple-system, system-ui', letterSpacing: 0.2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            }}>WILL BE FIXED ON COPY</div>
          </div>
          {/* Caret */}
          <div style={{
            width: 1.5, height: 13, background: violet, marginTop: 2,
            animation: 'pcOnbCaret 1.1s steps(2, end) infinite',
          }} />
        </div>

        {/* Formatting toolbar — sits directly on the keyboard, like iOS */}
        <div style={{
          padding: '7px 10px', background: '#f9f9fb',
          borderTop: '0.5px solid rgba(60,60,67,0.1)',
          display: 'flex', gap: 4, alignItems: 'center',
        }}>
          {[
            { c: 'B', style: { fontWeight: 800 } },
            { c: 'I', style: { fontStyle: 'italic', fontWeight: 600 } },
            { c: 'U', style: { textDecoration: 'underline', fontWeight: 600 } },
            { c: 'S', style: { textDecoration: 'line-through', fontWeight: 600 } },
          ].map(({ c, style }) => (
            <div key={c} style={{
              width: 22, height: 22, borderRadius: 5, background: '#fff',
              border: '0.5px solid rgba(60,60,67,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#1c1c1e', ...style,
            }}>{c}</div>
          ))}
          <div style={{ width: 1, height: 14, background: 'rgba(60,60,67,0.14)', margin: '0 3px' }} />
          <div style={{
            padding: '0 7px', height: 22, borderRadius: 5, background: '#fff',
            border: '0.5px solid rgba(60,60,67,0.14)',
            display: 'flex', alignItems: 'center', fontSize: 9.5, fontWeight: 700,
            color: '#1c1c1e',
          }}>H1</div>
          <div style={{
            width: 22, height: 22, borderRadius: 5, background: '#fff',
            border: '0.5px solid rgba(60,60,67,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#1c1c1e', fontWeight: 700,
          }}>•</div>
        </div>

        {/* Keyboard sliver — just 2 rows to suggest the toolbar floats above */}
        <div style={{
          padding: '6px 6px 8px', background: '#d1d5db',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[10, 9].map((n, row) => (
            <div key={row} style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{
                  width: 18, height: 12, borderRadius: 3, background: '#fff',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.18)',
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 8-step sanitization pipeline.
const STEPS = [
  { n: '01', label: 'Inlines all CSS',          body: <>Gmail ignores <code>&lt;style&gt;</code> blocks. We convert classes to inline <code>style=""</code>.</> },
  { n: '02', label: 'Strips dangerous tags',    body: <><span style={{textDecoration:'line-through',color:'#FF3B30'}}>&lt;script&gt; &lt;iframe&gt; &lt;form&gt;</span> — gone. Only safe HTML survives.</> },
  { n: '03', label: 'Removes unsupported CSS',  body: <><span style={{textDecoration:'line-through',color:'#FF3B30'}}>position, transform, box-shadow, animation</span> — stripped.</> },
  { n: '04', label: 'Converts headings',        body: <><code>&lt;h1&gt;</code> → <code style={{color:'#34C759'}}>&lt;p style="font-size:22px;font-weight:bold"&gt;</code>.</> },
  { n: '05', label: 'Fixes invisible text',     body: <>Light text on white? We darken it until WCAG contrast ≥ 3:1 — hue preserved.</> },
  { n: '06', label: 'Strips dark backgrounds',  body: <><code style={{textDecoration:'line-through',color:'#FF3B30'}}>background:#1a1a1a</code> removed; text re-tinted to read on white.</> },
  { n: '07', label: 'Forces explicit colors',   body: <>Adds <code style={{color:'#34C759'}}>color:#000</code> and <code style={{color:'#34C759'}}>background:#fff</code> so Gmail's dark mode can't invert anything.</> },
  { n: '08', label: 'Cleans up',                body: <>Empty spans, redundant wrappers, orphan attributes — stripped.</> },
];

function PipelineArt() {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', minHeight: 0,
      padding: '4px 22px 16px',
      maskImage: 'linear-gradient(to bottom, #000 0, #000 calc(100% - 24px), transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, #000 0, #000 calc(100% - 24px), transparent 100%)',
    }}>
      {/* Input chip */}
      <div style={{
        background: '#1c1c1e', color: '#ff8a80',
        borderRadius: 10, padding: '8px 12px', marginBottom: 10,
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>INPUT</span>
        <span style={{ flex: 1 }}>&lt;style&gt;.x{'{color:#fff}'}&lt;/style&gt;…</span>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: '#fff', borderRadius: 12, padding: '10px 12px',
            border: '0.5px solid rgba(60,60,67,0.1)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
              background: `${ONB_ACCENT}14`, color: ONB_ACCENT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, fontFamily: 'ui-monospace, "SF Mono", monospace',
            }}>{s.n}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#1c1c1e',
                fontFamily: '-apple-system, system-ui', letterSpacing: -0.1, marginBottom: 2,
              }}>{s.label}</div>
              <div style={{
                fontSize: 11, color: 'rgba(60,60,67,0.72)', lineHeight: 1.4,
                fontFamily: '-apple-system, system-ui',
              }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Output chip */}
      <div style={{
        marginTop: 10,
        background: '#0f172a', color: '#86efac',
        borderRadius: 10, padding: '8px 12px',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>OUTPUT</span>
        <span style={{ flex: 1 }}>&lt;p style="color:#000"&gt;…&lt;/p&gt;</span>
      </div>
    </div>
  );
}

function FlowArt() {
  const stepBg = `${ONB_ACCENT}14`;
  const Step = ({ icon, n, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22, background: stepBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {icon}
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 22, height: 22, borderRadius: 11, background: ONB_ACCENT, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
          boxShadow: '0 4px 10px rgba(0,122,255,0.32)',
        }}>{n}</div>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: '#1c1c1e', textAlign: 'center',
        letterSpacing: -0.1, maxWidth: 96, lineHeight: 1.3,
        fontFamily: '-apple-system, system-ui',
      }}>{label}</div>
    </div>
  );
  const arrow = (
    <svg width="22" height="14" viewBox="0 0 22 14" style={{ marginTop: 24, flexShrink: 0 }}>
      <path d="M1 7h18m-4-4l4 4-4 4" stroke={ONB_ACCENT} strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  return (
    <div style={{ padding: '30px 18px', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
      <Step n="1" label="Write & style"
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M16 4l4 4L8 20H4v-4L16 4z" stroke={ONB_ACCENT} strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M14 6l4 4" stroke={ONB_ACCENT} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>} />
      {arrow}
      <Step n="2" label="Tap Copy"
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h8a1 1 0 011 1v15a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={ONB_ACCENT} strokeWidth="1.7"/>
          <path d="M8 2h4a1 1 0 011 1v1H7V3a1 1 0 011-1z" fill={ONB_ACCENT}/>
          <path d="M7.5 12l2.5 2.5L14 10" stroke={ONB_ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>} />
      {arrow}
      <Step n="3" label="Paste & send"
        icon={<svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={ONB_ACCENT} strokeWidth="1.7" strokeLinejoin="round"/>
        </svg>} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Theme picker
// ─────────────────────────────────────────────────────────────
const THEMES = [
  { id: '#6E55FF', name: 'Iris',    sub: 'A confident violet' },
  { id: '#007AFF', name: 'Classic', sub: 'iOS system blue' },
  { id: '#FF6B5C', name: 'Coral',   sub: 'Warm & energetic' },
  { id: '#00B894', name: 'Mint',    sub: 'Fresh & clean' },
  { id: '#1c1c1e', name: 'Mono',    sub: 'No-nonsense black' },
];

function ThemeArt({ selected, onPick }) {
  return (
    <div style={{ padding: '14px 22px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {THEMES.map((th) => {
        const on = th.id === selected;
        return (
          <button key={th.id} onClick={() => onPick(th.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
              background: '#fff',
              border: on ? `2px solid ${th.id}` : '2px solid transparent',
              boxShadow: on
                ? `0 8px 22px ${th.id}33`
                : '0 1px 0 rgba(0,0,0,0.04), 0 0 0 0.5px rgba(60,60,67,0.12)',
              transition: 'all 0.18s ease',
              textAlign: 'left',
            }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: th.id,
              boxShadow: `0 4px 12px ${th.id}55`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: '#1c1c1e', letterSpacing: -0.3,
                fontFamily: '-apple-system, "SF Pro Display", system-ui',
              }}>{th.name}</div>
              <div style={{
                fontSize: 12, color: 'rgba(60,60,67,0.6)', letterSpacing: -0.1,
                fontFamily: '-apple-system, system-ui',
              }}>{th.sub}</div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              border: on ? `none` : '1.5px solid rgba(60,60,67,0.22)',
              background: on ? th.id : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {on && (
                <svg width="11" height="9" viewBox="0 0 11 9">
                  <path d="M1 4.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen scaffold
// ─────────────────────────────────────────────────────────────
function OnbScreen({ title, subtitle, art, top = 0.58, reverse = false, balanced = false }) {
  const artZone = (
    <div key="art" style={{
      flex: (reverse || balanced) ? 1 : top, minHeight: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
    }}>{art}</div>
  );
  const textZone = (
    <div key="text" style={{
      flex: (reverse || balanced) ? '0 0 auto' : 1 - top,
      padding: reverse
        ? '32px 28px 12px'
        : balanced
        ? '32px 28px 32px'
        : '44px 28px 4px',
    }}>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: '#1c1c1e',
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
          lineHeight: 1.15, marginBottom: 10, textWrap: 'pretty',
        }}>{title}</div>
        <div style={{
          fontSize: 15, color: 'rgba(60,60,67,0.72)', lineHeight: 1.42,
          letterSpacing: -0.2, fontFamily: '-apple-system, system-ui',
          textWrap: 'pretty',
        }}>{subtitle}</div>
      </div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {reverse ? <>{textZone}{artZone}</> : <>{artZone}{textZone}</>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Onboarding container
// ─────────────────────────────────────────────────────────────
function Onboarding({ onDone, accent, setAccent, initialPage = 0 }) {
  const [page, setPage] = React.useState(initialPage);
  const N = 5;
  const isLast = page === N - 1;
  // Swipe-to-navigate. Track start X on pointer-down; on pointer-up,
  // a horizontal delta > 50px commits a page change. Vertical drags pass
  // through so embedded scrollers (preview sheet) still work.
  const swipe = React.useRef({ x: 0, y: 0, active: false });
  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY, active: true };
  };
  const onPointerUp = (e) => {
    if (!swipe.current.active) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    swipe.current.active = false;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && page < N - 1) setPage(page + 1);
    else if (dx > 0 && page > 0) setPage(page - 1);
  };

  const screens = [
    <OnbScreen key="0"
      title="It's 2026. Why does this still suck?"
      subtitle={<>You're on your phone. Writing to a <b style={{color:'#1c1c1e'}}>recruiter</b>, an <b style={{color:'#1c1c1e'}}>investor</b>, your <b style={{color:'#1c1c1e'}}>VP</b>. No laptop. No time to redo it. And Gmail mangles every dark-mode paste — white text on white background, colors trashed. Not a great look when stakes are high.</>}
      art={<ProblemArt />}
      top={0.5}
    />,
    <OnbScreen key="1"
      title="Write it once. Send it right."
      subtitle="Compose with full formatting. Tap Copy. We rewrite your HTML to speak Gmail's language."
      art={<HowArt accent={accent} />}
      top={0.58}
      balanced
    />,
    <PreviewWithSheet key="2" accent={accent} />,
    <OnbScreen key="3"
      title="Write. Copy. Paste."
      subtitle="Three taps from idea to inbox. PasteClean handles the messy part so you can focus on the words."
      art={<FlowArt />}
      top={0.46}
      reverse
    />,
    <div key="4" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 28px 8px' }}>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: '#1c1c1e',
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
          lineHeight: 1.15, marginBottom: 8,
        }}>Pick a vibe.</div>
        <div style={{
          fontSize: 14, color: 'rgba(60,60,67,0.72)', lineHeight: 1.4,
          letterSpacing: -0.15, fontFamily: '-apple-system, system-ui',
        }}>Choose an accent for your header and buttons. You can change it anytime in Settings.</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <ThemeArt selected={accent} onPick={setAccent} />
      </div>
    </div>,
  ];

  return (
    <div style={{
      height: '100%', position: 'relative', background: '#fff',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(68px, calc(env(safe-area-inset-top, 0px) + 56px))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes pcOnbPulse {
          0% { transform: scale(0.96); opacity: 0.6; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes pcOnbCaret {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        @keyframes pcOnbSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Top chrome: Skip (right) — swipe left/right to navigate between screens */}
      <div style={{
        position: 'absolute',
        top: 'max(72px, calc(env(safe-area-inset-top, 0px) + 60px))',
        right: 18, zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {!isLast && page !== 0 && (
          <button onClick={onDone}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: accent, fontSize: 15, fontWeight: 500,
              fontFamily: '-apple-system, system-ui', letterSpacing: -0.2,
              padding: '6px 4px',
            }}>Skip</button>
        )}
      </div>

      {/* Screen content — swipe left/right to navigate */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { swipe.current.active = false; }}
        style={{ flex: 1, minHeight: 0, paddingTop: 28, display: 'flex', touchAction: 'pan-y' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{screens[page]}</div>
      </div>

      {/* Bottom controls */}
      <div style={{
        padding: '4px 24px 0',
        paddingBottom: 'max(44px, calc(env(safe-area-inset-bottom, 0px) + 24px))',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Pagination dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} style={{
              width: i === page ? 18 : 6, height: 6, borderRadius: 3,
              background: i === page ? accent : 'rgba(60,60,67,0.22)',
              transition: 'all 0.22s ease',
            }} />
          ))}
        </div>
        {/* CTA */}
        <button onClick={() => isLast ? onDone() : setPage(page + 1)}
          style={{
            height: 52, borderRadius: 26, border: 'none',
            background: accent,
            color: '#fff',
            fontSize: 17, fontWeight: 600, letterSpacing: -0.2,
            fontFamily: '-apple-system, "SF Pro Text", system-ui',
            cursor: 'pointer',
            boxShadow: `0 8px 20px ${accent}55`,
            transition: 'background 0.18s, box-shadow 0.18s',
          }}>
          {isLast ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// Gmail-fixed preview + "How do I work?" bottom sheet trigger.
// Replaces the standalone pipeline screen — keeps onboarding less technical
// but gives curious users a way to drill in.
function PreviewWithSheet({ accent }) {
  const [sheet, setSheet] = React.useState(false);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ padding: '28px 28px 8px' }}>
        <div style={{
          fontSize: 26, fontWeight: 700, letterSpacing: -0.6, color: '#1c1c1e',
          fontFamily: '-apple-system, "SF Pro Display", system-ui',
          lineHeight: 1.15, marginBottom: 6,
        }}>What Gmail will see.</div>
        <div style={{
          fontSize: 14, color: 'rgba(60,60,67,0.72)', lineHeight: 1.4,
          letterSpacing: -0.15, fontFamily: '-apple-system, system-ui',
        }}>Same email — sanitized for Gmail. Readable on any background. A couple of fancy tradeoffs marked below.</div>
      </div>

      {/* In-app Preview screen mock — mirrors PreviewModal */}
      <div style={{ flex: 1, minHeight: 0, padding: '4px 20px 8px', display: 'flex', maxHeight: 440 }}>
        <div style={{
          flex: 1, borderRadius: 16, background: '#f2f2f7', overflow: 'hidden',
          border: '0.5px solid rgba(60,60,67,0.14)',
          boxShadow: '0 14px 30px rgba(0,0,0,0.10)',
          display: 'flex', flexDirection: 'column',
          fontFamily: '-apple-system, system-ui',
        }}>
          {/* Grabber */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
            <div style={{ width: 30, height: 4, borderRadius: 2, background: '#d1d1d6' }} />
          </div>
          {/* Title */}
          <div style={{
            padding: '2px 14px 8px', fontSize: 15, fontWeight: 700,
            color: '#1c1c1e', letterSpacing: -0.3,
          }}>Preview</div>
          {/* Mode toggle */}
          <div style={{ padding: '0 14px 8px' }}>
            <div style={{
              display: 'flex', padding: 2, borderRadius: 7, background: '#e5e5ea',
            }}>
              <div style={{
                flex: 1, height: 22, borderRadius: 5, background: accent, color: '#fff',
                fontSize: 10, fontWeight: 600, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>Gmail Safe</div>
              <div style={{
                flex: 1, height: 22, borderRadius: 5, color: '#1c1c1e',
                fontSize: 10, fontWeight: 600, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>Original</div>
            </div>
          </div>
          {/* Status badge */}
          <div style={{ padding: '0 14px 8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 9px', borderRadius: 8,
              background: 'rgba(52,199,89,0.12)', color: '#248a3d',
              fontSize: 10, fontWeight: 600, letterSpacing: -0.1,
            }}>
              <span style={{
                width: 13, height: 13, borderRadius: 7, background: '#34c759',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="8" height="6" viewBox="0 0 11 9"><path d="M1 4.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Sanitized — safe for Gmail
            </div>
          </div>
          {/* WebView card */}
          <div style={{ flex: 1, minHeight: 0, padding: '0 12px 8px' }}>
            <div style={{
              height: '100%', borderRadius: 10, overflow: 'hidden',
              background: '#fff', border: '0.5px solid rgba(60,60,67,0.15)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: '6px 10px 5px',
                borderBottom: '1px solid #f0f0f0',
                fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#5f6368',
                lineHeight: 1.35,
              }}>
                <div><span style={{color:'#202124',fontWeight:600}}>Subject:</span> Q2 launch recap</div>
                <div><span style={{color:'#202124',fontWeight:600}}>To:</span> sam@company.com</div>
              </div>
              <div style={{
                flex: 1, padding: '8px 10px',
                fontFamily: 'Arial, sans-serif', fontSize: 10, lineHeight: 1.5,
                color: '#202124', display: 'flex', flexDirection: 'column', gap: 3,
              }}>
                <div>Hi Sam,</div>
                <div>Quick recap from this morning's sync —</div>
                <div>• <b>Beta signups:</b> <span style={{color:'#248a3d',fontWeight:700}}>247</span> (+38 wk)</div>
                <div>• <b>Blocker:</b> <span style={{color:'#c2410c',fontWeight:700}}>auth on Android</span> — Maya on it</div>
                <div>• <b>Ship date:</b> <span style={{color:'#248a3d',fontWeight:700}}>May 28</span> ✓</div>
                {/* Previously pasted-from-Slack quote — now cleaned for Gmail */}
                <div style={{
                  marginTop: 4, padding: '5px 7px',
                  borderLeft: '2px solid #c2410c',
                  background: '#fafafa', color: '#202124',
                  fontStyle: 'italic', fontSize: 9.5, lineHeight: 1.4,
                }}>"Auth fix is in review — should ship by EOD."</div>
              </div>
              {/* Cleanup note */}
              <div style={{
                margin: '0 8px 8px', padding: '6px 8px',
                background: '#fff8e1', border: '0.5px solid #f3d27a', borderRadius: 6,
                fontSize: 9, color: '#7a5a00', lineHeight: 1.35,
                fontFamily: '-apple-system, system-ui', letterSpacing: -0.05,
                display: 'flex', alignItems: 'flex-start', gap: 5,
              }}>
                <span style={{fontWeight:700, flexShrink: 0}}>Cleanup:</span>
                <span>Pasted Slack quote — white-on-dark text recolored to black so it shows on Gmail's white</span>
              </div>
            </div>
          </div>
          {/* Copy for Gmail */}
          <div style={{ padding: '4px 12px 10px' }}>
            <div style={{
              height: 28, borderRadius: 8, background: accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, letterSpacing: -0.2,
            }}>Copy for Gmail</div>
          </div>
        </div>
      </div>

      {/* How do I work? trigger */}
      <div style={{ padding: '12px 24px 8px' }}>
        <button onClick={() => setSheet(true)}
          style={{
            width: '100%', padding: '12px 14px',
            background: 'rgba(60,60,67,0.06)', border: 'none',
            borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: '-apple-system, system-ui',
          }}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: accent,
              color: '#fff', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>?</div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize: 14, fontWeight: 600, color: '#1c1c1e', letterSpacing: -0.2}}>How do I work?</div>
              <div style={{fontSize: 11.5, color: 'rgba(60,60,67,0.6)'}}>Peek under the hood — 8 steps</div>
            </div>
          </div>
          <svg width="9" height="14" viewBox="0 0 9 14"><path d="M1 1l6 6-6 6" stroke="rgba(60,60,67,0.4)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Bottom sheet */}
      {sheet && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }} onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#f2f2f7', borderTopLeftRadius: 18, borderTopRightRadius: 18,
            maxHeight: '78%', display: 'flex', flexDirection: 'column',
            animation: 'pcOnbSheet 0.24s ease-out',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
              <div style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(60,60,67,0.25)' }} />
            </div>
            <div style={{
              padding: '8px 22px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: '-apple-system, system-ui',
            }}>
              <div>
                <div style={{fontSize: 18, fontWeight: 700, color: '#1c1c1e', letterSpacing: -0.4}}>How PasteClean works</div>
                <div style={{fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 1}}>An 8-step pipeline runs on every copy</div>
              </div>
              <button onClick={() => setSheet(false)} style={{
                width: 28, height: 28, borderRadius: 14,
                background: 'rgba(60,60,67,0.12)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="#3c3c43" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <PipelineArt />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Onboarding });
