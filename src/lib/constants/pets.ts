export const PET_CATEGORIES = [
  { id: "mythical", name: "国风神兽", emoji: "🐉", pets: ["青龙", "朱雀", "貔貅", "独角兽", "白虎", "狻猊"] },
  { id: "wilderness", name: "绿野部落", emoji: "🌳", pets: ["安哥拉兔", "垂耳兔", "柯尔鸭", "羊驼", "多肉精灵"] },
  { id: "dogs", name: "萌犬天团", emoji: "🐕", pets: ["西高地", "比熊", "边牧", "柴犬", "金毛", "萨摩耶", "哈士奇"] },
  { id: "cats", name: "软萌喵星", emoji: "🐱", pets: ["虎斑猫", "加菲猫", "布偶猫", "橘猫"] },
  { id: "mountains", name: "山海灵宠", emoji: "⛰️", pets: ["小熊猫"] },
  { id: "zodiac", name: "生肖萌宝", emoji: "🐭", pets: [] },
  { id: "aquatic", name: "水中伙伴", emoji: "🐠", pets: [] },
];

export const PET_IMAGES = [
  { name: "西高地", imageUrl: "/pets/westie.webp", category: "dogs" },
  { name: "安哥拉兔", imageUrl: "/pets/angora-rabbit.webp", category: "wilderness" },
  { name: "比熊", imageUrl: "/pets/bichon.webp", category: "dogs" },
  { name: "垂耳兔", imageUrl: "/pets/curl-ear-rabbit.webp", category: "wilderness" },
  { name: "柯尔鸭", imageUrl: "/pets/koel-duck.webp", category: "wilderness" },
  { name: "羊驼", imageUrl: "/pets/llama.webp", category: "wilderness" },
  { name: "边牧", imageUrl: "/pets/border-collie.webp", category: "dogs" },
  { name: "柴犬", imageUrl: "/pets/shiba.webp", category: "dogs" },
  { name: "虎斑猫", imageUrl: "/pets/tiger-striped-cat.webp", category: "cats" },
  { name: "加菲猫", imageUrl: "/pets/garfield.webp", category: "cats" },
  { name: "金毛", imageUrl: "/pets/golden-retriever.webp", category: "dogs" },
  { name: "萨摩耶", imageUrl: "/pets/samoyed.webp", category: "dogs" },
  { name: "白虎", imageUrl: "/pets/white-tiger.webp", category: "mythical" },
  { name: "布偶猫", imageUrl: "/pets/ragdoll-cat.webp", category: "cats" },
  { name: "独角兽", imageUrl: "/pets/unicorn.webp", category: "mythical" },
  { name: "多肉精灵", imageUrl: "/pets/succulent-spirit.webp", category: "wilderness" },
  { name: "哈士奇", imageUrl: "/pets/husky.webp", category: "dogs" },
  { name: "橘猫", imageUrl: "/pets/orange-cat.webp", category: "cats" },
  { name: "貔貅", imageUrl: "/pets/pixiu.webp", category: "mythical" },
  { name: "青龙", imageUrl: "/pets/azure-dragon.webp", category: "mythical" },
  { name: "狻猊", imageUrl: "/pets/suanni.webp", category: "mythical" },
  { name: "小熊猫", imageUrl: "/pets/red-panda.webp", category: "mountains" },
  { name: "朱雀", imageUrl: "/pets/vermilion-bird.webp", category: "mythical" },
];

export const PET_EMOJIS = ["🐱", "🐶", "🐰", "🦊", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐉", "🦆", "🦉", "🐧", "🐦"];

export function getRandomPetImage() {
  const randomIndex = Math.floor(Math.random() * PET_IMAGES.length);
  return PET_IMAGES[randomIndex];
}

export function getRandomPet() {
  const randomIndex = Math.floor(Math.random() * PET_IMAGES.length);
  return PET_IMAGES[randomIndex];
}

export function getRandomPetEmoji() {
  const randomIndex = Math.floor(Math.random() * PET_EMOJIS.length);
  return PET_EMOJIS[randomIndex];
}

export function getPetCategory(petName: string): string {
  const pet = PET_IMAGES.find(p => p.name === petName);
  return pet?.category || "";
}

export function getPetsByCategory(categoryId: string) {
  return PET_IMAGES.filter(p => p.category === categoryId);
}
