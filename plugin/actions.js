(() => {
  const C = globalThis.GDCoreBase;

  function summarize(assignments) {
    const counts = {};
    for (const a of assignments) counts[a.category] = (counts[a.category] || 0) + 1;
    const order = ["FX aplicado", "Vídeo principal", "B-roll", "Foto/Imagem", "Gráfico/Texto", "Motion/MOGRT", "Ajuste/Cor", "Áudio/Voz", "Música", "SFX", "Logo/Branding", "Sequência/Nest"];
    return order.filter((key) => counts[key]).map((key) => `${key}: ${counts[key]}`).join(" • ");
  }

  async function organizeTimeline(options = {}) {
    if (C.isApplying()) return;
    const quiet = !!options.quiet;
    try {
      const { project, sequence } = await C.getActiveContext();
      C.setStatus("Analisando clipes, gráficos, áudio e efeitos...");
      const assignments = await C.classify(sequence);
      const changed = await C.applyAssignments(project, assignments, "GD Timeline Colors Pro - organizar");
      C.setStatus(`${changed ? changed + " item(ns) atualizado(s). " : "Tudo já estava organizado. "}${summarize(assignments) || "Nenhum clipe encontrado."}`);
      if (globalThis.GDAutomation) await globalThis.GDAutomation.watchSequence(sequence);
    } catch (e) {
      C.setStatus(`Erro: ${e && e.message ? e.message : String(e)}`);
      if (!quiet) console.log(e);
    }
  }

  async function colorByTrack() {
    if (C.isApplying()) return;
    try {
      const { project, sequence } = await C.getActiveContext();
      const map = new Map();
      for (const item of await C.collectVideo(sequence)) C.choose(map, item.id, item.projectItem, C.TRACK_COLORS[item.trackIndex % C.TRACK_COLORS.length], 50, `V${item.trackIndex + 1}`);
      for (const item of await C.collectAudio(sequence)) {
        if (map.has(item.id)) continue;
        C.choose(map, item.id, item.projectItem, item.trackIndex === 0 ? C.COLORS.VOICE : C.COLORS.MUSIC, 40, `A${item.trackIndex + 1}`);
      }
      const changed = await C.applyAssignments(project, Array.from(map.values()), "GD Timeline Colors Pro - por trilha");
      C.setStatus(`${changed ? changed + " item(ns)" : "Nenhum item"} recolorido(s) por trilha.`);
      if (globalThis.GDAutomation) await globalThis.GDAutomation.watchSequence(sequence);
    } catch (e) { C.setStatus(`Erro: ${e && e.message ? e.message : String(e)}`); }
  }

  globalThis.GDCore = {
    organizeTimeline,
    colorByTrack,
    getActiveContext: C.getActiveContext,
    isApplying: C.isApplying
  };
})();
