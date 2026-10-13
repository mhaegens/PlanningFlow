/* Customer getting-started guide. Uses only browser-local preferences. */
(() => {
  'use strict';
  const preferenceKey = 'cpp-explorer:getting-started:v1';
  const steps = [
    { tab: 'journey', target: '.topbar nav', title: 'Navigate the explorer', body: 'Follow a printer order, test demand changes, or review IBP planning decisions. Compare and Reference help you examine alternatives and look up terms. Use Next to look around, then close the guide to try the controls.' },
    { tab: 'journey', target: '.scenario-tabs', title: 'Choose a fulfilment scenario', body: 'Start with Assemble-to-Order: common modules are stocked, then the customer printer is assembled after the order. Select MTS, MTO or CTO to explore a different reference route. ATO and CTO can overlap in practice.' },
    { tab: 'journey', target: '.planning-selector', title: 'Compare the planning handovers', body: 'Choose whether IBP plans supply for S/4 execution, or whether IBP provides demand and buffer decisions while S/4 plans supply. The diagram changes to show which application creates the supply in each example.' },
    { tab: 'journey', target: '.config-bar', title: 'Set up an example order', body: 'Select Classic VC or AVC, the printer quantity and the print module. Change the expected module mix or extra stock to explore a shortage. These choices update the example flow and quantities; they do not change a live system.' },
    { tab: 'journey', target: '.assembly-scope', title: 'Check what the assembly date includes', body: 'For ATO, compare planning modules only with planning modules and final assembly. Module availability alone does not prove that an assembly line can meet the requested date. The scope choice changes the illustrated promise basis.' },
    { tab: 'journey', target: '.player', anchor: '.map-toolbar', title: 'Follow the order step by step', body: 'Use Play process to follow the order, or the arrows to move at your own pace. Step details explains the current activity. Choose Read along for more time; playback can be paused or restarted.' },
    { tab: 'journey', target: '.flow-node.active', title: 'Read the application flow', body: 'Each horizontal lane represents an application or S/4 component. Follow the flow from left to right. Click a step or a lane name for its role, inputs and hand-offs. Zoom or Expand makes the diagram easier to inspect.' },
    { tab: 'journey', target: '.overlay-controls', underlay: true, title: 'Compare two flows in the diagram', body: 'Enable Comparison underlay and choose a second model. Its different steps appear faded in the same application lanes. Adjust Visibility, Swap models, or Read differences to examine where the routes diverge.' },
    { tab: 'journey', target: '#ledger', mobileTarget: '#ledger .ledger-box', order: true, title: 'Separate demand from physical stock', body: 'These figures follow the selected process step. Compare IBP demand, S/4 requirements and physical fulfilment. A forecast, a customer confirmation and stock are different things: confirming an order does not physically issue its modules or ship a printer.' },
    { tab: 'demand', target: '.lab-events', title: 'Test how orders consume forecast', body: 'Follow Before order, Order in S/4, Integrated & calculated and Order cancelled. Adjust the forecast and order, or use the preset cases. IBP and S/4 matching are separate. In the module panel, choose whether production requirements exist before reading module PIR consumption.' },
    { tab: 'ibp', target: '.ibp-flow-grid', mobileTarget: '.ibp-flow-card', title: 'Review the planning decisions', body: 'IBP planning shows how expected printer volume, module mix and stock policy connect to supply planning and execution feedback. Click a planning card for more detail. Below, change the mix or buffer to compare module prebuild targets.' },
    { tab: 'compare', target: '.compare-table thead', title: 'Compare the fulfilment options', body: 'Read across the table to compare stock points, production triggers, planning responsibilities and customer confirmation. Open a journey from the table, or use a scenario as a diagram underlay. The VC / AVC section compares the configuration layer separately.' },
    { tab: 'reference', target: '.reference-top', title: 'Find terms and application responsibilities', body: 'Search for a term or responsibility, then open a card for its inputs, outputs and hand-offs. The glossary explains planning objects. Official SAP documentation is linked further down for checking capabilities in the relevant edition and release.' },
    { tab: 'reference', target: '.footer-links', title: 'Check the assumptions and revisit the guide', body: 'Model assumptions explains the example boundaries; Disclaimer describes the limitations. The figures and routes are illustrative and are not connected to Canon’s live systems. Reopen Getting started whenever you want to review the controls.' }
  ];
  let initialized = false, seenThisVisit = false, active = false, index = 0, snapshot = null;
  let target = null, frame = 0, transition = 0, trigger = null;
  const welcome = () => document.querySelector('#guide-welcome');
  const dialog = () => document.querySelector('#guide-dialog');
  const card = () => document.querySelector('.guide-card');
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

  function hasSeenGuide() {
    if (seenThisVisit) return true;
    try { return !!localStorage.getItem(preferenceKey); } catch { return false; }
  }
  function remember(choice) {
    seenThisVisit = true;
    try { localStorage.setItem(preferenceKey, choice); } catch { /* Optional preference storage. */ }
  }
  function focusTrigger() {
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }
  function savePosition() {
    const viewport = document.querySelector('#diagram-viewport');
    return {
      state: { ...state, playing: false }, lab: { ...lab },
      x: scrollX, y: scrollY, zoom: diagramZoom, mapX: viewport.scrollLeft, mapY: viewport.scrollTop,
      follow: document.querySelector('#follow-step').checked,
      search: document.querySelector('#reference-search').value
    };
  }
  async function start(from) {
    if (active) return;
    trigger = from || document.activeElement;
    if (welcome().open) welcome().close();
    if (document.fullscreenElement) await document.exitFullscreen();
    snapshot = savePosition();
    stop();
    remember('started');
    Object.assign(state, { scenario: 'ato', assemblyScope: 'full', supply: 's4', attach: 40, buffer: 0, overlay: false, underlay: 'cto', underlayOpacity: 42, engine: 'AVC', qty: 3, heads: 7, index: 0 });
    Object.assign(lab, { forecast: 10, order: 3, mode: 'ts', match: true, s4Match: true, event: 'synced', attach: 40, heads: 7, moduleStage: 'selection' });
    syncLabControls();
    document.querySelector('#reference-search').value = '';
    document.querySelector('#follow-step').checked = false;
    diagramZoom = null;
    active = true;
    index = 0;
    document.documentElement.classList.add('guide-active');
    dialog().showModal();
    await showStep();
  }
  async function showStep() {
    const token = ++transition;
    const step = steps[index];
    target = null;
    document.querySelector('.guide-focus').hidden = true;
    card().style.visibility = 'hidden';
    state.overlay = !!step.underlay;
    state.index = step.order ? getSequence(state).indexOf('sync') : 0;
    setTab(step.tab, false);
    if (step.tab === 'journey') renderJourney();
    if (step.tab === 'reference') renderReference();
    document.querySelector('#guide-title').textContent = step.title;
    document.querySelector('#guide-body').textContent = step.body;
    document.querySelector('#guide-count').textContent = `${index + 1} of ${steps.length}`;
    document.querySelector('#guide-progress').style.width = `${(index + 1) / steps.length * 100}%`;
    document.querySelector('#guide-back').disabled = index === 0;
    document.querySelector('#guide-next').textContent = index === steps.length - 1 ? 'Finish guide' : 'Next';
    dialog().dataset.guideStep = String(index + 1);
    await nextFrame();
    if (!active || token !== transition) return;
    target = document.querySelector(innerWidth <= 700 && step.mobileTarget ? step.mobileTarget : step.target);
    if (target?.classList.contains('flow-node')) {
      const viewport = document.querySelector('#diagram-viewport');
      viewport.scrollTo({ left: Math.max(0, target.offsetLeft * diagramScale - viewport.clientWidth / 2 + target.offsetWidth * diagramScale / 2), behavior: 'instant' });
    }
    const anchor = (step.anchor ? document.querySelector(step.anchor) : null) || target;
    if (anchor && !anchor.closest('.topbar')) {
      const header = document.querySelector('.topbar').getBoundingClientRect().bottom;
      const player = target?.classList.contains('flow-node') ? document.querySelector('.player').offsetHeight + 22 : 0;
      window.scrollTo({ top: Math.max(0, scrollY + anchor.getBoundingClientRect().top - header - player - 24), behavior: 'instant' });
    }
    await nextFrame();
    if (!active || token !== transition) return;
    position();
    card().style.visibility = 'visible';
    document.querySelector('#guide-title').focus({ preventScroll: true });
  }
  function position() {
    if (!active) return;
    const width = document.documentElement.clientWidth, height = window.visualViewport?.height || innerHeight;
    const margin = 16, gap = 18;
    const panel = card();
    const panelWidth = Math.min(382, width - margin * 2);
    panel.style.width = panelWidth + 'px';
    panel.style.maxHeight = Math.max(160, height - margin * 2) + 'px';
    const panelHeight = panel.getBoundingClientRect().height;
    const r = target?.getBoundingClientRect();
    const headerBottom = document.querySelector('.topbar').getBoundingClientRect().bottom;
    const minY = target?.closest('.topbar') ? 8 : Math.max(8, headerBottom + 8);
    let focus = r ? {
      left: Math.max(8, r.left - 7), top: Math.max(minY, r.top - 7),
      right: Math.min(width - 8, r.right + 7), bottom: Math.min(height - 8, r.bottom + 7)
    } : null;
    let left = (width - panelWidth) / 2, top = height - panelHeight - margin;
    let placement = 'bottom';
    if (focus && width > 700) {
      if (focus.right + gap + panelWidth <= width - margin) {
        left = focus.right + gap;
        top = Math.max(margin, Math.min(focus.top, height - panelHeight - margin));
        placement = 'right';
      } else if (focus.left - gap - panelWidth >= margin) {
        left = focus.left - gap - panelWidth;
        top = Math.max(margin, Math.min(focus.top, height - panelHeight - margin));
        placement = 'left';
      } else if (focus.bottom + gap + panelHeight <= height - margin) {
        left = Math.max(margin, Math.min(focus.left, width - panelWidth - margin));
        top = focus.bottom + gap;
        placement = 'below';
      } else if (focus.top - gap - panelHeight >= headerBottom + 10) {
        left = Math.max(margin, Math.min(focus.left, width - panelWidth - margin));
        top = focus.top - gap - panelHeight;
        placement = 'above';
      }
    }
    if (focus && width <= 700 && focus.top > top - gap && focus.top - gap - panelHeight >= headerBottom + 10) {
      top = focus.top - gap - panelHeight;
      placement = 'above';
    }
    panel.style.left = left + 'px';
    panel.style.top = Math.max(margin, top) + 'px';
    panel.dataset.placement = placement;
    const spotlight = document.querySelector('.guide-focus');
    if (focus && placement === 'bottom') focus.bottom = Math.min(focus.bottom, top - gap);
    if (focus && focus.right > focus.left && focus.bottom > focus.top) {
      spotlight.hidden = false;
      Object.assign(spotlight.style, { left: focus.left + 'px', top: focus.top + 'px', width: (focus.right - focus.left) + 'px', height: (focus.bottom - focus.top) + 'px' });
      dialog().classList.remove('guide-no-target');
    } else {
      spotlight.hidden = true;
      dialog().classList.add('guide-no-target');
    }
  }
  function queuePosition() {
    if (!active) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(position);
  }
  async function finish(choice = 'skipped', navigation = false) {
    if (!active) return;
    active = false;
    ++transition;
    cancelAnimationFrame(frame);
    remember(choice);
    dialog().close();
    document.documentElement.classList.remove('guide-active');
    const saved = snapshot;
    snapshot = null;
    Object.assign(state, saved.state);
    Object.assign(lab, saved.lab);
    diagramZoom = saved.zoom;
    document.querySelector('#follow-step').checked = false;
    renderJourney(); renderIbp(); renderCompare(); syncLabControls();
    document.querySelector('#reference-search').value = saved.search;
    renderReference(saved.search);
    setTab(saved.state.tab, false);
    await nextFrame();
    const viewport = document.querySelector('#diagram-viewport');
    viewport.scrollTo({ left: saved.mapX, top: saved.mapY, behavior: 'instant' });
    document.querySelector('#follow-step').checked = saved.follow;
    window.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
    if (navigation) routeFromHash(true);
    focusTrigger();
  }
  function init() {
    if (initialized) return;
    initialized = true;
    document.querySelector('#guide-length').textContent = `${steps.length} stops · about 3 minutes`;
    document.addEventListener('click', e => {
      const button = e.target.closest('[data-start-guide]');
      if (button) start(button);
    });
    document.querySelector('#guide-start').onclick = () => start(trigger);
    document.querySelector('#guide-later').onclick = () => { remember('skipped'); welcome().close(); focusTrigger(); };
    document.querySelector('#guide-welcome-close').onclick = () => { remember('skipped'); welcome().close(); focusTrigger(); };
    welcome().addEventListener('cancel', () => { remember('skipped'); requestAnimationFrame(focusTrigger); });
    document.querySelector('#guide-back').onclick = () => { if (index > 0) { index--; showStep(); } };
    document.querySelector('#guide-next').onclick = () => { if (index < steps.length - 1) { index++; showStep(); } else finish('completed'); };
    document.querySelector('#guide-skip').onclick = () => finish();
    document.querySelector('#guide-close').onclick = () => finish();
    dialog().addEventListener('cancel', e => { e.preventDefault(); finish(); });
    dialog().addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        const buttons = Array.from(card().querySelectorAll('button:not([disabled])'));
        const current = buttons.indexOf(document.activeElement);
        const next = current < 0 ? (e.shiftKey ? buttons.length - 1 : 0) : (current + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
        e.preventDefault();
        buttons[next]?.focus();
        return;
      }
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowLeft' && index > 0) { index--; showStep(); }
      if (e.key === 'ArrowRight') { if (index < steps.length - 1) { index++; showStep(); } else finish('completed'); }
    });
    window.addEventListener('resize', queuePosition);
    window.addEventListener('scroll', queuePosition, { passive: true });
    window.visualViewport?.addEventListener('resize', queuePosition);
    window.visualViewport?.addEventListener('scroll', queuePosition);
    // Browser navigation ends the guide instead of trapping the visitor in a tour view.
    window.addEventListener('popstate', () => { if (active) finish('skipped', true); });
    setTimeout(() => {
      if (!hasSeenGuide() && !active && !document.querySelector('#detail-dialog').open) {
        trigger = document.querySelector('.guide-trigger');
        stop();
        welcome().showModal();
        document.querySelector('#guide-start').focus();
      }
    }, 450);
  }
  document.addEventListener('explorer-ready', init, { once: true });
  if (document.documentElement.dataset.ready === 'true') init();
})();
