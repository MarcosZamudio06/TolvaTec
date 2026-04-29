
'use strict';


const AppState = {
  machineStatus: 'APAGADA', // APAGADA | OPERANDO | PAUSADA | ERROR
  startTime: null,
  uptimeInterval: null,
  totalProcessed: 0,
  sessionProcessed: 0,
  currentSection: 'dashboard',
  charts: {},
  sensorIntervals: [],
  actuadores: {
    M1: { on: false, rpm: 0 },
    M2: { on: false, activity: 0 },
    M3: { on: false, activity: 0 }
  }
};


const SENSORS = [
  {
    id: 1, name: 'Sensor IR Entrada', short: 'IR',
    icon: 'fa-eye', color: '#22c55e', colorBg: 'rgba(34,197,94,0.12)',
    colorBorder: 'rgba(34,197,94,0.3)',
    unit: '', type: 'digital',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (Math.random() > 0.3 ? 'DETECTADO' : 'LIBRE') : 'LIBRE',
    getStatus: (v) => v === 'DETECTADO' ? 'ACTIVO' : 'ESPERANDO'
  },
  {
    id: 2, name: 'Ultrasonido Tamaño', short: 'US',
    icon: 'fa-ruler', color: '#3b82f6', colorBg: 'rgba(59,130,246,0.12)',
    colorBorder: 'rgba(59,130,246,0.3)',
    unit: 'cm', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (8 + Math.random() * 12).toFixed(1) : '0.0',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'INACTIVO'
  },
  {
    id: 3, name: 'Peso Inicial', short: 'PI',
    icon: 'fa-weight-hanging', color: '#a855f7', colorBg: 'rgba(168,85,247,0.12)',
    colorBorder: 'rgba(168,85,247,0.3)',
    unit: 'kg', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (0.05 + Math.random() * 0.25).toFixed(3) : '0.000',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'INACTIVO'
  },
  {
    id: 4, name: 'Sensor Banda', short: 'SB',
    icon: 'fa-arrows-alt-h', color: '#06b6d4', colorBg: 'rgba(6,182,212,0.12)',
    colorBorder: 'rgba(6,182,212,0.3)',
    unit: 'm/s', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (0.4 + Math.random() * 0.4).toFixed(2) : '0.00',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'INACTIVO'
  },
  {
    id: 5, name: 'Sensor Est. Llenado', short: 'EL',
    icon: 'fa-fill-drip', color: '#22c55e', colorBg: 'rgba(34,197,94,0.12)',
    colorBorder: 'rgba(34,197,94,0.3)',
    unit: '', type: 'digital',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (Math.random() > 0.4 ? 'LLENANDO' : 'LIBRE') : 'LIBRE',
    getStatus: (v) => v === 'LLENANDO' ? 'ACTIVO' : 'ESPERANDO'
  },
  {
    id: 6, name: 'Encoder Velocidad', short: 'EC',
    icon: 'fa-tachometer-alt', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.12)',
    colorBorder: 'rgba(245,158,11,0.3)',
    unit: 'RPM', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (55 + Math.random() * 10).toFixed(0) : '0',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'DETENIDO'
  },
  {
    id: 7, name: 'Peso Final', short: 'PF',
    icon: 'fa-balance-scale', color: '#a855f7', colorBg: 'rgba(168,85,247,0.12)',
    colorBorder: 'rgba(168,85,247,0.3)',
    unit: 'kg', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (1.35 + Math.random() * 0.3).toFixed(3) : '0.000',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'INACTIVO'
  },
  {
    id: 8, name: 'Nivel Tolva', short: 'NT',
    icon: 'fa-database', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.12)',
    colorBorder: 'rgba(245,158,11,0.3)',
    unit: '%', type: 'analog',
    getValue: () => {
      const base = 72 - (AppState.sessionProcessed * 0.3);
      return Math.max(5, base + (Math.random() * 2 - 1)).toFixed(1);
    },
    getStatus: (v) => parseFloat(v) < 20 ? 'BAJO' : 'NORMAL'
  },
  {
    id: 9, name: 'Final de Carrera', short: 'FC',
    icon: 'fa-stop-circle', color: '#ef4444', colorBg: 'rgba(239,68,68,0.12)',
    colorBorder: 'rgba(239,68,68,0.3)',
    unit: '', type: 'digital',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (Math.random() > 0.85 ? 'ACTIVADO' : 'LIBRE') : 'LIBRE',
    getStatus: (v) => v === 'ACTIVADO' ? 'ACTIVADO' : 'LIBRE'
  },
  {
    id: 10, name: 'Vibración / Atascos', short: 'VB',
    icon: 'fa-exclamation-triangle', color: '#ef4444', colorBg: 'rgba(239,68,68,0.12)',
    colorBorder: 'rgba(239,68,68,0.3)',
    unit: 'g', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (0.02 + Math.random() * 0.15).toFixed(3) : '0.000',
    getStatus: (v) => parseFloat(v) > 0.12 ? '¡ATASCO!' : 'NORMAL'
  },
  {
    id: 11, name: 'Voltaje', short: 'V',
    icon: 'fa-bolt', color: '#eab308', colorBg: 'rgba(234,179,8,0.12)',
    colorBorder: 'rgba(234,179,8,0.3)',
    unit: 'V', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (218 + Math.random() * 6).toFixed(1) : '0.0',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'SIN ENERGÍA'
  },
  {
    id: 12, name: 'Corriente', short: 'I',
    icon: 'fa-wave-square', color: '#3b82f6', colorBg: 'rgba(59,130,246,0.12)',
    colorBorder: 'rgba(59,130,246,0.3)',
    unit: 'A', type: 'analog',
    getValue: () => AppState.machineStatus === 'OPERANDO' ? (3.8 + Math.random() * 1.2).toFixed(2) : '0.00',
    getStatus: () => AppState.machineStatus === 'OPERANDO' ? 'ACTIVO' : 'INACTIVO'
  }
];


const ACTUADORES_DEF = [
  {
    id: 'M1', name: 'Banda Transportadora', desc: 'Motor principal de tracción',
    icon: 'fa-arrows-alt-h', color: '#3b82f6',
    getMetric: () => AppState.actuadores.M1.on ? `${(55 + Math.random() * 10).toFixed(0)} RPM` : '0 RPM',
    metricLabel: 'Velocidad'
  },
  {
    id: 'M2', name: 'Empujador', desc: 'Pistón neumático de posicionamiento',
    icon: 'fa-arrows-left-right', color: '#f59e0b',
    getMetric: () => AppState.actuadores.M2.on ? `${(Math.random() * 100).toFixed(0)}%` : '0%',
    metricLabel: 'Ciclos/min'
  },
  {
    id: 'M3', name: 'Compuerta Tolva', desc: 'Servo de apertura de dosificación',
    icon: 'fa-door-open', color: '#22c55e',
    getMetric: () => AppState.actuadores.M3.on ? `${(30 + Math.random() * 70).toFixed(0)}°` : '0°',
    metricLabel: 'Apertura'
  }
];


const PROCESS_STEPS = [
  { id: 1, name: 'Detección', icon: 'fa-eye', desc: 'Sensor IR detecta objeto en entrada de banda' },
  { id: 2, name: 'Medición', icon: 'fa-ruler', desc: 'Ultrasonido mide dimensiones del recipiente' },
  { id: 3, name: 'Empuje', icon: 'fa-arrows-left-right', desc: 'Motor M2 posiciona el recipiente' },
  { id: 4, name: 'Transporte', icon: 'fa-conveyor-belt', desc: 'Banda conduce hacia estación de llenado' },
  { id: 5, name: 'Llenado', icon: 'fa-fill-drip', desc: 'Compuerta tolva dosifica material exacto' },
  { id: 6, name: 'Verificación', icon: 'fa-check-double', desc: 'Celda de carga valida peso final' },
  { id: 7, name: 'Salida', icon: 'fa-sign-out-alt', desc: 'Final de carrera libera producto terminado' }
];


const ALERTS_DATA = [
  {
    id: 1, type: 'warning', title: 'Nivel de Tolva Bajo',
    msg: 'El nivel de material en la tolva ha descendido por debajo del 20%. Se recomienda recargar.',
    time: 'Hace 3 min', color: '#f59e0b', borderColor: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)', icon: 'fa-database'
  },
  {
    id: 2, type: 'error', title: 'Sobrecarga Detectada en M1',
    msg: 'El motor M1 registró una corriente superior a 5.5A durante 3 segundos.',
    time: 'Hace 8 min', color: '#ef4444', borderColor: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)', icon: 'fa-bolt'
  },
  {
    id: 3, type: 'error', title: 'Atasco en Banda',
    msg: 'Sensor de vibración detectó patrón anómalo. Posible obstrucción en sección central.',
    time: 'Hace 12 min', color: '#ef4444', borderColor: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)', icon: 'fa-exclamation-triangle'
  },
  {
    id: 4, type: 'warning', title: 'Sensor S10 Desconectado',
    msg: 'Sin comunicación con el sensor de vibración S10 en los últimos 5 minutos.',
    time: 'Hace 15 min', color: '#f59e0b', borderColor: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)', icon: 'fa-microchip'
  },
  {
    id: 5, type: 'info', title: 'Consumo Eléctrico Elevado',
    msg: 'Potencia consumida supera el umbral de 900W. Verificar condiciones de carga.',
    time: 'Hace 22 min', color: '#3b82f6', borderColor: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.08)', icon: 'fa-bolt'
  }
];


function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('dateDisplay');
  if (clockEl) clockEl.textContent = timeStr;
  if (dateEl) dateEl.textContent = dateStr.toUpperCase();
}


function showSection(sectionName, navEl) {
  // Hide all sections
  document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
  // Show target
  const target = document.getElementById(`section-${sectionName}`);
  if (target) target.classList.add('active');

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
  } else {
    // Find by data-section
    const match = document.querySelector(`[data-section="${sectionName}"]`);
    if (match) match.classList.add('active');
  }

  AppState.currentSection = sectionName;

  // Init charts on demand
  if (sectionName === 'produccion') initProductionCharts();
  if (sectionName === 'energia') initEnergyCharts();

  return false;
}


function setMachineState(newState) {
  const prev = AppState.machineStatus;
  AppState.machineStatus = newState;
  updateStatusBadge(newState);
  updateBandVisual(newState);

  // Update actuadores with machine
  if (newState === 'OPERANDO') {
    AppState.actuadores.M1.on = true;
    AppState.actuadores.M2.on = true;
    AppState.actuadores.M3.on = true;
    if (!AppState.startTime) AppState.startTime = Date.now();
    startUptimeCounter();
    showToast('success', 'Sistema iniciado', 'La banda transportadora está operando correctamente.');
  } else if (newState === 'APAGADA') {
    AppState.actuadores.M1.on = false;
    AppState.actuadores.M2.on = false;
    AppState.actuadores.M3.on = false;
    AppState.startTime = null;
    stopUptimeCounter();
    showToast('info', 'Sistema apagado', 'Todos los actuadores han sido detenidos.');
  } else if (newState === 'PAUSADA') {
    AppState.actuadores.M1.on = false;
    AppState.actuadores.M2.on = false;
    AppState.actuadores.M3.on = false;
    stopUptimeCounter();
    showToast('warning', 'Pausa de emergencia', 'El sistema ha sido detenido de emergencia.');
  }

  refreshActuadores();
  updateKPIs();
}

function updateStatusBadge(status) {
  const badge = document.getElementById('systemStatusBadge');
  const text = document.getElementById('statusText');
  if (!badge || !text) return;

  badge.className = 'status-badge';
  const map = {
    'APAGADA': 'status-off',
    'OPERANDO': 'status-on',
    'PAUSADA': 'status-pause',
    'ERROR': 'status-error'
  };
  badge.classList.add(map[status] || 'status-off');
  text.textContent = status;
}

function updateBandVisual(status) {
  const belt = document.getElementById('bandBelt');
  const label = document.getElementById('bandStatusLabel');
  if (belt) {
    if (status === 'OPERANDO') {
      belt.classList.add('running');
    } else {
      belt.classList.remove('running');
    }
  }
  if (label) {
    const map = { 'OPERANDO': 'EN MARCHA', 'PAUSADA': 'PAUSADA', 'APAGADA': 'DETENIDA', 'ERROR': 'ERROR' };
    label.textContent = map[status] || 'DETENIDA';
    label.className = 'text-xs font-bold';
    const colorMap = { 'OPERANDO': 'text-green-400', 'PAUSADA': 'text-yellow-400', 'ERROR': 'text-red-400' };
    label.classList.add(colorMap[status] || 'text-gray-500');
  }
}


function startUptimeCounter() {
  stopUptimeCounter();
  AppState.uptimeInterval = setInterval(() => {
    if (AppState.startTime) {
      const elapsed = Date.now() - AppState.startTime;
      const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      const el = document.getElementById('uptime');
      if (el) el.textContent = `${h}:${m}:${s}`;
    }
  }, 1000);
}

function stopUptimeCounter() {
  if (AppState.uptimeInterval) {
    clearInterval(AppState.uptimeInterval);
    AppState.uptimeInterval = null;
  }
}


function renderSensors() {
  const grid = document.getElementById('sensorsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  SENSORS.forEach(sensor => {
    const val = sensor.getValue();
    const status = sensor.getStatus(val);
    const isActive = AppState.machineStatus === 'OPERANDO';
    const isWarning = status === 'BAJO' || status === '¡ATASCO!' || status === 'ACTIVADO';

    const card = document.createElement('div');
    card.className = 'sensor-card';
    card.id = `sensorCard-${sensor.id}`;
    card.style.cssText = `--sensor-color: ${isWarning ? '#ef4444' : sensor.color}; --sensor-border: ${isWarning ? 'rgba(239,68,68,0.35)' : sensor.colorBorder}`;

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: ${sensor.colorBg}; color: ${sensor.color}">
            <i class="fas ${sensor.icon}"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-300">${sensor.name}</p>
            <p class="text-xs text-gray-600 font-mono">S${sensor.id.toString().padStart(2,'0')}</p>
          </div>
        </div>
        <div class="sensor-led" style="background: ${isActive ? sensor.color : '#374151'}; color: ${sensor.color}; ${isActive ? 'animation: sensor-pulse 2s infinite;' : ''}"></div>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <p class="sensor-value" style="color: ${isWarning ? '#ef4444' : sensor.color}">${val}${sensor.unit ? ` <span class="text-xs text-gray-500">${sensor.unit}</span>` : ''}</p>
          <span class="sensor-status" style="background: ${isWarning ? 'rgba(239,68,68,0.15)' : (isActive ? sensor.colorBg : 'rgba(55,65,81,0.5)')}; color: ${isWarning ? '#ef4444' : (isActive ? sensor.color : '#6b7280')}">${status}</span>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-600 font-mono">${sensor.type === 'digital' ? 'DIGITAL' : 'ANALÓGICO'}</p>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateSensorValues() {
  SENSORS.forEach(sensor => {
    const card = document.getElementById(`sensorCard-${sensor.id}`);
    if (!card) return;
    const val = sensor.getValue();
    const status = sensor.getStatus(val);
    const isActive = AppState.machineStatus === 'OPERANDO';
    const isWarning = status === 'BAJO' || status === '¡ATASCO!' || status === 'ACTIVADO';

    const valEl = card.querySelector('.sensor-value');
    const statEl = card.querySelector('.sensor-status');
    const ledEl = card.querySelector('.sensor-led');

    if (valEl) valEl.innerHTML = `${val}${sensor.unit ? ` <span class="text-xs text-gray-500">${sensor.unit}</span>` : ''}`;
    if (statEl) {
      statEl.textContent = status;
      statEl.style.color = isWarning ? '#ef4444' : (isActive ? sensor.color : '#6b7280');
      statEl.style.background = isWarning ? 'rgba(239,68,68,0.15)' : (isActive ? sensor.colorBg : 'rgba(55,65,81,0.5)');
    }
    if (ledEl) {
      ledEl.style.background = isActive ? sensor.color : '#374151';
    }
  });
  updateQuickSensors();
}


function renderQuickSensors() {
  const container = document.getElementById('quickSensors');
  if (!container) return;
  const quickIds = [1, 6, 7, 8, 11, 12];
  container.innerHTML = '';
  quickIds.forEach(id => {
    const sensor = SENSORS.find(s => s.id === id);
    if (!sensor) return;
    const val = sensor.getValue();
    const div = document.createElement('div');
    div.className = 'quick-sensor';
    div.id = `quickSensor-${id}`;
    div.innerHTML = `
      <div class="flex items-center gap-2 mb-1">
        <i class="fas ${sensor.icon} text-xs" style="color: ${sensor.color}"></i>
        <span class="text-xs text-gray-500 truncate">${sensor.name}</span>
      </div>
      <p class="font-mono font-bold text-sm" style="color: ${sensor.color}" id="qsVal-${id}">${val}${sensor.unit}</p>
    `;
    container.appendChild(div);
  });
}

function updateQuickSensors() {
  const quickIds = [1, 6, 7, 8, 11, 12];
  quickIds.forEach(id => {
    const sensor = SENSORS.find(s => s.id === id);
    if (!sensor) return;
    const val = sensor.getValue();
    const el = document.getElementById(`qsVal-${id}`);
    if (el) el.textContent = `${val}${sensor.unit}`;
  });
}


function renderActuadores() {
  const grid = document.getElementById('actuadoresGrid');
  if (!grid) return;
  grid.innerHTML = '';
  ACTUADORES_DEF.forEach(act => {
    const isOn = AppState.actuadores[act.id].on;
    const metric = act.getMetric();
    const div = document.createElement('div');
    div.className = 'actuator-card';
    div.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: ${isOn ? `rgba(${hexToRgb(act.color)},0.2)` : 'rgba(30,41,59,0.8)'}; border: 1px solid ${isOn ? act.color : 'rgba(100,116,139,0.3)'}">
            <i class="fas ${act.icon}" style="color: ${isOn ? act.color : '#64748b'}"></i>
          </div>
          <div>
            <p class="font-bold text-white text-sm">${act.name}</p>
            <p class="text-xs text-gray-500">${act.desc}</p>
          </div>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-xs font-bold font-mono px-3 py-1 rounded-full" style="background: ${isOn ? `rgba(${hexToRgb(act.color)},0.15)` : 'rgba(100,116,139,0.15)'}; color: ${isOn ? act.color : '#64748b'}; border: 1px solid ${isOn ? `rgba(${hexToRgb(act.color)},0.3)` : 'rgba(100,116,139,0.25)'}">${isOn ? 'ACTIVO' : 'DETENIDO'}</span>
        </div>
      </div>

      <!-- Circular gauge -->
      <div class="actuator-dial mb-4">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(30,41,59,0.8)" stroke-width="8"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${isOn ? act.color : '#374151'}" stroke-width="8"
            stroke-dasharray="${isOn ? 220 : 0} 264" stroke-linecap="round"
            transform="rotate(-90 50 50)" style="transition: stroke-dasharray 1s ease"/>
          <text x="50" y="46" text-anchor="middle" fill="${isOn ? act.color : '#64748b'}" font-size="14" font-weight="bold" font-family="Orbitron">${act.id}</text>
          <text x="50" y="60" text-anchor="middle" fill="${isOn ? '#94a3b8' : '#475569'}" font-size="7" font-family="JetBrains Mono">${isOn ? 'RUNNING' : 'STOPPED'}</text>
        </svg>
      </div>

      <!-- Metric -->
      <div class="text-center mb-4">
        <p class="text-xs text-gray-600 uppercase tracking-wider mb-1">${act.metricLabel}</p>
        <p class="font-mono font-bold text-xl" style="color: ${isOn ? act.color : '#475569'}" id="actMetric-${act.id}">${metric}</p>
      </div>

      <!-- Activity bars -->
      <div class="space-y-2 mb-4">
        ${[...Array(5)].map((_, i) => `
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-600 font-mono w-6">P${i+1}</span>
            <div class="flex-1 h-1.5 rounded-full" style="background: rgba(30,41,59,0.8)">
              <div class="h-full rounded-full" style="width: ${isOn ? Math.random() * 100 : 0}%; background: ${act.color}; transition: width 1s ease"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Toggle Switch -->
      <div class="flex items-center justify-between pt-4 border-t border-white/5">
        <span class="text-sm text-gray-400 font-medium">${isOn ? 'Desactivar' : 'Activar'} ${act.id}</span>
        <div class="toggle-switch ${isOn ? 'on' : ''}" onclick="toggleActuador('${act.id}')">
          <div class="toggle-thumb"></div>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

function refreshActuadores() {
  renderActuadores();
}

function toggleActuador(id) {
  AppState.actuadores[id].on = !AppState.actuadores[id].on;
  renderActuadores();
  const act = ACTUADORES_DEF.find(a => a.id === id);
  const state = AppState.actuadores[id].on ? 'activado' : 'desactivado';
  showToast(AppState.actuadores[id].on ? 'success' : 'info', `${act.name} ${state}`, `El actuador ${id} ha sido ${state} manualmente.`);
}


function updateKPIs() {
  if (AppState.machineStatus === 'OPERANDO') {
    AppState.sessionProcessed += Math.random() > 0.7 ? 1 : 0;
    AppState.totalProcessed = Math.floor(245 + AppState.sessionProcessed);
  }

  const totalEl = document.getElementById('kpiTotal');
  const pesoEl = document.getElementById('kpiPeso');
  const consumoEl = document.getElementById('kpiConsumo');

  if (totalEl) totalEl.textContent = AppState.totalProcessed;
  if (pesoEl) pesoEl.textContent = AppState.machineStatus === 'OPERANDO' ? `${(1.42 + Math.random() * 0.2).toFixed(2)} kg` : '0.00 kg';
  if (consumoEl) consumoEl.textContent = AppState.machineStatus === 'OPERANDO' ? `${(880 + Math.random() * 80).toFixed(0)} W` : '0.0 W';

  // Energy displays
  if (AppState.machineStatus === 'OPERANDO') {
    const v = (218 + Math.random() * 6).toFixed(1);
    const i = (3.8 + Math.random() * 1.2).toFixed(2);
    const p = (parseFloat(v) * parseFloat(i)).toFixed(0);
    const vEl = document.getElementById('voltajeDisplay');
    const iEl = document.getElementById('corrienteDisplay');
    const pEl = document.getElementById('potenciaDisplay');
    const vG = document.getElementById('voltajeGauge');
    const iG = document.getElementById('corrienteGauge');
    const pG = document.getElementById('potenciaGauge');
    if (vEl) vEl.textContent = `${v} V`;
    if (iEl) iEl.textContent = `${i} A`;
    if (pEl) pEl.textContent = `${p} W`;
    if (vG) vG.style.width = `${(parseFloat(v) / 250 * 100).toFixed(0)}%`;
    if (iG) iG.style.width = `${(parseFloat(i) / 10 * 100).toFixed(0)}%`;
    if (pG) pG.style.width = `${(parseFloat(p) / 2000 * 100).toFixed(0)}%`;
  }
}


const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { labels: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(59,130,246,0.3)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      padding: 10,
      cornerRadius: 10
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { family: 'JetBrains Mono', size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { family: 'JetBrains Mono', size: 10 } } }
  }
};

function initDashboardCharts() {
  // Production chart (dashboard)
  const ctx1 = document.getElementById('chartProduccion');
  if (ctx1 && !AppState.charts['produccion-dash']) {
    AppState.charts['produccion-dash'] = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h'],
        datasets: [{
          label: 'Recipientes/hora',
          data: [32, 41, 38, 44, 47, 39, 52, 35],
          backgroundColor: 'rgba(59,130,246,0.4)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: { ...chartDefaults }
    });
  }

 
  const ctx2 = document.getElementById('chartEnergia');
  if (ctx2 && !AppState.charts['energia-dash']) {
    const labels = Array.from({ length: 20 }, (_, i) => `${i * 3}s`);
    AppState.charts['energia-dash'] = new Chart(ctx2, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Voltaje (V)',
            data: labels.map(() => 218 + Math.random() * 8),
            borderColor: '#eab308',
            backgroundColor: 'rgba(234,179,8,0.1)',
            tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2
          },
          {
            label: 'Corriente (A×100)',
            data: labels.map(() => 380 + Math.random() * 120),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.05)',
            tension: 0.4, fill: false, pointRadius: 0, borderWidth: 2
          }
        ]
      },
      options: { ...chartDefaults }
    });
  }

  
  setInterval(() => {
    const c = AppState.charts['energia-dash'];
    if (!c) return;
    const isOn = AppState.machineStatus === 'OPERANDO';
    c.data.datasets[0].data.push(isOn ? 218 + Math.random() * 8 : 0);
    c.data.datasets[0].data.shift();
    c.data.datasets[1].data.push(isOn ? 380 + Math.random() * 120 : 0);
    c.data.datasets[1].data.shift();
    c.update('none');
  }, 2000);
}

function initProductionCharts() {

  const ctx = document.getElementById('chartProduccion2');
  if (ctx && !AppState.charts['produccion2']) {
    AppState.charts['produccion2'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h'],
        datasets: [{
          label: 'Recipientes',
          data: [30, 42, 38, 44, 47, 39, 52, 35, 48, 41],
          backgroundColor: 'rgba(59,130,246,0.5)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: { ...chartDefaults }
    });
  }

  const ctx2 = document.getElementById('chartPeso');
  if (ctx2 && !AppState.charts['peso']) {
    AppState.charts['peso'] = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: Array.from({ length: 15 }, (_, i) => `R${i * 10 + 1}`),
        datasets: [{
          label: 'Peso (kg)',
          data: Array.from({ length: 15 }, () => 1.35 + Math.random() * 0.3),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2,
          pointBackgroundColor: '#22c55e'
        }, {
          label: 'Objetivo (1.50 kg)',
          data: Array(15).fill(1.50),
          borderColor: 'rgba(234,179,8,0.5)',
          borderDash: [8, 4], pointRadius: 0, borderWidth: 1.5
        }]
      },
      options: { ...chartDefaults }
    });
  }

  const ctx3 = document.getElementById('chartErrores');
  if (ctx3 && !AppState.charts['errores']) {
    AppState.charts['errores'] = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h'],
        datasets: [
          {
            label: 'Atascos',
            data: [0, 1, 0, 2, 0, 0, 1, 0, 0],
            backgroundColor: 'rgba(239,68,68,0.5)',
            borderColor: '#ef4444', borderWidth: 2, borderRadius: 6
          },
          {
            label: 'Errores Sensor',
            data: [1, 0, 1, 0, 0, 1, 0, 2, 1],
            backgroundColor: 'rgba(234,179,8,0.5)',
            borderColor: '#eab308', borderWidth: 2, borderRadius: 6
          }
        ]
      },
      options: { ...chartDefaults }
    });
  }

 
  const statsEl = document.getElementById('statsTurno');
  if (statsEl) {
    const stats = [
      { label: 'Eficiencia', value: 94, color: '#22c55e' },
      { label: 'Disponibilidad', value: 98, color: '#3b82f6' },
      { label: 'Calidad', value: 97, color: '#a855f7' },
      { label: 'OEE', value: 89, color: '#f59e0b' }
    ];
    statsEl.innerHTML = stats.map(s => `
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm text-gray-400">${s.label}</span>
          <span class="font-mono font-bold text-sm" style="color: ${s.color}">${s.value}%</span>
        </div>
        <div class="stat-bar-container">
          <div class="stat-bar-bg flex-1">
            <div class="stat-bar-fill" style="width: ${s.value}%; background: ${s.color}"></div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function initEnergyCharts() {
  const labels = Array.from({ length: 30 }, (_, i) => `${i * 2}s`);

  const ctx1 = document.getElementById('chartVoltaje');
  if (ctx1 && !AppState.charts['voltaje']) {
    AppState.charts['voltaje'] = new Chart(ctx1, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Voltaje (V)',
          data: labels.map(() => 218 + Math.random() * 8),
          borderColor: '#eab308',
          backgroundColor: 'rgba(234,179,8,0.08)',
          tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2
        }]
      },
      options: { ...chartDefaults }
    });
  }

  const ctx2 = document.getElementById('chartCorriente');
  if (ctx2 && !AppState.charts['corriente']) {
    AppState.charts['corriente'] = new Chart(ctx2, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Corriente (A)',
          data: labels.map(() => 3.8 + Math.random() * 1.2),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2
        }]
      },
      options: { ...chartDefaults }
    });
  }

 
  setInterval(() => {
    const vc = AppState.charts['voltaje'];
    const ic = AppState.charts['corriente'];
    const isOn = AppState.machineStatus === 'OPERANDO';
    if (vc) {
      vc.data.datasets[0].data.push(isOn ? 218 + Math.random() * 8 : 0);
      vc.data.datasets[0].data.shift();
      vc.update('none');
    }
    if (ic) {
      ic.data.datasets[0].data.push(isOn ? 3.8 + Math.random() * 1.2 : 0);
      ic.data.datasets[0].data.shift();
      ic.update('none');
    }
  }, 2000);
}


function renderProcessFlow() {
  const container = document.getElementById('processFlow');
  if (!container) return;

  let html = '';
  PROCESS_STEPS.forEach((step, i) => {
    const isActive = AppState.machineStatus === 'OPERANDO' && i <= 3;
    const isDone = AppState.machineStatus === 'OPERANDO' && i < 3;
    const stateClass = isDone ? 'step-done' : (isActive ? 'step-active' : 'step-idle');

    html += `
      <div class="process-step">
        <div class="process-step-icon ${stateClass}">
          <i class="fas ${step.icon}"></i>
        </div>
        <p class="text-xs font-bold text-center" style="color: ${isDone ? '#22c55e' : (isActive ? '#60A5FA' : '#64748b')}">${step.name}</p>
        <p class="text-xs text-gray-600 text-center hidden md:block" style="max-width:80px;font-size:0.6rem">${step.desc.substring(0, 30)}...</p>
      </div>
    `;

    if (i < PROCESS_STEPS.length - 1) {
      html += `<div class="process-connector ${isDone ? 'active-conn' : ''}"></div>`;
    }
  });

  container.innerHTML = html;


  const details = document.getElementById('processDetails');
  if (details) {
    details.innerHTML = PROCESS_STEPS.map(step => `
      <div class="glass-card p-4 flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2)">
          <span class="font-orbitron font-bold text-blue-400 text-sm">${step.id}</span>
        </div>
        <div>
          <p class="font-bold text-white text-sm">${step.name}</p>
          <p class="text-xs text-gray-500 mt-1">${step.desc}</p>
        </div>
      </div>
    `).join('');
  }
}


function renderAlerts() {
  const container = document.getElementById('alertsList');
  if (!container) return;
  container.innerHTML = ALERTS_DATA.map(alert => `
    <div class="alert-item" style="border-color: ${alert.borderColor}; background: ${alert.bgColor}">
      <div class="alert-icon" style="background: rgba(${hexToRgb(alert.color)},0.15); color: ${alert.color}">
        <i class="fas ${alert.icon}"></i>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
          <p class="font-bold text-sm text-white">${alert.title}</p>
          <span class="text-xs text-gray-600 font-mono">${alert.time}</span>
        </div>
        <p class="text-xs text-gray-400">${alert.msg}</p>
      </div>
      <button class="btn-icon ml-2 flex-shrink-0 opacity-50 hover:opacity-100" title="Descartar">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  `).join('');
}


function showToast(type, title, msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colorMap = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', icon: 'fa-check-circle', iconColor: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', icon: 'fa-times-circle', iconColor: '#ef4444' },
    warning: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', icon: 'fa-exclamation-triangle', iconColor: '#eab308' },
    info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', icon: 'fa-info-circle', iconColor: '#3b82f6' }
  };

  const c = colorMap[type] || colorMap.info;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `background: ${c.bg}; border-color: ${c.border}`;
  toast.innerHTML = `
    <i class="fas ${c.icon}" style="color: ${c.iconColor}; font-size: 1.1rem; flex-shrink: 0;"></i>
    <div>
      <p class="text-sm font-bold text-white">${title}</p>
      <p class="text-xs text-gray-400">${msg}</p>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(30px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 4000);
}


function highlightSensor(id) {
  showSection('sensores', null);
  setTimeout(() => {
    const card = document.getElementById(`sensorCard-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 30px rgba(59,130,246,0.5)';
      card.style.borderColor = 'rgba(59,130,246,0.7)';
      setTimeout(() => { card.style.boxShadow = ''; card.style.borderColor = ''; }, 2000);
    }
  }, 300);
}


function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.style.transform = sidebar.style.transform === 'translateX(-100%)' ? 'translateX(0)' : 'translateX(-100%)';
}


function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '59,130,246';
}


function init() {
  
  updateClock();
  setInterval(updateClock, 1000);


  renderSensors();
  renderQuickSensors();
  renderActuadores();
  renderProcessFlow();
  renderAlerts();

  
  initDashboardCharts();

 
  setInterval(() => {
    updateSensorValues();
    updateKPIs();
    if (AppState.machineStatus === 'OPERANDO') {
      // Randomly trigger alerts
      if (Math.random() > 0.995) showToast('warning', 'Nivel Tolva Bajo', 'El nivel ha bajado de 15%');
      if (Math.random() > 0.998) showToast('error', 'Atasco Detectado', 'Vibración anormal en banda central');
    }
  }, 1500);


  setInterval(() => {
    ACTUADORES_DEF.forEach(act => {
      const el = document.getElementById(`actMetric-${act.id}`);
      if (el) el.textContent = act.getMetric();
    });
  }, 2000);

  console.log('%cBeltControl SCADA v2.4.1 — Initialized', 'color: #3B82F6; font-family: Orbitron; font-size: 14px; font-weight: bold;');
  console.log('%cSistema de Banda Transportadora con Tolva Dosificadora', 'color: #64748b; font-size: 11px;');
}

document.addEventListener('DOMContentLoaded', init);