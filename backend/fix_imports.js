const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'modules'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Repositories are at `src/modules/<module>/src/infrastructure/repositories/<repo>.ts`
  // From here to `src/infrastructure` is `../../../../../infrastructure`
  
  // Handlers are at `src/modules/<module>/src/application/commands/<handler>.ts`
  // From here to `src/infrastructure` is `../../../../../infrastructure`

  // Let's just fix any incorrect `infrastructure` imports in `src/modules`
  // A file at depth N from `src` needs N `../` to reach `src`.
  
  const depthFromSrc = file.split('src/modules/')[1].split('/').length;
  // src/modules/identity/src/infrastructure/repositories/PrismaProfileRepository.ts
  // [ 'identity', 'src', 'infrastructure', 'repositories', 'PrismaProfileRepository.ts' ]
  // depth = 5.
  // So it needs 5 `../` to reach `src`. `../../../../../infrastructure`
  
  const correctPrefix = '../'.repeat(depthFromSrc) + 'infrastructure';
  
  // Regex to match any `../` sequence followed by `infrastructure`
  content = content.replace(/(?:\.\.\/)+infrastructure/g, correctPrefix);
  
  // Also fix `identity/src/presentation/guards/JwtAuthGuard` in organization controller
  // src/modules/organization/src/presentation/controllers/OrganizationController.ts
  // depth = 5
  // Needs 5 `../` to reach `src`, then `modules/identity/src/presentation/guards/JwtAuthGuard`
  if (file.includes('OrganizationController.ts')) {
      content = content.replace(/(?:\.\.\/)+identity\/src\/presentation/g, '../../../../../modules/identity/src/presentation');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}
