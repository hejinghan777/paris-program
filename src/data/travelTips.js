export const CONTENT_REVIEWED_ON = '22 July 2026'

export const travelSources = {
  transport: {
    label: 'Île-de-France Mobilités — Tickets and fares',
    url: 'https://www.iledefrance-mobilites.fr/en/titres-et-tarifs',
  },
  navigoEasy: {
    label: 'Île-de-France Mobilités — Navigo Easy',
    url: 'https://www.iledefrance-mobilites.fr/en/titres-et-tarifs/supports/passe-navigo-easy',
  },
  eiffelTower: {
    label: 'Official Eiffel Tower visitor information',
    url: 'https://www.toureiffel.paris/en',
  },
  louvre: {
    label: 'Louvre — Hours and admission',
    url: 'https://www.louvre.fr/en/visit/hours-admission',
  },
  parisTourism: {
    label: 'Paris je t’aime — Official tourism office',
    url: 'https://parisjetaime.com/eng/',
  },
}

export const guideAnswers = [
  {
    keywords: ['hello', 'hi', 'bonjour', 'salut'],
    reply:
      'Bonjour! I can help with attractions, a simple itinerary, transport, budget and seasonal planning. Time-sensitive answers include a link to the official source.',
    source: travelSources.parisTourism,
  },
  {
    keywords: ['eiffel', 'tower'],
    reply:
      'For the Eiffel Tower, reserve through the official ticket office and check same-day opening or access notices before leaving. Trocadéro remains a popular viewpoint across the Seine.',
    source: travelSources.eiffelTower,
  },
  {
    keywords: ['louvre', 'museum', 'orsay', 'art'],
    reply:
      'Museum schedules and free-admission rules can change. For the Louvre, check the official hours and admission page before relying on a fixed weekly or monthly rule. Musée d’Orsay and Musée de l’Orangerie are strong alternatives for Impressionist art.',
    source: travelSources.louvre,
  },
  {
    keywords: ['itinerary', 'days', 'plan', 'schedule'],
    reply:
      'A balanced three-day outline: Day 1 — Eiffel Tower, Seine and Trocadéro. Day 2 — Louvre, Île de la Cité and the Latin Quarter. Day 3 — Montmartre, Sacré-Cœur and Le Marais. Always check official opening hours before locking the order.',
    source: travelSources.parisTourism,
  },
  {
    keywords: ['budget', 'cheap', 'cost', 'money', 'price'],
    reply:
      'For transport, compare single Metro–Train–RER or Bus–Tram tickets with a Navigo day pass based on your actual journeys. Avoid relying on older “carnet” advice. Museum prices and free-entry rules should be checked on each venue’s official site.',
    source: travelSources.transport,
  },
  {
    keywords: ['transport', 'metro', 'bus', 'get around', 'navigo', 'ticket'],
    reply:
      'Current ticket names include Metro–Train–RER and Bus–Tram tickets. A €2 Navigo Easy pass can hold eligible tickets and short passes, but each traveller needs their own pass. Check the official fare page before purchase because products and prices can change.',
    source: travelSources.navigoEasy,
  },
  {
    keywords: ['when', 'season', 'weather', 'best time'],
    reply:
      'Spring and early autumn are often comfortable for walking, while summer is busier and winter has shorter days. Check a live forecast shortly before the trip instead of treating seasonal guidance as a forecast.',
    source: travelSources.parisTourism,
  },
  {
    keywords: ['restaurant', 'eat', 'food', 'dinner', 'lunch', 'cuisine'],
    reply:
      'Open the Restaurants map to browse the recovered collection by specialty. Its ratings and price bands are a dated snapshot, so use the live Google Maps link in each detail panel to confirm hours and recent information.',
  },
]

export const fallbackAnswer = {
  reply:
    'I do not have a specific answer for that yet. Try asking about attractions, a three-day itinerary, budget, transport, timing or restaurants.',
}
