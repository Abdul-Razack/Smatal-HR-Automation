const fs = require('fs');
const glob = require('glob'); // Not available? I'll use child_process
const { execSync } = require('child_process');

const files = execSync('find src/modules -name "*Controller.ts" -type f').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  // replace @Controller('api/v1/...') or @Controller('v1/...') with @Controller('...')
  content = content.replace(/@Controller\(['"](?:api\/)?v1\/(.+?)['"]\)/g, "@Controller('$1')");
  fs.writeFileSync(file, content);
}
console.log('Fixed controllers!');
