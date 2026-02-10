import fs from 'fs';
import path from 'path';

// Read pokemonsList.js
const filePath = './data/pokemonsList.js';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace each image line with image + shinyImage
const regex = /("image": `\$\{baseURL\}\/assets\/pokemons\/(\d+)\.png`)/g;
const replacement = (match, p1, id) => {
    return `${p1},
        "shinyImage": \`\${baseURL}/assets/pokemons/shiny/${id}.png\``;
};

const newContent = content.replace(regex, replacement);

// Write back to file
fs.writeFileSync(filePath, newContent, 'utf-8');

console.log('✅ All pokemon entries updated with shinyImage field!');

