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
  const step = 20 * 60 * 1000;
  for (let t = sunrise.getTime() - step; t <= sunset.getTime() + step; t += step) {
    const d = new Date(t);
    const sp = calcSunPos(d, lat, lon);
    if (sp.el < -5) continue;
    const p = sunToXY(sp.az, sp.el);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.length > 1 ? "M" + pts.join("L") : "";
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