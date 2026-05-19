const fs = require('fs');
let code = fs.readFileSync('c:/Users/samwi/Desktop/calculadora/src/components/Calculator.tsx', 'utf8');

// 1. AppContext imports
code = code.replace(
  'calculatorPreferences,\n    setCalculatorPreferences,\n  } = useApp();',
  'calculatorPreferences,\n    setCalculatorPreferences,\n    allManualSellPrices,\n    setAllManualSellPrices,\n    specialIngredientPrices,\n    updateGlobalPrice,\n  } = useApp();'
);

// 2. Remove local states
code = code.replace(
  /  const \[itemOverrides, setItemOverrides\] = useState<Record<string, Record<string, number>>>\(\{\}\);\n/g,
  ''
);
code = code.replace(
  /  const \[allManualSellPrices, setAllManualSellPrices\] = useState<Record<string, number>>\(\{\}\);\n/g,
  ''
);

// 3. Remove localStorage logic
const storageRegex = /  const STORAGE_KEY = 'albion_calculator_manual_data_v2_albion_printer_match';\n\n  \/\/ 1\. Hydrate from LocalStorage on mount\n  useEffect\(\(\) => \{\n    const data = localStorage\.getItem\(STORAGE_KEY\);\n    if \(data\) \{\n      try \{\n        const parsed = JSON\.parse\(data\);\n        if \(parsed\.overrides\) setItemOverrides\(parsed\.overrides\);\n        if \(parsed\.sellPrices\) setAllManualSellPrices\(parsed\.sellPrices\);\n      \} catch \(e\) \{\n        console\.error\("Failed to hydrate prices", e\);\n      \}\n    \}\n  \}, \[\]\);\n\n  \/\/ 2\. Persist to LocalStorage on change\n  useEffect\(\(\) => \{\n    const data = \{\n      overrides: itemOverrides,\n      sellPrices: allManualSellPrices\n    \};\n    localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(data\)\);\n  \}, \[itemOverrides, allManualSellPrices\]\);\n/;
code = code.replace(storageRegex, '');

// 4. Fix useMemos and references
code = code.replace(/    const overrides = itemOverrides\[selectedItem\.id\] \|\| \{\};\n/g, '');
code = code.replace(/const overrides = itemOverrides\[selectedItem\?\.id \|\| ''\] \|\| \{\};\n/g, '');
code = code.replace(/const itemOvr = itemOverrides\[selectedItem\.id\] \|\| \{\};\n/g, '');

code = code.replace(/priceOverrides: overrides,/g, 'specialIngredientPrices: specialIngredientPrices,');
code = code.replace(/, itemOverrides,/g, ', specialIngredientPrices,');

code = code.replace(/const isOverridden = itemOvr\[mat\.id\] !== undefined;/g, 'const isOverridden = false;');

code = code.replace(
  /setItemOverrides\(prev => \(\{\n                              \.\.\.prev,\n                              \[selectedItem\.id\]: \{\n                                \.\.\.\(prev\[selectedItem\.id\] \|\| \{\}\),\n                                \[mat\.id\]: val\n                              \}\n                            \}\)\);/g,
  'updateGlobalPrice(mat.id, val);'
);

code = code.replace(
  /overrides\[mat\.id\] !== undefined\n                \? Number\(overrides\[mat\.id\]\) \|\| 0\n                : resolvePrice\(mat\.id, resources, artifactPrices, \{\}, allMarketPrices\);/g,
  'resolvePrice(mat.id, resources, artifactPrices, specialIngredientPrices, allMarketPrices);'
);

fs.writeFileSync('c:/Users/samwi/Desktop/calculadora/src/components/Calculator.tsx', code);
console.log('Done!');
