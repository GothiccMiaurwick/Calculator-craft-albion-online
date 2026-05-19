const fs = require('fs');
let code = fs.readFileSync('c:/Users/samwi/Desktop/calculadora/src/components/Planner.tsx', 'utf8');

// Convert CRLF to LF for easier regex matching
code = code.replace(/\r\n/g, '\n');

// 1. AppContext imports
code = code.replace(
  '    calculatorPreferences,\n    server,\n  } = useApp();',
  '    calculatorPreferences,\n    server,\n    specialIngredientPrices,\n    updateGlobalPrice,\n    allManualSellPrices,\n    setAllManualSellPrices,\n  } = useApp();'
);

// 2. Remove useEffects that mutate materialPricesSnapshot (around lines 274-371)
const useEffectRegex1 = /  useEffect\(\(\) => \{\n    plannerItems\.forEach\(\(item\) => \{\n[\s\S]*?updatePlannerItem\(item\.id, \{\n        materialsSnapshot: materials,\n        materialPricesSnapshot,\n      \}\);\n    \}\);\n  \}, \[plannerItems, updatePlannerItem, resources, artifactPrices\]\);\n/;
code = code.replace(useEffectRegex1, '');

const useEffectRegex2 = /  useEffect\(\(\) => \{\n    const syncSpecialMaterialPrices = async \(\) => \{\n[\s\S]*?void syncSpecialMaterialPrices\(\);\n  \}, \[plannerItems, updatePlannerItem, resources, artifactPrices, server\]\);\n/;
code = code.replace(useEffectRegex2, '');

// 3. Update plannerRows
const plannerRowsFind = /      const priceSnapshot = pi\.materialPricesSnapshot \|\| \{\};\n      const salePrice = typeof pi\.salePriceSnapshot === 'number' \? pi\.salePriceSnapshot : 0;\n      const calc = calculateCrafting\(\{\n        materials,\n        resources,\n        artifactPrices,\n        priceOverrides: priceSnapshot,\n        marketPrices: priceSnapshot,\n        salePrice,\n        returnRate: pi\.returnRate,\n        taxRate: pi\.taxRate,\n        itemQuantity: pi\.quantity,\n      \}\);/;

const plannerRowsReplace = `      const priceSnapshot = pi.materialPricesSnapshot || {};
      const salePrice = allManualSellPrices[pi.item.id] !== undefined ? allManualSellPrices[pi.item.id] : (typeof pi.salePriceSnapshot === 'number' ? pi.salePriceSnapshot : 0);
      const calc = calculateCrafting({
        materials,
        resources,
        artifactPrices,
        specialIngredientPrices,
        marketPrices: priceSnapshot,
        salePrice,
        returnRate: pi.returnRate,
        taxRate: pi.taxRate,
        itemQuantity: pi.quantity,
      });`;
code = code.replace(plannerRowsFind, plannerRowsReplace);

const breakdownFind = /      const materialBreakdown = materials\.map\(\(mat\) => \{\n        const unitPrice = priceSnapshot\[mat\.id\] \?\? resolvePrice\(mat\.id, resources, artifactPrices, \{\}, priceSnapshot\);/;
const breakdownReplace = `      const materialBreakdown = materials.map((mat) => {
        const unitPrice = resolvePrice(mat.id, resources, artifactPrices, specialIngredientPrices, priceSnapshot);`;
code = code.replace(breakdownFind, breakdownReplace);

// 4. In activeRows map (PLANIFICADOR tab), change salePrice text to input
const salePriceFind = /                    <span className=\{styles\.profitSub\}>\n                      \{row\.salePrice > 0\n                        \? \`\$\{formatCompact\(row\.salePrice, localeCode\)\} \$\{locale === 'es' \? 'c\/u' : 'each'\}\`\n                        : t\(locale, 'noSalePrice'\)\}\n                    <\/span>/;
const salePriceReplace = `                    <div className={styles.profitSubInput}>
                      <FormattedPlannerInput
                        className={styles.cantInput}
                        value={row.salePrice}
                        localeCode={localeCode}
                        onChange={(val) => setAllManualSellPrices(prev => ({ ...prev, [row.item.id]: val }))}
                      />
                    </div>`;
code = code.replace(salePriceFind, salePriceReplace);

// 5. In materialColumns (MATERIALES NECESARIOS tab), add inputs
const qtyFind = /<span className=\{styles\.groupQty\}>\{formatWholeQuantity\(mat\.quantity, localeCode\)\}<\/span>/g;
const qtyReplace = `<div className={styles.groupInputWrap}>
                          <span className={styles.groupQty}>{formatWholeQuantity(mat.quantity, localeCode)}x</span>
                          <FormattedPlannerInput
                            className={styles.matInputInline}
                            value={resolvePrice(mat.id, resources, artifactPrices, specialIngredientPrices, {})}
                            localeCode={localeCode}
                            onChange={(val) => updateGlobalPrice(mat.id, val)}
                          />
                        </div>`;
code = code.replace(qtyFind, qtyReplace);

// Restore CRLF for Windows
code = code.replace(/\n/g, '\r\n');

fs.writeFileSync('c:/Users/samwi/Desktop/calculadora/src/components/Planner.tsx', code);
console.log('Done CRLF fix script!');
