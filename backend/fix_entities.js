const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'modules', 'organization', 'src', 'domain', 'entities');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && !f.includes('spec'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('get createdBy()')) {
    // find 'get updatedAt(): Date' and insert after
    const getUpdatedAt = 'get updatedAt(): Date { return this.props.updatedAt; }';
    if (content.includes(getUpdatedAt)) {
      content = content.replace(getUpdatedAt, `${getUpdatedAt}\n  get createdBy(): string { return this.props.createdBy; }\n  get updatedBy(): string { return this.props.updatedBy; }`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
}
