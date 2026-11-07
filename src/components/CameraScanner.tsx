import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, Zap, Sparkles, AlertCircle, Scan, ArrowRight, Loader2, UploadCloud } from 'lucide-react';
import { SAMPLE_ITEMS, SampleItem } from '../data/sampleItems';
import { playCameraShutterSound } from '../utils/audio';

interface CameraScannerProps {
  onAnalyze: (imageDataUrl: string, sampleDescription?: string, sampleId?: string) => void;
  isAnalyzing: boolean;
  onOpenApiKeyModal?: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onAnalyze, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleItem | null>(null);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('此瀏覽器或裝置不支援相機 API，請改用「上傳照片」或下方「快速範例」。');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }

      setStream(newStream);
      setIsCameraActive(true);

      // Check if torch is supported
      const track = newStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      let msg = '無法啟動相機。請確認已允許相機存取權限，或直接「上傳照片」及點選「快速範例」。';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '相機存取權限遭拒絕。請在瀏覽器設定中開啟相機權限，或直接上傳照片辨識。';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const newTorchState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: newTorchState }],
      });
      setTorchOn(newTorchState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture snapshot from video element
  const handleCapture = () => {
    if (!videoRef.current || isAnalyzing) return;

    playCameraShutterSound();

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror image if user camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onAnalyze(dataUrl);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAnalyzing) return;
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onAnalyze(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload from album
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onAnalyze(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const rasterizeSvgToPng = (svgDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 600, 600);
          ctx.drawImage(img, 0, 0, 600, 600);
          resolve(canvas.toDataURL('image/png', 0.9));
        } else {
          resolve(svgDataUrl);
        }
      };
      img.onerror = () => resolve(svgDataUrl);
      img.src = svgDataUrl;
    });
  };

  const handleSampleClick = async (sample: SampleItem) => {
    setSelectedSample(sample);
    if (sample.dataUrl.startsWith('data:image/svg+xml')) {
      const pngData = await rasterizeSvgToPng(sample.dataUrl);
      onAnalyze(pngData, sample.name + ' - ' + sample.description, sample.id);
    } else {
      onAnalyze(sample.dataUrl, sample.name + ' - ' + sample.description, sample.id);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      {/* Hidden file input for album selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Prominent Direct Album Photo Analysis Banner */}
      <div className="mb-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-blue-950/40 p-4 sm:p-5 rounded-3xl border border-emerald-200/90 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/30">
            <ImageIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                直接選取相簿照片分析
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                可選相片 / 截圖
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              從裝置相簿上傳垃圾或回收物照片，AI 立即判斷分類與源頭減廢方式！
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          開啟相簿選取照片
        </button>
      </div>

      {/* Viewport Frame */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 transition-colors ${
          isDragging ? 'border-emerald-400 ring-4 ring-emerald-400/30' : 'border-slate-800'
        }`}
      >
        {/* Dragging Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white pointer-events-none">
            <UploadCloud className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
            <div className="text-lg font-bold">放開相片以開始 AI 分類分析</div>
          </div>
        )}

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Camera Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Camera Overlay & Scanning Reticle */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
          {/* Top Status Bar inside Viewfinder */}
          <div className="w-full flex items-center justify-between text-white/90">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
              <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isCameraActive ? 'AI 鏡頭運作中' : '等待鏡頭開啟'}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    torchOn ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30' : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                  title="手電筒開關"
                >
                  <Zap className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={switchCamera}
                className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all active:scale-95"
                title="切換前後鏡頭"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Target Reticle */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Corner guides */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-sm" />

            {/* Laser scanning beam */}
            <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_2.5s_infinite]" />

            {/* Hint text inside reticle */}
            <div className="text-center px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide">
              將待丟棄物品置於框內
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="text-center text-white/80 text-xs bg-black/40 backdrop-blur-md px-4 py-1 rounded-full">
            支援塑膠、紙容器、廚餘、有害電池、金屬、一般垃圾辨識
          </div>
        </div>

        {/* Camera Error / Fallback State */}
        {cameraError && !isCameraActive && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-10">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">相機無法使用</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">{cameraError}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                重新連接相機
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm flex items-center gap-2 backdrop-blur-md transition-all active:scale-95"
              >
                <ImageIcon className="w-4 h-4" />
                從相簿選取照片
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Overlay Loader */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 transition-all">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-emerald-400 border-l-transparent animate-spin" />
              <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2">
              Gemini AI 辨識分析中
            </h3>
            <div className="flex flex-col items-center gap-1 text-sm text-slate-300">
              <p className="animate-pulse">正在精準解析多材質結構與環保署丟棄規範...</p>
            </div>
          </div>
        )}
      </div>

      {/* Shutter & Controls Section */}
      <div className="mt-5 flex items-center justify-between px-4 sm:px-8">
        {/* Upload File Button */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">相簿上傳</span>
          </button>
        </div>

        {/* Primary Shutter Snap Button */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-sm animate-pulse" />
          <button
            type="button"
            onClick={handleCapture}
            disabled={isAnalyzing || !isCameraActive}
            className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 active:scale-90 hover:scale-105 transition-all duration-200 border-4 border-white dark:border-slate-900 disabled:opacity-50 disabled:pointer-events-none"
            title="拍照掃描垃圾"
          >
            {isAnalyzing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Scan className="w-9 h-9 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Switch Camera Button (Secondary) */}
        <div>
          <button
            type="button"
            onClick={switchCamera}
            disabled={isAnalyzing}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">翻轉鏡頭</span>
          </button>
        </div>
      </div>

      {/* Preset Test Items Quick Bar */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              手邊沒垃圾？點擊快速體驗 AI 掃描辨識：
            </h4>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300">真實辨識測試</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {SAMPLE_ITEMS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleClick(sample)}
              disabled={isAnalyzing}
              className="flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all text-center group active:scale-95 disabled:opacity-50"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                {sample.icon}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {sample.name.split('（')[0]}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                {sample.categoryHint.split('/')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
