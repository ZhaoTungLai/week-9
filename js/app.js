(() => {
  const t = (key, values) => window.I18N.t(key, values);
  const categoryMeta = {
    institutional_procedure: { en: 'Institutional procedure', zh: '制度程序', color: '#9d5a3a' },
    speech_cognition: { en: 'Speech & cognition', zh: '言語與認知', color: '#547f72' },
    affect_embodiment: { en: 'Affect & embodiment', zh: '情感與身體', color: '#b98845' },
    social_relation: { en: 'Social relation', zh: '社會關係', color: '#62718d' },
    material_action: { en: 'Material action', zh: '物質行動', color: '#a9554d' }
  };
  const strategyKeys = ['compact', 'expanded', 'omitted'];
  const PAGE_SIZE = 20;
  const state = {
    q: '', category: '', checked: '', sensitive: '', selectedTerm: '', selectedTarget: '',
    networkLimit: 24, networkWeight: 2, kwicLimit: 12, page: 1, sortKey: 'id', sortDir: 'asc'
  };
  let entries = [];
  let filtered = [];

  const el = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const asciiLower = value => String(value ?? '').toLocaleLowerCase('en');
  const displayCategory = key => categoryMeta[key]?.[document.documentElement.dataset.lang] || t(`category_${key}`) || key;
  const displayStrategy = key => t(`strategy_${key}`) || key;
  const isSensitive = row => row.sensitive === 'yes';
  const termsOf = row => [row.key_term, row.target_term].filter(Boolean).map(x => x.trim().toLowerCase());
  const queryTerms = () => state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const allCategoryKeys = Object.keys(categoryMeta);

  function strategyFor(row) {
    const target = String(row.target_term || '').trim();
    if (!target || !String(row.target_text || '').includes(target)) return 'omitted';
    // Chinese orthography makes verb compactness observable: up to two Han
    // characters is compact, while three or more is an expanded verbal phrase.
    return [...target].length <= 2 ? 'compact' : 'expanded';
  }

  function matchesSearch(row) {
    const terms = queryTerms();
    if (!terms.length) return true;
    const haystack = asciiLower([row.source_text, row.target_text, row.key_term, row.target_term, row.source_id, row.category].join(' '));
    return terms.every(term => haystack.includes(term));
  }

  function applyFilters() {
    filtered = entries.filter(row => {
      if (!matchesSearch(row)) return false;
      if (state.category && row.category !== state.category) return false;
      if (state.checked && row.human_checked !== state.checked) return false;
      if (state.sensitive === 'no' && isSensitive(row)) return false;
      if (state.sensitive === 'yes' && !isSensitive(row)) return false;
      return true;
    });
    if (state.page > pageCount()) state.page = pageCount();
    renderAll();
  }

  function pageCount() { return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); }

  function sortedRows() {
    const direction = state.sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = asciiLower(a[state.sortKey] ?? '');
      const bv = asciiLower(b[state.sortKey] ?? '');
      return av.localeCompare(bv, 'en', { numeric: true }) * direction;
    });
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.checked) params.set('checked', state.checked);
    if (state.sensitive) params.set('sensitive', state.sensitive);
    if (state.selectedTerm) params.set('term', state.selectedTerm);
    if (state.selectedTarget) params.set('target', state.selectedTarget);
    if (state.networkLimit !== 24) params.set('network', state.networkLimit);
    if (state.networkWeight !== 2) params.set('weight', state.networkWeight);
    if (state.kwicLimit !== 12) params.set('contexts', state.kwicLimit);
    const next = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.replaceState(null, '', next);
  }

  function loadUrl() {
    const params = new URLSearchParams(location.search);
    state.q = params.get('q') || '';
    state.category = params.get('category') || '';
    state.checked = params.get('checked') || '';
    state.sensitive = params.get('sensitive') || '';
    state.selectedTerm = params.get('term') || '';
    state.selectedTarget = params.get('target') || '';
    state.networkLimit = Math.min(40, Math.max(10, Number(params.get('network')) || 24));
    state.networkWeight = Math.min(8, Math.max(1, Number(params.get('weight')) || 2));
    state.kwicLimit = Math.min(30, Math.max(5, Number(params.get('contexts')) || 12));
    el('search').value = state.q;
    el('category-filter').value = state.category;
    el('checked-filter').value = state.checked;
    el('sensitive-filter').value = state.sensitive;
    el('network-limit').value = state.networkLimit;
    el('network-limit-value').value = state.networkLimit;
    el('network-weight').value = state.networkWeight;
    el('network-weight-value').value = state.networkWeight;
    el('kwic-limit').value = state.kwicLimit;
    el('kwic-limit-value').value = state.kwicLimit;
  }

  function setSelected(term, target = '', updateSearch = true) {
    state.selectedTerm = term || '';
    state.selectedTarget = target || '';
    if (updateSearch) {
      state.q = term || '';
      el('search').value = state.q;
    }
    state.page = 1;
    applyFilters();
    syncUrl();
  }

  function categoryOptions() {
    const select = el('category-filter');
    select.innerHTML = `<option value="">${escapeHtml(t('all_categories'))}</option>` +
      allCategoryKeys.map(key => `<option value="${key}">${escapeHtml(displayCategory(key))}</option>`).join('');
    select.value = state.category;
  }

  function renderAll() {
    renderSummary();
    renderNetwork();
    renderHeatmap();
    renderKwic();
    renderTable();
  }

  function renderSummary() {
    el('result-count').textContent = filtered.length;
    el('hero-count').textContent = entries.length;
    el('hero-category-count').textContent = new Set(entries.map(r => r.category)).size;
    el('hero-seed').textContent = entries[0]?.sample_seed || 2026;
    const bits = [];
    if (state.q) bits.push(`${t('active_search')}: “${state.q}”`);
    if (state.category) bits.push(`${t('filter_category')}: ${displayCategory(state.category)}`);
    if (state.checked) bits.push(`${t('filter_checked')}: ${state.checked === 'yes' ? t('checked_yes') : t('checked_no')}`);
    if (state.sensitive) bits.push(`${t('filter_sensitive')}: ${state.sensitive === 'yes' ? t('show_sensitive') : t('show_safe')}`);
    el('active-filter-text').textContent = bits.join(' · ');
    el('active-filter-text').hidden = bits.length === 0;
  }

  function svgEl(name, attrs = {}) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function aggregateNetwork() {
    const counts = new Map();
    filtered.forEach(row => {
      const source = (row.key_term || '').trim();
      const target = (row.target_term || '').trim();
      if (!source || !target) return;
      const key = `${source.toLowerCase()}|||${target}`;
      const existing = counts.get(key) || { source, target, weight: 0 };
      existing.weight++;
      counts.set(key, existing);
    });
    let links = [...counts.values()].filter(link => link.weight >= state.networkWeight);
    const nodeWeights = new Map();
    links.forEach(link => {
      nodeWeights.set('src:' + link.source.toLowerCase(), (nodeWeights.get('src:' + link.source.toLowerCase()) || 0) + link.weight);
      nodeWeights.set('tgt:' + link.target, (nodeWeights.get('tgt:' + link.target) || 0) + link.weight);
    });
    const ranked = [...nodeWeights.entries()].sort((a, b) => b[1] - a[1]);
    const allowed = new Set(ranked.slice(0, state.networkLimit).map(([id]) => id));
    links = links.filter(link => allowed.has('src:' + link.source.toLowerCase()) && allowed.has('tgt:' + link.target));
    return { links, allowed, nodeWeights };
  }

  function renderNetwork() {
    const container = el('network-chart');
    const { links, allowed, nodeWeights } = aggregateNetwork();
    if (!links.length) {
      container.innerHTML = `<div class="empty-state">${escapeHtml(t('network_empty'))}</div>`;
      return;
    }
    const width = Math.max(640, container.clientWidth || 900);
    const height = 480;
    const sources = [...new Set(links.map(l => l.source))];
    const targets = [...new Set(links.map(l => l.target))];
    const sourceNodes = sources.map(source => ({ id: 'src:' + source.toLowerCase(), label: source, kind: 'source' }));
    const targetNodes = targets.map(target => ({ id: 'tgt:' + target, label: target, kind: 'target' }));
    const nodes = [...sourceNodes, ...targetNodes];

    const pos = new Map();
    const sourceX = Math.max(90, Math.min(240, width * .18));
    const targetX = Math.min(width - 90, Math.max(width - 240, width * .82));
    const distribute = (items, x) => {
      const top = 55, bottom = height - 45;
      items.forEach((node, index) => {
        const y = items.length === 1 ? height / 2 : top + (bottom - top) * index / (items.length - 1);
        pos.set(node.id, { x, y, vx: 0, vy: 0 });
      });
    };
    distribute(sourceNodes, sourceX);
    distribute(targetNodes, targetX);

    const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, role: 'presentation' });
    const defs = svgEl('defs');
    defs.innerHTML = '<marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8a9b92"/></marker>';
    svg.appendChild(defs);
    const linksGroup = svgEl('g');
    const nodesGroup = svgEl('g');
    svg.append(linksGroup, nodesGroup);

    const linkByKey = new Map();
    links.forEach(link => {
      const key = `${link.source.toLowerCase()}|||${link.target}`;
      const line = svgEl('line', { class: 'link', 'marker-end': 'url(#arrow)' });
      line.dataset.source = 'src:' + link.source.toLowerCase();
      line.dataset.target = 'tgt:' + link.target;
      line.dataset.weight = link.weight;
      linksGroup.appendChild(line);
      linkByKey.set(key, line);
    });

    const nodeRefs = new Map();
    nodes.forEach(node => {
      const group = svgEl('g', { class: `node ${node.kind}`, 'data-id': node.id, 'data-label': node.label, tabindex: '0', role: 'button', 'aria-label': `${node.label}, ${node.kind === 'source' ? t('network_source') : t('network_target')}` });
      const circle = svgEl('circle', {});
      const text = svgEl('text', { 'text-anchor': node.kind === 'source' ? 'end' : 'start', 'dominant-baseline': 'middle' });
      text.textContent = node.label;
      group.append(circle, text);
      nodesGroup.appendChild(group);
      nodeRefs.set(node.id, { group, circle, text, node });
      group.addEventListener('click', () => {
        const label = node.label;
        const target = node.kind === 'target' ? label : '';
        setSelected(node.kind === 'source' ? label : label, target);
      });
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          group.click();
        }
      });
    });

    function draw() {
      links.forEach(link => {
        const line = linkByKey.get(`${link.source.toLowerCase()}|||${link.target}`);
        const a = pos.get('src:' + link.source.toLowerCase());
        const b = pos.get('tgt:' + link.target);
        if (!a || !b) return;
        line.setAttribute('x1', a.x - 100);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x - 100);
        line.setAttribute('y2', b.y);
        line.setAttribute('stroke-width', Math.min(5, 1 + Math.log2(link.weight + 1)));
      });
      nodes.forEach(node => {
        const p = pos.get(node.id);
        const ref = nodeRefs.get(node.id);
        if (!p || !ref) return;
        const weight = nodeWeights.get(node.id) || 1;
        const radius = Math.min(29, 8 + Math.sqrt(weight) * 3.2);
        ref.circle.setAttribute('cx', p.x);
        ref.circle.setAttribute('cy', p.y);
        ref.circle.setAttribute('r', radius);
        ref.text.setAttribute('x', node.kind === 'source' ? p.x - radius - 7 : p.x + radius + 7);
        ref.text.setAttribute('y', p.y);
        ref.group.classList.toggle('active', asciiLower(node.label) === asciiLower(state.selectedTerm) || node.label === state.selectedTarget);
      });
    }

    // Simple force relaxation, while preserving the two-column reading order.
    const nodeList = nodes.map(node => ({ node, ...pos.get(node.id) }));
    const idToNode = new Map(nodeList.map(n => [n.node.id, n]));
    for (let iteration = 0; iteration < 160; iteration++) {
      for (const link of links) {
        const a = idToNode.get('src:' + link.source.toLowerCase());
        const b = idToNode.get('tgt:' + link.target);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const gravity = (distance - 210) * .012;
        a.vx += dx / distance * gravity; a.vy += dy / distance * gravity;
        b.vx -= dx / distance * gravity; b.vy -= dy / distance * gravity;
      }
      nodeList.forEach(n => {
        const anchorX = n.node.kind === 'source' ? sourceX : targetX;
        n.vx += (anchorX - n.x) * .02;
        n.vx *= .80; n.vy *= .80;
        if (n.node.kind === 'source') n.vy += (height / 2 - n.y) * .002;
        n.x += n.vx; n.y += n.vy;
        n.y = Math.max(45, Math.min(height - 35, n.y));
        pos.set(n.node.id, { x: n.x, y: n.y });
      });
    }
    draw();
    container.innerHTML = '';
    container.appendChild(svg);

    let scale = 1;
    let dragging = null;
    let last = null;
    svg.addEventListener('wheel', event => {
      event.preventDefault();
      scale = Math.max(.7, Math.min(2.2, scale + (event.deltaY < 0 ? .08 : -.08)));
      svg.style.transform = `scale(${scale})`;
      svg.style.transformOrigin = 'center';
    }, { passive: false });
    svg.querySelectorAll('.node').forEach(group => {
      group.addEventListener('pointerdown', event => {
        const id = group.dataset.id;
        const p = pos.get(id);
        if (!p) return;
        dragging = { id, startX: event.offsetX, startY: event.offsetY, x: p.x, y: p.y };
        last = p;
        group.setPointerCapture(event.pointerId);
      });
      group.addEventListener('pointermove', event => {
        if (!dragging || dragging.id !== group.dataset.id) return;
        const p = pos.get(dragging.id);
        if (!p) return;
        const next = { x: dragging.x + event.offsetX - dragging.startX, y: dragging.y + event.offsetY - dragging.startY };
        pos.set(dragging.id, next);
        draw();
      });
      group.addEventListener('pointerup', () => { dragging = null; last = null; });
    });
  }

  function renderHeatmap() {
    const container = el('heatmap-chart');
    const cats = allCategoryKeys.filter(cat => filtered.some(row => row.category === cat));
    if (!cats.length) {
      container.innerHTML = `<div class="empty-state">${escapeHtml(t('heat_empty'))}</div>`;
      return;
    }
    const matrix = {};
    cats.forEach(cat => { matrix[cat] = { compact: 0, expanded: 0, omitted: 0 }; });
    filtered.forEach(row => { matrix[row.category][strategyFor(row)]++; });
    const max = Math.max(1, ...cats.flatMap(cat => strategyKeys.map(strategy => matrix[cat][strategy])));
    const grid = document.createElement('div');
    grid.className = 'heat-grid';
    grid.style.gridTemplateColumns = `minmax(110px, 1.25fr) repeat(3, minmax(62px, .7fr))`;
    grid.appendChild(Object.assign(document.createElement('div'), { className: 'heat-label', textContent: '' }));
    strategyKeys.forEach(strategy => {
      const label = document.createElement('div');
      label.className = 'heat-label col';
      label.textContent = displayStrategy(strategy);
      grid.appendChild(label);
    });
    cats.forEach(cat => {
      const label = document.createElement('div');
      label.className = 'heat-label';
      label.textContent = displayCategory(cat);
      grid.appendChild(label);
      strategyKeys.forEach(strategy => {
        const count = matrix[cat][strategy];
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'heat-cell';
        cell.textContent = count;
        const ratio = count / max;
        cell.style.background = `rgba(38, 117, 107, ${0.10 + ratio * 0.78})`;
        cell.style.color = ratio > .5 ? '#fff' : '#16201d';
        cell.classList.toggle('active', state.category === cat && queryTerms().includes(displayStrategy(strategy).toLowerCase()));
        cell.title = `${displayCategory(cat)} × ${displayStrategy(strategy)}: ${count}`;
        cell.addEventListener('click', () => {
          state.category = cat;
          el('category-filter').value = cat;
          applyFilters();
          syncUrl();
        });
        grid.appendChild(cell);
      });
    });
    container.innerHTML = '';
    container.appendChild(grid);
  }

  function highlightText(text, terms) {
    let safe = escapeHtml(text);
    terms.filter(Boolean).forEach(term => {
      const escapedTerm = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!escapedTerm) return;
      safe = safe.replace(new RegExp(`(${escapedTerm})`, 'gi'), '<mark class="kwic-hit">$1</mark>');
    });
    return safe;
  }

  function renderKwic() {
    const container = el('kwic-chart');
    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state">${escapeHtml(t('kwic_empty'))}</div>`;
      return;
    }
    const q = state.q.trim();
    const selected = state.selectedTerm || q;
    const contexts = filtered.slice(0, state.kwicLimit);
    container.innerHTML = contexts.map(row => {
      const sourceTerms = [row.key_term, selected].filter(Boolean);
      const targetTerms = [row.target_term, selected].filter(Boolean);
      return `<div class="kwic-row">
        <div class="kwic-pair"><span class="lang">${escapeHtml(t('lang_label'))}</span><span class="kwic-text">${highlightText(row.source_text, sourceTerms)}</span>
          <div class="meta-line"><span class="tag">${escapeHtml(row.id)}</span><span class="tag">${escapeHtml(displayCategory(row.category))}</span></div></div>
        <div class="kwic-pair"><span class="lang">${escapeHtml(t('target_lang_label'))}</span><span class="kwic-text">${highlightText(row.target_text, targetTerms)}</span>
          <div class="meta-line"><button type="button" class="link-button term-button" data-term="${escapeHtml(row.key_term)}" data-target="${escapeHtml(row.target_term)}">${escapeHtml(row.key_term)} → ${escapeHtml(row.target_term)}</button></div></div>
      </div>`;
    }).join('');
    container.querySelectorAll('.kwic-hit').forEach(node => node.addEventListener('click', () => setSelected(node.textContent)));
    container.querySelectorAll('.term-button').forEach(node => node.addEventListener('click', () => setSelected(node.dataset.term, node.dataset.target)));
  }

  function renderTable() {
    const rows = sortedRows().slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    const body = el('table-body');
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7" class="empty-state">${escapeHtml(t('no_results'))}</td></tr>`;
    } else {
      body.innerHTML = rows.map(row => `<tr>
        <td>${escapeHtml(row.id)}</td>
        <td><button type="button" class="term-button" data-term="${escapeHtml(row.key_term)}" data-target="${escapeHtml(row.target_term)}">${escapeHtml(row.key_term)}</button></td>
        <td>${escapeHtml(row.target_term)}</td>
        <td><span class="tag" style="background:${categoryMeta[row.category]?.color}22;color:${categoryMeta[row.category]?.color}">${escapeHtml(displayCategory(row.category))}</span></td>
        <td><span class="sentence">${escapeHtml(row.source_text)}</span><a href="${escapeHtml(row.source_url)}" target="_blank" rel="noopener" class="tag">${escapeHtml(row.source_id)}</a></td>
        <td><span class="sentence">${escapeHtml(row.target_text)}</span></td>
        <td>${row.human_checked === 'yes' ? `<span class="tag checked">${escapeHtml(t('checked_tag'))}</span>` : `<span class="tag">${escapeHtml(t('unchecked_tag'))}</span>`}${isSensitive(row) ? `<span class="tag sensitive">${escapeHtml(t('sensitive_tag'))}</span>` : ''}</td>
      </tr>`).join('');
      body.querySelectorAll('.term-button').forEach(node => node.addEventListener('click', () => setSelected(node.dataset.term, node.dataset.target)));
    }
    const start = filtered.length ? (state.page - 1) * PAGE_SIZE + 1 : 0;
    const end = Math.min(state.page * PAGE_SIZE, filtered.length);
    el('table-range').textContent = t('table_range', { start, end, total: filtered.length });
    el('prev-page').disabled = state.page <= 1;
    el('next-page').disabled = state.page >= pageCount();
    document.querySelectorAll('[data-sort]').forEach(button => {
      const active = button.dataset.sort === state.sortKey;
      button.textContent = button.dataset.labelBase || button.textContent.replace(/[ ↑↓]+$/, '');
      button.dataset.labelBase = button.textContent;
      button.textContent = button.dataset.labelBase + (active ? (state.sortDir === 'asc' ? ' ↑' : ' ↓') : '');
    });
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function exportCsv() {
    const fields = ['id', 'source_id', 'key_term', 'target_term', 'category', 'source_text', 'target_text', 'human_checked', 'machine_checked', 'sensitive', 'source_url', 'source'];
    const lines = [fields.join(',')];
    filtered.forEach(row => lines.push(fields.map(field => csvEscape(row[field])).join(',')));
    const blob = new Blob([`\ufeff${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'nominal-to-verb-filtered.csv';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    toast('CSV · ' + filtered.length);
  }

  function toast(message) {
    const box = el('toast');
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => box.classList.remove('show'), 1800);
  }

  function wireEvents() {
    const search = el('search');
    let timer = 0;
    search.addEventListener('input', () => {
      state.q = search.value.trim();
      state.selectedTerm = state.q;
      state.page = 1;
      clearTimeout(timer);
      timer = setTimeout(() => { applyFilters(); syncUrl(); }, 100);
    });
    document.addEventListener('keydown', event => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        event.preventDefault();
        search.focus();
      }
    });
    el('category-filter').addEventListener('change', event => { state.category = event.target.value; state.page = 1; applyFilters(); syncUrl(); });
    el('checked-filter').addEventListener('change', event => { state.checked = event.target.value; state.page = 1; applyFilters(); syncUrl(); });
    el('sensitive-filter').addEventListener('change', event => { state.sensitive = event.target.value; state.page = 1; applyFilters(); syncUrl(); });
    el('network-limit').addEventListener('input', event => { state.networkLimit = Number(event.target.value); el('network-limit-value').value = state.networkLimit; renderNetwork(); syncUrl(); });
    el('network-weight').addEventListener('input', event => { state.networkWeight = Number(event.target.value); el('network-weight-value').value = state.networkWeight; renderNetwork(); syncUrl(); });
    el('kwic-limit').addEventListener('input', event => { state.kwicLimit = Number(event.target.value); el('kwic-limit-value').value = state.kwicLimit; renderKwic(); syncUrl(); });
    el('prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); } });
    el('next-page').addEventListener('click', () => { if (state.page < pageCount()) { state.page++; renderTable(); } });
    el('clear-filters').addEventListener('click', () => {
      Object.assign(state, { q: '', category: '', checked: '', sensitive: '', selectedTerm: '', selectedTarget: '', page: 1 });
      el('search').value = '';
      el('category-filter').value = '';
      el('checked-filter').value = '';
      el('sensitive-filter').value = '';
      applyFilters();
      syncUrl();
    });
    el('copy-view').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        toast(t('copied'));
      } catch (error) {
        toast(t('copy_failed'));
      }
    });
    el('export-csv').addEventListener('click', exportCsv);
    document.querySelectorAll('[data-sort]').forEach(button => {
      button.dataset.labelBase = button.textContent;
      button.addEventListener('click', () => {
        if (state.sortKey === button.dataset.sort) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = button.dataset.sort; state.sortDir = 'asc'; }
        state.page = 1;
        renderTable();
      });
    });
    window.addEventListener('languagechange', () => {
      categoryOptions();
      const chosenCategory = state.category;
      el('category-filter').value = chosenCategory;
      renderAll();
    });
    window.addEventListener('resize', () => {
      clearTimeout(window.__networkResize);
      window.__networkResize = setTimeout(() => renderNetwork(), 200);
    });
  }

  async function init() {
    try {
      const response = await fetch('data/corpus.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      entries = await response.json();
      loadUrl();
      categoryOptions();
      wireEvents();
      applyFilters();
    } catch (error) {
      document.querySelector('main').innerHTML = `<section class="section"><h2>Could not load the corpus</h2><p>The data file could not be read. Serve this folder over HTTP rather than opening the HTML file directly.</p><pre>${escapeHtml(error.message)}</pre></section>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
