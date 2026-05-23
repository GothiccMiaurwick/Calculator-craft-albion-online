import type { AlbionItem, Category, Subcategory, TreeItem, Server } from '@/lib/items';
import { ARTIFACT_BASE_DATA } from '@/lib/artifacts';

export type Locale = 'es' | 'en';

type TranslationKey =
  | 'calculator'
  | 'planner'
  | 'taller'
  | 'enchanter'
  | 'cooking'
  | 'database'
  | 'settings'
  | 'collapseSidebar'
  | 'expandSidebar'
  | 'language'
  | 'spanish'
  | 'english'
  | 'calculatorSettings'
  | 'interfaceLanguage'
  | 'navigationMode'
  | 'compactSidebar'
  | 'expandedSidebar'
  | 'chooseItemToCraft'
  | 'pleaseSelectItemToCraft'
  | 'synced'
  | 'refiner'
  | 'tier'
  | 'enchant'
  | 'crafting'
  | 'blackMarket'
  | 'salePrice'
  | 'taxWithPremium'
  | 'taxWithoutPremium'
  | 'returnRate'
  | 'cityWithoutFocus'
  | 'cityWithFocus'
  | 'bestToCraft'
  | 'minimumMargin'
  | 'rank'
  | 'margin'
  | 'noResultsOverMargin'
  | 'focusEfficiency'
  | 'silverPerFocus'
  | 'recalculate'
  | 'loading'
  | 'noProfitableCombinations'
  | 'investment'
  | 'netProfit'
  | 'profitMargin'
  | 'addToPlanner'
  | 'added'
  | 'server'
  | 'addItemToPlanner'
  | 'selectItem'
  | 'quantity'
  | 'useFocus'
  | 'useSavedConfiguration'
  | 'markForBlackMarket'
  | 'addCraft'
  | 'focusUsed'
  | 'newCraft'
  | 'emptyPlanner'
  | 'emptyPlannerSubtitle'
  | 'emptyTaller'
  | 'emptyTallerSubtitle'
  | 'item'
  | 'materialsAndJournals'
  | 'profit'
  | 'focus'
  | 'completed'
  | 'noSalePrice'
  | 'on'
  | 'off'
  | 'materialsNeeded'
  | 'artifactsNeeded'
  | 'journalDetails'
  | 'journalSummary'
  | 'journalCostTotal'
  | 'journalNetProfit'
  | 'journalSessionNote'
  | 'blackMarketTransport'
  | 'noBlackMarketItems'
  | 'craftingSummary'
  | 'extraCosts'
  | 'extraCostsHint'
  | 'totalInvestment'
  | 'totalProfit'
  | 'totalSaleValue'
  | 'noArtifactsNeeded'
  | 'noJournalsRequired'
  | 'noMaterials'
  | 'journal'
  | 'fullJournals'
  | 'partialJournal'
  | 'journalsToBuy'
  | 'selectItemPlaceholder';

const UI_TEXT: Record<Locale, Record<TranslationKey, string>> = {
  es: {
    calculator: 'CALCULADORA',
    planner: 'PLANIFICADOR',
    taller: 'TALLER',
    enchanter: 'ENCANTADOR',
    cooking: 'COCINA',
    database: 'BASE DE DATOS',
    settings: 'CONFIGURACION',
    collapseSidebar: 'RECOGER BARRA',
    expandSidebar: 'ABRIR BARRA',
    language: 'IDIOMA',
    spanish: 'ESPANOL',
    english: 'INGLES',
    calculatorSettings: 'CONFIGURACION',
    interfaceLanguage: 'IDIOMA DE LA INTERFAZ',
    navigationMode: 'BARRA LATERAL',
    compactSidebar: 'COMPACTA',
    expandedSidebar: 'EXPANDIDA',
    chooseItemToCraft: 'ELIGE UN ITEM PARA CRAFTEAR',
    pleaseSelectItemToCraft: 'SELECCIONA UN ITEM PARA CRAFTEAR',
    synced: 'SYNCED',
    refiner: 'REFINADOR',
    tier: 'TIER',
    enchant: 'ENCHANT',
    crafting: 'CRAFTING',
    blackMarket: 'MERCADO NEGRO',
    salePrice: 'PRECIO DE VENTA',
    taxWithPremium: 'IMPUESTO CON PREMIUM',
    taxWithoutPremium: 'IMPUESTO SIN PREMIUM',
    returnRate: 'TASA DE RETORNO',
    cityWithoutFocus: 'CIUDAD (SIN FOCO)',
    cityWithFocus: 'CIUDAD (USAR FOCO)',
    bestToCraft: 'MEJORES PARA CRAFTEAR',
    minimumMargin: 'MINIMO {value}% DE MARGEN',
    rank: 'RANK #{value}',
    margin: 'MARGEN',
    noResultsOverMargin: 'NO HAY RESULTADOS SOBRE {value}% DE MARGEN',
    focusEfficiency: 'EFICIENCIA POR FOCO',
    silverPerFocus: 'SILVER / FOCO',
    recalculate: 'RECALCULAR',
    loading: 'CARGANDO...',
    noProfitableCombinations: 'NO SE ENCONTRARON COMBINACIONES RENTABLES',
    investment: 'INVERSION',
    netProfit: 'GANANCIA NETA',
    profitMargin: 'MARGEN DE GANANCIA',
    addToPlanner: 'AGREGAR AL PLANIFICADOR',
    added: 'AGREGADO',
    server: 'SERVIDOR',
    addItemToPlanner: 'AGREGAR ITEM AL PLANIFICADOR',
    selectItem: 'SELECCIONAR ITEM',
    quantity: 'CANTIDAD',
    useFocus: 'USAR FOCO',
    useSavedConfiguration: 'USA TU CONFIGURACION GUARDADA COMO BASE',
    markForBlackMarket: 'MARCA ESTE ITEM PARA VENTA EN BM EN EL RESUMEN',
    addCraft: 'AGREGAR AL PLANIFICADOR',
    focusUsed: 'FOCO USADO',
    newCraft: 'AGREGAR NUEVO CRAFTEO',
    emptyPlanner: 'PLANIFICADOR VACIO',
    emptyPlannerSubtitle: 'AGREGA ITEMS PARA CALCULAR MATERIALES, DIARIOS, MERCADO NEGRO Y TU GANANCIA TOTAL.',
    emptyTaller: 'TALLER VACIO',
    emptyTallerSubtitle: 'AGREGA ITEMS PARA CALCULAR MATERIALES, DIARIOS, MERCADO NEGRO Y TU GANANCIA TOTAL.',
    item: 'ITEM',
    materialsAndJournals: 'MAT. Y DIARIOS REQ.',
    profit: 'GANANCIA',
    focus: 'FOCO',
    completed: 'TERMINADO',
    noSalePrice: 'SIN PRECIO DE VENTA',
    on: 'ENCENDIDO',
    off: 'APAGADO',
    materialsNeeded: 'MATERIALES NECESARIOS',
    artifactsNeeded: 'ARTEFACTOS NECESARIOS',
    journalDetails: 'DETALLES DE LOS DIARIOS',
    journalSummary: 'RESUMEN DE DIARIOS',
    journalCostTotal: 'COSTO TOTAL DE LOS DIARIOS',
    journalNetProfit: 'GANANCIA NETA DE DIARIOS',
    journalSessionNote: 'La venta solo cuenta diarios completos. El parcial queda guardado como avance.',
    blackMarketTransport: 'TRANSPORTAR AL MERCADO NEGRO',
    noBlackMarketItems: 'SIN ITEMS PARA TRANSPORTAR AL MERCADO NEGRO',
    craftingSummary: 'RESUMEN DEL CRAFTEO',
    extraCosts: 'COSTOS EXTRA',
    extraCostsHint: 'REROLLS, COMIDA, TARIFAS DE ESTACION',
    totalInvestment: 'INVERSION TOTAL',
    totalProfit: 'GANANCIA TOTAL',
    totalSaleValue: 'VALOR TOTAL DE VENTA',
    noArtifactsNeeded: 'SIN ARTEFACTOS NECESARIOS',
    noJournalsRequired: 'SIN DIARIOS REQUERIDOS',
    noMaterials: 'SIN MATERIALES',
    journal: 'DIARIO',
    fullJournals: 'COMPLETOS',
    partialJournal: 'PARCIAL',
    journalsToBuy: 'VACIOS A COMPRAR',
    selectItemPlaceholder: 'SELECCIONAR ITEM...',
  },
  en: {
    calculator: 'CALCULATOR',
    planner: 'PLANNER',
    taller: 'WORKSHOP',
    enchanter: 'ENCHANTER',
    cooking: 'COOKING',
    database: 'DATABASE',
    settings: 'SETTINGS',
    collapseSidebar: 'COLLAPSE SIDEBAR',
    expandSidebar: 'OPEN SIDEBAR',
    language: 'LANGUAGE',
    spanish: 'SPANISH',
    english: 'ENGLISH',
    calculatorSettings: 'SETTINGS',
    interfaceLanguage: 'INTERFACE LANGUAGE',
    navigationMode: 'SIDEBAR MODE',
    compactSidebar: 'COMPACT',
    expandedSidebar: 'EXPANDED',
    chooseItemToCraft: 'CHOOSE AN ITEM TO CRAFT',
    pleaseSelectItemToCraft: 'PLEASE SELECT AN ITEM TO CRAFT',
    synced: 'SYNCED',
    refiner: 'REFINER',
    tier: 'TIER',
    enchant: 'ENCHANT',
    crafting: 'CRAFTING',
    blackMarket: 'BLACK MARKET',
    salePrice: 'SALE PRICE',
    taxWithPremium: 'TAX WITH PREMIUM',
    taxWithoutPremium: 'TAX WITHOUT PREMIUM',
    returnRate: 'RETURN RATE',
    cityWithoutFocus: 'CITY (NO FOCUS)',
    cityWithFocus: 'CITY (USE FOCUS)',
    bestToCraft: 'BEST TO CRAFT',
    minimumMargin: 'MINIMUM {value}% MARGIN',
    rank: 'RANK #{value}',
    margin: 'MARGIN',
    noResultsOverMargin: 'NO RESULTS OVER {value}% MARGIN',
    focusEfficiency: 'FOCUS EFFICIENCY',
    silverPerFocus: 'SILVER / FOCUS',
    recalculate: 'RECALCULATE',
    loading: 'LOADING...',
    noProfitableCombinations: 'NO PROFITABLE COMBINATIONS FOUND',
    investment: 'INVESTMENT',
    netProfit: 'NET PROFIT',
    profitMargin: 'PROFIT MARGIN',
    addToPlanner: 'ADD TO PLANNER',
    added: 'ADDED',
    server: 'SERVER',
    addItemToPlanner: 'ADD ITEM TO PLANNER',
    selectItem: 'SELECT ITEM',
    quantity: 'QUANTITY',
    useFocus: 'USE FOCUS',
    useSavedConfiguration: 'USE YOUR SAVED CONFIGURATION AS A BASE',
    markForBlackMarket: 'MARK THIS ITEM FOR BLACK MARKET SALES IN THE SUMMARY',
    addCraft: 'ADD TO PLANNER',
    focusUsed: 'FOCUS USED',
    newCraft: 'ADD NEW CRAFT',
    emptyPlanner: 'EMPTY PLANNER',
    emptyPlannerSubtitle: 'ADD ITEMS TO CALCULATE MATERIALS, JOURNALS, BLACK MARKET AND YOUR TOTAL SESSION PROFIT.',
    emptyTaller: 'EMPTY WORKSHOP',
    emptyTallerSubtitle: 'ADD ITEMS TO CALCULATE MATERIALS, JOURNALS, BLACK MARKET AND YOUR TOTAL SESSION PROFIT.',
    item: 'ITEM',
    materialsAndJournals: 'MAT. & JOURNALS',
    profit: 'PROFIT',
    focus: 'FOCUS',
    completed: 'DONE',
    noSalePrice: 'NO SALE PRICE',
    on: 'ON',
    off: 'OFF',
    materialsNeeded: 'REQUIRED MATERIALS',
    artifactsNeeded: 'REQUIRED ARTIFACTS',
    journalDetails: 'JOURNAL DETAILS',
    journalSummary: 'JOURNAL SUMMARY',
    journalCostTotal: 'TOTAL JOURNAL COST',
    journalNetProfit: 'NET JOURNAL PROFIT',
    journalSessionNote: 'Only full journals are counted as sold. The partial one remains as progress.',
    blackMarketTransport: 'TRANSPORT TO BLACK MARKET',
    noBlackMarketItems: 'NO ITEMS MARKED FOR BLACK MARKET',
    craftingSummary: 'CRAFTING SUMMARY',
    extraCosts: 'EXTRA COSTS',
    extraCostsHint: 'REROLLS, FOOD, STATION FEES',
    totalInvestment: 'TOTAL INVESTMENT',
    totalProfit: 'TOTAL PROFIT',
    totalSaleValue: 'TOTAL SALE VALUE',
    noArtifactsNeeded: 'NO ARTIFACTS REQUIRED',
    noJournalsRequired: 'NO JOURNALS REQUIRED',
    noMaterials: 'NO MATERIALS',
    journal: 'JOURNAL',
    fullJournals: 'FULL',
    partialJournal: 'PARTIAL',
    journalsToBuy: 'EMPTIES TO BUY',
    selectItemPlaceholder: 'SELECT ITEM...',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  armas: 'WEAPONS',
  cascos: 'HEADPIECES',
  pecheras: 'CHEST ARMOR',
  botas: 'SHOES',
  secundaria: 'OFF-HAND',
  bolsas: 'BAGS',
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  espadas: 'SWORDS',
  hachas: 'AXES',
  mazas: 'MACES',
  martillos: 'HAMMERS',
  guantes: 'WAR GLOVES',
  ballestas: 'CROSSBOWS',
  arcos: 'BOWS',
  dagas: 'DAGGERS',
  lanzas: 'SPEARS',
  varas: 'QUARTERSTAFFS',
  cambiaformas: 'SHAPESHIFTER STAFFS',
  naturales: 'NATURE STAFFS',
  igneos: 'FIRE STAFFS',
  sagrados: 'HOLY STAFFS',
  arcanos: 'ARCANE STAFFS',
  hielo: 'FROST STAFFS',
  malditos: 'CURSED STAFFS',
  cascos_placas: 'PLATE HELMETS',
  capuchas_cuero: 'LEATHER HOODS',
  habitos_tela: 'CLOTH COWLS',
  armadura_placas: 'PLATE ARMOR',
  chaquetas_cuero: 'LEATHER JACKETS',
  tunicas_tela: 'CLOTH ROBES',
  zapatos_cuero: 'LEATHER SHOES',
  botas_placas: 'PLATE BOOTS',
  sandalias_tela: 'CLOTH SANDALS',
  escudo: 'SHIELDS',
  antorcha: 'TORCHES',
  tomos: 'TOMES',
  bolsas: 'BAGS',
};

const RESOURCE_LABELS = {
  tela: { es: 'TELA', en: 'CLOTH' },
  lingote: { es: 'ACERO', en: 'STEEL' },
  tablas: { es: 'TABLAS', en: 'PLANKS' },
  cuero: { es: 'CUERO', en: 'LEATHER' },
  artefacto: { es: 'ARTEFACTO', en: 'ARTIFACT' },
} as const;

const SPECIAL_MATERIAL_NAMES: Record<string, { es: string; en: string }> = {
  T4_SKILLBOOK_STANDARD: { es: 'TOMO DE PERSPICACIA', en: 'TOME OF INSIGHT' },
  T5_SKILLBOOK_STANDARD: { es: 'TOMO DE PERSPICACIA', en: 'TOME OF INSIGHT' },
  T6_SKILLBOOK_STANDARD: { es: 'TOMO DE PERSPICACIA', en: 'TOME OF INSIGHT' },
  T7_SKILLBOOK_STANDARD: { es: 'TOMO DE PERSPICACIA', en: 'TOME OF INSIGHT' },
  T8_SKILLBOOK_STANDARD: { es: 'TOMO DE PERSPICACIA', en: 'TOME OF INSIGHT' },
  T3_ALCHEMY_RARE_PANTHER: { es: 'GARRAS SOMBRIAS DURAS', en: 'RUGGED SHADOW CLAWS' },
  T3_ALCHEMY_RARE_ENT: { es: 'RAIZ SILVANA DURA', en: 'RUGGED SYLVIAN ROOT' },
  T3_ALCHEMY_RARE_DIREBEAR: { es: 'PATAS DE ESPIRITU DURAS', en: 'RUGGED SPIRIT PAWS' },
  T3_ALCHEMY_RARE_WEREWOLF: { es: 'COLMILLOS DE HOMBRE LOBO DUROS', en: 'RUGGED WEREWOLF FANGS' },
  T3_ALCHEMY_RARE_ELEMENTAL: { es: 'DIENTE DE PIEDRA RUNICA DURO', en: 'RUGGED RUNESTONE TOOTH' },
  T3_ALCHEMY_RARE_IMP: { es: 'CUERNO DE DIABLILLO DURO', en: 'RUGGED IMP\'S HORN' },
  T3_ALCHEMY_RARE_EAGLE: { es: 'PLUMA DE ALBA DURA', en: 'RUGGED DAWNFEATHER' },
};

const ARTIFACT_NAME_OVERRIDES_EN: Record<string, string> = {
  ARMOR_CLOTH_KEEPER: 'Druidic Feathers',
  MAIN_NATURESTAFF_KEEPER: 'Druidic Seed',
  HEAD_CLOTH_KEEPER: 'Druidic Cowl Artifact',
  SHOES_CLOTH_KEEPER: 'Druid Sandals Artifact',
};

const SERVER_LABELS: Record<Server, Record<Locale, string>> = {
  west: { es: 'AMERICAS (OESTE)', en: 'AMERICAS (WEST)' },
  east: { es: 'ASIA (EAST)', en: 'ASIA (EAST)' },
  europe: { es: 'EUROPA', en: 'EUROPE' },
};

const ARTIFACT_CATEGORY_LABELS = {
  armas: { es: 'ARMAS', en: 'WEAPONS' },
  armaduras: { es: 'ARMADURAS', en: 'ARMOR' },
  secundaria: { es: 'SECUNDARIA', en: 'OFF-HAND' },
} as const;

const ITEM_NAME_OVERRIDES_EN: Record<string, string> = {
  MAIN_SWORD: 'Broadsword',
  MAIN_SWORD_CRYSTAL: 'Infinity Blade',
  MAIN_AXE: 'Battleaxe',
  '2H_AXE': 'Greataxe',
  '2H_AXE_AVALON': 'Realmbreaker',
  '2H_BOW': 'Bow',
  '2H_BOW_AVALON': 'Mistpiercer',
  '2H_BOW_CRYSTAL': 'Skystrider Bow',
  '2H_BOW_HELL': 'Wailing Bow',
  '2H_BOW_KEEPER': 'Bow of Badon',
  '2H_CLAWPAIR': 'Claws',
  '2H_CLAYMORE': 'Claymore',
  '2H_CLAYMORE_AVALON': 'Kingmaker',
  '2H_CLEAVER_HELL': 'Carving Sword',
  '2H_COMBATSTAFF_MORGANA': 'Black Monk Stave',
  '2H_CROSSBOW': 'Crossbow',
  '2H_CROSSBOWLARGE': 'Heavy Crossbow',
  '2H_CROSSBOWLARGE_MORGANA': 'Siegebow',
  '2H_CROSSBOW_CANNON_AVALON': 'Energy Shaper',
  '2H_CURSEDSTAFF': 'Great Cursed Staff',
  '2H_CURSEDSTAFF_MORGANA': 'Damnation Staff',
  '2H_DAGGERPAIR': 'Dagger Pair',
  '2H_DAGGERPAIR_CRYSTAL': 'Twin Slayers',
  '2H_DAGGER_KATAR_AVALON': 'Bridled Fury',
  '2H_DEMONICSTAFF': 'Demonic Staff',
  '2H_DIVINESTAFF': 'Divine Staff',
  '2H_DOUBLEBLADEDSTAFF': 'Double Bladed Staff',
  '2H_DOUBLEBLADEDSTAFF_CRYSTAL': 'Phantom Twinblade',
  '2H_DUALAXE_KEEPER': 'Bear Paws',
  '2H_DUALCROSSBOW_CRYSTAL': 'Arclight Blasters',
  '2H_DUALCROSSBOW_HELL': 'Boltcasters',
  '2H_DUALHAMMER_HELL': 'Forge Hammers',
  '2H_DUALMACE_AVALON': 'Oathkeepers',
  '2H_DUALSCIMITAR_UNDEAD': 'Galatine Pair',
  '2H_DUALSICKLE_UNDEAD': 'Deathgivers',
  '2H_DUALSWORD': 'Dual Swords',
  '2H_ENIGMATICORB_MORGANA': 'Malevolent Locus',
  '2H_ENIGMATICSTAFF': 'Enigmatic Staff',
  '2H_FIRESTAFF': 'Great Fire Staff',
  '2H_FIRESTAFF_HELL': 'Brimstone Staff',
  '2H_FIRE_RINGPAIR_AVALON': 'Dawnsong',
  '2H_FLAIL': 'Morning Star',
  '2H_FROSTSTAFF': 'Great Frost Staff',
  '2H_FROSTSTAFF_CRYSTAL': 'Arctic Staff',
  '2H_GLACIALSTAFF': 'Glacial Staff',
  '2H_GLAIVE': 'Glaive',
  '2H_GLAIVE_CRYSTAL': 'Rift Glaive',
  '2H_HALBERD': 'Halberd',
  '2H_HALBERD_MORGANA': 'Carrioncaller',
  MAIN_MACE: 'Mace',
  '2H_MACE': 'Heavy Mace',
  MAIN_HAMMER: 'Hammer',
  '2H_HAMMER': 'Great Hammer',
  '2H_HAMMER_AVALON': 'Hand of Justice',
  '2H_HAMMER_CRYSTAL': 'Truebolt Hammer',
  '2H_HAMMER_UNDEAD': 'Tombhammer',
  '2H_HARPOON_HELL': 'Spirithunter',
  '2H_HOLYSTAFF': 'Great Holy Staff',
  '2H_HOLYSTAFF_CRYSTAL': 'Exalted Staff',
  '2H_HOLYSTAFF_HELL': 'Fallen Staff',
  '2H_HOLYSTAFF_UNDEAD': 'Redemption Staff',
  '2H_ICECRYSTAL_UNDEAD': 'Permafrost Prism',
  '2H_ICEGAUNTLETS_HELL': 'Icicle Staff',
  '2H_INFERNOSTAFF': 'Infernal Staff',
  '2H_INFERNOSTAFF_MORGANA': 'Blazing Staff',
  '2H_IRONCLADEDSTAFF': 'Iron-clad Staff',
  '2H_KNUCKLES_AVALON': 'Fists of Avalon',
  '2H_KNUCKLES_CRYSTAL': 'Forcepulse Bracers',
  '2H_KNUCKLES_HELL': 'Hellfire Hands',
  '2H_KNUCKLES_KEEPER': 'Ursine Maulers',
  '2H_KNUCKLES_MORGANA': 'Ravenstrike Cestus',
  '2H_KNUCKLES_SET1': 'Brawler Gloves',
  '2H_KNUCKLES_SET2': 'Battle Bracers',
  '2H_KNUCKLES_SET3': 'Spiked Gauntlets',
  '2H_LONGBOW': 'Longbow',
  '2H_LONGBOW_UNDEAD': 'Whispering Bow',
  '2H_MACE_MORGANA': 'Camlann Mace',
  '2H_NATURESTAFF': 'Great Nature Staff',
  '2H_NATURESTAFF_HELL': 'Blight Staff',
  '2H_NATURESTAFF_KEEPER': 'Rampant Staff',
  '2H_POLEHAMMER': 'Polehammer',
  '2H_QUARTERSTAFF': 'Quarterstaff',
  '2H_QUARTERSTAFF_AVALON': 'Grailseeker',
  '2H_RAM_KEEPER': 'Grovekeeper',
  '2H_REPEATINGCROSSBOW_UNDEAD': 'Weeping Repeater',
  '2H_ROCKSTAFF_KEEPER': 'Staff of Balance',
  '2H_SCYTHE_CRYSTAL': 'Crystal Reaper',
  '2H_SCYTHE_HELL': 'Infernal Scythe',
  '2H_SHAPESHIFTER_AVALON': 'Lightcaller',
  '2H_SHAPESHIFTER_CRYSTAL': 'Stillgaze Staff',
  '2H_SHAPESHIFTER_HELL': 'Hellspawn Staff',
  '2H_SHAPESHIFTER_KEEPER': 'Earthrune Staff',
  '2H_SHAPESHIFTER_MORGANA': 'Bloodmoon Staff',
  '2H_SHAPESHIFTER_SET1': 'Prowling Staff',
  '2H_SHAPESHIFTER_SET2': 'Rootbound Staff',
  '2H_SHAPESHIFTER_SET3': 'Primal Staff',
  '2H_SKULLORB_HELL': 'Cursed Skull',
  '2H_SPEAR': 'Pike',
  '2H_TRIDENT_UNDEAD': 'Trinity Spear',
  '2H_TWINSCYTHE_HELL': 'Soulscythe',
  '2H_WARBOW': 'Warbow',
  '2H_WILDSTAFF': 'Wild Staff',
  ARMOR_CLOTH_AVALON: 'Robe of Purity',
  ARMOR_CLOTH_FEY: 'Feyscale Robe',
  ARMOR_CLOTH_HELL: 'Fiend Robe',
  ARMOR_CLOTH_KEEPER: 'Druid Robe',
  ARMOR_CLOTH_MORGANA: 'Cultist Robe',
  HEAD_PLATE_SET1: 'Soldier Helmet',
  HEAD_PLATE_SET2: 'Knight Helmet',
  HEAD_PLATE_SET3: 'Guardian Helmet',
  HEAD_PLATE_AVALON: 'Helmet of Valor',
  HEAD_PLATE_FEY: 'Duskweaver Helmet',
  HEAD_PLATE_HELL: 'Demon Helmet',
  HEAD_PLATE_KEEPER: 'Judicator Helmet',
  HEAD_PLATE_UNDEAD: 'Graveguard Helmet',
  HEAD_LEATHER_SET1: 'Mercenary Hood',
  HEAD_LEATHER_SET2: 'Hunter Hood',
  HEAD_LEATHER_SET3: 'Assassin Hood',
  HEAD_LEATHER_AVALON: 'Hood of Tenacity',
  HEAD_LEATHER_FEY: 'Mistwalker Hood',
  HEAD_LEATHER_HELL: 'Hellion Hood',
  HEAD_LEATHER_MORGANA: 'Stalker Hood',
  HEAD_LEATHER_UNDEAD: 'Specter Hood',
  HEAD_CLOTH_SET1: 'Scholar Cowl',
  HEAD_CLOTH_SET2: 'Cleric Cowl',
  HEAD_CLOTH_SET3: 'Mage Cowl',
  HEAD_CLOTH_AVALON: 'Cowl of Purity',
  HEAD_CLOTH_FEY: 'Feyscale Hat',
  HEAD_CLOTH_HELL: 'Fiend Cowl',
  HEAD_CLOTH_KEEPER: 'Druid Cowl',
  HEAD_CLOTH_MORGANA: 'Cultist Cowl',
  ARMOR_PLATE_SET1: 'Soldier Armor',
  ARMOR_PLATE_SET2: 'Knight Armor',
  ARMOR_PLATE_SET3: 'Guardian Armor',
  ARMOR_PLATE_AVALON: 'Armor of Valor',
  ARMOR_PLATE_FEY: 'Duskweaver Armor',
  ARMOR_PLATE_HELL: 'Demon Armor',
  ARMOR_PLATE_KEEPER: 'Judicator Armor',
  ARMOR_PLATE_UNDEAD: 'Graveguard Armor',
  ARMOR_LEATHER_SET1: 'Mercenary Jacket',
  ARMOR_LEATHER_SET2: 'Hunter Jacket',
  ARMOR_LEATHER_SET3: 'Assassin Jacket',
  ARMOR_LEATHER_AVALON: 'Jacket of Tenacity',
  ARMOR_LEATHER_FEY: 'Mistwalker Jacket',
  ARMOR_LEATHER_HELL: 'Hellion Jacket',
  ARMOR_LEATHER_MORGANA: 'Stalker Jacket',
  ARMOR_LEATHER_UNDEAD: 'Specter Jacket',
  ARMOR_CLOTH_SET1: 'Scholar Robe',
  ARMOR_CLOTH_SET2: 'Cleric Robe',
  ARMOR_CLOTH_SET3: 'Mage Robe',
  BAG: 'Bag',
  BAG_INSIGHT: 'Satchel of Insight',
  MAIN_1HCROSSBOW: 'Light Crossbow',
  MAIN_ARCANESTAFF: 'Arcane Staff',
  MAIN_ARCANESTAFF_UNDEAD: 'Witchwork Staff',
  MAIN_CURSEDSTAFF: 'Cursed Staff',
  MAIN_CURSEDSTAFF_AVALON: 'Shadowcaller',
  MAIN_CURSEDSTAFF_CRYSTAL: 'Rotcaller Staff',
  MAIN_CURSEDSTAFF_UNDEAD: 'Lifecurse Staff',
  MAIN_DAGGER: 'Dagger',
  MAIN_DAGGER_HELL: 'Demonfang',
  MAIN_FIRESTAFF: 'Fire Staff',
  MAIN_FIRESTAFF_CRYSTAL: 'Flamewalker Staff',
  MAIN_FIRESTAFF_KEEPER: 'Wildfire Staff',
  MAIN_FROSTSTAFF: 'Frost Staff',
  MAIN_FROSTSTAFF_AVALON: 'Chillhowl',
  MAIN_FROSTSTAFF_KEEPER: 'Hoarfrost Staff',
  MAIN_HOLYSTAFF: 'Holy Staff',
  MAIN_HOLYSTAFF_AVALON: 'Hallowfall',
  MAIN_HOLYSTAFF_MORGANA: 'Lifetouch Staff',
  MAIN_MACE_CRYSTAL: 'Dreadstorm Monarch',
  MAIN_MACE_HELL: 'Incubus Mace',
  MAIN_NATURESTAFF: 'Nature Staff',
  MAIN_NATURESTAFF_AVALON: 'Ironroot Staff',
  MAIN_NATURESTAFF_CRYSTAL: 'Forgebark Staff',
  MAIN_NATURESTAFF_KEEPER: 'Druidic Staff',
  MAIN_RAPIER_MORGANA: 'Bloodletter',
  MAIN_ROCKMACE_KEEPER: 'Bedrock Mace',
  MAIN_SCIMITAR_MORGANA: 'Clarent Blade',
  MAIN_SPEAR: 'Spear',
  MAIN_SPEAR_KEEPER: 'Heron Spear',
  MAIN_SPEAR_LANCE_AVALON: 'Daybreaker',
  OFF_BOOK: 'Tome of Spells',
  OFF_CENSER_AVALON: 'Celestial Censer',
  OFF_DEMONSKULL_HELL: 'Muisak',
  OFF_HORN_KEEPER: 'Mistcaller',
  OFF_JESTERCANE_HELL: 'Leering Cane',
  OFF_LAMP_UNDEAD: 'Cryptcandle',
  OFF_ORB_MORGANA: 'Eye of Secrets',
  OFF_SHIELD: 'Shield',
  OFF_SHIELD_AVALON: 'Astral Aegis',
  OFF_SHIELD_CRYSTAL: 'Unbreakable Ward',
  OFF_SHIELD_HELL: 'Caitiff Shield',
  OFF_SPIKEDSHIELD_MORGANA: 'Facebreaker',
  OFF_TALISMAN_AVALON: 'Sacred Scepter',
  OFF_TOME_CRYSTAL: 'Timelocked Grimoire',
  OFF_TORCH: 'Torch',
  OFF_TORCH_CRYSTAL: 'Blueflame Torch',
  OFF_TOTEM_KEEPER: 'Taproot',
  OFF_TOWERSHIELD_UNDEAD: 'Sarcophagus',
  SHOES_LEATHER_SET1: 'Mercenary Shoes',
  SHOES_LEATHER_SET2: 'Hunter Shoes',
  SHOES_LEATHER_SET3: 'Assassin Shoes',
  SHOES_LEATHER_AVALON: 'Shoes of Tenacity',
  SHOES_LEATHER_FEY: 'Mistwalker Shoes',
  SHOES_LEATHER_HELL: 'Hellion Shoes',
  SHOES_LEATHER_MORGANA: 'Stalker Shoes',
  SHOES_LEATHER_UNDEAD: 'Specter Shoes',
  SHOES_PLATE_SET1: 'Soldier Boots',
  SHOES_PLATE_SET2: 'Knight Boots',
  SHOES_PLATE_SET3: 'Guardian Boots',
  SHOES_PLATE_AVALON: 'Boots of Valor',
  SHOES_PLATE_FEY: 'Duskweaver Boots',
  SHOES_PLATE_HELL: 'Demon Boots',
  SHOES_PLATE_KEEPER: 'Judicator Boots',
  SHOES_PLATE_UNDEAD: 'Graveguard Boots',
  SHOES_CLOTH_SET1: 'Scholar Sandals',
  SHOES_CLOTH_SET2: 'Cleric Sandals',
  SHOES_CLOTH_SET3: 'Mage Sandals',
  SHOES_CLOTH_AVALON: 'Sandals of Purity',
  SHOES_CLOTH_FEY: 'Feyscale Sandals',
  SHOES_CLOTH_HELL: 'Fiend Sandals',
  SHOES_CLOTH_KEEPER: 'Druid Sandals',
  SHOES_CLOTH_MORGANA: 'Cultist Sandals',
};

const CATEGORY_NAMES_BY_LABEL = {
  ARMAS: 'armas',
  CASCOS: 'cascos',
  PECHERAS: 'pecheras',
  BOTAS: 'botas',
  'MANO SECUNDARIA': 'secundaria',
  BOLSAS: 'bolsas',
} as const;

const SUBCATEGORY_NAMES_BY_LABEL = {
  ESPADAS: 'espadas',
  HACHAS: 'hachas',
  MAZAS: 'mazas',
  MARTILLOS: 'martillos',
  GUANTES: 'guantes',
  BALLESTAS: 'ballestas',
  ARCOS: 'arcos',
  DAGAS: 'dagas',
  LANZAS: 'lanzas',
  VARAS: 'varas',
  'BASTON DE CAMBIAFORMAS': 'cambiaformas',
  'BASTONES NATURALES': 'naturales',
  'BASTONES IGNEOS': 'igneos',
  'BASTONES SAGRADOS': 'sagrados',
  'BASTONES ARCANOS': 'arcanos',
  'BASTONES DE HIELO': 'hielo',
  'BASTONES MALDITOS': 'malditos',
  'CASCO DE PLACAS': 'cascos_placas',
  'CAPUCHAS DE CUERO': 'capuchas_cuero',
  'HABITOS DE TELA': 'habitos_tela',
  'ARMADURA DE PLACAS': 'armadura_placas',
  'CHAQUETAS DE CUERO': 'chaquetas_cuero',
  'TUNICAS DE TELA': 'tunicas_tela',
  'ZAPATOS DE CUERO': 'zapatos_cuero',
  'BOTAS DE PLACAS': 'botas_placas',
  'SANDALIAS DE TELA': 'sandalias_tela',
  ESCUDO: 'escudo',
  ANTORCHA: 'antorcha',
  TOMOS: 'tomos',
  BOLSAS: 'bolsas',
} as const;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function humanizeBaseId(baseId: string) {
  return baseId
    .replace(/^(MAIN_|OFF_|2H_|HEAD_|ARMOR_|SHOES_)+/g, '')
    .replace(/_/g, ' ')
    .replace(/SET(\d)/g, 'SET $1')
    .replace(/\s+/g, ' ')
    .trim();
}

function getArtifactBaseId(id: string) {
  const normalized = normalizeText(id);
  const marker = '_ARTEFACT_';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) return '';
  return normalized.slice(markerIndex + marker.length).replace(/@\d+$/, '');
}

function getArtifactName(id: string, locale: Locale) {
  const baseId = getArtifactBaseId(id);
  const artifact = ARTIFACT_BASE_DATA.find((entry) => normalizeText(entry.id) === baseId);

  if (artifact) {
    if (locale === 'es') return artifact.name.toUpperCase();
    return ARTIFACT_NAME_OVERRIDES_EN[artifact.id] ?? `${getItemNameByBaseId(artifact.id, 'en')} Artifact`;
  }

  return locale === 'es' ? RESOURCE_LABELS.artefacto.es : 'Artifact';
}

function translateMasteryLabel(name: string, locale: Locale): string | null {
  const suffix = ' MAESTRIA GENERAL';
  const normalized = normalizeText(name);

  if (!normalized.endsWith(suffix)) return null;

  const baseLabel = name.slice(0, name.length - suffix.length);
  const translatedBase = translateLooseLabel(baseLabel, locale);
  return locale === 'es' ? `${translatedBase} MAESTRIA GENERAL` : `${translatedBase} GENERAL MASTERY`;
}

function translateLooseLabel(label: string, locale: Locale): string {
  if (locale === 'es') return label;

  const mastery = translateMasteryLabel(label, locale);
  if (mastery) return mastery;

  const normalized = normalizeText(label);

  if (normalized in CATEGORY_NAMES_BY_LABEL) {
    return CATEGORY_LABELS[CATEGORY_NAMES_BY_LABEL[normalized as keyof typeof CATEGORY_NAMES_BY_LABEL]];
  }

  if (normalized in SUBCATEGORY_NAMES_BY_LABEL) {
    return SUBCATEGORY_LABELS[SUBCATEGORY_NAMES_BY_LABEL[normalized as keyof typeof SUBCATEGORY_NAMES_BY_LABEL]];
  }

  return label;
}

export function t(locale: Locale, key: TranslationKey, vars?: Record<string, string | number>) {
  let value = UI_TEXT[locale][key];
  if (!vars) return value;

  Object.entries(vars).forEach(([token, replacement]) => {
    value = value.replace(`{${token}}`, String(replacement));
  });

  return value;
}

export function getDisplayLocale(locale: Locale) {
  return locale === 'es' ? 'es-CO' : 'en-US';
}

export function getCategoryName(category: Category, locale: Locale) {
  return locale === 'es' ? category.name : (CATEGORY_LABELS[category.id] ?? category.name);
}

export function getCategoryNameById(categoryId: string, locale: Locale) {
  return locale === 'es'
    ? categoryId.toUpperCase()
    : (CATEGORY_LABELS[categoryId] ?? categoryId.toUpperCase());
}

export function getSubcategoryName(subcategory: Subcategory, locale: Locale) {
  return locale === 'es' ? subcategory.name : (SUBCATEGORY_LABELS[subcategory.id] ?? subcategory.name);
}

export function getTreeItemName(item: TreeItem, locale: Locale) {
  if (locale === 'es') return item.name;
  return ITEM_NAME_OVERRIDES_EN[item.tiers[4][0].baseId] ?? titleCase(humanizeBaseId(item.tiers[4][0].baseId));
}

export function getItemName(item: AlbionItem, locale: Locale) {
  if (locale === 'es') return item.name;
  return ITEM_NAME_OVERRIDES_EN[item.baseId] ?? titleCase(humanizeBaseId(item.baseId));
}

export function getItemNameByBaseId(baseId: string, locale: Locale) {
  if (locale === 'en') {
    return ITEM_NAME_OVERRIDES_EN[baseId] ?? titleCase(humanizeBaseId(baseId));
  }
  return titleCase(humanizeBaseId(baseId));
}

export function getArtifactNameByBaseId(baseId: string, locale: Locale) {
  const artifact = ARTIFACT_BASE_DATA.find((entry) => normalizeText(entry.id) === normalizeText(baseId));
  if (!artifact) {
    return locale === 'en' ? `${getItemNameByBaseId(baseId, 'en')} Artifact` : titleCase(humanizeBaseId(baseId));
  }

  if (locale === 'es') return artifact.name;
  return ARTIFACT_NAME_OVERRIDES_EN[artifact.id] ?? `${getItemNameByBaseId(artifact.id, 'en')} Artifact`;
}

export function getMaterialName(id: string, locale: Locale) {
  const specialMaterial = SPECIAL_MATERIAL_NAMES[id];
  if (specialMaterial) return specialMaterial[locale];
  if (id.includes('ARTEFACT')) return getArtifactName(id, locale);
  if (id.includes('METALBAR')) return RESOURCE_LABELS.lingote[locale];
  if (id.includes('PLANKS')) return RESOURCE_LABELS.tablas[locale];
  if (id.includes('LEATHER')) return RESOURCE_LABELS.cuero[locale];
  if (id.includes('FIBER') || id.includes('CLOTH')) return RESOURCE_LABELS.tela[locale];
  return titleCase(id.split('_').slice(1).join(' '));
}

export function getResourceLabel(key: 'tela' | 'lingote' | 'tablas' | 'cuero', locale: Locale) {
  return RESOURCE_LABELS[key][locale];
}

export function getServerName(server: Server, locale: Locale) {
  return SERVER_LABELS[server][locale];
}

export function getArtifactCategoryName(category: keyof typeof ARTIFACT_CATEGORY_LABELS, locale: Locale) {
  return ARTIFACT_CATEGORY_LABELS[category][locale];
}

export function translateLooseUiLabel(label: string, locale: Locale) {
  return translateLooseLabel(label, locale);
}

const JOURNAL_WORKER_LABELS: Record<string, Record<Locale, string>> = {
  BLACKSMITH: { es: 'Warrior', en: 'Warrior' },
  IMBUER: { es: 'Mage', en: 'Mage' },
  FLETCHER: { es: 'Hunter', en: 'Hunter' },
  TINKER: { es: 'Toolmaker', en: 'Toolmaker' },
  WARRIOR: { es: 'Warrior', en: 'Warrior' },
  MAGE: { es: 'Mage', en: 'Mage' },
  HUNTER: { es: 'Hunter', en: 'Hunter' },
  TOOLMAKER: { es: 'Toolmaker', en: 'Toolmaker' },
  GUERRERO: { es: 'Warrior', en: 'Warrior' },
  MAGO: { es: 'Mage', en: 'Mage' },
  CAZADOR: { es: 'Hunter', en: 'Hunter' },
  'FABRICANTE DE HERRAMIENTAS': { es: 'Toolmaker', en: 'Toolmaker' },
};

const JOURNAL_NAME_LABELS: Record<string, Record<Locale, string>> = {
  BLACKSMITH: { es: 'Blacksmith Journal', en: 'Blacksmith Journal' },
  IMBUER: { es: 'Imbuer Journal', en: 'Imbuer Journal' },
  FLETCHER: { es: 'Fletcher Journal', en: 'Fletcher Journal' },
  TINKER: { es: 'Tinker Journal', en: 'Tinker Journal' },
  WARRIOR: { es: 'Blacksmith Journal', en: 'Blacksmith Journal' },
  MAGE: { es: 'Imbuer Journal', en: 'Imbuer Journal' },
  HUNTER: { es: 'Fletcher Journal', en: 'Fletcher Journal' },
  TOOLMAKER: { es: 'Tinker Journal', en: 'Tinker Journal' },
  GUERRERO: { es: 'Blacksmith Journal', en: 'Blacksmith Journal' },
  MAGO: { es: 'Imbuer Journal', en: 'Imbuer Journal' },
  CAZADOR: { es: 'Fletcher Journal', en: 'Fletcher Journal' },
  'FABRICANTE DE HERRAMIENTAS': { es: 'Tinker Journal', en: 'Tinker Journal' },
};

export function getJournalWorkerName(type: string, locale: Locale) {
  const normalized = normalizeText(type);
  return JOURNAL_WORKER_LABELS[normalized]?.[locale] ?? (locale === 'es' ? type : titleCase(type));
}

export function getCraftJournalName(type: string, locale: Locale) {
  const normalized = normalizeText(type);
  return JOURNAL_NAME_LABELS[normalized]?.[locale] ?? `${titleCase(type)} Journal`;
}

export function getJournalDisplayName(name: string, subtitle: string, locale: Locale) {
  const normalized = normalizeText(subtitle);
  return JOURNAL_NAME_LABELS[normalized]?.[locale] ?? name;
}
