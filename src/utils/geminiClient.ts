import { WasteAnalysisResult } from '../types';

const API_KEY_STORAGE_KEY = 'ecosort_user_gemini_api_key';

export function getUserApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setUserApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch {}
}

const SYSTEM_INSTRUCTION = `你是一位精通台灣資源回收與垃圾分類的權威環保專家。
依據台灣環保署標準，詳細分析物品的主體名稱、英文名、主分類(RECYCLABLE_PLASTIC/PAPER/PAPER_CONTAINER/GLASS/METAL/ELECTRONIC/FABRIC/FOOD_WASTE_RAW/FOOD_WASTE_COOKED/GENERAL_WASTE/HAZARDOUS_WASTE)、桶身主題色(blue/yellow/red/green/amber/stone/purple)、信心度(0.0~1.0)、一句話重點summary、順序處置步驟disposalSteps、多材質拆解組件componentsBreakdown(partName, material, targetBin, actionNote)、回收標誌代碼recyclingCode、減碳效益ecoImpact、常見丟錯盲點commonMistakes、乾淨度要求cleanlinessRequirement，以及2~4點源頭減量生活提案wasteReductionTips。請務必直接輸出純 JSON 格式。`;

export async function classifyWithGeminiClient(
  imageBase64: string,
  userPrompt?: string,
  apiKeyParam?: string
): Promise<WasteAnalysisResult> {
  const apiKey = apiKeyParam || getUserApiKey();
  if (!apiKey) {
    throw new Error('請先設定 Gemini API Key 才能在靜態網頁上直接辨識自訂相片。');
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
  let mimeType = 'image/jpeg';
  const match = imageBase64.match(/^data:([^;]+);base64,/);
  if (match && match[1]) {
    mimeType = match[1];
  }

  const prompt = `請分析這張照片中的垃圾/廢棄物，嚴謹依據台灣環保署標準輸出 JSON 物件。包含各部件拆解與減量撇步。${
    userPrompt ? ` 補充: ${userPrompt}` : ''
  }`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generation_config: {
      response_mime_type: 'application/json',
      temperature: 0.2,
    },
  };

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `API 回應錯誤 (${res.status})`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('未收到辨識文字內容');

      const parsed: WasteAnalysisResult = JSON.parse(rawText);
      return parsed;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('辨識模型連線失敗，請檢查 API Key 是否正確。');
}

export async function chatFollowupClient(
  itemName: string,
  categoryName: string,
  question: string,
  apiKeyParam?: string
): Promise<string> {
  const apiKey = apiKeyParam || getUserApiKey();
  if (!apiKey) {
    return '（目前在 GitHub Pages 靜態模式）若要使用 AI 延續對話，請點擊上方「設定 API Key」輸入 Gemini API Key。';
  }

  const prompt = `使用者詢問「${itemName}」（分類為：${categoryName}）的垃圾分類疑問：「${question}」。請以親切專業繁體中文簡明回答（150字內）。`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) {
      throw new Error(`API 錯誤 (${res.status})`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '無法生成回答，請稍後重試。';
  } catch (err: any) {
    return `AI 回覆失敗: ${err?.message || '請確認網路與 API Key'}`;
  }
}
