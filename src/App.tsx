import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Link as LinkIcon, Loader2, AlertCircle, CheckCircle2, Youtube, Flame, Info } from "lucide-react";
import axios from "axios";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration_string?: string;
  uploader?: string;
  webpage_url: string;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [quality, setQuality] = useState("best");
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get("/api/status");
        setBackendReady(response.data.ready);
      } catch (err) {
        setBackendReady(false);
      }
    };
    checkStatus();
  }, []);

  const fetchVideoInfo = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setSuccess(false);
    setQuality("best");
    setDownloadType("video");

    try {
      const response = await axios.post("/api/info", { url });
      setVideoInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "حدث خطأ أثناء جلب معلومات الفيديو. تأكد من الرابط.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!url) return;
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}&type=${downloadType}`;
    window.location.href = downloadUrl;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-egyptian-black flex flex-col border-[12px] border-egyptian-gold font-sans selection:bg-egyptian-gold selection:text-egyptian-black" dir="rtl">
      {/* Header */}
      <header className="h-24 border-b-4 border-egyptian-gold flex items-center justify-between px-6 md:px-12 bg-egyptian-surface z-20">
        <div className="flex items-center gap-4">
          <div className="rotated-diamond hidden sm:flex">
            <div className="rotated-diamond-inner text-2xl">أ</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-egyptian-gold">أحمس | AHMOS</h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-black uppercase tracking-widest text-egyptian-sand">
          <span className="cursor-pointer hover:text-egyptian-gold transition-colors">الرئيسية</span>
          <span className="cursor-pointer hover:text-egyptian-gold transition-colors">الدعم</span>
          <div className="flex gap-4 border-r-2 border-egyptian-gold pr-8 mr-4 opacity-50 text-[10px]">
             <span>TWITTER</span>
             <span>VIMEO</span>
             <span>DAILYMOTION</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-16 px-6 md:px-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 geometric-bg opacity-5 pointer-events-none" />
        
        {/* Hero Section */}
        <div className="z-10 w-full max-w-4xl text-center mb-16">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white"
          >
            نزل فيديوهاتك المفضلة<br/>
            <span className="text-egyptian-gold">بأعلى جودة وبدون قيود</span>
          </motion.h2>
          
          <div className="flex justify-center mb-6">
            {backendReady === null ? (
              <span className="text-xs text-gray-500 animate-pulse">جاري فحص حالة النظام...</span>
            ) : backendReady ? (
              <span className="flex items-center gap-1 text-[10px] text-green-500/50 uppercase tracking-widest font-black">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                النظام جاهز
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-red-500/50 uppercase tracking-widest font-black">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                النظام قيد التجهيز
              </span>
            )}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            أحمس هو أسرع أداة لتحميل مقاطع الفيديو من جميع المنصات العالمية بدون علامة مائية وبدقة تصل إلى 4K.
          </motion.p>
        </div>

        {/* Search Input Group */}
        <div className="z-10 w-full max-w-3xl mb-12">
          <div className="flex flex-col sm:flex-row gap-0 border-4 border-egyptian-gold blocky-shadow bg-black overflow-hidden group focus-within:shadow-[12px_12px_0px_0px_#D4AF37] transition-all duration-300">
            <div className="flex-1 flex items-center px-4 bg-black">
              <LinkIcon className="text-egyptian-gold ml-2" size={24} />
              <input
                type="text"
                placeholder="ضع رابط الفيديو هنا... (TikTok, Instagram, YouTube...)"
                className="w-full bg-transparent p-6 text-xl outline-none text-white placeholder-gray-600 font-mono"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
                id="video-url-input"
              />
            </div>
            <button
              onClick={fetchVideoInfo}
              disabled={loading || !url}
              className="bg-egyptian-gold text-egyptian-black px-10 py-6 text-xl font-black hover:bg-white active:bg-egyptian-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              id="fetch-button"
            >
              {loading ? <Loader2 className="animate-spin" /> : "جلب الفيديو"}
            </button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center gap-3 text-red-500 font-bold bg-black border-2 border-red-500 p-4"
              >
                <AlertCircle size={24} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Result Card */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="z-10 w-full max-w-3xl blocky-card mb-12 relative overflow-hidden group"
              id="video-preview-card"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/5 aspect-[4/5] border-4 border-egyptian-gold relative overflow-hidden bg-black">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-egyptian-gold text-egyptian-black font-black px-3 py-1 text-sm blocky-shadow-sm border-2 border-egyptian-black">
                    {videoInfo.duration_string || "00:00"}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight">{videoInfo.title}</h3>
                    <div className="space-y-2 mb-6">
                      <p className="flex items-center gap-2 text-gray-400">
                        <span className="w-2 h-2 bg-egyptian-gold rotate-45" />
                        <span className="font-bold text-egyptian-gold">المصدر:</span>
                        {videoInfo.uploader}
                      </p>
                    </div>

                    {/* Download Type Selector */}
                    <div className="flex gap-2 mb-4 p-1 bg-black border-2 border-egyptian-gold/30">
                      <button
                        onClick={() => setDownloadType("video")}
                        className={`flex-1 py-2 font-bold transition-all ${downloadType === 'video' ? 'bg-egyptian-gold text-egyptian-black' : 'text-gray-500 hover:text-white'}`}
                      >
                        فيديو
                      </button>
                      <button
                        onClick={() => setDownloadType("audio")}
                        className={`flex-1 py-2 font-bold transition-all ${downloadType === 'audio' ? 'bg-egyptian-gold text-egyptian-black' : 'text-gray-500 hover:text-white'}`}
                      >
                        صوت (MP3)
                      </button>
                    </div>

                    {/* Quality Selector (if video) */}
                    {downloadType === "video" && (
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                          { label: "الأعلى", value: "best" },
                          { label: "1080p", value: "1080" },
                          { label: "720p", value: "720" },
                          { label: "480p", value: "480" }
                        ].map((q) => (
                          <button
                            key={q.value}
                            onClick={() => setQuality(q.value)}
                            className={`py-2 text-xs font-bold border-2 transition-all ${quality === q.value ? 'border-egyptian-gold bg-egyptian-gold/10 text-egyptian-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-egyptian-gold/20 text-gray-600 hover:border-egyptian-gold/50'}`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-egyptian-gold text-egyptian-black border-4 border-egyptian-black font-black py-5 text-2xl hover:bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_white] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center justify-center gap-3"
                      id="download-button"
                    >
                      <Download size={32} />
                      {downloadType === "audio" ? "تحميل الصوت" : "تحميل الفيديو"}
                    </button>
                  </div>
                </div>
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-egyptian-gold flex flex-col items-center justify-center gap-4 text-egyptian-black z-30"
                >
                  <CheckCircle2 size={80} className="animate-pulse" />
                  <h3 className="text-4xl font-black tracking-tighter">بدأ التحميل بالمهمة!</h3>
                  <div className="h-2 w-48 bg-egyptian-black/20 overflow-hidden mt-4">
                    <motion.div 
                      className="h-full bg-egyptian-black" 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <section className="z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { 
              title: "تعدد الجودات", 
              desc: "اختر الجودة التي تناسبك من 480p وحتى 4K حسب المصدر.", 
              icon: <div className="w-12 h-12 bg-egyptian-gold mb-4 flex items-center justify-center border-2 border-egyptian-black blocky-shadow-sm"><Download className="text-egyptian-black" size={24} /></div>
            },
            { 
              title: "تحويل إلى MP3", 
              desc: "استخرج الصوت من أي فيديو وحمله بجودة عالية وتنسيق MP3.", 
              icon: <div className="w-12 h-12 bg-egyptian-gold mb-4 flex items-center justify-center border-2 border-egyptian-black blocky-shadow-sm"><LinkIcon className="text-egyptian-black" size={24} /></div>
            },
            { 
              title: "بدون علامة مائية", 
              desc: "تحميل مباشر للفيديو الأصلي بدون أي شعارات أو علامات مائية مزعجة.", 
              icon: <div className="w-12 h-12 bg-egyptian-gold mb-4 flex items-center justify-center border-2 border-egyptian-black blocky-shadow-sm"><Flame className="text-egyptian-black" size={24} /></div>
            }
          ].map((feature, idx) => (
            <div key={idx} className="border-4 border-egyptian-gold p-8 bg-egyptian-surface hover:-translate-y-2 hover:blocky-shadow transition-all duration-300">
              {feature.icon}
              <h3 className="text-2xl font-black mb-3 text-egyptian-gold">{feature.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="h-16 bg-egyptian-gold text-egyptian-black flex items-center justify-center text-sm font-black uppercase tracking-[0.2em] px-4 text-center">
        © {new Date().getFullYear()} AHMOS VIDEO SAVIOR | POWERED BY EGYPTIAN TECH
      </footer>
    </div>
  );
}
