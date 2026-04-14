const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(!area\) \{\s*area = await Area\.create\(\{ name: '([^']+)', region_id: region\.id \}\);\s*\}/g;

const replacement = `if (!area) {
        let number = 1;
        while (await Area.findOne({ where: { number } })) { number++; }
        area = await Area.create({ name: '$1', region_id: region.id, number });
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code);
console.log('Replaced correctly');
