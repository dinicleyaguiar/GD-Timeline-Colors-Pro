const uxp = require("uxp");
const { entrypoints } = uxp;

function $(id) { return document.getElementById(id); }

function bindUi() {
  const organizeBtn = $("organizeBtn");
  const refreshFxBtn = $("refreshFxBtn");
  const trackBtn = $("trackBtn");
  const autoBtn = $("autoBtn");
  if (organizeBtn) organizeBtn.addEventListener("click", () => globalThis.GDCore.organizeTimeline({ quiet: false }));
  if (refreshFxBtn) refreshFxBtn.addEventListener("click", () => globalThis.GDCore.organizeTimeline({ quiet: false, reason: "manual-fx" }));
  if (trackBtn) trackBtn.addEventListener("click", () => globalThis.GDCore.colorByTrack());
  if (autoBtn) autoBtn.addEventListener("click", () => globalThis.GDAutomation.toggleAuto());
  globalThis.GDAutomation.updateAutoUi();
}

entrypoints.setup({
  panels: {
    gdTimelinePanel: {
      async show() {
        globalThis.GDAutomation.initGlobalListeners();
        bindUi();
        await globalThis.GDAutomation.watchActiveSequence();
        globalThis.GDAutomation.scheduleOrganize("panel-show");
      },
      hide() {}
    }
  }
});

try { bindUi(); } catch (_) {}
