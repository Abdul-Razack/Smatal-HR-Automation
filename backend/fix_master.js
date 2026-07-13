const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/modules/master', (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix imports
    content = content.replace(/@smatal\/kernel\//g, '../../../../../kernel/');
    content = content.replace(/@smatal\/infrastructure\//g, '../../../../../infrastructure/');
    content = content.replace(/@smatal\/shared\//g, '../../../../../shared/');
    content = content.replace(/@smatal\/modules\/identity\//g, '../../../../identity/');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Fixed master imports');
