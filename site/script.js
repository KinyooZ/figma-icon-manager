// ============================================
// Scroll behaviour: always land on hero on refresh
// ============================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => {
  // Clear any hash so reload doesn't jump to an anchor either
  if (window.location.hash) {
    try { window.scrollTo(0, 0); } catch (e) {}
  }
});

// ============================================
// Bilingual language toggle
// ============================================

const translations = {
  en: {
    'announce': 'Figma icon library → GitHub, in a single commit.',
    'hero.title.1': 'Design your icons',
    'hero.title.2': 'Ship them as code',
    'hero.sub': 'A Figma plugin that scans your icon library, validates naming, and publishes production-ready React components to GitHub — one click, one commit.',
    'cta.github': 'View on GitHub',
    'cta.quickstart': 'How it works',
    'mockup.status': '✓ 128 icons validated',
    'mockup.outlined': 'Outlined',
    'mockup.filled': 'Filled',
    'mockup.colored': 'Colored',
    'mockup.publish': 'Publish to GitHub →',
    'col.plugin': 'PLUGIN',
    'col.plugin.title': 'Icon categorization',
    'col.plugin.sub': 'Three categories, three color strategies.',
    'feat.outlined.title': 'Outlined',
    'feat.outlined.desc': 'Stroke-based. Uses currentColor so your className cascades.',
    'feat.filled.title': 'Filled',
    'feat.filled.desc': 'Solid fill with currentColor. For emphasis states.',
    'feat.colored.title': 'Colored',
    'feat.colored.desc': 'Preserves original palette. For illustrative icons.',
    'feat.validate.title': 'Naming validation',
    'feat.validate.desc': 'PascalCase + duplicates + empty SVG detection. Errors in Chinese.',
    'col.output': 'OUTPUT',
    'col.output.title': 'Generated code',
    'col.output.sub': 'forwardRef components, TypeScript, zero config.',
    'out.component.title': 'React component',
    'out.component.desc': 'forwardRef + IconProps: size / color / strokeWidth.',
    'out.types.title': 'Types file',
    'out.types.desc': 'Shared IconProps extending SVGProps<SVGSVGElement>.',
    'out.barrel.title': 'Barrel exports',
    'out.barrel.desc': 'Auto-generated index.ts for each category + root.',
    'out.commit.title': 'Atomic commit',
    'out.commit.desc': 'All files pushed in a single commit via Git Data API.',
    'label.howto': 'WORKFLOW',
    'howto.title': 'How it works',
    'step.1.title': 'Structure your Figma file',
    'step.1.desc': 'Create a page with "icon" in its name. Add top-level frames ending with <code>Outlined</code>, <code>Filled</code>, or <code>Colored</code>. Name components in PascalCase.',
    'step.2.title': 'Configure GitHub connection',
    'step.2.desc': 'Paste your Personal Access Token, target repo, branch, and base path. Stored locally in Figma clientStorage.',
    'step.3.title': 'Scan & Publish',
    'step.3.desc': 'The plugin validates structure, generates React TSX components with proper types, and pushes everything in a single commit.',
    'label.code': 'USAGE',
    'code.title': 'Use it like Lucide. Or replace Lucide.',
    'code.sub': 'Generated components follow the React forwardRef pattern with full TypeScript support.',
    'code.import': 'Your App',
    'code.generated': 'Generated',
    'label.install': 'GET STARTED',
    'install.title': 'Start using it now',
    'install.clone': 'Clone the repo',
    'install.build': 'Install and build',
    'install.import': 'In Figma: Plugins → Development → Import plugin from manifest...',
    'footer.desc': 'MIT License · Built by <a href="https://github.com/KinyooZ" target="_blank" rel="noopener">KinyooZ</a>',
  },
  zh: {
    'announce': 'Figma 图标库 → GitHub，一次 commit 完成。',
    'hero.title.1': '设计你的图标',
    'hero.title.2': '以代码形式交付',
    'hero.sub': '一个 Figma 插件，扫描图标库，校验命名规范，一键发布生产级 React 组件到 GitHub —— 一次点击，一次 commit。',
    'cta.github': '查看 GitHub',
    'cta.quickstart': '工作原理',
    'mockup.status': '✓ 已校验 128 个图标',
    'mockup.outlined': 'Outlined',
    'mockup.filled': 'Filled',
    'mockup.colored': 'Colored',
    'mockup.publish': '发布到 GitHub →',
    'col.plugin': '插件功能',
    'col.plugin.title': '图标分类',
    'col.plugin.sub': '三种分类，三种颜色策略。',
    'feat.outlined.title': 'Outlined（线性）',
    'feat.outlined.desc': '基于描边，使用 currentColor，className 样式自动继承。',
    'feat.filled.title': 'Filled（填充）',
    'feat.filled.desc': '实心填充，使用 currentColor，用于强调状态。',
    'feat.colored.title': 'Colored（彩色）',
    'feat.colored.desc': '保留原始配色，适合插画风格图标。',
    'feat.validate.title': '命名校验',
    'feat.validate.desc': '大驼峰命名 + 重名检测 + 空 SVG 检测，错误提示中文显示。',
    'col.output': '输出',
    'col.output.title': '生成的代码',
    'col.output.sub': 'forwardRef 组件，TypeScript，零配置。',
    'out.component.title': 'React 组件',
    'out.component.desc': 'forwardRef + IconProps：size / color / strokeWidth。',
    'out.types.title': '类型文件',
    'out.types.desc': '共享 IconProps，继承 SVGProps&lt;SVGSVGElement&gt;。',
    'out.barrel.title': 'Barrel 导出',
    'out.barrel.desc': '每个分类 + 根目录自动生成 index.ts。',
    'out.commit.title': '原子 commit',
    'out.commit.desc': '所有文件通过 Git Data API 在单次 commit 中推送。',
    'label.howto': '工作流程',
    'howto.title': '工作原理',
    'step.1.title': '整理 Figma 文件结构',
    'step.1.desc': '创建名称包含 "icon" 的页面。顶层 Frame 以 <code>Outlined</code>、<code>Filled</code> 或 <code>Colored</code> 结尾。组件使用大驼峰命名。',
    'step.2.title': '配置 GitHub 连接',
    'step.2.desc': '填入 Personal Access Token、目标仓库、分支和基础路径，通过 Figma clientStorage 本地保存。',
    'step.3.title': '扫描并发布',
    'step.3.desc': '插件校验文件结构，生成带完整类型定义的 React TSX 组件，一次性推送所有文件。',
    'label.code': '使用方式',
    'code.title': '像 Lucide 一样使用，或者替代 Lucide。',
    'code.sub': '生成的组件遵循 React forwardRef 模式，完整 TypeScript 支持。',
    'code.import': '你的应用',
    'code.generated': '生成的文件',
    'label.install': '开始使用',
    'install.title': '现在开始使用',
    'install.clone': '克隆仓库',
    'install.build': '安装依赖并构建',
    'install.import': '在 Figma 中：Plugins → Development → Import plugin from manifest...',
    'footer.desc': 'MIT License · 由 <a href="https://github.com/KinyooZ" target="_blank" rel="noopener">KinyooZ</a> 构建',
  },
};

function setLanguage(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  try {
    localStorage.setItem('ficm-lang', lang);
  } catch (e) {}
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const saved = (() => {
    try { return localStorage.getItem('ficm-lang'); } catch (e) { return null; }
  })();

  const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  const initialLang = saved || browserLang;
  setLanguage(initialLang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  initCursorGlow();
  initCopyButtons();
  initScrollReveal();
});

// Force scroll to top on load (covers refresh + back-forward cache cases)
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.scrollTo(0, 0);
});

// ============================================
// Scroll reveal: fade/slide sections into view
// using IntersectionObserver.
// ============================================
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selectors = [
    '.hero-frame',
    '.feature-frame',
    '.section-head',
    '.steps-frame',
    '.code-split > .code-block',
    '.install-box',
  ];

  const targets = document.querySelectorAll(selectors.join(','));
  if (!targets.length) return;

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings slightly (e.g. 2 code blocks, 3 steps within a group)
    if (el.matches('.code-split > .code-block')) {
      el.style.transitionDelay = (i % 2) * 120 + 'ms';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px',
  });

  targets.forEach((el) => observer.observe(el));
}

// ============================================
// Copy buttons: copy text from data-copy and
// flip icon to ✓ for ~1.5s as confirmation.
// ============================================
function initCopyButtons() {
  const buttons = document.querySelectorAll('.copy-btn');
  if (!buttons.length) return;

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    }
    // Fallback for non-secure contexts (e.g. file://)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      if (!text || btn.classList.contains('copied')) return;
      const ok = await copyText(text);
      if (!ok) return;
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    });
  });
}

// ============================================
// Cursor spotlight: blurred white glow that
// trails the cursor with eased lerp delay.
// ============================================
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  // Skip on touch / coarse pointer devices
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let visible = false;
  let rafId = null;

  // Lerp factor: lower = more lag, higher = snappier. 0.08 ≈ silky trail.
  const EASE = 0.08;

  function setTransform() {
    // translate3d positions top-left at cursor, then translate(-50%, -50%)
    // shifts the glow back by half its own size so it centers on the cursor.
    glow.style.transform =
      'translate3d(' +
      currentX +
      'px,' +
      currentY +
      'px, 0) translate(-50%, -50%)';
  }

  function tick() {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;
    setTransform();
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!visible) {
      // Snap to first known position so it doesn't fly in from origin
      currentX = targetX;
      currentY = targetY;
      setTransform();
      glow.classList.add('visible');
      visible = true;
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.classList.remove('visible');
  });

  document.addEventListener('mouseenter', () => {
    if (visible) glow.classList.add('visible');
  });
}
