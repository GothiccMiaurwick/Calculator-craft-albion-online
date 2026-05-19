export interface ArtifactBase {
  id: string;      // Base ID, e.g. MAIN_SCIMITAR_MORGANA
  name: string;    // Display Name, e.g. Remanente de Morgana
  category: 'armas' | 'armaduras' | 'secundaria';
}

export const ARTIFACT_BASE_DATA: ArtifactBase[] = [
  // --- ESPADAS ---
  { id: 'MAIN_SCIMITAR_MORGANA', name: 'Remanente de Morgana', category: 'armas' },
  { id: '2H_CLEAVER_HELL', name: 'Cuchilla de Guardián', category: 'armas' },
  { id: '2H_DUALSCIMITAR_UNDEAD', name: 'Esquirla Inmortal', category: 'armas' },
  { id: '2H_CLAYMORE_AVALON', name: 'Mano del Destino', category: 'armas' },
  { id: 'MAIN_SWORD_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- HACHAS ---
  { id: '2H_HALBERD_MORGANA', name: 'Hoja de Morgana', category: 'armas' },
  { id: '2H_SCYTHE_HELL', name: 'Hojas de la Parca', category: 'armas' },
  { id: '2H_DUALAXE_KEEPER', name: 'Garras de Oso', category: 'armas' },
  { id: '2H_AXE_AVALON', name: 'Mano de la Justicia', category: 'armas' },
  { id: '2H_SCYTHE_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- MAZAS ---
  { id: 'MAIN_ROCKMACE_KEEPER', name: 'Piedra del Custodio', category: 'armas' },
  { id: 'MAIN_MACE_HELL', name: 'Insignia de Demonio', category: 'armas' },
  { id: '2H_MACE_MORGANA', name: 'Anillo de Morgana', category: 'armas' },
  { id: '2H_DUALMACE_AVALON', name: 'Engranajes Avaloniaos', category: 'armas' },
  { id: 'MAIN_MACE_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- MARTILLOS ---
  { id: '2H_HAMMER_UNDEAD', name: 'Huesos Antiguos', category: 'armas' },
  { id: '2H_DUALHAMMER_HELL', name: 'Yunque Infernal', category: 'armas' },
  { id: '2H_RAM_KEEPER', name: 'Ariete del Custodio', category: 'armas' },
  { id: '2H_HAMMER_AVALON', name: 'Puño Avaloniao', category: 'armas' },
  { id: '2H_HAMMER_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- GUANTES ---
  { id: '2H_KNUCKLES_KEEPER', name: 'Garras de Oso Esquelético', category: 'armas' },
  { id: '2H_KNUCKLES_HELL', name: 'Cenizas Infernales', category: 'armas' },
  { id: '2H_KNUCKLES_MORGANA', name: 'Cuervo de Morgana', category: 'armas' },
  { id: '2H_KNUCKLES_AVALON', name: 'Fuerza Avalonia', category: 'armas' },
  { id: '2H_KNUCKLES_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- BALLESTAS ---
  { id: '2H_REPEATINGCROSSBOW_UNDEAD', name: 'Mecanismo de Muerto', category: 'armas' },
  { id: '2H_DUALCROSSBOW_HELL', name: 'Pernos Infernales', category: 'armas' },
  { id: '2H_CROSSBOWLARGE_MORGANA', name: 'Piezas de Asedio', category: 'armas' },
  { id: '2H_CROSSBOW_CANNON_AVALON', name: 'Núcleo Avaloniao', category: 'armas' },
  { id: '2H_DUALCROSSBOW_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- ARCOS ---
  { id: '2H_LONGBOW_UNDEAD', name: 'Punta de Flecha del Custodio', category: 'armas' },
  { id: '2H_BOW_HELL', name: 'Restos de Demonio', category: 'armas' },
  { id: '2H_BOW_KEEPER', name: 'Reliquia de Morgana', category: 'armas' },
  { id: '2H_BOW_AVALON', name: 'Fibra Avaloniao', category: 'armas' },
  { id: '2H_BOW_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- DAGAS ---
  { id: 'MAIN_RAPIER_MORGANA', name: 'Cuchilla Inestable', category: 'armas' },
  { id: 'MAIN_DAGGER_HELL', name: 'Estoque de Morgana', category: 'armas' },
  { id: '2H_DUALSICKLE_UNDEAD', name: 'Filos Avalonianos', category: 'armas' },
  { id: '2H_DAGGER_KATAR_AVALON', name: 'Artefacto de Cristal', category: 'armas' },
  { id: '2H_DAGGERPAIR_CRYSTAL', name: 'Puñales Poseídos', category: 'armas' },

  // --- LANZAS ---
  { id: 'MAIN_SPEAR_KEEPER', name: 'Pluma del Custodio', category: 'armas' },
  { id: '2H_HARPOON_HELL', name: 'Arpón Demoníaco', category: 'armas' },
  { id: '2H_TRIDENT_UNDEAD', name: 'Lanza de la Trinidad', category: 'armas' },
  { id: 'MAIN_SPEAR_LANCE_AVALON', name: 'Luz de Avalon', category: 'armas' },
  { id: '2H_GLAIVE_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- VARAS ---
  { id: '2H_COMBATSTAFF_MORGANA', name: 'Vara de Morgana', category: 'armas' },
  { id: '2H_TWINSCYTHE_HELL', name: 'Cuchilla del Segador', category: 'armas' },
  { id: '2H_ROCKSTAFF_KEEPER', name: 'Vástago del Custodio', category: 'armas' },
  { id: '2H_QUARTERSTAFF_AVALON', name: 'Vástago de avaloniano', category: 'armas' },
  { id: '2H_DOUBLEBLADEDSTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- CAMBIAFORMAS ---
  { id: '2H_SHAPESHIFTER_HELL', name: 'Esencia de Luna Sangrienta', category: 'armas' },
  { id: '2H_SHAPESHIFTER_KEEPER', name: 'Corazón de Criatura Infernal', category: 'armas' },
  { id: '2H_SHAPESHIFTER_MORGANA', name: 'Runa Terrenal', category: 'armas' },
  { id: '2H_SHAPESHIFTER_AVALON', name: 'Luz Invocada', category: 'armas' },
  { id: '2H_SHAPESHIFTER_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- NATURALES ---
  { id: 'MAIN_NATURESTAFF_KEEPER', name: 'Semilla de Guardián', category: 'armas' },
  { id: '2H_NATURESTAFF_HELL', name: 'Savia Corrupta', category: 'armas' },
  { id: '2H_NATURESTAFF_KEEPER', name: 'Raíces de Morgana', category: 'armas' },
  { id: 'MAIN_NATURESTAFF_AVALON', name: 'Núcleo de Raíz Férrea', category: 'armas' },
  { id: 'MAIN_NATURESTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- ÍGNEOS ---
  { id: 'MAIN_FIRESTAFF_KEEPER', name: 'Corazón de Incendio', category: 'armas' },
  { id: '2H_FIRESTAFF_HELL', name: 'Piedra de Azufre', category: 'armas' },
  { id: '2H_INFERNOSTAFF_MORGANA', name: 'Llamas de Morgana', category: 'armas' },
  { id: '2H_FIRE_RINGPAIR_AVALON', name: 'Pergamino Avaloniao', category: 'armas' },
  { id: 'MAIN_FIRESTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- SAGRADOS ---
  { id: 'MAIN_HOLYSTAFF_MORGANA', name: 'Símbolo de Bendición', category: 'armas' },
  { id: '2H_HOLYSTAFF_HELL', name: 'Reliquia del Caído', category: 'armas' },
  { id: '2H_HOLYSTAFF_UNDEAD', name: 'Hallows Inmortal', category: 'armas' },
  { id: 'MAIN_HOLYSTAFF_AVALON', name: 'Invocador Divino', category: 'armas' },
  { id: '2H_HOLYSTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- ARCANOS ---
  { id: 'MAIN_ARCANESTAFF_UNDEAD', name: 'Esfera Inmortal', category: 'armas' },
  { id: '2H_ARCANESTAFF_HELL', name: 'Esfera Oculta', category: 'armas' },
  { id: '2H_ENIGMATICORB_MORGANA', name: 'Locus de Morgana', category: 'armas' },
  { id: '2H_ARCANE_RINGPAIR_AVALON', name: 'Sonido del Vacío', category: 'armas' },
  { id: '2H_ARCANESTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- HIELO ---
  { id: 'MAIN_FROSTSTAFF_KEEPER', name: 'Escarcha del Custodio', category: 'armas' },
  { id: '2H_ICEGAUNTLETS_HELL', name: 'Carámbano Infernal', category: 'armas' },
  { id: '2H_ICECRYSTAL_UNDEAD', name: 'Prisma de Hielo', category: 'armas' },
  { id: 'MAIN_FROSTSTAFF_AVALON', name: 'Grito Gélido', category: 'armas' },
  { id: '2H_FROSTSTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- MALDITOS ---
  { id: 'MAIN_CURSEDSTAFF_UNDEAD', name: 'Maldición Inmortal', category: 'armas' },
  { id: '2H_SKULLORB_HELL', name: 'Cráneo Maldito', category: 'armas' },
  { id: '2H_CURSEDSTAFF_MORGANA', name: 'Maldición de Morgana', category: 'armas' },
  { id: 'MAIN_CURSEDSTAFF_AVALON', name: 'Invocador de Sombras', category: 'armas' },
  { id: 'MAIN_CURSEDSTAFF_CRYSTAL', name: 'Artefacto de Cristal', category: 'armas' },

  // --- ARMADURAS (CASCOS) ---
  { id: 'HEAD_PLATE_UNDEAD', name: 'Recipiente de Guardatumbas', category: 'armaduras' },
  { id: 'HEAD_PLATE_HELL', name: 'Aro Infernal', category: 'armaduras' },
  { id: 'HEAD_PLATE_KEEPER', name: 'Aro de Juez', category: 'armaduras' },
  { id: 'HEAD_PLATE_FEY', name: 'Visor de Morgana', category: 'armaduras' },
  { id: 'HEAD_PLATE_AVALON', name: 'Visera de Valor', category: 'armaduras' },
  { id: 'HEAD_LEATHER_MORGANA', name: 'Lentes de Acechador', category: 'armaduras' },
  { id: 'HEAD_LEATHER_HELL', name: 'Fibras de Demonio', category: 'armaduras' },
  { id: 'HEAD_LEATHER_UNDEAD', name: 'Máscara de Espectro', category: 'armaduras' },
  { id: 'HEAD_LEATHER_FEY', name: 'Retazos del Custodio', category: 'armaduras' },
  { id: 'HEAD_LEATHER_AVALON', name: 'Esencia Avalonia', category: 'armaduras' },
  { id: 'HEAD_CLOTH_KEEPER', name: 'Semilla de Guardián', category: 'armaduras' },
  { id: 'HEAD_CLOTH_HELL', name: 'Cuernos de Demonio', category: 'armaduras' },
  { id: 'HEAD_CLOTH_MORGANA', name: 'Pergamino de Morgana', category: 'armaduras' },
  { id: 'HEAD_CLOTH_FEY', name: 'Sello Real', category: 'armaduras' },
  { id: 'HEAD_CLOTH_AVALON', name: 'Esquirlas Avalonia', category: 'armaduras' },

  // --- ARMADURAS (PECHERAS) ---
  { id: 'ARMOR_PLATE_UNDEAD', name: 'Placa de Guardatumbas', category: 'armaduras' },
  { id: 'ARMOR_PLATE_HELL', name: 'Placa Infernal', category: 'armaduras' },
  { id: 'ARMOR_PLATE_KEEPER', name: 'Placa de Juez', category: 'armaduras' },
  { id: 'ARMOR_PLATE_FEY', name: 'Placa de Morgana', category: 'armaduras' },
  { id: 'ARMOR_PLATE_AVALON', name: 'Placa Avalonia', category: 'armaduras' },
  { id: 'ARMOR_LEATHER_MORGANA', name: 'Cuero de Acechador', category: 'armaduras' },
  { id: 'ARMOR_LEATHER_HELL', name: 'Piel Infernal', category: 'armaduras' },
  { id: 'ARMOR_LEATHER_UNDEAD', name: 'Piel de Espectro', category: 'armaduras' },
  { id: 'ARMOR_LEATHER_FEY', name: 'Retazos del Caminanieblas', category: 'armaduras' },
  { id: 'ARMOR_LEATHER_AVALON', name: 'Cuero Avaloniao', category: 'armaduras' },
  { id: 'ARMOR_CLOTH_KEEPER', name: 'Tela del Custodio', category: 'armaduras' },
  { id: 'ARMOR_CLOTH_HELL', name: 'Tela de Demonio', category: 'armaduras' },
  { id: 'ARMOR_CLOTH_MORGANA', name: 'Tela de Morgana', category: 'armaduras' },
  { id: 'ARMOR_CLOTH_FEY', name: 'Sello Real', category: 'armaduras' },
  { id: 'ARMOR_CLOTH_AVALON', name: 'Tela Avalonia', category: 'armaduras' },

  // --- ARMADURAS (BOTAS) ---
  { id: 'SHOES_LEATHER_MORGANA', name: 'Ataduras de Acechador', category: 'armaduras' },
  { id: 'SHOES_LEATHER_HELL', name: 'Suelas de Demonio', category: 'armaduras' },
  { id: 'SHOES_LEATHER_UNDEAD', name: 'Ataduras de Espectro', category: 'armaduras' },
  { id: 'SHOES_LEATHER_FEY', name: 'Piel del Caminanieblas', category: 'armaduras' },
  { id: 'SHOES_LEATHER_AVALON', name: 'Cuero Avaloniao', category: 'armaduras' },
  { id: 'SHOES_PLATE_UNDEAD', name: 'Fijaciones de Guardatumbas', category: 'armaduras' },
  { id: 'SHOES_PLATE_HELL', name: 'Fijaciones de Demonio', category: 'armaduras' },
  { id: 'SHOES_PLATE_KEEPER', name: 'Fijaciones de Juez', category: 'armaduras' },
  { id: 'SHOES_PLATE_FEY', name: 'Fijaciones de Morgana', category: 'armaduras' },
  { id: 'SHOES_PLATE_AVALON', name: 'Placa Avalonia', category: 'armaduras' },

  // --- SECUNDARIAS ---
  { id: 'OFF_TOWERSHIELD_UNDEAD', name: 'Símbolo del Soldado', category: 'secundaria' },
  { id: 'OFF_SHIELD_HELL', name: 'Escudo de Demonio', category: 'secundaria' },
  { id: 'OFF_SPIKEDSHIELD_MORGANA', name: 'Símbolo del Custodio', category: 'secundaria' },
  { id: 'OFF_SHIELD_AVALON', name: 'Símbolo Avaloniao', category: 'secundaria' },
  { id: 'OFF_SHIELD_CRYSTAL', name: 'Artefacto de Cristal', category: 'secundaria' },
  { id: 'OFF_HORN_KEEPER', name: 'Núcleo del Custodio', category: 'secundaria' },
  { id: 'OFF_JESTERCANE_HELL', name: 'Esencia de Demonio', category: 'secundaria' },
  { id: 'OFF_LAMP_UNDEAD', name: 'Vela de Cripta', category: 'secundaria' },
  { id: 'OFF_TALISMAN_AVALON', name: 'Cetro Avaloniao', category: 'secundaria' },
  { id: 'OFF_TORCH_CRYSTAL', name: 'Artefacto de Cristal', category: 'secundaria' },
  { id: 'OFF_ORB_MORGANA', name: 'Ojo de Morgana', category: 'secundaria' },
  { id: 'OFF_DEMONSKULL_HELL', name: 'Cráneo de Demonio', category: 'secundaria' },
  { id: 'OFF_TOTEM_KEEPER', name: 'Raíz del Custodio', category: 'secundaria' },
  { id: 'OFF_CENSER_AVALON', name: 'Incensario Avaloniao', category: 'secundaria' },
  { id: 'OFF_TOME_CRYSTAL', name: 'Artefacto de Cristal', category: 'secundaria' },
];
