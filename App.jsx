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

function Navbar({ clock, date, locPill, theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="logo-icon">☀️</div>
        <div className="logo-text">
          <div className="lt">RAYMAX</div>
          <div className="ls">Solar Tracking System</div>
        </div>
      </div>
      <div className="nav-center">
        <div className="live-clock">{clock}</div>
        <div className="live-date">{date}</div>
      </div>
      <div className="nav-right">
        <div className="loc-pill">📍 <span>{locPill}</span></div>
        <div className="live-badge"><LiveDot />LIVE</div>
        <button className="icon-btn" id="themeBtn" onClick={onToggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

// ──────────────────────────────────────────
// 3D SOLAR PANEL
// ──────────────────────────────────────────

function SolarPanel3D({ panelTilt, panelAzimuth, panelVoltage, efficiency }) {
  const azOffset = panelAzimuth - 180;
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
  const sunPos = sunToXY(sunAz, sunEl);
  const panelPos = sunToXY(panelAzimuth, panelTilt);
  const isDay = sunEl > 0;

  return (
    <div className="glass-card">
      <div className="card-label">🧭 Sky Map — Sun Path</div>
      <div className="compass-svg-wrap">
        <svg id="sunPathSVG" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="energyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff9f0a"/>
              <stop offset="100%" stopColor="#ff6b00"/>
            </radialGradient>
            <filter id="sunGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="130" cy="130" r="118" className="c-ring"/>
          <circle cx="130" cy="130" r="78" className="c-ring-mid"/>
          <circle cx="130" cy="130" r="39" className="c-ring-mid"/>
          <line x1="130" y1="6" x2="130" y2="254" className="c-cross"/>
          <line x1="6" y1="130" x2="254" y2="130" className="c-cross"/>
          <text x="130" y="20" className="c-lbl" textAnchor="middle">N</text>
          <text x="130" y="252" className="c-lbl" textAnchor="middle">S</text>
          <text x="250" y="134" className="c-lbl" textAnchor="middle">E</text>
          <text x="10" y="134" className="c-lbl" textAnchor="middle">W</text>
          <text x="130" y="104" className="c-lbl" textAnchor="middle" opacity=".6">60°</text>
          <text x="130" y="65" className="c-lbl" textAnchor="middle" opacity=".6">30°</text>
          {pathD && <path d={pathD} className="sun-path-line" fill="none"/>}
          <line x1="130" y1="130" x2={panelPos.x} y2={panelPos.y} className="panel-dir-line"/>
          <circle cx={sunPos.x} cy={sunPos.y} r="14" className="sun-dot-glow" filter="url(#sunGlow)"/>
          <circle cx={sunPos.x} cy={sunPos.y} r="9" className="sun-dot-inner" filter="url(#sunGlow)"/>
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
  const status = voltage < 3 ? 'Off / Night' : voltage < 8 ? 'Low Output' : voltage < 12 ? 'Charging' : 'Optimal';
  const statusColor = voltage < 3 ? 'var(--t3)' : voltage < 8 ? 'var(--gold)' : voltage < 12 ? 'var(--accent)' : 'var(--green)';

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
// MAIN APP
// ──────────────────────────────────────────

function App() {
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

  // ── Energy (persisted in localStorage)
  const [dailyWh, setDailyWh] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('raymax_dailyWh') || 'null');
      if (saved && saved.date === new Date().toDateString()) {
        return saved.wh;
      }
    } catch(e) {}
    return 0;
  });
  const lastPwrRef = useRef(Date.now());
  const [cloudCover, setCloudCover] = useState(0);
  const [humid, setHumid] = useState(50);
  const [pressure, setPressure] = useState(1013);

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
      tilt = Math.max(0, sp.el);
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
      try {
        localStorage.setItem('raymax_dailyWh', JSON.stringify({ wh: next, date: new Date().toDateString() }));
      } catch(e) {}
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

  // ── Geolocation
  useEffect(() => {
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
        window._loadWeather(la, lo);
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
      window._loadWeather(la, lo);
      doUpdate();
    };

    // ── Shared weather loader — defined before watchPosition so callbacks can call it
    window._loadWeather = async (la, lo) => {
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
    showToast("☀️","SolarTrack Pro initialized!");

    // Weather refresh every 10 min
    const weatherId = setInterval(() => {
      if (latRef.current) window._loadWeather(latRef.current, lonRef.current);
    }, 600000);

    return () => clearInterval(weatherId);
  }, []);

  // ── Mode change
  const handleModeChange = (m) => {
    setMode(m);
    modeRef.current = m;
    showToast(m==="auto"?"🤖":"🎛", m==="auto"?"Auto tracking enabled":"Manual control active");
  };

  // ── Derived values
  const power = calcPower(sunEl, sunAz, panelTilt, panelAzimuth, cloudCover);
  const efficiency = calcEfficiency(power);
  const uv = calcUV(sunEl, cloudCover);

  // Arduino panel voltage simulation: voltage = sensor * (5.0/1023.0) * 3
  // Sensor 0-1023 mapped from power output (0-400W → 0-1023)
  const simSensor = Math.round((power / 400) * 1023);
  const panelVoltage = simSensor * (5.0 / 1023.0) * 3;

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

          {/* Control Panel */}
          <ControlPanel
            mode={mode}
            panelTilt={panelTilt}
            panelAzimuth={panelAzimuth}
            onModeChange={handleModeChange}
            onSliderX={v => { setPanelTilt(v); }}
            onSliderY={v => { setPanelAzimuth(v); }}
          />

          {/* Widgets */}
          <div className="widgets-section">
            <div className="section-title">Live Dashboard</div>
            <div className="widgets-grid">
              <LocationWidget {...geoData} lat={lat} lon={lon} />
              <WeatherWidget
                {...weatherData}
                error={weatherError}
                loading={weatherLoading}
                onRetry={() => window._loadWeather(latRef.current, lonRef.current)}
              />
              <SunPositionWidget el={sunEl} az={sunAz} zenith={90-sunEl} />
              <PanelStatusWidget efficiency={efficiency} panelTilt={panelTilt} panelAzimuth={panelAzimuth} />
              <DaylightWidget dayLen={dayLen} sunrise={sunriseStr} sunset={sunsetStr} daypct={daypct} />
              <PanelVoltageWidget voltage={panelVoltage} power={power} efficiency={efficiency} />
              <EnvironmentWidget uv={uv} uvDescription={uvDesc(uv)+" — "+(uv>=6?"Use protection!":"Safe levels")} cloud={cloudCover} humid={humid} pressure={pressure} />
              <DailyEnergyWidget dailyWh={dailyWh} />
            </div>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />
    </>
  );
}

// ── Mount
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
