// ── Navigation & UI controller ──────────────────────────────
(function () {

  const views = {
    overview: { el: null, title: 'Vue générale',       sub: 'Connexion WebSocket · Supervision en temps réel' },
    test:     { el: null, title: 'Trame Test',          sub: 'Commande Test 1020 octets · Logs en temps réel' },
    sequence: { el: null, title: 'Trame Séquentielle',  sub: 'Commande Séquentielle 1020 octets · 9 paramètres' },
    resume:   { el: null, title: 'Résumé',              sub: 'Récapitulatif des dernières réponses serveur' },
  };

  let stats = { testSent: 0, seqSent: 0, recv: 0 };
  let activityLog = [];

  // ── Init ──
  document.addEventListener('DOMContentLoaded', () => {

    // Cache view elements
    for (const key in views) {
      views[key].el = document.getElementById('view-' + key);
    }

    // Nav click
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // Quick-action buttons on overview
    document.querySelectorAll('.quick-btn[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.nav));
    });

    // Log button wiring for view-sequence (mirrors logViewer)
    const lv2 = document.getElementById('logViewer2');
    const lm2 = document.getElementById('logMeta2');

    const copyBtn2 = document.getElementById('copyLogsBtn2');
    const clearBtn2 = document.getElementById('clearLogsBtn2');

    if (copyBtn2) copyBtn2.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(lv2?.value || ''); appendLog('SYSTEM','Logs copiés'); } catch (e) {}
    });

    if (clearBtn2) clearBtn2.addEventListener('click', () => {
      if (lv2) lv2.value = '';
      if (lm2) lm2.textContent = '--:--:-- | -- octets | ----';
    });

    // Mirror logs from logViewer to logViewer2
    if (lv2) {
      const observer = new MutationObserver(() => {
        const src = document.getElementById('logViewer');
        if (src) { lv2.value = src.value; lv2.scrollTop = lv2.scrollHeight; }
        const metaSrc = document.getElementById('logMeta');
        if (metaSrc && lm2) lm2.textContent = metaSrc.textContent;
      });
      const srcLv = document.getElementById('logViewer');
      if (srcLv) observer.observe(srcLv, { attributes: true, characterData: true, childList: true });
    }

    // Intercept addLog to update stats & activity
    patchAddLog();

    // Intercept connection status updates
    patchConnectionStatus();

    // Intercept sendStatus for test stat
    patchSendStatus();

    // Intercept seqSendStatus
    patchSeqSendStatus();
  });

  // ── View switcher ──
  function switchView(key) {
    if (!views[key]) return;

    document.querySelectorAll('.nav-item[data-view]').forEach(i => {
      i.classList.toggle('active', i.dataset.view === key);
    });

    for (const k in views) {
      if (views[k].el) views[k].el.classList.toggle('active', k === key);
    }

    const titleEl = document.getElementById('pageTitle');
    const subEl   = document.getElementById('pageSub');
    if (titleEl) titleEl.textContent = views[key].title;
    if (subEl)   subEl.textContent   = views[key].sub;

    // Sync resume view on open
    if (key === 'resume') syncResume();
  }

  // ── Activity feed ──
  function appendLog(type, msg) {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour12: false });
    activityLog.unshift({ type, msg, time });
    if (activityLog.length > 80) activityLog.pop();
    renderActivity();
    updateStats(type);
  }

  function renderActivity() {
    const list = document.getElementById('activityList');
    if (!list) return;
    if (activityLog.length === 0) {
      list.innerHTML = '<div class="activity-empty">Aucune activité pour le moment</div>';
      return;
    }
    list.innerHTML = activityLog.slice(0, 20).map(e => `
      <div class="activity-item">
        <span class="activity-time">${e.time}</span>
        <span class="activity-tag ${e.type}">${e.type}</span>
        <span class="activity-msg">${escHtml(e.msg)}</span>
      </div>
    `).join('');
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function updateStats(type) {
    if (type === 'RECV') {
      stats.recv++;
      document.getElementById('statRecv').textContent = stats.recv;
      const now = new Date();
      document.getElementById('statLastTime').textContent =
        now.toLocaleTimeString('fr-FR',{hour12:false,hour:'2-digit',minute:'2-digit'});
    }
    // testSent / seqSent updated via patch below
  }

  // ── Patch addLog (defined in script.js) ──
  function patchAddLog() {
    // Wait until script.js has loaded its init
    const _orig = window.addLog;
    // Re-patch after DOMContentLoaded cycle
    setTimeout(() => {
      if (typeof window.addLog === 'function') {
        const orig = window.addLog;
        window.addLog = function(type, msg) {
          orig.call(this, type, msg);
          appendLog(type, msg);
          // Mirror to logViewer2
          const lv2 = document.getElementById('logViewer2');
          const lm2 = document.getElementById('logMeta2');
          const lv  = document.getElementById('logViewer');
          const lm  = document.getElementById('logMeta');
          if (lv2 && lv) { lv2.value = lv.value; lv2.scrollTop = lv2.scrollHeight; }
          if (lm2 && lm) lm2.textContent = lm.textContent;
        };
      }
    }, 100);
  }

  // ── Patch connection chip ──
  function patchConnectionStatus() {
    setTimeout(() => {
      if (typeof window.setConnectedUI === 'function') {
        const orig = window.setConnectedUI;
        window.setConnectedUI = function(connected) {
          orig.call(this, connected);
          syncConnectionChip(connected);
        };
      }
    }, 150);
  }

  function syncConnectionChip(connected) {
    const chip = document.getElementById('globalConnectionChip');
    const dot  = document.querySelector('#navConnStatus .dot');
    const lbl  = document.getElementById('navConnLabel');
    if (chip) {
      chip.className = 'chip ' + (connected ? 'connected' : 'disconnected');
      chip.innerHTML = `<span class="chip-dot"></span>${connected ? 'Connecté' : 'Déconnecté'}`;
    }
    if (dot) {
      dot.className = 'dot ' + (connected ? 'connected' : 'disconnected');
    }
    if (lbl) lbl.textContent = connected ? 'Connecté' : 'Déconnecté';
  }

  // ── Patch sendStatus for test count ──
  function patchSendStatus() {
    setTimeout(() => {
      const btn = document.getElementById('testBtn');
      if (btn) {
        btn.addEventListener('click', () => {
          stats.testSent++;
          const el = document.getElementById('statTestSent');
          if (el) el.textContent = stats.testSent;
        }, true);
      }
      const btn2 = document.getElementById('sendBtn');
      if (btn2) {
        btn2.addEventListener('click', () => {
          stats.seqSent++;
          const el = document.getElementById('statSeqSent');
          if (el) el.textContent = stats.seqSent;
        }, true);
      }
    }, 200);
  }

  function patchSeqSendStatus() {} // merged above

  // ── Sync resume view ──
  function syncResume() {
    const map = {
      r_NumMsg:          'NumMsg',
      r_identResponse:   'identResponse',
      r_resultat:        'resultat',
      r_detail:          'detail',
      r_NumSeq:          'NumSeq',
      r_memssd:          'memssd',
      r_NumMsgSeq:       'NumMsgSeq',
      r_identResponseSeq:'identResponseSeq',
      r_NumSeqb:         'NumSeqb',
      r_memssdSeq:       'memssdSeq',
    };
    for (const [resumeId, srcId] of Object.entries(map)) {
      const src = document.getElementById(srcId);
      const dst = document.getElementById(resumeId);
      if (src && dst) dst.textContent = src.value || '—';
    }
  }

})();
