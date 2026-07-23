import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Save,
  Utensils,
} from 'lucide-react'
import { attractions as baseAttractions } from '../data/guideKnowledge'
import { restaurants as baseRestaurants, specialties } from '../data/restaurants'
import { useLanguage } from '../i18n'
import {
  adminLogin,
  adminLogout,
  fetchAdminContent,
  getAdminSession,
  hasManagedContentApi,
  mergeManagedContent,
  saveAdminContent,
  setAdminSession,
} from '../services/managedContent'

const emptyLocalized = { zh: '', en: '', fr: '' }

function editableContent(payload) {
  const merged = mergeManagedContent(payload)
  return {
    ...merged,
    restaurants: merged.restaurants.map((restaurant) => ({
      ...restaurant,
      openingHours: {
        summary: { ...emptyLocalized, ...(restaurant.openingHours?.summary || {}) },
        note: { ...emptyLocalized, ...(restaurant.openingHours?.note || {}) },
        certainty: restaurant.openingHours?.certainty || 'variable',
        checkedOn: restaurant.openingHours?.checkedOn || '',
      },
    })),
    attractions: merged.attractions.map((attraction) => ({
      ...attraction,
      visitingHours: {
        summary: { ...emptyLocalized, ...(attraction.visitingHours?.summary || {}) },
        note: { ...emptyLocalized, ...(attraction.visitingHours?.note || {}) },
        certainty: attraction.visitingHours?.certainty || 'variable',
        checkedOn: attraction.visitingHours?.checkedOn || '',
      },
    })),
  }
}

function toSavePayload(content) {
  return {
    restaurantOverrides: Object.fromEntries(
      content.restaurants.map((restaurant) => [
        restaurant.id,
        {
          name: restaurant.name,
          specialty: restaurant.specialty,
          blurb: restaurant.blurb,
          budgetEur: restaurant.budgetEur,
          openingHours: restaurant.openingHours,
        },
      ]),
    ),
    attractionOverrides: Object.fromEntries(
      content.attractions.map((attraction) => [
        attraction.id,
        {
          name: attraction.name,
          englishName: attraction.englishName,
          address: attraction.address,
          visitingHours: attraction.visitingHours,
        },
      ]),
    ),
  }
}

function LocalizedFields({ legend, value, onChange, multiline = false }) {
  const labels = { zh: '中文', en: 'English', fr: 'Français' }
  const inputClass =
    'mt-1.5 w-full rounded-xl border border-paris-navy/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-paris-blue focus:ring-2 focus:ring-paris-blue/10'

  return (
    <fieldset>
      <legend className="text-xs font-black uppercase tracking-[0.12em] text-paris-navy/55">
        {legend}
      </legend>
      <div className="mt-2 grid gap-3 xl:grid-cols-3">
        {Object.entries(labels).map(([language, label]) => (
          <label key={language} className="text-xs font-bold text-paris-navy">
            {label}
            {multiline ? (
              <textarea
                value={value[language] || ''}
                onChange={(event) => onChange(language, event.target.value)}
                rows="3"
                className={`${inputClass} resize-y font-normal`}
              />
            ) : (
              <input
                value={value[language] || ''}
                onChange={(event) => onChange(language, event.target.value)}
                className={`${inputClass} font-normal`}
              />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function HoursEditor({ value, onChange, tr }) {
  function update(field, nextValue) {
    onChange({ ...value, [field]: nextValue })
  }

  return (
    <section className="rounded-2xl border border-paris-navy/8 bg-paris-cream/45 p-4">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 size={17} className="text-paris-blue" aria-hidden="true" />
        <h3 className="font-black text-paris-navy">
          {tr('关门时间与可信度', 'Closing hours and certainty', 'Fermeture et fiabilité')}
        </h3>
      </div>
      <div className="space-y-5">
        <LocalizedFields
          legend={tr('关门时间摘要', 'Closing-time summary', 'Résumé des horaires')}
          value={value.summary}
          onChange={(language, text) => update('summary', { ...value.summary, [language]: text })}
        />
        <LocalizedFields
          legend={tr('补充说明', 'Notes and uncertainty', 'Notes et incertitude')}
          value={value.note}
          multiline
          onChange={(language, text) => update('note', { ...value.note, [language]: text })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-paris-navy">
            {tr('信息可信度', 'Information certainty', 'Fiabilité')}
            <select
              value={value.certainty}
              onChange={(event) => update('certainty', event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-paris-navy/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
            >
              <option value="confirmed">
                {tr('官方常规时间已确认', 'Official regular hours confirmed', 'Horaires officiels confirmés')}
              </option>
              <option value="variable">
                {tr('时间可能变化或不完全确定', 'May vary or not fully certain', 'Variable ou non entièrement certain')}
              </option>
            </select>
          </label>
          <label className="text-xs font-bold text-paris-navy">
            {tr('最后核对日期', 'Last checked date', 'Dernière vérification')}
            <input
              type="date"
              value={value.checkedOn}
              onChange={(event) => update('checkedOn', event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-paris-navy/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
            />
          </label>
        </div>
      </div>
    </section>
  )
}

function LoginPanel({ onAuthenticated }) {
  const { tr } = useLanguage()
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!password || status === 'loading') return
    setStatus('loading')
    setError('')
    try {
      await adminLogin(password)
      setPassword('')
      await onAuthenticated()
    } catch (requestError) {
      if (requestError.status === 429) {
        setError(
          tr(
            '错误次数过多，请 15 分钟后再试。',
            'Too many incorrect attempts. Try again in 15 minutes.',
            'Trop de tentatives. Réessayez dans 15 minutes.',
          ),
        )
      } else {
        setError(
          tr(
            '管理员密码不正确，或管理服务暂时不可用。',
            'The administrator password is incorrect or the service is unavailable.',
            'Le mot de passe est incorrect ou le service est indisponible.',
          ),
        )
      }
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <div className="w-full rounded-[2rem] border border-paris-navy/8 bg-white p-6 shadow-card sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-paris-navy text-white">
          <LockKeyhole size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-paris-navy">
          {tr('管理员登录', 'Administrator login', 'Connexion administrateur')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-paris-ink/55">
          {tr(
            '登录后可修改餐厅预算、营业说明、景点地址和关门时间。',
            'Sign in to edit restaurant budgets, opening notes, attraction addresses and closing hours.',
            'Connectez-vous pour modifier budgets, horaires, adresses et fermetures.',
          )}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold text-paris-navy" htmlFor="admin-password">
            {tr('管理员密码', 'Administrator password', 'Mot de passe administrateur')}
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-2xl border border-paris-navy/10 bg-paris-cream/45 px-4 py-3 text-sm outline-none transition focus:border-paris-blue focus:ring-2 focus:ring-paris-blue/10"
            />
          </label>
          {error && (
            <p role="alert" className="flex gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!password || status === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-paris-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-[#16468f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {tr('进入管理后台', 'Open dashboard', 'Ouvrir le tableau de bord')}
          </button>
        </form>
        <p className="mt-4 text-center text-[10px] leading-4 text-paris-ink/35">
          {tr(
            '连续输入错误将暂时锁定登录；登录会话有效期为 12 小时。',
            'Repeated failures temporarily lock login; sessions expire after 12 hours.',
            'Les échecs répétés bloquent temporairement la connexion ; session de 12 h.',
          )}
        </p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { tr } = useLanguage()
  const [phase, setPhase] = useState(getAdminSession() ? 'checking' : 'login')
  const [content, setContent] = useState(() =>
    editableContent({ restaurantOverrides: {}, attractionOverrides: {} }),
  )
  const [activeKind, setActiveKind] = useState('restaurant')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(baseRestaurants[0].id)
  const [selectedAttractionId, setSelectedAttractionId] = useState(baseAttractions[0].id)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [notice, setNotice] = useState('')
  const [dirty, setDirty] = useState(false)

  const selectedRestaurant = useMemo(
    () => content.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId),
    [content.restaurants, selectedRestaurantId],
  )
  const selectedAttraction = useMemo(
    () => content.attractions.find((attraction) => attraction.id === selectedAttractionId),
    [content.attractions, selectedAttractionId],
  )

  async function loadDashboard() {
    setPhase('checking')
    setNotice('')
    try {
      const payload = await fetchAdminContent()
      setContent(editableContent(payload))
      setDirty(false)
      setPhase('ready')
    } catch (error) {
      if (error.status === 401) {
        setAdminSession('')
        setPhase('login')
      } else {
        setNotice(
          tr(
            '暂时无法读取在线数据，请稍后重试。',
            'Online data could not be loaded. Please try again.',
            'Impossible de charger les données. Réessayez.',
          ),
        )
        setPhase(getAdminSession() ? 'error' : 'login')
      }
    }
  }

  useEffect(() => {
    if (getAdminSession()) loadDashboard()
  }, [])

  function updateRestaurant(field, value) {
    setContent((current) => ({
      ...current,
      restaurants: current.restaurants.map((restaurant) =>
        restaurant.id === selectedRestaurantId ? { ...restaurant, [field]: value } : restaurant,
      ),
    }))
    setDirty(true)
    setNotice('')
  }

  function updateAttraction(field, value) {
    setContent((current) => ({
      ...current,
      attractions: current.attractions.map((attraction) =>
        attraction.id === selectedAttractionId ? { ...attraction, [field]: value } : attraction,
      ),
    }))
    setDirty(true)
    setNotice('')
  }

  async function handleSave() {
    if (saveStatus === 'saving') return
    setSaveStatus('saving')
    setNotice('')
    try {
      const payload = await saveAdminContent(toSavePayload(content))
      setContent(editableContent(payload))
      setDirty(false)
      setSaveStatus('saved')
      setNotice(
        tr(
          '已保存，地图和智能导游现在会使用最新数据。',
          'Saved. The map and smart guide now use the latest data.',
          'Enregistré. La carte et le guide utilisent désormais ces données.',
        ),
      )
    } catch (error) {
      if (error.status === 401) {
        setAdminSession('')
        setPhase('login')
      } else {
        setSaveStatus('error')
        setNotice(
          tr(
            '保存失败，请检查填写内容后重试。',
            'Save failed. Check the fields and try again.',
            'Échec de l’enregistrement. Vérifiez les champs.',
          ),
        )
      }
    }
  }

  async function handleLogout() {
    await adminLogout()
    setPhase('login')
  }

  if (!hasManagedContentApi()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-800">
          {tr(
            '管理 API 尚未配置，无法打开后台。',
            'The administration API is not configured.',
            'L’API d’administration n’est pas configurée.',
          )}
        </div>
      </div>
    )
  }

  if (phase === 'login') return <LoginPanel onAuthenticated={loadDashboard} />

  if (phase === 'checking') {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 text-sm text-paris-ink/55">
        <LoaderCircle size={18} className="animate-spin text-paris-blue" aria-hidden="true" />
        {tr('正在读取管理数据…', 'Loading managed data…', 'Chargement des données…')}
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-paris-navy/8 bg-white p-6 text-center shadow-card">
          <AlertCircle size={28} className="mx-auto text-red-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-paris-ink/65">{notice}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-paris-blue px-4 py-2.5 text-sm font-bold text-white"
          >
            <RefreshCw size={15} aria-hidden="true" />
            {tr('重试', 'Try again', 'Réessayer')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 bg-[#eef1f5]">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col lg:my-5 lg:overflow-hidden lg:rounded-[1.75rem] lg:border lg:border-paris-navy/8 lg:bg-white lg:shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paris-navy/8 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-paris-blue">
              {tr('内容管理系统', 'Content management', 'Gestion de contenu')}
            </p>
            <h1 className="mt-1 text-xl font-black text-paris-navy">
              {tr('导游地图管理后台', 'Guide map dashboard', 'Administration de la carte')}
            </h1>
            <p className="mt-1 text-xs text-paris-ink/45">
              {content.updatedAt
                ? tr(
                    `最后保存：${new Date(content.updatedAt).toLocaleString('zh-CN')}`,
                    `Last saved: ${new Date(content.updatedAt).toLocaleString('en-GB')}`,
                    `Dernier enregistrement : ${new Date(content.updatedAt).toLocaleString('fr-FR')}`,
                  )
                : tr('尚未保存在线修改', 'No online edits saved yet', 'Aucune modification enregistrée')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={dirty}
              title={
                dirty
                  ? tr('请先保存或刷新页面放弃修改', 'Save first or reload to discard edits', 'Enregistrez d’abord')
                  : ''
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-paris-navy/10 text-paris-navy transition hover:bg-paris-navy/[0.04] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={tr('重新读取数据', 'Reload data', 'Recharger')}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-paris-navy/10 px-3 py-2.5 text-xs font-bold text-paris-navy transition hover:bg-paris-navy/[0.04]"
            >
              <LogOut size={15} aria-hidden="true" />
              {tr('退出', 'Log out', 'Déconnexion')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saveStatus === 'saving'}
              className="inline-flex items-center gap-2 rounded-xl bg-paris-blue px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#16468f] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saveStatus === 'saving' ? (
                <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={15} aria-hidden="true" />
              )}
              {tr('保存全部修改', 'Save all changes', 'Tout enregistrer')}
            </button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className={`mx-4 mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs sm:mx-6 ${
              saveStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {saveStatus === 'error' ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            )}
            {notice}
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-paris-navy/8 bg-paris-cream/45 p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveKind('restaurant')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${
                  activeKind === 'restaurant'
                    ? 'bg-paris-navy text-white'
                    : 'border border-paris-navy/10 bg-white text-paris-navy'
                }`}
              >
                <Utensils size={15} aria-hidden="true" />
                {tr('餐厅', 'Restaurants', 'Restaurants')} ({content.restaurants.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveKind('attraction')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${
                  activeKind === 'attraction'
                    ? 'bg-paris-navy text-white'
                    : 'border border-paris-navy/10 bg-white text-paris-navy'
                }`}
              >
                <Building2 size={15} aria-hidden="true" />
                {tr('景点', 'Places', 'Lieux')} ({content.attractions.length})
              </button>
            </div>
            <div className="thin-scrollbar mt-4 max-h-44 space-y-1.5 overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
              {activeKind === 'restaurant'
                ? content.restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      type="button"
                      onClick={() => setSelectedRestaurantId(restaurant.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                        selectedRestaurantId === restaurant.id
                          ? 'bg-paris-blue text-white'
                          : 'bg-white text-paris-navy hover:bg-paris-blue/[0.06]'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-center font-black">{restaurant.id}</span>
                      <span className="truncate font-bold">{restaurant.name}</span>
                    </button>
                  ))
                : content.attractions.map((attraction, index) => (
                    <button
                      key={attraction.id}
                      type="button"
                      onClick={() => setSelectedAttractionId(attraction.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                        selectedAttractionId === attraction.id
                          ? 'bg-paris-blue text-white'
                          : 'bg-white text-paris-navy hover:bg-paris-blue/[0.06]'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-center font-black">{index + 1}</span>
                      <span className="truncate font-bold">{attraction.name}</span>
                    </button>
                  ))}
            </div>
            <div className="mt-4 rounded-xl border border-paris-blue/10 bg-paris-blue/[0.05] p-3 text-[10px] leading-4 text-paris-ink/50">
              <Database size={14} className="mb-1.5 text-paris-blue" aria-hidden="true" />
              {tr(
                '保存后写入在线 D1 数据库，公开地图和智能导游会自动读取。',
                'Changes are stored in D1 and automatically loaded by the public map and smart guide.',
                'Les modifications sont stockées dans D1 et chargées par la carte et le guide.',
              )}
            </div>
          </aside>

          <main className="thin-scrollbar min-h-0 overflow-y-auto bg-white p-4 sm:p-6">
            {activeKind === 'restaurant' && selectedRestaurant && (
              <div className="mx-auto max-w-4xl space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-paris-red">
                    {tr('编辑餐厅', 'Edit restaurant', 'Modifier le restaurant')} #{selectedRestaurant.id}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-paris-navy">{selectedRestaurant.name}</h2>
                </div>
                <section className="grid gap-4 rounded-2xl border border-paris-navy/8 p-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-paris-navy sm:col-span-2">
                    {tr('餐厅名称', 'Restaurant name', 'Nom du restaurant')}
                    <input
                      required
                      value={selectedRestaurant.name}
                      onChange={(event) => updateRestaurant('name', event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    />
                  </label>
                  <label className="text-xs font-bold text-paris-navy">
                    {tr('餐厅分类', 'Restaurant category', 'Catégorie')}
                    <select
                      value={selectedRestaurant.specialty}
                      onChange={(event) => updateRestaurant('specialty', event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-paris-navy/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    >
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-paris-navy">
                      {tr('最低预算 €/人', 'Minimum €/person', 'Minimum €/personne')}
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={selectedRestaurant.budgetEur.min}
                        onChange={(event) =>
                          updateRestaurant('budgetEur', {
                            ...selectedRestaurant.budgetEur,
                            min: Number(event.target.value),
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                      />
                    </label>
                    <label className="text-xs font-bold text-paris-navy">
                      {tr('最高预算 €/人', 'Maximum €/person', 'Maximum €/personne')}
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={selectedRestaurant.budgetEur.max}
                        onChange={(event) =>
                          updateRestaurant('budgetEur', {
                            ...selectedRestaurant.budgetEur,
                            max: Number(event.target.value),
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                      />
                    </label>
                  </div>
                  <label className="text-xs font-bold text-paris-navy sm:col-span-2">
                    {tr('餐厅简介（英文）', 'Restaurant description', 'Description du restaurant')}
                    <textarea
                      value={selectedRestaurant.blurb}
                      onChange={(event) => updateRestaurant('blurb', event.target.value)}
                      rows="3"
                      className="mt-1.5 w-full resize-y rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    />
                  </label>
                </section>
                <HoursEditor
                  value={selectedRestaurant.openingHours}
                  onChange={(value) => updateRestaurant('openingHours', value)}
                  tr={tr}
                />
              </div>
            )}

            {activeKind === 'attraction' && selectedAttraction && (
              <div className="mx-auto max-w-4xl space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-paris-blue">
                    {tr('编辑研学地点', 'Edit study place', 'Modifier le lieu')}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-paris-navy">{selectedAttraction.name}</h2>
                </div>
                <section className="grid gap-4 rounded-2xl border border-paris-navy/8 p-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-paris-navy">
                    {tr('中文名称', 'Chinese name', 'Nom chinois')}
                    <input
                      value={selectedAttraction.name}
                      onChange={(event) => updateAttraction('name', event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    />
                  </label>
                  <label className="text-xs font-bold text-paris-navy">
                    {tr('英文/法文名称', 'English/French name', 'Nom anglais/français')}
                    <input
                      value={selectedAttraction.englishName}
                      onChange={(event) => updateAttraction('englishName', event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    />
                  </label>
                  <label className="text-xs font-bold text-paris-navy sm:col-span-2">
                    {tr('详细地址', 'Full address', 'Adresse complète')}
                    <input
                      value={selectedAttraction.address}
                      onChange={(event) => updateAttraction('address', event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-paris-navy/10 px-3 py-2.5 text-sm font-normal outline-none focus:border-paris-blue"
                    />
                  </label>
                </section>
                <HoursEditor
                  value={selectedAttraction.visitingHours}
                  onChange={(value) => updateAttraction('visitingHours', value)}
                  tr={tr}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
