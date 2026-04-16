// ============================================================
//  Outil de Tête Acoustique — script.js
//  Reconstitué depuis les sources originales (photos)
//  IDs alignés avec index.html
// ============================================================

let socket = null;
let isConnected = false;

// ── Connexion ─────────────────────────────────────────────────
let ipInput;
let PortInput;
let connectBtn;
let disconnectBtn;
let connectionStatus;
let errorMessage;
let globalConnectionChip;

// ── Commande Test ─────────────────────────────────────────────
let identInput;
let identLength;
let testBtn;
let sendStatus;
let NumMsgTest;
let ReemissionInput;
let tempsInput;

// ── Commande Séquentielle ─────────────────────────────────────
let identificationInput;
let identificationLength;
let numeroSequenceInput;
let heureInput;
let VitesseInput;
let CapInput;
let BandeInput;
let AssietteInput;
let abscisseInput;
let ordonneeInput;
let zInput;
let sendBtn;
let SequenceSendStatus;
let NumeroMsgInput;

// ── Réponse Test (déclarés hors DOMContentLoaded car référencés dans handleResponse)
let NumMsgField, identResponseField, resultatField, detailField, NumSeqField, memssdField;
let NumMsgInfo, identResponseInfo, resultatInfo, detailInfo, NumSeqInfo, memssdInfo;

// ── Réponse Séquentielle
let NumMsgSeqField, identResponseSeqField, NumSeqbField, memssdSeqField;
let NumMsgSeqInfo, identResponseSeqInfo, NumSeqbInfo, memssdSeqInfo;


// ============================================================
//  INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

    // Connexion
    ipInput              = document.getElementById('ipAddress');
    PortInput            = document.getElementById('PortComm');
    connectBtn           = document.getElementById('connectBtn');
    disconnectBtn        = document.getElementById('disconnectBtn');
    connectionStatus     = document.getElementById('connectionStatus');
    errorMessage         = document.getElementById('errorMessage');
    globalConnectionChip = document.getElementById('globalConnectionChip');

    // Test
    identInput      = document.getElementById('ident');
    identLength     = document.getElementById('identLength');
    testBtn         = document.getElementById('testBtn');
    sendStatus      = document.getElementById('sendStatus');
    NumMsgTest      = document.getElementById('NumMsgTest');
    ReemissionInput = document.getElementById('Reemission');
    tempsInput      = document.getElementById('temps');

    // Séquentielle
    identificationInput  = document.getElementById('identification');
    identificationLength = document.getElementById('identificationLength');
    numeroSequenceInput  = document.getElementById('numeroSequence');
    heureInput           = document.getElementById('heure');
    VitesseInput         = document.getElementById('Vitesse');
    CapInput             = document.getElementById('Cap');
    BandeInput           = document.getElementById('Bande');
    AssietteInput        = document.getElementById('Assiette');
    abscisseInput        = document.getElementById('abscisse');
    ordonneeInput        = document.getElementById('ordonnee');
    zInput               = document.getElementById('z');
    sendBtn              = document.getElementById('sendBtn');
    SequenceSendStatus   = document.getElementById('SequenceSendStatus');
    NumeroMsgInput       = document.getElementById('NumeroMsg');

    // Réponse Test
    NumMsgField          = document.getElementById('NumMsg');
    identResponseField   = document.getElementById('identResponse');
    resultatField        = document.getElementById('resultat');
    detailField          = document.getElementById('detail');
    NumSeqField          = document.getElementById('NumSeq');
    memssdField          = document.getElementById('memssd');
    NumMsgInfo           = document.getElementById('NumMsgInfo');
    identResponseInfo    = document.getElementById('identResponseInfo');
    resultatInfo         = document.getElementById('resultatInfo');
    detailInfo           = document.getElementById('detailInfo');
    NumSeqInfo           = document.getElementById('NumSeqInfo');
    memssdInfo           = document.getElementById('memssdInfo');

    // Réponse Séquentielle
    NumMsgSeqField          = document.getElementById('NumMsgSeq');
    identResponseSeqField   = document.getElementById('identResponseSeq');
    NumSeqbField            = document.getElementById('NumSeqb');
    memssdSeqField          = document.getElementById('memssdSeq');
    NumMsgSeqInfo           = document.getElementById('NumMsgSeqInfo');
    identResponseSeqInfo    = document.getElementById('identResponseSeqInfo');
    NumSeqbInfo             = document.getElementById('NumSeqbInfo');
    memssdSeqInfo           = document.getElementById('memssdSeqInfo');

    // Horloge
    setInterval(updateSystemTime, 1000);
    updateSystemTime();

    // Écouteurs
    setupEventListeners();
    setConnectedUI(false);

    // Bloquer les submit
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[FRONT] submit bloqué');
        });
    });

    window.addEventListener('beforeunload', function () { console.log('[FRONT] beforeunload'); });
    window.addEventListener('pagehide',     function () { console.log('[FRONT] pagehide'); });

    addLog('SYSTEM', 'Interface initialisée');
});


// ============================================================
//  HEURE SYSTÈME
// ============================================================
function updateSystemTime() {
    const now     = new Date();
    const hours   = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (heureInput) heureInput.value = `${hours}:${minutes}:${seconds}`;
}


// ============================================================
//  ÉCOUTEURS
// ============================================================
function setupEventListeners() {

    if (connectBtn)    connectBtn.addEventListener('click', handleConnect);
    if (disconnectBtn) disconnectBtn.addEventListener('click', handleDisconnect);

    if (identInput)         identInput.addEventListener('input', handleIdentInput);
    if (identificationInput) identificationInput.addEventListener('input', handleIdentificationInput);

    if (testBtn)  testBtn.addEventListener('click',  handleTestClick);
    if (sendBtn)  sendBtn.addEventListener('click',  handleSendClick);

    [numeroSequenceInput, VitesseInput, CapInput, BandeInput,
     AssietteInput, abscisseInput, ordonneeInput, zInput
    ].forEach(input => {
        if (input) input.addEventListener('input', checkExtendedFormValidity);
    });

    // Boutons logs overview
    const copyLogsBtn  = document.getElementById('copyLogsBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    if (copyLogsBtn) {
        copyLogsBtn.addEventListener('click', async function () {
            try {
                const lv = document.getElementById('logViewer');
                await navigator.clipboard.writeText(lv?.value || '');
                addLog('SYSTEM', 'Logs copiés');
            } catch (e) {
                showError('Impossible de copier les logs');
            }
        });
    }

    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function () {
            const lv = document.getElementById('logViewer');
            if (lv) lv.value = '';
            updateLogMeta('--:--:--', '-- octets', '----');
        });
    }
}


// ============================================================
//  CONNEXION
// ============================================================
function handleConnect() {
    console.log('click connecté');
    clearError();

    const ip   = ipInput   ? ipInput.value.trim()   : '';
    const Port = PortInput ? PortInput.value.trim()  : '';

    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) { showError('Adresse IP invalide'); return; }

    const octets = ip.split('.');
    if (octets.some(octet => parseInt(octet, 10) > 255)) {
        showError('Adresse IP invalide (octets > 255)');
        return;
    }

    if (!Port) { showError('Port invalide'); return; }

    connectToServer(ip, Port);
}

async function handleDisconnect() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showError('Aucune connexion active');
        return;
    }

    try {
        const ip   = ipInput   ? ipInput.value.trim()  : '127.0.0.1';
        const port = PortInput ? PortInput.value.trim() : '5500';

        try {
            const response = await fetch(`http://${ip}:${port}/disconnect`);
            if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
            const data = await response.json();
            addLog('HTTP', data.message || 'Déconnexion réussie');
        } catch (fetchErr) {
            addLog('SYSTEM', 'Fermeture socket directe');
        }

        socket.close();
        socket = null;
        setConnectedUI(false);

    } catch (error) {
        showError('Erreur de déconnexion : ' + error.message);
    }
}

async function connectToServer(ip, port) {
    try {
        console.log('Tentative WebSocket connecté vers', ip, port);
        socket = new WebSocket(`ws://${ip}:${port}/`);
        console.log(`connection = ${ip}:${port}`);

        setWsState('connecting');

        socket.onopen = function () {
            console.log('WebSocket connecté');
            setWsState('connected');
            addLog('SYSTEM', 'WebSocket connecté');
        };

        socket.onerror = function (error) {
            console.log('Erreur de WebSocket', error);
            showError('Erreur de connexion au serveur');
            setWsState('error');
            addLog('SYSTEM', 'Erreur WebSocket');
        };

        socket.onclose = function () {
            console.log('WebSocket déconnecté');
            setWsState('disconnected');
            addLog('SYSTEM', 'WebSocket déconnecté');
        };

        socket.onmessage = function (event) {
            handleResponse(event.data);
        };

    } catch (error) {
        setConnectedUI(false);
        showError('Erreur de connexion au serveur ' + error.message);
    }
}


// ============================================================
//  INPUTS
// ============================================================
function handleIdentInput() {
    if (!identInput) return;
    identInput.value = identInput.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
    const length = identInput.value.length;
    if (identLength) identLength.textContent = `${length}/4 caractères`;
}

function handleIdentificationInput() {
    if (!identificationInput) return;
    identificationInput.value = identificationInput.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
    const length = identificationInput.value.length;
    if (identificationLength) identificationLength.textContent = `${length}/4 caractères`;
    checkExtendedFormValidity();
}

function checkExtendedFormValidity() {
    if (!sendBtn) return;
    const hasIdent   = identificationInput  ? identificationInput.value.length > 0  : false;
    const hasSeq     = numeroSequenceInput  ? numeroSequenceInput.value !== ''       : false;
    const hasAbs     = abscisseInput        ? abscisseInput.value !== ''             : false;
    const hasOrd     = ordonneeInput        ? ordonneeInput.value !== ''             : false;
    const hasZ2      = zInput               ? zInput.value !== ''                    : false;
    const hasVit     = VitesseInput         ? VitesseInput.value !== ''              : false;
    const hasCap2    = CapInput             ? CapInput.value !== ''                  : false;
    sendBtn.disabled = !(hasIdent && hasSeq && hasAbs && hasOrd && hasZ2 && hasVit && hasCap2);
}


// ============================================================
//  ENVOI TRAME TEST
// ============================================================
function handleTestClick() {
    const ident = identInput ? identInput.value.padEnd(4, '\0') : '    ';
    if (sendStatus) {
        sendStatus.textContent = 'Envoi en cours...';
        sendStatus.className   = 'status-bar warning';
        sendStatus.classList.remove('hidden');
    }
    sendCommand(ident);
}

function sendCommand(ident) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showError('WebSocket non connecté');
        return;
    }
    try {
        const frame    = new ArrayBuffer(1020);
        const view     = new Uint8Array(frame);
        view.fill(0);

        for (let i = 0; i < 4; i++) view[i] = ident.charCodeAt(i);

        const checksum   = calculateChecksumFromBuffer(frame);
        const finalFrame = new ArrayBuffer(1024);
        const finalView  = new Uint8Array(finalFrame);
        finalView.set(view, 0);
        finalView.set(checksum, 1020);

        console.log('[FRONT][CMD TEST] first 64 bytes=', bytesToHex(finalView.slice(0, 64)));
        console.log('[FRONT][CMD TEST] last 8 bytes=',   bytesToHex(finalView.slice(1016, 1024)));

        socket.send(finalFrame);

        if (sendStatus) {
            sendStatus.textContent = 'Commande Test envoyée — en attente de réponse...';
            sendStatus.className   = 'status-bar warning';
            sendStatus.classList.remove('hidden');
        }
        addLog('SEND', `CMD TEST envoyé | ident=${ident.replace(/\0/g, '')}`);

        // Afficher le détail de la trame envoyée
        afficherDetailTrameTest(finalView, checksum, ident);

    } catch (error) {
        showError("Erreur lors de l'envoi de la commande TEST : " + error.message);
    }
}


// ============================================================
//  ENVOI TRAME SÉQUENTIELLE
// ============================================================
function handleSendClick() {
    if (SequenceSendStatus) {
        SequenceSendStatus.textContent = 'Envoi en cours...';
        SequenceSendStatus.className   = 'status-bar warning';
        SequenceSendStatus.classList.remove('hidden');
    }
    sendCommandSequenceRequest();
}

function sendCommandSequenceRequest() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showError('WebSocket non connecté');
        return;
    }
    try {
        const frame    = new ArrayBuffer(1020);
        const view     = new Uint8Array(frame);
        const dataView = new DataView(frame);
        view.fill(0);

        let offset = 0;

        const identification = (identificationInput?.value || '').padEnd(4, '\0').slice(0, 4);
        for (let i = 0; i < 4; i++) view[offset + i] = identification.charCodeAt(i);
        offset += 4;

        const numeroSeq = parseInt(numeroSequenceInput?.value || '0', 10) || 0;
        dataView.setInt32(offset, numeroSeq, true);
        offset += 4;

        const now = new Date();
        const secondsSinceMidnight = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
        dataView.setInt32(offset, secondsSinceMidnight, true);
        offset += 4;

        const cap      = parseFloat(CapInput?.value      || '0') || 0;
        dataView.setFloat32(offset, cap, true);      offset += 4;

        const assiette = parseFloat(AssietteInput?.value || '0') || 0;
        dataView.setFloat32(offset, assiette, true); offset += 4;

        const bande    = parseFloat(BandeInput?.value    || '0') || 0;
        dataView.setFloat32(offset, bande, true);    offset += 4;

        const x        = parseFloat(abscisseInput?.value || '0') || 0;
        dataView.setFloat32(offset, x, true);        offset += 4;

        const y        = parseFloat(ordonneeInput?.value || '0') || 0;
        dataView.setFloat32(offset, y, true);        offset += 4;

        const z        = parseFloat(zInput?.value        || '0') || 0;
        dataView.setFloat32(offset, z, true);        offset += 4;

        const vitesse  = parseFloat(VitesseInput?.value  || '0') || 0;
        dataView.setFloat32(offset, vitesse, true);  offset += 4;

        const checksum   = calculateChecksumFromBuffer(frame);
        const finalFrame = new ArrayBuffer(1024);
        const finalView  = new Uint8Array(finalFrame);
        finalFrame; finalView.set(view, 0);
        finalView.set(checksum, 1020);

        console.log('[FRONT][CMD SEQ] first 64 bytes=', bytesToHex(finalView.slice(0, 64)));
        console.log('[SEQ] identification=', identification.replace(/\0/g,''), 'seq=', numeroSeq);
        console.log('[SEQ] cap=', cap, 'assiette=', assiette, 'bande=', bande);
        console.log('[SEQ] x=', x, 'y=', y, 'z=', z, 'vitesse=', vitesse);

        socket.send(finalFrame);

        if (SequenceSendStatus) {
            SequenceSendStatus.textContent = 'Requête Cmd Seq envoyée — en attente de réponse...';
            SequenceSendStatus.className   = 'status-bar warning';
            SequenceSendStatus.classList.remove('hidden');
        }
        addLog('SEND', `CMD SEQ envoyée | ident=${identification.replace(/\0/g,'')} | seq=${numeroSeq}`);

        // Afficher le détail de la trame séquentielle envoyée
        afficherDetailTrameSeq(finalView, checksum, {
            identification, numeroSeq, secondsSinceMidnight,
            cap, assiette, bande, x, y, z, vitesse
        });

    } catch (error) {
        showError("Erreur lors de l'envoi de la commande séquentielle : " + error.message);
        if (SequenceSendStatus) SequenceSendStatus.style.display = 'none';
    }
}


// ============================================================
//  RÉCEPTION RÉPONSE
// ============================================================
async function handleResponse(data) {
    try {
        console.log('[FRONT] handleResponse appelé');
        console.log('[FRONT] type data =', typeof data, data);

        let arrayBuffer;

        if (data instanceof Blob) {
            arrayBuffer = await data.arrayBuffer();
        } else if (data instanceof ArrayBuffer) {
            arrayBuffer = data;
        } else {
            // Texte brut fallback
            const text = String(data).trim();
            console.log('[FRONT] réponse texte :', text);
            addLog('RECV', text);
            if (sendStatus)         { sendStatus.textContent = 'Réponse reçue : '+text; sendStatus.className = 'status-bar success'; sendStatus.classList.remove('hidden'); }
            if (SequenceSendStatus) { SequenceSendStatus.textContent = 'Réponse reçue : '+text; SequenceSendStatus.className = 'status-bar success'; SequenceSendStatus.classList.remove('hidden'); }
            return;
        }

        const view = new Uint8Array(arrayBuffer);
        console.log('[FRONT] longueur réponse =', view.length);

        // Vérifier la taille
        if (view.length !== 1024) {
            showError('Taille de trame incorrecte: ' + view.length + ' octets (attendu: 1024)');
            if (sendStatus)         sendStatus.style.display         = 'none';
            if (SequenceSendStatus) SequenceSendStatus.style.display = 'none';
            return;
        }

        // Séparer données et checksum
        const dataOnly         = arrayBuffer.slice(0, 1020);
        const receivedChecksum = view.slice(1020, 1024);

        // Vérifier la checksum
        const calculatedChecksum = calculateChecksumFromBuffer(dataOnly);
        let checksumValid = true;
        for (let i = 0; i < 4; i++) {
            if (receivedChecksum[i] !== calculatedChecksum[i]) {
                checksumValid = false;
                break;
            }
        }

        if (!checksumValid) {
            showError('Erreur de checksum dans la réponse');
            if (sendStatus)         sendStatus.style.display         = 'none';
            if (SequenceSendStatus) SequenceSendStatus.style.display = 'none';
            return;
        }

        // Analyser selon le type
        const dataViewArr    = new Uint8Array(dataOnly);
        const dataViewTyped  = new DataView(dataOnly);

        // Si numéro de séquence à l'offset 4 != 0 → réponse Séquentielle
        const hasSequence = dataViewTyped.getInt32(4, true) !== 0 ||
                            (identificationInput && identificationInput.value.length > 0);

        if (hasSequence) {
            handleCommandSequenceResponse(dataViewArr, dataViewTyped);
        } else {
            handleCommandTestResponse(dataViewArr);
        }

    } catch (error) {
        console.error('[FRONT] erreur handleResponse =', error);
        showError('Erreur lors du traitement de la réponse : ' + error.message);
        if (sendStatus)         sendStatus.style.display         = 'none';
        if (SequenceSendStatus) SequenceSendStatus.style.display = 'none';
    }
}

function handleCommandTestResponse(view) {
    const ident = decodeChars(view, 0, 4);

    if (NumMsgField)        NumMsgField.value        = NumMsgTest?.value || '7';
    if (identResponseField) identResponseField.value = ident;
    if (resultatField)      resultatField.value       = 'OK';
    if (detailField)        detailField.value         = bytesToHex(view.slice(0, 16));
    if (NumSeqField)        NumSeqField.value         = '-';
    if (memssdField)        memssdField.value         = '-';

    if (NumMsgInfo)        NumMsgInfo.textContent        = 'Réponse liée à la commande TEST';
    if (identResponseInfo) identResponseInfo.textContent = 'Ident utilisé';
    if (resultatInfo)      resultatInfo.textContent      = 'Retour backend / UDP';
    if (detailInfo)        detailInfo.textContent        = 'Réponse brute décodée';

    if (sendStatus) {
        sendStatus.textContent = 'Réponse Test reçue avec succès';
        sendStatus.className   = 'status-bar success';
        sendStatus.classList.remove('hidden');
    }
    addLog('RECV', `Réponse TEST | ident=${ident}`);
}

function handleCommandSequenceResponse(view, dataViewTyped) {
    const ident  = decodeChars(view, 0, 4);
    const numSeq = dataViewTyped ? dataViewTyped.getInt32(4, true) : 0;

    if (NumMsgSeqField)        NumMsgSeqField.value        = NumeroMsgInput?.value || '';
    if (identResponseSeqField) identResponseSeqField.value = ident;
    if (NumSeqbField)          NumSeqbField.value          = numSeq;
    if (memssdSeqField)        memssdSeqField.value        = bytesToHex(view.slice(0, 16));

    if (NumMsgSeqInfo)         NumMsgSeqInfo.textContent   = 'Réponse liée à la commande Séquentielle';
    if (memssdSeqInfo)         memssdSeqInfo.textContent   = 'Réponse brute décodée';

    if (SequenceSendStatus) {
        SequenceSendStatus.textContent = 'Réponse Séquentielle reçue avec succès';
        SequenceSendStatus.className   = 'status-bar success';
        SequenceSendStatus.classList.remove('hidden');
    }
    addLog('RECV', `Réponse SEQ | ident=${ident} | seq=${numSeq}`);
}


// ============================================================
//  CHECKSUM & UTILITAIRES
// ============================================================
function calculateChecksumFromBuffer(buffer) {
    const bytes  = new Uint8Array(buffer);
    let checksum = 0;
    for (let i = 0; i < bytes.length; i++) checksum = (checksum + bytes[i]) >>> 0;
    const out = new Uint8Array(4);
    out[0] = (checksum >>> 24) & 0xff;
    out[1] = (checksum >>> 16) & 0xff;
    out[2] = (checksum >>>  8) & 0xff;
    out[3] =  checksum         & 0xff;
    return out;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

function decodeChars(view, offset, length) {
    let str = '';
    for (let i = 0; i < length; i++) {
        const c = view[offset + i];
        if (c !== 0) str += String.fromCharCode(c);
    }
    return str;
}


// ============================================================
//  UI
// ============================================================
/**
 * setWsState — style IHM Devices
 * state: 'disconnected' | 'connecting' | 'connected' | 'error'
 */
function setWsState(state) {
    const wsBadge = document.getElementById('wsBadge');
    const wsLabel = document.getElementById('wsLabel');
    const chip    = document.getElementById('globalConnectionChip');
    const navDot  = document.querySelector('#navConnStatus .dot');
    const navLbl  = document.getElementById('navConnLabel');

    const cfg = {
        disconnected: { cls: '',           label: 'Déconnecté',  connected: false },
        connecting:   { cls: 'connecting', label: 'Connexion…',  connected: false },
        connected:    { cls: 'connected',  label: 'Connecté',    connected: true  },
        error:        { cls: '',           label: 'Erreur',       connected: false }
    };
    const s = cfg[state] || cfg.disconnected;
    isConnected = s.connected;

    // ── Badge WS (IHM Devices style) ─────────────────────────
    if (wsBadge) wsBadge.className = 'ws-status-badge' + (s.cls ? ' ' + s.cls : '');
    if (wsLabel) wsLabel.textContent = s.label;

    // ── Chip header ───────────────────────────────────────────
    if (chip) {
        chip.className = 'chip ' + (s.connected ? 'connected' : 'disconnected');
        chip.innerHTML = '<span class="chip-dot"></span>' + s.label;
    }

    // ── Nav sidebar ───────────────────────────────────────────
    if (navDot) navDot.className = 'dot ' + (s.connected ? 'connected' : 'disconnected');
    if (navLbl) navLbl.textContent = s.label;

    // ── Infos connexion ───────────────────────────────────────
    const infoIp   = document.getElementById('connexion-info-ip');
    const infoPort = document.getElementById('connexion-info-port');
    const statusEl = document.getElementById('connectionStatus');

    if (s.connected) {
        const ip   = ipInput   ? ipInput.value.trim()  : '—';
        const port = PortInput ? PortInput.value.trim() : '—';
        if (infoIp)   infoIp.textContent   = ip;
        if (infoPort) infoPort.textContent = port;
        if (statusEl) { statusEl.textContent = 'Connecté'; statusEl.style.color = 'var(--green)'; }
    } else {
        if (infoIp)   infoIp.textContent   = '—';
        if (infoPort) infoPort.textContent = '—';
        if (statusEl) {
            statusEl.textContent = state === 'connecting' ? 'Connexion en cours…' : 'Déconnecté';
            statusEl.style.color = state === 'connecting' ? 'var(--orange)' : 'var(--red)';
        }
    }

    // ── Boutons ───────────────────────────────────────────────
    if (connectBtn)    connectBtn.disabled    = s.connected || state === 'connecting';
    if (disconnectBtn) disconnectBtn.disabled = !s.connected;
    if (testBtn)       testBtn.disabled       = !s.connected;
    if (sendBtn)       sendBtn.disabled       = !s.connected;
}

// Compat alias
function setConnectedUI(connected) {
    setWsState(connected ? 'connected' : 'disconnected');
    if (connected || (!connected && isConnected === false)) {
        addLog('SYSTEM', connected ? 'WebSocket connecté' : 'WebSocket déconnecté');
    }
}

// ── Logs ──────────────────────────────────────────────────────
function addLog(type, message) {
    const logViewer = document.getElementById('logViewer');
    if (!logViewer) return;
    const now  = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour12: false });
    logViewer.value += `[${time}] [${type}] ${message}\n`;
    logViewer.scrollTop = logViewer.scrollHeight;
    updateLogMeta(time, `${message.length} octets`, '----');
}

function updateLogMeta(time, size, checksum) {
    const logMeta = document.getElementById('logMeta');
    if (logMeta) logMeta.textContent = `${time} | ${size} | ${checksum}`;
}

// ── Erreurs ───────────────────────────────────────────────────
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.className   = 'status-bar error';
        errorMessage.classList.remove('hidden');
    }
    addLog('ERROR', message);
}

function clearError() {
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.className   = 'status-bar error hidden';
    }
}


// ============================================================
//  AFFICHAGE DÉTAIL TRAME ENVOYÉE
// ============================================================

/**
 * Affiche le détail de la trame Test après envoi
 */
function afficherDetailTrameTest(finalView, checksum, ident) {
    const section = document.getElementById('trameTestDetail');
    if (!section) return;
    section.style.display = 'block';

    // Taille
    const sizeEl = document.getElementById('trameTestSize');
    if (sizeEl) sizeEl.textContent = finalView.length + ' octets';

    // Checksum hex
    const crcHex = Array.from(checksum).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
    const crcEl  = document.getElementById('trameTestChecksum');
    if (crcEl) crcEl.textContent = 'CRC: ' + crcHex;

    // Champs
    const now  = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour12: false });

    setText('ti_ident',     ident.split('').filter(c => c.charCodeAt(0) !== 0).join('') || '—');
    setText('ti_numMsg',    NumMsgTest?.value || '7');
    setText('ti_timestamp', time);
    setText('ti_checksum',  crcHex);

    // Hex dump 32 premiers octets
    const hex32 = formatHexDump(finalView.slice(0, 32));
    setText('ti_hex32', hex32);
}

/**
 * Affiche le détail de la trame Séquentielle après envoi
 */
function afficherDetailTrameSeq(finalView, checksum, params) {
    const section = document.getElementById('trameSeqDetail');
    if (!section) return;
    section.style.display = 'block';

    // Taille
    const sizeEl = document.getElementById('trameSeqSize');
    if (sizeEl) sizeEl.textContent = finalView.length + ' octets';

    // Checksum hex
    const crcHex = Array.from(checksum).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
    const crcEl  = document.getElementById('trameSeqChecksum');
    if (crcEl) crcEl.textContent = 'CRC: ' + crcHex;

    // Champs
    setText('ts_ident',   params.identification.split('').filter(function(c){ return c.charCodeAt(0) !== 0; }).join('') || '—');
    setText('ts_seq',     params.numeroSeq);
    setText('ts_heure',   params.secondsSinceMidnight + ' s');
    setText('ts_cap',     params.cap.toFixed(4));
    setText('ts_assiette',params.assiette.toFixed(4));
    setText('ts_bande',   params.bande.toFixed(4));
    setText('ts_x',       params.x.toFixed(4));
    setText('ts_y',       params.y.toFixed(4));
    setText('ts_z',       params.z.toFixed(4));
    setText('ts_vitesse', params.vitesse.toFixed(4));
    setText('ts_checksum',crcHex);

    // Hex dump 48 premiers octets
    const hex48 = formatHexDump(finalView.slice(0, 48));
    setText('ts_hex48', hex48);
}

// ── Helpers ──────────────────────────────────────────────────

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * Formate un tableau d'octets en lignes hex lisibles
 * ex: "00 01 02 03  41 5A 45 52  ..."
 */
function formatHexDump(bytes) {
    const cols  = 8;
    let lines   = [];
    for (let i = 0; i < bytes.length; i += cols) {
        const slice   = Array.from(bytes.slice(i, i + cols));
        const hexPart = slice.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        const offset  = i.toString(16).padStart(4, '0').toUpperCase();
        lines.push(`[${offset}]  ${hexPart}`);
    }
    return lines.join('\n');
}
