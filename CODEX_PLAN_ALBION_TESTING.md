# PLAN DE INSTRUCCIONES PARA CODEX
## Auditoría Exhaustiva: Calculadora & Planner de Crafting — Albion Online
**Versión:** 2.0 (adaptada a Mochi Craft) | **Stack:** React / Next.js 16.2.3 / TypeScript

---

## ⚠️ REGLA CRÍTICA — LEE ESTO PRIMERO

> **NO modifiques el aspecto visual de la página bajo ninguna circunstancia sin permiso explícito del usuario.**
> Esto incluye: colores, tipografías, layouts, estilos CSS, tamaños, posiciones de elementos, íconos decorativos y cualquier otro cambio visual.
> Tu único rol en esta tarea es **encontrar, documentar y reportar errores**. Si encuentras un bug visual que requiera un cambio de estilo para corregirse, detente y consulta primero.

---

## OBJETIVO GENERAL

Realizar una auditoría comparativa completa entre:
- **Página propia** (`mochi-craft.vercel.app` / `localhost:3000`): Calculadora de crafting + Planner ("Taller")
- **Referencia oficial**: **Albion Printer** (`https://printed.albiononline.com`) — esta es la fuente de verdad. NO usar albiononline2d.com.

Debes encontrar y documentar **toda** discrepancia en:
- Cálculos de recursos (cantidades, fórmula de retorno, agregación combinada en totales)
- Crafteos incorrectos o faltantes (recetas de fallback con arquetipos incorrectos)
- Nombres de ítems erróneos (comparar artefactos contra `ARTIFACT_NAME_OVERRIDES_EN` en `src/lib/i18n.ts`)
- Imágenes incorrectas o faltantes (CDN `render.albiononline.com/v1/item/{itemId}.png`)
- Traducciones mal aplicadas (ES por defecto, EN alternativo — archivo `src/lib/i18n.ts`)
- Resultados numéricos erróneos (fórmula `calcEngine.ts:46-58` y agregación en `Planner.tsx materialTotals`)
- Asignación de journals incorrecta (verificar contra `src/lib/journals.ts` y el juego)
- Comportamiento incorrecto con 1 ítem, pocos ítems y muchos ítems
- Persistencia en localStorage (recargar la página con ítems en el planner)

---

## CONTEXTO CRÍTICO DEL PROYECTO (LEER ANTES DE EMPEZAR)

### Arquitectura de datos
- **NO hay archivos JSON/SQLite** con ítems. Los ítems se definen estáticamente en `src/lib/items.ts` (categorías, subcategorías, árbol de ítems).
- **Las recetas** se resuelven con `getFallbackRecipe()` en `src/lib/fallbacks.ts` usando un sistema de arquetipos (SWORD→lingote+cuero, PLATE→lingote, LEATHER→cuero, CLOTH→tela, etc.) con multiplicadores por tipo (1H=8, 2H=10, CHEST=8, HEAD/SHOES=4).
- **También** se intenta fetch a la API de Albion (`/api/proxy/recipe?itemId=...`) pero el fallback local SIEMPRE tiene prioridad si tiene materiales.
- **Los precios de mercado** vienen de `{server}.albion-online-data.com/api/v2/stats/prices/`.

### Fórmulas de cálculo (MUY IMPORTANTE)
- **Fórmula por ítem individual** (`getRequiredPurchaseQuantity` en `src/lib/calcEngine.ts:46-58`):
  ```
  totalQty = perCraft × itemQty - floor((perCraft × itemQty - perCraft) × returnRate/100)
  ```
  donde `perCraft` viene de la receta y `itemQty` es la cantidad a craftear.

- **Agregación combinada para totales del planner** (`materialTotals` en `Planner.tsx`):
  ```
  sumPcQty = Σ(perCraft_i × itemQty_i)
  sumReducible = Σ(perCraft_i × (itemQty_i - 1))
  totalQty = sumPcQty - floor(sumReducible × returnRate/100)
  ```
  Se agrupa por `(material_id, returnRate)`. Esta es la fórmula que usa **Albion Printer** para los totales. NO es la suma de los valores individuales.

- Diferencia clave: `Σ(rawQty_i - pc_i) = Σ(pc_i × (qty_i - 1))` vs `rawQty_total - pc`. La primera es la correcta.

### Return Rates comunes
- 24.8% (espec 100/100 sin focus)
- 37.6% (espec 100/100 con focus en el item específico)
- 15.2% (espec 0/100)
- Probar SIEMPRE con 24.8% Y 37.6% para cada ítem.

### Materiales
- Solo 4 recursos básicos: **Tela** (CLOTH), **Lingote** (STEEL/METALBAR), **Tablas** (PLANKS), **Cuero** (LEATHER)
- **Artefactos** (ARTEFACT_*): 1 por ítem faccionado
- **Ingredientes especiales** (ALCHEMY_RARE): Para shapeshifters
- **Skillbooks** (SKILLBOOK_STANDARD): Para bolsas especiales
- **NO hay sub-recetas ni componentes intermedios** — los materiales son siempre recursos crudos.

### Journals
- Asignación en `src/lib/journals.ts`: BLACKSMITH (guerrero), IMBUER (mago), FLETCHER (cazador), TINKER (herreros)
- Verificar que el tipo de journal coincide con el tipo de arma/armadura:
  - Armadura tela → IMBUER, Armadura cuero → FLETCHER, Armadura placa → BLACKSMITH
  - Bastones mágicos → IMBUER, Arcos/Dagas/Lanzas → FLETCHER, Armas cuerpo a cuerpo → BLACKSMITH
  - Ballestas → BLACKSMITH (NO Fletcher — esto ya fue corregido)

### Nombres de artefactos
- Español: desde `ARTIFACT_BASE_DATA` en `src/lib/artifacts.ts`
- Inglés: desde `ARTIFACT_NAME_OVERRIDES_EN` en `src/lib/i18n.ts` (~120 nombres correctos del juego inglés)
- Verificar que los nombres en inglés coinciden con los del juego (ej: "Imbued Leather Folds" no "Stalker Jacket Artifact")

### Imágenes
- CDN: `https://render.albiononline.com/v1/item/{itemId}.png`
- Los itemId usan formato como `T4_ARMOR_LEATHER_MORGANA` (sin enchant en la URL)
- Verificar que las imágenes carguen correctamente

### Temas
- 3 temas: Mochi (default), Midnight (dark), Matcha (verde)
- Aplicados mediante clase CSS en `<html>`, gestionados por `ThemeClient.tsx`
- Todo el CSS usa variables (`var(--color-bg)`, etc.)

### Vistas de la app
- **Home**: Search + Calculator view (cuando se selecciona un ítem)
- **Taller** (Planner): Planificador de sesiones de crafting
- **Database** (`/database`): Precios de recursos, artefactos, journals, specs
- **SpecialtyTools**: Refinador, Encantador, Cocina

---

## PASO 0 — RECONOCIMIENTO DEL PROYECTO (WINDOWS)

```powershell
# 1. Estructura del proyecto (PowerShell)
Get-ChildItem -Path src -Recurse -File | Where-Object { $_.Extension -match '\.(ts|tsx|js|json)$' } | Select-Object FullName | Sort-Object FullName

# 2. Archivos de lógica de cálculo
Select-String -Path "src/**/*.ts", "src/**/*.tsx" -Pattern "craft|recipe|resource|material|calculate|calc" -List

# 3. Leer archivos clave (ED itáblalos con Read tool)
```

### Archivos clave a leer (NO modificar):
| Archivo | Propósito |
|---------|-----------|
| `src/lib/items.ts` | Definición de ítems, categorías, IDs |
| `src/lib/fallbacks.ts` | Sistema de recetas fallback (arquetipos, overrides) |
| `src/lib/calcEngine.ts` | Motor de cálculo financiero |
| `src/lib/i18n.ts` | Traducciones y nombres de ítems |
| `src/lib/journals.ts` | Asignación de journals y progreso |
| `src/lib/api.ts` | Fetch de precios y recetas |
| `src/lib/AppContext.tsx` | Estado global y persistencia |
| `src/components/Planner.tsx` | Componente del planner (contiene `materialTotals`) |
| `src/lib/artifacts.ts` | Datos base de artefactos |

---

## PASO 1 — SETUP

```bash
# En Windows (cmd, no PowerShell por execution policy):
cd C:\Users\samwi\Desktop\calculadora
npm install
npm run dev
# Abrir http://localhost:3000 en el browser
```

---

## PASO 2 — INVENTARIO DE ÍTEMS

Los ítems están en `src/lib/items.ts`. Las categorías principales son:

| # | Sección | Arquetipo | Materiales típicos |
|---|---------|-----------|-------------------|
| 1 | Espadas (SWORD) | lingote + cuero | 8-16 lingote + 8-12 cuero |
| 2 | Hachas (AXE) | lingote + tablas | 8-16 lingote + 8-12 tablas |
| 3 | Mazas (MACE) | lingote + tela | 8-16 lingote + 8-12 tela |
| 4 | Martillos (HAMMER) | lingote + tela | 8-16 lingote + 8-12 tela |
| 5 | Dagas (DAGGER) | lingote + cuero | 8-12 lingote + 8-12 cuero |
| 6 | Arcos (BOW) | tablas (solo primary 2H) | 32 tablas |
| 7 | Ballestas (CROSSBOW) | tablas + lingote | 16-20 tablas + 8-12 lingote |
| 8 | Lanzas (SPEAR) | tablas + lingote | 16-20 tablas + 8-12 lingote |
| 9 | Bastones (STAFF) | tablas + lingote | 16-20 tablas + 8-12 lingote |
| 10 | Varas (QUARTERSTAFF) | cuero + lingote | 16-20 cuero + 8-12 lingote |
| 11 | Guantes (WARGLOVES) | cuero + lingote | 16-20 cuero + 8-12 lingote |
| 12 | Shapeshifter | tablas + cuero | 16-20 tablas + 8-12 cuero |
| 13 | Armadura torso (ARMOR) | depende (PLATE/LEATHER/CLOTH) | 16 del material primario |
| 14 | Cascos (HEAD) | depende | 8 del material primario |
| 15 | Botas (SHOES) | depende | 8 del material primario |
| 16 | Escudos (OFF_SHIELD) | lingote + tablas | 4-8 lingote + 4-8 tablas |
| 17 | Libros (OFF_BOOK) | tela + cuero | 4-8 tela + 4-8 cuero |
| 18 | Antorchas (OFF_TORCH) | tablas + tela | 4-8 tablas + 4-8 tela |
| 19 | Bolsas (BAG) | tela + cuero | 8 tela + 8 cuero |
| 20 | Capas (CAPE) | tela | 8-16 tela |

**NOTA**: Los ítems faccionados (MORGANA, KEEPER, HELL, UNDEAD, AVALON, FEY, CRYSTAL) llevan 1 artefacto adicional y shapeshifters llevan 2 ingredientes especiales.

---

## PASO 3 — METODOLOGÍA DE PRUEBAS (ADAPTADA)

### 3.1 — Pruebas por ítem individual

Para cada ítem, probar en **Albion Printer** Y en **Mochi Craft**:

1. Abrir Albion Printer → seleccionar ítem → ingresar cantidad y RR
2. Abrir Mochi Craft → mismo ítem → misma cantidad y RR
3. Comparar materiales (cantidad y tipo)

| ID | Prueba | RR a usar |
|----|--------|-----------|
| T01 | Cantidad = 1 | 24.8% |
| T02 | Cantidad = 2 | 24.8% |
| T03 | Cantidad = 5 | 24.8% |
| T04 | Cantidad = 10 | 24.8% |
| T05 | Cantidad = 50 | 24.8% |
| T06 | Cantidad = 100 | 24.8% |
| T07 | Cantidad = 1 | 37.6% |
| T08 | Cantidad = 10 | 37.6% |
| T09 | Cantidad = 100 | 37.6% |
| T10 | Tier mínimo disponible | 24.8% |
| T11 | Tier máximo disponible (T8) | 24.8% |
| T12 | Enchantment .1, cantidad 10 | 24.8% |
| T13 | Enchantment .2, cantidad 10 | 24.8% |
| T14 | Enchantment .3, cantidad 10 | 24.8% |
| T15 | Enchantment .0, cantidad 999 | 24.8% |

### 3.2 — Fórmula a verificar por ítem

Para CADA ítem, verificar que el cálculo individual coincida:

```
rawQty = perCraft × quantity
reducible = perCraft × (quantity - 1)
totalQty = rawQty - floor(reducible × RR/100)
```

Donde `perCraft` viene de la receta (archivo `fallbacks.ts`). Verificar que la receta en el código coincida con Albion Printer.

### 3.3 — Verificación de agregación combinada (CRÍTICO)

Cuando 2+ ítems en el planner usan el **mismo material** con el **mismo RR**, el total NO debe ser la suma de los valores individuales. Debe usar:

```
sumPcQty = Σ(perCraft_i × quantity_i)
sumReducible = Σ(perCraft_i × (quantity_i - 1))
total = sumPcQty - floor(sumReducible × RR/100)
```

Ejemplo concreto para verificar:
- **Stalker Jacket T5.0 qty=100 RR=37.6%** → 1,005 cuero T5.0
- **Hellion Jacket T5.0 qty=50 RR=37.6%** → 506 cuero T5.0
- **Suma individual**: 1,511
- **Total correcto (agregación combinada)**: `2400 - floor(2368 × 0.376)` = **1,510**
- Si el total muestra 1,511 → ERROR: está sumando individuales en vez de usar agregación combinada
- Si el total muestra 1,504 → ERROR: está usando `2400 - floor((2400-16) × 0.376)` (fórmula incorrecta)

---

## PASO 4 — PRUEBAS ESPECÍFICAS POR SECCIÓN

Para cada sección (mínimo 20 pruebas):

| ID | Prueba | Cómo verificarlo |
|----|--------|-----------------|
| S01 | Agregar TODOS los ítems de la sección al planner | Ver recetas en código vs Albion Printer |
| S02 | Mezclar tiers (T4 + T6 + T8) del mismo tipo | Verificar que materiales cambian de tier |
| S03 | 10 unidades de cada ítem simultáneamente | Verificar agregación combinada entre ítems del mismo material |
| S04 | Agregar 1, luego 50, luego volver a 1 | Ver recalcular cantidades |
| S05 | Eliminar ítem del medio | Verificar que totales se recalculan |
| S06 | Duplicar ítems con mismo material y RR | Verificar agregación combinada |
| S07 | Limpiar y recargar | Verificar persistencia localStorage |
| S08 | Cambiar RR de 24.8% a 37.6% en un ítem | Verificar que cambia el total (NO debe agrupar con otros RR) |
| S09 | Suma de totales vs suma manual de individuales | Verificar fórmula de agregación combinada |
| S10 | Cambiar todos a T8 .3 cantidad 100 | Stress test |
| S11 | Recargar página con ítems en planner | Ver persistencia |
| S12 | Marcar ítem como completado (`isDone`) | Verificar que se filtra de `activeRows` y totales cambian |
| S13 | Verificar imágenes de TODOS los ítems | CDN render.albiononline.com |
| S14 | Verificar nombres vs Albion Printer | Atención especial a artefactos |
| S15 | Verificar traducciones al inglés | Cambiar locale a 'en' en AppContext |
| S16 | Buscar ítem inexistente | Manejo de error |
| S17 | Cantidad = 0 | No debe mostrar resultados absurdos |
| S18 | Cantidad negativa o texto | Validación de input |
| S19 | Black Market ON vs OFF | Verificar que cambia el cálculo (BM tiene tax diferente?) |
| S20 | Focus ON vs OFF | Verificar que cambia el RR o el cálculo de focus cost |

---

## PASO 5 — VERIFICACIÓN DE RECETAS (NO HAY BASE DE DATOS)

No hay archivos JSON/SQLite. Las recetas están en `src/lib/fallbacks.ts`:

```bash
# Verificar recetas definidas
# 1. RESOURCE_RECIPE_OVERRIDES: Recetas específicas para ciertos ítems
grep -n "MAIN_\|2H_\|ARMOR_\|HEAD_\|SHOES_\|OFF_\|BAG" src/lib/fallbacks.ts | head -50

# 2. ARCHETYPES: Mapeo de tipos a materiales
grep -A1 "ARCHETYPES:" src/lib/fallbacks.ts

# 3. KEYWORD_MAP: Normalización de nombres de ítems
grep -A10 "KEYWORD_MAP" src/lib/fallbacks.ts
```

### Pruebas de recetas:

| ID | Prueba | Método |
|----|--------|--------|
| R01 | Verificar que cada arquetipo produce los materiales correctos | Para cada ARCHETYPE, verificar primary y secondary contra Albion Printer |
| R02 | Verificar multiplicadores por tipo | 1H=8, 2H=10, CHEST=8, HEAD/SHOES=4, OFF=4 |
| R03 | Verificar que `MAIN_HAMMER` usa 24 lingote (override) | Contra Albion Printer |
| R04 | Verificar que `2H_BOW` usa 32 tablas (override) | Contra Albion Printer |
| R05 | Verificar que `ARMOR_LEATHER_*` usa 16 cuero | Contra Albion Printer (chest = 8×2) |
| R06 | Verificar que `ARMOR_PLATE_*` usa 16 lingote | Contra Albion Printer |
| R07 | Verificar que `ARMOR_CLOTH_*` usa 16 tela | Contra Albion Printer |
| R08 | Verificar que `HEAD_*` usa 8 del material primario | head/shoes = 4×2 |
| R09 | Verificar que items 2H tienen secondary=12 | `baseId.includes('2H') ? 12 : multiplier * SECONDARY_UNITS` |
| R10 | Verificar que items con facción tienen 1 artefacto | Buscar `ARTEFACT_${baseId}` |
| R11 | Verificar que shapeshifters tienen 2 ingredientes especiales | Buscar `ALCHEMY_RARE` |
| R12 | Verificar bags: 8 tela + 8 cuero | BAG override |

---

## PASO 6 — VERIFICACIÓN DE JOURNALS

El archivo `src/lib/journals.ts` asigna journals. Verificar:

| ID | Prueba | Resultado esperado |
|----|--------|-------------------|
| J01 | Armadura tela (ej: Cloth Robe) | IMBUER / Mage |
| J02 | Armadura cuero (ej: Stalker Jacket) | FLETCHER / Hunter |
| J03 | Armadura placa (ej: Plate Armor) | BLACKSMITH / Warrior |
| J04 | Bastón de fuego (Fire Staff) | IMBUER / Mage |
| J05 | Arco (Bow) | FLETCHER / Hunter |
| J06 | Espada (Sword) | BLACKSMITH / Warrior |
| J07 | Daga (Dagger) | FLETCHER / Hunter |
| J08 | Ballesta (Crossbow) | BLACKSMITH / Warrior (NO Fletcher) |
| J09 | Martillo (Hammer) | BLACKSMITH / Warrior |
| J10 | Hacha (Axe) | BLACKSMITH / Warrior |
| J11 | Lanza (Spear) | FLETCHER / Hunter |
| J12 | Bastón sagrado (Holy Staff) | IMBUER / Mage |
| J13 | Bastón de maldición (Curse Staff) | IMBUER / Mage |
| J14 | Bastón arcano (Arcane Staff) | IMBUER / Mage |
| J15 | Bastón de hielo (Frost Staff) | IMBUER / Mage |
| J16 | Vara (Quarterstaff) | FLETCHER / Hunter |
| J17 | Guantes (Wargloves) | BLACKSMITH / Warrior |
| J18 | Escudo (Shield) | BLACKSMITH / Warrior |
| J19 | Antorcha (Torch) | FLETCHER / Hunter |
| J20 | Libro (Tome/Book) | IMBUER / Mage |
| J21 | Bolsa (Bag) | TINKER / Tinker |
| J22 | Capa (Cape) | TINKER / Tinker |

---

## PASO 7 — PRUEBAS DE STRESS Y CASOS EXTREMOS

```
PRUEBA EXTREMA 1: 9 items del usuario real
- Stalker Jacket T5.0 qty=100 RR=37.6%
- Stalker Jacket T5.1 qty=50 RR=37.6%
- Stalker Jacket T6.0 qty=50 RR=37.6%
- Hellion Jacket T5.0 qty=50 RR=37.6%
- Hellion Jacket T6.0 qty=50 RR=37.6%
- Fiend Sandals T5.0 qty=100 RR=24.8%
- Fiend Sandals T6.0 qty=60 RR=24.8%
- Light Crossbow T5.1 qty=100 RR=24.8%
- Weeping Repeater T5.1 qty=60 RR=24.8%

Totales esperados (contra Albion Printer):
- Cuero T5.0: 1,510
- Cuero T5.1: 506
- Cuero T6.0: 1,011
- Tela T5.0: 604
- Tela T6.0: 363
- Tablones T5.1: 2,115
- Acero T5.1: 1,148

PRUEBA EXTREMA 2: 50 items mezclados
- 1 de cada tipo de arma + armadura
- T8 .3 cantidad 100 cada uno
- Verificar que no crashea ni congela

PRUEBA EXTREMA 3: Mismo ítem 3 veces con mismo RR
- Agregar Stalker Jacket T5.0 qty=50 RR=37.6% tres veces
- Total cuero T5.0 debe ser: 2400 - floor(2352 × 0.376) = 2400 - 884 = 1,516
  (donde sumPcQty = 800×3=2400, sumReducible = 784×3=2352)
- No debe ser: 506×3 = 1,518 (suma de individuales) ni 2400 - floor((2400-16)×0.376) = 1,504

PRUEBA EXTREMA 4: Diferentes RR para mismo material
- Stalker Jacket T5.0 qty=50 RR=37.6%
- Stalker Jacket T5.0 qty=50 RR=24.8%
- Deben calcularse como DOS grupos separados y SUMARSE los resultados
- Total = (800 - floor(784×0.376)) + (800 - floor(784×0.248)) = 506 + 606 = 1,112
- NO debe agruparlos en una sola fórmula

PRUEBA EXTREMA 5: un ítem de cada facción (MORGANA, KEEPER, HELL, UNDEAD, AVALON, FEY, CRYSTAL)
- Verificar que cada uno tiene su artefacto correspondiente
- Verificar nombres de artefactos en inglés
```

---

## PASO 8 — VERIFICACIÓN DE NOMBRES E IMÁGENES

### Nombres de ítems:
- Español: desde `TreeItem.name` en `items.ts` + `getItemName(item, 'es')`
- Inglés: desde `ITEM_NAME_OVERRIDES_EN` en `i18n.ts:573-798`
- Artefactos español: `ARTIFACT_BASE_DATA` en `artifacts.ts`
- Artefactos inglés: `ARTIFACT_NAME_OVERRIDES_EN` en `i18n.ts`

### Nombres a verificar ESPECÍFICAMENTE (problemas conocidos):
| ID del ítem | Español | Inglés (juego) |
|-------------|---------|----------------|
| ARMOR_LEATHER_MORGANA | Chaqueta de Vándalo | Hellion Jacket |
| ARMOR_LEATHER_KEEPER | Chaqueta de Acechador | Stalker Jacket |
| SHOES_CLOTH_MORGANA | Sandalias de Diablo | Fiend Sandals |
| 2H_CROSSBOWLIGHT_UNDEAD | Repetidora de Desconsuelo | Weeping Repeater |
| 2H_CROSSBOWLIGHT | Ballesta Ligera (1h) | Light Crossbow |

### Imágenes:
- URL: `https://render.albiononline.com/v1/item/{itemId}.png`
- itemId usa formato: `T{TIER}_{BASEID}` (sin enchant en la URL)
- Ejemplo: `T4_ARMOR_LEATHER_MORGANA`
- Verificar que NO tienen `@0` en la URL

### Checklist visual por ítem:
- [ ] La imagen mostrada corresponde al ítem
- [ ] La imagen carga (no hay broken image)
- [ ] El nombre en pantalla coincide con Albion Printer
- [ ] El nombre está en el idioma correcto
- [ ] No hay caracteres extraños, HTML escapado, o texto truncado
- [ ] Los artefactos muestran nombres del juego (ej: "Imbued Leather Folds", no "Stalker Jacket Artifact")

---

## PASO 9 — FORMATO DEL INFORME FINAL

Usar el mismo formato del plan original. Incluir para cada error:
1. El ítem exacto (tier, enchant, cantidad, RR)
2. El valor esperado (Albion Printer)
3. El valor actual (Mochi Craft)
4. La diferencia
5. La posible causa (fórmula, receta, agregación, nombre, etc.)

---

## PASO 10 — NOTAS ADICIONALES ESPECÍFICAS DEL PROYECTO

1. **La referencia oficial es SIEMPRE Albion Printer** (`https://printed.albiononline.com`). NO albiononline2d.com.
2. **Probar con RR 24.8% y 37.6%** para cada ítem. Son los valores más usados.
3. **La agregación combinada** es el punto más crítico. Cuando 2+ ítems usan el mismo material con el mismo RR, el total NO es la suma de individuales.
4. **No hay sub-recetas** — los materiales son siempre recursos crudos (tela, lingote, tablas, cuero) o artefactos/ingredientes especiales.
5. **Los multiplicadores de recetas**: 1H=8, 2H=10, CHEST=8, HEAD/SHOES=4, OFF=4. PRIMARY_UNITS=2, SECONDARY_UNITS=1.
6. **Las imágenes** vienen del CDN de Albion, no hay archivos locales de imágenes.
7. **Los nombres de artefactos en inglés** deben coincidir con el juego (ej: "Imbued Leather Folds", "Demonhide Leather", "Lost Crossbow Mechanism").
8. **Ballestas** deben usar BLACKSMITH Journal, NO Fletcher (corregido en `journals.ts:64`).
9. **Focus cost** se calcula pero el usuario no lo ha validado contra Albion Printer todavía — priorizar materiales.
10. **El planner tiene `isDone`** para marcar ítems completados — los ítems con isDone=true NO deben aparecer en los totales.
11. **Si el build falla** después de cualquier cambio, reportar el error de compilación.
12. **No modificar nada visual** sin permiso explícito.
13. **Si un error requiere cambio de código**, documentarlo en el informe pero NO corregirlo sin confirmación del usuario.
