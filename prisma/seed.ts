import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 默认评分规则
const defaultRules = [
  // 加分项 - 基础学习
  { name: '课堂举手发言被表扬', category: 'basic_learning', score: 1, icon: '✋' },
  { name: '作业按时完成无拖欠', category: 'basic_learning', score: 2, icon: '📝' },
  { name: '作业优秀/全对', category: 'basic_learning', score: 3, icon: '💯' },
  { name: '背诵/默写一次过关', category: 'basic_learning', score: 2, icon: '🗣️' },
  // 加分项 - 学习进步
  { name: '测验进步5名及以上', category: 'learning_progress', score: 3, icon: '📈' },
  { name: '前10名/单科满分', category: 'learning_progress', score: 5, icon: '🏆' },
  { name: '学科竞赛/校级获奖', category: 'learning_progress', score: 5, icon: '🏅' },
  { name: '主动帮同学讲题', category: 'learning_progress', score: 2, icon: '🤝' },
  // 加分项 - 纪律习惯
  { name: '早读/自习安静守纪', category: 'discipline', score: 1, icon: '🤫' },
  { name: '课间操规范完成', category: 'discipline', score: 1, icon: '🤸' },
  { name: '整周无违纪迟到早退', category: 'discipline', score: 5, icon: '✅' },
  // 加分项 - 劳动集体
  { name: '当日值日合格无扣分', category: 'labor_collective', score: 2, icon: '🧹' },
  { name: '主动承担额外劳动', category: 'labor_collective', score: 2, icon: '🛠️' },
  { name: '参与黑板报/布置', category: 'labor_collective', score: 3, icon: '🎨' },
  { name: '代表班级参加活动', category: 'labor_collective', score: 3, icon: '🏃' },
  // 加分项 - 好人好事
  { name: '拾金不昧/助人表扬', category: 'good_deeds', score: 3, icon: '❤️' },
  { name: '班级/校级优秀表彰', category: 'good_deeds', score: 5, icon: '🌟' },
  { name: '班级获集体荣誉', category: 'good_deeds', score: 5, icon: '🚩' },

  // 扣分项 - 学习违纪
  { name: '作业迟交/未完成', category: 'study_violation', score: -2, icon: '❌' },
  { name: '作业抄袭/考试作弊', category: 'study_violation', score: -5, icon: '⚠️' },
  { name: '走神/打闹被点名', category: 'study_violation', score: -2, icon: '😴' },
  { name: '背诵/默写多次不过', category: 'study_violation', score: -2, icon: '📉' },
  // 扣分项 - 纪律违纪
  { name: '迟到/早退', category: 'discipline_violation', score: -2, icon: '⏰' },
  { name: '旷课(每节)', category: 'discipline_violation', score: -5, icon: '🚫' },
  { name: '自习说话扰乱秩序', category: 'discipline_violation', score: -2, icon: '📢' },
  { name: '课间追逐/违规', category: 'discipline_violation', score: -3, icon: '🏃‍♂️' },
  { name: '一周累计3次违纪', category: 'discipline_violation', score: -3, icon: '🚨' },
  // 扣分项 - 集体公德
  { name: '值日偷懒致班级扣分', category: 'collective_morality', score: -2, icon: '🗑️' },
  { name: '损坏公物', category: 'collective_morality', score: -3, icon: '🔨' },
  { name: '损害集体荣誉', category: 'collective_morality', score: -5, icon: '🖤' },
]

// 默认宠物列表（使用 emoji）
const defaultPets = [
  { name: '小兔子', image: '🐰', level: 1 },
  { name: '小猫咪', image: '🐱', level: 1 },
  { name: '小狗狗', image: '🐶', level: 1 },
  { name: '小熊猫', image: '🐼', level: 1 },
  { name: '小老虎', image: '🐯', level: 1 },
  { name: '小狮子', image: '🦁', level: 1 },
  { name: '小猴子', image: '🐵', level: 1 },
  { name: '小企鹅', image: '🐧', level: 1 },
  { name: '小考拉', image: '🐨', level: 1 },
  { name: '小狐狸', image: '🦊', level: 1 },
  { name: '小恐龙', image: '🦕', level: 1 },
  { name: '小鲸鱼', image: '🐋', level: 1 },
  { name: '小海豚', image: '🐬', level: 1 },
  { name: '小乌龟', image: '🐢', level: 1 },
  { name: '小蝴蝶', image: '🦋', level: 1 },
  { name: '小蜜蜂', image: '🐝', level: 1 },
  { name: '小松鼠', image: '🐿️', level: 1 },
  { name: '小仓鼠', image: '🐹', level: 1 },
  { name: '小刺猬', image: '🦔', level: 1 },
  { name: '小独角兽', image: '🦄', level: 1 },
]

// 默认奖项/徽章
const defaultBadges = [
  { name: '学习之星', description: '连续 10 次作业优秀', image: '🌟' },
  { name: '进步之星', description: '单周积分增长最快', image: '⭐' },
  { name: '纪律之星', description: '连续一个月无违纪', image: '👮' },
  { name: '运动之星', description: '体育活动表现突出', image: '🏃' },
  { name: '创意之星', description: '提出创新想法', image: '💡' },
  { name: '助人之星', description: '帮助同学 10 次以上', image: '🤝' },
  { name: '全勤之星', description: '一个月无迟到早退', image: '📅' },
  { name: '阅读之星', description: '阅读书籍 10 本以上', image: '📖' },
  { name: '艺术之星', description: '艺术作品获奖', image: '🎨' },
  { name: '科学之星', description: '科学实验优秀', image: '🔬' },
  { name: '环保之星', description: '环保行动积极', image: '♻️' },
  { name: '领袖之星', description: '班级工作出色', image: '🌠' },
  { name: '宠物大师', description: '成功养成 5 只宠物', image: '🐾' },
  { name: '积分达人', description: '累计积分达到 1000', image: '💎' },
  { name: '完美毕业', description: '宠物满级毕业', image: '🎓' },
]

// 默认商品
const defaultProducts = [
  { name: '免作业卡', description: '免除一次作业', price: 10, category: 'privilege', icon: '⭐', stock: -1 },
  { name: '零食大礼包', description: '美味零食', price: 5, category: 'food', icon: '🍬', stock: 20 },
  { name: '精美笔记本', description: '高质量笔记本', price: 3, category: 'stationery', icon: '📔', stock: 15 },
  { name: '彩色笔套装', description: '24 色彩色笔', price: 8, category: 'stationery', icon: '🖍️', stock: 10 },
  { name: '橡皮擦', description: '可爱造型橡皮', price: 1, category: 'stationery', icon: '🧽', stock: 30 },
  { name: '贴纸', description: '精美贴纸', price: 2, category: 'misc', icon: '🏷️', stock: 25 },
  { name: '小玩具', description: '迷你玩具', price: 15, category: 'entertainment', icon: '🎮', stock: 8 },
  { name: '书籍', description: '课外读物', price: 12, category: 'misc', icon: '📚', stock: 12 },
  { name: '优先选座权', description: '优先选择座位一次', price: 20, category: 'privilege', icon: '💺', stock: -1 },
  { name: '班长体验卡', description: '当一天班长', price: 50, category: 'privilege', icon: '👑', stock: -1 },
]

async function main() {
  console.log('🌱 开始添加默认数据...')

  // 如果没有班级，创建一个测试班级
  const testClass = await prisma.class.upsert({
    where: { id: 'test-class' },
    update: {},
    create: {
      id: 'test-class',
      name: '测试班级',
      teacherId: 'teacher-1',
    },
  })

  console.log(`✅ 测试班级：${testClass.name}`)

  // 添加默认规则
  for (const rule of defaultRules) {
    const existingRule = await prisma.rule.findFirst({
      where: {
        classId: testClass.id,
        name: rule.name,
      },
    })

    if (!existingRule) {
      await prisma.rule.create({
        data: {
          classId: testClass.id,
          ...rule,
        },
      })
    }
  }
  console.log(`✅ 添加了 ${defaultRules.length} 条默认评分规则`)

  // 添加默认商品
  for (const product of defaultProducts) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        classId: testClass.id,
        name: product.name,
      },
    })

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          classId: testClass.id,
          ...product,
        },
      })
    }
  }
  console.log(`✅ 添加了 ${defaultProducts.length} 个默认商品`)

  // 添加等级配置
  const levels = []
  const defaultLevels = [
    { level: 1, experience: 5, badge: null },
    { level: 2, experience: 10, badge: null },
    { level: 3, experience: 15, badge: null },
    { level: 4, experience: 20, badge: null },
    { level: 5, experience: 30, badge: '铜徽章' },
    { level: 6, experience: 40, badge: null },
    { level: 7, experience: 50, badge: null },
    { level: 8, experience: 60, badge: '银徽章' },
    { level: 9, experience: 75, badge: null },
    { level: 10, experience: 90, badge: '金徽章' },
  ]
  
  for (const defaultLevel of defaultLevels) {
    const existingConfig = await prisma.levelConfig.findFirst({
      where: {
        classId: testClass.id,
        level: defaultLevel.level,
      },
    })

    if (!existingConfig) {
      const config = await prisma.levelConfig.create({
        data: {
          classId: testClass.id,
          level: defaultLevel.level,
          experience: defaultLevel.experience,
          badge: defaultLevel.badge,
        },
      })
      levels.push(config)
    }
  }
  console.log(`✅ 添加了 ${levels.length} 个等级配置`)

  // 添加默认学生
  const defaultStudents = [
    '张三', '李四', '王五', '赵六', '孙七', 
    '周八', '吴九', '郑十', '陈十一', '刘十二'
  ]
  
  let createdStudentsCount = 0
  for (const studentName of defaultStudents) {
    const existingStudent = await prisma.student.findFirst({
      where: {
        classId: testClass.id,
        name: studentName,
      },
    })

    if (!existingStudent) {
      const randomPet = defaultPets[Math.floor(Math.random() * defaultPets.length)]
      await prisma.student.create({
        data: {
          name: studentName,
          classId: testClass.id,
          score: Math.floor(Math.random() * 100),
          level: Math.floor(Math.random() * 5) + 1,
          pet: {
            create: {
              name: randomPet.name,
              image: randomPet.image,
              level: Math.floor(Math.random() * 5) + 1,
              experience: Math.floor(Math.random() * 100),
            },
          },
        },
      })
      createdStudentsCount++
    }
  }

  if (createdStudentsCount > 0) {
    console.log(`✅ 添加了 ${createdStudentsCount} 个默认学生`)
  }

  console.log('\n🎉 默认数据添加完成！')
  console.log('\n📊 数据统计:')
  console.log(`   - 评分规则：${defaultRules.length} 条`)
  console.log(`   - 商品：${defaultProducts.length} 个`)
  console.log(`   - 等级：${levels.length} 级`)
  console.log(`   - 宠物：${defaultPets.length} 只（宠物列表在代码中，学生选择时显示）`)
  console.log(`   - 奖项：${defaultBadges.length} 个（奖项在达成条件时自动授予）`)
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
