(() => {
  const ppro = require("premierepro");
  const COLORS = {
    VIDEO: 0, BROLL: 1, STILL: 2, GRAPHIC: 3, MOTION: 4, VOICE: 5,
    MUSIC: 6, FX: 7, ADJUSTMENT: 8, SFX: 9, BRAND: 10, SEQUENCE: 11,
    REVIEW: 12, APPROVED: 13, ERROR: 14, ORGANIZATION: 15
  };
  const TRACK_COLORS = [0, 1, 2, 3, 4, 10, 8, 7, 13, 11, 6, 9, 5, 15, 12, 14];
  let applying = false;

  const $ = (id) => document.getElementById(id);
  const setStatus = (message) => { const el = $("statusText"); if (el) el.textContent = message; };
  const lower = (value) => String(value || "").toLowerCase();
  const extensionOf = (name) => { const m = /\.([a-z0-9]{1,10})$/i.exec(name || ""); return m ? m[1].toLowerCase() : ""; };
  const isStill = (ext) => ["png","jpg","jpeg","jpe","webp","psd","tif","tiff","bmp","gif","heic","heif","dng","exr","dpx","tga"].includes(ext);
  const isVideo = (ext) => ["mp4","mov","mxf","avi","m4v","mts","m2ts","m2t","webm","wmv","vob","r3d","braw","crm","cine","mpg","mpeg","mpe","f4v","dv"].includes(ext);
  const isAudio = (ext) => ["wav","mp3","aac","m4a","aif","aiff","bwf","wma"].includes(ext);
  const looksLikeBroll = (n) => /(b[-_ ]?roll|broll|apoio|cobertura|insert|cutaway|takeaway)/i.test(n || "");
  const looksLikeMusic = (n) => /(music|musica|música|trilha|song|beat|bgm|soundtrack|instrumental|lofi|lo-fi)/i.test(n || "");
  const looksLikeSfx = (n) => /(sfx|sound.?effect|efeito.?sonoro|whoosh|swoosh|riser|impact|hit|click|pop|transition.?sound|boom|ding|beep|glitch|sweep)/i.test(n || "");
  const looksLikeBrand = (n) => /(logo|logotipo|marca|brand|branding|assinatura|watermark|selo)/i.test(n || "");
  const looksLikeGraphic = (n) => /(graphic|grafico|gráfico|title|titulo|título|text|texto|lower.?third|caption|legenda|tarja|gc\b)/i.test(n || "");
  const looksLikeMotion = (n) => /(after.?effects|dynamic.?link|\.aep$|motion|animacao|animação|mogrt|essential.?graphics)/i.test(n || "");

  async function getActiveContext() {
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error("Nenhum projeto ativo.");
    const sequence = await project.getActiveSequence();
    if (!sequence) throw new Error("Nenhuma sequência ativa.");
    return { project, sequence };
  }

  async function safeId(item, fallback) {
    try { return String(await item.getId()); } catch (_) { return fallback; }
  }

  async function componentInfo(trackItem) {
    try {
      const chain = await trackItem.getComponentChain();
      if (!chain) return { mogrt: false, hasFx: false };
      const count = chain.getComponentCount();
      const names = [];
      for (let i = 0; i < count; i++) {
        try { names.push(String(await chain.getComponentAtIndex(i).getMatchName())); } catch (_) {}
      }
      const mogrt = names.includes("AE.ADBE Capsule");
      return { mogrt, hasFx: !mogrt && count >= 3 };
    } catch (_) { return { mogrt: false, hasFx: false }; }
  }

  async function collectVideo(sequence) {
    const out = [];
    const count = await sequence.getVideoTrackCount();
    for (let ti = 0; ti < count; ti++) {
      const track = await sequence.getVideoTrack(ti);
      if (!track) continue;
      const items = await track.getTrackItems(ppro.Constants.TrackItemType.CLIP, false);
      for (let ci = 0; ci < items.length; ci++) {
        const trackItem = items[ci];
        let projectItem = null;
        try { projectItem = await trackItem.getProjectItem(); } catch (_) {}
        if (!projectItem) continue;
        let adjustment = false, contentType = null;
        try { adjustment = !!(await trackItem.isAdjustmentLayer()); } catch (_) {}
        try { contentType = await projectItem.getContentType(); } catch (_) {}
        out.push({
          trackIndex: ti,
          projectItem,
          id: await safeId(projectItem, `V${ti}:${ci}:${projectItem.name || "item"}`),
          adjustment,
          contentType,
          componentInfo: await componentInfo(trackItem)
        });
      }
    }
    return out;
  }

  async function collectAudio(sequence) {
    const out = [];
    const count = await sequence.getAudioTrackCount();
    for (let ti = 0; ti < count; ti++) {
      const track = await sequence.getAudioTrack(ti);
      if (!track) continue;
      const items = await track.getTrackItems(ppro.Constants.TrackItemType.CLIP, false);
      for (let ci = 0; ci < items.length; ci++) {
        let projectItem = null;
        try { projectItem = await items[ci].getProjectItem(); } catch (_) {}
        if (!projectItem) continue;
        out.push({ trackIndex: ti, projectItem, id: await safeId(projectItem, `A${ti}:${ci}:${projectItem.name || "item"}`) });
      }
    }
    return out;
  }

  function choose(map, id, projectItem, colorIndex, priority, category) {
    const current = map.get(id);
    if (!current || priority > current.priority) map.set(id, { id, projectItem, colorIndex, priority, category });
  }

  async function classify(sequence) {
    const map = new Map();
    for (const item of await collectVideo(sequence)) {
      const name = lower(item.projectItem && item.projectItem.name);
      const ext = extensionOf(name);
      const isSequence = item.contentType === ppro.Constants.ContentType.SEQUENCE;
      if (item.adjustment) choose(map, item.id, item.projectItem, COLORS.ADJUSTMENT, 100, "Ajuste/Cor");
      else if (item.componentInfo.mogrt || looksLikeMotion(name)) choose(map, item.id, item.projectItem, COLORS.MOTION, 95, "Motion/MOGRT");
      else if (item.componentInfo.hasFx) choose(map, item.id, item.projectItem, COLORS.FX, 90, "FX aplicado");
      else if (isSequence) choose(map, item.id, item.projectItem, COLORS.SEQUENCE, 85, "Sequência/Nest");
      else if (looksLikeBrand(name)) choose(map, item.id, item.projectItem, COLORS.BRAND, 80, "Logo/Branding");
      else if (looksLikeGraphic(name) || (!ext && !isSequence)) choose(map, item.id, item.projectItem, COLORS.GRAPHIC, 70, "Gráfico/Texto");
      else if (isStill(ext)) choose(map, item.id, item.projectItem, COLORS.STILL, 60, "Foto/Imagem");
      else if (looksLikeBroll(name)) choose(map, item.id, item.projectItem, COLORS.BROLL, 50, "B-roll");
      else if (isVideo(ext)) choose(map, item.id, item.projectItem, item.trackIndex > 0 ? COLORS.BROLL : COLORS.VIDEO, 40, item.trackIndex > 0 ? "B-roll" : "Vídeo principal");
      else choose(map, item.id, item.projectItem, TRACK_COLORS[item.trackIndex % TRACK_COLORS.length], 30, "Vídeo");
    }
    for (const item of await collectAudio(sequence)) {
      const name = lower(item.projectItem && item.projectItem.name);
      const ext = extensionOf(name);
      if (looksLikeSfx(name)) choose(map, item.id, item.projectItem, COLORS.SFX, 25, "SFX");
      else if (looksLikeMusic(name)) choose(map, item.id, item.projectItem, COLORS.MUSIC, 20, "Música");
      else if (isAudio(ext) || !map.has(item.id)) choose(map, item.id, item.projectItem, COLORS.VOICE, 15, "Áudio/Voz");
    }
    return Array.from(map.values());
  }

  async function applyAssignments(project, assignments, undoName) {
    const changes = [];
    for (const a of assignments) {
      try { if (Number(await a.projectItem.getColorLabelIndex()) === Number(a.colorIndex)) continue; } catch (_) {}
      changes.push(a);
    }
    if (!changes.length) return 0;
    applying = true;
    try {
      const success = project.lockedAccess(() => project.executeTransaction((compoundAction) => {
        for (const a of changes) compoundAction.addAction(a.projectItem.createSetColorLabelAction(a.colorIndex));
      }, undoName));
      if (success === false) throw new Error("O Premiere recusou a transação de cores.");
      return changes.length;
    } finally { setTimeout(() => { applying = false; }, 250); }
  }

  globalThis.GDCoreBase = {
    COLORS, TRACK_COLORS, setStatus, getActiveContext, collectVideo, collectAudio,
    choose, classify, applyAssignments, isApplying: () => applying
  };
})();
