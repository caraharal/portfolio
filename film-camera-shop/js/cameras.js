/**
 * ============================================================
 * 📍 相机数据文件 — 你主要修改这个文件！
 * ============================================================
 *
 * 使用说明：
 * 1. 每台相机是一个对象，放在 CAMERAS 数组里
 * 2. 复制一个对象块，修改内容即可添加新相机
 * 3. id 必须唯一，用于详情页 URL（建议用小写英文 + 连字符）
 * 4. images 数组里写你的图片文件路径
 * 5. video 写视频文件路径
 * 6. 图片放 /images 文件夹，视频放 /videos 文件夹
 *
 * 🖼️ 如何替换图片：
 *   - 把图片文件放进 images/ 文件夹
 *   - 修改 images 数组里的路径，例如：
 *     'images/contax-t2-1.jpg' → 'images/我的照片.jpg'
 *
 * 🎬 如何替换视频：
 *   - 把视频文件放进 videos/ 文件夹
 *   - 修改 video 字段的路径
 *
 * ⚠️ 注意：id 字段改过后，首页卡片跳转的链接会自动更新
 * ============================================================
 */

var CAMERAS = [
  {
    id: 'contax-t2',
    name: 'Contax T2',
    brand: 'Contax',
    model: 'T2',
    price: 3800,
    condition: '9成新',
    status: 'available',
    // 📍 把图片放进 images/ 文件夹，然后改下面的文件名
    images: [
      'images/placeholder.svg',
      'images/placeholder.svg',
      'images/placeholder.svg'
    ],
    // 📍 把视频放进 videos/ 文件夹，然后改下面的文件名
    video: '',
    // 📍 列出所有附件
    accessories: [
      '原装镜头盖',
      '原装皮套',
      '原装肩带',
      '说明书'
    ],
    // 📍 写一段机器描述
    description: 'Contax T2 是康泰时于1990年推出的经典高端口袋胶片机，搭载蔡司 Sonnar 38mm f/2.8 镜头，成像锐利色彩浓郁，被誉为"口袋里的徕卡"。全钛金属机身，自动对焦，光圈优先模式，是胶片摄影爱好者的梦中情机。'
  },

  {
    id: 'minolta-x700',
    name: 'Minolta X-700',
    brand: 'Minolta',
    model: 'X-700',
    price: 680,
    condition: '8成新',
    status: 'available',
    images: [
      'images/placeholder.svg',
      'images/placeholder.svg'
    ],
    video: '',
    accessories: [
      'MD 50mm f/1.7 镜头',
      '原装机身盖',
      '背带'
    ],
    description: '美能达 X-700 是美能达最经典的入门级单反相机，发布于1982年。配备 A 档光圈优先和 P 档程序自动曝光，对新手非常友好。机身轻便，MD 卡口镜头群丰富且价格实惠，是入门胶片摄影的性价比之王。'
  },

  {
    id: 'olympus-mju-ii',
    name: 'Olympus µ[mju:]-II',
    brand: 'Olympus',
    model: 'µ[mju:]-II',
    price: 1200,
    condition: '95成新',
    status: 'available',
    images: [
      'images/placeholder.svg',
      'images/placeholder.svg',
      'images/placeholder.svg'
    ],
    video: '',
    accessories: [
      '原装镜头盖',
      '手绳',
      '原装包装盒'
    ],
    description: '奥林巴斯 µ-II 是经典的口袋胶片机，发布于1997年。搭载 35mm f/2.8 镜头，成像优秀，机身小巧到可以塞进口袋。生活防水设计，滑盖开机即拍，是街头摄影和日常记录的完美搭档。'
  }
];

/**
 * ============================================================
 * 📋 添加新相机的模板（复制下面的代码，去掉注释符号 // 即可）
 * ============================================================
 */

// {
//   id: '新相机的英文ID',
//   name: '相机名称',
//   brand: '品牌',
//   model: '型号',
//   price: 价格数字,
//   condition: '成色（如 9成新）',
//   images: [
//     'images/你的图片1.jpg',
//     'images/你的图片2.jpg'
//   ],
//   video: 'videos/你的视频.mp4',
//   accessories: [
//     '附件1',
//     '附件2'
//   ],
//   description: '在这里写相机的详细描述...'
// },
