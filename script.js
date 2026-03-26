/* ═══════════════════════════════════════════
   SolarTrack Pro — script.js
   Pure Utility Functions (no DOM, no React)
   Used by App.jsx
═══════════════════════════════════════════ */

// ── WEATHER CODE MAP ──
const WC = {
  0:{l:"Clear Sky",i:"☀️"}, 1:{l:"Mainly Clear",i:"🌤"}, 2:{l:"Partly Cloudy",i:"⛅"}, 3:{l:"Overcast",i:"☁️"},
  45:{l:"Foggy",i:"🌫"}, 48:{l:"Icy Fog",i:"🌫"}, 51:{l:"Light Drizzle",i:"🌦"}, 53:{l:"Drizzle",i:"🌦"},
  61:{l:"Light Rain",i:"🌧"}, 63:{l:"Rain",i:"🌧"}, 65:{l:"Heavy Rain",i:"🌧"}, 71:{l:"Light Snow",i:"🌨"},
  73:{l:"Snowfall",i:"❄️"}, 80:{l:"Rain Showers",i:"🌦"}, 81:{l:"Showers",i:"🌦"}, 95:{l:"Thunderstorm",i:"⛈"},
};

// ══════════════════════════════════════════
// SUN POSITION ALGORITHM (NOAA Simplified)
// ══════════════════════════════════════════
function calcSunPos(date, lat, lon) {
  const R = Math.PI / 180;
  const JD = date.getTime() / 86400000 + 2440587.5;
  const n  = JD - 2451545.0;
  const L  = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  const g  = ((357.528 + 0.9856003 * n) % 360 + 360) % 360 * R;
  const lm = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2*g)) * R;
  const ep = 23.439 * R;
  const dec  = Math.asin(Math.sin(ep) * Math.sin(lm));
  const ra   = Math.atan2(Math.cos(ep) * Math.sin(lm), Math.cos(lm));
  const GMST = (6.697375 + 0.0657098242 * n + (date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600)) % 24;
  const HA   = ((GMST * 15 + lon) - ra * 180/Math.PI) * R;
  const phi  = lat * R;
  const sinEl = Math.sin(phi)*Math.sin(dec) + Math.cos(phi)*Math.cos(dec)*Math.cos(HA);
  const el    = Math.asin(Math.min(1, Math.max(-1, sinEl))) * 180/Math.PI;
  const cosAz = (Math.sin(dec) - Math.sin(phi)*sinEl) / (Math.cos(phi)*Math.sqrt(1 - sinEl*sinEl) + 1e-10);
  let az = Math.acos(Math.min(1, Math.max(-1, cosAz))) * 180/Math.PI;
  if (Math.sin(HA) > 0) az = 360 - az;
  return { el: Math.round(el*10)/10, az: Math.round(az*10)/10 };
}

function calcSunriseSunset(date, lat, lon) {
  const R = Math.PI / 180;
  const JD = Math.floor(date.getTime()/86400000 + 2440587.5 - 0.5) + 0.5;
  const n  = JD - 2451545.0;
  const J  = n - lon/360;
  const M  = ((357.5291 + 0.98560028*J) % 360 + 360) % 360 * R;
  const C  = (1.9148*Math.sin(M) + 0.0200*Math.sin(2*M) + 0.0003*Math.sin(3*M));
  const lm = ((((357.5291 + 0.98560028*J) % 360 + 360) % 360 + C + 102.9372 + 180) % 360) * R;
  const Jnoon = 2451545 + J + 0.0053*Math.sin(M) - 0.0069*Math.sin(2*lm);
  const dec = Math.asin(Math.sin(lm)*Math.sin(23.4397*R));
  const pH = lat*R;
  const cosW = (Math.sin(-0.8333*R) - Math.sin(pH)*Math.sin(dec)) / (Math.cos(pH)*Math.cos(dec));
  if (Math.abs(cosW) > 1) return null;
  const w = Math.acos(cosW)*180/Math.PI;
  const toDate = jd => new Date((jd - 2440587.5)*86400000);
  return {
    sunrise: toDate(Jnoon - w/360),
    sunset:  toDate(Jnoon + w/360),
    noon:    toDate(Jnoon),
  };
}

// ══════════════════════════════════════════
// POWER & EFFICIENCY
// ══════════════════════════════════════════
function calcPower(sunEl, sunAz, panelTilt, panelAz, cloud) {
  if (sunEl <= 0) return 0;
  const R = Math.PI/180;
  const sEl = sunEl*R, pTilt = panelTilt*R;
  const azD = (sunAz - panelAz)*R;
  const dot = Math.sin(pTilt)*Math.cos(sEl)*Math.cos(azD) + Math.cos(pTilt)*Math.sin(sEl);
  const incidence = Math.max(0, dot);
  const cloudFactor = 1 - (cloud||0)/200;
  return Math.round(400 * incidence * cloudFactor);
}

function calcEfficiency(power) { return Math.min(100, Math.round(power/4)); }

function calcUV(sunEl, cloud) {
  if (sunEl <= 0) return 0;
  const base = sunEl / 90 * 11;
  return Math.max(0, Math.round(base * (1 - (cloud||0)/150)));
}

function uvDesc(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function fmtTime(date) {
  return date.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit",hour12:false});
}

// Sun compass helpers
const CX = 130, CY = 130, CR = 118;
function sunToXY(az, el) {
  const r = (90 - Math.max(0, el)) / 90 * CR;
  const a = (az - 90) * Math.PI/180;
  return { x: CX + r*Math.cos(a), y: CY + r*Math.sin(a) };
}

function buildSunPathD(sunrise, sunset, lat, lon) {
  if (!sunrise || !sunset) return "";
  const pts = [];
  const step = 10 * 60 * 1000;   // 10-min intervals for good density
  for (let t = sunrise.getTime() - step; t <= sunset.getTime() + step; t += step) {
    const sp = calcSunPos(new Date(t), lat, lon);
    if (sp.el < -5) continue;
    const p = sunToXY(sp.az, sp.el);
    pts.push(p);
  }
  if (pts.length < 2) return "";

  // Build a smooth cubic-bezier SVG path (Catmull-Rom → cubic bezier)
  // This produces a soft, continuous arc with no kinks
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    // Catmull-Rom to cubic bezier control points (tension 0.4)
    const t = 0.4;
    const cp1x = p1.x + (p2.x - p0.x) * t / 2;
    const cp1y = p1.y + (p2.y - p0.y) * t / 2;
    const cp2x = p2.x - (p3.x - p1.x) * t / 2;
    const cp2y = p2.y - (p3.y - p1.y) * t / 2;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}


// Async data fetchers
async function fetchWeather(lat, lon) {
  // Open-Meteo — free, no key needed, CORS-friendly
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`
    + `&current=temperature_2m,apparent_temperature,relative_humidity_2m`
    + `,wind_speed_10m,weather_code,cloud_cover,surface_pressure`
    + `&timezone=auto&wind_speed_unit=kmh&forecast_days=1`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();

  // Guard: ensure data.current exists
  if (!data || !data.current) {
    throw new Error("Weather data missing in response");
  }
  return data.current;
}

async function fetchGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse`
    + `?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;
  const r = await fetch(url, {
    headers: { "Accept-Language": "en" }
  });
  if (!r.ok) throw new Error(`Geocode HTTP ${r.status}`);
  const data = await r.json();
  return data.address || {};
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — WEBSOCKET MANAGER
   Class : RaymaxWS
   Usage : const ws = new RaymaxWS("192.168.1.100");
           ws.connect();
           ws.onData(json => console.log(json));
           ws.sendCommand(30, 180);
═══════════════════════════════════════════════════════════════ */
class RaymaxWS {
  /**
   * @param {string} ip   - IP address of the ESP32
   * @param {number} port - WebSocket port (default 81)
   */
  constructor(ip, port = 81) {
    this._ip         = ip;
    this._port       = port;
    this._socket     = null;
    this._dataCallback   = null;   // set via onData()
    this._statusCallback = null;   // set via onStatusChange()
    this._reconnectTimer = null;
    this._intentionalClose = false;
  }

  // ── PUBLIC API ────────────────────────────────────────────

  /** Open a connection to ws://ip:port */
  connect() {
    this._intentionalClose = false;
    this._openSocket();
  }

  /** Cleanly close the socket (no auto-reconnect after this) */
  disconnect() {
    this._intentionalClose = true;
    this._clearReconnect();
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
  }

  /** Returns true if the socket is currently open */
  isConnected() {
    return !!(this._socket && this._socket.readyState === WebSocket.OPEN);
  }

  /**
   * Send a move command to the ESP32.
   * @param {number} tilt     - Panel tilt angle  (degrees)
   * @param {number} azimuth  - Panel azimuth angle (degrees)
   */
  sendCommand(tilt, azimuth) {
    if (!this.isConnected()) {
      console.warn("[RaymaxWS] Cannot send — not connected.");
      return;
    }
    const payload = JSON.stringify({ cmd: "move", tilt, azimuth });
    this._socket.send(payload);
  }

  /**
   * Register a callback that fires whenever a JSON message
   * arrives from the ESP32.
   * @param {function} callback - receives a parsed JSON object
   */
  onData(callback) {
    this._dataCallback = callback;
  }

  /**
   * Register a callback that fires on connection-state changes.
   * @param {function} callback - receives "connected" | "disconnected" | "reconnecting"
   */
  onStatusChange(callback) {
    this._statusCallback = callback;
  }

  // ── PRIVATE HELPERS ────────────────────────────────────────

  _openSocket() {
    const url = `ws://${this._ip}:${this._port}`;
    try {
      this._socket = new WebSocket(url);
    } catch (e) {
      console.error("[RaymaxWS] WebSocket construction failed:", e);
      this._scheduleReconnect();
      return;
    }

    this._socket.onopen = () => {
      console.log(`[RaymaxWS] Connected to ${url}`);
      this._clearReconnect();
      this._emitStatus("connected");
    };

    this._socket.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        if (this._dataCallback) this._dataCallback(json);
      } catch (e) {
        console.warn("[RaymaxWS] Non-JSON message ignored:", event.data);
      }
    };

    this._socket.onerror = (err) => {
      console.warn("[RaymaxWS] Socket error:", err);
      // onclose will fire next and handle reconnect
    };

    this._socket.onclose = () => {
      console.log("[RaymaxWS] Socket closed.");
      this._socket = null;
      if (!this._intentionalClose) {
        this._emitStatus("disconnected");
        this._scheduleReconnect();
      }
    };
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return; // already scheduled
    this._emitStatus("reconnecting");
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (!this._intentionalClose) {
        console.log("[RaymaxWS] Attempting reconnect…");
        this._openSocket();
      }
    }, 3000); // retry every 3 seconds
  }

  _clearReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  _emitStatus(status) {
    if (this._statusCallback) this._statusCallback(status);
  }
}

// Expose globally so App.jsx / inline scripts can use it
window.RaymaxWS = RaymaxWS;


/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — ALERT LOGIC
   Function : checkAlerts(data)
   Usage    : const alerts = checkAlerts({ voltage, temperature,
                ldr_top, ldr_bottom, ldr_left, ldr_right, power });
   Returns  : Array of { type, icon, msg } objects
═══════════════════════════════════════════════════════════════ */

/**
 * Evaluate incoming ESP32 sensor data and generate user-facing alerts.
 *
 * @param {Object} data
 * @param {number} data.voltage       - Panel voltage (V)
 * @param {number} data.temperature   - Panel temperature (°C)
 * @param {number} data.ldr_top       - LDR reading — top sensor
 * @param {number} data.ldr_bottom    - LDR reading — bottom sensor
 * @param {number} data.ldr_left      - LDR reading — left sensor
 * @param {number} data.ldr_right     - LDR reading — right sensor
 * @param {number} data.power         - Current power output (W)
 *
 * @returns {Array<{type:string, icon:string, msg:string}>}
 */
function checkAlerts(data) {
  const { voltage, temperature, ldr_top, ldr_bottom, ldr_left, ldr_right } = data;
  const alerts = [];

  // ── Voltage checks ─────────────────────────────────────────
  if (voltage < 10) {
    alerts.push({
      type: "warn",
      icon: "⚡",
      msg:  "Low voltage: " + voltage.toFixed(1) + "V"
    });
  } else if (voltage > 15) {
    alerts.push({
      type: "danger",
      icon: "🔴",
      msg:  "Overvoltage! " + voltage.toFixed(1) + "V"
    });
  }

  // ── Temperature checks ─────────────────────────────────────
  // Order matters: check the higher threshold first so only one
  // temperature alert fires per reading.
  if (temperature > 60) {
    alerts.push({
      type: "danger",
      icon: "🌡",
      msg:  "Panel overheating: " + temperature + "°C"
    });
  } else if (temperature > 45) {
    alerts.push({
      type: "warn",
      icon: "🌡",
      msg:  "High temp: " + temperature + "°C"
    });
  }

  // ── LDR difference checks ───────────────────────────────────
  if (Math.abs(ldr_top - ldr_bottom) > 200) {
    alerts.push({
      type: "info",
      icon: "☀️",
      msg:  "Large vertical sun angle difference"
    });
  }

  if (Math.abs(ldr_left - ldr_right) > 200) {
    alerts.push({
      type: "info",
      icon: "🧭",
      msg:  "Large horizontal sun angle difference"
    });
  }

  // ── All-clear fallback ─────────────────────────────────────
  if (alerts.length === 0) {
    alerts.push({
      type: "ok",
      icon: "✅",
      msg:  "All systems nominal"
    });
  }

  return alerts;
}

// Expose globally
window.checkAlerts = checkAlerts;


/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — HISTORY BUFFER
   Object : HistoryBuffer  (circular, max 60 entries)
   Usage  : window.HistoryBuffer.add({ power, voltage, temperature });
            const history = window.HistoryBuffer.getAll();
            window.HistoryBuffer.clear();
═══════════════════════════════════════════════════════════════ */
class _HistoryBuffer {
  constructor() {
    this.MAX  = 60;
    this._buf = []; // internal circular store
  }

  /**
   * Add a single data-point to the buffer.
   * A human-readable time string is auto-generated and stored
   * alongside the supplied fields.
   *
   * @param {Object} entry
   * @param {number} entry.power        - Power output (W)
   * @param {number} entry.voltage      - Panel voltage (V)
   * @param {number} entry.temperature  - Panel temperature (°C)
   */
  add(entry) {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const record = { time, ...entry };

    if (this._buf.length >= this.MAX) {
      // Circular: drop the oldest entry
      this._buf.shift();
    }
    this._buf.push(record);
  }

  /**
   * Return a shallow copy of all entries in chronological order.
   * @returns {Array}
   */
  getAll() {
    return [...this._buf];
  }

  /** Empty the buffer. */
  clear() {
    this._buf = [];
  }
}

// Instantiate and expose a singleton globally
window.HistoryBuffer = new _HistoryBuffer();