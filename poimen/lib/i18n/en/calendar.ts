export const calendar = {
  // Display names for the fasting seasons, keyed by the exact `name` that
  // lib/canon/fasting.ts returns (which other code uses as a key and must
  // keep). Show a season with:
  //   S.calendar.fastNames[name as keyof typeof S.calendar.fastNames] ?? name
  fastNames: {
    "Jonah's Fast": "Jonah's Fast",
    'Great Lent': 'Great Lent',
    "Apostles' Fast": "Apostles' Fast",
    "St. Mary's Fast": "St. Mary's Fast",
    'Nativity Fast': 'Nativity Fast',
  },

  // The thirteen Coptic months in order (index 0 = Thout), for display only.
  // lib/synaxarium.ts keeps its own English COPTIC_MONTHS for everything that
  // is not shown to a person.
  copticMonths: [
    'Thout', 'Paopi', 'Hathor', 'Koiahk', 'Tobi', 'Amshir',
    'Paremhat', 'Parmoute', 'Pashons', 'Paoni', 'Epip', 'Mesra', 'Nasie',
  ],

  // How each fasting season is announced on the calendar, keyed like
  // `fastNames` by the name lib/canon/fasting.ts returns.
  fastOpenings: {
    "Jonah's Fast": {
      title: 'Fast of Nineveh begins',
      desc: 'Three days of fasting recalling the repentance of Nineveh (Jonah’s Fast).',
    },
    'Great Lent': {
      title: 'Great Lent begins',
      desc: 'The Great Fast — fifty-five days of preparation ending in the Resurrection.',
    },
    "Apostles' Fast": {
      title: 'Apostles’ Fast begins',
      desc: 'The fast of the disciples, from after Pentecost until the Feast of the Apostles.',
    },
    "St. Mary's Fast": {
      title: 'St. Mary’s Fast begins',
      desc: 'Fifteen days of fasting in honor of the Theotokos (1–15 Mesra).',
    },
    'Nativity Fast': {
      title: 'Nativity Fast begins',
      desc: 'Forty-three days of fasting before the Feast of the Nativity.',
    },
  },

  // Feasts of the year (lib/feasts.ts).
  feasts: {
    nativity: {
      title: 'Feast of the Nativity',
      desc: 'The birth of our Lord Jesus Christ. Major Feast of the Lord — end of the Nativity Fast.',
    },
    circumcision: {
      title: 'Feast of the Circumcision',
      desc: 'The Circumcision of our Lord on the eighth day. Minor Feast of the Lord.',
    },
    theophany: {
      title: 'Feast of Theophany (Epiphany)',
      desc: 'The Baptism of our Lord in the Jordan. Liturgy of the Blessing of the Waters (Lakan).',
    },
    cana: {
      title: 'Wedding at Cana of Galilee',
      desc: 'The first miracle of our Lord — water made wine. Minor Feast of the Lord.',
    },
    entranceTemple: {
      title: 'Entrance of the Lord into the Temple',
      desc: 'The presentation of our Lord in the Temple as an infant. Minor Feast of the Lord.',
    },
    crossParemhat: {
      title: 'Feast of the Cross',
      desc: 'Commemoration of the apparition of the Holy Cross (10 Paremhat).',
    },
    annunciation: {
      title: 'Feast of the Annunciation',
      desc: 'The Archangel Gabriel announces the Incarnation to the Virgin Mary (29 Paremhat).',
    },
    entranceEgypt: {
      title: 'Entrance of the Lord into Egypt',
      desc: 'The flight of the Holy Family into Egypt (24 Pashons). Minor Feast of the Lord.',
    },
    archangelMichael: {
      title: 'Feast of Archangel Michael',
      desc: 'The annual feast of the Archangel Michael (12 Paoni).',
    },
    apostles: {
      title: 'Feast of the Apostles',
      desc: 'Martyrdom of Sts. Peter and Paul (5 Epip). End of the Apostles’ Fast — breaking of the fast after Divine Liturgy.',
    },
    transfiguration: {
      title: 'Feast of the Transfiguration',
      desc: 'The Transfiguration of our Lord on Mount Tabor (13 Mesra). Minor Feast of the Lord.',
    },
    assumption: {
      title: 'Assumption of St. Mary',
      desc: 'The assumption of the body of the Theotokos (16 Mesra). End of St. Mary’s Fast.',
    },
    // {year} is the Coptic year (Anno Martyrum) that begins on this day.
    nayrouz: {
      title: 'Nayrouz — Coptic New Year',
      desc: 'Feast of the Martyrs — Coptic year {year} begins (1 Thout).',
    },
    crossThout: {
      title: 'Feast of the Cross',
      desc: 'Commemoration of the finding of the Holy Cross by Queen Helena (17 Thout).',
    },
    palmSunday: {
      title: 'Palm Sunday (Hosanna)',
      desc: 'The entrance of our Lord into Jerusalem. Major Feast of the Lord — Holy Week begins.',
    },
    resurrection: {
      title: 'Feast of the Resurrection',
      desc: 'The glorious Resurrection of our Lord Jesus Christ — the Feast of Feasts.',
    },
    ascension: {
      title: 'Feast of the Ascension',
      desc: 'The Ascension of our Lord into heaven, forty days after the Resurrection.',
    },
    pentecost: {
      title: 'Feast of Pentecost',
      desc: 'The descent of the Holy Spirit upon the disciples. End of the Holy Fifty.',
    },
  },

  // Annual commemorations from the Synaxarium (lib/synaxarium.ts).
  saints: {
    johnBaptist: {
      title: 'Beheading of St. John the Baptist',
      desc: 'Martyrdom of the Forerunner and Baptist John (2 Thout).',
    },
    luke: {
      title: 'St. Luke the Evangelist',
      desc: 'Martyrdom of St. Luke, evangelist and physician (22 Paopi).',
    },
    fourCreatures: {
      title: 'The Four Incorporeal Creatures',
      desc: 'Feast of the Four Incorporeal Living Creatures around the throne (8 Hathor).',
    },
    mina: {
      title: 'St. Mina the Wonderworker',
      desc: 'Martyrdom of St. Mina of Mariout (15 Hathor).',
    },
    mercurius: {
      title: 'St. Philopateer Mercurius',
      desc: 'Martyrdom of Abu Seifein, "the bearer of two swords" (25 Hathor).',
    },
    maryEntranceTemple: {
      title: 'Entrance of St. Mary into the Temple',
      desc: 'The Theotokos presented in the Temple as a child (3 Koiahk).',
    },
    barbara: {
      title: 'St. Barbara the Martyr',
      desc: 'Martyrdom of St. Barbara (8 Koiahk).',
    },
    nicholas: {
      title: 'St. Nicholas of Myra',
      desc: 'Commemoration of St. Nicholas the Wonderworker (10 Koiahk).',
    },
    gabriel: {
      title: 'Archangel Gabriel',
      desc: 'Feast of the Archangel Gabriel, the announcer of the Incarnation (22 Koiahk).',
    },
    stephen: {
      title: 'St. Stephen the Archdeacon',
      desc: 'The first martyr of Christianity (1 Tobi).',
    },
    demiana: {
      title: 'St. Demiana and the Forty Virgins',
      desc: 'Martyrdom of St. Demiana and her companions (13 Tobi).',
    },
    anthony: {
      title: 'St. Anthony the Great',
      desc: 'Departure of the father of monasticism (22 Tobi).',
    },
    paulHermit: {
      title: 'St. Paul the First Hermit',
      desc: 'Departure of Anba Bola, the first anchorite (2 Amshir).',
    },
    kyrillosVI: {
      title: 'Pope Kyrillos VI',
      desc: 'Departure of Pope Kyrillos VI, the wonderworker (30 Amshir).',
    },
    shenoudaIII: {
      title: 'Pope Shenouda III',
      desc: 'Departure of Pope Shenouda III, teacher of generations (8 Paremhat).',
    },
    zeitoun: {
      title: 'Apparition of St. Mary at Zeitoun',
      desc: 'The apparitions of the Theotokos at Zeitoun, Cairo, 1968 (24 Paremhat).',
    },
    macarius: {
      title: 'St. Macarius the Great',
      desc: 'Departure of Abba Macarius, father of the monks of Scetis (27 Paremhat).',
    },
    george: {
      title: 'St. George the Prince of Martyrs',
      desc: 'Martyrdom of Mar Girgis (23 Parmoute).',
    },
    mark: {
      title: 'St. Mark the Evangelist',
      desc: 'Martyrdom of St. Mark, apostle of Egypt and beholder of God (30 Parmoute).',
    },
    maryNativity: {
      title: 'Nativity of St. Mary',
      desc: 'The birth of the Theotokos (1 Pashons).',
    },
    athanasius: {
      title: 'St. Athanasius the Apostolic',
      desc: 'Departure of the 20th Pope, defender of the faith (7 Pashons).',
    },
    pachomius: {
      title: 'St. Pachomius',
      desc: 'Departure of the father of communal monasticism (14 Pashons).',
    },
    mosesStrong: {
      title: 'St. Moses the Strong',
      desc: 'Martyrdom of St. Moses the Black (24 Paoni).',
    },
    shenoudaArchimandrite: {
      title: 'St. Shenouda the Archimandrite',
      desc: 'Departure of the great abbot of the White Monastery (7 Epip).',
    },
    bishoy: {
      title: 'St. Bishoy',
      desc: 'Departure of Anba Bishoy, the beloved of our good Savior (8 Epip).',
    },
    marina: {
      title: 'St. Marina the Martyr',
      desc: 'Martyrdom of St. Marina (23 Epip).',
    },
    abanoub: {
      title: 'St. Abanoub',
      desc: 'Martyrdom of the child martyr St. Abanoub of Nehisa (24 Epip).',
    },
    habibGirgis: {
      title: 'Archdeacon Habib Girgis',
      desc: 'Departure of St. Habib Girgis, founder of the Sunday School movement (15 Mesra).',
    },
    taklaHaymanot: {
      title: 'St. Takla Haymanot',
      desc: 'Departure of the Ethiopian saint Takla Haymanot (24 Mesra).',
    },
  },

  // The commemorations that return every Coptic month.
  monthly: {
    michaelTitle: 'Archangel Michael',
    maryTitle: 'St. Mary the Theotokos',
    // {day} is the day of the Coptic month, {month} its name from copticMonths.
    desc: 'Monthly commemoration ({day} {month}).',
    dormitionTitle: 'Dormition of St. Mary',
    dormitionDesc: 'The falling-asleep of the Theotokos (21 Tobi).',
  },

  // Between the passages of a Gospel reference: "Matthew 4:23-25; 5:1-16".
  referenceSeparator: '; ',
};
