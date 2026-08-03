const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');
const patched = source.replace(
  'foojay-resolver-convention").version("0.5.0")',
  'foojay-resolver-convention").version("1.0.0")',
);

if (source !== patched) {
  fs.writeFileSync(target, patched);
  console.log('Patched @react-native/gradle-plugin for Gradle 9 compatibility.');
}
