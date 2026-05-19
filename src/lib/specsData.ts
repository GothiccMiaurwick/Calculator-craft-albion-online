export type SpecsItem = { name: string };
export type SpecsSubcategory = { name: string; general: SpecsItem; items: SpecsItem[] };
export type SpecsCategory = { name: string; icon: string; subcategories: SpecsSubcategory[] };

export const SPECS_DATA: SpecsCategory[] = [
  {
    name: 'ARMAS', icon: 'Sword',
    subcategories: [
      {
        name: 'ESPADAS',
        general: { name: 'ESPADAS MAESTRÍA GENERAL' },
        items: [
          { name: 'ANCHA ESPADA' }, { name: 'CLAYMORE' }, { name: 'DOS ESPADAS' },
          { name: 'HOJA CLARENT' }, { name: 'ESPADA TALLADA' }, { name: 'DOS GALATINAS' },
          { name: 'CREA-REYES' }, { name: 'HOJA INFINITA' }
        ]
      },
      {
        name: 'HACHAS',
        general: { name: 'HACHAS MAESTRÍA GENERAL' },
        items: [
          { name: 'HACHA DE GUERRA' }, { name: 'GRAN HACHA' }, { name: 'ALABARDA' },
          { name: 'LLAMACARROÑA' }, { name: 'GUADAÑA INFERNAL' }, { name: 'PATAS DE OSO' },
          { name: 'ROMPERREINOS' }, { name: 'FALCE DE CRISTAL' }
        ]
      },
      {
        name: 'MAZAS',
        general: { name: 'MAZAS MAESTRÍA GENERAL' },
        items: [
          { name: 'MAZA' }, { name: 'MAZA PESADA' }, { name: 'MANGUAL' },
          { name: 'MAZA DE LECTOR DE ROCA' }, { name: 'MAZA ÍNCUBO' }, { name: 'MAZA DE CAMLANN' },
          { name: 'JURADORES' }, { name: 'MONARCA DE LA TORMENTA' }
        ]
      },
      {
        name: 'MARTILLOS',
        general: { name: 'MARTILLOS MAESTRÍA GENERAL' },
        items: [
          { name: 'MARTILLO' }, { name: 'MARTILLO LARGO' }, { name: 'GRAN MARTILLO' },
          { name: 'MARTILLO DE LA TUMBA' }, { name: 'MARTILLOS DE FORJA' }, { name: 'GUARDABOSQUES' },
          { name: 'MANO DE LA JUSTICIA' }, { name: 'MARTILLO RELÁMPAGO' }
        ]
      },
      {
        name: 'GUANTES',
        general: { name: 'GUANTES MAESTRÍA GENERAL' },
        items: [
          { name: 'GUANTES DE PELEADOR' }, { name: 'BRAZALES DE BATALLA' }, { name: 'GUANTELETES DE PÚAS' },
          { name: 'ZARPAS OSUNAS' }, { name: 'MANOS INFERNALES' }, { name: 'CESTUS CÓRVIDOS' },
          { name: 'PUÑOS DE AVALON' }, { name: 'BRAZALES DE FUERZA PULSANTE' }
        ]
      },
      {
        name: 'BALLESTAS',
        general: { name: 'BALLESTAS MAESTRÍA GENERAL' },
        items: [
          { name: 'BALLESTA' }, { name: 'BALLESTA PESADA' }, { name: 'BALLESTA LIGERA' },
          { name: 'REPETIDORA DE DESCONSUELO' }, { name: 'LANZASAETAS' }, { name: 'ARCO DE ASEDIO' },
          { name: 'MODELADOR DE ENERGÍA' }, { name: 'DESINTEGRADORAS DE LUZ' }
        ]
      },
      {
        name: 'ARCOS',
        general: { name: 'ARCOS MAESTRÍA GENERAL' },
        items: [
          { name: 'ARCO' }, { name: 'ARCO DE GUERRA' }, { name: 'ARCO LARGO' },
          { name: 'ARCO SUSURRANTE' }, { name: 'ARCO DE LAMENTACIONES' }, { name: 'ARCO DE BADÓN' },
          { name: 'PERFORADOR DE NIEBLA' }, { name: 'ARCO CRUZACIELOS' }
        ]
      },
      {
        name: 'DAGAS',
        general: { name: 'DAGAS MAESTRÍA GENERAL' },
        items: [
          { name: 'DAGA' }, { name: 'DAGA DOBLE' }, { name: 'GARRAS' },
          { name: 'SANGRADORA' }, { name: 'COLMILLO DEMONÍACO' }, { name: 'CONCEDIMIENTOS' },
          { name: 'FURIA CONTENIDA' }, { name: 'GEMELAS ASESINAS' }
        ]
      },
      {
        name: 'LANZAS',
        general: { name: 'LANZAS MAESTRÍA GENERAL' },
        items: [
          { name: 'LANZA' }, { name: 'PICA' }, { name: 'GUJA' },
          { name: 'LANZA DE GARZA' }, { name: 'CAZAESPÍRITO' }, { name: 'LANZA DE TRINIDAD' },
          { name: 'PORTADOR DEL ALBA' }, { name: 'GUJA FISURANTE' }
        ]
      },
      {
        name: 'VARAS',
        general: { name: 'VARAS MAESTRÍA GENERAL' },
        items: [
          { name: 'VARA' }, { name: 'BASTÓN METÁLICO' }, { name: 'BASTÓN DE DOBLE FILO' },
          { name: 'BASTÓN DE MONJE NEGRO' }, { name: 'GUADAÑA DE ALMAS' }, { name: 'BASTÓN DE EQUILIBRIO' },
          { name: 'BUSCADOR DE GRIAL' }, { name: 'HOJA DOBLE FANTASMA' }
        ]
      },
      {
        name: 'BASTÓN DE CAMBIAFORMAS',
        general: { name: 'BASTÓN DE CAMBIAFORMAS MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN DE MERODEADOR' }, { name: 'BASTÓN ENRIQUECIDO' }, { name: 'BASTÓN PRIMITIVO' },
          { name: 'BASTÓN DE LUNA SANGRIENTA' }, { name: 'BASTÓN DE CRIATURA INFERNAL' }, { name: 'BASTÓN TERRÚNICO' },
          { name: 'INVOCADOR DE LUZ' }, { name: 'BASTÓN DE MIRADA FIRME' }
        ]
      },
      {
        name: 'BASTONES NATURALES',
        general: { name: 'BASTONES NATURALES MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN NATURAL' }, { name: 'GRAN BASTÓN NATURAL' }, { name: 'BASTÓN SALVAJE' },
          { name: 'BASTÓN DRUIDA' }, { name: 'BASTÓN DE INFORTUNIO' }, { name: 'BASTÓN DESENFRENADO' },
          { name: 'BASTÓN DE RAÍZ FÉRREA' }, { name: 'BASTÓN DE FORJACORTEZA' }
        ]
      },
      {
        name: 'BASTONES ÍGNEOS',
        general: { name: 'BASTONES ÍGNEOS MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN ÍGNEO' }, { name: 'GRAN BASTÓN ÍGNEO' }, { name: 'BASTÓN INFERNAL' },
          { name: 'BASTÓN DE FUEGO INCONTROLABLE' }, { name: 'BASTÓN DE AZUL' }, { name: 'BASTÓN FLAMÍGERO' },
          { name: 'CANCIÓN DEL DESESPERADO' }, { name: 'BASTÓN DE CAMINALLAMAS' }
        ]
      },
      {
        name: 'BASTONES SAGRADOS',
        general: { name: 'BASTONES SAGRADOS MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN SAGRADO' }, { name: 'GRAN BASTÓN SAGRADO' }, { name: 'BASTÓN DIVINO' },
          { name: 'BASTÓN DE TOQUE DE VIDA' }, { name: 'BASTÓN CAÍDO' }, { name: 'BASTÓN DE REDENCIÓN' },
          { name: 'SANTIFICADOR' }, { name: 'BASTÓN EXALTADO' }
        ]
      },
      {
        name: 'BASTONES ARCANOS',
        general: { name: 'BASTONES ARCANOS MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN ARCANO' }, { name: 'GRAN BASTÓN ARCANO' }, { name: 'BASTÓN ENIGMÁTICO' },
          { name: 'BASTÓN DE BRUJERÍA' }, { name: 'BASTÓN OCULTO' }, { name: 'LOCUS MALÉVOLO' },
          { name: 'SONIDO EQUILIBRADO' }, { name: 'BASTÓN ASTRAL' }
        ]
      },
      {
        name: 'BASTONES DE HIELO',
        general: { name: 'BASTONES DE HIELO MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN DE HIELO' }, { name: 'GRAN BASTÓN DE HIELO' }, { name: 'BASTÓN GLACIAL' },
          { name: 'BASTÓN DE ESCARCHA' }, { name: 'BASTÓN DE CARÁMBANOS' }, { name: 'PRISMA DE HIELOS PERPETUOS' },
          { name: 'GRITO GÉLIDO' }, { name: 'BASTÓN ÁRTICO' }
        ]
      },
      {
        name: 'BASTONES MALDITOS',
        general: { name: 'BASTONES MALDITOS MAESTRÍA GENERAL' },
        items: [
          { name: 'BASTÓN MALDITO' }, { name: 'GRAN BASTÓN MALDITO' }, { name: 'BASTÓN DEMONÍACO' },
          { name: 'BASTÓN DE MALDICIÓN DE VIDA' }, { name: 'CALAVERA MALDITA' }, { name: 'BASTÓN DE MALDICIONES' },
          { name: 'INVOCADOR OSCURO' }, { name: 'BASTÓN PUTREFACTO' }
        ]
      }
    ]
  },
  {
    name: 'CASCOS', icon: 'CircleUser',
    subcategories: [
      {
        name: 'CASCO DE PLACAS',
        general: { name: 'CASCO DE PLACAS MAESTRÍA GENERAL' },
        items: [
          { name: 'CASCO DE SOLDADO' }, { name: 'CASCO DE CABALLERO' }, { name: 'CASCO DE CUSTODIA' },
          { name: 'CASCO DE GUARDATUMBAS' }, { name: 'CASCO DE DEMONIO' }, { name: 'CASCO DE JUEZ' },
          { name: 'CASCO CREPUSCULAR' }, { name: 'CASCO DE VALOR' }
        ]
      },
      {
        name: 'CAPUCHAS DE CUERO',
        general: { name: 'CAPUCHAS DE CUERO MAESTRÍA GENERAL' },
        items: [
          { name: 'CAPUCHA DE MERCENARIO' }, { name: 'CAPUCHA DE CAZADOR' }, { name: 'CAPUCHA DE ASESINO' },
          { name: 'CAPUCHA DE ACECHADOR' }, { name: 'CAPUCHA DE VÁNDALO' }, { name: 'CAPUCHA DE ESPECTRO' },
          { name: 'CAPUCHA DE CAMINANIEBLAS' }, { name: 'CAPUCHA DE TENACIDAD' }
        ]
      },
      {
        name: 'HÁBITOS DE TELA',
        general: { name: 'HÁBITOS DE TELA MAESTRÍA GENERAL' },
        items: [
          { name: 'HÁBITO DE ERUDITO' }, { name: 'HÁBITO DE CLÉRIGO' }, { name: 'HÁBITO DE MAGO' },
          { name: 'HÁBITO DE DRUIDA' }, { name: 'HÁBITO DE DIABLO' }, { name: 'HÁBITO DE SECTARIO' },
          { name: 'SOMBRERO DE ESCAMA FEÉRICA' }, { name: 'HÁBITO DE PUREZA' }
        ]
      }
    ]
  },
  {
    name: 'PECHERAS', icon: 'Layers',
    subcategories: [
      {
        name: 'ARMADURA DE PLACAS',
        general: { name: 'ARMADURA DE PLACAS MAESTRÍA GENERAL' },
        items: [
          { name: 'ARMADURA DE SOLDADO' }, { name: 'ARMADURA DE CABALLERO' }, { name: 'ARMADURA DE GUARDIÁN' },
          { name: 'ARMADURA DE GUARDATUMBAS' }, { name: 'ARMADURA DE DEMONIO' }, { name: 'ARMADURA DE JUEZ' },
          { name: 'ARMADURA CREPUSCULAR' }, { name: 'ARMADURA DE VALOR' }
        ]
      },
      {
        name: 'CHAQUETAS DE CUERO',
        general: { name: 'CHAQUETAS DE CUERO MAESTRÍA GENERAL' },
        items: [
          { name: 'CHAQUETA DE MERCENARIO' }, { name: 'CHAQUETA DE CAZADOR' }, { name: 'CHAQUETA DE ASESINO' },
          { name: 'CHAQUETA DE ACECHADOR' }, { name: 'CHAQUETA DE VÁNDALO' }, { name: 'CHAQUETA DE ESPECTRO' },
          { name: 'CHAQUETA DE CAMINANIEBLAS' }, { name: 'CHAQUETA DE TENACIDAD' }
        ]
      },
      {
        name: 'TÚNICAS DE TELA',
        general: { name: 'TÚNICAS DE TELA MAESTRÍA GENERAL' },
        items: [
          { name: 'TÚNICA DE ERUDITO' }, { name: 'TÚNICA DE CLÉRIGO' }, { name: 'TÚNICA DE MAGO' },
          { name: 'TÚNICA DE DRUIDA' }, { name: 'TÚNICA DE DIABLO' }, { name: 'TÚNICA DE SECTARIO' },
          { name: 'TÚNICA DE ESCAMAS FEÉRICAS' }, { name: 'TÚNICA DE PUREZA' }
        ]
      }
    ]
  },
  {
    name: 'BOTAS', icon: 'Wind',
    subcategories: [
      {
        name: 'BOTAS DE PLACAS',
        general: { name: 'BOTAS DE PLACAS MAESTRÍA GENERAL' },
        items: [
          { name: 'BOTAS DE SOLDADO' }, { name: 'BOTAS DE CABALLERO' }, { name: 'BOTAS DE GUARDIÁN' },
          { name: 'BOTAS DE GUARDATUMBAS' }, { name: 'BOTAS DE DEMONIO' }, { name: 'BOTAS DE JUEZ' },
          { name: 'BOTAS CREPUSCULARES' }, { name: 'BOTAS DE VALOR' }
        ]
      },
      {
        name: 'ZAPATOS DE CUERO',
        general: { name: 'ZAPATOS DE CUERO MAESTRÍA GENERAL' },
        items: [
          { name: 'ZAPATOS DE MERCENARIO' }, { name: 'ZAPATOS DE CAZADOR' }, { name: 'ZAPATOS DE ASESINO' },
          { name: 'ZAPATOS DE ACECHADOR' }, { name: 'ZAPATOS DE VÁNDALO' }, { name: 'ZAPATOS DE ESPECTRO' },
          { name: 'ZAPATOS DE CAMINANIEBLAS' }, { name: 'ZAPATOS DE TENACIDAD' }
        ]
      },
      {
        name: 'SANDALIAS DE TELA',
        general: { name: 'SANDALIAS DE TELA MAESTRÍA GENERAL' },
        items: [
          { name: 'SANDALIAS DE ERUDITO' }, { name: 'SANDALIAS DE CLÉRIGO' }, { name: 'SANDALIAS DE MAGO' },
          { name: 'SANDALIAS DE DRUIDA' }, { name: 'SANDALIAS DE DIABLO' }, { name: 'SANDALIAS DE SECTARIO' },
          { name: 'SANDALIAS DE ESCAMAS FEÉRICAS' }, { name: 'SANDALIAS DE PUREZA' }
        ]
      }
    ]
  },
  {
    name: 'MANO SECUNDARIA', icon: 'Shield',
    subcategories: [
      {
        name: 'ESCUDO',
        general: { name: 'ESCUDO MAESTRÍA GENERAL' },
        items: [
          { name: 'ESCUDO' }, { name: 'SARCÓFAGO' }, { name: 'ESCUDO DE VILLANO' },
          { name: 'PARTECARAS' }, { name: 'EGIS ASTRAL' }, { name: 'BARRERA INQUEBRANTABLE' }
        ]
      },
      {
        name: 'ANTORCHA',
        general: { name: 'ANTORCHA MAESTRÍA GENERAL' },
        items: [
          { name: 'ANTORCHA' }, { name: 'INVOCANIEBLAS' }, { name: 'BASTÓN MALICIOSO' },
          { name: 'VELA DE CRIPTA' }, { name: 'CETRO SAGRADO' }, { name: 'ANTORCHA LLAMAAZUL' }
        ]
      },
      {
        name: 'TOMOS',
        general: { name: 'TOMOS MAESTRÍA GENERAL' },
        items: [
          { name: 'LIBRO DE HECHIZOS' }, { name: 'OJO DE LOS SECRETOS' }, { name: 'MUISAK' },
          { name: 'RAÍZ PRIMARIA' }, { name: 'INCENSARIO CELESTIAL' }, { name: 'GRIMORIO CRONOESTÁTICO' }
        ]
      }
    ]
  },
  {
    name: 'BOLSAS', icon: 'ShoppingBag',
    subcategories: [
      {
        name: 'BOLSAS',
        general: { name: 'BOLSAS MAESTRÍA GENERAL' },
        items: [
          { name: 'BOLSA' }, { name: 'BOLSA DE VISITA' }
        ]
      }
    ]
  },
  {
    name: 'CAPAS', icon: 'Shirt',
    subcategories: [
      {
        name: 'CAPAS',
        general: { name: 'CAPAS MAESTRÍA GENERAL' },
        items: [
          { name: 'CAPA' }
        ]
      }
    ]
  }
];
