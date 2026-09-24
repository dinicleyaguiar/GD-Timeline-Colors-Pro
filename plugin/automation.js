(() => {
  const ppro = require("premierepro");
  let autoMode = true;
  let debounceTimer = null;
  let listenersInitialized = false;
  const watchedTracks = new WeakSet();
  const $ = (id) => document.getElementById(id);

  function updateAutoUi() {
    const dot = $("autoDot"), text = $("autoText"), btn = $("autoBtn");
    if (!dot || !text || !btn) return;
    dot.className = autoMode ? "status-dot active" : "status-dot off";
    text.textContent = autoMode ? "AUTO ORGANIZAÇÃO ATIVA" : "AUTO ORGANIZAÇÃO DESATIVADA";
    btn.textContent = autoMode ? "DESATIVAR AUTO" : "ATIVAR AUTO";
  }

  function setStatus(message) { const el = $("statusText"); if (el) el.textContent = message; }

  function scheduleOrganize(reason) {
    if (!autoMode || (globalThis.GDCore && globalThis.GDCore.isApplying())) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (globalThis.GDCore) globalThis.GDCore.organizeTimeline({ quiet: true, reason });
    }, 450);
  }

  async function watchSequence(sequence) {
    if (!sequence) return;
    try {
      const vCount = await sequence.getVideoTrackCount();
      for (let i = 0; i < vCount; i++) {
        const track = await sequence.getVideoTrack(i);
        if (track && !watchedTracks.has(track)) {
          watchedTracks.add(track);
          ppro.EventManager.addEventListener(track, ppro.Constants.VideoTrackEvent.TRACK_CHANGED, () => scheduleOrganize("track-change"));
        }
      }
      const aCount = await sequence.getAudioTrackCount();
      for (let i = 0; i < aCount; i++) {
        const track = await sequence.getAudioTrack(i);
        if (track && !watchedTracks.has(track)) {
          watchedTracks.add(track);
          ppro.EventManager.addEventListener(track, ppro.Constants.AudioTrackEvent.TRACK_CHANGED, () => scheduleOrganize("track-change"));
        }
      }
    } catch (e) { console.log("GD Timeline Colors Pro: não foi possível observar a sequência", e); }
  }

  async function watchActiveSequence() {
    try { const { sequence } = await globalThis.GDCore.getActiveContext(); await watchSequence(sequence); } catch (_) {}
  }

  function initGlobalListeners() {
    if (listenersInitialized) return;
    listenersInitialized = true;
    try {
      ppro.EventManager.addGlobalEventListener(ppro.Constants.SequenceEvent.ACTIVATED, () => {
        if (!autoMode) return;
        setTimeout(async () => { await watchActiveSequence(); scheduleOrganize("sequence-activated"); }, 250);
      });
    } catch (e) { console.log(e); }
    try {
      ppro.EventManager.addGlobalEventListener(ppro.Constants.OperationCompleteEvent.EFFECT_DROP_COMPLETE, () => scheduleOrganize("effect-drop"));
    } catch (e) { console.log(e); }
  }

  async function toggleAuto() {
    autoMode = !autoMode;
    updateAutoUi();
    if (autoMode) { await watchActiveSequence(); scheduleOrganize("auto-enabled"); }
    else setStatus("Auto organização pausada. Os botões manuais continuam funcionando.");
  }

  globalThis.GDAutomation = { watchSequence, watchActiveSequence, initGlobalListeners, toggleAuto, updateAutoUi, scheduleOrganize };
})();
