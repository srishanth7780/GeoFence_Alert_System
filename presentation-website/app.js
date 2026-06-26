/**
 * GeoFence Alert System — Standalone Presentation Website Script
 * Fully client-driven, zero backend dependencies.
 */

// Lucide CDN safety fallback mock
if (typeof lucide === 'undefined') {
  window.lucide = { createIcons: () => {} };
}

// Web Audio API beep synthesizer
const playAlertSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "entry") {
      // High pitch happy tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === "exit") {
      // Alarm low alarm tone
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch (e) {
    console.warn("Web Audio blocked or unsupported", e);
  }
};

// Slides Database (25 slides)
const slides = [
  // SECTION 1: Context & Core Gaps (Slides 1-5)
  {
    id: 1,
    title: "GeoFence Alert System",
    section: "Introduction",
    subtitle: "Reactive Asset Monitoring & Violation Dispatch Engine",
    render: (dark) => `
      <div class="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto px-4 relative">
        <div class="relative mb-6 flex items-center justify-center">
          <div class="absolute w-36 h-36 rounded-full border border-cyan-500/25 animate-ping opacity-25"></div>
          <div class="relative w-24 h-24 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <i data-lucide="shield" class="w-12 h-12 text-white"></i>
          </div>
        </div>
        <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-display">
          GeoFence Alert System
        </h2>
        <p class="text-base md:text-lg mt-4 max-w-2xl font-light ${dark ? 'text-slate-300' : 'text-slate-600'}">
          Real-time GPS coordinate synchronization, sub-second boundary validation, automated EmailJS dispatches, and weekly violation reporting.
        </p>
        <div class="mt-8 flex gap-3 text-xs font-mono">
          <span class="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">Terminal Project</span>
          <span class="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">Vite + Node.js + Firebase</span>
        </div>
      </div>
    `
  },
  {
    id: 2,
    title: "Project Presenters & Team",
    section: "Introduction",
    subtitle: "Project ownership, roles and structural contributions",
    render: (dark) => `
      <div class="max-w-5xl mx-auto px-4">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-6 ${dark ? 'text-white' : 'text-slate-900'}">Project Presenters</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- Backend Part -->
          <div class="p-4.5 rounded-2xl border ${dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="database" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-sm font-bold leading-tight text-cyan-400">Srishanth Kondoju</h4>
                  <p class="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Backend Part</p>
                </div>
              </div>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed">
                Sensor/GPS ingestion APIs, threshold comparison logic, geofence entry-exit calculations, alert trigger endpoints, notification storage, and reporting routes.
              </p>
            </div>
          </div>

          <!-- Frontend Part -->
          <div class="p-4.5 rounded-2xl border ${dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="monitor" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-sm font-bold leading-tight text-indigo-400">Muthina Abhilash</h4>
                  <p class="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Frontend Part</p>
                </div>
              </div>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed">
                Threshold/geofence setup screen, live device map/status view, alert list, notification history, and admin monitoring dashboard.
              </p>
            </div>
          </div>

          <!-- Testing & Deployment Part -->
          <div class="p-4.5 rounded-2xl border ${dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3.5 mb-3.5">
                <div class="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="settings" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-sm font-bold leading-tight text-rose-400">B Geshna</h4>
                  <p class="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Testing & Deploy</p>
                </div>
              </div>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed">
                Device onboarding testing, simulated sensor testing, alert/geofence testing, workshop assessment testing, API testing, GitHub management, and deployment validation.
              </p>
            </div>
          </div>

        </div>
      </div>
    `
  },
  {
    id: 3,
    title: "Project Background & Context",
    section: "Introduction",
    subtitle: "Trends in logistics tracking and automatic security boundaries",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Why Geofencing Matters</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          Modern enterprise industries manage fleets, asset containers, and critical personnel across extensive territories. Knowing coordinate positions is no longer sufficient. Systems require **automatic boundary checking** to react instantly to exits and entries.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}">
            <div class="text-cyan-400 font-bold mb-1"><i data-lucide="truck" class="w-4 h-4 inline mr-1"></i> Fleet Security</div>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}">Alerting admins if transport trucks deviate from predetermined highway corridors.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}">
            <div class="text-emerald-400 font-bold mb-1"><i data-lucide="user-check" class="w-4 h-4 inline mr-1"></i> Staff Safety</div>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}">Ensuring personnel on dangerous industrial sites remain within safe designated sectors.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}">
            <div class="text-indigo-400 font-bold mb-1"><i data-lucide="package" class="w-4 h-4 inline mr-1"></i> Asset Audits</div>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}">Immediate warnings if valuable rental hardware leaves storage depots unauthorized.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 4,
    title: "Industry Gaps & Problems",
    section: "Introduction",
    subtitle: "Inadequacies in traditional location tracking setups",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Current Market Challenges</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-6">
          Traditional solutions are plagued by latency issues, heavy telemetry client costs, and lack of real-time responsiveness:
        </p>
        <div class="space-y-3.5">
          <div class="flex gap-3.5 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold text-rose-500 uppercase tracking-wider">Polling Latency</h4>
              <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}">Many systems poll databases on schedules (e.g. every 5 mins). This creates huge delay windows during asset theft.</p>
            </div>
          </div>
          <div class="flex gap-3.5 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <i data-lucide="wifi-off" class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold text-rose-500 uppercase tracking-wider">Device Resource Drain</h4>
              <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}">Running heavy geometric intersections on telemetry client hardware drains battery packs in hours.</p>
            </div>
          </div>
          <div class="flex gap-3.5 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <i data-lucide="mail-question" class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold text-rose-500 uppercase tracking-wider">Disconnected Notifications</h4>
              <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}">Alert logs often stay in databases unnoticed instead of being actively dispatched as SMS or emails.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 5,
    title: "Product Vision & Solution",
    section: "Introduction",
    subtitle: "Core objectives of the GeoFence Alert System",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">The Proposed Solution</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          The GeoFence Alert System addresses tracking gaps by executing calculations on **low-cost cloud servers** rather than devices. Real-time Pub/Sub architecture ensures immediate notification triggers:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="p-4.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex gap-3">
            <i data-lucide="zap" class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Sub-Second Reactive Sync</h4>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Changes are synced instantly across screens using Firebase Firestore database stream listeners.</p>
            </div>
          </div>
          <div class="p-4.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex gap-3">
            <i data-lucide="bell" class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400">Reactive Dispatch Alerts</h4>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Direct connection to EmailJS allows the node server to dispatch notifications within 1 second of breach.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // SECTION 2: Technology Stack & Architecture (Slides 6-10)
  {
    id: 6,
    title: "High-Level Architecture Model",
    section: "Stack & Database",
    subtitle: "Data pipelines from client triggers to notification dispatches",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col h-full justify-between">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Flow of Telemetry Data</h3>
        
        <div class="flex flex-col items-center space-y-4 my-6">
          <!-- Step 1 -->
          <div class="w-full max-w-lg ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex items-center justify-between">
            <span class="text-xs font-bold"><i data-lucide="smartphone" class="w-4 h-4 inline mr-1 text-emerald-400"></i> Geolocation Client</span>
            <span class="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">GPS Streams</span>
          </div>
          <!-- Arrow -->
          <div class="h-4 w-0.5 bg-cyan-500"></div>
          <!-- Step 2 -->
          <div class="w-full max-w-lg ${dark ? 'bg-slate-900 border-cyan-500/30 text-white shadow-md shadow-cyan-500/5' : 'bg-white border-cyan-500/30 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex items-center justify-between">
            <span class="text-xs font-bold"><i data-lucide="database" class="w-4 h-4 inline mr-1 text-cyan-400"></i> Cloud Firestore</span>
            <span class="text-[9px] font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">Real-time DB (/devices)</span>
          </div>
          <!-- Arrow -->
          <div class="h-4 w-0.5 bg-indigo-500"></div>
          <!-- Step 3 -->
          <div class="w-full max-w-lg ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex items-center justify-between">
            <span class="text-xs font-bold"><i data-lucide="cpu" class="w-4 h-4 inline mr-1 text-indigo-400"></i> Backend Node Server</span>
            <span class="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">Geometric Checks</span>
          </div>
          <!-- Arrow -->
          <div class="h-4 w-0.5 bg-rose-500"></div>
          <!-- Step 4 -->
          <div class="w-full max-w-lg ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex items-center justify-between">
            <span class="text-xs font-bold"><i data-lucide="mail" class="w-4 h-4 inline mr-1 text-rose-400"></i> EmailJS Gateway</span>
            <span class="text-[9px] font-mono text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">1s Delivery</span>
          </div>
        </div>

        <p class="text-xs text-center ${dark ? 'text-slate-500' : 'text-slate-400'} font-mono">
          Continuous loops ensure position checks are calculated outside device threads.
        </p>
      </div>
    `
  },
  {
    id: 7,
    title: "Technology Stack Breakdown",
    section: "Stack & Database",
    subtitle: "Underlying software packages and framework modules",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-5 ${dark ? 'text-white' : 'text-slate-900'}">Core Framework Packages</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Client GUI</span>
            <h4 class="text-sm font-bold mt-1">React + Vite</h4>
            <p class="text-[10px] text-slate-500 mt-1 leading-snug">Vite bundler yields optimized static HTML client output pages.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Styling</span>
            <h4 class="text-sm font-bold mt-1">Tailwind CSS</h4>
            <p class="text-[10px] text-slate-500 mt-1 leading-snug">Utility layout classes with Framer Motion transitions.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Calculations</span>
            <h4 class="text-sm font-bold mt-1">Node + Express</h4>
            <p class="text-[10px] text-slate-500 mt-1 leading-snug">REST API points, Haversine checks, and notification tasks.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Storage</span>
            <h4 class="text-sm font-bold mt-1">Cloud Firestore</h4>
            <p class="text-[10px] text-slate-500 mt-1 leading-snug">Real-time NoSQL syncing across client dashboard and servers.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 8,
    title: "Database Modeling Strategy",
    section: "Stack & Database",
    subtitle: "Choosing NoSQL Cloud databases for tracking metrics",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">NoSQL for Real-Time Telemetry</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          Traditional SQL tables require complex relational joins and schema locking which can delay continuous location updates. A NoSQL real-time document strategy allows for flexible telemetry formats:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex gap-3">
            <i data-lucide="trending-up" class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold ${dark ? 'text-white' : 'text-slate-900'}">Dynamic Indexing</h4>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-0.5">New devices push location coordinates without pre-registering schema shapes.</p>
            </div>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} flex gap-3">
            <i data-lucide="refresh-cw" class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"></i>
            <div>
              <h4 class="text-xs font-bold ${dark ? 'text-white' : 'text-slate-900'}">Reactive Syncing</h4>
              <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-0.5">Subscribed browser widgets trigger layout modifications instantly on update changes.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 9,
    title: "Schema: `/devices` & `/geofences`",
    section: "Stack & Database",
    subtitle: "Data layout specs for trackers and boundary limits",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Document Schemas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300">
            <span class="text-cyan-400 font-bold">// Device collection layout</span>
            <pre class="mt-2 text-slate-400">
{
  id: "TRUCK-001",
  name: "Transport Truck A",
  type: "vehicle", // vehicle | personnel
  email: "trucka@geofence.com",
  lat: 17.3988,
  lng: 78.5538,
  status: "inside", // inside | outside
  updated_at: timestamp
}
            </pre>
          </div>
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300">
            <span class="text-cyan-400 font-bold">// Geofence collection layout</span>
            <pre class="mt-2 text-slate-400">
{
  id: "zone_warehouse_a",
  name: "Warehouse Depot A",
  shape: "circle", // circle | polygon
  center_lat: 17.3980,
  center_lng: 78.5530,
  radius_m: 500, // circle only
  polygon: [ // polygon only
    { lat: 17.39, lng: 78.55 },
    ...
  ]
}
            </pre>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 10,
    title: "Schema: `/alerts` Violation Logs",
    section: "Stack & Database",
    subtitle: "Document layout specs for tracking events",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Alert Log Collections</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300">
            <span class="text-cyan-400 font-bold">// Violation alert document schema</span>
            <pre class="mt-2 text-slate-400">
{
  id: "ALERT-8f9d0c",
  device_id: "TRUCK-001",
  geofence_id: "zone_warehouse_a",
  alert_type: "EXIT", // ENTRY | EXIT
  triggered_at: timestamp,
  lat: 17.3988,
  lng: 78.5538,
  priority: "high", // critical | high | medium | low
  is_read: false
}
            </pre>
          </div>
          <div class="space-y-3 text-xs">
            <h4 class="font-bold uppercase tracking-wider text-cyan-400">Log Attribute Logic</h4>
            <ul class="space-y-2 list-disc list-inside ${dark ? 'text-slate-300' : 'text-slate-600'}">
              <li><strong>priority</strong>: Checked dynamically based on device type (e.g. Personnel is 'critical', vehicle exits are 'high').</li>
              <li><strong>is_read</strong>: Default state is 'false'. Updated when dashboard admins acknowledge/read warnings.</li>
              <li><strong>triggered_at</strong>: Firestore ServerTimestamp ensures reliable logs.</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },

  // SECTION 3: Geofence Engine Calculations (Slides 11-15)
  {
    id: 11,
    title: "Geolocation Computation Models",
    section: "Calculations",
    subtitle: "Tracking calculations inside the server calculation engine",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Continuous Boundary Checks</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          The validation engine constantly checks incoming coordinates against boundaries. A geofence is defined as either a **circular sector** (radius-based distance) or a **polygonal sector** (custom drawn shapes).
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Circular calculations</span>
            <h4 class="text-sm font-bold mt-1">Haversine Great-Circle</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Calculates line-of-sight distance on a spherical Earth surface.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase">Polygonal calculations</span>
            <h4 class="text-sm font-bold mt-1">Ray-Casting Intersect</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Fires a horizontal ray from coordinate points and counts boundary edge intersects.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 12,
    title: "Circular Geofences: Haversine",
    section: "Calculations",
    subtitle: "Sphere distance calculations for circular boundaries",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Haversine Great-Circle Formula</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-4">
          To check if a device is within a circular fence, we compute the distance \(d\) between the device \((lat_1, lng_1)\) and the center point \((lat_2, lng_2)\) using:
        </p>
        
        <div class="p-4 my-4 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-cyan-400 text-xs md:text-sm">
          a = sin²(Δlat/2) + cos(lat₁) · cos(lat₂) · sin²(Δlng/2)<br>
          c = 2 · atan2(√a, √(1-a))<br>
          d = R · c (where R = 6,371,000 meters)
        </div>

        <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'} mt-2">
          If the calculated distance \(d \le radius\), the device status is cataloged as <strong>inside</strong>. Otherwise, it triggers a warning breach.
        </p>
      </div>
    `
  },
  {
    id: 13,
    title: "Polygonal Geofences: Ray Casting",
    section: "Calculations",
    subtitle: "Intersection checking for arbitrary polygonal zones",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Point-in-Polygon (PIP) Algorithm</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-4">
          For custom polygonal zones, the engine uses **Ray Casting**. A horizontal ray is projected from the device position:
        </p>
        
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-400 space-y-1.5 leading-snug">
          <div>1. Fire a horizontal ray from the coordinate (lat, lng) to the right (towards infinity).</div>
          <div>2. Trace the polygon edges and count how many times the ray intersects an edge.</div>
          <div>3. If the number of intersections is **odd**, the point is **inside** the polygon.</div>
          <div>4. If the number of intersections is **even**, the point is **outside** the polygon.</div>
        </div>

        <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-500'} mt-4">
          This ray casting method handles complex polygons, including concave boundaries and coordinate gaps.
        </p>
      </div>
    `
  },
  {
    id: 14,
    title: "Engine Code: Haversine JS",
    section: "Calculations",
    subtitle: "JavaScript source script for spherical coordinate checks",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Haversine Engine Script</h3>
        <div class="p-4.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
          <pre class="text-slate-400">
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}
          </pre>
        </div>
      </div>
    `
  },
  {
    id: 15,
    title: "Engine Code: Ray Casting JS",
    section: "Calculations",
    subtitle: "JavaScript source script for ray-casting calculations",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Point-in-Polygon (PIP) JavaScript</h3>
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[9px] text-slate-300 overflow-x-auto">
          <pre class="text-slate-400 font-semibold leading-tight">
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside; // returns true if inside
}
          </pre>
        </div>
      </div>
    `
  },

  // SECTION 4: Live Interactive Prototype Demo (Slides 16-19)
  {
    id: 16,
    title: "Dashboard Interface Tour",
    section: "Working Prototype",
    subtitle: "Visual components inside the React user panel",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-5 ${dark ? 'text-white' : 'text-slate-900'}">Control Panel Tour</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-sm font-bold text-cyan-400">1. Device Registry Tab</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} mt-1">Register new trackers with descriptions and specific notification contacts.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-sm font-bold text-cyan-400">2. Geofence Manager Tab</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} mt-1">Create circular and polygonal boundaries directly over Leaflet coordinates maps.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-sm font-bold text-cyan-400">3. Live Map Stream</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} mt-1">Render real-time marker animations and boundary intersections on open street layers.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-sm font-bold text-cyan-400">4. AI Violations Auditor</h4>
            <p class="text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} mt-1">Trigger server dispatches requesting summaries of daily violation logs.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 17,
    title: "Interactive Map Simulator",
    section: "Working Prototype",
    subtitle: "Live coordinate tracking simulator with audio warnings",
    render: (dark) => `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full max-w-6xl mx-auto px-4">
        <!-- Text details -->
        <div class="lg:col-span-5 flex flex-col justify-center space-y-4">
          <h3 class="text-xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Live Boundary Breach Simulator</h3>
          <p class="text-xs ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
            Test the real-time detection loops. Move the telemetry client inside or outside the safety boundaries and check warning reactions.
          </p>
          <div class="space-y-2 mt-2">
            <button onclick="window.simulator.move('inside')" class="w-full text-xs font-bold px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer">
              Move Device Inside Zone
            </button>
            <button onclick="window.simulator.move('outside')" class="w-full text-xs font-bold px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer">
              Breach Boundary (Move Outside)
            </button>
          </div>
          <div class="p-2.5 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-[10px] text-slate-500">
            <strong>Audio synthesizer:</strong> Sound dispatches use Web Audio API oscillators.
          </div>
        </div>

        <!-- Visual Widget -->
        <div class="lg:col-span-7 flex flex-col justify-between p-4.5 rounded-2xl border bg-slate-950 text-slate-100 border-slate-800 shadow-xl overflow-hidden min-h-[300px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Live Map visualizer
            </span>
            <span id="simStatusBadge" class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Inside Zone</span>
          </div>

          <!-- Canvas -->
          <div class="flex-1 my-3 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[140px]">
            <!-- Radar ring -->
            <div class="absolute w-36 h-36 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
              <span class="text-[8px] font-mono font-bold tracking-widest text-cyan-400/20 uppercase">Safe sector</span>
            </div>
            
            <!-- Vehicle marker -->
            <div id="simVehicle" class="absolute flex flex-col items-center z-10 transition-all duration-500 ease-out" style="left: calc(50% - 24px); top: calc(50% - 24px);">
              <div id="simVehicleBox" class="p-2 bg-cyan-500 border border-cyan-300 text-white rounded-lg shadow-lg">
                <i data-lucide="truck" class="w-4 h-4"></i>
              </div>
              <span class="text-[8px] font-mono font-bold mt-1 text-slate-400">TRUCK-001</span>
            </div>
          </div>

          <!-- Console logs -->
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-mono text-[9px] min-h-[60px] text-slate-300">
            <div id="simLogContainer" class="space-y-0.5">
              <div>&gt; Telemetry online. Device TRUCK-001 connected.</div>
              <div class="text-emerald-400">&gt; Coordinates inside safety boundary. Status clear.</div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 18,
    title: "Database Sync: React Hooks",
    section: "Working Prototype",
    subtitle: "Real-time subscriptions using Firebase onSnapshot hooks",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Subscribing to Location Feeds</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-4">
          To ensure coordinates updating on server databases propagate to dashboard monitors without page refreshes, we run Firestore query listeners inside React 'useEffect' hooks:
        </p>
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
          <pre class="text-slate-400 leading-tight">
useEffect(() => {
  const q = query(collection(db, "devices"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDevices(list); // Triggers React state updates instantly
  });
  return () => unsubscribe(); // Cleanup listener on unmount
}, []);
          </pre>
        </div>
      </div>
    `
  },
  {
    id: 19,
    title: "Edge Cases & Reliability",
    section: "Working Prototype",
    subtitle: "Architecting loops for tracking disruptions",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Solving tracking Gaps</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          Real-world geofencing projects must handle unpredictable environment conditions. The prototype implements fallback logic for tracking anomalies:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <div class="text-rose-500 font-bold mb-1.5 flex items-center gap-1.5"><i data-lucide="shield-alert" class="w-4 h-4"></i> Coordinate Jumps</div>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'}">Algorithms filter out noise jumps (GPS drift) by requiring multiple verification coordinates before alerts fire.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <div class="text-amber-500 font-bold mb-1.5 flex items-center gap-1.5"><i data-lucide="wifi-off" class="w-4 h-4"></i> Offline Logging</div>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'}">Clients stack coordinates in browser localStorage if signals drop, flushing logs to servers on reconnect.</p>
          </div>
          <div class="p-4 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <div class="text-emerald-500 font-bold mb-1.5 flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4"></i> Timeout Guards</div>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'}">Node servers flag devices as 'Offline' if update heartbeats stop for more than 40 seconds.</p>
          </div>
        </div>
      </div>
    `
  },

  // SECTION 5: Project Report & Documentation (Slides 20-22)
  {
    id: 20,
    title: "System Requirements Summary",
    section: "Report & Setup",
    subtitle: "System capabilities outlined in the project report",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Requirements Checklist</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-xl">
            <h4 class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">Functional Requirements</h4>
            <ul class="space-y-1.5 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}">
              <li>• Real-time coordinate sync via DB onSnapshot hooks.</li>
              <li>• Dynamic geofence shapes (circles, custom polygons).</li>
              <li>• Multi-tier warning dispatches (critical, high, medium).</li>
              <li>• Admin notification acknowledgment/reads log dashboard.</li>
            </ul>
          </div>
          <div class="p-4 ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-xl">
            <h4 class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">Non-Functional Requirements</h4>
            <ul class="space-y-1.5 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}">
              <li>• Alert transmission latency less than 1.5 seconds.</li>
              <li>• Low telemetry client payload sizes.</li>
              <li>• Responsive web layouts (mobiles, tablets, widescreen).</li>
              <li>• Zero configuration client-side codebases.</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 21,
    title: "Verification & Testing Plan",
    section: "Report & Setup",
    subtitle: "Validating geometric engines and delivery latency dispatches",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 space-y-4">
        <h3 class="text-xl md:text-2xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">System Validation</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
          Validation is split into geometric mathematical correctness, latency testings, and database load checks:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="p-4.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-xs font-bold text-cyan-400">1. Math Boundary Sweeps</h4>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Tests evaluated coordinate edges to verify Haversine math holds accurate down to 1-meter intervals.</p>
          </div>
          <div class="p-4.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-xs font-bold text-cyan-400">2. Latency Benchmarks</h4>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Measured duration from breach to email. Deliveries average 850ms over standard connections.</p>
          </div>
          <div class="p-4.5 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
            <h4 class="text-xs font-bold text-cyan-400">3. Scale Stress Checks</h4>
            <p class="text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'} mt-1">Simulated 100 concurrent mock tracking streams without triggering DB lag spikes or API limits.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 22,
    title: "Server Configuration & Setup",
    section: "Report & Setup",
    subtitle: "Setting up background service parameters",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">Backend Server .env Parameters</h3>
        <p class="text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-4">
          The calculation server loads environment variables to establish secure Firebase Admin connections and link to EmailJS templates:
        </p>
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300">
          <pre class="text-slate-400">
# geofence-backend/.env config shape
PORT=4000
FIREBASE_PROJECT_ID="geofence-alert-system-7780"
EMAILJS_SERVICE_ID="service_xey5zfs"
EMAILJS_TEMPLATE_ID="template_alert_violation"
EMAILJS_PUBLIC_KEY="pub_key_xyz123"
EMAILJS_PRIVATE_KEY="priv_key_abc456"
          </pre>
        </div>
      </div>
    `
  },

  // SECTION 6: Version Control, PPT, & Demo Video (Slides 23-25)
  {
    id: 23,
    title: "GitHub Repository Structure",
    section: "Deployment",
    subtitle: "Folder trees and layout structures in git repositories",
    render: (dark) => `
      <div class="max-w-4xl mx-auto px-4 flex flex-col justify-center h-full">
        <h3 class="text-xl md:text-2xl font-bold font-display mb-4 ${dark ? 'text-white' : 'text-slate-900'}">File Directories Map</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 leading-snug">
            <pre class="text-slate-400">
GeoFence_Alert_System/
├── geofence-backend/      # Express engine
│   ├── routes/            # REST API routes
│   ├── services/          # Haversine, PIP
│   ├── server.js          # Entry script
│   └── package.json
├── src/                   # React frontend
│   ├── pages/
│   ├── App.jsx            # Main dashboard shell
│   └── main.jsx
├── index.html
└── package.json           # Client packages
            </pre>
          </div>
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-cyan-400">Clean codebase isolation</h4>
            <p class="text-xs ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
              The project is split cleanly. The <strong>geofence-backend</strong> folder holds the Node services that query Firestore, keeping calculation scripts out of the client dashboard bundles.
            </p>
            <div class="p-2.5 ${dark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'} rounded border font-mono text-[10px]">
              GitHub repository URL:<br>
              <a href="https://github.com/srishanth7780/GeoFence_Alert_System" target="_blank" class="text-cyan-400 hover:underline">https://github.com/srishanth...</a>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 24,
    title: "CLI Terminal Installer Guide",
    section: "Deployment",
    subtitle: "Cloning repositories and executing packages installations",
    render: (dark) => `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full max-w-6xl mx-auto px-4">
        <!-- Descriptions -->
        <div class="lg:col-span-5 flex flex-col justify-center space-y-4">
          <h3 class="text-xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Interactive Setup Console</h3>
          <p class="text-xs ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
            Click the preset shortcuts below to emulate the bash setup commands inside the terminal console emulator on the right.
          </p>
          <div class="flex flex-wrap gap-2">
            <button onclick="window.terminal.run('git clone https://github.com/srishanth7780/GeoFence_Alert_System.git')" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono rounded border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors">1. Clone Repo</button>
            <button onclick="window.terminal.run('npm install')" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono rounded border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors">2. Install Dep</button>
            <button onclick="window.terminal.run('npm run dev')" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono rounded border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors">3. Start Client</button>
            <button onclick="window.terminal.run('npm start')" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono rounded border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors">4. Start Server</button>
          </div>
        </div>

        <!-- Terminal Widget -->
        <div class="lg:col-span-7 bg-black border border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xl overflow-hidden min-h-[300px]">
          <div class="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center justify-between text-slate-400">
            <span class="text-[9px] font-mono font-bold tracking-wider uppercase">Bash terminal console</span>
            <div class="flex gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
            </div>
          </div>
          <div id="termLogs" class="flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-2 min-h-[160px]">
            <div class="text-slate-600">// Press buttons to run commands. type 'help' for options.</div>
          </div>
          <form id="termForm" onsubmit="event.preventDefault(); window.terminal.submit();" class="bg-slate-950 border-t border-slate-900 p-2 flex items-center gap-2">
            <span class="font-mono text-cyan-400 font-bold pl-1">$</span>
            <input id="termInput" type="text" placeholder="Type npm install..." class="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none placeholder-slate-800">
          </form>
        </div>
      </div>
    `
  },
  {
    id: 25,
    title: "Demo Video & Dashboard Output",
    section: "Deployment",
    subtitle: "Simulated execution walkthrough showing dispatches",
    render: (dark) => `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full max-w-6xl mx-auto px-4">
        <!-- Left detail panel -->
        <div class="lg:col-span-5 flex flex-col justify-center space-y-4">
          <h3 class="text-xl font-bold font-display ${dark ? 'text-white' : 'text-slate-900'}">Demo Video Chapters</h3>
          <p class="text-xs ${dark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
            The video walkthrough demonstrates the complete pipeline in action. Click Play below to simulate the video stages.
          </p>

          <div class="flex gap-2">
            <button onclick="window.videoSim.toggle()" id="videoSimBtn" class="flex items-center gap-1.5 font-bold text-xs px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer">
              <i data-lucide="play" id="vidIcon" class="w-4 h-4"></i> <span id="vidText">Play Simulation</span>
            </button>
            <button onclick="window.videoSim.reset()" class="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Right Player Simulator widget -->
        <div class="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[300px]">
          <div class="flex-1 bg-slate-900 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 min-h-[160px]">
            <div class="flex justify-between items-center z-10">
              <span class="text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded text-slate-400">Walkthrough Clip</span>
              <span id="vidStatus" class="text-[9px] font-mono text-slate-500">PAUSED</span>
            </div>

            <!-- Content screen -->
            <div class="my-auto text-center z-10 py-2">
              <div id="vidGraphic" class="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-2">
                <i data-lucide="layers" class="w-8 h-8"></i>
              </div>
              <h4 id="vidChapterTitle" class="text-xs font-bold text-white uppercase tracking-wider">Chapter 1: Setup</h4>
              <p id="vidChapterDesc" class="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                Setting up environment values and establishing DB real-time Firestore connections.
              </p>
            </div>

            <!-- Progress bar -->
            <div class="space-y-1.5 z-10">
              <div class="flex justify-between text-[8px] font-mono text-slate-500">
                <span id="vidChapterTime">0:00 - 0:45</span>
                <span>Total: 3:30</span>
              </div>
              <div class="h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <div id="vidProgressLine" class="absolute left-0 top-0 bottom-0 bg-amber-500 transition-all duration-300" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Tabs chapters list -->
          <div class="mt-4 border-t border-slate-900 pt-2 grid grid-cols-5 gap-1 text-[8px] font-mono text-center">
            <div id="vch0" class="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">Setup</div>
            <div id="vch1" class="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">Register</div>
            <div id="vch2" class="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">Fences</div>
            <div id="vch3" class="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">Breach</div>
            <div id="vch4" class="p-1 rounded bg-slate-900 border border-slate-800 text-slate-500">EmailJS</div>
          </div>
        </div>
      </div>
    `
  }
];

// App State Management
let currentSlideIndex = 0;
let autoplayTimer = null;
let isAutoplayActive = false;
let isSidebarCollapsed = false;

// DOM Selectors
const slideContentStage = document.getElementById("slideContentStage");
const slideNavList = document.getElementById("slideNavList");
const progressDots = document.getElementById("progressDots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const playText = document.getElementById("playText");
const currentSlideNum = document.getElementById("currentSlideNum");
const totalSlidesCount = document.getElementById("totalSlidesCount");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const fullscreenIcon = document.getElementById("fullscreenIcon");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarToggleIcon = document.getElementById("sidebarToggleIcon");
const printStage = document.getElementById("printStage");

// Render Sidebar Navigation
const buildSidebarNav = () => {
  slideNavList.innerHTML = "";
  
  // Group slides by section
  let currentSec = "";
  slides.forEach((slide, idx) => {
    if (slide.section !== currentSec) {
      currentSec = slide.section;
      const header = document.createElement("div");
      header.className = "text-[8px] font-mono font-bold tracking-widest text-slate-500 dark:text-slate-600 uppercase pt-3 pb-1 px-2.5 select-none";
      header.textContent = currentSec;
      slideNavList.appendChild(header);
    }
    
    const btn = document.createElement("button");
    btn.className = `w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between border cursor-pointer select-none ${
      idx === currentSlideIndex
        ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60"
    }`;
    btn.innerHTML = `
      <span class="truncate pr-1">${idx + 1}. ${slide.title}</span>
      <span class="text-[8px] font-mono text-slate-500">${slide.id}</span>
    `;
    btn.onclick = () => navigateToSlide(idx);
    slideNavList.appendChild(btn);
  });
};

// Render Bottom Progress Dots
const buildProgressDots = () => {
  progressDots.innerHTML = "";
  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.className = `w-2 h-2 rounded-full transition-all cursor-pointer ${
      idx === currentSlideIndex
        ? "bg-cyan-500 scale-125 shadow-sm shadow-cyan-500/50"
        : "bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700"
    }`;
    dot.title = `Go to Slide ${idx + 1}`;
    dot.onclick = () => navigateToSlide(idx);
    progressDots.appendChild(dot);
  });
};

// Render Active Slide content
const renderActiveSlide = () => {
  const isDark = document.documentElement.classList.contains("dark");
  const slide = slides[currentSlideIndex];
  
  // Transition fade out
  slideContentStage.style.opacity = 0;
  
  setTimeout(() => {
    // Inject rendered slide content
    slideContentStage.innerHTML = `
      <div class="animate-fade-in flex flex-col justify-between h-full min-h-[350px]">
        <!-- Title bar -->
        <div class="border-b border-slate-900 dark:border-slate-850 pb-3 mb-4 select-none">
          <span class="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase">${slide.section}</span>
          <h2 class="text-xl md:text-3xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-900'}">${slide.title}</h2>
          <p class="text-xs text-slate-500 font-medium">${slide.subtitle}</p>
        </div>
        <!-- Center contents -->
        <div class="flex-1 flex flex-col justify-center py-2">
          ${slide.render(isDark)}
        </div>
      </div>
    `;
    
    // Trigger Lucide icons reload
    lucide.createIcons();
    
    // Bind active slide special interactive widgets
    bindActiveSlideWidgets();
    
    // Transition fade in
    slideContentStage.style.opacity = 1;
  }, 150);
  
  // Update state indexes
  currentSlideNum.textContent = currentSlideIndex + 1;
  prevBtn.disabled = currentSlideIndex === 0;
  nextBtn.disabled = currentSlideIndex === slides.length - 1;
  
  // Re-build navigation styles
  buildSidebarNav();
  buildProgressDots();
};

// Navigate to specific index
const navigateToSlide = (idx) => {
  if (idx >= 0 && idx < slides.length) {
    currentSlideIndex = idx;
    renderActiveSlide();
  }
};

// Autoplay loop controls
const toggleAutoplay = () => {
  if (isAutoplayActive) {
    // Pause
    clearInterval(autoplayTimer);
    isAutoplayActive = false;
    playIcon.setAttribute("data-lucide", "play");
    playText.textContent = "Autoplay";
  } else {
    // Play
    isAutoplayActive = true;
    playIcon.setAttribute("data-lucide", "pause");
    playText.textContent = "Pause";
    autoplayTimer = setInterval(() => {
      if (currentSlideIndex < slides.length - 1) {
        navigateToSlide(currentSlideIndex + 1);
      } else {
        // Loop back to start
        navigateToSlide(0);
      }
    }, 4500);
  }
  lucide.createIcons();
};

// Sidebar collapse toggle
const toggleSidebar = () => {
  isSidebarCollapsed = !isSidebarCollapsed;
  if (isSidebarCollapsed) {
    sidebar.style.width = "0px";
    sidebarToggle.style.left = "0px";
    sidebarToggleIcon.setAttribute("data-lucide", "chevron-right");
  } else {
    sidebar.style.width = "256px"; // 64rem
    sidebarToggle.style.left = "256px";
    sidebarToggleIcon.setAttribute("data-lucide", "chevron-left");
  }
  lucide.createIcons();
};

// Theme toggle class updates
const toggleTheme = () => {
  const html = document.documentElement;
  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    themeIcon.setAttribute("data-lucide", "moon");
  } else {
    html.classList.add("dark");
    themeIcon.setAttribute("data-lucide", "sun");
  }
  lucide.createIcons();
  renderActiveSlide(); // Re-render content colors
};

// Fullscreen API toggle
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      fullscreenIcon.setAttribute("data-lucide", "minimize");
    }).catch(err => {
      console.error("Fullscreen error", err);
    });
  } else {
    document.exitFullscreen();
    fullscreenIcon.setAttribute("data-lucide", "maximize");
  }
  lucide.createIcons();
};

// Sync fullscreen button on escape keys
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenIcon.setAttribute("data-lucide", "maximize");
  } else {
    fullscreenIcon.setAttribute("data-lucide", "minimize");
  }
  lucide.createIcons();
});

// Compile HTML print sheets statically
const compilePrintSheets = () => {
  printStage.innerHTML = "";
  slides.forEach((slide) => {
    const page = document.createElement("div");
    page.className = "print-slide-page";
    page.innerHTML = `
      <div>
        <span style="font-size: 8pt; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #64748b;">${slide.section}</span>
        <h2>${slide.title}</h2>
        <h4 style="font-size: 11pt; color: #475569; margin-top: -6pt; margin-bottom: 20pt; font-weight: 500;">${slide.subtitle}</h4>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        ${slide.render(false)}
      </div>
      <div style="margin-top: 20pt; font-size: 8pt; font-family: monospace; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 8pt; display: flex; justify-content: space-between;">
        <span>GeoFence Alert System Presentation</span>
        <span>Slide ${slide.id} of ${slides.length}</span>
      </div>
    `;
    printStage.appendChild(page);
  });
};

// Print dispatches
const triggerPdfPrint = () => {
  compilePrintSheets();
  // Brief delay to allow print DOM node creation
  setTimeout(() => {
    window.print();
  }, 100);
};

// Keyboard inputs mapper
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    if (currentSlideIndex < slides.length - 1) {
      navigateToSlide(currentSlideIndex + 1);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (currentSlideIndex > 0) {
      navigateToSlide(currentSlideIndex - 1);
    }
  } else if (e.key === "f" || e.key === "F") {
    e.preventDefault();
    toggleFullscreen();
  }
});

// Event registrations
prevBtn.onclick = () => navigateToSlide(currentSlideIndex - 1);
nextBtn.onclick = () => navigateToSlide(currentSlideIndex + 1);
playBtn.onclick = toggleAutoplay;
sidebarToggle.onclick = toggleSidebar;
themeToggle.onclick = toggleTheme;
fullscreenToggle.onclick = toggleFullscreen;
exportPdfBtn.onclick = triggerPdfPrint;

// ----------------------------------------------------
// DYNAMIC SLIDE WIDGETS CALCULATORS
// ----------------------------------------------------

// Slide 17: Map Simulator namespace
window.simulator = {
  move: (state) => {
    const v = document.getElementById("simVehicle");
    const vBox = document.getElementById("simVehicleBox");
    const badge = document.getElementById("simStatusBadge");
    const logs = document.getElementById("simLogContainer");
    
    if (!v) return;
    
    if (state === "outside") {
      // Move vehicle offset outside circle
      v.style.transform = "translate(110px, 40px)";
      vBox.className = "p-2 bg-rose-500 border border-rose-350 text-white rounded-lg shadow-lg animate-bounce";
      badge.textContent = "Outside Zone";
      badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse";
      
      playAlertSound("exit");
      
      logs.innerHTML = `
        <div class="text-rose-400">&gt; ⚠️ TRUCK-001 EXITED Safe Zone! Breach detected.</div>
        <div class="text-amber-400">&gt; 📧 EmailJS Dispatcher triggered alert notification email.</div>
      `;
    } else {
      // Center vehicle inside
      v.style.transform = "translate(0px, 0px)";
      vBox.className = "p-2 bg-cyan-500 border border-cyan-300 text-white rounded-lg shadow-lg";
      badge.textContent = "Inside Zone";
      badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
      
      playAlertSound("entry");
      
      logs.innerHTML = `
        <div class="text-emerald-400">&gt; ✅ TRUCK-001 ENTERED Safe Zone. Status safe.</div>
        <div class="text-slate-400">&gt; Location logs synced to Cloud Firestore database.</div>
      `;
    }
    lucide.createIcons();
  }
};

// Slide 24: Command line terminal namespace
window.terminal = {
  commandsHistory: [],
  run: (cmdText) => {
    const logs = document.getElementById("termLogs");
    if (!logs) return;
    
    let outputs = [];
    const lower = cmdText.trim().toLowerCase();
    
    if (lower.startsWith("git clone")) {
      outputs = [
        "Cloning into 'GeoFence_Alert_System'...",
        "remote: Enumerating objects: 104, done.",
        "remote: Counting objects: 100% (104/104), done.",
        "remote: Compressing objects: 100% (82/82), done.",
        "Receiving objects: 100% (104/104), 482.10 KiB | 2.10 MiB/s, done.",
        "Resolving deltas: 100% (52/52), done."
      ];
    } else if (lower === "npm install") {
      outputs = [
        "added 358 packages, and audited 359 packages in 3.8s",
        "found 0 vulnerabilities",
        "Installed dependencies: firebase, framer-motion, @emailjs/browser, recharts, lucide-react"
      ];
    } else if (lower === "npm run dev") {
      outputs = [
        "  VITE v8.0.12  ready in 218 ms",
        "  ➜  Local:   http://localhost:5173/",
        "  ➜  Network: use --host to expose"
      ];
    } else if (lower === "npm start" || lower === "node server.js") {
      outputs = [
        "[Database] Connected to Firestore database...",
        "[Email Service] Verification: ACTIVE",
        "[Geofence Engine] Dynamic Haversine calculations online.",
        "[Server] REST API listening on port 4000 (http://localhost:4000)"
      ];
    } else if (lower === "help") {
      outputs = [
        "Available commands:",
        "  git clone https://github.com/srishanth7780/GeoFence_Alert_System.git",
        "  npm install     - Install codebase packages dependencies",
        "  npm run dev     - Starts local Vite client UI dashboard",
        "  npm start       - Starts local backend calculation engine server",
        "  clear           - Clears terminal output logs history"
      ];
    } else if (lower === "clear") {
      logs.innerHTML = "";
      return;
    } else {
      outputs = [`Command not found: ${cmdText}. Type 'help' for suggestions.`];
    }
    
    // Append to logs DOM
    const block = document.createElement("div");
    block.className = "space-y-1 mt-2.5";
    block.innerHTML = `
      <div class="text-cyan-400 font-bold">$ ${cmdText}</div>
      <div class="text-slate-400 pl-3 border-l border-slate-900 whitespace-pre-wrap">${outputs.join("<br>")}</div>
    `;
    logs.appendChild(block);
    logs.scrollTop = logs.scrollHeight;
  },
  submit: () => {
    const input = document.getElementById("termInput");
    if (input && input.value.trim()) {
      window.terminal.run(input.value);
      input.value = "";
    }
  }
};

// Slide 25: Video walkthrough simulation namespace
let videoSimTimer = null;
let isVideoSimPlaying = false;
let videoProgressPercent = 0;
let currentChapterIdx = 0;

const videoChapters = [
  { title: "Chapter 1: Setup", desc: "Setting up environment values and establishing DB real-time Firestore connections.", time: "0:00 - 0:45", icon: "layers" },
  { title: "Chapter 2: Registry", desc: "Adding new tracking assets (Vehicles/Personnel) with specific client contact emails.", time: "0:45 - 1:20", icon: "user-plus" },
  { title: "Chapter 3: Fences", desc: "Drawing circular and polygonal fences on Leaflet maps; setting warning center coordinates.", time: "1:20 - 2:05", icon: "map-pin" },
  { title: "Chapter 4: Breach", desc: "Mocking tracking telemetry signals outside boundaries; triggering beep alarm alerts.", time: "2:05 - 2:45", icon: "alert-triangle" },
  { title: "Chapter 5: EmailJS Delivery", desc: "Verifying immediate EmailJS automated notifications dispatch to client inbox.", time: "2:45 - 3:30", icon: "mail" }
];

window.videoSim = {
  toggle: () => {
    const btn = document.getElementById("videoSimBtn");
    const vidText = document.getElementById("vidText");
    const vidIcon = document.getElementById("vidIcon");
    const status = document.getElementById("vidStatus");
    
    if (isVideoSimPlaying) {
      // Pause
      clearInterval(videoSimTimer);
      isVideoSimPlaying = false;
      status.textContent = "PAUSED";
      status.className = "text-[9px] font-mono text-slate-500";
      vidText.textContent = "Play Simulation";
      vidIcon.setAttribute("data-lucide", "play");
    } else {
      // Play
      isVideoSimPlaying = true;
      status.textContent = "PLAYING SIMULATION";
      status.className = "text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse";
      vidText.textContent = "Pause Simulation";
      vidIcon.setAttribute("data-lucide", "pause");
      
      videoSimTimer = setInterval(() => {
        videoProgressPercent += 2.5;
        if (videoProgressPercent >= 100) {
          clearInterval(videoSimTimer);
          isVideoSimPlaying = false;
          status.textContent = "FINISHED";
          status.className = "text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20";
          vidText.textContent = "Play Simulation";
          vidIcon.setAttribute("data-lucide", "play");
          videoProgressPercent = 100;
        }
        
        // Sync timeline chapter index
        const chapIdx = Math.min(Math.floor(videoProgressPercent / 20), videoChapters.length - 1);
        if (chapIdx !== currentChapterIdx) {
          currentChapterIdx = chapIdx;
          window.videoSim.syncChapter();
        }
        
        const line = document.getElementById("vidProgressLine");
        if (line) line.style.width = `${videoProgressPercent}%`;
        
      }, 350);
    }
    lucide.createIcons();
  },
  reset: () => {
    clearInterval(videoSimTimer);
    isVideoSimPlaying = false;
    videoProgressPercent = 0;
    currentChapterIdx = 0;
    
    const btn = document.getElementById("videoSimBtn");
    const vidText = document.getElementById("vidText");
    const vidIcon = document.getElementById("vidIcon");
    const status = document.getElementById("vidStatus");
    const line = document.getElementById("vidProgressLine");
    
    if (status) {
      status.textContent = "PAUSED";
      status.className = "text-[9px] font-mono text-slate-500";
    }
    if (vidText) vidText.textContent = "Play Simulation";
    if (vidIcon) vidIcon.setAttribute("data-lucide", "play");
    if (line) line.style.width = "0%";
    
    window.videoSim.syncChapter();
    lucide.createIcons();
  },
  syncChapter: () => {
    const title = document.getElementById("vidChapterTitle");
    const desc = document.getElementById("vidChapterDesc");
    const time = document.getElementById("vidChapterTime");
    const graphic = document.getElementById("vidGraphic");
    
    if (!title) return;
    
    const chapter = videoChapters[currentChapterIdx];
    title.textContent = chapter.title;
    desc.textContent = chapter.desc;
    time.textContent = chapter.time;
    graphic.innerHTML = `<i data-lucide="${chapter.icon}" class="w-8 h-8"></i>`;
    
    // Highlight chapter tabs
    for (let i = 0; i < 5; i++) {
      const tab = document.getElementById(`vch${i}`);
      if (tab) {
        if (i === currentChapterIdx) {
          tab.className = "p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold";
        } else {
          tab.className = "p-1 rounded bg-slate-900 border border-slate-800 text-slate-500";
        }
      }
    }
    lucide.createIcons();
  }
};

// Bind widgets upon slide render
const bindActiveSlideWidgets = () => {
  // Check if current slide is Slide 17 (Simulator)
  if (currentSlideIndex === 16) {
    // Reset simulated vehicle position on load
    setTimeout(() => {
      const v = document.getElementById("simVehicle");
      if (v) v.style.transform = "translate(0px, 0px)";
    }, 50);
  }
  
  // Check if current slide is Slide 24 (Terminal)
  if (currentSlideIndex === 23) {
    // Clear console output logs
    const logs = document.getElementById("termLogs");
    if (logs) logs.innerHTML = `<div class="text-slate-600">// Click shortcuts or type git clone to start. type 'help' for options.</div>`;
  }
  
  // Check if current slide is Slide 25 (Video)
  if (currentSlideIndex === 24) {
    // Reset video sim states
    window.videoSim.reset();
  }
};

// Initial App Startup trigger
buildSidebarNav();
buildProgressDots();
totalSlidesCount.textContent = slides.length;
renderActiveSlide();
lucide.createIcons();
