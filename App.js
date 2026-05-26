function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ═══════════════════════════════════════════
   SolarTrack Pro — App.jsx
   React Application (loaded via Babel CDN)
═══════════════════════════════════════════ */

const {
  useState,
  useEffect,
  useRef,
  useCallback
} = React;

// ──────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ──────────────────────────────────────────

function LiveDot() {
  return /*#__PURE__*/React.createElement("div", {
    className: "live-dot"
  });
}
function LivePill({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "live-pill"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lp-dot"
  }), label);
}
function WChip({
  icon,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "w-chip"
  }, /*#__PURE__*/React.createElement("span", null, icon), /*#__PURE__*/React.createElement("span", null, value));
}

// ──────────────────────────────────────────
// NAVBAR
// ──────────────────────────────────────────

function Navbar({
  clock,
  date,
  locPill,
  theme,
  onToggleTheme,
  currentUser,
  onProfileClick,
  userPhotoURL
}) {
  const navRef = useRef(null);

  // Attach .scrolled class when page is scrolled > 10px
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("nav", {
    className: "navbar",
    ref: navRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-icon"
  }, /*#__PURE__*/React.createElement("img", {
    src: "logo.png",
    alt: "RAYMAX logo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "logo-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt"
  }, "RAYMAX"), /*#__PURE__*/React.createElement("div", {
    className: "ls"
  }, "Solar Tracking System"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "live-clock"
  }, clock), /*#__PURE__*/React.createElement("div", {
    className: "live-date"
  }, date)), /*#__PURE__*/React.createElement("div", {
    className: "nav-right"
  }, currentUser && /*#__PURE__*/React.createElement("div", {
    title: currentUser.loginMethod === 'mobile' ? `${currentUser.displayName} (${currentUser.mobile})` : currentUser.email,
    onClick: onProfileClick,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: userPhotoURL ? 'transparent' : currentUser.loginMethod === 'mobile' ? 'linear-gradient(135deg,#34c759,#30d158)' : 'linear-gradient(135deg,#ff9f0a,#ff6b00)',
      color: '#fff',
      fontWeight: 800,
      fontSize: '.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      overflow: 'hidden',
      boxShadow: userPhotoURL ? '0 2px 8px rgba(0,0,0,.2)' : currentUser.loginMethod === 'mobile' ? '0 2px 8px rgba(52,199,89,.4)' : '0 2px 8px rgba(255,159,10,.4)'
    }
  }, userPhotoURL ? /*#__PURE__*/React.createElement("img", {
    src: userPhotoURL,
    alt: "avatar",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    id: "themeBtn",
    onClick: onToggleTheme
  }, theme === "dark" ? "☀️" : "🌙"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    id: "logoutBtn",
    title: "Sign Out",
    onClick: async () => {
      localStorage.removeItem('raymax-mobile-user');
      try {
        await window.auth.signOut();
      } catch (_) {}
      window.location.href = './auth/index.html';
    }
  }, "\uD83D\uDEAA"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-side-cluster"
  }, /*#__PURE__*/React.createElement("div", {
    className: "live-badge"
  }, /*#__PURE__*/React.createElement(LiveDot, null), "LIVE"), /*#__PURE__*/React.createElement("div", {
    className: "loc-pill"
  }, "\uD83D\uDCCD ", /*#__PURE__*/React.createElement("span", null, locPill))));
}

// ──────────────────────────────────────────
// 3D SOLAR PANEL
// ──────────────────────────────────────────

function SolarPanel3D({
  panelTilt,
  panelAzimuth,
  panelVoltage,
  efficiency
}) {
  // Convert servo angles to physical angles for 3D rotation
  const physicalTilt = Math.max(0, Math.min(90, 90 - panelTilt / 2));
  const physicalAzimuth = Math.max(0, Math.min(360, panelAzimuth * 2));
  const azOffset = physicalAzimuth;
  const pivotStyle = {
    transform: `rotateY(${azOffset + 180}deg) rotateX(${physicalTilt}deg)`
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "glass-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-label"
  }, "\uD83D\uDD06 Solar Panel \u2014 3D View"), /*#__PURE__*/React.createElement("div", {
    className: "scene-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "scene-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "s-ground"
  }), /*#__PURE__*/React.createElement("div", {
    className: "s-base"
  }), /*#__PURE__*/React.createElement("div", {
    className: "s-pole"
  }), /*#__PURE__*/React.createElement("div", {
    className: "s-pivot",
    style: pivotStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "s-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "s-face"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cell-grid"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cell-shine"
  })), /*#__PURE__*/React.createElement("div", {
    className: "s-back"
  }), /*#__PURE__*/React.createElement("div", {
    className: "s-edge-t"
  }), /*#__PURE__*/React.createElement("div", {
    className: "s-edge-b"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "panel-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-val"
  }, panelTilt.toFixed(1), "\xB0"), /*#__PURE__*/React.createElement("div", {
    className: "ps-lbl"
  }, "Servo X (Tilt)")), /*#__PURE__*/React.createElement("div", {
    className: "ps-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-val"
  }, panelAzimuth.toFixed(1), "\xB0"), /*#__PURE__*/React.createElement("div", {
    className: "ps-lbl"
  }, "Servo Y (Azim)")), /*#__PURE__*/React.createElement("div", {
    className: "ps-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-val",
    style: {
      color: 'var(--green)'
    }
  }, panelVoltage.toFixed(2), " V"), /*#__PURE__*/React.createElement("div", {
    className: "ps-lbl"
  }, "Voltage")), /*#__PURE__*/React.createElement("div", {
    className: "ps-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-val"
  }, efficiency, "%"), /*#__PURE__*/React.createElement("div", {
    className: "ps-lbl"
  }, "Efficiency"))));
}

// ──────────────────────────────────────────
// SUN COMPASS SVG
// ──────────────────────────────────────────

function SunCompass({
  sunEl,
  sunAz,
  panelTilt,
  panelAzimuth,
  pathD
}) {
  // Convert servo angles to physical angles for compass drawing
  const physicalTilt = Math.max(0, Math.min(90, 90 - panelTilt / 2));
  const physicalAzimuth = Math.max(0, Math.min(360, panelAzimuth * 2));
  const sunPos = sunToXY(sunAz, sunEl);
  const panelPos = sunToXY(physicalAzimuth, physicalTilt);
  const isDay = sunEl > 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "glass-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-label"
  }, "\uD83E\uDDED Sky Map \u2014 Sun Path"), /*#__PURE__*/React.createElement("div", {
    className: "compass-svg-wrap"
  }, /*#__PURE__*/React.createElement("svg", {
    id: "sunPathSVG",
    viewBox: "0 0 260 260",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "energyGrad",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ff9f0a"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#ff6b00"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "sunGlow"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "3",
    result: "blur"
  }), /*#__PURE__*/React.createElement("feMerge", null, /*#__PURE__*/React.createElement("feMergeNode", {
    in: "blur"
  }), /*#__PURE__*/React.createElement("feMergeNode", {
    in: "SourceGraphic"
  }))), /*#__PURE__*/React.createElement("clipPath", {
    id: "compassClip"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "130",
    r: "117"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "130",
    r: "118",
    className: "c-ring"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "130",
    r: "78",
    className: "c-ring-mid"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "130",
    r: "39",
    className: "c-ring-mid"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "130",
    y1: "6",
    x2: "130",
    y2: "254",
    className: "c-cross"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "130",
    x2: "254",
    y2: "130",
    className: "c-cross"
  }), /*#__PURE__*/React.createElement("text", {
    x: "130",
    y: "20",
    className: "c-lbl",
    textAnchor: "middle"
  }, "S"), /*#__PURE__*/React.createElement("text", {
    x: "130",
    y: "252",
    className: "c-lbl",
    textAnchor: "middle"
  }, "N"), /*#__PURE__*/React.createElement("text", {
    x: "250",
    y: "134",
    className: "c-lbl",
    textAnchor: "middle"
  }, "W"), /*#__PURE__*/React.createElement("text", {
    x: "10",
    y: "134",
    className: "c-lbl",
    textAnchor: "middle"
  }, "E"), /*#__PURE__*/React.createElement("text", {
    x: "130",
    y: "104",
    className: "c-lbl",
    textAnchor: "middle",
    opacity: ".6"
  }, "60\xB0"), /*#__PURE__*/React.createElement("text", {
    x: "130",
    y: "65",
    className: "c-lbl",
    textAnchor: "middle",
    opacity: ".6"
  }, "30\xB0"), /*#__PURE__*/React.createElement("line", {
    x1: "130",
    y1: "130",
    x2: 260 - panelPos.x,
    y2: 260 - panelPos.y,
    className: "panel-dir-line"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: 260 - sunPos.x,
    cy: 260 - sunPos.y,
    r: "14",
    className: "sun-dot-glow",
    filter: "url(#sunGlow)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: 260 - sunPos.x,
    cy: 260 - sunPos.y,
    r: "9",
    className: "sun-dot-inner",
    filter: "url(#sunGlow)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "130",
    r: "3",
    className: "zenith-dot"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sqi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sqi-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sqi-val"
  }, sunEl.toFixed(1), "\xB0"), /*#__PURE__*/React.createElement("div", {
    className: "sqi-lbl"
  }, "Elevation")), /*#__PURE__*/React.createElement("div", {
    className: "sqi-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sqi-val"
  }, sunAz.toFixed(1), "\xB0"), /*#__PURE__*/React.createElement("div", {
    className: "sqi-lbl"
  }, "Azimuth")), /*#__PURE__*/React.createElement("div", {
    className: "sqi-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sqi-val"
  }, isDay ? "☀️ Day" : "🌙 Night"), /*#__PURE__*/React.createElement("div", {
    className: "sqi-lbl"
  }, "Status"))));
}

// ──────────────────────────────────────────
// CONTROL PANEL
// ──────────────────────────────────────────

function ControlPanel({
  mode,
  panelTilt,
  panelAzimuth,
  onModeChange,
  onSliderX,
  onSliderY,
  trackingMode,
  wsStatus
}) {
  const xPct = ((panelTilt - 0) / (140 - 0) * 100).toFixed(1);
  const yPct = ((panelAzimuth - 12) / (180 - 12) * 100).toFixed(1);
  const isConnected = wsStatus === "connected";
  const isLDR = !trackingMode || trackingMode === "LDR";
  const isSun = trackingMode === "SUN";
  return /*#__PURE__*/React.createElement("div", {
    className: "control-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "control-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ctrl-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ctrl-title-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, "Panel Control Mode"), /*#__PURE__*/React.createElement("div", {
    className: "cs"
  }, "Switch between automatic sun-tracking and manual control")), /*#__PURE__*/React.createElement("div", {
    className: "mode-pills"
  }, /*#__PURE__*/React.createElement("button", {
    id: "btnAuto",
    className: `mode-pill auto${mode === "auto" ? " active" : ""}`,
    onClick: () => onModeChange("auto"),
    title: "Enable automatic LDR / Sun-API tracking"
  }, "\u26A1 Auto Track"), /*#__PURE__*/React.createElement("button", {
    id: "btnManual",
    className: `mode-pill manual${mode === "manual" ? " active" : ""}`,
    onClick: () => onModeChange("manual")
  }, "\uD83C\uDF9B Manual"))), mode === "auto" ? /*#__PURE__*/React.createElement("div", {
    className: "auto-info-box"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "aib-icon",
    style: {
      fontSize: '1.5rem',
      flexShrink: 0
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "aib-title"
  }, "Auto Tracking Active"), /*#__PURE__*/React.createElement("div", {
    className: "aib-sub"
  }, !isConnected ? "ESP32 disconnected — simulating auto-tracking using local coordinates and Sun API." : trackingMode === "SUN" ? "LDR sensors inactive — panel is following sun position via Open-Meteo API." : "LDR sensors are guiding the panel toward the brightest light source."))), !isConnected ? /*#__PURE__*/React.createElement("div", {
    className: "aib-badge-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.65rem',
      fontWeight: 700,
      letterSpacing: '.06em',
      color: 'var(--t3)',
      textTransform: 'uppercase'
    }
  }, "Data Source"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: '.78rem',
      letterSpacing: '.03em',
      background: 'linear-gradient(135deg, rgba(10,132,255,.18), rgba(10,132,255,.08))',
      border: '1.5px solid rgba(10,132,255,.45)',
      color: 'var(--accent)',
      boxShadow: '0 2px 10px rgba(10,132,255,.15)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("span", null, "Sun API (Sim)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.62rem',
      color: 'var(--t3)',
      textAlign: 'center',
      maxWidth: 90
    }
  }, "Open-Meteo")) : trackingMode ? /*#__PURE__*/React.createElement("div", {
    className: "aib-badge-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.65rem',
      fontWeight: 700,
      letterSpacing: '.06em',
      color: 'var(--t3)',
      textTransform: 'uppercase'
    }
  }, "Data Source"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: '.78rem',
      letterSpacing: '.03em',
      background: isLDR ? 'linear-gradient(135deg, rgba(52,199,89,.18), rgba(52,199,89,.08))' : 'linear-gradient(135deg, rgba(255,159,10,.18), rgba(255,107,0,.08))',
      border: isLDR ? '1.5px solid rgba(52,199,89,.45)' : '1.5px solid rgba(255,159,10,.45)',
      color: isLDR ? 'var(--green)' : 'var(--gold)',
      boxShadow: isLDR ? '0 2px 10px rgba(52,199,89,.15)' : '0 2px 10px rgba(255,159,10,.15)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, isLDR ? '☀️' : '🌐'), /*#__PURE__*/React.createElement("span", null, isLDR ? 'LDR Sensors' : 'Sun API')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.62rem',
      color: 'var(--t3)',
      textAlign: 'center',
      maxWidth: 90
    }
  }, isLDR ? 'Light sensors active' : 'Open-Meteo API')) : /*#__PURE__*/React.createElement("div", {
    className: "aib-badge-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.65rem',
      fontWeight: 700,
      letterSpacing: '.06em',
      color: 'var(--t3)',
      textTransform: 'uppercase'
    }
  }, "Data Source"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: '.78rem',
      letterSpacing: '.03em',
      background: 'linear-gradient(135deg, rgba(52,199,89,.18), rgba(52,199,89,.08))',
      border: '1.5px solid rgba(52,199,89,.45)',
      color: 'var(--green)',
      boxShadow: '0 2px 10px rgba(52,199,89,.15)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, "\u2600\uFE0F"), /*#__PURE__*/React.createElement("span", null, "LDR Sensors")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.62rem',
      color: 'var(--t3)',
      textAlign: 'center',
      maxWidth: 90
    }
  }, "Waiting for ESP32"))) : /*#__PURE__*/React.createElement("div", {
    className: "sliders-wrap",
    style: {
      display: "grid"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "slider-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "slc-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "slc-title"
  }, "\u2195 X Axis \u2014 Tilt"), /*#__PURE__*/React.createElement("div", {
    className: "slc-desc"
  }, "Vertical tilt angle (elevation)")), /*#__PURE__*/React.createElement("div", {
    className: "slc-badge"
  }, panelTilt.toFixed(0), "\xB0")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "xSlider",
    min: "0",
    max: "140",
    value: Math.min(140, Math.max(0, panelTilt)),
    style: {
      "--val": Math.min(100, Math.max(0, xPct)) + "%"
    },
    onChange: e => onSliderX(parseFloat(e.target.value))
  }), /*#__PURE__*/React.createElement("div", {
    className: "slc-ends"
  }, /*#__PURE__*/React.createElement("span", null, "0\xB0"), /*#__PURE__*/React.createElement("span", null, "70\xB0"), /*#__PURE__*/React.createElement("span", null, "140\xB0"))), /*#__PURE__*/React.createElement("div", {
    className: "slider-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "slc-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "slc-title"
  }, "\u21BB Y Axis \u2014 Azimuth"), /*#__PURE__*/React.createElement("div", {
    className: "slc-desc"
  }, "Servo rotation")), /*#__PURE__*/React.createElement("div", {
    className: "slc-badge az"
  }, panelAzimuth.toFixed(0), "\xB0")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "ySlider",
    min: "12",
    max: "180",
    value: Math.min(180, Math.max(12, panelAzimuth)),
    className: "az-slider",
    style: {
      "--val": Math.min(100, Math.max(0, yPct)) + "%"
    },
    onChange: e => onSliderY(parseFloat(e.target.value))
  }), /*#__PURE__*/React.createElement("div", {
    className: "slc-ends"
  }, /*#__PURE__*/React.createElement("span", null, "12\xB0"), /*#__PURE__*/React.createElement("span", null, "96\xB0"), /*#__PURE__*/React.createElement("span", null, "180\xB0")), /*#__PURE__*/React.createElement("div", {
    className: "dir-labels",
    style: {
      justifyContent: 'space-between',
      padding: '0 5px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "12\xB0"), /*#__PURE__*/React.createElement("span", null, "54\xB0"), /*#__PURE__*/React.createElement("span", null, "96\xB0"), /*#__PURE__*/React.createElement("span", null, "138\xB0"), /*#__PURE__*/React.createElement("span", null, "180\xB0"))))));
}

// ──────────────────────────────────────────
// LOCATION WIDGET
// ──────────────────────────────────────────

function LocationWidget({
  city,
  state,
  place,
  country,
  pincode,
  lat,
  lon,
  address
}) {
  const headline = place && place !== '—' && place !== '--' ? place : city;
  const marqueeText = [place, city, state, country].filter(v => v && v !== '--' && v !== '—').join(" · ") + (lat && lon ? `  ·  ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E` : '');
  return /*#__PURE__*/React.createElement("div", {
    className: "widget widget-loc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83D\uDCCD"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "My Location"), /*#__PURE__*/React.createElement("div", {
    className: "w-main",
    style: {
      fontSize: headline.length > 18 ? '1rem' : headline.length > 12 ? '1.2rem' : '1.6rem',
      lineHeight: 1.2
    }
  }, headline), /*#__PURE__*/React.createElement("div", {
    className: "w-sub",
    style: {
      marginTop: 6
    }
  }, country), /*#__PURE__*/React.createElement("div", {
    className: "marquee-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee-track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "marquee-item"
  }, "\uD83D\uDCCD  ", marqueeText, "  "), /*#__PURE__*/React.createElement("span", {
    className: "marquee-item"
  }, "\uD83D\uDCCD  ", marqueeText, "  "))), /*#__PURE__*/React.createElement(LivePill, {
    label: "GPS Live"
  }));
}

// ──────────────────────────────────────────
// WEATHER WIDGET
// ──────────────────────────────────────────

function WeatherWidget({
  icon,
  temp,
  desc,
  humid,
  wind,
  feels,
  error,
  loading,
  onRetry
}) {
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "widget"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-icon"
    }, "\uD83C\uDF24"), /*#__PURE__*/React.createElement("div", {
      className: "w-title"
    }, "Weather"), /*#__PURE__*/React.createElement("div", {
      className: "w-main",
      style: {
        fontSize: "1rem",
        color: "var(--t3)"
      }
    }, "Fetching\u2026"), /*#__PURE__*/React.createElement("div", {
      className: "w-sub"
    }, "Contacting Open-Meteo API"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        height: 4,
        background: "var(--border-m)",
        borderRadius: 2,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: "40%",
        background: "var(--accent)",
        borderRadius: 2,
        animation: "marqueeRoll 1.5s linear infinite"
      }
    })));
  }
  if (error) {
    return /*#__PURE__*/React.createElement("div", {
      className: "widget",
      style: {
        borderColor: "rgba(255,59,48,.2)",
        background: "rgba(255,59,48,.04)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-icon"
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
      className: "w-title"
    }, "Weather"), /*#__PURE__*/React.createElement("div", {
      className: "w-main",
      style: {
        fontSize: "1rem",
        color: "var(--red)"
      }
    }, "Unavailable"), /*#__PURE__*/React.createElement("div", {
      className: "w-sub",
      style: {
        color: "var(--red)",
        opacity: .8
      }
    }, error), /*#__PURE__*/React.createElement("button", {
      onClick: onRetry,
      style: {
        marginTop: 14,
        padding: "8px 18px",
        borderRadius: "var(--r-pill)",
        border: "1px solid rgba(0,122,255,.3)",
        background: "rgba(0,122,255,.1)",
        color: "var(--accent)",
        fontSize: ".78rem",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "\uD83D\uDD04 Retry"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Weather"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, temp), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, desc), /*#__PURE__*/React.createElement("div", {
    className: "w-row"
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDCA7",
    value: humid
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83C\uDF2C",
    value: wind
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83C\uDF21",
    value: feels
  })));
}

// ──────────────────────────────────────────
// SUN POSITION WIDGET
// ──────────────────────────────────────────

function SunPositionWidget({
  el,
  az,
  zenith
}) {
  const targetServoX = el > 0 ? Math.max(0, Math.min(140, el * 2)) : 0;
  const targetServoY = Math.max(12, Math.min(180, az / 2));
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\u2600\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Sun Position"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, el.toFixed(1), "\xB0"), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, "Elevation (Azimuth: ", az.toFixed(1), "\xB0)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '6px 10px',
      borderRadius: 8,
      background: 'rgba(255,159,10,0.08)',
      border: '1px solid rgba(255,159,10,0.18)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.62rem',
      color: 'var(--gold)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "\uD83C\uDFAF Target Servos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '.78rem',
      color: 'var(--t1)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Target X: ", /*#__PURE__*/React.createElement("strong", null, targetServoX.toFixed(1), "\xB0")), /*#__PURE__*/React.createElement("span", null, "Target Y: ", /*#__PURE__*/React.createElement("strong", null, targetServoY.toFixed(1), "\xB0")))), /*#__PURE__*/React.createElement("div", {
    className: "w-row",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83E\uDDED",
    value: az.toFixed(1) + "°"
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDCD0",
    value: zenith.toFixed(1) + "°"
  })));
}

// ──────────────────────────────────────────
// PANEL STATUS WIDGET
// ──────────────────────────────────────────

function PanelStatusWidget({
  efficiency,
  panelTilt,
  panelAzimuth
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83D\uDD06"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Panel Status"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, efficiency, "%"), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, "Alignment Efficiency"), /*#__PURE__*/React.createElement("div", {
    className: "w-row"
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\u2195",
    value: `Servo X: ${panelTilt.toFixed(1)}°`
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\u21BB",
    value: `Servo Y: ${panelAzimuth.toFixed(1)}°`
  })));
}

// ──────────────────────────────────────────
// DAYLIGHT WIDGET
// ──────────────────────────────────────────

function DaylightWidget({
  dayLen,
  sunrise,
  sunset,
  daypct
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83C\uDF05"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Daylight"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, dayLen), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, "Total day length"), /*#__PURE__*/React.createElement("div", {
    className: "day-bar-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "day-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "day-fill",
    style: {
      width: daypct + "%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "day-sun-icon",
    style: {
      left: daypct + "%"
    }
  }, "\u2600\uFE0F"))), /*#__PURE__*/React.createElement("div", {
    className: "w-row"
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83C\uDF05",
    value: sunrise
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83C\uDF07",
    value: sunset
  })));
}

// ──────────────────────────────────────────
// POWER WIDGET
// ──────────────────────────────────────────

function PowerWidget({
  power,
  cloud,
  dailyWh
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Power Output"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, power, " W"), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, "Estimated generation (max 400W)"), /*#__PURE__*/React.createElement("div", {
    className: "pwr-gauge"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pwr-fill",
    style: {
      width: power / 4 + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-row"
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\u2601\uFE0F",
    value: cloud + "%"
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDCCA",
    value: dailyWh.toFixed(0) + " Wh"
  })));
}

// ──────────────────────────────────────────
// ENVIRONMENT WIDGET
// ──────────────────────────────────────────

function EnvironmentWidget({
  uv,
  uvDescription,
  cloud,
  humid,
  pressure
}) {
  const pressNorm = Math.min(100, Math.max(0, ((pressure || 1013) - 980) / 50 * 100));
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83C\uDF21"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Environment"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, "UV ", uv), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, uvDescription), /*#__PURE__*/React.createElement("div", {
    className: "env-bar-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ebr-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ebr-lbl"
  }, "Cloud"), /*#__PURE__*/React.createElement("div", {
    className: "ebr-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ebr-fill cloud",
    style: {
      width: Math.min(100, cloud) + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "ebr-val"
  }, cloud, "%")), /*#__PURE__*/React.createElement("div", {
    className: "ebr-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ebr-lbl"
  }, "Humidity"), /*#__PURE__*/React.createElement("div", {
    className: "ebr-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ebr-fill humid",
    style: {
      width: humid + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "ebr-val"
  }, humid, "%")), /*#__PURE__*/React.createElement("div", {
    className: "ebr-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ebr-lbl"
  }, "Pressure"), /*#__PURE__*/React.createElement("div", {
    className: "ebr-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ebr-fill",
    style: {
      width: pressNorm + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "ebr-val"
  }, pressure, " hPa"))));
}

// ──────────────────────────────────────────
// DAILY ENERGY WIDGET
// ──────────────────────────────────────────

function DailyEnergyWidget({
  dailyWh
}) {
  const goalPct = Math.min(100, dailyWh / 1000 * 100);
  const dashLen = 226;
  const offset = dashLen - goalPct / 100 * dashLen;
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83D\uDD0B"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Daily Energy"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, Math.round(dailyWh), " Wh"), /*#__PURE__*/React.createElement("div", {
    className: "w-sub"
  }, "Accumulated today (goal 1000 Wh)"), /*#__PURE__*/React.createElement("div", {
    className: "energy-ring-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "energy-ring"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 90 90"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "eGrad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ff9f0a"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#34c759"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "45",
    cy: "45",
    r: "36",
    className: "er-bg"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "45",
    cy: "45",
    r: "36",
    className: "er-fill",
    stroke: "url(#eGrad)",
    strokeDasharray: "226",
    strokeDashoffset: offset.toFixed(1),
    transform: "rotate(-90 45 45)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "er-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "er-pct"
  }, Math.round(goalPct), "%"), /*#__PURE__*/React.createElement("div", {
    className: "er-lbl"
  }, "of goal")))));
}

// ──────────────────────────────────────────
// PANEL VOLTAGE WIDGET  (mirrors Arduino: voltage = sensor*(5/1023)*3)
// Simulates the analogRead value from power ratio, max sensor=1023 → 14.96 V
// ──────────────────────────────────────────

function PanelVoltageWidget({
  voltage,
  power,
  efficiency
}) {
  // Simulate the Arduino analog sensor value (0–1023)
  const simSensor = Math.round(voltage / 5.0 * 1023);
  const maxV = 5.0;
  const fillPct = Math.min(100, voltage / maxV * 100);
  const status = voltage < 0.3 ? 'Off / Night' : voltage < 1.5 ? 'Low Output' : voltage < 3.5 ? 'Charging' : 'Optimal';
  const statusColor = voltage < 0.3 ? 'var(--t3)' : voltage < 1.5 ? 'var(--gold)' : voltage < 3.5 ? 'var(--accent)' : 'var(--green)';
  return /*#__PURE__*/React.createElement("div", {
    className: "widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Panel Voltage"), /*#__PURE__*/React.createElement("div", {
    className: "w-main"
  }, voltage.toFixed(2), " V"), /*#__PURE__*/React.createElement("div", {
    className: "w-sub",
    style: {
      color: statusColor,
      fontWeight: 600
    }
  }, status), /*#__PURE__*/React.createElement("div", {
    className: "pwr-gauge",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pwr-fill volt-fill",
    style: {
      width: fillPct + '%',
      background: `linear-gradient(90deg, #ff9f0a, #34c759)`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-row"
  }, /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDD0C",
    value: `${voltage.toFixed(1)} V`
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDCE1",
    value: `A0: ${simSensor}`
  }), /*#__PURE__*/React.createElement(WChip, {
    icon: "\uD83D\uDCA1",
    value: `${power} W`
  })));
}

// ──────────────────────────────────────────
// TOAST SYSTEM
// ──────────────────────────────────────────

function ToastContainer({
  toasts
}) {
  return /*#__PURE__*/React.createElement("div", {
    id: "toastContainer"
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: `toast${t.out ? " out" : ""}`
  }, /*#__PURE__*/React.createElement("span", null, t.icon), /*#__PURE__*/React.createElement("span", null, t.msg))));
}

// ──────────────────────────────────────────
// ALERT BAR
// ──────────────────────────────────────────

// AlertBar — collapsible sticky ribbon below navbar
function AlertBar({
  alerts,
  open,
  onToggle,
  onDismiss
}) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);
  if (!alerts || alerts.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: `alert-bar${open ? '' : ' alert-bar--collapsed'}`
  }, open && alerts.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `alert-pill ${a.type}`
  }, /*#__PURE__*/React.createElement("span", null, a.icon), /*#__PURE__*/React.createElement("span", null, a.msg), /*#__PURE__*/React.createElement("button", {
    className: "alert-dismiss",
    "aria-label": "Dismiss alert",
    onClick: () => onDismiss(i)
  }, "\u2715"))), /*#__PURE__*/React.createElement("button", {
    className: "alert-toggle",
    onClick: onToggle,
    title: open ? 'Hide alerts' : 'Show alerts',
    "aria-label": open ? 'Collapse alerts' : 'Expand alerts',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      transition: 'transform .25s',
      transform: open ? 'rotate(0deg)' : 'rotate(180deg)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 10L8 6L12 10",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !open && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '.75rem',
      fontWeight: 700
    }
  }, alerts.length, " alert", alerts.length > 1 ? 's' : '')));
}

// ──────────────────────────────────────────
// WEBSOCKET PANEL
// ──────────────────────────────────────────

function WSPanel({
  ip,
  onIpChange,
  status,
  onConnect,
  onDisconnect,
  lastSeen
}) {
  const isConn = status === "connected";
  const isRecon = status === "reconnecting";
  return /*#__PURE__*/React.createElement("div", {
    className: "ws-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: `ws-status-dot ${status}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: ".88rem",
      color: "var(--t1)"
    }
  }, "ESP32 WebSocket ", isConn ? "— Connected" : isRecon ? "— Reconnecting…" : "— Disconnected"), lastSeen && /*#__PURE__*/React.createElement("div", {
    className: "ws-info-text"
  }, "Last data: ", lastSeen)), /*#__PURE__*/React.createElement("input", {
    className: "ws-ip-input",
    value: ip,
    onChange: e => onIpChange(e.target.value),
    placeholder: "192.168.241.244",
    disabled: isConn || isRecon,
    autoFocus: false
  }), /*#__PURE__*/React.createElement("button", {
    className: `ws-connect-btn${isConn || isRecon ? " disconnected" : ""}`,
    onClick: isConn || isRecon ? onDisconnect : onConnect
  }, isConn ? "🔌 Disconnect" : isRecon ? "⏳ Reconnecting…" : "🔗 Connect"));
}

// ──────────────────────────────────────────
// LDR WIDGET
// ──────────────────────────────────────────

function LDRWidget({
  data,
  trackingMode
}) {
  const vals = data || {
    ldr_top: 0,
    ldr_bottom: 0,
    ldr_left: 0,
    ldr_right: 0
  };
  const items = [{
    label: "Top",
    val: vals.ldr_top
  }, {
    label: "Bottom",
    val: vals.ldr_bottom
  }, {
    label: "Left",
    val: vals.ldr_left
  }, {
    label: "Right",
    val: vals.ldr_right
  }];
  const isLDR = !trackingMode || trackingMode === "LDR";
  const isSun = trackingMode === "SUN";
  const hasData = !!data;
  return /*#__PURE__*/React.createElement("div", {
    className: "widget ldr-widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\u2600\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "LDR Sensors"), hasData && trackingMode ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 999,
      marginBottom: 6,
      fontSize: '.72rem',
      fontWeight: 700,
      letterSpacing: '.04em',
      background: isLDR ? 'linear-gradient(135deg, rgba(52,199,89,.2), rgba(52,199,89,.08))' : 'linear-gradient(135deg, rgba(255,159,10,.2), rgba(255,107,0,.08))',
      border: isLDR ? '1px solid rgba(52,199,89,.5)' : '1px solid rgba(255,159,10,.5)',
      color: isLDR ? 'var(--green)' : 'var(--gold)',
      alignSelf: 'flex-start'
    }
  }, isLDR ? '🟢 Tracking via LDR' : '🌐 Tracking via Sun API') : /*#__PURE__*/React.createElement("div", {
    className: "w-main",
    style: {
      fontSize: "1rem"
    }
  }, hasData ? "Live from ESP32" : "No ESP32 data"), hasData && isSun && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.7rem',
      color: 'var(--t3)',
      marginBottom: 6,
      fontStyle: 'italic'
    }
  }, "LDR diff <50 \u2014 falling back to Open-Meteo sun position"), /*#__PURE__*/React.createElement("div", {
    className: "ldr-grid"
  }, items.map(it => {
    const maxVal = it.val > 1023 ? 4095 : 1023;
    return /*#__PURE__*/React.createElement("div", {
      key: it.label,
      className: "ldr-item",
      style: {
        opacity: hasData && isSun ? 0.5 : 1,
        transition: 'opacity .3s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ldr-label"
    }, it.label), /*#__PURE__*/React.createElement("div", {
      className: "ldr-value"
    }, it.val), /*#__PURE__*/React.createElement("div", {
      className: "ldr-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ldr-bar-fill",
      style: {
        width: Math.min(100, it.val / maxVal * 100).toFixed(1) + "%"
      }
    })));
  })));
}

// ──────────────────────────────────────────
// SERIAL MONITOR
// ──────────────────────────────────────────

function SerialMonitor({
  log,
  onClear
}) {
  const containerRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);
  return /*#__PURE__*/React.createElement("div", {
    className: "widget serial-widget"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-icon"
  }, "\uD83D\uDCE1"), /*#__PURE__*/React.createElement("div", {
    className: "w-title"
  }, "Serial Monitor \u2014 ESP32 Live Feed"), /*#__PURE__*/React.createElement("div", {
    className: "serial-monitor",
    ref: containerRef
  }, log.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "serial-line",
    style: {
      opacity: .4
    }
  }, "Waiting for ESP32 data\u2026") : log.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "serial-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "serial-time"
  }, "[", l.time, "]"), l.text))), /*#__PURE__*/React.createElement("button", {
    className: "serial-clear-btn",
    onClick: onClear
  }, "\uD83D\uDDD1 Clear Log"));
}

// ──────────────────────────────────────────
// HISTORY CHARTS (Chart.js via CDN global)
// ──────────────────────────────────────────

function HistoryCharts({
  tick,
  theme
}) {
  const powerRef = useRef(null);
  const voltRef = useRef(null);
  const tempRef = useRef(null);
  const charts = useRef({});
  // Wrapper div refs — ResizeObserver attaches here
  const powerWrap = useRef(null);
  const voltWrap = useRef(null);
  const tempWrap = useRef(null);

  // ── ResizeObserver: fires on ANY size change including browser zoom ──
  useEffect(() => {
    const observers = [];
    const pairs = [{
      wrap: powerWrap,
      key: "power"
    }, {
      wrap: voltWrap,
      key: "volt"
    }, {
      wrap: tempWrap,
      key: "temp"
    }];
    pairs.forEach(({
      wrap,
      key
    }) => {
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
    const labels = history.map(h => h.time);
    const powers = history.map(h => h.power);
    const volts = history.map(h => h.voltage);
    const temps = history.map(h => h.temperature);
    const isDark = theme === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const textColor = isDark ? "rgba(255,255,255,0.7)" : "#9097b8";
    const makeGradient = (ctx, color) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, color.replace("1)", "0.35)"));
      gradient.addColorStop(0.6, color.replace("1)", "0.08)"));
      gradient.addColorStop(1, color.replace("1)", "0.00)"));
      return gradient;
    };
    const chartConf = (label, data, color, ref, key, yMin, yMax) => {
      if (charts.current[key]) {
        const ch = charts.current[key];
        ch.data.labels = labels;
        ch.data.datasets[0].data = data;
        ch.options.scales.x.ticks.color = textColor;
        ch.options.scales.y.ticks.color = textColor;
        ch.options.scales.x.grid.color = gridColor;
        ch.options.scales.y.grid.color = gridColor;
        ch.update("none");
        return;
      }
      const canvas = ref.current;
      const ctx = canvas.getContext("2d");
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
          animation: {
            duration: 400,
            easing: "easeOutQuart"
          },
          plugins: {
            legend: {
              display: false
            },
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
              ticks: {
                color: textColor,
                font: {
                  size: 10,
                  family: "'Datatype', monospace"
                },
                maxTicksLimit: 6
              },
              grid: {
                color: gridColor
              },
              border: {
                display: false
              }
            },
            y: {
              suggestedMin: yMin,
              suggestedMax: yMax,
              ticks: {
                color: textColor,
                font: {
                  size: 10,
                  family: "'Datatype', monospace"
                }
              },
              grid: {
                color: gridColor
              },
              border: {
                display: false
              }
            }
          }
        }
      });
    };
    if (powerRef.current) chartConf("Power (W)", powers, "rgba(255,159,10,1)", powerRef, "power", 0, 400);
    if (voltRef.current) chartConf("Voltage (V)", volts, "rgba(0,122,255,1)", voltRef, "volt", 0, 6);
    if (tempRef.current) chartConf("Temperature (°C)", temps, "rgba(255,59,48,1)", tempRef, "temp", 20, 50);
  }, [tick, theme]);
  return /*#__PURE__*/React.createElement("div", {
    className: "chart-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-section-title"
  }, "\uD83D\uDCC8 Historical Data \u2014 Last 60 readings"), /*#__PURE__*/React.createElement("div", {
    className: "charts-grid"
  }, [{
    ref: powerRef,
    wrap: powerWrap,
    label: "⚡ Power Output (W)"
  }, {
    ref: voltRef,
    wrap: voltWrap,
    label: "🔋 Voltage (V)"
  }, {
    ref: tempRef,
    wrap: tempWrap,
    label: "🌡 Temperature (°C)"
  }].map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-card-label"
  }, c.label), /*#__PURE__*/React.createElement("div", {
    className: "chart-canvas-wrap",
    ref: c.wrap
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: c.ref
  }))))));
}

// ──────────────────────────────────────────
// PROFILE OVERLAY PORTAL
// ──────────────────────────────────────────
function ProfileModal({
  isOpen,
  onClose,
  currentUser
}) {
  const [linking, setLinking] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [linkedAccounts, setLinkedAccounts] = useState({
    email: null,
    phone: null
  });
  const [showLinkEmail, setShowLinkEmail] = useState(false);
  const [showLinkPhone, setShowLinkPhone] = useState(false);

  // Load photo URL + linked accounts — pre-fill primary immediately, then merge from Firestore
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // Pre-fill primary login method immediately (no Firestore wait)
    if (currentUser.loginMethod === 'email') {
      setLinkedAccounts(prev => ({
        ...prev,
        email: currentUser.email
      }));
    } else if (currentUser.loginMethod === 'mobile') {
      setLinkedAccounts(prev => ({
        ...prev,
        phone: currentUser.mobile
      }));
    }

    // Then load photo + secondary linked account from Firestore
    const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
    window.db.collection(col).doc(currentUser.uid).get().then(doc => {
      if (doc.exists) {
        const d = doc.data();
        if (d.photoURL) setPhotoURL(d.photoURL);
        setLinkedAccounts({
          email: currentUser.loginMethod === 'email' ? currentUser.email // keep primary — never overwrite
          : d.email || null,
          // secondary linked email
          phone: currentUser.loginMethod === 'mobile' ? currentUser.mobile // keep primary — never overwrite
          : d.mobile || d.phone || null // secondary linked phone
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
      setError('Image too large. Max 2MB.');
      return;
    }
    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      // Build FormData for Cloudinary unsigned upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'raymax_profiles');

      // Upload to Cloudinary REST API — no SDK needed
      const res = await fetch('https://api.cloudinary.com/v1_1/dnh5ohncw/image/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed: ' + res.status);
      const data = await res.json();
      if (!data.secure_url) throw new Error('No URL returned from Cloudinary');

      // Add cache-bust so browser shows new photo immediately
      const freshURL = data.secure_url + '?v=' + Date.now();

      // Save canonical URL (without cache-bust) to Firestore
      const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      await window.db.collection(col).doc(currentUser.uid).update({
        photoURL: data.secure_url
      });

      // Update Firebase Auth profile if email user
      if (window.auth.currentUser) {
        await window.auth.currentUser.updateProfile({
          photoURL: data.secure_url
        });
      }

      // Update modal avatar immediately (cache-busted)
      setPhotoURL(freshURL);

      // Notify Navbar to update avatar
      window.dispatchEvent(new CustomEvent('raymax-photo-updated', {
        detail: {
          photoURL: freshURL
        }
      }));
      setSuccess('Profile photo updated! ✅');
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // ── Password update
  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const {
      current,
      newPass,
      confirm
    } = passwordForm;
    if (!current || !newPass || !confirm) return;
    if (newPass !== confirm) return setError('Passwords do not match');
    setLinking(true);
    try {
      if (currentUser.loginMethod === 'mobile') {
        const docRef = window.db.collection('users_mobile').doc(currentUser.uid);
        const sn = await docRef.get();
        if (sn.data().password !== current) throw new Error('Incorrect current password');
        await docRef.update({
          password: newPass
        });
      } else {
        const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, current);
        await window.auth.currentUser.reauthenticateWithCredential(cred);
        await window.auth.currentUser.updatePassword(newPass);
      }
      setSuccess('Password updated successfully. ✅');
      setPasswordForm({
        current: '',
        newPass: '',
        confirm: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Link account
  async function handleLink(type) {
    if (!linkInput) return;
    setLinking(true);
    setError('');
    setSuccess('');
    try {
      const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      const field = type === 'email' ? 'email' : 'mobile';
      await window.db.collection(col).doc(currentUser.uid).update({
        [field]: linkInput
      });
      setLinkedAccounts(prev => ({
        ...prev,
        [type === 'email' ? 'email' : 'phone']: linkInput
      }));
      setSuccess(`${type === 'email' ? 'Email' : 'Phone'} linked successfully! ✅`);
      setLinkInput('');
      setShowLinkEmail(false);
      setShowLinkPhone(false);
    } catch (err) {
      setError('Failed: ' + err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Unlink account
  async function handleUnlink(type) {
    setLinking(true);
    setError('');
    setSuccess('');
    try {
      const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
      const field = type === 'email' ? 'email' : 'mobile';
      await window.db.collection(col).doc(currentUser.uid).update({
        [field]: firebase.firestore.FieldValue.delete()
      });
      setLinkedAccounts(prev => ({
        ...prev,
        [type === 'email' ? 'email' : 'phone']: null
      }));
      setSuccess(`${type === 'email' ? 'Email' : 'Phone'} unlinked. ✅`);
    } catch (err) {
      setError('Failed: ' + err.message);
    } finally {
      setLinking(false);
    }
  }

  // ── Helper: linked account row
  // isPrimary = true  → show "Primary" badge, no unlink allowed
  // isPrimary = false → show Unlink or +Link depending on value
  function LinkedRow({
    icon,
    label,
    value,
    isPrimary,
    onLink,
    onUnlink,
    primaryColor
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 14,
        marginBottom: 10,
        background: value ? 'rgba(52,199,89,.08)' : 'rgba(0,0,0,.04)',
        border: `1px solid ${value ? 'rgba(52,199,89,.25)' : 'var(--border-m)'}`,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.2rem',
        flexShrink: 0
      }
    }, icon), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '.78rem',
        fontWeight: 700,
        color: 'var(--t2)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "pm-linked-value",
      style: {
        color: value ? 'var(--green)' : 'var(--t3)'
      },
      title: value
    }, value && value.length > 16 ? /*#__PURE__*/React.createElement("marquee", {
      scrollamount: "2",
      behavior: "scroll",
      direction: "left",
      style: {
        width: '100%',
        display: 'inline-block',
        verticalAlign: 'bottom'
      }
    }, value) : value || 'Not linked'))), isPrimary ?
    /*#__PURE__*/
    // Primary account — cannot unlink
    React.createElement("span", {
      style: {
        padding: '4px 10px',
        borderRadius: 100,
        background: primaryColor === 'green' ? 'rgba(52,199,89,.1)' : 'rgba(0,122,255,.1)',
        border: primaryColor === 'green' ? '1px solid rgba(52,199,89,.2)' : '1px solid rgba(0,122,255,.2)',
        color: primaryColor === 'green' ? 'var(--green)' : 'var(--accent)',
        fontSize: '.68rem',
        fontWeight: 700
      }
    }, "Primary") : value ? /*#__PURE__*/React.createElement("button", {
      onClick: onUnlink,
      style: {
        padding: '4px 12px',
        borderRadius: 100,
        background: 'rgba(255,59,48,.1)',
        border: '1px solid rgba(255,59,48,.25)',
        color: 'var(--red)',
        fontSize: '.72rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, "Unlink") : /*#__PURE__*/React.createElement("button", {
      onClick: onLink,
      style: {
        padding: '4px 12px',
        borderRadius: 100,
        background: 'rgba(0,122,255,.1)',
        border: '1px solid rgba(0,122,255,.25)',
        color: 'var(--accent)',
        fontSize: '.72rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, "+ Link"));
  }
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: 20,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "profile-modal",
    style: {
      maxHeight: '90vh',
      overflowY: 'auto',
      margin: 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pm-close",
    onClick: onClose
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "pm-header"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => fileInputRef.current.click(),
    style: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: photoURL ? 'transparent' : currentUser.loginMethod === 'mobile' ? 'linear-gradient(135deg,#34c759,#30d158)' : 'linear-gradient(135deg,#ff9f0a,#ff6b00)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 800,
      color: '#fff',
      cursor: 'pointer',
      overflow: 'hidden',
      position: 'relative',
      margin: '0 auto 12px',
      flexShrink: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,.15)'
    }
  }, photoURL ? /*#__PURE__*/React.createElement("img", {
    src: photoURL,
    alt: "avatar",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", null, (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "pm-avatar-cam-overlay",
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity .2s',
      fontSize: '1.3rem'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 1,
    onMouseLeave: e => e.currentTarget.style.opacity = 0
  }, "\uD83D\uDCF7"), uploading && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '.65rem',
      color: '#fff',
      fontWeight: 700
    }
  }, "Uploading\u2026")), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/jpeg,image/png,image/webp,image/gif",
    style: {
      display: 'none'
    },
    onChange: handlePhotoUpload
  }), /*#__PURE__*/React.createElement("h2", null, currentUser.displayName), /*#__PURE__*/React.createElement("p", null, currentUser.loginMethod === 'mobile' ? currentUser.mobile : currentUser.email)), error && /*#__PURE__*/React.createElement("div", {
    className: "pm-msg-error"
  }, error), success && /*#__PURE__*/React.createElement("div", {
    className: "pm-msg-success"
  }, success), /*#__PURE__*/React.createElement("div", {
    className: "pm-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDD17 Linked Accounts"), /*#__PURE__*/React.createElement(LinkedRow, {
    icon: "\uD83D\uDCE7",
    label: "Email",
    value: linkedAccounts.email,
    isPrimary: currentUser.loginMethod === 'email',
    primaryColor: "blue",
    onLink: () => {
      setShowLinkPhone(false);
      setShowLinkEmail(true);
      setLinkInput('');
    },
    onUnlink: () => handleUnlink('email')
  }), /*#__PURE__*/React.createElement(LinkedRow, {
    icon: "\uD83D\uDCF1",
    label: "Phone",
    value: linkedAccounts.phone,
    isPrimary: currentUser.loginMethod === 'mobile',
    primaryColor: "green",
    onLink: () => {
      setShowLinkEmail(false);
      setShowLinkPhone(true);
      setLinkInput('');
    },
    onUnlink: () => handleUnlink('phone')
  }), showLinkEmail && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "pm-input",
    placeholder: "Enter email address",
    value: linkInput,
    onChange: e => setLinkInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleLink('email'),
    style: {
      flex: 1,
      marginBottom: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleLink('email'),
    disabled: linking || !linkInput,
    style: {
      height: 44,
      padding: '0 18px',
      borderRadius: 100,
      border: 'none',
      background: 'linear-gradient(135deg,#ff9f0a,#007aff)',
      color: '#fff',
      fontWeight: 700,
      fontSize: '.82rem',
      cursor: 'pointer',
      fontFamily: 'inherit',
      flexShrink: 0,
      opacity: linking || !linkInput ? .6 : 1
    }
  }, linking ? '…' : 'Save'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowLinkEmail(false);
      setLinkInput('');
    },
    style: {
      height: 44,
      width: 44,
      borderRadius: 100,
      border: '1px solid var(--border-m)',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '1rem',
      flexShrink: 0
    }
  }, "\u2715")), showLinkPhone && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "pm-input",
    placeholder: "+91 9876543210",
    value: linkInput,
    onChange: e => setLinkInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleLink('phone'),
    style: {
      flex: 1,
      marginBottom: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleLink('phone'),
    disabled: linking || !linkInput,
    style: {
      height: 44,
      padding: '0 18px',
      borderRadius: 100,
      border: 'none',
      background: 'linear-gradient(135deg,#ff9f0a,#007aff)',
      color: '#fff',
      fontWeight: 700,
      fontSize: '.82rem',
      cursor: 'pointer',
      fontFamily: 'inherit',
      flexShrink: 0,
      opacity: linking || !linkInput ? .6 : 1
    }
  }, linking ? '…' : 'Save'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowLinkPhone(false);
      setLinkInput('');
    },
    style: {
      height: 44,
      width: 44,
      borderRadius: 100,
      border: '1px solid var(--border-m)',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '1rem',
      flexShrink: 0
    }
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "pm-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDD12 Change Password"), /*#__PURE__*/React.createElement("div", {
    className: "pm-input-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    className: "pm-input",
    type: "password",
    placeholder: "Current Password",
    value: passwordForm.current,
    onChange: e => setPasswordForm({
      ...passwordForm,
      current: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pm-input-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    className: "pm-input",
    type: "password",
    placeholder: "New Password",
    value: passwordForm.newPass,
    onChange: e => setPasswordForm({
      ...passwordForm,
      newPass: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pm-input-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    className: "pm-input",
    type: "password",
    placeholder: "Confirm Password",
    value: passwordForm.confirm,
    onChange: e => setPasswordForm({
      ...passwordForm,
      confirm: e.target.value
    })
  })), /*#__PURE__*/React.createElement("button", {
    className: "pm-btn",
    style: {
      marginTop: 8
    },
    disabled: linking,
    onClick: handleUpdatePassword
  }, linking ? 'Updating…' : 'Update Password'))));
}

// ──────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────

function App() {
  // ── FIX: Force scroll to top on mount — prevents auto-scroll to Control Panel
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
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
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email || 'User',
          email: firebaseUser.email || '',
          mobile: null,
          loginMethod: 'email'
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
        const doc = await window.db.collection('users_mobile').doc(token.uid).get();
        if (!doc.exists) {
          // Doc was deleted or uid was forged → deny
          deny();
          return;
        }
        const data = doc.data();

        // ✅ MOBILE USER — verified via Firestore
        setCurrentUser({
          uid: doc.id,
          displayName: data.fullName || token.mobile || 'User',
          email: data.mobile || '',
          // mobile fills the email slot in UI
          mobile: data.mobile || '',
          loginMethod: 'mobile'
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
  const [geoData, setGeoData] = useState({
    city: "Locating…",
    state: "--",
    place: "--",
    country: "--",
    pincode: "--",
    address: "Acquiring full address…"
  });

  // ── Weather
  const [weatherData, setWeatherData] = useState({
    icon: "🌤",
    temp: "--°C",
    desc: "Loading…",
    humid: "--%",
    wind: "-- km/h",
    feels: "--°C"
  });
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ── Sun
  const [sunEl, setSunEl] = useState(0);
  const [sunAz, setSunAz] = useState(180);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [sunPathD, setSunPathD] = useState("");

  // ── Panel
  const [mode, setMode] = useState("manual");
  const [panelTilt, setPanelTilt] = useState(0);
  const [panelAzimuth, setPanelAzimuth] = useState(180);

  // ── Energy (persisted in Firestore solar_sessions collection)
  const [dailyWh, setDailyWh] = useState(0);
  const lastPwrRef = useRef(Date.now());
  const [cloudCover, setCloudCover] = useState(0);
  const [humid, setHumid] = useState(50);
  const [pressure, setPressure] = useState(1013);

  // ── WebSocket
  const [wsIP, setWsIP] = useState("192.168.241.244");
  const [wsStatus, setWsStatus] = useState("disconnected"); // "connected"|"disconnected"|"reconnecting"
  const [wsLastSeen, setWsLastSeen] = useState(null);
  const wsRef = useRef(null);

  // ── ESP32 live sensor data (overrides simulated values when connected)
  // shape: { ldr_top, ldr_bottom, ldr_left, ldr_right, voltage, temperature, servo_tilt, servo_azimuth }
  const [esp32Data, setEsp32Data] = useState(null);

  // ── Alerts + bar visibility toggle
  const [alerts, setAlerts] = useState([{
    type: "ok",
    icon: "✅",
    msg: "All systems nominal"
  }]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [alertBarOpen, setAlertBarOpen] = useState(true); // collapse/expand the alert ribbon

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
  useEffect(() => {
    latRef.current = lat;
  }, [lat]);
  useEffect(() => {
    lonRef.current = lon;
  }, [lon]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    sunriseRef.current = sunrise;
  }, [sunrise]);
  useEffect(() => {
    sunsetRef.current = sunset;
  }, [sunset]);
  useEffect(() => {
    cloudRef.current = cloudCover;
  }, [cloudCover]);
  const esp32DataRef = useRef(null);
  const wsStatusRef = useRef("disconnected");
  useEffect(() => {
    esp32DataRef.current = esp32Data;
  }, [esp32Data]);
  useEffect(() => {
    wsStatusRef.current = wsStatus;
  }, [wsStatus]);

  // ── Load photo URL for navbar avatar + listen for live updates from ProfileModal
  useEffect(() => {
    if (!currentUser) return;
    const col = currentUser.loginMethod === 'mobile' ? 'users_mobile' : 'users';
    window.db.collection(col).doc(currentUser.uid).get().then(doc => {
      if (doc.exists && doc.data().photoURL) setUserPhotoURL(doc.data().photoURL);
    });
    const handler = e => setUserPhotoURL(e.detail.photoURL);
    window.addEventListener('raymax-photo-updated', handler);
    return () => window.removeEventListener('raymax-photo-updated', handler);
  }, [currentUser]);

  // ── Load today's dailyWh from Firestore once currentUser is known
  // Uses currentUser.uid for email users, or mobile number for mobile users.
  useEffect(() => {
    if (!currentUser) return;
    const today = new Date().toDateString();
    const sessId = currentUser.loginMethod === 'mobile' ? currentUser.mobile + '_' + today // mobile sessions keyed by number
    : currentUser.uid + '_' + today; // email sessions keyed by Firebase uid
    window.db.collection('solar_sessions').doc(sessId).get().then(doc => {
      if (doc.exists) setDailyWh(doc.data().daily_wh || 0);
    });
  }, [currentUser]);

  // ── Save / merge today's session doc to Firestore
  const saveTodaySession = async (wh, pwr) => {
    if (!currentUser) return;
    const today = new Date().toDateString();
    const sessId = currentUser.loginMethod === 'mobile' ? currentUser.mobile + '_' + today : currentUser.uid + '_' + today;
    await window.db.collection('solar_sessions').doc(sessId).set({
      user_id: currentUser.loginMethod === 'mobile' ? currentUser.mobile : currentUser.uid,
      login_method: currentUser.loginMethod || 'email',
      date: today,
      daily_wh: wh,
      peak_power: pwr,
      location_lat: latRef.current,
      location_lon: lonRef.current,
      location_name: geoData.city || '',
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    }, {
      merge: true
    });
  };

  // ── Show toast
  const showToast = useCallback((icon, msg) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, {
      id,
      icon,
      msg,
      out: false
    }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? {
        ...t,
        out: true
      } : t));
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
      setClock(now.toLocaleTimeString("en-IN", {
        hour12: false
      }));
      setDateStr(now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }));
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
    let tilt = panelTilt,
      az = panelAzimuth;
    if (modeRef.current === "auto") {
      // If connected, let ESP32 handle its own tracking via LDRs. Do not override mathematically.
      if (wsRef.current && wsRef.current.isConnected()) {
        // No mathematical override. The UI will receive position updates via esp32Data
      } else {
        // Calculate the physical target angles based on sun position
        const targetPhysicalTilt = sp.el > 0 ? Math.max(0, 90 - sp.el) : 0;
        const targetPhysicalAzimuth = sp.az;

        // Map physical target angles back to servo angles for state storage
        tilt = Math.max(0, Math.min(140, (90 - targetPhysicalTilt) * 2));
        az = Math.max(12, Math.min(180, targetPhysicalAzimuth / 2));
        setPanelTilt(tilt);
        setPanelAzimuth(az);
      }
    }

    // Convert stored servo angles (or latest values) back to physical for power calculation
    const physicalTilt = Math.max(0, Math.min(90, 90 - tilt / 2));
    const physicalAzimuth = Math.max(0, Math.min(360, az * 2));

    // Calculate power: use real ESP32 voltage if connected, otherwise fallback to math simulation
    const isConn = wsRef.current && wsRef.current.isConnected() && wsStatusRef.current === "connected";
    const actualVoltage = isConn && esp32DataRef.current ? esp32DataRef.current.solar_voltage !== undefined ? esp32DataRef.current.solar_voltage : esp32DataRef.current.voltage || 0 : null;
    let pwr = actualVoltage !== null ? Math.round(400 * Math.pow(Math.min(5.0, actualVoltage) / 5.0, 2)) : Math.round(calcPower(sp.el, sp.az, physicalTilt, physicalAzimuth, cloudRef.current));

    // Apply 95-100% variation/jitter in simulation auto-mode when well-aligned
    if (modeRef.current === "auto" && pwr > 360 && actualVoltage === null) {
      const timeFactor = Math.sin(Date.now() / 3000) * 10 - 10;
      pwr = Math.max(0, Math.round(pwr + timeFactor));
    }
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

    // Update local history buffer only when NOT connected to physical ESP32
    if (actualVoltage === null) {
      const simVolt = pwr / 400 * 5.0;
      const baseTemp = 26.0;
      const elevTemp = sp.el > 0 ? sp.el / 90 * 8 : 0;
      const simTemp = baseTemp + elevTemp + (Math.random() * 0.8 - 0.4);
      HistoryBuffer.add({
        time: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }),
        power: pwr,
        voltage: simVolt,
        temperature: simTemp
      });
      setHistoryTick(t => t + 1);

      // Append to simulated serial log
      const tracking = sp.el > 0 ? "SUN (Sim)" : "NIGHT";
      const modeStr = modeRef.current === "auto" ? "AUTO" : "MANUAL";
      const topVal = Math.round(Math.max(0, 1023 * (pwr / 400) + (Math.random() * 20 - 10)));
      const botVal = Math.round(Math.max(0, topVal + (Math.random() * 10 - 5)));
      const leftVal = Math.round(Math.max(0, topVal + (Math.random() * 10 - 5)));
      const rightVal = Math.round(Math.max(0, topVal + (Math.random() * 10 - 5)));
      const formattedText = `[Offline Sim] Mode:${modeStr} | Tracking:${tracking} | X:${tilt.toFixed(0)} Y:${az.toFixed(0)} | Top:${topVal} Bot:${botVal} L:${leftVal} R:${rightVal} | Volt: ${simVolt.toFixed(2)}V | Temp: ${simTemp.toFixed(1)}°C`;
      const line = {
        time: now.toLocaleTimeString("en-IN", {
          hour12: false
        }),
        text: formattedText
      };
      const next = [...serialLogRef.current, line].slice(-20);
      serialLogRef.current = next;
      setSerialLog([...next]);
    }
  }, []);
  useEffect(() => {
    const id = setInterval(doUpdate, 10000);
    return () => clearInterval(id);
  }, [doUpdate]);

  // ── ESP32 data side-effects: alerts + history + serial log
  useEffect(() => {
    if (!esp32Data) return;
    const activeServoTilt = esp32Data.tilt !== undefined ? Math.max(0, Math.min(140, esp32Data.tilt)) : panelTilt;
    const activeServoAzimuth = esp32Data.azimuth !== undefined ? Math.max(12, Math.min(180, esp32Data.azimuth)) : panelAzimuth;

    // Convert to physical angles for calculations
    const physicalTilt = Math.max(0, Math.min(90, 90 - activeServoTilt / 2));
    const physicalAzimuth = Math.max(0, Math.min(360, activeServoAzimuth * 2));

    // Calculate power: use real ESP32 voltage
    const actualVoltage = esp32Data.solar_voltage !== undefined ? esp32Data.solar_voltage : esp32Data.voltage || 0;
    const pwr = Math.round(400 * Math.pow(Math.min(5.0, actualVoltage) / 5.0, 2));

    // Run alert checks against live sensor data
    const newAlerts = checkAlerts({
      ...esp32Data,
      power: pwr
    });
    setAlerts(newAlerts.filter(a => !dismissedAlerts.includes(a.msg)));

    // ── Update 3D panel display with live ESP32 servo angles
    if (esp32Data.tilt !== undefined) setPanelTilt(Math.max(0, Math.min(140, esp32Data.tilt)));
    if (esp32Data.azimuth !== undefined) setPanelAzimuth(Math.max(12, Math.min(180, esp32Data.azimuth)));

    // Auto tracking is FROZEN — no web-brain commands sent to ESP32.

    // Push to circular history buffer and nudge chart re-render
    HistoryBuffer.add({
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      power: pwr,
      voltage: esp32Data.solar_voltage !== undefined ? esp32Data.solar_voltage : esp32Data.voltage || 0,
      temperature: esp32Data.temperature || 0
    });
    setHistoryTick(t => t + 1);

    // Append formatted line matching the exact Arduino IDE print statement to the serial log
    const tracking = esp32Data.tracking_mode || (esp32Data.ldr_top !== undefined ? "LDR" : "SUN");
    const modeStr = esp32Data.autoMode !== undefined ? esp32Data.autoMode ? "AUTO" : "MANUAL" : modeRef.current === "auto" ? "AUTO" : "MANUAL";
    const tiltVal = esp32Data.tilt !== undefined ? esp32Data.tilt : panelTilt;
    const azVal = esp32Data.azimuth !== undefined ? esp32Data.azimuth : panelAzimuth;
    const voltVal = esp32Data.solar_voltage !== undefined ? esp32Data.solar_voltage : esp32Data.voltage || 0;
    const tempVal = esp32Data.temperature || 0;
    const topVal = esp32Data.ldr_top !== undefined ? esp32Data.ldr_top : 0;
    const botVal = esp32Data.ldr_bottom !== undefined ? esp32Data.ldr_bottom : 0;
    const leftVal = esp32Data.ldr_left !== undefined ? esp32Data.ldr_left : 0;
    const rightVal = esp32Data.ldr_right !== undefined ? esp32Data.ldr_right : 0;
    const formattedText = `Mode:${modeStr} | Tracking:${tracking} | X:${tiltVal} Y:${azVal} | Top:${topVal} Bot:${botVal} L:${leftVal} R:${rightVal} | Volt: ${voltVal.toFixed(2)}V | Temp: ${tempVal.toFixed(1)}°C`;
    const line = {
      time: new Date().toLocaleTimeString("en-IN", {
        hour12: false
      }),
      text: formattedText
    };
    const next = [...serialLogRef.current, line].slice(-20);
    serialLogRef.current = next;
    setSerialLog([...next]);
  }, [esp32Data]);

  // ── Geolocation (gated on currentUser — only runs after auth guard confirms session)
  useEffect(() => {
    if (!currentUser) return;
    if (!navigator.geolocation) {
      showToast("⚠️", "Geolocation not supported");
      return;
    }
    const onSuccess = async pos => {
      const {
        latitude: la,
        longitude: lo
      } = pos.coords;
      const isFirst = latRef.current === null;
      setLat(la);
      setLon(lo);
      latRef.current = la;
      lonRef.current = lo;
      setLocPill(la.toFixed(3) + "°N, " + lo.toFixed(3) + "°E");

      // sunrise/sunset
      const ss = calcSunriseSunset(new Date(), la, lo);
      let sr = ss?.sunrise || null,
        se = ss?.sunset || null;
      if (sr && se && sr.getTime() > se.getTime()) {
        const t = sr;
        sr = se;
        se = t;
      }
      setSunrise(sr);
      setSunset(se);
      sunriseRef.current = sr;
      sunsetRef.current = se;
      if (isFirst) {
        showToast("📍", "Location acquired!");
        doUpdate();

        // fetch geocode
        try {
          const addr = await fetchGeocode(la, lo);
          const place = addr.amenity || addr.university || addr.school || addr.college || addr.building || addr.hotel || "";
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "Unknown";
          const suburb = addr.suburb || addr.neighbourhood || addr.quarter || "";
          const district = addr.state_district || addr.district || "";
          const state = addr.state || "";
          const country = addr.country || "";
          const pin = addr.postcode || "";
          // Prefer specific named place (university, school, amenity)
          const specificPlace = addr.amenity || addr.university || addr.school || addr.college || addr.building || addr.hotel || addr.office || "";
          const areaLabel = suburb || district || city;
          const parts = [specificPlace, suburb, district, city, state, country].filter(Boolean);
          const fullAddr = parts.join(" · ");
          setGeoData({
            city: specificPlace || city,
            state: areaLabel ? areaLabel + ", " + state : state,
            place: specificPlace || district || "—",
            country,
            pincode: pin || "—",
            address: fullAddr
          });
          setLocPill((specificPlace || city) + ", " + state);
        } catch (e) {}

        // fetch weather
        window._raymaxLoadWeather(la, lo);
      }
    };
    const onError = () => {
      const la = 28.6139,
        lo = 77.2090;
      setLat(la);
      setLon(lo);
      latRef.current = la;
      lonRef.current = lo;
      setLocPill("28.61°N, 77.21°E (default)");
      setGeoData(prev => ({
        ...prev,
        city: "New Delhi (fallback)",
        country: "India"
      }));
      const ss = calcSunriseSunset(new Date(), la, lo);
      let sr = ss?.sunrise || null,
        se = ss?.sunset || null;
      if (sr && se && sr.getTime() > se.getTime()) {
        const t = sr;
        sr = se;
        se = t;
      }
      setSunrise(sr);
      setSunset(se);
      sunriseRef.current = sr;
      sunsetRef.current = se;
      showToast("📍", "Using default location — enable GPS for accuracy");
      window._raymaxLoadWeather(la, lo);
      doUpdate();
    };

    // ── Shared weather loader — renamed to avoid Supabase namespace collision
    window._raymaxLoadWeather = async (la, lo) => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const wc = await fetchWeather(la, lo);
        const wEntry = WC[wc.weather_code] || {
          l: "Unknown",
          i: "❓"
        };
        setCloudCover(wc.cloud_cover || 0);
        cloudRef.current = wc.cloud_cover || 0;
        setHumid(wc.relative_humidity_2m || 50);
        setPressure(wc.surface_pressure || 1013);
        setWeatherData({
          icon: wEntry.i,
          temp: Math.round(wc.temperature_2m) + "°C",
          desc: wEntry.l,
          humid: wc.relative_humidity_2m + "%",
          wind: Math.round(wc.wind_speed_10m) + " km/h",
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
    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 30000
    });
    showToast("☀️", "RAYMAX initialized!");

    // Weather refresh every 10 min
    const weatherId = setInterval(() => {
      if (latRef.current) window._raymaxLoadWeather(latRef.current, lonRef.current);
    }, 600000);
    return () => clearInterval(weatherId);
  }, [currentUser]); // ← gate on currentUser so GPS/weather only start after auth confirms

  // ── Mode change
  // ── WebSocket connect / disconnect
  const handleWsConnect = () => {
    if (wsRef.current) wsRef.current.disconnect();
    const ws = new RaymaxWS(wsIP, 81);
    ws.onStatusChange(status => {
      setWsStatus(status);
      showToast(status === "connected" ? "🔌" : status === "reconnecting" ? "🔄" : "❌", status === "connected" ? "ESP32 Connected!" : status === "reconnecting" ? "Reconnecting to ESP32…" : "ESP32 Disconnected");
    });
    ws.onData(data => {
      setEsp32Data(data);
      setWsLastSeen(new Date().toLocaleTimeString("en-IN", {
        hour12: false
      }));
    });
    ws.connect();
    wsRef.current = ws;
  };
  const handleWsDisconnect = () => {
    if (wsRef.current) wsRef.current.disconnect();
    setWsStatus("disconnected");
    setEsp32Data(null);
  };
  const handleModeChange = m => {
    if (m === "auto") {
      setMode("auto");
      modeRef.current = "auto";
      // Send auto command to ESP32 if connected
      if (wsRef.current && wsRef.current.isConnected()) {
        wsRef.current.sendAutoMode();
      }
      showToast("⚡", "Auto tracking enabled — ESP32 will use LDR or Sun API");
      // Trigger doUpdate instantly to align the panel
      setTimeout(doUpdate, 0);
    } else {
      setMode("manual");
      modeRef.current = "manual";
      showToast("🎛", "Manual control active");
    }
  };

  // ── Derived values
  const physicalTilt = Math.max(0, Math.min(90, 90 - panelTilt / 2));
  const physicalAzimuth = Math.max(0, Math.min(360, panelAzimuth * 2));
  const isConn = wsStatus === "connected" && esp32Data;
  const actualVoltage = isConn ? esp32Data.solar_voltage !== undefined ? esp32Data.solar_voltage : esp32Data.voltage || 0 : null;
  const rawPower = Math.round(calcPower(sunEl, sunAz, physicalTilt, physicalAzimuth, cloudCover));
  // Apply 95-100% variation/jitter in simulation auto-mode when well-aligned
  const simPower = mode === "auto" && rawPower > 360 && actualVoltage === null ? Math.max(0, Math.round(rawPower + (Math.sin(Date.now() / 3000) * 10 - 10))) : rawPower;
  const power = actualVoltage !== null ? Math.round(400 * Math.pow(Math.min(5.0, actualVoltage) / 5.0, 2)) : simPower;
  const efficiency = calcEfficiency(power);
  const uv = calcUV(sunEl, cloudCover);

  // Voltage: use real ESP32 reading when connected (Arduino sends "solar_voltage" key)
  // Fallback: simulate voltage from 0 to 5 V
  const panelVoltage = actualVoltage !== null ? actualVoltage : power / 400 * 5.0;

  // Real panel temperature from ESP32 (null when not connected)
  const realTemp = esp32Data && wsStatus === "connected" ? esp32Data.temperature : null;

  // Daylight
  let dayLen = "--h --m",
    sunriseStr = "--:--",
    sunsetStr = "--:--",
    daypct = 0;
  if (sunrise && sunset) {
    const total = sunset.getTime() - sunrise.getTime();
    const h = Math.floor(total / 3600000),
      m = Math.round(total % 3600000 / 60000);
    dayLen = `${h}h ${m}m`;
    sunriseStr = fmtTime(sunrise);
    sunsetStr = fmtTime(sunset);
    daypct = Math.min(100, Math.max(0, (Date.now() - sunrise.getTime()) / total * 100));
  }

  // ── Loading splash — shown while Firebase auth resolves
  if (authLoading) return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2rem'
    }
  }, "\u2600\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1rem',
      color: 'var(--t3)',
      fontWeight: 600
    }
  }, "Loading RAYMAX..."));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "liquid-bg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "blob b1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "blob b2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "blob b3"
  })), /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Navbar, {
    clock: clock,
    date: dateStr,
    locPill: locPill,
    theme: theme,
    onToggleTheme: toggleTheme,
    currentUser: currentUser,
    onProfileClick: () => setIsProfileOpen(true),
    userPhotoURL: userPhotoURL
  }), /*#__PURE__*/React.createElement(AlertBar, {
    alerts: alerts,
    open: alertBarOpen,
    onToggle: () => setAlertBarOpen(v => !v),
    onDismiss: idx => setAlerts(prev => prev.filter((_, i) => i !== idx))
  }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
    className: "viz-section"
  }, /*#__PURE__*/React.createElement(SolarPanel3D, {
    panelTilt: panelTilt,
    panelAzimuth: panelAzimuth,
    panelVoltage: panelVoltage,
    efficiency: efficiency
  }), /*#__PURE__*/React.createElement(SunCompass, {
    sunEl: sunEl,
    sunAz: sunAz,
    panelTilt: panelTilt,
    panelAzimuth: panelAzimuth,
    pathD: sunPathD
  })), /*#__PURE__*/React.createElement(WSPanel, {
    ip: wsIP,
    onIpChange: setWsIP,
    status: wsStatus,
    onConnect: handleWsConnect,
    onDisconnect: handleWsDisconnect,
    lastSeen: wsLastSeen
  }), /*#__PURE__*/React.createElement(ControlPanel, {
    mode: mode,
    panelTilt: panelTilt,
    panelAzimuth: panelAzimuth,
    onModeChange: handleModeChange,
    trackingMode: esp32Data?.tracking_mode || null,
    wsStatus: wsStatus,
    onSliderX: v => {
      setPanelTilt(v);
      if (wsRef.current && wsRef.current.isConnected()) {
        wsRef.current.sendCommand(v, panelAzimuth);
      }
    },
    onSliderY: v => {
      setPanelAzimuth(v);
      if (wsRef.current && wsRef.current.isConnected()) {
        wsRef.current.sendCommand(panelTilt, v);
      }
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "widgets-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Live Dashboard"), currentUser && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".82rem",
      color: "var(--t3)",
      fontWeight: 500,
      padding: "0 4px 10px 4px"
    }
  }, "\uD83D\uDC4B Welcome back, ", currentUser.displayName || currentUser.email), /*#__PURE__*/React.createElement("div", {
    className: "widgets-grid"
  }, /*#__PURE__*/React.createElement(LocationWidget, _extends({}, geoData, {
    lat: lat,
    lon: lon
  })), /*#__PURE__*/React.createElement(WeatherWidget, _extends({}, weatherData, {
    error: weatherError,
    loading: weatherLoading,
    onRetry: () => window._raymaxLoadWeather(latRef.current, lonRef.current)
  })), /*#__PURE__*/React.createElement(SunPositionWidget, {
    el: sunEl,
    az: sunAz,
    zenith: 90 - sunEl
  }), /*#__PURE__*/React.createElement(PanelStatusWidget, {
    efficiency: efficiency,
    panelTilt: panelTilt,
    panelAzimuth: panelAzimuth
  }), /*#__PURE__*/React.createElement(DaylightWidget, {
    dayLen: dayLen,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    daypct: daypct
  }), /*#__PURE__*/React.createElement(PanelVoltageWidget, {
    voltage: panelVoltage,
    power: power,
    efficiency: efficiency
  }), /*#__PURE__*/React.createElement(EnvironmentWidget, {
    uv: uv,
    uvDescription: uvDesc(uv) + " — " + (uv >= 6 ? "Use protection!" : "Safe levels"),
    cloud: cloudCover,
    humid: humid,
    pressure: pressure
  }), /*#__PURE__*/React.createElement(DailyEnergyWidget, {
    dailyWh: dailyWh
  }), /*#__PURE__*/React.createElement(LDRWidget, {
    data: esp32Data,
    trackingMode: esp32Data?.tracking_mode || null
  }), /*#__PURE__*/React.createElement(SerialMonitor, {
    log: serialLog,
    onClear: () => {
      serialLogRef.current = [];
      setSerialLog([]);
    }
  }))), /*#__PURE__*/React.createElement(HistoryCharts, {
    tick: historyTick,
    theme: theme
  }))), /*#__PURE__*/React.createElement(ToastContainer, {
    toasts: toasts
  }), /*#__PURE__*/React.createElement(ProfileModal, {
    isOpen: isProfileOpen,
    onClose: () => setIsProfileOpen(false),
    currentUser: currentUser
  }));
}

// ── Mount
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
