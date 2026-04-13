/* ═══════════════════════════════════════════════════════════
   IHM Supervision Industrielle — script.js
   Architecture : dashboard + moteur + capteurs + batteries + système
   Offline complet : IHMChart canvas maison, simulation intégrée
═══════════════════════════════════════════════════════════ */

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

  /* ════════════════════════════════
     ÉLÉMENTS DOM
  ════════════════════════════════ */

  // Navigation
  const navButtons   = document.querySelectorAll(".nav-btn");
  const tabContents  = document.querySelectorAll(".tab-content");
  const pageTitle    = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  // Topbar
  const refreshBtn        = document.getElementById("refreshBtn");
  const pauseBtn          = document.getElementById("pauseBtn");
  const globalShutdownBtn = document.getElementById("globalShutdownBtn");
  const shutdownPanelBtn  = document.getElementById("shutdownPanelBtn");

  // Sidebar
  const sidebarBackendStatus = document.getElementById("sidebarBackendStatus");

  // Dashboard
  const dashServeur    = document.getElementById("dashServeur");
  const dashComm       = document.getElementById("dashComm");
  const dashMode       = document.getElementById("dashMode");
  const kpiCritical    = document.getElementById("kpiCritical");
  const dashMotorBadge = document.getElementById("dashMotorBadge");
  const dashMotorStatus= document.getElementById("dashMotorStatus");
  const dashRpmActual  = document.getElementById("dashRpmActual");
  const dashRpmCmd     = document.getElementById("dashRpmCmd");
  const dashMotorTemp  = document.getElementById("dashMotorTemp");
  const dashLedEau     = document.getElementById("dashLedEau");
  const dashLedPression= document.getElementById("dashLedPression");
  const dashLedTemp    = document.getElementById("dashLedTemp");
  const dashEtatEau    = document.getElementById("dashEtatEau");
  const dashEtatPression=document.getElementById("dashEtatPression");
  const dashEtatTemp   = document.getElementById("dashEtatTemp");
  const dashBatBadge   = document.getElementById("dashBatBadge");
  const dashBatLevel   = document.getElementById("dashBatLevel");
  const dashBatTemp    = document.getElementById("dashBatTemp");
  const dashBatEtat    = document.getElementById("dashBatEtat");
  const dashBatAlarme  = document.getElementById("dashBatAlarme");
  const lastFrameEl    = document.getElementById("lastFrame");

  // Moteur
  const sendRpmBtn           = document.getElementById("sendRpmBtn");
  const rpmInput             = document.getElementById("rpmInput");
  const motorStatusBadge     = document.getElementById("motorStatusBadge");
  const motorBannerDot       = document.getElementById("motorBannerDot");
  const motorStatus          = document.getElementById("motorStatus");
  const motorRpmActual       = document.getElementById("motorRpmActual");
  const motorRpmCmd          = document.getElementById("motorRpmCmd");
  const motorTemperature     = document.getElementById("motorTemperature");
  const motorCommandFeedback = document.getElementById("motorCommandFeedback");
  const rpmGaugeFill         = document.getElementById("rpmGaugeFill");
  const rpmGaugePct          = document.getElementById("rpmGaugePct");
  const motorChartCanvas     = document.getElementById("motorChart");

  // Capteurs
  const sensorEls = {
    eau:         { led: document.getElementById("ledEau"),         etat: document.getElementById("etatEau"),         retour: document.getElementById("retourEau"),         interp: document.getElementById("interpEau") },
    pression:    { led: document.getElementById("ledPression"),    etat: document.getElementById("etatPression"),    retour: document.getElementById("retourPression"),    interp: document.getElementById("interpPression") },
    temperature: { led: document.getElementById("ledTemperature"), etat: document.getElementById("etatTemperature"), retour: document.getElementById("retourTemperature"), interp: document.getElementById("interpTemperature") }
  };

  // Batteries
  const batStatusBadge    = document.getElementById("batStatusBadge");
  const batNiveau         = document.getElementById("batNiveau");
  const batTemp           = document.getElementById("batTemp");
  const batEtat           = document.getElementById("batEtat");
  const batAlarme         = document.getElementById("batAlarme");
  const batPctText        = document.getElementById("batPctText");
  const batBarFill        = document.getElementById("batBarFill");
  const batUmin           = document.getElementById("batUmin");
  const batUmax           = document.getElementById("batUmax");
  const batTmin           = document.getElementById("batTmin");
  const batTmax           = document.getElementById("batTmax");
  const alarmBatFaible    = document.getElementById("alarmBatFaible");
  const alarmBatSurchauffe= document.getElementById("alarmBatSurchauffe");
  const alarmBatDeconnect = document.getElementById("alarmBatDeconnect");
  const alarmBatEcart     = document.getElementById("alarmBatEcart");

  // Moteur alarmes
  const alarmSurchauffe = document.getElementById("alarmSurchauffe");
  const alarmSurvitesse = document.getElementById("alarmSurvitesse");
  const alarmBlocage    = document.getElementById("alarmBlocage");
  const alarmComm       = document.getElementById("alarmComm");

  // Système
  const systBackend  = document.getElementById("systBackend");
  const systUptime   = document.getElementById("systUptime");
  const systLogList  = document.getElementById("systLogList");

  // Journaux
  const logList = document.getElementById("logList");

  // Modal
  const modal             = document.getElementById("deviceModal");
  const closeModalBtn     = document.getElementById("closeModalBtn");
  const modalTitle        = document.getElementById("modalTitle");
  const modalSubtitle     = document.getElementById("modalSubtitle");
  const modalStatus       = document.getElementById("modalStatus");
  const modalCurrent      = document.getElementById("modalCurrent");
  const modalThreshold    = document.getElementById("modalThreshold");
  const deviceChartCanvas = document.getElementById("deviceChart");
  const deviceBoxes       = document.querySelectorAll(".device-box");

  // Graphes
  const mainChartCanvas = document.getElementById("mainChart");

  /* ════════════════════════════════
     SOUS-TITRES ONGLETS
  ════════════════════════════════ */
  const subtitles = {
    dashboard: "Supervision temps réel des équipements",
    moteur:    "Commande et suivi du moteur principal",
    sensors:   "Retour d'état des capteurs",
    batteries: "Surveillance énergétique et thermique",
    systeme:   "Informations système et diagnostics"
  };

  const pageTitles = {
    dashboard: "Vue générale",
    moteur:    "Moteur",
    sensors:   "Capteurs",
    batteries: "Batteries",
    systeme:   "Système"
  };

  /* ════════════════════════════════
     DONNÉES SYNOPTIQUE (modal)
  ════════════════════════════════ */
  const deviceData = {
    smo: {
      title: "SMO – Moteur principal", subtitle: "RPM et température moteur",
      status: "RUN", current: "1450 tr/min", threshold: "3000 tr/min",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [900,1100,1250,1380,1450,1490,1430,1450]
    },
    gouverne: {
      title: "Gouverne", subtitle: "Retour position / vitesse",
      status: "CHECK", current: "120.5", threshold: "150",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [90,98,102,111,118,121,119,120.5]
    },
    sta: {
      title: "STA – Commande séquentielle", subtitle: "Séquences et accusés",
      status: "OK", current: "Séquence 13", threshold: "N/A",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [2,3,4,5,4,6,5,6]
    },
    batterie: {
      title: "Batterie", subtitle: "Évolution tension moyenne",
      status: "MONITOR", current: "27.8 V", threshold: "32 V",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [28.3,28.2,28.1,28.0,27.9,27.8,27.8,27.8]
    },
    "capteur-temp": {
      title: "Capteur Température", subtitle: "Mesure thermique",
      status: "NORMAL", current: "43 °C", threshold: "90 °C",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [38,39,40,41,42,43,42,43]
    },
    "capteur-pression": {
      title: "Capteur Pression", subtitle: "Pression process",
      status: "STABLE", current: "1.02 bar", threshold: "1.10 bar",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [0.96,0.98,1.01,1.00,1.02,1.01,1.03,1.02]
    },
    "capteur-eau": {
      title: "Capteur Eau", subtitle: "Détection de présence d'eau",
      status: "0 DETECT", current: "0", threshold: "1",
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
      values: [0,0,0,0,0,0,0,0]
    }
  };

  /* ════════════════════════════════
     ÉTAT GLOBAL (simulation)
  ════════════════════════════════ */
  let isPaused = false;
  let uptimeSeconds = 0;

  const simMotor = { status: "RUN", rpm_actual: 1450, rpm_cmd: 1500, temperature: 39 };
  const simSensors = { water: 0, pressure: 1.02, temperature: 43 };
  const simBattery = { level: 78, temperature: 31, etat: "Charge", umin: 3.62, umax: 3.79, tmin: 24, tmax: 31 };

  /* ════════════════════════════════
     JOURNAL
  ════════════════════════════════ */
  function addLog(message, level = "info", target = "both") {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2,"0")).join(":");

    const create = (parent) => {
      if (!parent) return;
      const item = document.createElement("div");
      item.className = `log-item ${level}`;
      item.innerHTML = `<span class="log-time">${ts}</span><span class="log-text">${message}</span>`;
      parent.prepend(item);
      while (parent.children.length > 10) parent.removeChild(parent.lastChild);
    };

    if (target === "both" || target === "main") create(logList);
    if (target === "both" || target === "sys")  create(systLogList);
  }

  /* ════════════════════════════════
     NAVIGATION
  ════════════════════════════════ */
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      const target = document.getElementById(tab);
      if (target) target.classList.add("active");
      if (pageTitle)    pageTitle.textContent    = pageTitles[tab] || tab;
      if (pageSubtitle) pageSubtitle.textContent = subtitles[tab] || "";
    });
  });

  /* ════════════════════════════════
     HORLOGE
  ════════════════════════════════ */
  function updateClock() {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2,"0")).join(":");
    if (lastFrameEl) lastFrameEl.textContent = ts;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ════════════════════════════════
     UPTIME
  ════════════════════════════════ */
  setInterval(() => {
    uptimeSeconds++;
    if (systUptime) {
      const h = String(Math.floor(uptimeSeconds / 3600)).padStart(2,"0");
      const m = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2,"0");
      const s = String(uptimeSeconds % 60).padStart(2,"0");
      systUptime.textContent = `${h}:${m}:${s}`;
    }
  }, 1000);

  /* ════════════════════════════════
     PAUSE
  ════════════════════════════════ */
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? "▶ Reprendre" : "⏸ Pause";
      pauseBtn.classList.toggle("paused", isPaused);
      addLog(isPaused ? "Rafraîchissement mis en pause" : "Rafraîchissement repris", "info");
    });
  }

  /* ════════════════════════════════
     SHUTDOWN
  ════════════════════════════════ */
  function handleShutdown() {
    if (!window.confirm("Confirmer le shutdown complet du système ?")) return;
    addLog("⚠ Shutdown système demandé par l'opérateur", "warn");
    window.alert("Shutdown simulé envoyé.");
  }
  if (globalShutdownBtn) globalShutdownBtn.addEventListener("click", handleShutdown);
  if (shutdownPanelBtn)  shutdownPanelBtn.addEventListener("click", handleShutdown);

  /* ════════════════════════════════
     MOTEUR DE GRAPHE CANVAS (100% offline)
  ════════════════════════════════ */
  function IHMChart(canvas, cfg) {
    if (!canvas) return null;
    const PAD = { top: 28, right: 20, bottom: 44, left: 52 };
    const MAX_PTS = cfg.maxPoints || 12;
    const series  = cfg.series.map(s => ({ label: s.label, color: s.color, fill: s.fill !== false, data: [...(s.data || [])] }));
    let   labels  = [...(cfg.labels || [])];
    let   tooltip = null;

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { tooltip = null; draw(); });

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const W    = canvas.clientWidth || 400;
      const plotW = W - PAD.left - PAD.right;
      const n = labels.length;
      if (n < 2) return;
      let best = 0, bestDx = Infinity;
      for (let i = 0; i < n; i++) {
        const dx = Math.abs(PAD.left + i / (n-1) * plotW - mx);
        if (dx < bestDx) { bestDx = dx; best = i; }
      }
      tooltip = { idx: best };
      draw();
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const W0  = canvas.clientWidth  || 400;
      const H0  = canvas.clientHeight || 280;
      canvas.width  = W0 * dpr;
      canvas.height = H0 * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const W = W0, H = H0;
      ctx.clearRect(0, 0, W, H);

      const plotW = W - PAD.left - PAD.right;
      const plotH = H - PAD.top  - PAD.bottom;
      const n     = labels.length;
      if (n === 0) return;

      let yMin = Infinity, yMax = -Infinity;
      series.forEach(s => s.data.forEach(v => { if (v < yMin) yMin = v; if (v > yMax) yMax = v; }));
      const range = yMax - yMin || 1;
      yMin -= range * 0.12; yMax += range * 0.12;

      const xAt = i => PAD.left + (n > 1 ? i / (n - 1) : 0.5) * plotW;
      const yAt = v => PAD.top  + (1 - (v - yMin) / (yMax - yMin)) * plotH;

      // grille H
      for (let t = 0; t <= 5; t++) {
        const gy = yAt(yMin + (yMax - yMin) * (t / 5));
        ctx.strokeStyle = "rgba(42,140,255,0.07)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
        ctx.fillStyle = "#4a6580"; ctx.font = "11px Segoe UI,sans-serif"; ctx.textAlign = "right";
        ctx.fillText(Math.round(yMin + (yMax - yMin) * (t / 5)), PAD.left - 6, gy + 4);
      }

      // labels X
      const showEvery = Math.max(1, Math.ceil(n / 8));
      for (let i = 0; i < n; i++) {
        const gx = xAt(i);
        ctx.strokeStyle = "rgba(42,140,255,0.06)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
        if (i % showEvery === 0 || i === n - 1) {
          ctx.fillStyle = "#4a6580"; ctx.font = "10px Segoe UI,sans-serif"; ctx.textAlign = "center";
          ctx.fillText(labels[i] || "", gx, PAD.top + plotH + 16);
        }
      }

      // axes
      ctx.strokeStyle = "rgba(42,140,255,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH); ctx.lineTo(PAD.left + plotW, PAD.top + plotH); ctx.stroke();

      // séries
      series.forEach(s => {
        if (s.data.length < 1) return;
        const pts = s.data.map((v, i) => [xAt(i), yAt(v)]);

        if (s.fill) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], PAD.top + plotH);
          pts.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(pts[pts.length-1][0], PAD.top + plotH);
          ctx.closePath();
          // parse color for fill
          const m = s.color.match(/\d+/g);
          ctx.fillStyle = m ? `rgba(${m[0]},${m[1]},${m[2]},0.07)` : "rgba(42,140,255,0.07)";
          ctx.fill();
        }

        ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.lineJoin = "round";
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const cpx = (pts[i-1][0] + pts[i][0]) / 2;
          ctx.bezierCurveTo(cpx, pts[i-1][1], cpx, pts[i][1], pts[i][0], pts[i][1]);
        }
        ctx.stroke();

        pts.forEach(([x, y]) => {
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = s.color; ctx.fill();
          ctx.strokeStyle = "rgba(2,13,26,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
        });
      });

      // légende
      let lx = PAD.left;
      series.forEach(s => {
        ctx.fillStyle = s.color; ctx.fillRect(lx, 10, 12, 3);
        ctx.fillStyle = "#6d8aab"; ctx.font = "11px Segoe UI,sans-serif"; ctx.textAlign = "left";
        ctx.fillText(s.label, lx + 16, 16);
        lx += ctx.measureText(s.label).width + 36;
      });

      // tooltip
      if (tooltip !== null && tooltip.idx < n) {
        const i  = tooltip.idx;
        const gx = xAt(i);
        ctx.strokeStyle = "rgba(42,140,255,0.3)"; ctx.lineWidth = 1;
        ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "11px Segoe UI,sans-serif";
        const lines = series.map(s => `${s.label}: ${s.data[i] !== undefined ? Math.round(s.data[i]*100)/100 : "–"}`);
        const bw = Math.max(...lines.map(l => ctx.measureText(l).width + 24), 120);
        const bh = lines.length * 18 + 22;
        let bx = gx + 10, by = PAD.top;
        if (bx + bw > W - 10) bx = gx - bw - 10;

        ctx.fillStyle = "#061525"; ctx.strokeStyle = "rgba(42,140,255,0.3)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();

        ctx.fillStyle = "#9aa7b8"; ctx.textAlign = "left";
        ctx.fillText(labels[i] || `T${i}`, bx + 10, by + 14);
        lines.forEach((l, li) => { ctx.fillStyle = series[li].color; ctx.fillText(l, bx + 10, by + 28 + li * 17); });

        series.forEach(s => {
          if (s.data[i] === undefined) return;
          ctx.beginPath(); ctx.arc(gx, yAt(s.data[i]), 5, 0, Math.PI * 2);
          ctx.fillStyle = s.color; ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
        });
      }
    }

    draw();

    return {
      push(label, values) {
        labels.push(label);
        values.forEach((v, i) => { if (series[i]) series[i].data.push(v); });
        if (labels.length > MAX_PTS) { labels.shift(); series.forEach(s => s.data.shift()); }
        draw();
      },
      set(newLabels, newSeries) {
        labels = [...newLabels];
        newSeries.forEach((d, i) => { if (series[i]) series[i].data = [...d]; });
        draw();
      },
      redraw: draw,
      destroy() { ro.disconnect(); canvas.removeEventListener("mousemove", onMove); }
    };
  }

  /* ════════════════════════════════
     GRAPHES
  ════════════════════════════════ */
  const mainChart = IHMChart(mainChartCanvas, {
    maxPoints: 12,
    labels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
    series: [
      { label: "RPM moteur",       color: "#2a8cff", data: [900,1100,1250,1380,1450,1490,1430,1450] },
      { label: "Température (°C)", color: "#f5a623", data: [34,36,37,39,40,42,41,42] }
    ]
  });

  const motorChart = IHMChart(motorChartCanvas, {
    maxPoints: 12, labels: [],
    series: [
      { label: "RPM actuel",       color: "#2a8cff", data: [] },
      { label: "Température (°C)", color: "#f5a623", data: [] }
    ]
  });

  function pushMotorChart(rpm, temp) {
    if (!motorChart) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    motorChart.push(now, [rpm ?? 0, temp ?? 0]);
  }

  /* ════════════════════════════════
     RENDU MOTEUR
  ════════════════════════════════ */
  function renderMotor(m) {
    if (!m) return;
    const rpm  = m.rpm_actual  ?? simMotor.rpm_actual;
    const rpmC = m.rpm_cmd     ?? simMotor.rpm_cmd;
    const temp = m.temperature ?? simMotor.temperature;
    const st   = m.status      ?? simMotor.status;

    // Onglet moteur
    if (motorStatus)      motorStatus.textContent      = st;
    if (motorRpmActual)   motorRpmActual.textContent   = `${rpm} tr/min`;
    if (motorRpmCmd)      motorRpmCmd.textContent      = `${rpmC} tr/min`;
    if (motorTemperature) motorTemperature.textContent = `${temp} °C`;

    // Jauge RPM
    const pct = Math.round(Math.min(100, (rpm / 3000) * 100));
    if (rpmGaugeFill) rpmGaugeFill.style.width = `${pct}%`;
    if (rpmGaugePct)  rpmGaugePct.textContent  = `${pct}%`;

    // Badge et point clignotant
    const cls = st === "RUN" ? "ok" : st === "STOP" ? "warn" : "danger";
    [motorStatusBadge].forEach(el => { if (!el) return; el.textContent = st; el.className = `status-pill ${cls}`; });
    if (motorBannerDot) { motorBannerDot.className = `motor-banner-dot${st === "RUN" ? "" : st === "STOP" ? " stop" : " error"}`; }

    // Dashboard
    if (dashMotorStatus) dashMotorStatus.textContent = st;
    if (dashRpmActual)   dashRpmActual.textContent   = `${rpm} tr/min`;
    if (dashRpmCmd)      dashRpmCmd.textContent      = `${rpmC} tr/min`;
    if (dashMotorTemp)   dashMotorTemp.textContent   = `${temp} °C`;
    if (dashMotorBadge)  { dashMotorBadge.textContent = st; dashMotorBadge.className = `status-pill ${cls}`; }

    // Alarmes moteur
    const surchauffe = temp > 55;
    const survitesse = rpm > 2800;
    setAlarm(alarmSurchauffe, surchauffe ? "warn" : "ok", surchauffe ? "ALERTE" : "OK", surchauffe);
    setAlarm(alarmSurvitesse, survitesse ? "warn" : "ok", survitesse ? "ALERTE" : "OK", survitesse);
    setAlarm(alarmBlocage,    "ok", "OK", false);
    setAlarm(alarmComm,       "ok", "OK", false);

    pushMotorChart(rpm, temp);
  }

  function setAlarm(ledEl, state, txt, isActive) {
    if (!ledEl) return;
    const row  = ledEl.closest ? ledEl.closest(".alarm-row") : null;
    const valEl = row ? row.querySelector(".alarm-val") : null;
    ledEl.dataset.state = state;
    if (valEl) {
      valEl.textContent = txt;
      valEl.className   = `alarm-val ${isActive ? "warning-text" : "success-text"}`;
    }
  }

  /* ════════════════════════════════
     RENDU CAPTEURS
  ════════════════════════════════ */
  const sensorDefs = [
    {
      key: "eau", apiKey: "water", unit: "",
      interp: v => v === 0 ? "Aucune présence détectée" : "ALERTE – eau détectée !",
      state:  v => v === 0 ? "ok" : "error",
      etat:   v => v === 0 ? "Normal" : "Alarme"
    },
    {
      key: "pression", apiKey: "pressure", unit: " bar",
      interp: v => v < 1.05 ? "Pression stable" : "Pression haute",
      state:  v => v < 1.05 ? "ok" : "warn",
      etat:   v => v < 1.05 ? "Stable" : "Élevée"
    },
    {
      key: "temperature", apiKey: "temperature", unit: " °C",
      interp: v => v < 50 ? "Température normale" : v < 70 ? "Température élevée" : "SURCHAUFFE",
      state:  v => v < 50 ? "ok" : v < 70 ? "warn" : "error",
      etat:   v => v < 50 ? "Normal" : v < 70 ? "Élevée" : "Critique"
    }
  ];

  function renderSensors(data) {
    sensorDefs.forEach(def => {
      const raw   = data?.[def.apiKey] ?? simSensors[def.apiKey];
      const st    = def.state(raw);
      const els   = sensorEls[def.key];

      if (els.led)    els.led.dataset.state   = st;
      if (els.etat)   els.etat.textContent    = def.etat(raw);
      if (els.retour) els.retour.textContent  = raw + def.unit;
      if (els.interp) els.interp.textContent  = def.interp(raw);

      // Dashboard mini-LED
      const dashLed  = def.key === "eau" ? dashLedEau : def.key === "pression" ? dashLedPression : dashLedTemp;
      const dashEtat = def.key === "eau" ? dashEtatEau : def.key === "pression" ? dashEtatPression : dashEtatTemp;
      if (dashLed)  dashLed.dataset.state  = st;
      if (dashEtat) dashEtat.textContent   = def.etat(raw);
    });
  }

  /* ════════════════════════════════
     RENDU BATTERIE
  ════════════════════════════════ */
  function renderBattery(b) {
    const d     = b || simBattery;
    const level = d.level ?? 78;
    const temp  = d.temperature ?? 31;
    const etat  = d.etat ?? "Charge";
    const alarme= d.alarme ?? "Aucune";
    const pct   = `${level}%`;

    if (batNiveau)  batNiveau.innerHTML  = `${level}<small>%</small>`;
    if (batTemp)    batTemp.innerHTML    = `${temp}<small>°C</small>`;
    if (batEtat)    batEtat.textContent  = etat;
    if (batAlarme)  batAlarme.textContent= alarme;
    if (batPctText) batPctText.textContent = pct;

    if (batBarFill) {
      batBarFill.style.width = pct;
      batBarFill.className   = `bat-bar-fill${level < 20 ? " low" : level < 40 ? " warn" : ""}`;
    }

    if (batUmin) batUmin.textContent = `${d.umin ?? 3.62} V`;
    if (batUmax) batUmax.textContent = `${d.umax ?? 3.79} V`;
    if (batTmin) batTmin.textContent = `${d.tmin ?? 24} °C`;
    if (batTmax) batTmax.textContent = `${d.tmax ?? 31} °C`;

    // Dashboard batterie
    if (dashBatLevel)  dashBatLevel.textContent  = pct;
    if (dashBatTemp)   dashBatTemp.textContent   = `${temp}°C`;
    if (dashBatEtat)   dashBatEtat.textContent   = etat;
    if (dashBatAlarme) { dashBatAlarme.textContent = alarme === "Aucune" ? "Aucune" : alarme; dashBatAlarme.className = alarme === "Aucune" ? "success-text" : "warning-text"; }

    const batOk = level > 20 && temp < 45;
    const pill  = batStatusBadge;
    if (pill)     { pill.textContent = batOk ? "OK" : "MONITOR"; pill.className = `status-pill ${batOk ? "ok" : "warn"}`; }
    if (dashBatBadge) { dashBatBadge.textContent = batOk ? "OK" : "MONITOR"; dashBatBadge.className = `status-pill ${batOk ? "ok" : "warn"}`; }
  }

  /* ════════════════════════════════
     RENDU STATUS SERVEUR
  ════════════════════════════════ */
  function renderStatus(s) {
    if (!s) return;
    const val = s.server_status || "ONLINE";
    if (sidebarBackendStatus) sidebarBackendStatus.textContent = val;
    if (systBackend)          systBackend.textContent          = val;
    if (dashServeur)          dashServeur.textContent          = val;
    if (dashComm)             dashComm.textContent             = s.communication || "CONNECTED";
    if (dashMode)             dashMode.textContent             = s.mode || "AUTOMATIQUE";
  }

  /* ════════════════════════════════
     APPELS API
  ════════════════════════════════ */
  async function safeFetch(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return res.json();
    } catch { return null; }
  }

  async function refreshAll() {
    if (isPaused) return;
    const [status, motor, sensors, battery] = await Promise.all([
      safeFetch(`${API_BASE}/status`),
      safeFetch(`${API_BASE}/motor`),
      safeFetch(`${API_BASE}/sensors`),
      safeFetch(`${API_BASE}/battery`)
    ]);
    renderStatus(status);
    renderMotor(motor   || simMotor);
    renderSensors(sensors);
    renderBattery(battery);
  }

  /* ════════════════════════════════
     ENVOI CONSIGNE RPM
  ════════════════════════════════ */
  async function sendMotorRpm() {
    if (!rpmInput) return;
    const val = parseInt(rpmInput.value, 10);
    if (Number.isNaN(val) || val < 0 || val > 3000) {
      if (motorCommandFeedback) motorCommandFeedback.textContent = "⚠ Valeur RPM invalide (0–3000).";
      return;
    }
    simMotor.rpm_cmd = val;
    try {
      const res = await fetch(`${API_BASE}/motor/rpm_cmd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rpm_cmd: val })
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        if (motorCommandFeedback) motorCommandFeedback.textContent = data.message || "⚠ Erreur lors de l'envoi.";
        return;
      }
    } catch {
      // backend absent → simulation locale
    }
    if (motorCommandFeedback) motorCommandFeedback.textContent = `✓ Consigne envoyée : ${val} tr/min`;
    addLog(`Consigne RPM : ${val} tr/min`, "info");
    await refreshAll();
  }

  if (sendRpmBtn) sendRpmBtn.addEventListener("click", sendMotorRpm);
  if (refreshBtn) refreshBtn.addEventListener("click", () => { refreshAll(); addLog("Actualisation manuelle", "info"); });

  /* ════════════════════════════════
     MODAL SYNOPTIQUE
  ════════════════════════════════ */
  let deviceChart = null;

  function openDeviceModal(key) {
    const d = deviceData[key];
    if (!d || !modal) return;
    if (modalTitle)     modalTitle.textContent     = d.title;
    if (modalSubtitle)  modalSubtitle.textContent  = d.subtitle;
    if (modalStatus)    modalStatus.textContent    = d.status;
    if (modalCurrent)   modalCurrent.textContent   = d.current;
    if (modalThreshold) modalThreshold.textContent = d.threshold;
    if (deviceChart && typeof deviceChart.destroy === "function") deviceChart.destroy();
    deviceChart = IHMChart(deviceChartCanvas, {
      maxPoints: d.labels.length,
      labels: d.labels,
      series: [{ label: d.title, color: "#2a8cff", data: d.values }]
    });
    modal.classList.remove("hidden");
    setTimeout(() => deviceChart && deviceChart.redraw(), 50);
  }

  deviceBoxes.forEach(box => {
    box.addEventListener("click", () => {
      openDeviceModal(box.dataset.device);
      addLog(`Détail ouvert : ${box.dataset.device}`, "info");
    });
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) modal.classList.add("hidden");
  });

  /* ════════════════════════════════
     SIMULATION TEMPS RÉEL
  ════════════════════════════════ */
  setInterval(() => {
    if (isPaused) return;

    // Moteur
    simMotor.rpm_actual = Math.round(Math.max(1100, Math.min(1600,
      simMotor.rpm_actual + (Math.random() * 80 - 40))));
    simMotor.temperature = Math.round(Math.max(30, Math.min(75,
      simMotor.temperature + (Math.random() * 4 - 2))));

    // Capteurs
    simSensors.temperature = Math.round(Math.max(30, Math.min(75,
      simSensors.temperature + (Math.random() * 2 - 1))));
    simSensors.pressure = Math.round((Math.max(0.9, Math.min(1.1,
      simSensors.pressure + (Math.random() * 0.02 - 0.01)))) * 100) / 100;

    // Batterie (décharge lente)
    simBattery.level = Math.max(10, simBattery.level - 0.01);
    simBattery.temperature = Math.round(Math.max(24, Math.min(45,
      simBattery.temperature + (Math.random() * 0.4 - 0.2))));

    // Graphe dashboard
    if (mainChart) {
      const rpmDs  = mainChart._series?.[0]?.data;
      const tempDs = mainChart._series?.[1]?.data;
      // utilise push directement
      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      mainChart.push(now, [simMotor.rpm_actual, simMotor.temperature]);
    }

    // Render
    renderMotor(simMotor);
    renderSensors(null);
    renderBattery(simBattery);

    // Alarme critique dashboard
    if (kpiCritical) kpiCritical.textContent = simMotor.temperature > 65 ? "1" : "0";

  }, 2500);

  /* ════════════════════════════════
     INIT
  ════════════════════════════════ */
  renderMotor(simMotor);
  renderSensors(null);
  renderBattery(simBattery);
  refreshAll();
  setInterval(refreshAll, 5000);

  addLog("Interface IHM démarrée", "info");
  addLog("Connexion backend initialisée", "info");
  addLog("SMO en fonctionnement nominal", "info");
  addLog("Batterie sous surveillance thermique", "warn");

});
