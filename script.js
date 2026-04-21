/* ═══════════════════════════════════════════════════
   IHM Supervision Industrielle — script.js
   100% offline — IHMChart canvas maison
═══════════════════════════════════════════════════ */

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

  /* ════════════════════════════════
     DOM
  ════════════════════════════════ */
  const $ = id => document.getElementById(id);

  // Navigation
  const navButtons  = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const pageTitle   = $("pageTitle");
  const pageSubtitle= $("pageSubtitle");

  // Topbar
  const refreshBtn        = $("refreshBtn");
  const pauseBtn          = $("pauseBtn");
  const globalShutdownBtn = $("globalShutdownBtn");

  // Sidebar
  const sidebarBackendStatus = $("sidebarBackendStatus");

  // WebSocket
  const wsIpInput     = $("wsIp");
  const wsPortInput   = $("wsPort");
  const btnConnect    = $("btnConnect");
  const btnDisconnect = $("btnDisconnect");

  // Dashboard
  const dashMotorBadge  = $("dashMotorBadge");
  const dashMotorStatus = $("dashMotorStatus");
  const dashRpmActual   = $("dashRpmActual");
  const dashRpmCmd      = $("dashRpmCmd");
  const dashMotorTemp   = $("dashMotorTemp");
  const dashLedEau      = $("dashLedEau");
  const dashLedPression = $("dashLedPression");
  const dashLedTemp     = $("dashLedTemp");
  const dashBatBadge    = $("dashBatBadge");
  const dashBatLevel    = $("dashBatLevel");
  const dashBatTemp     = $("dashBatTemp");
  const dashBatEtat     = $("dashBatEtat");
  const dashBatAlarme   = $("dashBatAlarme");

  // Moteur
  const sendRpmBtn           = $("sendRpmBtn");
  const rpmInput             = $("rpmInput");
  const motorStatusBadge     = $("motorStatusBadge");
  const motorBannerDot       = $("motorBannerDot");
  const motorStatus          = $("motorStatus");
  const motorRpmActual       = $("motorRpmActual");
  const motorRpmCmd          = $("motorRpmCmd");
  const motorTemperature     = $("motorTemperature");
  const motorCommandFeedback = $("motorCommandFeedback");
  const rpmGaugeFill         = $("rpmGaugeFill");
  const rpmGaugePct          = $("rpmGaugePct");
  const motorChartCanvas     = $("motorChart");
  const mainChartCanvas      = $("mainChart");

  // Capteurs (onglet)
  const sensorEls = {
    eau:         { led: $("ledEau"),      retour: $("retourEau") },
    pression:    { led: $("ledPression"), retour: $("retourPression") },
    temp1:       { led: $("ledTemp1"),    retour: $("retourTemp1") },
    temp2:       { led: $("ledTemp2"),    retour: $("retourTemp2") },
    temp3:       { led: $("ledTemp3"),    retour: $("retourTemp3") },
    tempPlaque:  { led: $("ledTempPlaque"), retour: $("retourTempPlaque") }
  };

  // Batteries
  const batStatusBadge = $("batStatusBadge");
  const batTemp        = $("batTemp");
  const batPctText     = $("batPctText");
  const batBarFill     = $("batBarFill");
  const batUmin        = $("batUmin");
  const batUmax        = $("batUmax");
  const batTmin        = $("batTmin");
  const batTmax        = $("batTmax");

  // Gouverne — 4 gouvernes
  const gouvStatusBadge     = $("gouvStatusBadge");
  const gouvBannerDot       = $("gouvBannerDot");
  const gouvPosPct          = $("gouvPosPct");
  const gouvPosInput        = $("gouvPosInput");
  const sendGouvPosBtn      = $("sendGouvPosBtn");
  const gouvCommandFeedback = $("gouvCommandFeedback");
  const gouvSelectAll       = $("gouvSelectAll");

  // Checkboxes gouvernes
  const cbGouvs = {
    sup: $("cbGouvSup"),
    tri: $("cbGouvTri"),
    inf: $("cbGouvInf"),
    bab: $("cbGouvBab")
  };

  // 4 gouvernes : données
  const GOUVERNES = ["sup","tri","inf","bab"];
  const gouvData = {
    sup: { pos:0, vit:0, cpl:0, sw:1 },
    tri: { pos:0, vit:0, cpl:0, sw:1 },
    inf: { pos:0, vit:0, cpl:0, sw:1 },
    bab: { pos:0, vit:0, cpl:0, sw:1 }
  };

  // Système
  const systBackend = $("systBackend");
  const systUptime  = $("systUptime");

  // Journaux
  const logList = $("logList");

  // Modal
  const modal             = $("deviceModal");
  const closeModalBtn     = $("closeModalBtn");
  const modalTitle        = $("modalTitle");
  const modalSubtitle     = $("modalSubtitle");
  const modalStatus       = $("modalStatus");
  const modalCurrent      = $("modalCurrent");
  const modalThreshold    = $("modalThreshold");
  const deviceChartCanvas = $("deviceChart");


  /* ════════════════════════════════
     UTILITAIRES COULEUR
     ok = vert  warn = orange  error = rouge
  ════════════════════════════════ */
  // Applique ok/warn/error sur un élément texte
  function colorEl(el, state) {
    if (!el) return;
    el.classList.remove("val-ok","val-warn","val-error");
    el.classList.add("val-" + state);
  }

  // Calcule l'état selon 3 zones : [ok si dans plage, warn si proche seuil, error si hors plage]
  // warnPct : % d'approche du seuil pour déclencher orange (ex: 0.85 = alerte à 85% du max)
  function rangeState(val, min, max, warnPct = 0.85) {
    if (val < min || val > max)                            return "error";
    if (val < min + (max-min)*(1-warnPct) ||
        val > max * warnPct)                               return "warn";
    return "ok";
  }

  // Calcule l'état uniquement par rapport à un max
  function maxState(val, max, warnPct = 0.85) {
    if (val >= max)           return "error";
    if (val >= max * warnPct) return "warn";
    return "ok";
  }

  // Calcule l'état pour un booléen (0 = ok, sinon error)
  function boolState(val) { return val === 0 ? "ok" : "error"; }

  /* ════════════════════════════════
     NAVIGATION
  ════════════════════════════════ */
  const subtitles = {
    dashboard: "Supervision temps réel des équipements",
    moteur:    "Commande et suivi du moteur principal",
    gouverne:  "Positionneur — retour position, vitesse et couple",
    sequence:  "Séquence manuelle · 10 étapes ou automatique",
    sensors:   "Retour d'état des capteurs",
    batteries: "Surveillance énergétique et thermique",
    systeme:   "Informations système et diagnostics"
  };
  const pageTitles = {
    dashboard:"Vue générale", moteur:"Moteur", gouverne:"Gouverne",
    sensors:"Capteurs", batteries:"Batteries", systeme:"Système"
  };

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
     ÉTAT / SIMULATION
  ════════════════════════════════ */
  let isPaused = false;
  let uptimeSeconds = 0;

  const simMotor   = { status:"RUN", rpm_actual:1450, rpm_cmd:1500, temperature:39 };
  const simSensors = { water:0, pressure:1.02, temperature:43 };
  const simBattery = { level:78, temperature:31, etat:"Charge", umin:3.62, umax:3.79, tmin:24, tmax:31 };
  const simGouv    = { position:120.5, vitesse:18, couple:7, statut_word:1, txpdo_ms:50, node_id:2 };

  /* ════════════════════════════════
     JOURNAL
  ════════════════════════════════ */
  function addLog(msg, level = "info") {
    if (!logList) return;
    const now = new Date();
    const ts  = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
    const item = document.createElement("div");
    item.className = `log-item ${level}`;
    item.innerHTML = `<span class="log-time">${ts}</span><span class="log-text">${msg}</span>`;
    logList.prepend(item);
    while (logList.children.length > 10) logList.removeChild(logList.lastChild);
  }

  /* ════════════════════════════════
     HORLOGE & UPTIME
  ════════════════════════════════ */
  setInterval(() => {
    uptimeSeconds++;
    if (systUptime) {
      const h = String(Math.floor(uptimeSeconds/3600)).padStart(2,"0");
      const m = String(Math.floor((uptimeSeconds%3600)/60)).padStart(2,"0");
      const s = String(uptimeSeconds%60).padStart(2,"0");
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
    addLog("⚠ Shutdown système demandé", "warn");
    window.alert("Shutdown simulé envoyé.");
  }
  if (globalShutdownBtn) globalShutdownBtn.addEventListener("click", handleShutdown);

  /* ════════════════════════════════
     IHMCHART — MOTEUR GRAPHE CANVAS
  ════════════════════════════════ */
  function IHMChart(canvas, cfg) {
    if (!canvas) return null;
    const PAD = { top:28, right:20, bottom:44, left:52 };
    const MAX_PTS = cfg.maxPoints || 12;
    const series  = cfg.series.map(s => ({ label:s.label, color:s.color, fill:s.fill!==false, data:[...(s.data||[])], hidden:false }));
    let   labels  = [...(cfg.labels||[])];
    let   tooltip = null;

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { tooltip=null; draw(); });

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const plotW = (canvas.clientWidth||400) - PAD.left - PAD.right;
      const n = labels.length;
      if (n < 2) return;
      let best=0, bestDx=Infinity;
      for (let i=0;i<n;i++) {
        const dx = Math.abs(PAD.left + i/(n-1)*plotW - mx);
        if (dx < bestDx) { bestDx=dx; best=i; }
      }
      tooltip = { idx:best }; draw();
    }

    function draw() {
      const dpr = window.devicePixelRatio||1;
      const W0  = canvas.clientWidth  || 400;
      const H0  = canvas.clientHeight || 280;
      canvas.width  = W0*dpr; canvas.height = H0*dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const W=W0, H=H0;
      ctx.clearRect(0,0,W,H);

      const plotW = W - PAD.left - PAD.right;
      const plotH = H - PAD.top  - PAD.bottom;
      const n     = labels.length;
      if (n===0) return;

      let yMin=Infinity, yMax=-Infinity;
      series.forEach(s => { if(s.hidden) return; s.data.forEach(v => { if(v<yMin)yMin=v; if(v>yMax)yMax=v; }); });
      if (yMin===Infinity) { yMin=0; yMax=100; }
      const range = yMax-yMin || 1;
      yMin -= range*0.12; yMax += range*0.12;

      const xAt = i => PAD.left + (n>1 ? i/(n-1) : 0.5)*plotW;
      const yAt = v => PAD.top  + (1-(v-yMin)/(yMax-yMin))*plotH;

      for (let t=0;t<=5;t++) {
        const gy = yAt(yMin+(yMax-yMin)*(t/5));
        ctx.strokeStyle="rgba(42,140,255,0.07)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(PAD.left,gy); ctx.lineTo(PAD.left+plotW,gy); ctx.stroke();
        ctx.fillStyle="#4a6580"; ctx.font="11px Segoe UI,sans-serif"; ctx.textAlign="right";
        ctx.fillText(Math.round(yMin+(yMax-yMin)*(t/5)), PAD.left-6, gy+4);
      }

      const showEvery = Math.max(1,Math.ceil(n/8));
      for (let i=0;i<n;i++) {
        const gx = xAt(i);
        ctx.strokeStyle="rgba(42,140,255,0.06)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(gx,PAD.top); ctx.lineTo(gx,PAD.top+plotH); ctx.stroke();
        if (i%showEvery===0||i===n-1) {
          ctx.fillStyle="#4a6580"; ctx.font="10px Segoe UI,sans-serif"; ctx.textAlign="center";
          ctx.fillText(labels[i]||"", gx, PAD.top+plotH+16);
        }
      }

      ctx.strokeStyle="rgba(42,140,255,0.15)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(PAD.left,PAD.top); ctx.lineTo(PAD.left,PAD.top+plotH); ctx.lineTo(PAD.left+plotW,PAD.top+plotH); ctx.stroke();

      series.forEach(s => {
        if (s.hidden || s.data.length<1) return;
        const pts = s.data.map((v,i) => [xAt(i),yAt(v)]);
        if (s.fill) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], PAD.top+plotH);
          pts.forEach(([x,y]) => ctx.lineTo(x,y));
          ctx.lineTo(pts[pts.length-1][0], PAD.top+plotH);
          ctx.closePath();
          const m = s.color.match(/\d+/g);
          ctx.fillStyle = m ? `rgba(${m[0]},${m[1]},${m[2]},0.07)` : "rgba(42,140,255,0.07)";
          ctx.fill();
        }
        ctx.beginPath(); ctx.strokeStyle=s.color; ctx.lineWidth=2; ctx.lineJoin="round";
        ctx.moveTo(pts[0][0],pts[0][1]);
        for (let i=1;i<pts.length;i++) {
          const cpx=(pts[i-1][0]+pts[i][0])/2;
          ctx.bezierCurveTo(cpx,pts[i-1][1],cpx,pts[i][1],pts[i][0],pts[i][1]);
        }
        ctx.stroke();
        pts.forEach(([x,y]) => {
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
          ctx.fillStyle=s.color; ctx.fill();
          ctx.strokeStyle="rgba(2,13,26,0.8)"; ctx.lineWidth=1.5; ctx.stroke();
        });
      });

      // légende
      let lx = PAD.left;
      series.forEach(s => {
        ctx.globalAlpha = s.hidden ? 0.3 : 1;
        ctx.fillStyle=s.color; ctx.fillRect(lx,10,12,3);
        ctx.fillStyle="#6d8aab"; ctx.font="11px Segoe UI,sans-serif"; ctx.textAlign="left";
        ctx.fillText(s.label, lx+16, 16);
        ctx.globalAlpha=1;
        lx += ctx.measureText(s.label).width+36;
      });

      // tooltip
      if (tooltip!==null && tooltip.idx<n) {
        const i=tooltip.idx, gx=xAt(i);
        ctx.strokeStyle="rgba(42,140,255,0.3)"; ctx.lineWidth=1;
        ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.moveTo(gx,PAD.top); ctx.lineTo(gx,PAD.top+plotH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font="11px Segoe UI,sans-serif";
        const lines = series.filter(s=>!s.hidden).map(s=>`${s.label}: ${s.data[i]!==undefined?Math.round(s.data[i]*100)/100:"–"}`);
        const bw=Math.max(...lines.map(l=>ctx.measureText(l).width+24),100);
        const bh=lines.length*18+22;
        let bx=gx+10, by=PAD.top;
        if (bx+bw>W-10) bx=gx-bw-10;
        ctx.fillStyle="#061525"; ctx.strokeStyle="rgba(42,140,255,0.3)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle="#9aa7b8"; ctx.textAlign="left";
        ctx.fillText(labels[i]||`T${i}`, bx+10, by+14);
        series.filter(s=>!s.hidden).forEach((s,li)=>{ ctx.fillStyle=s.color; ctx.fillText(lines[li],bx+10,by+28+li*17); });
        series.filter(s=>!s.hidden).forEach(s=>{
          if(s.data[i]===undefined)return;
          ctx.beginPath(); ctx.arc(gx,yAt(s.data[i]),5,0,Math.PI*2);
          ctx.fillStyle=s.color; ctx.fill();
          ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.stroke();
        });
      }
    }

    draw();
    return {
      push(label, values) {
        labels.push(label);
        values.forEach((v,i)=>{ if(series[i]) series[i].data.push(v); });
        if (labels.length>MAX_PTS) { labels.shift(); series.forEach(s=>s.data.shift()); }
        draw();
      },
      set(newLabels, newSeries) {
        labels=[...newLabels];
        newSeries.forEach((d,i)=>{ if(series[i]) series[i].data=[...d]; });
        draw();
      },
      toggleSeries(idx) { if(series[idx]){ series[idx].hidden=!series[idx].hidden; draw(); } },
      isSeriesHidden(idx) { return series[idx]?.hidden===true; },
      redraw: draw,
      destroy() { ro.disconnect(); canvas.removeEventListener("mousemove",onMove); }
    };
  }

  /* ════════════════════════════════
     GRAPHES
  ════════════════════════════════ */
  const mainChart = IHMChart(mainChartCanvas, {
    maxPoints:12,
    labels:["T1","T2","T3","T4","T5","T6","T7","T8"],
    series:[
      { label:"RPM moteur",       color:"#2a8cff", data:[900,1100,1250,1380,1450,1490,1430,1450] },
      { label:"Température (°C)", color:"#f5a623", data:[34,36,37,39,40,42,41,42] }
    ]
  });

  const motorChart = IHMChart(motorChartCanvas, {
    maxPoints:20, labels:[],
    series:[
      { label:"RPM actuel",    color:"#2a8cff", data:[], fill:true },
      { label:"T°Smo1 (°C)",   color:"#f5a623", data:[], fill:false },
      { label:"T°Smo2 (°C)",   color:"#ff6b6b", data:[], fill:false },
      { label:"T°Smo3 (°C)",   color:"#a78bfa", data:[], fill:false },
      { label:"T°Plaque (°C)", color:"#fb923c", data:[], fill:false }
    ]
  });

  function pushMotorChart(rpm, temp, t1, t2, t3, tP) {
    if (!motorChart) return;
    const now = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    motorChart.push(now, [rpm??0, t1??temp??0, t2??temp??0, t3??temp??0, tP??temp??0]);
  }

  /* ════════════════════════════════
     TOGGLE SÉRIES
  ════════════════════════════════ */
  // Graphe 4 gouvernes
  const gouvChartCanvas = $("gouvChart");
  const gouvChart = IHMChart(gouvChartCanvas, {
    maxPoints: 30,
    labels: [],
    series: [
      { label: "Supérieure", color: "#7b5af5", data: [] },
      { label: "Tribord",    color: "#2a8cff", data: [] },
      { label: "Inférieure", color: "#18d97a", data: [] },
      { label: "Babord",     color: "#f5a623", data: [] }
    ]
  });

  const chartRegistry = { mainChart, motorChart, gouvChart };

  document.querySelectorAll(".chart-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx   = parseInt(btn.dataset.series, 10);
      const chart = chartRegistry[btn.dataset.chart];
      if (!chart) return;
      chart.toggleSeries(idx);
      btn.classList.toggle("active", !chart.isSeriesHidden(idx));
    });
  });

  /* ════════════════════════════════
     WEBSOCKET — logique IHM acoustique
  ════════════════════════════════ */
  let ws          = null;
  let isConnected = false;
  let wsPingInterval = null;

  const connectionStatus = $("connectionStatus");
  const errorMessage     = $("errorMessage");

  function showConnError(msg) {
    if (errorMessage) { errorMessage.textContent = msg; errorMessage.className = "conn-error-bar"; }
    addLog(`Erreur : ${msg}`, "warn");
  }

  function clearConnError() {
    if (errorMessage) { errorMessage.textContent = ""; errorMessage.className = "conn-error-bar hidden"; }
  }

  function setConnectedUI(connected) {
    isConnected = connected;
    if (connectionStatus) {
      connectionStatus.textContent = connected ? "Connecté" : "Déconnecté";
      connectionStatus.className   = connected ? "conn-status-bar success" : "conn-status-bar";
    }
    if (btnConnect)    btnConnect.disabled    = connected;
    if (btnDisconnect) btnDisconnect.disabled = !connected;
    if (sidebarBackendStatus) sidebarBackendStatus.textContent = connected ? "Connecté" : "–";
    if (systBackend)          systBackend.textContent          = connected ? "Connecté" : "–";
    addLog(connected ? "WebSocket connecté" : "WebSocket déconnecté", connected ? "info" : "warn");
  }

  function validateAndBuildUrl() {
    const ip   = (wsIpInput?.value   || "").trim();
    const port = (wsPortInput?.value || "").trim();
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip))                           return { error: "Adresse IP invalide" };
    if (ip.split(".").some(o => parseInt(o,10) > 255)) return { error: "Adresse IP invalide (octets > 255)" };
    if (!port || isNaN(parseInt(port,10)))             return { error: "Port invalide" };
    return { url: `ws://${ip}:${port}/` };
  }

  function wsConnect() {
    clearConnError();
    if (ws && ws.readyState !== WebSocket.CLOSED) ws.close();

    const result = validateAndBuildUrl();
    if (result.error) { showConnError(result.error); return; }

    if (connectionStatus) { connectionStatus.textContent = "Connexion…"; connectionStatus.className = "conn-status-bar"; }
    if (btnConnect) btnConnect.disabled = true;
    addLog(`Tentative connexion → ${result.url}`, "info");

    try { ws = new WebSocket(result.url); }
    catch(e) {
      showConnError("Erreur de connexion : " + e.message);
      if (btnConnect) btnConnect.disabled = false;
      return;
    }

    ws.onopen = () => {
      setConnectedUI(true);
      wsPingInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify({ type: "ping" })); } catch(_) {}
        }
      }, 5000);
    };

    ws.onerror = () => {
      showConnError("Erreur de connexion au serveur");
      setConnectedUI(false);
    };

    ws.onclose = (e) => {
      clearInterval(wsPingInterval);
      setConnectedUI(false);
      addLog(`WebSocket fermé (code ${e.code})`, "info");
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "pong") return;
        if (data.motor)    renderMotor(data.motor);
        if (data.sensors)  renderSensors(data.sensors);
        if (data.battery)  renderBattery(data.battery);
        if (data.gouverne) renderGouv(data.gouverne);
        if (data.rpm_actual !== undefined || data.status === "RUN" || data.status === "STOP") renderMotor(data);
      } catch(_) { addLog(`WS msg: ${evt.data.toString().substring(0,60)}`, "info"); }
    };
  }

  async function wsDisconnect() {
    if (!ws || ws.readyState !== WebSocket.OPEN) { showConnError("Aucune connexion active"); return; }
    clearInterval(wsPingInterval);
    try {
      const ip   = wsIpInput?.value.trim()   || "127.0.0.1";
      const port = wsPortInput?.value.trim() || "5500";
      try {
        const res = await fetch(`http://${ip}:${port}/disconnect`);
        if (res.ok) { const d = await res.json(); addLog(d.message || "Déconnexion OK", "info"); }
      } catch(_) { addLog("Fermeture socket directe", "info"); }
      ws.close(); ws = null;
      setConnectedUI(false);
    } catch(e) { showConnError("Erreur déconnexion : " + e.message); }
  }

  if (btnConnect)    btnConnect.addEventListener("click",    wsConnect);
  if (btnDisconnect) btnDisconnect.addEventListener("click", wsDisconnect);

  /* ════════════════════════════════
     RENDER MOTEUR
  ════════════════════════════════ */
  function renderMotor(m) {
    if (!m) return;
    const rpm  = m.rpm_actual  ?? simMotor.rpm_actual;
    const rpmC = m.rpm_cmd     ?? simMotor.rpm_cmd;
    const temp = m.temperature ?? simMotor.temperature;
    const st   = m.status      ?? simMotor.status;

    // ── Textes ──
    if (motorStatus)      motorStatus.textContent      = st;
    if (motorRpmActual)   motorRpmActual.textContent   = `${rpm} tr/min`;
    if (motorRpmCmd)      motorRpmCmd.textContent      = `${rpmC} tr/min`;
    if (motorTemperature) motorTemperature.textContent = `${temp} °C`;

    // ── Couleurs RPM : vert < RPMCrete, orange < RPMMax, rouge >= RPMMax ──
    const rpmSt = rpm >= CFG.moteur.rpmMax    ? "error"
                : rpm >= CFG.moteur.rpmCrete  ? "warn" : "ok";
    colorEl(motorRpmActual, rpmSt);

    // ── Couleur température moteur : vert < 85%TempMax, orange < TempMax, rouge >= TempMax ──
    const tempSt = maxState(temp, CFG.moteur.tempMoteurMax);
    colorEl(motorTemperature, tempSt);
    colorEl(dashMotorTemp, tempSt);

    // ── Jauge RPM basée sur RPMMax réel (4428) ──
    const pct = Math.round(Math.min(100,(rpm / CFG.moteur.rpmMax)*100));
    if (rpmGaugeFill) {
      rpmGaugeFill.style.width = `${pct}%`;
      rpmGaugeFill.style.background =
        rpmSt === "error" ? "linear-gradient(90deg,#f04e68,#ff7a8a)" :
        rpmSt === "warn"  ? "linear-gradient(90deg,#f5a623,#ffc55a)" :
                            "linear-gradient(90deg,#2a8cff,#56a8ff)";
    }
    if (rpmGaugePct) {
      rpmGaugePct.textContent = `${pct}%`;
      colorEl(rpmGaugePct, rpmSt);
    }

    // ── Badge statut ──
    const cls = st==="RUN"?"ok":st==="STOP"?"warn":"danger";
    if (motorStatusBadge) { motorStatusBadge.textContent=st; motorStatusBadge.className=`status-pill ${cls}`; }
    if (motorBannerDot)   { motorBannerDot.className=`motor-banner-dot${st==="RUN"?"":" stop"}`; }

    // ── Dashboard ──
    if (dashMotorStatus) { dashMotorStatus.textContent=st; colorEl(dashMotorStatus, cls==="ok"?"ok":cls==="warn"?"warn":"error"); }
    if (dashRpmActual)   { dashRpmActual.textContent=`${rpm} tr/min`; colorEl(dashRpmActual, rpmSt); }
    if (dashRpmCmd)      dashRpmCmd.textContent = `${rpmC} tr/min`;
    if (dashMotorBadge)  { dashMotorBadge.textContent=st; dashMotorBadge.className=`status-pill ${cls}`; }

    pushMotorChart(rpm, temp);  // t1/t2/t3/tP injectés via renderSensors
  }

  /* ════════════════════════════════
     RENDER CAPTEURS
  ════════════════════════════════ */
  const sensorDefs = [
    { key:"eau",         apiKey:"water",       unit:"",
      interp:v=>v===0?"Aucune présence":"ALERTE – eau !",
      state: v=>v===0?"ok":"error", etat:v=>v===0?"Normal":"Alarme" },
    { key:"pression",    apiKey:"pressure",    unit:" bar",
      interp:v=>v<1.05?"Pression stable":"Pression haute",
      state: v=>v<1.05?"ok":"warn",  etat:v=>v<1.05?"Stable":"Élevée" },
    { key:"temperature", apiKey:"temperature", unit:" °C",
      interp:v=>v<50?"Température normale":v<70?"Température élevée":"SURCHAUFFE",
      state: v=>v<50?"ok":v<70?"warn":"error", etat:v=>v<50?"Normal":v<70?"Élevée":"Critique" }
  ];

  function renderSensors(data) {
    // ── Eau : 0 = pas d'eau (ok), 1 = présence (error) ──
    const rawEau = data?.water ?? simSensors.water;
    const stEau  = boolState(rawEau);
    if (sensorEls.eau.led)    sensorEls.eau.led.dataset.state  = stEau;
    if (sensorEls.eau.retour) {
      sensorEls.eau.retour.textContent = rawEau===0 ? "Pas d'eau (0)" : "EAU DÉTECTÉE (1)";
      colorEl(sensorEls.eau.retour, stEau);
    }
    if (dashLedEau) dashLedEau.dataset.state = stEau;

    // ── Pression : min=0.5, max=1.5, std=1.0324
    //    vert : dans [min..max] et proche std
    //    orange : dans [min..max] mais éloigné std
    //    rouge : hors [min..max]
    const rawPres = data?.pressure ?? simSensors.pressure;
    const stPres  = rawPres < CFG.pression.min || rawPres > CFG.pression.max ? "error"
                  : Math.abs(rawPres - CFG.pression.std) > 0.15 ? "warn" : "ok";
    if (sensorEls.pression.led) sensorEls.pression.led.dataset.state = stPres;
    if (sensorEls.pression.retour) {
      sensorEls.pression.retour.textContent = rawPres.toFixed(3) + " bar";
      colorEl(sensorEls.pression.retour, stPres);
    }
    if (dashLedPression) dashLedPression.dataset.state = stPres;

    // ── Températures moteur (4 sondes) ──
    // TempSmo1/2/3 : max=70°C, orange à 85% (59.5°C)
    // TempPlaque   : max=130°C, orange à 85% (110.5°C)
    const t1 = data?.TempSmo1_mes   ?? simSensors.temperature;
    const t2 = data?.TempSmo2_mes   ?? simSensors.temperature;
    const t3 = data?.TempSmo3_mes   ?? simSensors.temperature;
    const tP = data?.TempPlaque_mes ?? simSensors.temperature;

    const stSmo   = v => maxState(v, CFG.moteur.tempMoteurMax);
    const stPlaq  = v => maxState(v, CFG.moteur.tempPlaqueMax);

    [[sensorEls.temp1, t1, stSmo],[sensorEls.temp2, t2, stSmo],
     [sensorEls.temp3, t3, stSmo],[sensorEls.tempPlaque, tP, stPlaq]].forEach(([el, val, fn]) => {
      const st = fn(val);
      if (el.led)    el.led.dataset.state  = st;
      if (el.retour) { el.retour.textContent = val + " °C"; colorEl(el.retour, st); }
    });

    // Dashboard LED température
    const dl1 = $("dashLedTemp1"); if(dl1) dl1.dataset.state = stSmo(t1);
    const dl2 = $("dashLedTemp2"); if(dl2) dl2.dataset.state = stSmo(t2);
    const dl3 = $("dashLedTemp3"); if(dl3) dl3.dataset.state = stSmo(t3);
    const dlP = $("dashLedTempP"); if(dlP) dlP.dataset.state = stPlaq(tP);
    if (dashLedTemp) dashLedTemp.dataset.state = stSmo((t1+t2+t3)/3);
  }

  /* ════════════════════════════════
     RENDER BATTERIE
  ════════════════════════════════ */
  function renderBattery(b) {
    const d     = b || simBattery;
    const level = Math.round(d.level ?? 78);
    const pct   = `${level}%`;

    // Barre niveau
    if (batPctText) batPctText.textContent = pct;
    if (batBarFill) {
      batBarFill.style.width = pct;
      batBarFill.className   = `bat-bar-fill${level<20?" low":level<40?" warn":""}`;
    }

    // État BMS — stSBA2SCG_ETAT
    const setVal = (id, val, unit="") => { const el=$( id); if(el) el.textContent = val!==undefined&&val!==null ? val+unit : "–"; };
    setVal("batI",       d.batt_i     ?? d.i,        " A");
    setVal("batU",       d.batt_u     ?? d.u,        " V");
    setVal("batUCharge", d.batt_uCharge,              " V");
    setVal("batUDech",   d.batt_uDech,                " V");
    setVal("batTemp",    d.batt_T ?? d.temperature,  " °C");
    setVal("batPower",   d.batt_Power,                " W");
    setVal("batCapacite",d.batt_Capacite,             " Ah");
    setVal("batEnergie", d.batt_Energie,              " Wh");

    // stSba2Scg_Info
    setVal("batUelmin",  d.uelmin ?? d.umin,  " V");
    setVal("batUelmax",  d.uelmax ?? d.umax,  " V");
    setVal("batTmin",    d.Tmin   ?? d.tmin,  " °C");
    setVal("batTmax",    d.Tmax   ?? d.tmax,  " °C");
    setVal("batBMSstate",d.BMSstate);

    // stSba2Scg_EltTension
    setVal("batUelt1",  d.uelement1, " V");
    setVal("batUelt2",  d.uelement2, " V");
    setVal("batUelt3",  d.uelement3, " V");
    setVal("batUelt4",  d.uelement4, " V");

    // stSba2Scg_EltTemperature
    setVal("batT1Disque", d.t1_disque, " °C");
    setVal("batT2Disque", d.t2_disque, " °C");

    // Config tensions
    if ($("batUmin")) $("batUmin").textContent = `${d.umin??3.62} V`;
    if ($("batUmax")) $("batUmax").textContent = `${d.umax??3.79} V`;

    // Dashboard
    if (dashBatLevel)  dashBatLevel.textContent  = pct;
    const temp = d.batt_T ?? d.temperature ?? 31;
    if (dashBatTemp)   dashBatTemp.textContent   = `${temp}°C`;
    if (dashBatEtat)   dashBatEtat.textContent   = d.etat ?? "–";
    if (dashBatAlarme) { dashBatAlarme.textContent="Aucune"; dashBatAlarme.className="success-text"; }

    // ── Couleurs selon seuils batterie réels ──
    const temp = d.batt_T ?? d.temperature ?? 31;
    const uBat  = parseFloat(d.batt_u   ?? 0);
    const iBat  = parseFloat(d.batt_i   ?? 0);
    const uelMin= parseFloat(d.uelmin   ?? 3.62);
    const uelMax= parseFloat(d.uelmax   ?? 3.79);

    // Température : max=64°C, orange à 85% (54.4°C)
    const stTemp = maxState(temp, CFG.batterie.tempMax);
    colorEl($("batTemp"), stTemp);
    colorEl(dashBatTemp, stTemp);

    // Tension pack : min=337.5V, max=567V
    const stU = uBat > 0 ? rangeState(uBat, CFG.batterie.tensionMin, CFG.batterie.tensionMax) : "ok";
    colorEl($("batU"), stU);

    // Courant : max=70A
    const stI = iBat > 0 ? maxState(Math.abs(iBat), CFG.batterie.courantMax) : "ok";
    colorEl($("batI"), stI);

    // Tensions éléments : min=2.7V, max=4.20V
    const stUel = rangeState(uelMin, CFG.batterie.tensionEltMin, CFG.batterie.tensionEltMax);
    colorEl($("batUelmin"), stUel);
    const stUelMax = rangeState(uelMax, CFG.batterie.tensionEltMin, CFG.batterie.tensionEltMax);
    colorEl($("batUelmax"), stUelMax);

    // Températures disques : max=60°C (TempEltMax)
    const stTd1 = maxState(parseFloat(d.t1_disque??0), CFG.batterie.tempEltMax);
    const stTd2 = maxState(parseFloat(d.t2_disque??0), CFG.batterie.tempEltMax);
    colorEl($("batT1Disque"), stTd1);
    colorEl($("batT2Disque"), stTd2);

    // Niveau barre
    const stLvl = level < 20 ? "error" : level < 40 ? "warn" : "ok";
    colorEl(dashBatLevel, stLvl);

    const anyBatAlert = stTemp==="error"||stU==="error"||stI==="error"||stLvl==="error";
    const anyBatWarn  = !anyBatAlert&&(stTemp==="warn"||stU==="warn"||stI==="warn"||stLvl==="warn");
    const batState    = anyBatAlert?"error":anyBatWarn?"warn":"ok";
    const batLabel    = anyBatAlert?"ALERTE":anyBatWarn?"ATTENTION":"OK";

    if (batStatusBadge) { batStatusBadge.textContent=batLabel; batStatusBadge.className=`status-pill ${batState}`; }
    if (dashBatBadge)   { dashBatBadge.textContent=batLabel;   dashBatBadge.className=`status-pill ${batState}`; }
  }

  /* ════════════════════════════════
     RENDER GOUVERNE
  ════════════════════════════════ */
  function renderGouv(g) {
    const src = g || simGouv;
    let anyAlert = false;

    GOUVERNES.forEach(key => {
      const d   = src[key] || simGouv[key] || {};
      const pos = d.position    !== undefined ? d.position    : 0;
      const vit = d.vitesse     !== undefined ? d.vitesse     : 0;
      const cpl = d.couple      !== undefined ? d.couple      : 0;
      const sw  = d.statut_word !== undefined ? d.statut_word : 1;

      gouvData[key] = { pos, vit, cpl, sw };

      const K = key.charAt(0).toUpperCase() + key.slice(1);

      // ── Position : vert si dans ±limitBattement (16.5°)
      //              orange si entre 80%–100% de la limite, rouge si dépassé ──
      const posAlerte = Math.abs(pos) > CFG.gouverne.limitBattement;
      const posWarn   = !posAlerte && Math.abs(pos) > CFG.gouverne.limitBattement * 0.80;
      const posSt     = posAlerte ? "error" : posWarn ? "warn" : "ok";

      // ── Vitesse : max=2000, orange à 80% (1600) ──
      const vitAlerte = vit > CFG.gouverne.maxVelocity;
      const vitWarn   = !vitAlerte && vit > CFG.gouverne.maxVelocity * 0.80;
      const vitSt     = vitAlerte ? "error" : vitWarn ? "warn" : "ok";

      const isOk = (sw===0||sw===1) && !posAlerte && !vitAlerte;

      const setTdColor = (id, v, st) => { const e=$(id); if(!e) return; e.textContent=v; colorEl(e, st); };
      setTdColor('g' + K + '_pos', pos.toFixed(1) + "°", posSt);
      setTdColor('g' + K + '_vit', vit,                  vitSt);
      const eCpl=$('g'+K+'_cpl'); if(eCpl) eCpl.textContent=cpl;
      const eSw =$('g'+K+'_sw');  if(eSw)  eSw.textContent=sw;

      const led = $('ledGouv' + K);
      if (led) led.dataset.state = isOk ? "ok" : posAlerte ? "error" : "warn";
      if (!isOk) anyAlert = true;

      const pct = Math.round(((pos+150)/300)*100);
      const bar = $('gouvBar' + K);
      if (bar) bar.style.width = Math.max(0,Math.min(100,pct)) + '%';
    });

    if (gouvChart) {
      const now = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
      gouvChart.push(now, [gouvData.sup.pos, gouvData.tri.pos, gouvData.inf.pos, gouvData.bab.pos]);
    }

    if (gouvPosPct) gouvPosPct.textContent =
      'Sup:' + gouvData.sup.pos.toFixed(1) + '° Tri:' + gouvData.tri.pos.toFixed(1) +
      '° Inf:' + gouvData.inf.pos.toFixed(1) + '° Bab:' + gouvData.bab.pos.toFixed(1) + '°';

    if (gouvStatusBadge) {
      gouvStatusBadge.textContent = anyAlert ? "ALERTE" : "OK";
      gouvStatusBadge.className   = 'status-pill ' + (anyAlert ? "danger" : "ok");
    }
    if (gouvBannerDot) {
      gouvBannerDot.className = 'motor-banner-dot' + (anyAlert ? " error" : "");
    }
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ════════════════════════════════
     RENDER STATUS
  ════════════════════════════════ */
  function renderStatus(s) {
    if (!s) return;
    if (sidebarBackendStatus) sidebarBackendStatus.textContent = s.server_status||"–";
    if (systBackend)          systBackend.textContent          = s.server_status||"–";
  }

  /* ════════════════════════════════
     API
  ════════════════════════════════ */
  async function safeFetch(url) {
    try { const r=await fetch(url); if(!r.ok) throw new Error(); return r.json(); }
    catch { return null; }
  }

  async function refreshAll() {
    if (isPaused) return;
    const [status, motor, sensors, battery, gouverne] = await Promise.all([
      safeFetch(`${API_BASE}/status`),
      safeFetch(`${API_BASE}/motor`),
      safeFetch(`${API_BASE}/sensors`),
      safeFetch(`${API_BASE}/battery`),
      safeFetch(`${API_BASE}/gouverne`)
    ]);
    renderStatus(status);
    renderMotor(motor||simMotor);
    renderSensors(sensors);
    renderBattery(battery);
    if (gouverne) renderGouv(gouverne);
  }

  /* ════════════════════════════════
     COMMANDES
  ════════════════════════════════ */
  async function sendMotorRpm() {
    if (!rpmInput) return;
    const val = parseInt(rpmInput.value,10);
    if (isNaN(val)||val<0||val>3000) {
      if (motorCommandFeedback) motorCommandFeedback.textContent="⚠ Valeur RPM invalide (0–3000).";
      return;
    }
    simMotor.rpm_cmd = val;
    try {
      const r = await fetch(`${API_BASE}/motor/rpm_cmd`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rpm_cmd:val})});
      const d = await r.json();
      if (!r.ok||d.ok===false) { if(motorCommandFeedback) motorCommandFeedback.textContent=d.message||"⚠ Erreur."; return; }
    } catch(_){}
    if (motorCommandFeedback) motorCommandFeedback.textContent=`✓ Consigne envoyée : ${val} tr/min`;
    addLog(`Consigne RPM : ${val} tr/min`,"info");
    await refreshAll();
  }

  async function sendGouvPosition() {
    if (!gouvPosInput) return;
    const val = parseFloat(gouvPosInput.value);
    if (isNaN(val) || val < -150 || val > 150) {
      if (gouvCommandFeedback) gouvCommandFeedback.textContent = "⚠ Position invalide (−150 à +150).";
      return;
    }

    // Collecter les gouvernes sélectionnées
    const selected = GOUVERNES.filter(k => cbGouvs[k]?.checked);
    if (selected.length === 0) {
      if (gouvCommandFeedback) gouvCommandFeedback.textContent = "⚠ Aucune gouverne sélectionnée.";
      return;
    }

    // Appliquer en simulation et envoyer à l'API
    selected.forEach(k => { simGouv[k].position = val; });

    const names = selected.map(cap).join(", ");
    try {
      await Promise.all(selected.map(k =>
        fetch(`${API_BASE}/gouverne/${k}/position_cmd`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position_cmd: val })
        }).catch(() => null)
      ));
    } catch(_) {}

    if (gouvCommandFeedback) gouvCommandFeedback.textContent = `✓ Consigne ${val}° → ${names}`;
    addLog(`Gouvernes [${names}] — position : ${val}°`, "info");
    renderGouv(null);
  }

  // Bouton "Tout sélectionner / Tout désélectionner"
  if (gouvSelectAll) {
    gouvSelectAll.addEventListener("click", () => {
      const anyUnchecked = GOUVERNES.some(k => !cbGouvs[k]?.checked);
      GOUVERNES.forEach(k => { if (cbGouvs[k]) cbGouvs[k].checked = anyUnchecked; });
      gouvSelectAll.textContent = anyUnchecked ? "Tout désélectionner" : "Tout sélectionner";
    });
  }


  /* ════════════════════════════════
     SÉQUENCE — 10 étapes + auto
  ════════════════════════════════ */
  const seqState = Array(11).fill(false); // index 1–10
  let seqAutoRunning = false;
  let seqAutoTimer   = null;
  let seqAutoCurrent = 0;

  // Toggles OUI/NON
  for (let i = 1; i <= 10; i++) {
    const toggle = $("seqToggle" + i);
    const led    = $("seqLed"    + i);
    if (toggle) {
      toggle.addEventListener("click", () => {
        const active = toggle.dataset.active === "1";
        toggle.dataset.active = active ? "0" : "1";
        if (led) led.dataset.state = active ? "unknown" : "warn";
      });
    }
  }

  // Boutons Valider
  for (let i = 1; i <= 10; i++) {
    const btn  = $("seqBtn" + i);
    const led  = $("seqLed" + i);
    const item = btn?.closest(".seq-item");
    if (btn) {
      btn.addEventListener("click", () => {
        seqState[i] = !seqState[i];
        if (seqState[i]) {
          btn.textContent = "✓ OK";
          btn.classList.add("validated");
          if (led)  led.dataset.state = "ok";
          if (item) item.classList.add("seq-done");
        } else {
          btn.textContent = "Valider";
          btn.classList.remove("validated");
          if (led)  led.dataset.state = "unknown";
          if (item) item.classList.remove("seq-done");
        }
        updateSeqBadge();
      });
    }
  }

  function updateSeqBadge() {
    const done  = seqState.slice(1).filter(Boolean).length;
    const badge = $("seqStatusBadge");
    const dot   = $("seqBannerDot");
    if (badge) {
      badge.textContent = done === 10 ? "COMPLET" : done > 0 ? `${done}/10` : "IDLE";
      badge.className   = "status-pill " + (done===10?"ok":done>0?"warn":"");
    }
    if (dot) dot.className = "motor-banner-dot" + (done===10?"":" stop");
  }

  // Séquence automatique
  const seqAutoBtn     = $("seqAutoBtn");
  const seqAutoStopBtn = $("seqAutoStopBtn");
  const seqAutoLed     = $("seqAutoLed");
  const seqAutoLabel   = $("seqAutoLabel");
  const seqAutoBar     = $("seqAutoBar");
  const seqAutoPct     = $("seqAutoPct");
  const seqAutoFeedback= $("seqAutoFeedback");

  function resetSeqAuto() {
    seqAutoCurrent = 0;
    if (seqAutoLed)     seqAutoLed.dataset.state = "unknown";
    if (seqAutoLabel)   seqAutoLabel.textContent  = "En attente";
    if (seqAutoBar)     seqAutoBar.style.width     = "0%";
    if (seqAutoPct)     seqAutoPct.textContent     = "0 / 10";
    if (seqAutoFeedback)seqAutoFeedback.textContent= "Séquence arrêtée.";
    if (seqAutoBtn)     seqAutoBtn.classList.remove("hidden");
    if (seqAutoStopBtn) seqAutoStopBtn.classList.add("hidden");
    // Remettre toutes les LEDs séquence à unknown
    for (let i=1;i<=10;i++) {
      const item=$("seqBtn"+i)?.closest(".seq-item");
      if (item) item.classList.remove("seq-active");
    }
    seqAutoRunning = false;
  }

  function runSeqAutoStep(step) {
    if (!seqAutoRunning || step > 10) {
      if (step > 10) {
        if (seqAutoLed)     seqAutoLed.dataset.state  = "ok";
        if (seqAutoLabel)   seqAutoLabel.textContent   = "Séquence complète ✓";
        if (seqAutoBar)     seqAutoBar.style.width      = "100%";
        if (seqAutoPct)     seqAutoPct.textContent      = "10 / 10";
        if (seqAutoFeedback)seqAutoFeedback.textContent = "✓ Toutes les séquences exécutées.";
        addLog("Séquence automatique terminée", "info");
      }
      resetSeqAuto();
      return;
    }

    seqAutoCurrent = step;
    const pct = Math.round((step-1)/10*100);
    if (seqAutoBar)   seqAutoBar.style.width  = pct + "%";
    if (seqAutoPct)   seqAutoPct.textContent  = `${step-1} / 10`;
    if (seqAutoLabel) seqAutoLabel.textContent = `Exécution étape ${step}…`;
    if (seqAutoLed)   seqAutoLed.dataset.state = "warn";

    // Activer la ligne correspondante
    for (let i=1;i<=10;i++) {
      const item = $("seqBtn"+i)?.closest(".seq-item");
      if (!item) continue;
      item.classList.toggle("seq-active", i===step);
    }
    const led = $("seqLed"+step);
    if (led) led.dataset.state = "warn";

    seqAutoTimer = setTimeout(() => {
      // Valider l'étape
      seqState[step] = true;
      const btn  = $("seqBtn"+step);
      const lled = $("seqLed"+step);
      const item = btn?.closest(".seq-item");
      if (btn)  { btn.textContent="✓ OK"; btn.classList.add("validated"); }
      if (lled) lled.dataset.state = "ok";
      if (item) { item.classList.remove("seq-active"); item.classList.add("seq-done"); }

      addLog(`Séquence ${step} exécutée`, "info");
      runSeqAutoStep(step + 1);
    }, 800);
  }

  if (seqAutoBtn) {
    seqAutoBtn.addEventListener("click", () => {
      if (seqAutoRunning) return;
      seqAutoRunning = true;
      if (seqAutoBtn)     seqAutoBtn.classList.add("hidden");
      if (seqAutoStopBtn) seqAutoStopBtn.classList.remove("hidden");
      if (seqAutoFeedback)seqAutoFeedback.textContent = "Séquence automatique en cours…";
      // Reset toutes les étapes
      for (let i=1;i<=10;i++) {
        seqState[i]=false;
        const b=$("seqBtn"+i); if(b){b.textContent="Valider";b.classList.remove("validated");}
        const l=$("seqLed"+i); if(l) l.dataset.state="unknown";
        const it=b?.closest(".seq-item"); if(it){it.classList.remove("seq-done","seq-active");}
      }
      addLog("Lancement séquence automatique", "info");
      runSeqAutoStep(1);
    });
  }

  if (seqAutoStopBtn) {
    seqAutoStopBtn.addEventListener("click", () => {
      seqAutoRunning = false;
      clearTimeout(seqAutoTimer);
      resetSeqAuto();
      addLog("Séquence automatique arrêtée", "warn");
    });
  }

  // Commandes opérationnelles moteur
  const motorSeqBtn = $("motorSeqBtn");
  const motorRunBtn = $("motorRunBtn");
  const motorSeqLed = $("motorSeqLed");
  const motorRunLed = $("motorRunLed");

  if (motorSeqBtn) {
    motorSeqBtn.addEventListener("click", () => {
      const active = motorSeqBtn.classList.toggle("active");
      if (motorSeqLed) motorSeqLed.dataset.state = active ? "ok" : "unknown";
      if (motorIndSeq) motorIndSeq.dataset.state  = active ? "ok" : "unknown";
      addLog("Moteur — Séquence " + (active?"activée":"désactivée"), "info");
    });
  }

  if (motorRunBtn) {
    motorRunBtn.addEventListener("click", () => {
      const active = motorRunBtn.classList.toggle("active");
      if (motorRunLed) motorRunLed.dataset.state = active ? "ok" : "unknown";
      if (motorIndRun) motorIndRun.dataset.state  = active ? "ok" : "unknown";
      addLog("Moteur — Run " + (active?"activé":"désactivé"), "info");
    });
  }

  // Indicateurs bandeau moteur
  const motorIndStatut = $("motorIndStatut");
  const motorIndSeq    = $("motorIndSeq");
  const motorIndRun    = $("motorIndRun");


  /* ── Homing ── */
  const homingBtn        = $("homingBtn");
  const homingYes        = $("homingYes");
  const homingNo         = $("homingNo");
  const homingValidation = $("homingValidation");
  const homingFeedback   = $("homingFeedback");

  if (homingBtn) {
    homingBtn.addEventListener("click", () => {
      if (homingValidation) homingValidation.classList.remove("hidden");
      if (homingFeedback)   homingFeedback.textContent = "En attente de confirmation…";
    });
  }
  if (homingYes) {
    homingYes.addEventListener("click", async () => {
      if (homingValidation) homingValidation.classList.add("hidden");
      if (homingFeedback)   homingFeedback.textContent = "⟳ Homing en cours…";
      addLog("Homing lancé", "warn");
      try {
        await fetch(`${API_BASE}/gouverne/homing`, { method:"POST" });
      } catch(_) {}
      if (homingFeedback) homingFeedback.textContent = "✓ Homing envoyé.";
    });
  }
  if (homingNo) {
    homingNo.addEventListener("click", () => {
      if (homingValidation) homingValidation.classList.add("hidden");
      if (homingFeedback)   homingFeedback.textContent = "Homing annulé.";
    });
  }

  if (sendRpmBtn)      sendRpmBtn.addEventListener("click",      sendMotorRpm);
  if (sendGouvPosBtn)  sendGouvPosBtn.addEventListener("click",  sendGouvPosition);
  if (refreshBtn)      refreshBtn.addEventListener("click", ()=>{ refreshAll(); addLog("Actualisation manuelle","info"); });

  /* ════════════════════════════════
     SIMULATION TEMPS RÉEL
  ════════════════════════════════ */
  setInterval(() => {
    if (isPaused) return;

    simMotor.rpm_actual  = Math.round(Math.max(1100,Math.min(1600, simMotor.rpm_actual  +(Math.random()*80-40))));
    simMotor.temperature = Math.round(Math.max(30,  Math.min(75,   simMotor.temperature +(Math.random()*4-2))));
    simSensors.temperature = Math.round(Math.max(30,Math.min(75,   simSensors.temperature+(Math.random()*2-1))));
    simSensors.pressure    = Math.round((Math.max(0.9,Math.min(1.1,simSensors.pressure  +(Math.random()*0.02-0.01))))*100)/100;
    simBattery.level       = Math.max(10, simBattery.level-0.01);
    simBattery.temperature = Math.round(Math.max(24,Math.min(45,   simBattery.temperature+(Math.random()*0.4-0.2))));
    simGouv.position       = Math.round((Math.max(-149,Math.min(149,simGouv.position    +(Math.random()*2-1))))*10)/10;
    simGouv.vitesse        = Math.round(Math.max(0,Math.min(30,    simGouv.vitesse      +(Math.random()*2-1))));
    simGouv.couple         = Math.round(Math.max(0,Math.min(25,    simGouv.couple       +(Math.random()*1-0.5))));

    const now = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    if (mainChart) mainChart.push(now,[simMotor.rpm_actual, simMotor.temperature]);
    if (motorChart) motorChart.push(now,[
      simMotor.rpm_actual,
      simSensors.temperature, simSensors.temperature+1, simSensors.temperature-1,
      simMotor.temperature
    ]);

    renderMotor(simMotor);
    renderSensors(null);
    renderBattery(simBattery);
    renderGouv(simGouv);
  }, 2500);

  /* ════════════════════════════════
     INIT
  ════════════════════════════════ */
  renderMotor(simMotor);
  renderSensors(null);
  renderBattery(simBattery);
  renderGouv(simGouv);
  refreshAll();
  setInterval(refreshAll, 5000);

  addLog("Interface IHM démarrée","info");
  addLog("Connexion backend initialisée","info");
  addLog("SMO en fonctionnement nominal","info");
  addLog("Batterie sous surveillance thermique","warn");

});
