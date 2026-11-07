// High-resolution SVG data URLs representing real trash test items
// This allows users to test the AI camera scanner instantly even without physical trash nearby!

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleItem {
  id: string;
  name: string;
  categoryHint: string;
  icon: string;
  dataUrl: string;
  description: string;
}

export const SAMPLE_ITEMS: SampleItem[] = [
  {
    id: 'boba-cup',
    name: '手搖飲料杯（含封膜吸管）',
    categoryHint: '複合材質 / 塑膠與一般垃圾',
    icon: '🥤',
    description: '外帶塑膠杯身（PP 5號），表面封有一層塑膠膜，附有一根細塑膠吸管，杯底有些許殘留冰塊與茶水。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#f1f5f9"/>
        <defs>
          <linearGradient id="cupGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.9"/>
          </linearGradient>
          <linearGradient id="teaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <!-- Shadow -->
        <ellipse cx="300" cy="510" rx="140" ry="25" fill="#94a3b8" opacity="0.4"/>
        <!-- Straw -->
        <line x1="280" y1="70" x2="350" y2="440" stroke="#ef4444" stroke-width="18" stroke-linecap="round"/>
        <line x1="280" y1="70" x2="350" y2="440" stroke="#fca5a5" stroke-width="6" stroke-linecap="round"/>
        <!-- Cup Body -->
        <polygon points="190,160 410,160 370,490 230,490" fill="url(#cupGrad)" stroke="#64748b" stroke-width="4"/>
        <!-- Residual tea -->
        <polygon points="225,430 375,430 368,485 232,485" fill="url(#teaGrad)" opacity="0.85"/>
        <!-- Tapioca Pearls -->
        <circle cx="270" cy="465" r="14" fill="#451a03"/>
        <circle cx="310" cy="470" r="13" fill="#451a03"/>
        <circle cx="335" cy="460" r="14" fill="#451a03"/>
        <!-- Plastic Sealing Film with Printed Logo -->
        <ellipse cx="300" cy="160" rx="110" ry="20" fill="#f8fafc" stroke="#3b82f6" stroke-width="4"/>
        <text x="300" y="165" font-family="sans-serif" font-weight="bold" font-size="14" fill="#2563eb" text-anchor="middle">FRESH TEA 封膜</text>
        <path d="M 285,150 L 305,170 M 305,150 L 285,170" stroke="#dc2626" stroke-width="3"/>
        <!-- Recycling Symbol PP 5 -->
        <text x="300" y="320" font-family="sans-serif" font-size="28" fill="#475569" text-anchor="middle">♷ PP 5</text>
        <text x="300" y="350" font-family="sans-serif" font-size="15" fill="#64748b" text-anchor="middle">700ml 塑膠冷飲杯</text>
      </svg>
    `),
  },
  {
    id: 'bento-box',
    name: '紙便當餐盒（含免洗木筷）',
    categoryHint: '紙容器回收 / 木筷一般垃圾',
    icon: '🍱',
    description: '吃完的紙餐盒，盒內有殘留的排骨骨頭、菜湯油脂與一雙折斷的免洗木筷。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#fef3c7"/>
        <!-- Shadow -->
        <rect x="110" y="160" width="380" height="300" rx="20" fill="#d97706" opacity="0.2"/>
        <!-- Bento Outer Box (Paperboard with PE Coating) -->
        <rect x="100" y="140" width="400" height="300" rx="16" fill="#fef08a" stroke="#ca8a04" stroke-width="5"/>
        <rect x="120" y="160" width="360" height="260" rx="10" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
        <!-- Oil Stains -->
        <ellipse cx="220" cy="230" rx="45" ry="30" fill="#fde047" opacity="0.6"/>
        <ellipse cx="340" cy="280" rx="60" ry="35" fill="#facc15" opacity="0.5"/>
        <!-- Leftover Chicken / Pork Bone -->
        <path d="M 180,260 Q 220,240 250,280 Q 210,300 180,260" fill="#78350f" stroke="#451a03" stroke-width="3"/>
        <text x="215" y="275" font-family="sans-serif" font-size="12" fill="#fff">肉骨頭</text>
        <!-- Vegetable residue -->
        <path d="M 330,220 C 350,200 370,240 350,250 Z" fill="#16a34a"/>
        <path d="M 360,230 C 380,210 400,235 380,260 Z" fill="#22c55e"/>
        <!-- Disposable Wooden Chopsticks -->
        <line x1="80" y1="460" x2="480" y2="120" stroke="#d4b483" stroke-width="12" stroke-linecap="round"/>
        <line x1="95" y1="480" x2="500" y2="135" stroke="#c29b62" stroke-width="10" stroke-linecap="round"/>
        <!-- Text label -->
        <text x="300" y="380" font-family="sans-serif" font-size="20" font-weight="bold" fill="#854d0e" text-anchor="middle">PE淋膜紙餐盒 (紙容器)</text>
        <text x="300" y="405" font-family="sans-serif" font-size="14" fill="#a16207" text-anchor="middle">附免洗竹筷與菜餚殘渣</text>
      </svg>
    `),
  },
  {
    id: 'battery-hazard',
    name: '廢乾電池與充電電池',
    categoryHint: '有害垃圾 / 專用回收箱',
    icon: '🔋',
    description: '3顆用完的 1.5V AA 鹼性乾電池與1顆廢鋰電池，不可丟一般垃圾以防起火重金屬污染。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#fee2e2"/>
        <!-- Battery 1 (AA) -->
        <g transform="translate(140, 160) rotate(-15)">
          <rect x="25" y="0" width="30" height="15" rx="3" fill="#94a3b8"/>
          <rect x="0" y="15" width="80" height="200" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
          <rect x="0" y="15" width="80" height="60" rx="0" fill="#f59e0b"/>
          <text x="40" y="55" font-family="sans-serif" font-weight="bold" font-size="24" fill="#000" text-anchor="middle">+</text>
          <text x="40" y="120" font-family="sans-serif" font-weight="bold" font-size="16" fill="#f8fafc" text-anchor="middle">1.5V AA</text>
          <text x="40" y="145" font-family="sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">ALKALINE</text>
        </g>
        <!-- Battery 2 (AA Gold) -->
        <g transform="translate(280, 150) rotate(10)">
          <rect x="25" y="0" width="30" height="15" rx="3" fill="#cbd5e1"/>
          <rect x="0" y="15" width="80" height="200" rx="8" fill="#d97706" stroke="#b45309" stroke-width="3"/>
          <rect x="0" y="140" width="80" height="75" rx="0" fill="#1e1b4b"/>
          <text x="40" y="55" font-family="sans-serif" font-weight="bold" font-size="24" fill="#fff" text-anchor="middle">+</text>
          <text x="40" y="105" font-family="sans-serif" font-weight="bold" font-size="18" fill="#fff" text-anchor="middle">MAX</text>
          <text x="40" y="180" font-family="sans-serif" font-weight="bold" font-size="24" fill="#fff" text-anchor="middle">-</text>
        </g>
        <!-- Hazard Sign Badge -->
        <circle cx="300" cy="450" r="55" fill="#ef4444"/>
        <text x="300" y="445" font-family="sans-serif" font-weight="bold" font-size="32" fill="#fff" text-anchor="middle">⚠️</text>
        <text x="300" y="480" font-family="sans-serif" font-weight="bold" font-size="16" fill="#fff" text-anchor="middle">嚴禁混入一般垃圾</text>
        <text x="300" y="540" font-family="sans-serif" font-size="16" font-weight="bold" fill="#991b1b" text-anchor="middle">專用電池回收盒 / 超商回收折抵</text>
      </svg>
    `),
  },
  {
    id: 'pet-bottle',
    name: '礦泉水寶特瓶（含塑膠蓋與膜標籤）',
    categoryHint: '塑膠回收 / 瓶身瓶蓋可拆',
    icon: '🍶',
    description: '透明 PET 1號塑膠礦泉水瓶，附藍色塑膠瓶蓋與環狀印刷標籤。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#e0f2fe"/>
        <!-- Cap -->
        <rect x="270" y="100" width="60" height="40" rx="5" fill="#0284c7" stroke="#0369a1" stroke-width="3"/>
        <line x1="280" y1="100" x2="280" y2="140" stroke="#38bdf8" stroke-width="2"/>
        <line x1="300" y1="100" x2="300" y2="140" stroke="#38bdf8" stroke-width="2"/>
        <line x1="320" y1="100" x2="320" y2="140" stroke="#38bdf8" stroke-width="2"/>
        <!-- Neck -->
        <polygon points="275,140 325,140 345,180 255,180" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <!-- Bottle Body -->
        <path d="M 255,180 Q 230,220 230,260 L 230,470 Q 230,500 260,500 L 340,500 Q 370,500 370,470 L 370,260 Q 370,220 345,180 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="4" opacity="0.75"/>
        <!-- Plastic Label Sleeve -->
        <rect x="228" y="270" width="144" height="110" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
        <text x="300" y="315" font-family="sans-serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">NATURAL WATER</text>
        <text x="300" y="345" font-family="sans-serif" font-size="14" fill="#0c4a6e" text-anchor="middle">♳ 1 號 PET 塑膠瓶</text>
        <text x="300" y="365" font-family="sans-serif" font-size="11" fill="#0369a1" text-anchor="middle">撕除外標籤更好回收</text>
        <!-- Highlight reflection -->
        <path d="M 245,200 L 245,460" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
      </svg>
    `),
  },
  {
    id: 'food-waste',
    name: '香蕉皮與熟食剩菜',
    categoryHint: '生廚餘 (堆肥) / 熟廚餘 (養豬)',
    icon: '🍌',
    description: '吃完剩下的黑斑香蕉皮、削下的胡蘿蔔皮與半碗吃不下的熟肉燥飯。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#ecfdf5"/>
        <!-- Banana Peel -->
        <g transform="translate(180, 160)">
          <path d="M 50,20 C 120,40 180,120 180,220 C 140,180 80,100 50,20 Z" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
          <path d="M 50,20 C 20,90 10,180 30,240 C 45,170 45,100 50,20 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
          <path d="M 50,20 C 80,100 90,200 120,250 C 95,190 75,110 50,20 Z" fill="#fde047" stroke="#ca8a04" stroke-width="3"/>
          <circle cx="50" cy="20" r="8" fill="#713f12"/>
          <!-- Banana spots -->
          <circle cx="120" cy="140" r="5" fill="#78350f"/>
          <circle cx="90" cy="180" r="7" fill="#78350f"/>
          <circle cx="140" cy="190" r="6" fill="#78350f"/>
        </g>
        <!-- Bowl with leftover rice and minced meat -->
        <ellipse cx="380" cy="400" rx="140" ry="60" fill="#99f6e4" stroke="#0f766e" stroke-width="4"/>
        <ellipse cx="380" cy="385" rx="125" ry="45" fill="#f8fafc"/>
        <!-- Minced meat sauce -->
        <ellipse cx="380" cy="385" rx="80" ry="30" fill="#78350f" opacity="0.8"/>
        <text x="300" y="520" font-family="sans-serif" font-weight="bold" font-size="20" fill="#065f46" text-anchor="middle">果皮菜葉 = 生廚餘（堆肥）</text>
        <text x="300" y="550" font-family="sans-serif" font-weight="bold" font-size="18" fill="#b45309" text-anchor="middle">熟肉熟飯 = 熟廚餘（養豬）</text>
      </svg>
    `),
  },
  {
    id: 'glass-bottle',
    name: '深色玻璃酒瓶（含金屬皇冠蓋）',
    categoryHint: '玻璃回收 / 鐵蓋分開丟',
    icon: '🍾',
    description: '綠色深色玻璃瓶，附有生鏽鐵蓋，瓶身附有紙質商標。',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#f5f5f4"/>
        <!-- Crown Cap (Metal) -->
        <rect x="275" y="90" width="50" height="25" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <text x="300" y="108" font-family="sans-serif" font-size="10" fill="#78350f" font-weight="bold" text-anchor="middle">鐵蓋</text>
        <!-- Glass Neck -->
        <polygon points="280,115 320,115 335,210 265,210" fill="#15803d" stroke="#14532d" stroke-width="3"/>
        <!-- Glass Body -->
        <path d="M 265,210 Q 235,250 235,300 L 235,480 Q 235,505 260,505 L 340,505 Q 365,505 365,480 L 365,300 Q 365,250 335,210 Z" fill="#166534" stroke="#14532d" stroke-width="4"/>
        <!-- Bottle Paper Label -->
        <rect x="245" y="310" width="110" height="120" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
        <text x="300" y="355" font-family="sans-serif" font-weight="bold" font-size="16" fill="#78350f" text-anchor="middle">PREMIUM</text>
        <text x="300" y="380" font-family="sans-serif" font-weight="bold" font-size="18" fill="#15803d" text-anchor="middle">綠色玻璃瓶</text>
        <text x="300" y="405" font-family="sans-serif" font-size="12" fill="#78350f" text-anchor="middle">清空沖洗後回收</text>
        <!-- Glass reflections -->
        <line x1="250" y1="230" x2="250" y2="470" stroke="#86efac" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
      </svg>
    `),
  },
];
