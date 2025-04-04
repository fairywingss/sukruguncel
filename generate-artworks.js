const fs = require('fs');
const path = require('path');
const frontmatter = require('front-matter');

const artworksDir = path.join(__dirname, 'artworks');
const outputFile = path.join(__dirname, 'artworks.json');

const files = fs.readdirSync(artworksDir).filter(file => file.endsWith('.md'));

const artworksData = files.map(file => {
  const filePath = path.join(artworksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { attributes } = frontmatter(content);

  const categoryPrefixTr = attributes.category === 'resim' ? 'Resim: ' : 'Heykel: ';
  const categoryPrefixEn = attributes.category === 'resim' ? 'Painting: ' : 'Sculpture: ';

  const detailsTrParts = [];
  const detailsEnParts = [];
  if (attributes.material_tr) detailsTrParts.push(attributes.material_tr);
  if (attributes.size_tr) detailsTrParts.push(attributes.size_tr);
  if (attributes.material_en) detailsEnParts.push(attributes.material_en);
  if (attributes.size_en) detailsEnParts.push(attributes.size_en);

  // Eski details_tr ve details_en’i yok sayıp sadece malzeme ve boyuttan oluştur
  attributes.details_tr = detailsTrParts.length > 0 ? `${categoryPrefixTr}${detailsTrParts.join(', ')}` : '';
  attributes.details_en = detailsEnParts.length > 0 ? `${categoryPrefixEn}${detailsEnParts.join(', ')}` : '';

  return attributes;
});

fs.writeFileSync(outputFile, JSON.stringify(artworksData, null, 2), 'utf8');
console.log('artworks.json başarıyla oluşturuldu!');
