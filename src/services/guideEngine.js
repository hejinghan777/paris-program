import { attractions, GUIDE_DATA_REVIEWED_ON, guideSources } from '../data/guideKnowledge.js'
import { restaurants } from '../data/restaurants.js'

const cuisineRules = [
  { words: ['中餐', '中国菜', '中文餐', 'chinese', 'chinois'], specialty: 'Chinese' },
  { words: ['法国菜', '法餐', '小馆', 'bistro', 'français'], specialty: 'French Bistro' },
  { words: ['日本', '寿司', '拉面', 'japanese', 'sushi', 'japonais'], specialty: 'Japanese' },
  { words: ['意大利', '披萨', '意面', 'italian', 'italien'], specialty: 'Italian' },
  { words: ['甜点', '面包', '烘焙', 'pastry', 'bakery', 'pâtisserie'], specialty: 'Bakery & Pastry' },
  { words: ['素食', '纯素', 'vegan', 'végan'], specialty: 'Vegan' },
]

const specialtyNames = {
  'French Bistro': { zh: '法式小馆', en: 'French bistro', fr: 'bistrot français' },
  'Fine Dining': { zh: '精致餐饮', en: 'fine dining', fr: 'restaurant gastronomique' },
  Italian: { zh: '意大利菜', en: 'Italian', fr: 'cuisine italienne' },
  Japanese: { zh: '日本料理', en: 'Japanese', fr: 'cuisine japonaise' },
  Chinese: { zh: '中餐', en: 'Chinese', fr: 'cuisine chinoise' },
  'Middle Eastern': { zh: '中东料理', en: 'Middle Eastern', fr: 'cuisine du Moyen-Orient' },
  Crêperie: { zh: '可丽饼', en: 'crêperie', fr: 'crêperie' },
  'Bakery & Pastry': { zh: '烘焙甜点', en: 'bakery & pastry', fr: 'boulangerie-pâtisserie' },
  'Wine Bar': { zh: '葡萄酒吧', en: 'wine bar', fr: 'bar à vins' },
  'Brasserie & Seafood': { zh: '海鲜餐厅', en: 'brasserie & seafood', fr: 'brasserie et fruits de mer' },
  Vegan: { zh: '纯素餐厅', en: 'vegan', fr: 'restaurant végan' },
}

const attractionDetails = {
  'eiffel-tower': {
    en: ['7th arrondissement', '2–3 hours'],
    fr: ['7e arrondissement', '2 à 3 heures'],
  },
  louvre: {
    en: ['1st arrondissement', '3–4 hours'],
    fr: ['1er arrondissement', '3 à 4 heures'],
  },
  orsay: {
    en: ['7th arrondissement', '2–3 hours'],
    fr: ['7e arrondissement', '2 à 3 heures'],
  },
  'cite-sciences': {
    en: ['19th arrondissement', '3–4 hours'],
    fr: ['19e arrondissement', '3 à 4 heures'],
  },
  'natural-history': {
    en: ['5th arrondissement', '2–3 hours'],
    fr: ['5e arrondissement', '2 à 3 heures'],
  },
  'arc-triomphe': {
    en: ['8th arrondissement', '1–2 hours'],
    fr: ['8e arrondissement', '1 à 2 heures'],
  },
  'notre-dame': {
    en: ['4th arrondissement', '1–2 hours'],
    fr: ['4e arrondissement', '1 à 2 heures'],
  },
  versailles: {
    en: ['Versailles', 'Half day to full day'],
    fr: ['Versailles', 'Une demi-journée à une journée'],
  },
}

function l(language, zh, en, fr) {
  if (language === 'en') return en
  if (language === 'fr') return fr
  return zh
}

function attractionName(attraction, language) {
  return language === 'zh' ? attraction.name : attraction.englishName
}

function attractionMeta(attraction, language) {
  if (language === 'zh') return `${attraction.area} · ${attraction.duration}`
  return (attractionDetails[attraction.id]?.[language] || [attraction.area, attraction.duration]).join(' · ')
}

function attractionDescription(attraction, language) {
  return l(
    language,
    attraction.summary,
    `A focused study visit exploring the history, design and cultural context of ${attraction.englishName}.`,
    `Une visite d’étude consacrée à l’histoire, à la conception et au contexte culturel de ${attraction.englishName}.`,
  )
}

function attractionSource(attraction, language) {
  if (language === 'zh') return attraction.source
  return {
    label: l(
      language,
      attraction.source.label,
      `${attraction.englishName} official website`,
      `Site officiel — ${attraction.englishName}`,
    ),
    url: attraction.source.url,
  }
}

function localizedValue(value, language) {
  if (!value || typeof value === 'string') return value
  return value[language] || value.zh || value.en || ''
}

function attractionRecommendation(attraction, language) {
  return {
    type: 'attraction',
    id: attraction.id,
    title: attractionName(attraction, language),
    meta: attractionMeta(attraction, language),
    description:
      language === 'zh' ? attraction.studyValue : attractionDescription(attraction, language),
    address: attraction.address,
    hoursSummary: localizedValue(attraction.visitingHours?.summary, language),
    hoursNote: localizedValue(attraction.visitingHours?.note, language),
    hoursCertainty: attraction.visitingHours?.certainty,
    hoursCheckedOn: attraction.visitingHours?.checkedOn,
    hoursSource: attraction.source,
    lat: attraction.lat,
    lng: attraction.lng,
  }
}

function containsAny(text, words) {
  return words.some((word) => text.includes(word))
}

function uniqueSources(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

function extractBudgetPerPerson(text) {
  const currencyMatch =
    text.match(/(?:€|eur(?:os?)?|欧元?|欧)\s*(\d{1,3}(?:[.,]\d{1,2})?)/i) ||
    text.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:€|eur(?:os?)?|欧元?|欧)/i)
  const contextMatch = text.match(
    /(?:预算|人均|每人|budget|per person|par personne|par tête)[^\d]{0,10}(\d{1,3}(?:[.,]\d{1,2})?)/i,
  )
  const rawValue = currencyMatch?.[1] || contextMatch?.[1]
  if (!rawValue) return null
  const value = Number(rawValue.replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null
}

function hasBudgetIntent(text) {
  return containsAny(text, ['预算', '人均', '每人', 'budget', 'per person', 'par personne', 'par tête'])
}

function hasRestaurantIntent(text) {
  return containsAny(text, [
    '餐厅',
    '餐馆',
    '吃',
    '饭',
    '用餐',
    '午餐',
    '晚餐',
    '美食',
    '中餐',
    '中国菜',
    '法餐',
    '法国菜',
    '意大利菜',
    '披萨',
    '意面',
    '寿司',
    '拉面',
    '日本料理',
    '中东菜',
    '中东料理',
    '可丽饼',
    '甜点',
    '面包',
    '烘焙',
    '葡萄酒吧',
    '海鲜',
    '素食',
    '纯素',
    'restaurant',
    'food',
    'dinner',
    'lunch',
    'cuisine',
    'repas',
    'déjeuner',
    'dîner',
    'pizzeria',
    'sushi',
    'chinese',
    'italian',
    'japanese',
    'middle eastern',
    'crêperie',
    'wine bar',
    'seafood',
    'pâtisserie',
    'chinois',
    'italien',
    'italienne',
    'japonais',
    'japonaise',
  ])
}

function hasTransportIntent(text) {
  return containsAny(text, [
    '地铁',
    '公交',
    '交通',
    '车票',
    '换乘',
    '火车',
    'rer',
    'navigo',
    'metro',
    'métro',
    'bus',
    'tram',
    'transport',
    'ticket',
    'billet',
  ])
}

function hasItineraryIntent(text) {
  return containsAny(text, [
    '行程',
    '路线',
    '一天',
    '三天',
    '几天',
    '怎么安排',
    'plan',
    'itinerary',
    'one day',
    'three day',
    '3-day',
    'route',
    'itinéraire',
    'parcours',
    'journée',
    'trois jours',
  ])
}

function hasAttractionIntent(text) {
  return containsAny(text, [
    '景点',
    '地点',
    '参观',
    '博物馆',
    '美术馆',
    '埃菲尔铁塔',
    '卢浮宫',
    '奥赛',
    '凡尔赛',
    '凯旋门',
    '巴黎圣母院',
    '科学',
    '科技',
    '历史',
    '艺术',
    '建筑',
    '地标',
    '研学',
    '下雨',
    '雨天',
    '室内',
    '免费',
    'attraction',
    'place to visit',
    'visit',
    'museum',
    'eiffel',
    'louvre',
    'orsay',
    'versailles',
    'science',
    'history',
    'art',
    'architecture',
    'landmark',
    'study visit',
    'rainy',
    'musée',
    'visiter',
    'tour eiffel',
    'sciences',
    'histoire',
    'architecture',
    'monument',
    'pluie',
  ])
}

export function detectGuideIntent(input) {
  const text = String(input || '').trim().toLowerCase()
  const restaurantRequested = hasRestaurantIntent(text)
  const transportRequested = hasTransportIntent(text)
  const itineraryRequested = hasItineraryIntent(text)
  const attractionRequested = hasAttractionIntent(text) || itineraryRequested

  let primary = 'conversation'
  if (restaurantRequested) primary = 'restaurant'
  else if (transportRequested) primary = 'transport'
  else if (itineraryRequested) primary = 'itinerary'
  else if (attractionRequested) primary = 'attraction'

  return {
    primary,
    restaurantRequested,
    attractionRequested,
    transportRequested,
    itineraryRequested,
  }
}

function specialtyName(specialty, language) {
  return specialtyNames[specialty]?.[language] || specialty
}

function formatRestaurantBudget(restaurant, language) {
  const range = `€${restaurant.budgetEur.min}–${restaurant.budgetEur.max}`
  return l(language, `${range}/人（估算）`, `${range} pp (estimate)`, `${range}/pers. (estimation)`)
}

function pickRestaurants(text) {
  const cuisine = cuisineRules.find((rule) => containsAny(text, rule.words))?.specialty
  const budgetPerPerson = extractBudgetPerPerson(text)
  const wantsAffordable = containsAny(text, [
    '便宜',
    '实惠',
    '省钱',
    'cheap',
    'affordable',
    'abordable',
    'économique',
  ])
  const cuisineMatches = restaurants.filter(
    (restaurant) => !cuisine || restaurant.specialty === cuisine,
  )
  const withinBudget = budgetPerPerson
    ? cuisineMatches.filter((restaurant) => restaurant.budgetEur.min <= budgetPerPerson)
    : cuisineMatches
  const candidates = budgetPerPerson && withinBudget.length ? withinBudget : cuisineMatches

  return candidates
    .sort((first, second) => {
      if (budgetPerPerson) {
        const firstFitsFully = first.budgetEur.max <= budgetPerPerson
        const secondFitsFully = second.budgetEur.max <= budgetPerPerson
        if (firstFitsFully !== secondFitsFully) return firstFitsFully ? -1 : 1
        const firstGap = Math.abs(first.budgetEur.max - budgetPerPerson)
        const secondGap = Math.abs(second.budgetEur.max - budgetPerPerson)
        if (firstGap !== secondGap) return firstGap - secondGap
      }
      if (wantsAffordable && first.budgetEur.min !== second.budgetEur.min) {
        return first.budgetEur.min - second.budgetEur.min
      }
      return second.snapshotRating - first.snapshotRating
    })
    .slice(0, 3)
}

function rankAttractions(text) {
  const wantsFree = containsAny(text, ['免费', '省钱', 'free', 'gratuit'])
  const rainy = containsAny(text, ['下雨', '雨天', '室内', 'rain', 'pluie', 'intérieur'])
  const science = containsAny(text, ['科学', '科技', 'science', 'scientific', 'scientifique'])
  const art = containsAny(text, ['艺术', '美术', 'art', 'artistique'])
  const history = containsAny(text, ['历史', 'history', 'histoire'])
  return attractions
    .map((attraction) => {
      const score = attraction.tags.reduce(
        (total, tag) => total + (text.includes(tag.toLowerCase()) ? 3 : 0),
        0,
      )
      return {
        ...attraction,
        score:
          score +
          (wantsFree && attraction.budget === 'free' ? 2 : 0) +
          (rainy && attraction.tags.includes('室内') ? 2 : 0) +
          (science && ['cite-sciences', 'natural-history'].includes(attraction.id) ? 5 : 0) +
          (art && ['louvre', 'orsay'].includes(attraction.id) ? 5 : 0) +
          (history && ['louvre', 'arc-triomphe', 'versailles'].includes(attraction.id) ? 3 : 0),
      }
    })
    .sort((first, second) => second.score - first.score)
}

function restaurantAnswer(text, language) {
  const budgetPerPerson = extractBudgetPerPerson(text)
  const mentionsSpecificTime = containsAny(text, [
    '今天',
    '下午',
    '今晚',
    '中午',
    'today',
    'afternoon',
    'tonight',
    'this evening',
    'aujourd’hui',
    "aujourd'hui",
    'cet après-midi',
    'ce soir',
  ])
  if (hasBudgetIntent(text) && !budgetPerPerson) {
    return {
      text: l(
        language,
        '请告诉我一个具体的每人预算金额，例如“每人 30 欧元，推荐中餐厅”。我会按照餐厅的估算人均区间为你筛选。',
        'Please give me a specific per-person amount, for example “€30 per person, recommend Chinese restaurants.” I will filter the estimated per-person ranges.',
        'Indiquez un montant précis par personne, par exemple « 30 € par personne, restaurant chinois ». Je filtrerai les fourchettes estimées.',
      ),
      recommendations: [],
      sources: [],
    }
  }

  const matches = pickRestaurants(text)
  const hasFullBudgetMatch =
    !budgetPerPerson || matches.some((restaurant) => restaurant.budgetEur.max <= budgetPerPerson)
  const strictBudgetNote =
    budgetPerPerson && !hasFullBudgetMatch
      ? l(
          language,
          `资料库中没有估算区间上限完全不超过 €${budgetPerPerson} 的匹配餐厅；下面是最接近预算的选择，需要选择较低价菜品，否则可能超出预算。`,
          `No matching restaurant has an estimated range fully capped at €${budgetPerPerson}; the option below is the closest, so choose lower-priced dishes or the bill may exceed your budget.`,
          `Aucun restaurant correspondant n’a une estimation entièrement plafonnée à ${budgetPerPerson} € ; l’option ci-dessous est la plus proche, mais il faut choisir les plats les moins chers pour éviter de dépasser le budget.`,
        )
      : ''
  const description = matches
    .map(
      (restaurant, index) =>
        `${index + 1}. ${restaurant.name}（${specialtyName(restaurant.specialty, 'zh')}，${formatRestaurantBudget(restaurant, 'zh')}）`,
    )
    .join('；')
  return {
    text: l(
      language,
      `${budgetPerPerson ? `按每人约 €${budgetPerPerson} 的预算，` : ''}根据餐厅资料库，我建议先比较：${description}。${strictBudgetNote}预算区间是每人估算值，饮品、套餐和菜单变化可能增加实际花费。${mentionsSpecificTime ? '你提到了今天的具体时段，但资料库没有餐厅的实时营业状态，请在出发前确认今天是否营业。' : ''}点击卡片可在站内地图查看位置和步行路线。`,
      `${budgetPerPerson ? `For a budget of about €${budgetPerPerson} per person, ` : ''}compare ${matches.map((item) => `${item.name} (${formatRestaurantBudget(item, 'en')})`).join(', ')}. ${strictBudgetNote ? `${strictBudgetNote} ` : ''}These are estimated per-person ranges; drinks, set menus and menu changes may increase the bill. ${mentionsSpecificTime ? 'You mentioned a time today, but the database does not provide live opening status; confirm that the restaurant is open before leaving. ' : ''}Open a card for the in-app map and walking route.`,
      `${budgetPerPerson ? `Avec un budget d’environ ${budgetPerPerson} € par personne, ` : ''}comparez ${matches.map((item) => `${item.name} (${formatRestaurantBudget(item, 'fr')})`).join(', ')}. ${strictBudgetNote ? `${strictBudgetNote} ` : ''}Ce sont des estimations par personne ; boissons, menus et changements de carte peuvent augmenter l’addition. ${mentionsSpecificTime ? 'Vous avez indiqué un horaire aujourd’hui, mais la base ne fournit pas l’ouverture en temps réel ; vérifiez avant de partir. ' : ''}Ouvrez une fiche pour la carte et l’itinéraire intégrés.`,
    ),
    recommendations: matches.map((restaurant) => ({
      type: 'restaurant',
      id: restaurant.id,
      title: restaurant.name,
      meta: `${specialtyName(restaurant.specialty, language)} · ${formatRestaurantBudget(restaurant, language)}`,
      description: l(
        language,
        `收录在小组资料库中的${specialtyName(restaurant.specialty, 'zh')}，可在站内地图查看位置和步行路线。`,
        restaurant.blurb,
        `Une adresse parisienne de la catégorie ${specialtyName(restaurant.specialty, 'fr')}, avec position et itinéraire à pied sur la carte intégrée.`,
      ),
      budgetEur: restaurant.budgetEur,
      lat: restaurant.lat,
      lng: restaurant.lng,
    })),
    sources: [],
  }
}

function itineraryAnswer(text, language) {
  const isThreeDays = containsAny(text, ['三天', '3天', 'three day', '3-day', 'trois jours'])
  const selections = rankAttractions(text).slice(0, isThreeDays ? 6 : 3)
  if (isThreeDays) {
    return {
      text: l(
        language,
        `可以安排为三天研学路线：第一天以城市地标与建筑为主，参观${selections[0].name}和${selections[1].name}；第二天集中了解艺术与历史，参观${selections[2].name}和${selections[3].name}；第三天安排科学或文化遗产主题，参观${selections[4].name}和${selections[5].name}。每天建议只设置两个核心参观点，并以官方网站当天开放时间重新确认顺序。`,
        `Three-day study plan: Day 1 focuses on landmarks and architecture at ${attractionName(selections[0], language)} and ${attractionName(selections[1], language)}. Day 2 covers art and history at ${attractionName(selections[2], language)} and ${attractionName(selections[3], language)}. Day 3 explores science or heritage at ${attractionName(selections[4], language)} and ${attractionName(selections[5], language)}. Keep two core visits per day and confirm opening hours on the official sites.`,
        `Parcours de trois jours : jour 1, monuments et architecture à ${attractionName(selections[0], language)} et ${attractionName(selections[1], language)} ; jour 2, art et histoire à ${attractionName(selections[2], language)} et ${attractionName(selections[3], language)} ; jour 3, sciences ou patrimoine à ${attractionName(selections[4], language)} et ${attractionName(selections[5], language)}. Limitez-vous à deux visites principales par jour et vérifiez les horaires officiels.`,
      ),
      recommendations: selections.map((attraction) =>
        attractionRecommendation(attraction, language),
      ),
      sources: uniqueSources(selections.map((attraction) => attractionSource(attraction, language))),
    }
  }

  return {
    text: l(
      language,
      `如果只有一天，我建议选择两个核心参观点：上午参观${selections[0].name}，下午前往${selections[1].name}；${selections[2].name}可作为时间充足时的备选。这样比连续赶场更适合研学记录和小组讨论。`,
      `For one day, choose two core visits: ${attractionName(selections[0], language)} in the morning and ${attractionName(selections[1], language)} in the afternoon. Keep ${attractionName(selections[2], language)} as an optional stop. This leaves time for notes and group discussion.`,
      `Pour une journée, gardez deux visites principales : ${attractionName(selections[0], language)} le matin et ${attractionName(selections[1], language)} l’après-midi. ${attractionName(selections[2], language)} reste une option. Ce rythme laisse du temps pour les notes et les échanges.`,
    ),
    recommendations: selections.map((attraction) =>
      attractionRecommendation(attraction, language),
    ),
    sources: uniqueSources(selections.map((attraction) => attractionSource(attraction, language))),
  }
}

function attractionAnswer(text, language) {
  const selections = rankAttractions(text).slice(0, 3)
  return {
    text: l(
      language,
      `根据地点主题、研学价值和参观时长，优先推荐${selections
        .map((item) => item.name)
        .join('、')}。其中${selections[0].name}的研学重点是：${selections[0].studyValue} 建议先查看官方开放信息，再确定当天顺序。`,
      `Based on theme, study value and visit length, start with ${selections.map((item) => attractionName(item, language)).join(', ')}. ${attractionName(selections[0], language)} is the strongest match for your question. Check official visitor information before fixing the order.`,
      `Selon le thème, l’intérêt pédagogique et la durée, commencez par ${selections.map((item) => attractionName(item, language)).join(', ')}. ${attractionName(selections[0], language)} correspond le mieux à votre demande. Vérifiez les informations officielles avant de fixer l’ordre.`,
    ),
    recommendations: selections.map((attraction) =>
      attractionRecommendation(attraction, language),
    ),
    sources: uniqueSources(selections.map((attraction) => attractionSource(attraction, language))),
  }
}

function conversationAnswer(language) {
  return {
    text: l(
      language,
      '你好！我是法国研学第一组的智能导游。你可以问我巴黎景点、研学行程或交通；需要用餐建议时，请明确告诉我想找的餐厅、菜系或每人预算。',
      'Hello! I am Group 1’s smart Paris guide. Ask me about Paris attractions, study itineraries or transport. For dining suggestions, explicitly tell me the restaurant type, cuisine or per-person budget you need.',
      'Bonjour ! Je suis le guide intelligent du groupe 1. Posez-moi vos questions sur les sites parisiens, les parcours d’étude ou les transports. Pour un repas, indiquez clairement le type de restaurant, la cuisine ou le budget par personne.',
    ),
    recommendations: [],
    sources: [],
  }
}

export function buildGuideContext(input) {
  const text = String(input || '').toLowerCase()
  const intent = detectGuideIntent(text)
  return {
    reviewedOn: GUIDE_DATA_REVIEWED_ON,
    intent,
    relevantAttractions: intent.attractionRequested
      ? rankAttractions(text).slice(0, 5)
      : [],
    relevantRestaurants: intent.restaurantRequested ? pickRestaurants(text) : [],
    rules: [
      '只使用提供的数据回答地点、餐厅和开放信息',
      '只有 restaurantRequested 为 true 时才能提供具体餐厅、菜系、预算或用餐推荐',
      '普通问候和一般对话只自然回答，不主动推荐景点或餐厅',
      '价格、开放时间和评分可能变化，必须提示用户查看官方来源',
      '不得编造实时拥挤度、营业时间或票价',
    ],
  }
}

export function getLocalGuideAnswer(input, language = 'zh') {
  const text = input.trim().toLowerCase()
  const intent = detectGuideIntent(text)
  let answer

  if (intent.primary === 'restaurant') {
    answer = restaurantAnswer(text, language)
  } else if (intent.primary === 'transport') {
    answer = {
      text: l(
        language,
        '巴黎市内出行请以 Île-de-France Mobilités 的当前票种和线路信息为准。研学小组出发前应确认每位成员的票卡、集合点和返程路线；本站的餐厅页面提供步行导航，但不替代公共交通官方实时信息。',
        'Use current Île-de-France Mobilités ticket and network information for travel in Paris. Before departure, confirm each group member’s ticket, meeting point and return route. Our restaurant map provides walking routes but does not replace official live public-transport information.',
        'Pour les déplacements à Paris, consultez les titres et le réseau actuels d’Île-de-France Mobilités. Avant le départ, vérifiez le titre de chacun, le point de rendez-vous et le retour. La carte propose des itinéraires à pied mais ne remplace pas l’information officielle en temps réel.',
      ),
      recommendations: [],
      sources: [
        {
          ...guideSources.transport,
          label: l(
            language,
            guideSources.transport.label,
            'Île-de-France Mobilités official fares',
            'Tarifs officiels d’Île-de-France Mobilités',
          ),
        },
      ],
    }
  } else if (intent.primary === 'itinerary') {
    answer = itineraryAnswer(text, language)
  } else if (intent.primary === 'attraction') {
    answer = attractionAnswer(text, language)
  } else {
    answer = conversationAnswer(language)
  }

  return {
    ...answer,
    provider: l(
      language,
      '巴黎研学结构化资料库',
      'Structured Paris study database',
      'Base structurée du voyage d’étude',
    ),
    reviewedOn: GUIDE_DATA_REVIEWED_ON,
  }
}
