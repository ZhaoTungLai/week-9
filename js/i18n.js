(function () {
  const copy = {
    en: {
      brand: 'Nominal to Verb', tagline: 'A translation corpus explorer',
      nav_explore: 'Explore', nav_report: 'Learning report', nav_codebook: 'Codebook', nav_ai: 'AI use', repo: 'Repository ↗',
      eyebrow: 'Translation Technology · 2026R1',
      title: 'When an English noun becomes a Chinese verb',
      lead: 'Explore 500 sampled subtitle pairs from OpenSubtitles v2024 and see how nominal ideas are often recast as actions in Chinese.',
      start_exploring: 'Start exploring', read_method: 'Read the method',
      stat_entries: 'sentence pairs', stat_categories: 'categories', stat_seed: 'random seed',
      stat_note: 'A fixed, reproducible sample—not hand-picked highlights.',
      source_label: 'Source', index_label: 'Indexed by', languages_label: 'Language pair', review_label: 'Review status', machine_matched: 'Machine matched',
      explore_eyebrow: 'Corpus explorer', explore_title: 'Follow the nominal',
      explore_intro: 'Search the sentence pair or term, narrow the view, then click a term or chart mark to keep following it.',
      search_label: 'Search sentence or term', category_label: 'Category', checked_label: 'Human checked', sensitive_label: 'Sensitive content',
      all_categories: 'All categories', all_status: 'All statuses', checked_yes: 'Checked', checked_no: 'Not yet checked',
      all_content: 'All content', show_safe: 'Hide sensitive', show_sensitive: 'Sensitive only', reset: 'Reset view',
      results: 'results', copy_view: 'Copy shareable view',
      viz_relational: 'Relational', network_title: 'Term network', top_terms: 'Show top terms', min_weight: 'Minimum link weight',
      network_caption: 'Which source terms travel to more than one Chinese rendering?',
      network_hint: 'Click a node to search both languages. Drag nodes to rearrange; scroll to zoom.',
      viz_distributional: 'Distributional', heatmap_title: 'Category × verb form',
      heatmap_caption: 'Do categories favor compact verbs, expanded verbal phrases, or omit the source term entirely?',
      heatmap_hint: 'Click a cell to filter by category and open that term.',
      viz_lexical: 'Lexical', kwic_title: 'Bilingual KWIC', context_limit: 'Contexts',
      kwic_caption: 'How does the selected source nominal sit inside its original sentence and Chinese rendering?',
      kwic_hint: 'Click an underlined source or target term to make it the active search.',
      viz_tabular: 'Tabular', table_title: 'Corpus table', export_csv: 'Export CSV',
      table_caption: 'Which individual rows support the patterns in the charts?',
      col_id: 'ID', col_term: 'English nominal', col_target: 'Chinese verb', col_category: 'Category',
      col_source: 'Source sentence', col_translation: 'Chinese sentence', col_checked: 'Checked',
      previous: 'Previous', next: 'Next',
      reading_eyebrow: 'How to read this', reading_title: 'A pattern, not a proof of causation',
      reading_body: 'The sample shows recurring nominal-to-verbal shifts, but subtitle translation also reflects timing, dialogue rhythm, and the choices of unknown translators. The site treats category labels as an interpretable first pass and keeps verification status visible.',
      read_full_report: 'Read the full learning report →',
      footer_course: 'Translation Technology in the Age of AI · 2026R1',
      footer_credit: 'Source data: OpenSubtitles v2024, indexed by NV Atlas, CUHK. Sample method and limitations are documented in the report.',
      footer_codebook: 'Codebook', footer_ai: 'AI use declaration',
      category_institutional_procedure: 'Institutional procedure', category_speech_cognition: 'Speech & cognition',
      category_affect_embodiment: 'Affect & embodiment', category_social_relation: 'Social relation', category_material_action: 'Material action',
      strategy_compact: 'Compact verb', strategy_expanded: 'Expanded verb', strategy_omitted: 'Term omitted',
      active_search: 'Search', all_results: 'All entries', no_results: 'No entries match this view.',
      table_range: 'Showing {start}–{end} of {total}', copied: 'Shareable view copied', copy_failed: 'Could not copy the URL',
      checked_tag: 'Human checked', unchecked_tag: 'Not yet checked', sensitive_tag: 'Sensitive',
      target_table: 'Target', source_table: 'Source', open_source: 'Open source record ↗',
      network_empty: 'No nodes meet the current thresholds.', heat_empty: 'No data in this view.', kwic_empty: 'No contexts in this view.',
      page_label: 'Page {page} of {pages}',
      lang_label: 'English', target_lang_label: 'Chinese',
      clear_search: 'Clear search',
      show_more: 'Show more', show_less: 'Show less',
      network_source: 'English nominal', network_target: 'Chinese rendering',
      heat_category: 'Category', heat_strategy: 'Strategy',
      filter_active: 'Active filters:', filter_category: 'Category', filter_checked: 'Checked', filter_sensitive: 'Content',
      selected_term: 'Selected term', click_node: 'Click any node to follow a term.',
      report_link: 'Learning report',
      source_link_label: 'Source record'
    },
    zh: {
      brand: '名詞轉動詞', tagline: '翻譯語料探索器',
      nav_explore: '探索', nav_report: '學習報告', nav_codebook: '分類手冊', nav_ai: 'AI 使用聲明', repo: '程式碼庫 ↗',
      eyebrow: '翻譯科技 · 2026R1',
      title: '當英文名詞在中文裡變成動詞',
      lead: '探索 500 組取自 OpenSubtitles v2024 的字幕樣本，觀察名詞概念如何經常在中文裡被重寫為動作。',
      start_exploring: '開始探索', read_method: '閱讀研究方法',
      stat_entries: '句子對', stat_categories: '分類', stat_seed: '隨機種子',
      stat_note: '固定且可重現的樣本，而非刻意挑選的亮點。',
      source_label: '資料來源', index_label: '索引來源', languages_label: '語言配對', review_label: '審核狀態', machine_matched: '機器比對',
      explore_eyebrow: '語料探索器', explore_title: '沿著名詞追蹤',
      explore_intro: '搜尋句子對或詞語、收窄範圍，然後點擊詞語或圖表標記，繼續追蹤翻譯模式。',
      search_label: '搜尋句子或詞語', category_label: '分類', checked_label: '人工核對', sensitive_label: '敏感內容',
      all_categories: '全部分類', all_status: '全部狀態', checked_yes: '已核對', checked_no: '尚未核對',
      all_content: '全部內容', show_safe: '隱藏敏感內容', show_sensitive: '只顯示敏感內容', reset: '重設檢視',
      results: '筆結果', copy_view: '複製可分享檢視',
      viz_relational: '關係', network_title: '詞語網絡', top_terms: '顯示詞語數', min_weight: '最少連結次數',
      network_caption: '哪些英文來源詞會連向多於一種中文譯法？',
      network_hint: '點擊節點可同時搜尋兩種語言。可拖曳節點；滾輪可縮放。',
      viz_distributional: '分佈', heatmap_title: '分類 × 動詞形式',
      heatmap_caption: '各分類較常使用精簡動詞、擴展動詞，還是完全省略來源詞？',
      heatmap_hint: '點擊方格以篩選分類並開啟該詞語。',
      viz_lexical: '詞彙', kwic_title: '雙語關鍵詞脈絡', context_limit: '顯示脈絡數',
      kwic_caption: '所選英文名詞如何出現在原句與中文譯句之中？',
      kwic_hint: '點擊帶底線的來源詞或譯詞，將其設為目前搜尋詞。',
      viz_tabular: '表格', table_title: '語料表', export_csv: '匯出 CSV',
      table_caption: '哪些個別資料列支持圖表呈現的模式？',
      col_id: '編號', col_term: '英文名詞', col_target: '中文動詞', col_category: '分類',
      col_source: '英文原句', col_translation: '中文譯句', col_checked: '核對狀態',
      previous: '上一頁', next: '下一頁',
      reading_eyebrow: '如何閱讀', reading_title: '這是模式，不是因果證明',
      reading_body: '樣本顯示名詞轉動詞的重複現象，但字幕翻譯也受時間、對白節奏及未知譯者選擇影響。本網站把分類視為可解釋的初步標註，並清楚顯示人工核對狀態。',
      read_full_report: '閱讀完整學習報告 →',
      footer_course: 'AI 時代的翻譯科技 · 2026R1',
      footer_credit: '資料來源：OpenSubtitles v2024，由香港中文大學 NV Atlas 建索引。抽樣方法與限制詳見學習報告。',
      footer_codebook: '分類手冊', footer_ai: 'AI 使用聲明',
      category_institutional_procedure: '制度程序', category_speech_cognition: '言語與認知',
      category_affect_embodiment: '情感與身體', category_social_relation: '社會關係', category_material_action: '物質行動',
      strategy_compact: '精簡動詞', strategy_expanded: '擴展動詞', strategy_omitted: '詞語省略',
      active_search: '搜尋', all_results: '全部資料', no_results: '此檢視沒有符合的資料。',
      table_range: '顯示第 {start}–{end} 筆，共 {total} 筆', copied: '已複製可分享檢視', copy_failed: '無法複製網址',
      checked_tag: '已人工核對', unchecked_tag: '尚未核對', sensitive_tag: '敏感',
      target_table: '譯文', source_table: '原文', open_source: '開啟來源紀錄 ↗',
      network_empty: '目前門檻下沒有節點。', heat_empty: '此檢視沒有資料。', kwic_empty: '此檢視沒有脈絡。',
      page_label: '第 {page} 頁，共 {pages} 頁',
      lang_label: '英文', target_lang_label: '中文',
      clear_search: '清除搜尋',
      show_more: '顯示更多', show_less: '顯示較少',
      network_source: '英文名詞', network_target: '中文譯法',
      heat_category: '分類', heat_strategy: '策略',
      filter_active: '目前篩選：', filter_category: '分類', filter_checked: '核對', filter_sensitive: '內容',
      selected_term: '所選詞語', click_node: '點擊任何節點以追蹤詞語。',
      report_link: '學習報告',
      source_link_label: '來源紀錄'
    }
  };
  const supported = ['en', 'zh'];
  function getLang() {
    const saved = localStorage.getItem('nominal-verb-lang');
    return supported.includes(saved) ? saved : 'en';
  }
  function format(template, values = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
  }
  function t(key, values) {
    const lang = document.documentElement.dataset.lang || getLang();
    const dict = copy[lang] || copy.en;
    return format(dict[key] ?? copy.en[key] ?? key, values);
  }
  function setLang(lang) {
    if (!supported.includes(lang)) lang = 'en';
    localStorage.setItem('nominal-verb-lang', lang);
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-lang-switch]').forEach(btn => btn.classList.toggle('active', btn.dataset.langSwitch === lang));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }
  window.I18N = { t, setLang, getLang, copy };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang-switch]').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.langSwitch)));
    setLang(getLang());
  });
})();
