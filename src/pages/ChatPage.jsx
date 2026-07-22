import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Send } from 'lucide-react'
import { CONTENT_REVIEWED_ON, fallbackAnswer, guideAnswers } from '../data/travelTips'

const initialMessage = {
  role: 'assistant',
  text: 'Bonjour! Ask me about attractions, itineraries, transport, budget or the best time to visit.',
}

function findAnswer(input) {
  const normalized = input.toLowerCase()
  return guideAnswers.find((answer) => answer.keywords.some((keyword) => normalized.includes(keyword))) ?? fallbackAnswer
}

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm sm:max-w-[80%] ${
          isUser
            ? 'rounded-br-sm bg-paris-navy text-paris-cream'
            : 'rounded-bl-sm border border-paris-navy/10 bg-white text-paris-navy'
        }`}
      >
        <p>{message.text}</p>
        {message.source && (
          <a
            href={message.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-paris-gold underline underline-offset-2"
          >
            {message.source.label}
            <ExternalLink aria-hidden="true" size={12} />
          </a>
        )}
      </div>
    </div>
  )
}
export default function ChatPage() {
  const [messages, setMessages] = useState([initialMessage])
  const [value, setValue] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isReplying])

  function handleSubmit(event) {
    event.preventDefault()
    const text = value.trim()
    if (!text || isReplying) return

    const answer = findAnswer(text)
    setMessages((current) => [...current, { role: 'user', text }])
    setValue('')
    setIsReplying(true)

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: answer.reply, source: answer.source },
      ])
      setIsReplying(false)
    }, 450)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden bg-paris-cream">
      <div className="border-b border-paris-navy/10 bg-white/70 px-4 py-2 text-center text-xs text-paris-navy/60">
        Time-sensitive guidance reviewed {CONTENT_REVIEWED_ON}; follow linked official sources for updates.
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((message, index) => (
          <Message key={`${message.role}-${index}`} message={message} />
        ))}
        {isReplying && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-paris-navy/10 bg-white px-4 py-2 text-sm text-paris-navy/50">
              typing…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-paris-navy/10 bg-white p-3">
        <label htmlFor="guide-question" className="sr-only">
          Ask the Paris trip guide
        </label>
        <input
          id="guide-question"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about attractions, itineraries, budget..."
          className="min-w-0 flex-1 rounded-full border border-paris-navy/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-paris-gold"
          disabled={isReplying}
        />
        <button
          type="submit"
          disabled={isReplying || !value.trim()}
          className="flex shrink-0 items-center justify-center rounded-full bg-paris-navy p-2.5 text-paris-cream disabled:opacity-40"
          aria-label="Send"
        >
          <Send aria-hidden="true" size={18} />
        </button>
      </form>
    </div>
  )
}
