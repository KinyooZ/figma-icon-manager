// ============================================
// Bilingual language toggle
// ============================================

const translations = {
  en: {
    'badge': 'Figma Plugin · Open Source · MIT',
    'hero.title.1': 'From Figma',
    'hero.title.2': 'to GitHub',
    'hero.title.3': 'in one click',
    'hero.sub': 'Scan your Figma icon library, validate naming, and publish production-ready React components to GitHub — all from a single Figma plugin.',
    'cta.github': 'View on GitHub',
    'cta.quickstart': 'Get Started',
    'mockup.status': '✓ 128 icons validated',
    'mockup.outlined': 'Outlined',
    'mockup.filled': 'Filled',
    'mockup.colored': 'Colored',
    'mockup.publish': 'Publish to GitHub',
    'features.title': 'Built for design-dev collaboration',
    'features.sub': 'Replace Lucide or complement it. Your icons, your library, your rules.',
    'feature.categorize.title': 'Three Categories',
    'feature.categorize.desc': 'Outlined, Filled, and Colored — each with its own color strategy. Outlined uses currentColor stroke, Filled uses currentColor fill, Colored preserves original palette.',
    'feature.validate.title': 'Smart Validation',
    'feature.validate.desc': 'Enforces PascalCase naming, detects duplicates, and reports errors in Chinese. Strips hardcoded SVG colors automatically so your color prop actually works.',
    'feature.publish.title': 'One-Click Publish',
    'feature.publish.desc': 'Uses GitHub Git Data API to push all components as a single atomic commit. No more dragging SVG files around. Designers hit publish, frontend pulls the update.',
    'howto.title': 'How it works',
    'step.1.title': 'Structure your Figma file',
    'step.1.desc': 'Create a page with "icon" in its name. Add top-level frames ending with <code>Outlined</code>, <code>Filled</code>, or <code>Colored</code>. Name components in PascalCase.',
    'step.2.title': 'Configure GitHub connection',
    'step.2.desc': 'Paste your Personal Access Token, target repo, branch, and base path. Stored locally in Figma clientStorage.',
    'step.3.title': 'Scan & Publish',
    'step.3.desc': 'The plugin validates structure, generates React TSX components with proper types, and pushes everything in a single commit.',
    'code.title': 'Use it like Lucide. Or replace Lucide.',
    'code.sub': 'Generated components follow the React forwardRef pattern with full TypeScript support.',
    'code.import': 'Your App',
    'code.generated': 'Generated',
    'install.title': 'Start using it now',
    'install.clone': 'Clone the repo',
    'install.build': 'Install and build',
    'install.import': 'In Figma: Plugins → Development → Import plugin from manifest...',
    'footer.desc': 'MIT License · Built by <a href="https://github.com/KinyooZ" target="_blank" rel="noopener">KinyooZ</a>',
  },
  zh: {
    'badge': 'Figma 插件 · 开源 · MIT',
    'hero.title.1': '从 Figma',
    'hero.title.2': '到 GitHub',
    'hero.title.3': '一键直达',
    'hero.sub': '扫描 Figma 图标库，校验命名规范，一键发布生产级 React 组件到 GitHub —— 全部在一个 Figma 插件内完成。',
    'cta.github': '查看 GitHub',
    'cta.quickstart': '快速开始',
    'mockup.status': '✓ 已校验 128 个图标',
    'mockup.outlined': 'Outlined（线性）',
    'mockup.filled': 'Filled（填充）',
    'mockup.colored': 'Colored（彩色）',
    'mockup.publish': '发布到 GitHub',
    'features.title': '为设计-研发协作而生',
    'features.sub': '替代或补充 Lucide。你的图标，你的规则，你的库。',
    'feature.categorize.title': '三大分类',
    'feature.categorize.desc': 'Outlined、Filled、Colored —— 每类都有独立的颜色策略。Outlined 使用 currentColor 描边，Filled 使用 currentColor 填充，Colored 保留原始配色。',
    'feature.validate.title': '智能校验',
    'feature.validate.desc': '强制大驼峰命名，检测重名，中文报错提示。自动剥离 SVG 中的硬编码颜色，让 color 属性真正生效。',
    'feature.publish.title': '一键发布',
    'feature.publish.desc': '通过 GitHub Git Data API 把所有组件作为一次原子 commit 推送。再也不用手动拖 SVG 文件。设计师按发布，前端拉取更新。',
    'howto.title': '工作原理',
    'step.1.title': '整理 Figma 文件结构',
    'step.1.desc': '创建一个名称包含 "icon" 的页面。顶层 Frame 以 <code>Outlined</code>、<code>Filled</code> 或 <code>Colored</code> 结尾。组件用大驼峰命名。',
    'step.2.title': '配置 GitHub 连接',
    'step.2.desc': '填入 Personal Access Token、目标仓库、分支和基础路径。通过 Figma clientStorage 本地保存。',
    'step.3.title': '扫描并发布',
    'step.3.desc': '插件会校验文件结构，生成带完整类型定义的 React TSX 组件，并一次性推送所有文件。',
    'code.title': '像 Lucide 一样使用，或者替代 Lucide。',
    'code.sub': '生成的组件遵循 React forwardRef 模式，完整 TypeScript 支持。',
    'code.import': '你的应用',
    'code.generated': '生成的文件',
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
});
