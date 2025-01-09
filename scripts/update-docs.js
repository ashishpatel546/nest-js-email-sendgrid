const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const DOCS_PATH = path.join(__dirname, '..', 'docs', 'classes', 'SendgridService.md');

try {
  // Create README.md if it doesn't exist
  if (!fs.existsSync(README_PATH)) {
    fs.writeFileSync(README_PATH, '# Blink NestJS SendGrid Integration\n\n<!-- DOCUMENTATION_START -->\n<!-- DOCUMENTATION_END -->');
  }

  const readme = fs.readFileSync(README_PATH, 'utf8');
  const docs = fs.readFileSync(DOCS_PATH, 'utf8');

  const updatedReadme = readme.replace(
    /<!-- DOCUMENTATION_START -->[\s\S]*<!-- DOCUMENTATION_END -->/,
    '<!-- DOCUMENTATION_START -->\n' + docs + '\n<!-- DOCUMENTATION_END -->'
  );

  fs.writeFileSync(README_PATH, updatedReadme);
  console.log('Documentation updated successfully!');
} catch (error) {
  console.error('Error updating documentation:', error);
  process.exit(1);
}
