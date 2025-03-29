const fs = require('fs');
const path = require('path');
const frontmatter = require('front-matter');

const artworksDir = path.join(__dirname, 'artworks');
const outputFile = path.join(__dirname, 'artworks.json');

// Klasördeki tüm .md dosyalarını oku
const files = fs.readdirSync(artworksDir).filter(file => file.endsWith('.md'));

const artworksData = files.map(file => {
  const filePath = path.join(artworksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { attributes } = frontmatter(content); // Frontmatter'ı parse et
  return attributes;
});

// JSON dosyasına yaz
fs.writeFileSync(outputFile, JSON.stringify(artworksData, null, 2), 'utf8');
console.log('artworks.json başarıyla oluşturuldu!');
