const fs = require('fs');
const https = require('https');
const path = require('path');

const pets = [
  { name: "westie", url: "https://kuketang.cn/pet-garden/avatar/westie/1.webp" },
  { name: "angora-rabbit", url: "https://kuketang.cn/pet-garden/avatar/angora-rabbit/1.webp" },
  { name: "bichon", url: "https://kuketang.cn/pet-garden/avatar/bichon/1.webp" },
  { name: "curl-ear-rabbit", url: "https://kuketang.cn/pet-garden/avatar/curl-ear-rabbit/1.webp" },
  { name: "koel-duck", url: "https://kuketang.cn/pet-garden/avatar/koel-duck/1.webp" },
  { name: "llama", url: "https://kuketang.cn/pet-garden/avatar/llama/1.webp" },
  { name: "border-collie", url: "https://kuketang.cn/pet-garden/avatar/border-collie/1.webp" },
  { name: "shiba", url: "https://kuketang.cn/pet-garden/avatar/shiba/1.webp" },
  { name: "tiger-striped-cat", url: "https://kuketang.cn/pet-garden/avatar/tiger-striped-cat/1.webp" },
  { name: "garfield", url: "https://kuketang.cn/pet-garden/avatar/garfield/1.webp" },
  { name: "golden-retriever", url: "https://kuketang.cn/pet-garden/avatar/golden-retriever/1.webp" },
  { name: "samoyed", url: "https://kuketang.cn/pet-garden/avatar/samoyed/1.webp" },
  { name: "white-tiger", url: "https://kuketang.cn/pet-garden/avatar/white-tiger/1.webp" },
  { name: "ragdoll-cat", url: "https://kuketang.cn/pet-garden/avatar/ragdoll-cat/1.webp" },
  { name: "unicorn", url: "https://kuketang.cn/pet-garden/avatar/unicorn/1.webp" },
  { name: "succulent-spirit", url: "https://kuketang.cn/pet-garden/avatar/succulent-spirit/1.webp" },
  { name: "husky", url: "https://kuketang.cn/pet-garden/avatar/husky/1.webp" },
  { name: "orange-cat", url: "https://kuketang.cn/pet-garden/avatar/orange-cat/1.webp" },
  { name: "pixiu", url: "https://kuketang.cn/pet-garden/avatar/pixiu/1.webp" },
  { name: "azure-dragon", url: "https://kuketang.cn/pet-garden/avatar/azure-dragon/1.webp" },
  { name: "suanni", url: "https://kuketang.cn/pet-garden/avatar/suanni/1.webp" },
  { name: "red-panda", url: "https://kuketang.cn/pet-garden/avatar/red-panda/1.webp" },
  { name: "vermilion-bird", url: "https://kuketang.cn/pet-garden/avatar/vermilion-bird/1.webp" }
];

const dir = path.join(__dirname, '../public/pets');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

pets.forEach(pet => {
    const file = fs.createWriteStream(path.join(dir, `${pet.name}.webp`));
    https.get(pet.url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();  
            console.log(`Downloaded ${pet.name}.webp`);
        });
    }).on('error', function(err) {
        fs.unlink(path.join(dir, `${pet.name}.webp`));
        console.error(`Error downloading ${pet.name}.webp:`, err.message);
    });
});