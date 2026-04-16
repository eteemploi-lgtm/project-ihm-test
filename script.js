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

  // Gouverne
  const gouvStatusBadge     = $("gouvStatusBadge");
  const gouvBannerDot       = $("gouvBannerDot");
  const gouvPosition        = $("gouvPosition");
  const gouvVitesse         = $("gouvVitesse");
  const gouvCouple          = $("gouvCouple");
  const gouvStatutWord      = $("gouvStatutWord");
  const gouvTxPDO           = $("gouvTxPDO");
  const gouvNodeId          = $("gouvNodeId");
  const gouvPosFill         = $("gouvPosFill");
  const gouvPosPct          = $("gouvPosPct");
  const gouvPosInput        = $("gouvPosInput");
  const sendGouvPosBtn      = $("sendGouvPosBtn");
  const gouvCommandFeedback = $("gouvCommandFeedback");

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
     NAVIGATION
  ════════════════════════════════ */
  const subtitles = {
    dashboard: "Supervision temps réel des équipements",
    moteur:    "Commande et suivi du moteur principal",
    gouverne:  "Positionneur — retour position, vitesse et couple",
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
    maxPoints:12, labels:[],
    series:[
      { label:"RPM actuel",       color:"#2a8cff", data:[] },
      { label:"Température (°C)", color:"#f5a623", data:[] }
    ]
  });

  function pushMotorChart(rpm, temp) {
    if (!motorChart) return;
    const now = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    motorChart.push(now, [rpm??0, temp??0]);
  }

  /* ════════════════════════════════
     TOGGLE SÉRIES
  ════════════════════════════════ */
  const chartRegistry = { mainChart, motorChart };

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

    if (motorStatus)      motorStatus.textContent      = st;
    if (motorRpmActual)   motorRpmActual.textContent   = `${rpm} tr/min`;
    if (motorRpmCmd)      motorRpmCmd.textContent      = `${rpmC} tr/min`;
    if (motorTemperature) motorTemperature.textContent = `${temp} °C`;

    const pct = Math.round(Math.min(100,(rpm/3000)*100));
    if (rpmGaugeFill) rpmGaugeFill.style.width = `${pct}%`;
    if (rpmGaugePct)  rpmGaugePct.textContent  = `${pct}%`;

    const cls = st==="RUN"?"ok":st==="STOP"?"warn":"danger";
    if (motorStatusBadge) { motorStatusBadge.textContent=st; motorStatusBadge.className=`status-pill ${cls}`; }
    if (motorBannerDot)   { motorBannerDot.className=`motor-banner-dot${st==="RUN"?"":" stop"}`; }

    if (dashMotorStatus) dashMotorStatus.textContent = st;
    if (dashRpmActual)   dashRpmActual.textContent   = `${rpm} tr/min`;
    if (dashRpmCmd)      dashRpmCmd.textContent      = `${rpmC} tr/min`;
    if (dashMotorTemp)   dashMotorTemp.textContent   = `${temp} °C`;
    if (dashMotorBadge)  { dashMotorBadge.textContent=st; dashMotorBadge.className=`status-pill ${cls}`; }

    pushMotorChart(rpm, temp);
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
    // Eau
    const rawEau = data?.water ?? simSensors.water;
    const stEau  = rawEau===0 ? "ok" : "error";
    if (sensorEls.eau.led)    sensorEls.eau.led.dataset.state  = stEau;
    if (sensorEls.eau.retour) sensorEls.eau.retour.textContent = rawEau===0 ? "Pas d'eau" : "EAU DÉTECTÉE";
    if (dashLedEau) dashLedEau.dataset.state = stEau;

    // Pression
    const rawPres = data?.pressure ?? simSensors.pressure;
    const stPres  = rawPres < 1.05 ? "ok" : "warn";
    if (sensorEls.pression.led)    sensorEls.pression.led.dataset.state  = stPres;
    if (sensorEls.pression.retour) sensorEls.pression.retour.textContent = rawPres.toFixed(3) + " bar";
    if (dashLedPression) dashLedPression.dataset.state = stPres;

    // Températures (4 sondes)
    const t1 = data?.TempSmo1_mes ?? simSensors.temperature;
    const t2 = data?.TempSmo2_mes ?? simSensors.temperature;
    const t3 = data?.TempSmo3_mes ?? simSensors.temperature;
    const tP = data?.TempPlaque_mes ?? simSensors.temperature;

    [[sensorEls.temp1, t1],[sensorEls.temp2, t2],[sensorEls.temp3, t3],[sensorEls.tempPlaque, tP]].forEach(([el, val]) => {
      const st = val < 50 ? "ok" : val < 80 ? "warn" : "error";
      if (el.led)    el.led.dataset.state  = st;
      if (el.retour) el.retour.textContent = val + " °C";
    });

    // Dashboard LED température — 4 sondes individuelles
    const tempState = v => v < 50 ? "ok" : v < 80 ? "warn" : "error";
    const dl1 = $("dashLedTemp1"); if(dl1) dl1.dataset.state = tempState(t1);
    const dl2 = $("dashLedTemp2"); if(dl2) dl2.dataset.state = tempState(t2);
    const dl3 = $("dashLedTemp3"); if(dl3) dl3.dataset.state = tempState(t3);
    const dlP = $("dashLedTempP"); if(dlP) dlP.dataset.state = tempState(tP);
    // Garder dashLedTemp pour compatibilité éventuelle
    if (dashLedTemp) dashLedTemp.dataset.state = tempState((t1+t2+t3+tP)/4);
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

    const batOk = level>20 && temp<45;
    if (batStatusBadge) { batStatusBadge.textContent=batOk?"OK":"MONITOR"; batStatusBadge.className=`status-pill ${batOk?"ok":"warn"}`; }
    if (dashBatBadge)   { dashBatBadge.textContent=batOk?"OK":"MONITOR";   dashBatBadge.className=`status-pill ${batOk?"ok":"warn"}`; }
  }

  /* ════════════════════════════════
     RENDER GOUVERNE
  ════════════════════════════════ */
  function renderGouv(g) {
    const d   = g || simGouv;
    const pos = d.position    ?? simGouv.position;
    const vit = d.vitesse     ?? simGouv.vitesse;
    const cpl = d.couple      ?? simGouv.couple;
    const sw  = d.statut_word ?? simGouv.statut_word;
    const txp = d.txpdo_ms    ?? simGouv.txpdo_ms;
    const nid = d.node_id     ?? simGouv.node_id;

    if (gouvPosition)   gouvPosition.textContent   = pos.toFixed(1);
    if (gouvVitesse)    gouvVitesse.textContent     = vit;
    if (gouvCouple)     gouvCouple.textContent      = cpl;
    if (gouvStatutWord) gouvStatutWord.textContent  = sw;
    if (gouvTxPDO)      gouvTxPDO.textContent       = `${txp} ms`;
    if (gouvNodeId)     gouvNodeId.textContent      = nid;

    const pct = Math.round(((pos+150)/300)*100);
    if (gouvPosFill) gouvPosFill.style.width = `${Math.max(0,Math.min(100,pct))}%`;
    if (gouvPosPct)  gouvPosPct.textContent  = pos.toFixed(1);

    const isOk = sw===0||sw===1;
    const cls  = isOk?"ok":"warn";
    if (gouvStatusBadge) { gouvStatusBadge.textContent=isOk?"OK":"CHECK"; gouvStatusBadge.className=`status-pill ${cls}`; }
    if (gouvBannerDot)   { gouvBannerDot.className=`motor-banner-dot${isOk?"":" stop"}`; }
  }

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
    if (isNaN(val)||val<-150||val>150) {
      if (gouvCommandFeedback) gouvCommandFeedback.textContent="⚠ Position invalide (−150 à +150).";
      return;
    }
    simGouv.position = val;
    try {
      const r = await fetch(`${API_BASE}/gouverne/position_cmd`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({position_cmd:val})});
      const d = await r.json();
      if (!r.ok||d.ok===false) { if(gouvCommandFeedback) gouvCommandFeedback.textContent=d.message||"⚠ Erreur."; return; }
    } catch(_){}
    if (gouvCommandFeedback) gouvCommandFeedback.textContent=`✓ Consigne envoyée : ${val}`;
    addLog(`Gouverne — position : ${val}`,"info");
    renderGouv(null);
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
