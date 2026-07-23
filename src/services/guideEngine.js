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

function pickRestaurants(text) {
  const cuisine = cuisineRules.find((rule) => containsAny(text, rule.words))?.specialty
  const budget = containsAny(text, ['便宜', '实惠', '预算', 'cheap', 'budget', 'affordable', 'abordable'])
  return restaurants
    .filter((restaurant) => !cuisine || restaurant.specialty === cuisine)
    .filter((restaurant) => !budget || restaurant.price.length <= 2)
    .sort((first, second) => {
      if (budget && first.price.length !== second.price.length) return first.price.length - second.price.length
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
  const matches = pickRestaurants(text)
  const description = matches
    .map(
      (restaurant, index) =>
        `${index + 1}. ${restaurant.name}（${restaurant.specialty}，${restaurant.price}，历史评分 ${restaurant.snapshotRating.toFixed(1)}）`,
    )
    .join('；')
  return {
    text: l(
      language,
      `根据餐厅资料库，我建议先比较：${description}。你可以点击下方餐厅卡片，在站内地图中查看位置并从当前位置开始步行导航。价格和评分是恢复的数据快照，出发前仍需确认当天营业情况。`,
      `Based on our restaurant database, compare ${matches.map((item) => item.name).join(', ')}. Open a card below to see it on the map and start an in-app walking route. Prices and ratings are a recovered snapshot, so check today’s opening status before leaving.`,
      `Selon notre base de restaurants, comparez ${matches.map((item) => item.name).join(', ')}. Ouvrez une fiche pour le voir sur la carte et démarrer un itinéraire à pied. Les prix et notes sont un instantané : vérifiez l’ouverture du jour.`,
    ),
    recommendations: matches.map((restaurant) => ({
      type: 'restaurant',
      id: restaurant.id,
      title: restaurant.name,
      meta: `${restaurant.specialty} · ${restaurant.price}`,
      description: l(
        language,
        `收录在小组资料库中的${restaurant.specialty}餐厅，可在站内地图查看位置和步行路线。`,
        restaurant.blurb,
        `Une adresse parisienne de la catégorie ${restaurant.specialty}, avec position et itinéraire à pied sur la carte intégrée.`,
      ),
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
      recommendations: selections.map((attraction) => ({
        type: 'attraction',
        id: attraction.id,
        title: attractionName(attraction, language),
        meta: attractionMeta(attraction, language),
        description: language === 'zh' ? attraction.studyValue : attractionDescription(attraction, language),
        lat: attraction.lat,
        lng: attraction.lng,
      })),
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
    recommendations: selections.map((attraction) => ({
      type: 'attraction',
      id: attraction.id,
      title: attractionName(attraction, language),
      meta: attractionMeta(attraction, language),
      description: language === 'zh' ? attraction.studyValue : attractionDescription(attraction, language),
      lat: attraction.lat,
      lng: attraction.lng,
    })),
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
    recommendations: selections.map((attraction) => ({
      type: 'attraction',
      id: attraction.id,
      title: attractionName(attraction, language),
      meta: attractionMeta(attraction, language),
      description: attractionDescription(attraction, language),
      lat: attraction.lat,
      lng: attraction.lng,
    })),
    sources: uniqueSources(selections.map((attraction) => attractionSource(attraction, language))),
  }
}

export function buildGuideContext(input) {
  const text = input.toLowerCase()
  return {
    reviewedOn: GUIDE_DATA_REVIEWED_ON,
    relevantAttractions: rankAttractions(text).slice(0, 5),
    relevantRestaurants: pickRestaurants(text),
    rules: [
      '只使用提供的数据回答地点、餐厅和开放信息',
      '价格、开放时间和评分可能变化，必须提示用户查看官方来源',
      '不得编造实时拥挤度、营业时间或票价',
    ],
  }
}

export function getLocalGuideAnswer(input, language = 'zh') {
  const text = input.trim().toLowerCase()
  let answer

  if (
    containsAny(text, [
      '餐厅',
      '吃',
      '饭',
      '美食',
      '中餐',
      '法餐',
      'restaurant',
      'food',
      'dinner',
      'lunch',
    ])
  ) {
    answer = restaurantAnswer(text, language)
  } else if (containsAny(text, ['地铁', '公交', '交通', '车票', 'navigo', 'metro', 'transport', 'billet'])) {
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
  } else if (
    containsAny(text, [
      '行程',
      '路线',
      '一天',
      '三天',
      '几天',
      'plan',
      'itinerary',
      'day',
      'itinéraire',
      'parcours',
      'jour',
    ])
  ) {
    answer = itineraryAnswer(text, language)
  } else {
    answer = attractionAnswer(text, language)
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
