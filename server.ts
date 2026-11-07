import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 25mb limit for high-resolution camera captures
app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface WasteAnalysisResult {
  itemName: string;
  englishName: string;
  category: 
    | 'RECYCLABLE_PLASTIC'
    | 'RECYCLABLE_PAPER'
    | 'RECYCLABLE_PAPER_CONTAINER'
    | 'RECYCLABLE_GLASS'
    | 'RECYCLABLE_METAL'
    | 'RECYCLABLE_ELECTRONIC'
    | 'RECYCLABLE_FABRIC'
    | 'FOOD_WASTE_RAW'
    | 'FOOD_WASTE_COOKED'
    | 'GENERAL_WASTE'
    | 'HAZARDOUS_WASTE'
    | 'BULKY_WASTE';
  categoryName: string;
  targetBinColor: 'blue' | 'yellow' | 'red' | 'green' | 'amber' | 'stone' | 'purple';
  confidence: number;
  summary: string;
  disposalSteps: string[];
  componentsBreakdown: Array<{
    partName: string;
    material: string;
    targetBin: string;
    actionNote: string;
  }>;
  recyclingCode?: string;
  ecoImpact: string;
  commonMistakes: string;
  warningNote?: string;
  cleanlinessRequirement: string;
  wasteReductionTips: string[];
}

const SYSTEM_INSTRUCTION = `你是一位精通垃圾分類與資源回收的權威環保專家。
使用者會提供一張包含垃圾、廢棄物或待回收物品的相片。
請仔細辨識相片中的主體物品，並依照台灣環保署標準（亦適用一般東亞嚴謹資源分類法則）進行精確分類。

特別注意常見分類陷阱：
1. 【紙容器 vs 純紙類】：紙餐盒、紙杯、利樂包/鋁箔包表面有食用級塑膠淋膜(PE)或鋁箔層，屬於「紙容器類 (Resource Recycling - Paper Containers)」，絕不可混入「一般紙類/紙箱」！
2. 【手搖飲料杯】：杯身若為PP/PET塑膠應丟「塑膠回收」，但封膜、塑膠吸管因為有髒污且多為複合材質，應丟「一般垃圾」！
3. 【便當盒組】：紙便當盒沖洗乾淨後丟「紙容器回收」；免洗竹筷、用過的木製湯匙、髒衛生紙丟「一般垃圾」；菜餚骨頭分生/熟廚餘或一般垃圾。
4. 【生廚餘 vs 熟廚餘】：
   - 生廚餘（堆肥）：果皮、蔬菜殘渣、果核、咖啡渣、茶葉渣。
   - 熟廚餘（養豬）：剩飯剩菜、肉類熟食、煮熟麵食。
   - 一般垃圾（不可當廚餘）：大骨頭、蚌殼蛤蜊殼、玉米芯/硬筍殼、榴槤殼、落葉枯枝（部分縣市列一般垃圾）。
5. 【電池與燈管】：屬於「有害/特殊廢棄物 (資源回收)」，需單獨收集至便利商店或專門回收箱，嚴禁混入一般垃圾以防起火爆炸與重金屬污染。
6. 【保麗龍】：乾淨包裝緩衝用保麗龍可回收，髒污或含油便當盒請丟一般垃圾。
7. 【乾淨度要求】：如果物品表面有油污或廚餘殘渣，必須「倒空、沖洗、瀝乾、壓扁」，若完全無法洗淨（如油膩披薩盒底襯紙），則應歸入「一般垃圾」。

請務必輸出 JSON 格式，各欄位格式必須完整，文字使用標準繁體中文。`;

// 1. API: Classify Waste from Image
app.post('/api/classify', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', region = 'tw', userPrompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: '請提供要辨識的物品圖片' });
    }

    // Clean base64 data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const promptText = `請分析這張照片中的垃圾/廢棄物。
辨識物品名稱、主要材質、應投遞的正確垃圾桶類別、拆解分解各部件的丟棄方式（例如瓶身、瓶蓋、標籤、吸管各丟哪裡）、清洗處置步驟、常見錯誤觀念、環保減碳小知識，以及「日常生活中可用什麼方式減少該項垃圾產生（源頭減量、環保替代方案、重複使用等實用撇步）」。
${userPrompt ? `使用者補充說明: "${userPrompt}"` : ''}
${region === 'jp' ? '請依日本垃圾分類邏輯（可燃、不燃、資源等）說明。' : '請依台灣環保署資源回收分類規範說明。'}`;

    // Sanitize and detect mimeType from base64 data URL
    let finalMime = mimeType || 'image/jpeg';
    const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    if (mimeMatch && mimeMatch[1]) {
      finalMime = mimeMatch[1];
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(finalMime)) {
      finalMime = 'image/jpeg';
    }

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let response: any = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: finalMime,
                    data: cleanBase64,
                  },
                },
                { text: promptText },
              ],
            },
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  itemName: {
                    type: Type.STRING,
                    description: '繁體中文物品名稱，例如：外帶紙咖啡杯含塑膠蓋、寶特瓶、乾電池、便當盒',
                  },
                  englishName: {
                    type: Type.STRING,
                    description: '英文物品名稱',
                  },
                  category: {
                    type: Type.STRING,
                    enum: [
                      'RECYCLABLE_PLASTIC',
                      'RECYCLABLE_PAPER',
                      'RECYCLABLE_PAPER_CONTAINER',
                      'RECYCLABLE_GLASS',
                      'RECYCLABLE_METAL',
                      'RECYCLABLE_ELECTRONIC',
                      'RECYCLABLE_FABRIC',
                      'FOOD_WASTE_RAW',
                      'FOOD_WASTE_COOKED',
                      'GENERAL_WASTE',
                      'HAZARDOUS_WASTE',
                      'BULKY_WASTE',
                    ],
                    description: '主分類枚舉值',
                  },
                  categoryName: {
                    type: Type.STRING,
                    description: '主分類繁體中文名稱，例如：紙容器類、塑膠回收、一般垃圾、生廚餘',
                  },
                  targetBinColor: {
                    type: Type.STRING,
                    enum: ['blue', 'yellow', 'red', 'green', 'amber', 'stone', 'purple'],
                    description: '桶身主題色：blue(一般紙類/玻璃), yellow(塑膠/資源), red(有害廢棄物/電池), green(廚餘/生廚餘), amber(熟廚餘/紙容器), stone(一般垃圾), purple(電子資訊)',
                  },
                  confidence: {
                    type: Type.NUMBER,
                    description: '信心度分數 (0.0 ~ 1.0)',
                  },
                  summary: {
                    type: Type.STRING,
                    description: '一句話清晰指引，例如：紙杯身洗淨壓扁投紙容器，塑膠蓋丟塑膠回收，吸管丟一般垃圾',
                  },
                  disposalSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '依順序處理的動作步驟，如：1. 倒空殘茶 2. 撕開封膜丟一般垃圾 3. 清水稍微沖洗 4. 壓扁杯身丟紙容器',
                  },
                  componentsBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        partName: { type: Type.STRING, description: '組件名稱，如：塑膠蓋、杯身、吸管' },
                        material: { type: Type.STRING, description: '材質，如：PP 5號、PE淋膜紙、複合塑膠' },
                        targetBin: { type: Type.STRING, description: '目標桶別，如：塑膠回收、紙容器、一般垃圾' },
                        actionNote: { type: Type.STRING, description: '注意事項，如：需洗淨、撕除丟一般垃圾' },
                      },
                      required: ['partName', 'material', 'targetBin', 'actionNote'],
                    },
                    description: '複合材質分解說明',
                  },
                  recyclingCode: {
                    type: Type.STRING,
                    description: '塑膠回收標誌號碼或材質代碼，例如 "5 (PP)"、"1 (PET)"、"無" 或 "紙容器標誌"',
                  },
                  ecoImpact: {
                    type: Type.STRING,
                    description: '環保減碳效益或趣味知識，例如：妥善回收1個寶特瓶可減少0.063公斤碳排放',
                  },
                  commonMistakes: {
                    type: Type.STRING,
                    description: '常見民眾丟錯的盲點說明',
                  },
                  warningNote: {
                    type: Type.STRING,
                    description: '安全性警告或特殊注意事項，若無則填空字串',
                  },
                  cleanlinessRequirement: {
                    type: Type.STRING,
                    description: '乾淨度標準，例如：必須清空並以水沖洗乾淨；或：若過度油污無法洗淨則應改丟一般垃圾',
                  },
                  wasteReductionTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '具體日常生活中如何減少或避免產生該垃圾的方式（源頭減量、環保替代方案、重複使用等實用撇步），提供 2~4 點條理分明的建議',
                  },
                },
                required: [
                  'itemName',
                  'englishName',
                  'category',
                  'categoryName',
                  'targetBinColor',
                  'confidence',
                  'summary',
                  'disposalSteps',
                  'componentsBreakdown',
                  'ecoImpact',
                  'commonMistakes',
                  'cleanlinessRequirement',
                  'wasteReductionTips',
                ],
              },
            },
          });
          break; // Succeeded!
        } catch (err: any) {
          lastError = err;
          // Wait 800ms before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      if (response) break;
    }

    if (!response) {
      throw lastError || new Error('模型辨識服務忙碌，請稍候重試。');
    }

    const text = response.text;
    if (!text) {
      throw new Error('未收到辨識結果');
    }

    const parsed: WasteAnalysisResult = JSON.parse(text);
    return res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/classify:', error);
    return res.status(500).json({
      error: error?.message || '辨識垃圾分類時發生錯誤，請稍後再試。',
    });
  }
});

// 2. API: Follow-up question about specific trash item
app.post('/api/chat-followup', async (req, res) => {
  try {
    const { itemName, categoryName, question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: '請提供問題' });
    }

    const prompt = `使用者正在詢問關於「${itemName || '物品'}」（分類為：${categoryName || '資源回收/一般垃圾'}）的垃圾分類或處理疑問。
使用者問題：「${question}」
請以親切、專業、實用的繁體中文回答，包含具體可執行的做法（例如如何清洗、特定污損情況判定、替代環保減廢方式等），字數控制在 100~200 字內。`;

    let response: any = null;
    const followupModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    for (const m of followupModels) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            systemInstruction: '你是專業耐心的垃圾分類與資源回收環保小幫手。回答準確、條理分明。',
          },
        });
        if (response?.text) break;
      } catch (err) {
        // try next model
      }
    }

    return res.json({
      success: true,
      answer: response.text || '無法生成回答，請稍後再試。',
    });
  } catch (error: any) {
    console.error('Error in /api/chat-followup:', error);
    return res.status(500).json({
      error: error?.message || '問答處理時發生錯誤。',
    });
  }
});

// 3. API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ecosort-ai-server' });
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoSort AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
