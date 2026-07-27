import {
  Accessibility,
  ArrowDown,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Gauge,
  Layers3,
  MapPinned,
  MessageCircleMore,
  MousePointer2,
  Palette,
  Route,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TestTube2,
  UsersRound,
  Workflow,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useManagedContent } from '../managedContent'

function SectionHeading({ eyebrow, title, description, dark = false }) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-xs font-black uppercase tracking-[0.2em] ${
          dark ? 'text-cyan-300' : 'text-paris-blue'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
          dark ? 'text-white' : 'text-paris-navy'
        }`}
      >
        {title}
      </h2>
      <p className={`mt-4 text-sm leading-7 sm:text-base ${dark ? 'text-white/60' : 'text-paris-ink/60'}`}>
        {description}
      </p>
    </div>
  )
}

function LayerCard({ icon: Icon, number, title, subtitle, accent, children }) {
  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-paris-navy/8 bg-white p-5 shadow-card sm:p-6">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paris-navy text-white">
            <Icon size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-paris-blue">{number}</p>
            <h3 className="mt-1 text-xl font-black text-paris-navy">{title}</h3>
          </div>
        </div>
        <p className="hidden max-w-52 text-right text-xs leading-5 text-paris-ink/45 sm:block">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function StatusBadge({ children, next = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
        next ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
      }`}
    >
      {next ? <Target size={11} aria-hidden="true" /> : <CheckCircle2 size={11} aria-hidden="true" />}
      {children}
    </span>
  )
}

export default function DesignPage() {
  const { tr } = useLanguage()
  const { restaurants, attractions } = useManagedContent()
  const categoryCount = new Set(restaurants.map((restaurant) => restaurant.specialty)).size

  const stats = [
    [restaurants.length, tr('餐厅数据', 'restaurants', 'restaurants')],
    [attractions.length, tr('研学地点', 'study places', "lieux d'étude")],
    [categoryCount, tr('餐饮分类', 'cuisine categories', 'catégories')],
    [3, tr('界面语言', 'interface languages', "langues d'interface")],
    [2, tr('核心模块', 'core modules', 'modules principaux')],
  ]

  const decisions = [
    {
      icon: Zap,
      title: tr('快速交付', 'Fast delivery', 'Livraison rapide'),
      choice: tr('模块化单体', 'Modular monolith', 'Monolithe modulaire'),
      detail: tr(
        '小团队共享一套代码与数据层，同时保持 Chatbot、Map、Admin 模块边界清楚。',
        'One codebase and shared data layer for a small team, with clear Chatbot, Map and Admin boundaries.',
        'Une base de code et une couche de données partagées, avec des modules clairement séparés.',
      ),
    },
    {
      icon: ShieldCheck,
      title: tr('可靠性', 'Reliability', 'Fiabilité'),
      choice: tr('多级回退', 'Layered fallback', 'Repli à plusieurs niveaux'),
      detail: tr(
        'AI 不可用时回到结构化推荐；Google Maps 不可用时切换 OpenStreetMap。',
        'Structured recommendations replace AI when needed; OpenStreetMap replaces Google Maps.',
        "Les recommandations structurées et OpenStreetMap prennent le relais en cas d'indisponibilité.",
      ),
    },
    {
      icon: Gauge,
      title: tr('性能与成本', 'Performance & cost', 'Performance et coût'),
      choice: tr('静态优先', 'Static-first delivery', 'Diffusion statique'),
      detail: tr(
        'GitHub Pages 快速提供界面，只将 AI 和管理操作交给服务端。',
        'GitHub Pages serves the interface quickly; only AI and administration require the server.',
        "GitHub Pages sert rapidement l'interface ; seuls l'IA et l'administration utilisent le serveur.",
      ),
    },
    {
      icon: Database,
      title: tr('可维护性', 'Maintainability', 'Maintenabilité'),
      choice: tr('共享数据主干', 'Shared data backbone', 'Données partagées'),
      detail: tr(
        '地图与导游读取相同的餐厅和景点数据，减少内容不一致。',
        'The map and guide read the same restaurant and place data, reducing inconsistency.',
        'La carte et le guide utilisent les mêmes données afin de limiter les incohérences.',
      ),
    },
  ]

  const users = [
    {
      number: '01',
      icon: Smartphone,
      title: tr('第一次到巴黎的学生', 'First-time Paris student', 'Étudiant découvrant Paris'),
      moment: tr('出发前与用餐前', 'Before the trip and before meals', 'Avant le voyage et les repas'),
      need: tr(
        '需要可信地点、清楚预算和简单路线。',
        'Needs trusted places, clear budgets and simple routes.',
        'Cherche des lieux fiables, des budgets clairs et des itinéraires simples.',
      ),
    },
    {
      number: '02',
      icon: UsersRound,
      title: tr('研学小组负责人', 'Study group leader', "Responsable du groupe d'étude"),
      moment: tr('规划与现场协调', 'Planning and live coordination', 'Planification et coordination'),
      need: tr(
        '需要快速比较选择并向团队解释决定。',
        'Needs to compare options quickly and explain decisions to the group.',
        'Doit comparer rapidement les options et expliquer les décisions au groupe.',
      ),
    },
    {
      number: '03',
      icon: Database,
      title: tr('内容管理员', 'Content administrator', 'Administrateur de contenu'),
      moment: tr('信息变化后', 'After information changes', 'Après une modification'),
      need: tr(
        '需要更新地点信息，而不必重新构建整个网站。',
        'Needs to update place information without rebuilding the whole site.',
        'Doit mettre à jour les lieux sans reconstruire tout le site.',
      ),
    },
  ]

  const journey = [
    [MessageCircleMore, tr('提问', 'Ask', 'Demander'), tr('描述预算、偏好或任务', 'Describe budget, preference or task', 'Décrire le budget ou le besoin')],
    [Bot, tr('获得建议', 'Recommend', 'Recommander'), tr('AI 与数据库共同回答', 'AI and database answer together', "L'IA et la base répondent")],
    [MousePointer2, tr('比较', 'Compare', 'Comparer'), tr('查看依据、价格和来源', 'Review evidence, price and sources', 'Vérifier prix et sources')],
    [MapPinned, tr('打开地图', 'Open map', 'Ouvrir la carte'), tr('定位推荐地点', 'Locate the recommended place', 'Localiser le lieu recommandé')],
    [Route, tr('开始步行', 'Walk', 'Marcher'), tr('持续定位并重新算路', 'Track and reroute continuously', 'Suivre et recalculer le trajet')],
  ]

  const designThinking = [
    ['01', tr('共情', 'Empathize', 'Comprendre'), tr('识别学生、组长和管理员的真实需求。', 'Identify real needs of students, leaders and administrators.', 'Identifier les besoins réels des utilisateurs.')],
    ['02', tr('定义', 'Define', 'Définir'), tr('把“信息很多”转化为“下一步不清楚”的核心问题。', 'Reframe abundant information as an unclear-next-step problem.', "Transformer l'abondance d'informations en problème d'action.")],
    ['03', tr('构思', 'Ideate', 'Imaginer'), tr('将问答推荐与可执行地图连接成一个闭环。', 'Connect conversational advice to an actionable map.', 'Relier les conseils conversationnels à une carte exploitable.')],
    ['04', tr('原型', 'Prototype', 'Prototyper'), tr('使用真实巴黎数据构建可点击、可导航的产品。', 'Build a clickable product with real Paris data.', 'Construire un produit cliquable avec des données réelles.')],
    ['05', tr('测试', 'Test', 'Tester'), tr('记录任务完成率、理解障碍和错误恢复表现。', 'Measure task completion, comprehension and error recovery.', 'Mesurer la réussite, la compréhension et la récupération.')],
  ]

  const deliveryFlow = [
    [Workflow, tr('线框图', 'Wireframe', 'Wireframe'), tr('先确定信息结构与关键任务。', 'Define information structure and key tasks first.', "Définir d'abord la structure et les tâches.")],
    [Palette, tr('视觉稿', 'Mockup', 'Maquette'), tr('建立颜色、字体、间距与层级。', 'Establish color, type, spacing and hierarchy.', 'Établir couleurs, typographie et hiérarchie.')],
    [MousePointer2, tr('可用原型', 'Working prototype', 'Prototype fonctionnel'), tr('使用真实功能验证完整流程。', 'Validate the full flow with working features.', 'Valider le parcours avec les fonctions réelles.')],
    [Code2, tr('开发交付', 'Development handoff', 'Livraison technique'), tr('组件、数据和服务均有清晰边界。', 'Components, data and services have clear boundaries.', 'Les composants, données et services sont bien séparés.')],
  ]

  const validationItems = [
    [false, tr('三语界面与语言记忆', 'Trilingual interface and saved preference', 'Interface trilingue et préférence mémorisée')],
    [false, tr('Google Maps → OpenStreetMap 自动回退', 'Google Maps → OpenStreetMap automatic fallback', 'Repli automatique vers OpenStreetMap')],
    [false, tr('AI → 本地结构化推荐回退', 'AI → structured local recommendation fallback', "Repli de l'IA vers les recommandations structurées")],
    [false, tr('键盘焦点、语义标签与减少动画', 'Keyboard focus, semantic labels and reduced motion', 'Focus clavier, libellés sémantiques et mouvements réduits')],
    [true, tr('完成 5–10 名真实用户任务测试', 'Run task tests with 5–10 real users', 'Tester les tâches avec 5 à 10 utilisateurs')],
    [true, tr('记录任务完成率与主要摩擦点', 'Record task completion and key friction points', 'Mesurer la réussite et les principaux obstacles')],
  ]

  return (
    <div className="bg-paris-cream">
      <section className="relative overflow-hidden bg-paris-navy text-white">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-paris-blue/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-bold text-cyan-200">
              <Sparkles size={14} aria-hidden="true" />
              {tr('从系统结构到用户体验', 'From system structure to user experience', "De l'architecture à l'expérience")}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              {tr('不只展示产品，', 'More than a product.', "Plus qu'un produit.")}
              <span className="mt-2 block text-cyan-300">
                {tr('展示每一个设计决定。', 'Every decision made visible.', 'Chaque décision devient visible.')}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              {tr(
                'Paris Study Guide 将 Chatbot 与 Navigation Map 连接到同一数据主干，把分散的研学信息转化为可以立即执行的下一步。',
                'Paris Study Guide connects a Chatbot and Navigation Map to one data backbone, turning fragmented study-tour information into a clear next action.',
                "Paris Study Guide relie le Chatbot et la carte à une même base de données pour transformer l'information en action.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-paris-navy transition hover:-translate-y-0.5 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-paris-navy"
              >
                <Layers3 size={18} aria-hidden="true" />
                {tr('查看系统架构', 'Explore the architecture', "Voir l'architecture")}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Bot size={18} aria-hidden="true" />
                {tr('体验智能导游', 'Try the smart guide', 'Essayer le guide')}
              </Link>
            </div>
          </div>

          <div className="self-end rounded-[2rem] border border-white/12 bg-white/[0.06] p-5 shadow-2xl backdrop-blur sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
              {tr('项目证据', 'Project evidence', 'Preuves du projet')}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {stats.map(([value, label], index) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-white/10 p-4 ${
                    index === stats.length - 1 ? 'col-span-2 bg-cyan-300 text-paris-navy' : 'bg-white/[0.05]'
                  }`}
                >
                  <p className="text-3xl font-black">{value}</p>
                  <p className={`mt-1 text-xs ${index === stats.length - 1 ? 'text-paris-navy/65' : 'text-white/50'}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label={tr('项目设计页面导航', 'Project design navigation', 'Navigation du projet')}
        className="sticky top-[65px] z-30 border-b border-paris-navy/8 bg-paris-cream/90 backdrop-blur"
      >
        <div className="thin-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {[
            ['#architecture', tr('架构', 'Architecture', 'Architecture')],
            ['#users', tr('用户', 'Users', 'Utilisateurs')],
            ['#journey', tr('用户旅程', 'Journey', 'Parcours')],
            ['#process', tr('设计流程', 'Process', 'Processus')],
            ['#ui-system', tr('UI 规范', 'UI system', 'Système UI')],
            ['#validation', tr('测试', 'Validation', 'Validation')],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 rounded-full px-3 py-2 text-xs font-bold text-paris-ink/55 transition hover:bg-white hover:text-paris-blue focus:outline-none focus:ring-2 focus:ring-paris-blue"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="architecture" className="scroll-mt-28 px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={tr('01 · 项目架构', '01 · Product architecture', '01 · Architecture produit')}
            title={tr('三个层级，一个共享的数据主干', 'Three layers. One shared data backbone.', 'Trois couches. Une base de données partagée.')}
            description={tr(
              '界面、业务逻辑和数据各自负责一件事。这样可以改变页面而不破坏数据，也可以更新数据而不重写全部功能。',
              'Interface, product logic and data each have one responsibility. The UI can change without breaking the data, and the data can evolve without rewriting the whole product.',
              "L'interface, la logique et les données ont chacune une responsabilité claire afin de pouvoir évoluer indépendamment.",
            )}
          />

          <div className="mt-10 space-y-3">
            <LayerCard
              icon={Smartphone}
              number="LAYER 01"
              title={tr('表现层 / UI', 'Presentation / UI', 'Présentation / UI')}
              subtitle={tr('用户看到与操作的部分', 'What users see and touch', "Ce que l'utilisateur voit")}
              accent="bg-paris-blue"
            >
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  [Sparkles, tr('首页', 'Home', 'Accueil')],
                  [Bot, 'AI Chatbot'],
                  [MapPinned, tr('导航地图', 'Navigation map', 'Carte')],
                  [Database, tr('管理后台', 'Admin console', 'Administration')],
                ].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-paris-cream px-3 py-2.5 text-xs font-bold text-paris-navy">
                    <Icon size={15} className="text-paris-blue" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </LayerCard>

            <div className="flex justify-center text-paris-blue" aria-hidden="true">
              <ArrowDown size={24} />
            </div>

            <LayerCard
              icon={Server}
              number="LAYER 02"
              title={tr('逻辑层 / 服务', 'Logic / services', 'Logique / services')}
              subtitle={tr('规则、计算与安全边界', 'Rules, calculations and safety', 'Règles, calculs et sécurité')}
              accent="bg-paris-red"
            >
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  tr('意图与检索', 'Intent & retrieval', 'Intention et recherche'),
                  tr('预算与分类筛选', 'Budget & category filters', 'Filtres budget et catégorie'),
                  tr('路线与持续定位', 'Routing & live location', 'Itinéraire et position'),
                  tr('回退与安全规则', 'Fallback & safety rules', 'Repli et sécurité'),
                ].map((label) => (
                  <div key={label} className="rounded-xl bg-paris-cream px-3 py-2.5 text-center text-xs font-bold text-paris-navy">
                    {label}
                  </div>
                ))}
              </div>
            </LayerCard>

            <div className="flex justify-center text-paris-blue" aria-hidden="true">
              <ArrowDown size={24} />
            </div>

            <LayerCard
              icon={Database}
              number="LAYER 03"
              title={tr('数据层 / 外部服务', 'Data / external services', 'Données / services externes')}
              subtitle={tr('数据的存储、来源与更新', 'Storage, provenance and updates', 'Stockage, sources et mises à jour')}
              accent="bg-emerald-400"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-paris-navy/8 bg-paris-cream/60 p-4">
                  <p className="text-xs font-black text-paris-navy">{tr('共享内容数据', 'Shared content data', 'Données partagées')}</p>
                  <p className="mt-2 text-xs leading-5 text-paris-ink/55">
                    {tr(
                      '本地基础数据 + Cloudflare D1 在线更新；Chatbot 与 Map 始终读取同一版本。',
                      'Local baseline data + Cloudflare D1 updates; Chatbot and Map always read the same version.',
                      'Données locales + mises à jour Cloudflare D1 ; le Chatbot et la carte lisent la même version.',
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-paris-navy/8 bg-paris-cream/60 p-4">
                  <p className="text-xs font-black text-paris-navy">{tr('实时与外部服务', 'Live and external services', 'Services externes')}</p>
                  <p className="mt-2 text-xs leading-5 text-paris-ink/55">
                    Open-Meteo · OpenStreetMap · Google Maps · Cloudflare Workers AI
                  </p>
                </div>
              </div>
            </LayerCard>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {decisions.map(({ icon: Icon, title, choice, detail }) => (
              <article key={title} className="rounded-[1.5rem] border border-paris-navy/8 bg-white p-5">
                <Icon size={20} className="text-paris-red" aria-hidden="true" />
                <p className="mt-4 text-xs font-bold text-paris-ink/45">{title}</p>
                <h3 className="mt-1 text-lg font-black text-paris-navy">{choice}</h3>
                <p className="mt-3 text-xs leading-5 text-paris-ink/55">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="users" className="scroll-mt-28 bg-white px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={tr('02 · 以人为本', '02 · Designed for people', "02 · Centré sur l'humain")}
            title={tr('三类用户，三种需要帮助的时刻', 'Three users. Three moments of need.', 'Trois utilisateurs. Trois moments clés.')}
            description={tr(
              '产品决定来自真实任务，而不是团队自己的使用习惯。每类用户都有不同的目标、时间压力和信息需求。',
              'Product decisions start from real tasks, not the team’s own habits. Each audience has a different goal, time pressure and information need.',
              "Les décisions partent de tâches réelles. Chaque public a des objectifs et des contraintes différents.",
            )}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {users.map(({ number, icon: Icon, title, moment, need }) => (
              <article key={number} className="group rounded-[1.75rem] border border-paris-navy/8 bg-paris-cream/50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-card">
                <div className="flex items-start justify-between">
                  <span className="text-4xl font-black text-paris-blue/20">{number}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paris-navy text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-black text-paris-navy">{title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-paris-blue/8 px-2.5 py-1 text-[10px] font-bold text-paris-blue">{moment}</p>
                <p className="mt-4 text-sm leading-6 text-paris-ink/60">{need}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="scroll-mt-28 bg-paris-navy px-5 py-16 text-white sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            dark
            eyebrow={tr('03 · 用户旅程', '03 · End-to-end journey', '03 · Parcours utilisateur')}
            title={tr('一个问题，最终变成一条可走的路线', 'One question becomes a walkable route.', 'Une question devient un itinéraire.')}
            description={tr(
              'Chatbot 负责理解和比较，Navigation Map 负责定位与行动；共享数据层让两段体验保持一致。',
              'The Chatbot understands and compares; the Navigation Map locates and moves. Shared data keeps both experiences consistent.',
              'Le Chatbot comprend et compare ; la carte localise et guide. Les données partagées assurent la cohérence.',
            )}
          />
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {journey.map(([Icon, title, detail], index) => (
              <div key={title} className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                {index < journey.length - 1 && (
                  <ArrowRight
                    size={20}
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-cyan-300 md:block"
                    aria-hidden="true"
                  />
                )}
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-paris-navy">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p className="mt-5 text-[10px] font-black text-cyan-300">0{index + 1}</p>
                <h3 className="mt-1 text-base font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/50">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-28 px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={tr('04 · 设计思维', '04 · Design thinking', '04 · Design thinking')}
            title={tr('先解决结构与流程，再进行视觉美化', 'Structure and flow before visual polish.', 'La structure et le parcours avant le style.')}
            description={tr(
              '我们使用“共情—定义—构思—原型—测试”循环，并明确区分已经实现的证据与下一步验证计划。',
              'We use the Empathize–Define–Ideate–Prototype–Test cycle, separating implemented evidence from the next validation step.',
              'Nous suivons le cycle Comprendre–Définir–Imaginer–Prototyper–Tester en distinguant les acquis des prochaines validations.',
            )}
          />

          <div className="mt-10 grid gap-3 lg:grid-cols-5">
            {designThinking.map(([number, title, detail], index) => (
              <article key={number} className="rounded-2xl border border-paris-navy/8 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-paris-blue">{number}</span>
                  <StatusBadge next={index === designThinking.length - 1}>
                    {index === designThinking.length - 1
                      ? tr('下一步', 'Next', 'À suivre')
                      : tr('已完成', 'Built', 'Réalisé')}
                  </StatusBadge>
                </div>
                <h3 className="mt-5 text-lg font-black text-paris-navy">{title}</h3>
                <p className="mt-3 text-xs leading-5 text-paris-ink/55">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] bg-white p-5 shadow-card sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-paris-red">
              {tr('从想法到开发', 'From idea to delivery', "De l'idée au développement")}
            </p>
            <div className="mt-6 grid gap-3 lg:grid-cols-4">
              {deliveryFlow.map(([Icon, title, detail], index) => (
                <article key={title} className="relative rounded-2xl bg-paris-cream p-5">
                  {index < deliveryFlow.length - 1 && (
                    <ArrowRight
                      size={18}
                      className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-paris-red lg:block"
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={21} className="text-paris-blue" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-black text-paris-navy">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-paris-ink/55">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ui-system" className="scroll-mt-28 bg-white px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={tr('05 · UI 系统', '05 · UI system', '05 · Système UI')}
            title={tr('视觉层级服务于行动，而不是装饰', 'Visual hierarchy serves action, not decoration.', "La hiérarchie visuelle guide l'action.")}
            description={tr(
              '一个主色、明确的状态色、充足留白和一致组件，让用户在地图与对话之间移动时不需要重新学习界面。',
              'One primary color, explicit state colors, generous space and consistent components reduce relearning between chat and map.',
              "Une couleur principale, des états explicites et des composants cohérents facilitent le passage entre le chat et la carte.",
            )}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[1.75rem] bg-paris-navy p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                {tr('颜色与状态', 'Color and state', 'Couleurs et états')}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ['#0C1D39', tr('结构 / 导航', 'Structure / navigation', 'Structure / navigation'), 'bg-paris-navy border-white/15'],
                  ['#1B52AB', tr('主要操作', 'Primary action', 'Action principale'), 'bg-paris-blue'],
                  ['#E6404F', tr('提醒 / 重点', 'Alert / emphasis', 'Alerte / accent')],
                  ['#F6F5F0', tr('内容背景', 'Content surface', 'Fond de contenu')],
                ].map(([hex, label, className], index) => (
                  <div
                    key={hex}
                    className={`rounded-2xl border p-4 ${
                      index === 2
                        ? 'border-paris-red bg-paris-red'
                        : index === 3
                          ? 'border-white/15 bg-paris-cream text-paris-navy'
                          : `border-white/10 ${className}`
                    }`}
                  >
                    <p className="text-lg font-black">{hex}</p>
                    <p className={`mt-1 text-[10px] ${index === 3 ? 'text-paris-ink/50' : 'text-white/50'}`}>{label}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [Palette, tr('清楚的层级', 'Clear hierarchy', 'Hiérarchie claire'), tr('标题、说明、数据与行动使用不同权重。', 'Headlines, evidence and actions use distinct weights.', 'Titres, données et actions ont des poids distincts.')],
                [Accessibility, tr('无障碍优先', 'Accessibility first', "Priorité à l'accessibilité"), tr('语义标签、键盘焦点、对比度和减少动画。', 'Semantic labels, keyboard focus, contrast and reduced motion.', 'Libellés, focus clavier, contraste et mouvement réduit.')],
                [Smartphone, tr('响应式布局', 'Responsive layout', 'Mise en page adaptative'), tr('地图、对话和卡片适配手机与桌面任务。', 'Map, chat and cards adapt to mobile and desktop tasks.', "La carte et le chat s'adaptent au mobile et au bureau.")],
                [MousePointer2, tr('及时反馈', 'Visible feedback', 'Retour visible'), tr('加载、禁用、成功和错误状态都能被看见。', 'Loading, disabled, success and error states are visible.', "Les états de chargement, succès et erreur sont visibles.")],
              ].map(([Icon, title, detail]) => (
                <article key={title} className="rounded-2xl border border-paris-navy/8 bg-paris-cream/45 p-5">
                  <Icon size={20} className="text-paris-blue" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-black text-paris-navy">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-paris-ink/55">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="validation" className="scroll-mt-28 px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow={tr('06 · 测试与下一步', '06 · Validation and next step', '06 · Validation et suite')}
            title={tr('可用性必须被验证，而不是被假设', 'Usability is measured, not assumed.', "L'utilisabilité se mesure.")}
            description={tr(
              '技术回退与界面状态已经实现；下一步通过真实用户任务测试，验证用户是否能独立完成“提问—比较—导航”。',
              'Technical fallbacks and interface states are implemented. Next, real-user task tests will validate the complete Ask–Compare–Navigate journey.',
              "Les replis techniques sont en place. La prochaine étape est de tester le parcours complet avec de vrais utilisateurs.",
            )}
          />

          <div className="rounded-[1.75rem] border border-paris-navy/8 bg-white p-5 shadow-card sm:p-6">
            <div className="space-y-3">
              {validationItems.map(([next, label]) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-2xl bg-paris-cream/60 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    {next ? (
                      <TestTube2 size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    )}
                    <p className="text-sm font-bold leading-6 text-paris-navy">{label}</p>
                  </div>
                  <StatusBadge next={next}>
                    {next ? tr('下一步', 'Next', 'À suivre') : tr('已实现', 'Built', 'Réalisé')}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paris-navy px-5 py-14 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              {tr('从信息到行动', 'From information to action', "De l'information à l'action")}
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              {tr('现在，用真实任务体验完整闭环。', 'Now experience the full loop with a real task.', 'Testez maintenant le parcours complet.')}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-paris-navy transition hover:bg-cyan-200"
            >
              <Bot size={17} aria-hidden="true" />
              {tr('向导游提问', 'Ask the guide', 'Interroger le guide')}
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <MapPinned size={17} aria-hidden="true" />
              {tr('打开导航地图', 'Open the map', 'Ouvrir la carte')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
