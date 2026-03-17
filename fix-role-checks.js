
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app/api/admin');

// Function to replace role checks in a file
const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = content.replace(/session\.user\?.role !== 'admin'/g, "session.user?.role !== 'ADMIN'");
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
};

// Recursively traverse the directory
const traverseDirectory = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (file.name.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
};

// Start traversing
console.log('Fixing role checks in admin API routes...');
traverseDirectory(apiDir);
console.log('Done!');
