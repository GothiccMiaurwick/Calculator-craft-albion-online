# Fix: Carving Sword recipe in fallbacks.ts

## Problema
`getFallbackRecipe` para Carving Sword T8 devuelve 16 steel + 8 leather (receta genérica SWORD 1H).
La receta correcta es 20 steel + 12 leather + 1 artifact.
El artifact nunca se inyecta porque la lógica actual solo lo hace para items faction.

## Cambios

### 1. Agregar MAIN_CARVINGSWORD a RESOURCE_RECIPE_OVERRIDES
**Archivo:** `src/lib/fallbacks.ts`
**Después de** `MAIN_HAMMER: [{ resource: 'lingote', quantity: 24 }],` (línea 87)
```typescript
  MAIN_CARVINGSWORD: [
    { resource: 'lingote', quantity: 20 },
    { resource: 'cuero', quantity: 12 },
  ],
```

### 2. Agregar ARTIFACT_ITEM_MAP constante
**Archivo:** `src/lib/fallbacks.ts`
**Después de** `RESOURCE_RECIPE_OVERRIDES` (antes de la línea 298)
```typescript
// Non-faction artifact items that need artifact injection
const ARTIFACT_ITEM_MAP: Record<string, string> = {
  MAIN_CARVINGSWORD: 'ARTEFACT_MAIN_CARVINGSWORD',
};
```

### 3. Inyectar artifact en getFallbackRecipe
**Archivo:** `src/lib/fallbacks.ts`
**Después de** la inyección de artifact faction (después de línea 412, cierra el bloque del faction artifact injection)
```typescript

  // Non-faction artifact items
  const artifactItemId = ARTIFACT_ITEM_MAP[baseId];
  if (artifactItemId) {
    materials.push({
      id: normalizeId(`T${tier}_${artifactItemId}${enchantSuffix}`),
      quantity: 1,
    });
  }
```

## Verificación esperada

Con Carving Sword T8 × 20 + Mace T4.1 × 348 (ambos RR 24.8%):

| Item | Investment actual (buggy) | Investment con fix |
|------|--------------------------|-------------------|
| Carving Sword | ~407,283 (sin artifact, qty mal) | 2,549,321 |
| Mace T4.1 | 3,358,083 | 3,358,083 |
| **Total** | **3,765,366** | **5,907,404** |
| **Target** | — | **5,921,336** |

Diferencia residual: -13,932 (0.24%). Posible causa: precio del artifact ligeramente distinto.
