/* ═══════════════════════════════════════════
   SolarTrack Pro — App.jsx
   React Application (loaded via Babel CDN)
═══════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback } = React;

// ──────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ──────────────────────────────────────────

function LiveDot() {
  return <div className="live-dot" />;
}

function LivePill({ label }) {
  return (
    <div className="live-pill">
      <div className="lp-dot" />
      {label}
    </div>
  );
}

function WChip({ icon, value }) {
  return (
    <div className="w-chip">
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

// ──────────────────────────────────────────
// NAVBAR
// ──────────────────────────────────────────

function Navbar({ clock, date, locPill, theme, onToggleTheme, currentUser, onProfileClick, userPhotoURL }) {
  const navRef = useRef(null);

  // Attach .scrolled class when page is scrolled > 10px
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Main floating pill — Logo | Clock | Controls ── */}
      <nav className="navbar" ref={navRef}>
        <div className="nav-logo">
          <div className="logo-icon"><img src="logo.png" alt="RAYMAX logo" /></div>
          <div className="logo-text">
            <div className="lt">RAYMAX</div>
            <div className="ls">Solar Tracking System</div>
          </div>
        </div>

        {/* Clock: flex:1 center — no absolute, no overlap */}
        <div className="nav-center">
          <div className="live-clock">{clock}</div>
          <div className="live-date">{date}</div>
        </div>

        {/* Right: avatar + theme + logout only */}
        <div className="nav-right">
          {currentUser && (
            <div
              title={
                currentUser.loginMethod === 'mobile'
                  ? `${currentUser.displayName} (${currentUser.mobile})`
                  : currentUser.email
              }
              onClick={onProfileClick}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: userPhotoURL ? 'transparent'
                  : currentUser.loginMethod === 'mobile'
                    ? 'linear-gradient(135deg,#34c759,#30d158)'
                    : 'linear-gradient(135deg,#ff9f0a,#ff6b00)',
                color: '#fff', fontWeight: 800, fontSize: '.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'pointer', overflow: 'hidden',
                boxShadow: userPhotoURL
                  ? '0 2px 8px rgba(0,0,0,.2)'
                  : currentUser.loginMethod === 'mobile'
                    ? '0 2px 8px rgba(52,199,89,.4)'
                    : '0 2px 8px rgba(255,159,10,.4)'
              }}
            >
              {userPhotoURL
                ? <img src={userPhotoURL} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
              }
            </div>
          )}
          <button className="icon-btn" id="themeBtn" onClick={onToggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="icon-btn"
            id="logoutBtn"
            title="Sign Out"
            onClick={async () => {
              localStorage.removeItem('raymax-mobile-user');
              try { await window.auth.signOut(); } catch (_) {}
              window.location.href = './auth/index.html';
            }}
          >🚪</button>
        </div>
      </nav>

      {/* ── Side cluster — LIVE badge on top, Location pill below ── */}
      <div className="nav-side-cluster">
        <div className="live-badge"><LiveDot />LIVE</div>
        <div className="loc-pill">📍 <span>{locPill}</span></div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────
// 3D SOLAR PANEL
// ──────────────────────────────────────────

function SolarPanel3D({ panelTilt, panelAzimuth, panelVoltage, efficiency }) {
  const azOffset = panelAzimuth;
  const pivotStyle = {
    transform: `rotateY(${azOffset + 180}deg) rotateX(${panelTilt}deg)`
  };

  return (
    <div className="glass-card">
      <div className="card-label">🔆 Solar Panel — 3D View</div>
      <div className="scene-wrap">
        <div className="scene-inner">
          <div className="s-ground" />
          <div className="s-base" />
          <div className="s-pole" />
          <div className="s-pivot" style={pivotStyle}>
            <div className="s-panel">
              <div className="s-face">
                <div className="cell-grid" />
                <div className="cell-shine" />
              </div>
              <div className="s-back" />
              <div className="s-edge-t" />
              <div className="s-edge-b" />
            </div>
          </div>
        </div>
      </div>
      <div className="panel-stats">
        <div className="ps-item">
          <div className="ps-val">{panelTilt.toFixed(1)}°</div>
          <div className="ps-lbl">Tilt (X)</div>
        </div>
        <div className="ps-item">
          <div className="ps-val">{panelAzimuth.toFixed(1)}°</div>
          <div className="ps-lbl">Azimuth (Y)</div>
        </div>
        <div className="ps-item">
          <div className="ps-val" style={{color:'var(--green)'}}>{panelVoltage.toFixed(2)} V</div>
          <div className="ps-lbl">Voltage</div>
        </div>
        <div className="ps-item">
          <div className="ps-val">{efficiency}%</div>
          <div className="ps-lbl">Efficiency</div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// SUN COMPASS SVG
// ──────────────────────────────────────────

function SunCompass({ sunEl, sunAz, panelTilt, panelAzimuth, pathD }) {
  const sunPos   = sunToXY(sunAz, sunEl);
  const panelPos = sunToXY(panelAzimuth, panelTilt);
  const isDay    = sunEl > 0;

  return (
    <div className="glass-card">
      <div className="card-label">🧭 Sky Map — Sun Path</div>
      <div className="compass-svg-wrap">
        <svg id="sunPathSVG" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="energyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff9f0a"/>
              <stop offset="100%" stopColor="#ff6b00"/>
            </radialGradient>
            <filter id="sunGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Hard-clip everything to the outer compass ring so the path never bleeds out */}
            <clipPath id="compassClip">
              <circle cx="130" cy="130" r="117"/>
            </clipPath>
          </defs>
          <circle cx="130" cy="130" r="118" className="c-ring"/>
          <circle cx="130" cy="130" r="78"  className="c-ring-mid"/>
          <circle cx="130" cy="130" r="39"  className="c-ring-mid"/>
          <line x1="130" y1="6"   x2="130" y2="254" className="c-cross"/>
          <line x1="6"   y1="130" x2="254" y2="130" className="c-cross"/>
          <text x="130" y="20"  className="c-lbl" textAnchor="middle">S</text>
          <text x="130" y="252" className="c-lbl" textAnchor="middle">N</text>
          <text x="250" y="134" className="c-lbl" textAnchor="middle">W</text>
          <text x="10"  y="134" className="c-lbl" textAnchor="middle">E</text>
          <text x="130" y="104" className="c-lbl" textAnchor="middle" opacity=".6">60°</text>
          <text x="130" y="65"  className="c-lbl" textAnchor="middle" opacity=".6">30°</text>

          <line x1="130" y1="130" x2={260 - panelPos.x} y2={260 - panelPos.y} className="panel-dir-line"/>
          <circle cx={260 - sunPos.x} cy={260 - sunPos.y} r="14" className="sun-dot-glow"  filter="url(#sunGlow)"/>
          <circle cx={260 - sunPos.x} cy={260 - sunPos.y} r="9"  className="sun-dot-inner" filter="url(#sunGlow)"/>
          <circle cx="130" cy="130" r="3" className="zenith-dot"/>
        </svg>
      </div>
      <div className="sqi">
        <div className="sqi-item">
          <div className="sqi-val">{sunEl.toFixed(1)}°</div>
          <div className="sqi-lbl">Elevation</div>
        </div>
        <div className="sqi-item">
          <div className="sqi-val">{sunAz.toFixed(1)}°</div>
          <div className="sqi-lbl">Azimuth</div>
        </div>
        <div className="sqi-item">
          <div className="sqi-val">{isDay ? "☀️ Day" : "🌙 Night"}</div>
          <div className="sqi-lbl">Status</div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// CONTROL PANEL
// ──────────────────────────────────────────

function ControlPanel({ mode, panelTilt, panelAzimuth, onModeChange, onSliderX, onSliderY }) {
  const xPct = ((panelTilt - 0) / 90 * 100).toFixed(1);
  const yPct = ((panelAzimuth - 0) / 360 * 100).toFixed(1);

  return (
    <div className="control-section">
      <div className="control-card">
        <div className="ctrl-header">
          <div className="ctrl-title-block">
            <div className="ct">Panel Control Mode</div>
            <div className="cs">Switch between automatic sun-tracking and manual control</div>
          </div>
          <div className="mode-pills">
            <button
              id="btnAuto"
              className={`mode-pill auto${mode === "auto" ? " active" : ""}`}
              onClick={() => onModeChange("auto")}
            >🤖 Auto Track</button>
            <button
              id="btnManual"
              className={`mode-pill manual${mode === "manual" ? " active" : ""}`}
              onClick={() => onModeChange("manual")}
            >🎛 Manual</button>
          </div>
        </div>

        {mode === "auto" ? (
          <div className="auto-info-box">
            <div className="aib-icon">🛰</div>
            <div>
              <div className="aib-title">Automatic Sun Tracking Active</div>
              <div className="aib-sub">Panel continuously aligns to optimal sun position using real-time solar position algorithms based on your GPS coordinates and current time.</div>
            </div>
          </div>
        ) : (
          <div className="sliders-wrap" style={{display:"grid"}}>
            {/* X Axis Slider */}
            <div className="slider-card">
              <div className="slc-head">
                <div>
                  <div className="slc-title">↕ X Axis — Tilt</div>
                  <div className="slc-desc">Vertical tilt angle (elevation)</div>
                </div>
                <div className="slc-badge">{panelTilt.toFixed(0)}°</div>
              </div>
              <input
                type="range" id="xSlider"
                min="0" max="90"
                value={panelTilt}
                style={{"--val": xPct + "%"}}
                onChange={e => onSliderX(parseFloat(e.target.value))}
              />
              <div className="slc-ends">
                <span>0° Flat</span><span>45° Mid</span><span>90° Vertical</span>
              </div>
            </div>
            {/* Y Axis Slider */}
            <div className="slider-card">
              <div className="slc-head">
                <div>
                  <div className="slc-title">↻ Y Axis — Azimuth</div>
                  <div className="slc-desc">Compass direction (rotation)</div>
                </div>
                <div className="slc-badge az">{panelAzimuth.toFixed(0)}°</div>
              </div>
              <input
                type="range" id="ySlider"
                min="0" max="360"
                value={panelAzimuth}
                className="az-slider"
                style={{"--val": yPct + "%"}}
                onChange={e => onSliderY(parseFloat(e.target.value))}
              />
              <div className="slc-ends">
                <span>0° N</span><span>180° S</span><span>360° N</span>
              </div>
              <div className="dir-labels">
                <span>N</span><span>NE</span><span>E</span><span>SE</span>
                <span>S</span><span>SW</span><span>W</span><span>NW</span><span>N</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// LOCATION WIDGET
// ──────────────────────────────────────────

function LocationWidget({ city, state, place, country, pincode, lat, lon, address }) {
  const headline = place && place !== '—' && place !== '--' ? place : city;
  const marqueeText = [place, city, state, country].filter(v => v && v !== '--' && v !== '—').join(" · ")
    + (lat && lon ? `  ·  ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E` : '');
  return (
    <div className="widget widget-loc">
      <div className="w-icon">📍</div>
      <div className="w-title">My Location</div>
      <div className="w-main" style={{fontSize: headline.length > 18 ? '1rem' : headline.length > 12 ? '1.2rem' : '1.6rem', lineHeight: 1.2}}>
        {headline}
      </div>
      <div className="w-sub" style={{marginTop: 6}}>{country}</div>
      <div className="marquee-box">
        <div className="marquee-track">
          <span className="marquee-item">📍  {marqueeText}  </span>
          <span className="marquee-item">📍  {marqueeText}  </span>
        </div>
      </div>
      <LivePill label="GPS Live" />
    </div>
  );
}

// ──────────────────────────────────────────
// WEATHER WIDGET
// ──────────────────────────────────────────

function WeatherWidget({ icon, temp, desc, humid, wind, feels, error, loading, onRetry }) {
  if (loading) {
    return (
      <div className="widget">
        <div className="w-icon">🌤</div>
        <div className="w-title">Weather</div>
        <div className="w-main" style={{fontSize:"1rem",color:"var(--t3)"}}>Fetching…</div>
        <div className="w-sub">Contacting Open-Meteo API</div>
        <div style={{marginTop:12,height:4,background:"var(--border-m)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:"40%",background:"var(--accent)",borderRadius:2,animation:"marqueeRoll 1.5s linear infinite"}} />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="widget" style={{borderColor:"rgba(255,59,48,.2)",background:"rgba(255,59,48,.04)"}}>
        <div className="w-icon">⚠️</div>
        <div className="w-title">Weather</div>
        <div className="w-main" style={{fontSize:"1rem",color:"var(--red)"}}>Unavailable</div>
        <div className="w-sub" style={{color:"var(--red)",opacity:.8}}>{error}</div>
        <button
          onClick={onRetry}
          style={{marginTop:14,padding:"8px 18px",borderRadius:"var(--r-pill)",border:"1px solid rgba(0,122,255,.3)",
            background:"rgba(0,122,255,.1)",color:"var(--accent)",fontSize:".78rem",fontWeight:700,cursor:"pointer",
            fontFamily:"inherit"}}
        >🔄 Retry</button>
      </div>
    );
  }
  return (
    <div className="widget">
      <div className="w-icon">{icon}</div>
      <div className="w-title">Weather</div>
      <div className="w-main">{temp}</div>
      <div className="w-sub">{desc}</div>
      <div className="w-row">
        <WChip icon="💧" value={humid} />
        <WChip icon="🌬" value={wind} />
        <WChip icon="🌡" value={feels} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// SUN POSITION WIDGET
// ──────────────────────────────────────────

function SunPositionWidget({ el, az, zenith }) {
  return (
    <div className="widget">
      <div className="w-icon">☀️</div>
      <div className="w-title">Sun Position</div>
      <div className="w-main">{el.toFixed(1)}°</div>
      <div className="w-sub">Elevation above horizon</div>
      <div className="w-row">
        <WChip icon="🧭" value={az.toFixed(1)+"°"} />
        <WChip icon="📐" value={zenith.toFixed(1)+"°"} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// PANEL STATUS WIDGET
// ──────────────────────────────────────────

function PanelStatusWidget({ efficiency, panelTilt, panelAzimuth }) {
  return (
    <div className="widget">
      <div className="w-icon">🔆</div>
      <div className="w-title">Panel Status</div>
      <div className="w-main">{efficiency}%</div>
      <div className="w-sub">Alignment Efficiency</div>
      <div className="w-row">
        <WChip icon="↕" value={panelTilt.toFixed(1)+"°"} />
        <WChip icon="↻" value={panelAzimuth.toFixed(1)+"°"} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// DAYLIGHT WIDGET
// ──────────────────────────────────────────

function DaylightWidget({ dayLen, sunrise, sunset, daypct }) {
  return (
    <div className="widget">
      <div className="w-icon">🌅</div>
      <div className="w-title">Daylight</div>
      <div className="w-main">{dayLen}</div>
      <div className="w-sub">Total day length</div>
      <div className="day-bar-wrap">
        <div className="day-bar">
          <div className="day-fill" style={{width: daypct + "%"}} />
          <div className="day-sun-icon" style={{left: daypct + "%"}}>☀️</div>
        </div>
      </div>
      <div className="w-row">
        <WChip icon="🌅" value={sunrise} />
        <WChip icon="🌇" value={sunset} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// POWER WIDGET
// ──────────────────────────────────────────

function PowerWidget({ power, cloud, dailyWh }) {
  return (
    <div className="widget">
      <div className="w-icon">⚡</div>
      <div className="w-title">Power Output</div>
      <div className="w-main">{power} W</div>
      <div className="w-sub">Estimated generation (max 400W)</div>
      <div className="pwr-gauge">
        <div className="pwr-fill" style={{width: (power/4) + "%"}} />
      </div>
      <div className="w-row">
        <WChip icon="☁️" value={cloud + "%"} />
        <WChip icon="📊" value={dailyWh.toFixed(0)+" Wh"} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// ENVIRONMENT WIDGET
// ──────────────────────────────────────────

function EnvironmentWidget({ uv, uvDescription, cloud, humid, pressure }) {
  const pressNorm = Math.min(100, Math.max(0, ((pressure||1013) - 980)/50*100));
  return (
    <div className="widget">
      <div className="w-icon">🌡</div>
      <div className="w-title">Environment</div>
      <div className="w-main">UV {uv}</div>
      <div className="w-sub">{uvDescription}</div>
      <div className="env-bar-row">
        <div className="ebr-item">
          <span className="ebr-lbl">Cloud</span>
          <div className="ebr-track"><div className="ebr-fill cloud" style={{width: Math.min(100,cloud)+"%"}}/></div>
          <span className="ebr-val">{cloud}%</span>
        </div>
        <div className="ebr-item">
          <span className="ebr-lbl">Humidity</span>
          <div className="ebr-track"><div className="ebr-fill humid" style={{width: humid+"%"}}/></div>
          <span className="ebr-val">{humid}%</span>
        </div>
        <div className="ebr-item">
          <span className="ebr-lbl">Pressure</span>
          <div className="ebr-track"><div className="ebr-fill" style={{width: pressNorm+"%"}}/></div>
          <span className="ebr-val">{pressure} hPa</span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// DAILY ENERGY WIDGET
// ──────────────────────────────────────────

function DailyEnergyWidget({ dailyWh }) {
  const goalPct = Math.min(100, (dailyWh/1000)*100);
  const dashLen = 226;
  const offset = dashLen - (goalPct/100)*dashLen;

  return (
    <div className="widget">
      <div className="w-icon">🔋</div>
      <div className="w-title">Daily Energy</div>
      <div className="w-main">{Math.round(dailyWh)} Wh</div>
      <div className="w-sub">Accumulated today (goal 1000 Wh)</div>
      <div className="energy-ring-wrap">
        <div className="energy-ring">
          <svg viewBox="0 0 90 90">
            <defs>
              <linearGradient id="eGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff9f0a"/>
                <stop offset="100%" stopColor="#34c759"/>
              </linearGradient>
            </defs>
            <circle cx="45" cy="45" r="36" className="er-bg"/>
            <circle cx="45" cy="45" r="36" className="er-fill"
              stroke="url(#eGrad)"
              strokeDasharray="226"
              strokeDashoffset={offset.toFixed(1)}
              transform="rotate(-90 45 45)"
            />
          </svg>
          <div className="er-center">
            <div className="er-pct">{Math.round(goalPct)}%</div>
            <div className="er-lbl">of goal</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// PANEL VOLTAGE WIDGET  (mirrors Arduino: voltage = sensor*(5/1023)*3)
// Simulates the analogRead value from power ratio, max sensor=1023 → 14.96 V
// ──────────────────────────────────────────

function PanelVoltageWidget({ voltage, power, efficiency }) {
  // Simulate the Arduino analog sensor value (0–1023)
  const simSensor = Math.round((voltage / (5.0 / 1023.0 * 3)));
  const maxV = 14.96;
  const fillPct = Math.min(100, (voltage / maxV) * 100);
  const status = voltage < 1 ? 'Off / Night' : voltage < 4 ? 'Low Output' : voltage < 9 ? 'Charging' : 'Optimal';
  const statusColor = voltage < 1 ? 'var(--t3)' : voltage < 4 ? 'var(--gold)' : voltage < 9 ? 'var(--accent)' : 'var(--green)';

  return (
    <div className="widget">
      <div className="w-icon">⚡</div>
      <div className="w-title">Panel Voltage</div>
      <div className="w-main">{voltage.toFixed(2)} V</div>
      <div className="w-sub" style={{color: statusColor, fontWeight: 600}}>{status}</div>
      <div className="pwr-gauge" style={{marginTop: 10}}>
        <div className="pwr-fill volt-fill" style={{width: fillPct + '%', background: `linear-gradient(90deg, #ff9f0a, #34c759)`}} />
      </div>
      <div className="w-row">
        <WChip icon="🔌" value={`${voltage.toFixed(1)} V`} />
        <WChip icon="📡" value={`A0: ${simSensor}`} />
        <WChip icon="💡" value={`${power} W`} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// TOAST SYSTEM
// ──────────────────────────────────────────

function ToastContainer({ toasts }) {
  return (
    <div id="toastContainer">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.out ? " out" : ""}`}>
          <span>{t.icon}</span><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────
// ALERT BAR
// ──────────────────────────────────────────

// AlertBar — collapsible sticky ribbon below navbar
function AlertBar({ alerts, open, onToggle, onDismiss }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className={`alert-bar${open ? '' : ' alert-bar--collapsed'}`}>
      {/* Pills — only visible when open */}
      {open && alerts.map((a, i) => (
        <div key={i} className={`alert-pill ${a.type}`}>
          <span>{a.icon}</span>
          <span>{a.msg}</span>
          {/* Close — removes this specific alert by index */}
          <button
            className="alert-dismiss"
            aria-label="Dismiss alert"
            onClick={() => onDismiss(i)}
          >✕</button>
        </div>
      ))}

      {/* Chevron toggle — always visible, bigger arrow */}
      <button
        className="alert-toggle"
        onClick={onToggle}
        title={open ? 'Hide alerts' : 'Show alerts'}
        aria-label={open ? 'Collapse alerts' : 'Expand alerts'}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {/* SVG chevron — 16px, clearly visible */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
             style={{ transition: 'transform .25s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {!open && <span style={{ fontSize: '.75rem', fontWeight: 700 }}>
          {alerts.length} alert{alerts.length > 1 ? 's' : ''}
        </span>}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// WEBSOCKET PANEL
// ──────────────────────────────────────────

function WSPanel({ ip, onIpChange, status, onConnect, onDisconnect, lastSeen }) {
  const isConn  = status === "connected";
  const isRecon = status === "reconnecting";
  return (
    <div className="ws-panel">
      <div className={`ws-status-dot ${status}`} />
      <div style={{flex:1}}>
        <div style={{fontWeight:700, fontSize:".88rem", color:"var(--t1)"}}>
          ESP32 WebSocket {isConn ? "— Connected" : isRecon ? "— Reconnecting…" : "— Disconnected"}
        </div>
        {lastSeen && <div className="ws-info-text">Last data: {lastSeen}</div>}
      </div>
      <input
        className="ws-ip-input"
        value={ip}
        onChange={e => onIpChange(e.target.value)}
        placeholder="192.168.1.100"
        disabled={isConn || isRecon}
        autoFocus={false}
      />
      <button
        className={`ws-connect-btn${isConn || isRecon ? " disconnected" : ""}`}
        onClick={isConn || isRecon ? onDisconnect : onConnect}
      >
        {isConn ? "🔌 Disconnect" : isRecon ? "⏳ Reconnecting…" : "🔗 Connect"}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// LDR WIDGET
// ──────────────────────────────────────────

function LDRWidget({ data }) {
  const vals = data || { ldr_top:0, ldr_bottom:0, ldr_left:0, ldr_right:0 };
  const items = [
    { label:"Top",    val: vals.ldr_top    },
    { label:"Bottom", val: vals.ldr_bottom },
    { label:"Left",   val: vals.ldr_left   },
    { label:"Right",  val: vals.ldr_right  },
  ];
  return (
    <div className="widget ldr-widget">
      <div className="w-icon">☀️</div>
      <div className="w-title">LDR Sensors</div>
      <div className="w-main" style={{fontSize:"1rem"}}>
        {data ? "Live from ESP32" : "No ESP32 data"}
      </div>
      <div className="ldr-grid">
        {items.map(it => (
          <div key={it.label} className="ldr-item">
            <div className="ldr-label">{it.label}</div>
            <div className="ldr-value">{it.val}</div>
            <div className="ldr-bar">
              <div className="ldr-bar-fill" style={{width: Math.min(100, it.val / 1023 * 100).toFixed(1) + "%"}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// SERIAL MONITOR
// ──────────────────────────────────────────

function SerialMonitor({ log, onClear }) {
  const endRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [log]);
  return (
    <div className="widget serial-widget">
      <div className="w-icon">📡</div>
      <div className="w-title">Serial Monitor — ESP32 Live Feed</div>
      <div className="serial-monitor">
        {log.length === 0
          ? <span className="serial-line" style={{opacity:.4}}>Waiting for ESP32 data…</span>
          : log.map((l, i) => (
            <span key={i} className="serial-line">
              <span className="serial-time">[{l.time}]</span>{l.text}
            </span>
          ))
        }
        <div ref={endRef} />
      </div>
      <button className="serial-clear-btn" onClick={onClear}>🗑 Clear Log</button>
    </div>
  );
}

// ──────────────────────────────────────────
// HISTORY CHARTS (Chart.js via CDN global)
// ──────────────────────────────────────────

function HistoryCharts({ tick, theme }) {
  const powerRef   = useRef(null);
  const voltRef    = useRef(null);
  const tempRef    = useRef(null);
  const charts     = useRef({});
  // Wrapper div refs — ResizeObserver attaches here
  const powerWrap  = useRef(null);
  const voltWrap   = useRef(null);
  const tempWrap   = useRef(null);

  // ── ResizeObserver: fires on ANY size change including browser zoom ──
  useEffect(() => {
    const observers = [];
    const pairs = [
      { wrap: powerWrap, key: "power" },
      { wrap: voltWrap,  key: "volt"  },
      { wrap: tempWrap,  key: "temp"  },
    ];
    pairs.forEach(({ wrap, key }) => {
      if (!wrap.current) return;
      const ro = new ResizeObserver(() => {
        const ch = charts.current[key];
        if (ch) ch.resize();
      });
      ro.observe(wrap.current);
      observers.push(ro);
    });
    return () => observers.forEach(ro => ro.disconnect());
  }, []);

  useEffect(() => {
    const history = HistoryBuffer.getAll();
    const labels  = history.map(h => h.time);
    const powers  = history.map(h => h.power);
    const volts   = history.map(h => h.voltage);
    const temps   = history.map(h => h.temperature);

    const isDark    = theme === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const textColor = isDark ? "rgba(255,255,255,0.7)"  : "#9097b8";

    const makeGradient = (ctx, color) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0,   color.replace("1)", "0.35)"));
      gradient.addColorStop(0.6, color.replace("1)", "0.08)"));
      gradient.addColorStop(1,   color.replace("1)", "0.00)"));
      return gradient;
    };

    const chartConf = (label, data, color, ref, key, yMin, yMax) => {
      if (charts.current[key]) {
        const ch = charts.current[key];
        ch.data.labels = labels;
        ch.data.datasets[0].data = data;
        ch.options.scales.x.ticks.color = textColor;
        ch.options.scales.y.ticks.color = textColor;
        ch.options.scales.x.grid.color  = gridColor;
        ch.options.scales.y.grid.color  = gridColor;
        ch.update("none");
        return;
      }
      const canvas = ref.current;
      const ctx    = canvas.getContext("2d");
      charts.current[key] = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label,
            data,
            borderColor: color,
            backgroundColor: makeGradient(ctx, color),
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: color,
            tension: 0.45,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "rgba(14,14,20,0.92)" : "rgba(255,255,255,0.95)",
              borderColor: color,
              borderWidth: 1,
              titleColor: textColor,
              bodyColor: isDark ? "#ffffff" : "#12131a",
              padding: 10,
              cornerRadius: 10
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { size: 10, family: "'Datatype', monospace" }, maxTicksLimit: 6 },
              grid:  { color: gridColor },
              border: { display: false }
            },
            y: {
              suggestedMin: yMin,
              suggestedMax: yMax,
              ticks: { color: textColor, font: { size: 10, family: "'Datatype', monospace" } },
              grid:  { color: gridColor },
              border: { display: false }
            }
          }
        }
      });
    };

    if (powerRef.current) chartConf("Power (W)",        powers, "rgba(255,159,10,1)", powerRef, "power", 0, 10);
    if (voltRef.current)  chartConf("Voltage (V)",      volts,  "rgba(0,122,255,1)",  voltRef,  "volt",  0, 6);
    if (tempRef.current)  chartConf("Temperature (°C)", temps,  "rgba(255,59,48,1)",  tempRef,  "temp",  20, 50);
  }, [tick, theme]);

  return (
    <div className="chart-section">
      <div className="chart-section-title">📈 Historical Data — Last 60 readings</div>
      <div className="charts-grid">
        {[
          { ref: powerRef, wrap: powerWrap, label: "⚡ Power Output (W)" },
          { ref: voltRef,  wrap: voltWrap,  label: "🔋 Voltage (V)"      },
          { ref: tempRef,  wrap: tempWrap,  label: "🌡 Temperature (°C)" },
        ].map((c, i) => (
          <div key={i} className="chart-card">
            <div className="chart-card-label">{c.label}</div>
            <div className="chart-canvas-wrap" ref={c.wrap}>
              <canvas ref={c.ref} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// PROFILE OVERLAY PORTAL
// ──────────────────────────────────────────
function ProfileModal({ isOpen, onClose, currentUser }) {
  const [linking, setLinking]         = useState(false);
  const [linkInput, setLinkInput]     = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [photoURL, setPhotoURL]       = useState(null);
  const [uploading, setUploading]     = useState(false);
  const fileInputRef                  = useRef(null);
  const [linkedAccounts, setLinkedAccounts] = useState({ email: null, phone: null });
  const [showLinkEmail, setShowLinkEmail]   = useState(false);
  const [showLinkPhone, setShowLinkPhone]   = useState(false);

  // Load photo URL + linked accounts — pre-fill primary immediately, then merge from Firestore
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // Pre-fill primary login method immediately (no Firestore wait)
    if (currentUser.loginMethod === 'email') {
      setLinkedAccounts(prev => ({ ...prev, email: currentUser.email }));
    } else if (currentUser.loginMethod === 'mobile') {
      setLinkedAccounts(prev => ({ ...prev, phone: currentUser.mobile }));
    }

    // Then load photo + secondary linked account from Firestore
    const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
    window.db.collection(col).doc(currentUser.uid).get().then(doc => {
      if (doc.exists) {
        const d = doc.data();
        if (d.photoURL) setPhotoURL(d.photoURL);
        setLinkedAccounts({
          email: currentUser.loginMethod === 'email'
            ? currentUser.email              // keep primary — never overwrite
            : (d.email || null),             // secondary linked email
          phone: currentUser.loginMethod === 'mobile'
            ? currentUser.mobile             // keep primary — never overwrite
            : (d.mobile || d.phone || null)  // secondary linked phone
        });
      }
    });
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // ── Photo upload — Cloudinary unsigned upload (no SDK, native fetch)
  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size
    if (file.size > 2 * 1024 * 1024) {
      setError('Image too large. Max 2MB.'); return;
    }
    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed.'); return;
    }

    setUploading(true); setError(''); setSuccess('');

    try {
      // Build FormData for Cloudinary unsigned upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'raymax_profiles');

      // Upload to Cloudinary REST API — no SDK needed
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dnh5ohncw/image/upload',
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed: ' + res.status);
      const data = await res.json();
      if (!data.secure_url) throw new Error('No URL returned from Cloudinary');

      // Add cache-bust so browser shows new photo immediately
      const freshURL = data.secure_url + '?v=' + Date.now();

      // Save canonical URL (without cache-bust) to Firestore
      const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      await window.db.collection(col).doc(currentUser.uid).update({ photoURL: data.secure_url });

      // Update Firebase Auth profile if email user
      if (window.auth.currentUser) {
        await window.auth.currentUser.updateProfile({ photoURL: data.secure_url });
      }

      // Update modal avatar immediately (cache-busted)
      setPhotoURL(freshURL);

      // Notify Navbar to update avatar
      window.dispatchEvent(new CustomEvent('raymax-photo-updated', {
        detail: { photoURL: freshURL }
      }));

      setSuccess('Profile photo updated! ✅');

    } catch(err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // ── Password update
  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const { current, newPass, confirm } = passwordForm;
    if (!current || !newPass || !confirm) return;
    if (newPass !== confirm) return setError('Passwords do not match');
    setLinking(true);
    try {
      if (currentUser.loginMethod === 'mobile') {
        const docRef = window.db.collection('users_mobile').doc(currentUser.uid);
        const sn = await docRef.get();
        if (sn.data().password !== current) throw new Error('Incorrect current password');
        await docRef.update({ password: newPass });
      } else {
        const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, current);
        await window.auth.currentUser.reauthenticateWithCredential(cred);
        await window.auth.currentUser.updatePassword(newPass);
      }
      setSuccess('Password updated successfully. ✅');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch(err) {
      setError(err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Link account
  async function handleLink(type) {
    if (!linkInput) return;
    setLinking(true); setError(''); setSuccess('');
    try {
      const col   = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      const field = type === 'email' ? 'email' : 'mobile';
      await window.db.collection(col).doc(currentUser.uid).update({ [field]: linkInput });
      setLinkedAccounts(prev => ({ ...prev, [type === 'email' ? 'email' : 'phone']: linkInput }));
      setSuccess(`${type === 'email' ? 'Email' : 'Phone'} linked successfully! ✅`);
      setLinkInput('');
      setShowLinkEmail(false);
      setShowLinkPhone(false);
    } catch(err) {
      setError('Failed: ' + err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Unlink account
  async function handleUnlink(type) {
    setLinking(true); setError(''); setSuccess('');
    try {
      const col   = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      const field = type === 'email' ? 'email' : 'mobile';
      await window.db.collection(col).doc(currentUser.uid)
        .update({ [field]: firebase.firestore.FieldValue.delete() });
      setLinkedAccounts(prev => ({ ...prev, [type === 'email' ? 'email' : 'phone']: null }));
      setSuccess(`${type === 'email' ? 'Email' : 'Phone'} unlinked. ✅`);
    } catch(err) {
      setError('Failed: ' + err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Helper: linked account row
  // isPrimary = true  → show "Primary" badge, no unlink allowed
  // isPrimary = false → show Unlink or +Link depending on value
  function LinkedRow({ icon, label, value, isPrimary, onLink, onUnlink, primaryColor }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 14, marginBottom: 10,
        background: value ? 'rgba(52,199,89,.08)' : 'rgba(0,0,0,.04)',
        border: `1px solid ${value ? 'rgba(52,199,89,.25)' : 'var(--border-m)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          <div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--t2)' }}>{label}</div>
            <div style={{ fontSize: '.72rem', color: value ? 'var(--green)' : 'var(--t3)' }}>
              {value || 'Not linked'}
            </div>
          </div>
        </div>
        {isPrimary
          ? (
            // Primary account — cannot unlink
            <span style={{
              padding: '4px 10px', borderRadius: 100,
              background: primaryColor === 'green'
                ? 'rgba(52,199,89,.1)' : 'rgba(0,122,255,.1)',
              border: primaryColor === 'green'
                ? '1px solid rgba(52,199,89,.2)' : '1px solid rgba(0,122,255,.2)',
              color: primaryColor === 'green' ? 'var(--green)' : 'var(--accent)',
              fontSize: '.68rem', fontWeight: 700
            }}>Primary</span>
          )
          : value
            ? (
              <button onClick={onUnlink} style={{
                padding: '4px 12px', borderRadius: 100,
                background: 'rgba(255,59,48,.1)', border: '1px solid rgba(255,59,48,.25)',
                color: 'var(--red)', fontSize: '.72rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Unlink</button>
            )
            : (
              <button onClick={onLink} style={{
                padding: '4px 12px', borderRadius: 100,
                background: 'rgba(0,122,255,.1)', border: '1px solid rgba(0,122,255,.25)',
                color: 'var(--accent)', fontSize: '.72rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>+ Link</button>
            )
        }
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        padding: 20, overflowY: 'auto'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 460,
          maxHeight: '90vh', overflowY: 'auto', margin: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 28, padding: 32,
          boxShadow: 'var(--sh-l)'
        }}
      >
        <button className="pm-close" onClick={onClose}>✕</button>

        {/* ── Header — Avatar + Name ── */}
        <div className="pm-header">
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: photoURL ? 'transparent'
                : currentUser.loginMethod === 'mobile'
                  ? 'linear-gradient(135deg,#34c759,#30d158)'
                  : 'linear-gradient(135deg,#ff9f0a,#ff6b00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff',
              cursor: 'pointer', overflow: 'hidden', position: 'relative',
              margin: '0 auto 12px', flexShrink: 0,
              boxShadow: '0 4px 20px rgba(0,0,0,.15)'
            }}
          >
            {photoURL
              ? <img src={photoURL} alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</span>
            }
            {/* Camera overlay on hover */}
            <div
              className="pm-avatar-cam-overlay"
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity .2s', fontSize: '1.3rem'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >📷</div>
            {/* Uploading spinner */}
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.65rem', color: '#fff', fontWeight: 700
              }}>Uploading…</div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          <h2>{currentUser.displayName}</h2>
          <p>{currentUser.loginMethod === 'mobile' ? currentUser.mobile : currentUser.email}</p>
        </div>

        {error   && <div className="pm-msg-error">{error}</div>}
        {success && <div className="pm-msg-success">{success}</div>}

        {/* ── Linked Accounts ── */}
        <div className="pm-section">
          <h3>🔗 Linked Accounts</h3>
          <LinkedRow
            icon="📧" label="Email" value={linkedAccounts.email}
            isPrimary={currentUser.loginMethod === 'email'}
            primaryColor="blue"
            onLink={() => { setShowLinkPhone(false); setShowLinkEmail(true); setLinkInput(''); }}
            onUnlink={() => handleUnlink('email')}
          />
          <LinkedRow
            icon="📱" label="Phone" value={linkedAccounts.phone}
            isPrimary={currentUser.loginMethod === 'mobile'}
            primaryColor="green"
            onLink={() => { setShowLinkEmail(false); setShowLinkPhone(true); setLinkInput(''); }}
            onUnlink={() => handleUnlink('phone')}
          />
          {showLinkEmail && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="pm-input"
                placeholder="Enter email address"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLink('email')}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button
                onClick={() => handleLink('email')}
                disabled={linking || !linkInput}
                style={{
                  height: 44, padding: '0 18px', borderRadius: 100, border: 'none',
                  background: 'linear-gradient(135deg,#ff9f0a,#007aff)',
                  color: '#fff', fontWeight: 700, fontSize: '.82rem',
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  opacity: linking || !linkInput ? .6 : 1
                }}
              >{linking ? '…' : 'Save'}</button>
              <button
                onClick={() => { setShowLinkEmail(false); setLinkInput(''); }}
                style={{
                  height: 44, width: 44, borderRadius: 100,
                  border: '1px solid var(--border-m)',
                  background: 'transparent', cursor: 'pointer', fontSize: '1rem', flexShrink: 0
                }}
              >✕</button>
            </div>
          )}
          {showLinkPhone && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="pm-input"
                placeholder="+91 9876543210"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLink('phone')}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button
                onClick={() => handleLink('phone')}
                disabled={linking || !linkInput}
                style={{
                  height: 44, padding: '0 18px', borderRadius: 100, border: 'none',
                  background: 'linear-gradient(135deg,#ff9f0a,#007aff)',
                  color: '#fff', fontWeight: 700, fontSize: '.82rem',
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  opacity: linking || !linkInput ? .6 : 1
                }}
              >{linking ? '…' : 'Save'}</button>
              <button
                onClick={() => { setShowLinkPhone(false); setLinkInput(''); }}
                style={{
                  height: 44, width: 44, borderRadius: 100,
                  border: '1px solid var(--border-m)',
                  background: 'transparent', cursor: 'pointer', fontSize: '1rem', flexShrink: 0
                }}
              >✕</button>
            </div>
          )}
        </div>

        {/* ── Change Password ── */}
        <div className="pm-section">
          <h3>🔒 Change Password</h3>
          <div className="pm-input-wrap">
            <input className="pm-input" type="password" placeholder="Current Password"
              value={passwordForm.current}
              onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          </div>
          <div className="pm-input-wrap">
            <input className="pm-input" type="password" placeholder="New Password"
              value={passwordForm.newPass}
              onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
          </div>
          <div className="pm-input-wrap">
            <input className="pm-input" type="password" placeholder="Confirm Password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          </div>
          <button className="pm-btn" style={{ marginTop: 8 }}
            disabled={linking} onClick={handleUpdatePassword}>
            {linking ? 'Updating…' : 'Update Password'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────

function App() {
  // ── FIX: Force scroll to top on mount — prevents auto-scroll to Control Panel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  // ── FIX: Re-enable smooth scroll after initial load
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ── Photo URL for Navbar avatar (loaded from Firestore + updated via CustomEvent)
  const [userPhotoURL, setUserPhotoURL] = useState(null);

  // ── Consolidated Auth Guard ──
  // Accepts EITHER a Firebase Auth session (email login)
  // OR a localStorage mobile session (custom Firestore login).
  // currentUser shape is normalised to: { uid, displayName, email, loginMethod }
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // ── Reusable redirect helper
    function deny() {
      localStorage.removeItem('raymax-mobile-user');
      window.location.href = './auth/index.html';
    }

    // ── Step 1: Subscribe to Firebase Auth (handles Email users)
    const unsub = window.auth.onAuthStateChanged(async firebaseUser => {

      if (firebaseUser && firebaseUser.emailVerified) {
        // ✅ EMAIL USER — verified by Firebase Auth
        setCurrentUser({
          uid:         firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email || 'User',
          email:       firebaseUser.email       || '',
          mobile:      null,
          loginMethod: 'email',
        });
        setAuthLoading(false);
        return;
      }

      // ── Step 2: No Firebase Auth session — check for mobile session token
      const mobileRaw = localStorage.getItem('raymax-mobile-user');
      if (!mobileRaw) {
        // Neither session found → deny access
        deny();
        return;
      }

      // Parse the token
      let token;
      try {
        token = JSON.parse(mobileRaw);
      } catch (_) {
        deny();
        return;
      }

      if (!token.uid || !token.mobile) {
        // Malformed token → deny
        deny();
        return;
      }

      // ── Step 3: VERIFY the mobile session against Firestore (single doc fetch)
      // This makes the session Firestore-dependent — a forged localStorage token
      // will fail here because the doc won't exist in users_mobile.
      try {
        const doc = await window.db
          .collection('users_mobile')
          .doc(token.uid)
          .get();

        if (!doc.exists) {
          // Doc was deleted or uid was forged → deny
          deny();
          return;
        }

        const data = doc.data();

        // ✅ MOBILE USER — verified via Firestore
        setCurrentUser({
          uid:         doc.id,
          displayName: data.fullName || token.mobile || 'User',
          email:       data.mobile   || '',     // mobile fills the email slot in UI
          mobile:      data.mobile   || '',
          loginMethod: 'mobile',
        });
        setAuthLoading(false);

      } catch (err) {
        // Firestore read failed (offline / permission denied) → conservative deny
        console.error('[AUTH] Firestore verification failed:', err.message);
        deny();
      }
    });

    return () => unsub();
  }, []);

  // ── Theme
  const [theme, setTheme] = useState("light");

  // ── Clock
  const [clock, setClock] = useState("--:--:--");
  const [dateStr, setDateStr] = useState("--");

  // ── Location
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [locPill, setLocPill] = useState("Locating…");
  const [geoData, setGeoData] = useState({city:"Locating…", state:"--", place:"--", country:"--", pincode:"--", address:"Acquiring full address…"});

  // ── Weather
  const [weatherData, setWeatherData] = useState({icon:"🌤", temp:"--°C", desc:"Loading…", humid:"--%", wind:"-- km/h", feels:"--°C"});
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ── Sun
  const [sunEl, setSunEl] = useState(0);
  const [sunAz, setSunAz] = useState(180);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [sunPathD, setSunPathD] = useState("");

  // ── Panel
  const [mode, setMode] = useState("auto");
  const [panelTilt, setPanelTilt] = useState(0);
  const [panelAzimuth, setPanelAzimuth] = useState(180);

  // ── Energy (persisted in Firestore solar_sessions collection)
  const [dailyWh, setDailyWh] = useState(0);
  const lastPwrRef = useRef(Date.now());
  const [cloudCover, setCloudCover] = useState(0);
  const [humid, setHumid] = useState(50);
  const [pressure, setPressure] = useState(1013);

  // ── WebSocket
  const [wsIP, setWsIP]         = useState("192.168.1.100");
  const [wsStatus, setWsStatus] = useState("disconnected"); // "connected"|"disconnected"|"reconnecting"
  const [wsLastSeen, setWsLastSeen] = useState(null);
  const wsRef = useRef(null);

  // ── ESP32 live sensor data (overrides simulated values when connected)
  // shape: { ldr_top, ldr_bottom, ldr_left, ldr_right, voltage, temperature, servo_tilt, servo_azimuth }
  const [esp32Data, setEsp32Data] = useState(null);

  // ── Alerts + bar visibility toggle
  const [alerts, setAlerts]                   = useState([{ type:"ok", icon:"✅", msg:"All systems nominal" }]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [alertBarOpen,    setAlertBarOpen]    = useState(true);   // collapse/expand the alert ribbon

  // ── Serial monitor (last 20 lines)
  const [serialLog, setSerialLog] = useState([]);
  const serialLogRef = useRef([]);

  // ── History tick — increments every time HistoryBuffer gets a new entry
  const [historyTick, setHistoryTick] = useState(0);

  // ── Toasts
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // ── State refs for intervals
  const latRef = useRef(null);
  const lonRef = useRef(null);
  const modeRef = useRef("auto");
  const sunriseRef = useRef(null);
  const sunsetRef = useRef(null);
  const cloudRef = useRef(0);

  useEffect(() => { latRef.current = lat; }, [lat]);
  useEffect(() => { lonRef.current = lon; }, [lon]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { sunriseRef.current = sunrise; }, [sunrise]);
  useEffect(() => { sunsetRef.current = sunset; }, [sunset]);
  useEffect(() => { cloudRef.current = cloudCover; }, [cloudCover]);

  // ── Load photo URL for navbar avatar + listen for live updates from ProfileModal
  useEffect(() => {
    if (!currentUser) return;
    const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
    window.db.collection(col).doc(currentUser.uid).get().then(doc => {
      if (doc.exists && doc.data().photoURL) setUserPhotoURL(doc.data().photoURL);
    });
    const handler = (e) => setUserPhotoURL(e.detail.photoURL);
    window.addEventListener('raymax-photo-updated', handler);
    return () => window.removeEventListener('raymax-photo-updated', handler);
  }, [currentUser]);

  // ── Load today's dailyWh from Firestore once currentUser is known
  // Uses currentUser.uid for email users, or mobile number for mobile users.
  useEffect(() => {
    if (!currentUser) return;
    const today  = new Date().toDateString();
    const sessId = currentUser.loginMethod === 'mobile'
      ? (currentUser.mobile + '_' + today)    // mobile sessions keyed by number
      : (currentUser.uid   + '_' + today);    // email sessions keyed by Firebase uid
    window.db
      .collection('solar_sessions')
      .doc(sessId)
      .get()
      .then(doc => {
        if (doc.exists) setDailyWh(doc.data().daily_wh || 0);
      });
  }, [currentUser]);

  // ── Save / merge today's session doc to Firestore
  const saveTodaySession = async (wh, pwr) => {
    if (!currentUser) return;
    const today  = new Date().toDateString();
    const sessId = currentUser.loginMethod === 'mobile'
      ? (currentUser.mobile + '_' + today)
      : (currentUser.uid   + '_' + today);
    await window.db.collection('solar_sessions').doc(sessId).set({
      user_id:       currentUser.loginMethod === 'mobile' ? currentUser.mobile : currentUser.uid,
      login_method:  currentUser.loginMethod || 'email',
      date:          today,
      daily_wh:      wh,
      peak_power:    pwr,
      location_lat:  latRef.current,
      location_lon:  lonRef.current,
      location_name: geoData.city || '',
      updated_at:    firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  };

  // ── Show toast
  const showToast = useCallback((icon, msg) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, {id, icon, msg, out: false}]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? {...t, out: true} : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 3000);
  }, []);

  // ── Toggle theme
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    showToast(next === "dark" ? "🌙" : "☀️", next === "dark" ? "Dark mode" : "Light mode");
  };

  // ── Clock tick
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-IN", {hour12:false}));
      setDateStr(now.toLocaleDateString("en-IN", {weekday:"long",day:"numeric",month:"long",year:"numeric"}));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Main update (sun position, panel auto, power)
  const doUpdate = useCallback(() => {
    const now = new Date();
    const la = latRef.current;
    const lo = lonRef.current;
    if (la === null) return;

    const sp = calcSunPos(now, la, lo);
    setSunEl(sp.el);
    setSunAz(sp.az);

    let tilt = panelTilt, az = panelAzimuth;
    if (modeRef.current === "auto") {
      tilt = sp.el > 0 ? Math.max(0, 90 - sp.el) : 0;
      az = sp.az;
      setPanelTilt(tilt);
      setPanelAzimuth(az);
    }

    const pwr = calcPower(sp.el, sp.az, tilt, az, cloudRef.current);
    const now2 = Date.now();
    const dt = (now2 - lastPwrRef.current) / 3600000;
    lastPwrRef.current = now2;
    setDailyWh(prev => {
      const next = prev + pwr * dt;
      saveTodaySession(next, pwr);
      return next;
    });

    // Sun path
    const pathD = buildSunPathD(sunriseRef.current, sunsetRef.current, la, lo);
    setSunPathD(pathD);
  }, []);

  useEffect(() => {
    const id = setInterval(doUpdate, 10000);
    return () => clearInterval(id);
  }, [doUpdate]);

  // ── ESP32 data side-effects: alerts + history + serial log
  useEffect(() => {
    if (!esp32Data) return;

    // Run alert checks against live sensor data
    const pwr = calcPower(sunEl, sunAz, panelTilt, panelAzimuth, cloudCover);
    const newAlerts = checkAlerts({ ...esp32Data, power: pwr });
    setAlerts(newAlerts.filter(a => !dismissedAlerts.includes(a.msg)));

    // Push to circular history buffer and nudge chart re-render
    HistoryBuffer.add({
      time:        new Date().toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit", hour12:false}),
      power:       pwr,
      voltage:     esp32Data.voltage,
      temperature: esp32Data.temperature
    });
    setHistoryTick(t => t + 1);

    // Append to serial log (keep last 20)
    const line = {
      time: new Date().toLocaleTimeString("en-IN", { hour12:false }),
      text: JSON.stringify(esp32Data)
    };
    const next = [...serialLogRef.current, line].slice(-20);
    serialLogRef.current = next;
    setSerialLog([...next]);
  }, [esp32Data]);

  // ── Geolocation (gated on currentUser — only runs after auth guard confirms session)
  useEffect(() => {
    if (!currentUser) return;
    if (!navigator.geolocation) { showToast("⚠️","Geolocation not supported"); return; }

    const onSuccess = async (pos) => {
      const {latitude: la, longitude: lo} = pos.coords;
      const isFirst = latRef.current === null;
      setLat(la); setLon(lo);
      latRef.current = la; lonRef.current = lo;

      setLocPill(la.toFixed(3)+"°N, "+lo.toFixed(3)+"°E");

      // sunrise/sunset
      const ss = calcSunriseSunset(new Date(), la, lo);
      let sr = ss?.sunrise || null, se = ss?.sunset || null;
      if (sr && se && sr.getTime() > se.getTime()) { const t=sr; sr=se; se=t; }
      setSunrise(sr); setSunset(se);
      sunriseRef.current = sr; sunsetRef.current = se;

      if (isFirst) {
        showToast("📍","Location acquired!");
        doUpdate();

        // fetch geocode
        try {
          const addr = await fetchGeocode(la, lo);
          const place = addr.amenity||addr.university||addr.school||addr.college||addr.building||addr.hotel||"";
          const city = addr.city||addr.town||addr.village||addr.municipality||addr.county||"Unknown";
          const suburb = addr.suburb||addr.neighbourhood||addr.quarter||"";
          const district = addr.state_district||addr.district||"";
          const state = addr.state||"";
          const country = addr.country||"";
          const pin = addr.postcode||"";
          // Prefer specific named place (university, school, amenity)
          const specificPlace = addr.amenity||addr.university||addr.school||addr.college||addr.building||addr.hotel||addr.office||"";
          const areaLabel = suburb||district||city;
          const parts = [specificPlace, suburb, district, city, state, country].filter(Boolean);
          const fullAddr = parts.join(" · ");
          setGeoData({
            city: specificPlace || city,
            state: areaLabel ? areaLabel+", "+state : state,
            place: specificPlace || district || "—",
            country, pincode: pin||"—", address: fullAddr
          });
          setLocPill((specificPlace||city)+", "+state);
        } catch(e) {}

        // fetch weather
        window._raymaxLoadWeather(la, lo);
      }
    };

    const onError = () => {
      const la=28.6139, lo=77.2090;
      setLat(la); setLon(lo);
      latRef.current=la; lonRef.current=lo;
      setLocPill("28.61°N, 77.21°E (default)");
      setGeoData(prev => ({...prev, city:"New Delhi (fallback)", country:"India"}));
      const ss=calcSunriseSunset(new Date(),la,lo);
      let sr=ss?.sunrise||null, se=ss?.sunset||null;
      if(sr&&se&&sr.getTime()>se.getTime()){const t=sr;sr=se;se=t;}
      setSunrise(sr); setSunset(se);
      sunriseRef.current=sr; sunsetRef.current=se;
      showToast("📍","Using default location — enable GPS for accuracy");
      window._raymaxLoadWeather(la, lo);
      doUpdate();
    };

    // ── Shared weather loader — renamed to avoid Supabase namespace collision
    window._raymaxLoadWeather = async (la, lo) => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const wc = await fetchWeather(la, lo);
        const wEntry = WC[wc.weather_code] || {l:"Unknown",i:"❓"};
        setCloudCover(wc.cloud_cover || 0);
        cloudRef.current = wc.cloud_cover || 0;
        setHumid(wc.relative_humidity_2m || 50);
        setPressure(wc.surface_pressure || 1013);
        setWeatherData({
          icon:  wEntry.i,
          temp:  Math.round(wc.temperature_2m) + "°C",
          desc:  wEntry.l,
          humid: wc.relative_humidity_2m + "%",
          wind:  Math.round(wc.wind_speed_10m) + " km/h",
          feels: Math.round(wc.apparent_temperature) + "°C"
        });
        setWeatherError(null);
        showToast("🌤", "Weather updated!");
      } catch (err) {
        setWeatherError(err.message || "Network error — check your connection");
        showToast("⚠️", "Weather unavailable: " + (err.message || "check connection"));
      } finally {
        setWeatherLoading(false);
      }
    };

    navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy:true, maximumAge:30000});
    showToast("☀️","RAYMAX initialized!");

    // Weather refresh every 10 min
    const weatherId = setInterval(() => {
      if (latRef.current) window._raymaxLoadWeather(latRef.current, lonRef.current);
    }, 600000);

    return () => clearInterval(weatherId);
  }, [currentUser]);  // ← gate on currentUser so GPS/weather only start after auth confirms

  // ── Mode change
  // ── WebSocket connect / disconnect
  const handleWsConnect = () => {
    if (wsRef.current) wsRef.current.disconnect();
    const ws = new RaymaxWS(wsIP, 81);
    ws.onStatusChange(status => {
      setWsStatus(status);
      showToast(
        status === "connected" ? "🔌" : status === "reconnecting" ? "🔄" : "❌",
        status === "connected" ? "ESP32 Connected!"
          : status === "reconnecting" ? "Reconnecting to ESP32…"
          : "ESP32 Disconnected"
      );
    });
    ws.onData(data => {
      setEsp32Data(data);
      setWsLastSeen(new Date().toLocaleTimeString("en-IN", { hour12:false }));
    });
    ws.connect();
    wsRef.current = ws;
  };

  const handleWsDisconnect = () => {
    if (wsRef.current) wsRef.current.disconnect();
    setWsStatus("disconnected");
    setEsp32Data(null);
  };

  const handleModeChange = (m) => {
    setMode(m);
    modeRef.current = m;
    showToast(m==="auto"?"🤖":"🎛", m==="auto"?"Auto tracking enabled":"Manual control active");
  };

  // ── Derived values
  const power = calcPower(sunEl, sunAz, panelTilt, panelAzimuth, cloudCover);
  const efficiency = calcEfficiency(power);
  const uv = calcUV(sunEl, cloudCover);

  // Voltage: use real ESP32 reading when connected, else simulate Arduino ADC formula
  // Arduino formula: voltage = analogRead(A0) * (5.0/1023.0) * 3
  const simSensor   = Math.round((power / 400) * 1023);
  const panelVoltage = (esp32Data && wsStatus === "connected")
    ? esp32Data.voltage
    : simSensor * (5.0 / 1023.0) * 3;

  // Real panel temperature from ESP32 (null when not connected)
  const realTemp = (esp32Data && wsStatus === "connected") ? esp32Data.temperature : null;

  // Daylight
  let dayLen="--h --m", sunriseStr="--:--", sunsetStr="--:--", daypct=0;
  if (sunrise && sunset) {
    const total = sunset.getTime()-sunrise.getTime();
    const h=Math.floor(total/3600000), m=Math.round((total%3600000)/60000);
    dayLen=`${h}h ${m}m`;
    sunriseStr=fmtTime(sunrise);
    sunsetStr=fmtTime(sunset);
    daypct=Math.min(100,Math.max(0,(Date.now()-sunrise.getTime())/total*100));
  }

  // ── Loading splash — shown while Firebase auth resolves
  if (authLoading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{fontSize: '2rem'}}>☀️</div>
      <div style={{fontSize: '1rem', color: 'var(--t3)', fontWeight: 600}}>Loading RAYMAX...</div>
    </div>
  );

  return (
    <>
      {/* Background blobs */}
      <div className="liquid-bg">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      </div>

      <div className="app">
        {/* Navbar */}
        <Navbar
          clock={clock}
          date={dateStr}
          locPill={locPill}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onProfileClick={() => setIsProfileOpen(true)}
          userPhotoURL={userPhotoURL}
        />

        {/* Alert Bar — dismiss removes by index so the pill actually disappears */}
        <AlertBar
          alerts={alerts}
          open={alertBarOpen}
          onToggle={() => setAlertBarOpen(v => !v)}
          onDismiss={idx => setAlerts(prev => prev.filter((_, i) => i !== idx))}
        />

        <main>
          {/* Viz Section */}
          <div className="viz-section">
            <SolarPanel3D
              panelTilt={panelTilt}
              panelAzimuth={panelAzimuth}
              panelVoltage={panelVoltage}
              efficiency={efficiency}
            />
            <SunCompass
              sunEl={sunEl}
              sunAz={sunAz}
              panelTilt={panelTilt}
              panelAzimuth={panelAzimuth}
              pathD={sunPathD}
            />
          </div>

          {/* WebSocket Connection Panel */}
          <WSPanel
            ip={wsIP}
            onIpChange={setWsIP}
            status={wsStatus}
            onConnect={handleWsConnect}
            onDisconnect={handleWsDisconnect}
            lastSeen={wsLastSeen}
          />

          {/* Control Panel */}
          <ControlPanel
            mode={mode}
            panelTilt={panelTilt}
            panelAzimuth={panelAzimuth}
            onModeChange={handleModeChange}
            onSliderX={v => {
              setPanelTilt(v);
              if (wsRef.current && wsRef.current.isConnected()) {
                wsRef.current.sendCommand(v, panelAzimuth);
              }
            }}
            onSliderY={v => {
              setPanelAzimuth(v);
              if (wsRef.current && wsRef.current.isConnected()) {
                wsRef.current.sendCommand(panelTilt, v);
              }
            }}
          />

          {/* Widgets */}
          <div className="widgets-section">
            <div className="section-title">Live Dashboard</div>

            {/* Welcome greeting — OUTSIDE the grid so it doesn't occupy a cell */}
            {currentUser && (
              <div style={{
                fontSize: ".82rem", color: "var(--t3)", fontWeight: 500,
                padding: "0 4px 10px 4px"
              }}>
                👋 Welcome back, {currentUser.displayName || currentUser.email}
              </div>
            )}

            <div className="widgets-grid">
              <LocationWidget {...geoData} lat={lat} lon={lon} />
              <WeatherWidget
                {...weatherData}
                error={weatherError}
                loading={weatherLoading}
                onRetry={() => window._raymaxLoadWeather(latRef.current, lonRef.current)}
              />
              <SunPositionWidget el={sunEl} az={sunAz} zenith={90-sunEl} />
              <PanelStatusWidget efficiency={efficiency} panelTilt={panelTilt} panelAzimuth={panelAzimuth} />
              <DaylightWidget dayLen={dayLen} sunrise={sunriseStr} sunset={sunsetStr} daypct={daypct} />
              <PanelVoltageWidget voltage={panelVoltage} power={power} efficiency={efficiency} />
              <EnvironmentWidget uv={uv} uvDescription={uvDesc(uv)+" — "+(uv>=6?"Use protection!":"Safe levels")} cloud={cloudCover} humid={humid} pressure={pressure} />
              <DailyEnergyWidget dailyWh={dailyWh} />
              {/* LDR quad-grid (live from ESP32) */}
              <LDRWidget data={esp32Data} />
              {/* Serial monitor — last 20 ESP32 JSON frames */}
              <SerialMonitor
                log={serialLog}
                onClear={() => { serialLogRef.current = []; setSerialLog([]); }}
              />
            </div>
          </div>

          {/* Historical charts — last 60 readings via HistoryBuffer */}
          <HistoryCharts tick={historyTick} theme={theme} />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />

      {/* Profile Portal Overlay */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        currentUser={currentUser} 
      />
    </>
  );
}

// ── Mount
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
