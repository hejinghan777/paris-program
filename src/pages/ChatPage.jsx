import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Database,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { GUIDE_DATA_REVIEWED_ON } from '../data/guideKnowledge'
import { useLanguage } from '../i18n'
import { askGuide, hasRemoteGuide } from '../services/guideApi'

function RecommendationCard({ recommendation }) {
  const content = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-paris-navy">{recommendation.title}</span>
        {recommendation.type === 'restaurant' && <ArrowRight size={14} className="shrink-0 text-paris-blue" />}
      </span>
      <span className="mt-1 block text-[11px] font-semibold text-paris-blue">{recommendation.meta}</span>
      <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-paris-ink/55">
        {recommendation.description}
      </span>
    </>
  )

  if (recommendation.type === 'restaurant') {
    return (
      <Link
        to={`/map?restaurant=${recommendation.id}`}
        className="block rounded-xl border border-paris-navy/8 bg-paris-cream/60 p-3 transition hover:border-paris-blue/30 hover:bg-white"
      >
        {content}
      </Link>
    )
  }

  return <div className="rounded-xl border border-paris-navy/8 bg-paris-cream/60 p-3">{content}</div>
}

function Message({ message }) {
  const { tr } = useLanguage()
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
          isUser ? 'bg-paris-blue text-white' : 'bg-paris-navy text-white'
        }`}
        aria-hidden="true"
      >
        {isUser ? <UserRound size={15} /> : <Bot size={16} />}
      </div>
      <div className={`min-w-0 max-w-[88%] sm:max-w-[82%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-left text-sm leading-7 shadow-sm ${
            isUser
              ? 'rounded-tr-sm bg-paris-blue text-white'
              : 'rounded-tl-sm border border-paris-navy/8 bg-white text-paris-ink'
          }`}
        >
          <p className="whitespace-pre-line">{message.text}</p>

          {message.recommendations?.length > 0 && (
            <div className="mt-3 grid gap-2">
              {message.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={`${recommendation.type}-${recommendation.id}`}
                  recommendation={recommendation}
                />
              ))}
            </div>
          )}

          {message.sources?.length > 0 && (
            <div className="mt-3 border-t border-paris-navy/8 pt-2.5">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-paris-ink/35">
                {tr('官方信息来源', 'Official sources', 'Sources officielles')}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {message.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-paris-blue underline decoration-paris-blue/25 underline-offset-2"
                  >
                    {source.label}
                    <ExternalLink size={10} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {message.provider && (
          <p className={`mt-1.5 text-[10px] text-paris-ink/35 ${isUser ? 'text-right' : 'text-left'}`}>
            {tr('回答依据：', 'Answer based on: ', 'Réponse fondée sur : ')}
            {message.provider}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { language, tr } = useLanguage()
  const getInitialMessage = () => ({
    role: 'assistant',
    text: tr(
      '你好！我是第一组的智能导游。我会结合巴黎地点资料、餐厅数据库和官方信息来源，为你推荐研学景点、行程、交通与用餐选择。',
      'Hello! I am Group 1’s smart guide. I use Paris place data, our restaurant database and official sources to suggest study visits, itineraries, transport and meals.',
      'Bonjour ! Je suis le guide intelligent du groupe 1. J’utilise des données sur Paris, notre base de restaurants et des sources officielles pour vos visites, itinéraires, transports et repas.',
    ),
    provider: tr(
      '巴黎研学结构化资料库',
      'Structured Paris study database',
      'Base structurée du voyage d’étude',
    ),
  })
  const [messages, setMessages] = useState(() => [getInitialMessage()])
  const [value, setValue] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const endRef = useRef(null)
  const quickPrompts = [
    tr(
      '为第一组安排三天研学路线',
      'Plan a three-day study itinerary',
      'Planifier un parcours d’étude de trois jours',
    ),
    tr(
      '推荐适合研学的科学类景点',
      'Recommend science places for a study visit',
      'Recommander des lieux scientifiques',
    ),
    tr(
      '推荐价格实惠的中餐厅',
      'Recommend affordable Chinese restaurants',
      'Recommander des restaurants chinois abordables',
    ),
    tr(
      '下雨天适合参观哪里？',
      'Where should we visit on a rainy day?',
      'Que visiter un jour de pluie ?',
    ),
  ]

  useEffect(() => {
    setMessages([getInitialMessage()])
    setValue('')
    setIsReplying(false)
  }, [language])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isReplying])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || isReplying) return

    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setValue('')
    setIsReplying(true)
    const answer = await askGuide(trimmed, language)
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        text: answer.text,
        provider: answer.provider,
        sources: answer.sources,
        recommendations: answer.recommendations,
      },
    ])
    setIsReplying(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(value)
  }

  return (
    <div className="flex min-h-0 flex-1 bg-[#eef1f5]">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 overflow-hidden bg-white shadow-card lg:my-5 lg:rounded-[1.75rem] lg:border lg:border-paris-navy/8">
        <aside className="hidden w-72 shrink-0 flex-col bg-paris-navy p-5 text-white md:flex">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-paris-blue">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-black">
            {tr('智能研学导游', 'Smart study guide', 'Guide d’étude intelligent')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/55">
            {tr(
              '从结构化地点资料和餐厅数据库中检索，再生成与你的问题相关的建议。',
              'Retrieves structured place and restaurant data before producing a relevant answer.',
              'Recherche d’abord dans les données structurées des lieux et restaurants.',
            )}
          </p>

          <div className="mt-7 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs">
              <Database size={15} className="text-[#8db7ff]" aria-hidden="true" />
              {tr(
                '26 家餐厅 + 8 个研学地点',
                '26 restaurants + 8 study places',
                '26 restaurants + 8 lieux d’étude',
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs">
              <ShieldCheck size={15} className="text-emerald-400" aria-hidden="true" />
              {tr(
                '重要信息附官方来源',
                'Key information includes official sources',
                'Informations clés avec sources officielles',
              )}
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              {tr('推荐引擎', 'Recommendation engine', 'Moteur de recommandation')}
            </p>
            <p className="mt-2 text-sm font-bold">
              {hasRemoteGuide()
                ? tr(
                    'Gemini 安全代理 + 本地回退',
                    'Secure Gemini proxy + local fallback',
                    'Proxy Gemini sécurisé + repli local',
                  )
                : tr('数据库检索推荐', 'Database recommendations', 'Recommandations de la base')}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-white/45">
              {tr('资料核对日期：', 'Data reviewed: ', 'Données vérifiées : ')}
              {GUIDE_DATA_REVIEWED_ON}
            </p>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-paris-navy/8 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paris-navy text-white md:hidden">
                <Bot size={17} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-paris-navy">
                  {tr('第一组智能导游', 'Group 1 smart guide', 'Guide intelligent du groupe 1')}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-paris-ink/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {tr(
                    '数据库推荐服务在线',
                    'Database recommendation service online',
                    'Service de recommandation disponible',
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 rounded-full bg-paris-blue/8 px-3 py-1.5 text-[11px] font-bold text-paris-blue"
            >
              <MapPin size={13} aria-hidden="true" />
              {tr('查看地图', 'View map', 'Voir la carte')}
            </Link>
          </div>

          <div className="thin-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto bg-paris-cream/45 p-4 sm:p-6" aria-live="polite">
            {messages.map((message, index) => (
              <Message key={`${message.role}-${index}`} message={message} />
            ))}
            {isReplying && (
              <div className="flex items-start gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-paris-navy text-white">
                  <Bot size={16} aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-paris-navy/8 bg-white px-4 py-3 text-xs text-paris-ink/45 shadow-sm">
                  <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                  {tr(
                    '正在查询地点资料并生成建议…',
                    'Searching place data and preparing an answer…',
                    'Recherche des données et préparation de la réponse…',
                  )}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-paris-navy/8 bg-white p-3 sm:p-4">
            <div className="thin-scrollbar mb-3 flex gap-2 overflow-x-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isReplying}
                  className="shrink-0 rounded-full border border-paris-navy/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-paris-ink/60 transition hover:border-paris-blue/30 hover:text-paris-blue disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label htmlFor="guide-question" className="sr-only">
                {tr('向智能导游提问', 'Ask the smart guide', 'Poser une question au guide')}
              </label>
              <textarea
                id="guide-question"
                rows="1"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage(value)
                  }
                }}
                placeholder={tr(
                  '例如：推荐适合研学的一日艺术路线',
                  'Example: suggest a one-day art study route',
                  'Exemple : proposer un parcours artistique d’une journée',
                )}
                className="max-h-28 min-h-[44px] min-w-0 flex-1 resize-none rounded-2xl border border-paris-navy/10 bg-paris-cream/55 px-4 py-3 text-sm outline-none transition placeholder:text-paris-ink/35 focus:border-paris-blue focus:ring-2 focus:ring-paris-blue/10"
                disabled={isReplying}
              />
              <button
                type="submit"
                disabled={isReplying || !value.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-paris-blue text-white shadow-[0_8px_20px_rgba(27,82,171,0.2)] transition hover:bg-[#16468f] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={tr('发送问题', 'Send question', 'Envoyer la question')}
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-paris-ink/35">
              {tr(
                '推荐结果仅用于研学规划；开放时间、票价和交通请以官方来源为准',
                'Recommendations support planning; check official sources for hours, prices and transport',
                'Ces conseils aident à planifier ; vérifiez horaires, tarifs et transports sur les sites officiels',
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
