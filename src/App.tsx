import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WeddingDetails, WeddingThemeId, WeddingTheme } from "./types";
import { InvitationRenderer } from "./components/InvitationRenderer";
import { InvitationEditor } from "./components/InvitationEditor";
import { TEMPLATE_PRESETS, CATEGORIES } from "./data/templates";

// Import original bride and groom photos
import defaultGroomPhoto from "./assets/images/groom_original_photo_1783241442381.jpg";
import defaultBridePhoto from "./assets/images/bride_original_photo_1783241456790.jpg";
import { 
  Heart, 
  Sparkles, 
  Tv, 
  ChevronRight, 
  Music, 
  Award, 
  User, 
  MapPin, 
  Check, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  ArrowLeft,
  Flame,
  Star,
  Info,
  Palette,
  X,
  Play,
  Pause
} from "lucide-react";

// Default traditional details requested by user
const DEFAULT_WEDDING_DETAILS: WeddingDetails = {
  brideName: "Nayan Kumari",
  groomName: "Rahul Kumar",
  brideParents: "Shri Suresh Ji & Saroj Devi",
  groomParents: "Shri Vinod Ji & Jaymala Devi",
  brideAddress: "At + Post – Posdaha, Narpatganj, Araria, Bihar",
  groomAddress: "At + Post – Manikpur, Bihar",
  venue: "Narpatganj, Araria, Bihar",
  invitationMessage: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥\n\n॥ श्री गणेशाय नमः ॥\n\nWedding Invitation",
  closingMessage: "आपकी गरिमामयी उपस्थिति\nहमारे लिए परम सौभाग्य एवं हर्ष का विषय होगी।",
  bridePhoto: defaultBridePhoto,
  groomPhoto: defaultGroomPhoto,
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  musicId: "shehnai",
  themeId: "rajasthani",
  textColor: "#bf953f",
  secondaryTextColor: "#ffffff",
  textEffectId: "gold-foil",
  videoEffectId: "curtain-open",
  fieldStyles: {
    brideName: { fontFamily: "Great Vibes", fontSize: 80, align: "center", color: "gradient:royal-gold" },
    groomName: { fontFamily: "Great Vibes", fontSize: 80, align: "center", color: "gradient:royal-gold" },
    date: { fontFamily: "Inter", fontSize: 26, align: "center", color: "#ffffff" },
    venue: { fontFamily: "Inter", fontSize: 28, align: "center", color: "#dfc384" }
  },
  events: [
    { id: "haldi", name: "Haldi Ceremony", date: "11 July 2026", time: "11:00 AM onwards", description: "Applying auspicious turmeric paste" },
    { id: "mehndi", name: "Mehndi Ki Raat", date: "11 July 2026", time: "06:00 PM onwards", description: "Adorning the bride's hands with henna" },
    { id: "satsang", name: "Satsang Samaroh", date: "11 July 2026", time: "08:00 PM onwards", description: "Singing holy bhajans and prayers" },
    { id: "vivah", name: "Shubh Vivah (Wedding)", date: "12 July 2026", time: "07:00 PM onwards", description: "Sacred pheras and wedding rituals" },
    { id: "bhoj", name: "Bahu Bhoj (Reception)", date: "13 July 2026", time: "12:00 PM onwards", description: "Traditional grand wedding feast" }
  ]
};

export default function App() {
  const [view, setView] = useState<"home" | "studio" | "templates">("home");
  const [details, setDetails] = useState<WeddingDetails>(DEFAULT_WEDDING_DETAILS);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showGlowNotice, setShowGlowNotice] = useState<boolean>(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All Themes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exploreTheme, setExploreTheme] = useState<WeddingTheme | null>(null);
  
  const [isExploreAudioPlaying, setIsExploreAudioPlaying] = useState<boolean>(false);
  const exploreAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync effect to stop explore audio when modal is dismissed or changed
  useEffect(() => {
    if (exploreAudioRef.current) {
      exploreAudioRef.current.pause();
      exploreAudioRef.current = null;
      setIsExploreAudioPlaying(false);
    }

    if (exploreTheme) {
      let trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      if (exploreTheme.archeStyle === "temple") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      } else if (exploreTheme.archeStyle === "modern") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
      } else if (exploreTheme.archeStyle === "mandala") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
      }
      
      const audio = new Audio(trackUrl);
      audio.loop = true;
      exploreAudioRef.current = audio;
    }

    return () => {
      if (exploreAudioRef.current) {
        exploreAudioRef.current.pause();
      }
    };
  }, [exploreTheme]);

  const toggleExploreAudio = () => {
    if (!exploreAudioRef.current) return;
    if (isExploreAudioPlaying) {
      exploreAudioRef.current.pause();
      setIsExploreAudioPlaying(false);
    } else {
      // Pause master background audio to prevent clash
      if (isMusicPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
      exploreAudioRef.current.play().catch((err) => console.log("Audio play deferred", err));
      setIsExploreAudioPlaying(true);
    }
  };

  // Active Theme object
  const activeTheme = TEMPLATE_PRESETS.find((t) => t.id === details.themeId) || TEMPLATE_PRESETS[0];

  // Update theme helper
  const handleThemeChange = (themeId: WeddingThemeId) => {
    const selectedPreset = TEMPLATE_PRESETS.find((t) => t.id === themeId) || TEMPLATE_PRESETS[0];
    setDetails((prev) => {
      let trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      let trackId = "shehnai";
      if (selectedPreset.archeStyle === "temple") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
        trackId = "flute";
      } else if (selectedPreset.archeStyle === "modern") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
        trackId = "sitar";
      } else if (selectedPreset.archeStyle === "mandala") {
        trackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
        trackId = "chanting";
      }
      return {
        ...prev,
        themeId,
        musicUrl: trackUrl,
        musicId: trackId,
        textColor: selectedPreset.secondaryColor,
        secondaryTextColor: "#ffffff"
      };
    });
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Play a prefilled wedding template
  const loadTemplate = (themeId: WeddingThemeId) => {
    handleThemeChange(themeId);
    setView("studio");
  };

  return (
    <div className="min-h-screen bg-[#070402] text-gray-100 flex flex-col overflow-x-hidden font-sans select-none relative">
      
      {/* Background audio element */}
      <audio 
        ref={audioRef}
        src={details.musicUrl}
        loop
      />

      {/* Luxury Golden Sparkles Particle Canvas background for Home */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,135,40,0.15),rgba(0,0,0,0))] pointer-events-none z-0" />

      {/* HEADER DECK */}
      <header className="sticky top-0 bg-[#0f0b06]/95 border-b border-[#b38728]/30 px-6 py-4 flex justify-between items-center z-40 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-10 h-10 rounded-full border-2 border-gold-gradient flex items-center justify-center bg-black royal-glow">
            <Heart className="text-[#b38728] w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-gold-gradient font-bold tracking-wider text-base md:text-lg leading-tight uppercase">
              Royal Indian Invitation Studio
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">By Abhinav • Instagram: @ahirgaming2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMusic}
            className="p-2 rounded-full border border-[#bf953f]/30 bg-black text-[#fcf6ba] hover:bg-[#b38728]/20 transition-all cursor-pointer"
            title="Ambient Music Control"
          >
            {isMusicPlaying ? <Volume2 size={16} className="animate-bounce" /> : <VolumeX size={16} />}
          </button>
          
          <button 
            onClick={() => {
              if (view === "home") setView("studio");
              else setView("home");
            }}
            className="hidden sm:flex items-center gap-2 py-1.5 px-4 rounded bg-gold-gradient text-black font-bold uppercase tracking-wider text-[11px] hover:opacity-90 transition-all font-serif"
          >
            {view === "home" ? "Enter Studio" : "Home Dashboard"}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER PANELS */}
      <main className="flex-1 flex flex-col z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: LANDING HOME PAGE */}
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col max-w-7xl mx-auto w-full px-6 py-10 md:py-16 space-y-16"
            >
              {/* LARGE ROYAL HERO BANNER */}
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#bf953f]/40 bg-gradient-to-r from-amber-950/40 to-black text-[10px] uppercase font-mono tracking-widest text-[#fcf6ba] royal-glow">
                  <Award size={12} className="text-[#b38728]" /> Ultra Premium 3D Cinematic Videos
                </div>
                
                <h2 className="font-serif text-gold-gradient text-4xl md:text-6xl font-bold tracking-normal leading-tight uppercase drop-shadow-2xl">
                  Royal Indian <br /> Invitation Studio
                </h2>
                
                <p className="text-sm md:text-base text-gray-400 font-sans max-w-xl mx-auto leading-relaxed">
                  Design photorealistic, 4K wedding invitation video sequences loaded with temple bells, floating rose petals, traditional Sanskrit shlokas, and magnificent gold leaf. Completely inside your browser.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setView("studio")}
                    className="py-3 px-8 rounded-full bg-gold-gradient text-black font-serif font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 shadow-[0_0_30px_rgba(179,135,40,0.4)] cursor-pointer"
                  >
                    Create Video Now
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("presets-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="py-3 px-8 rounded-full border border-[#bf953f]/60 bg-black text-[#fcf6ba] font-serif font-bold uppercase tracking-wider text-sm transition-all hover:bg-[#b38728]/15 cursor-pointer"
                  >
                    Explore Presets
                  </button>
                </div>
              </div>

              {/* LIVE COUNTER / METADATA SUMMARY (Clean, non-larp) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
                {[
                  { value: "60 FPS HD", label: "Smooth Export Stream", icon: <Tv className="text-[#b38728] w-6 h-6" /> },
                  { value: "4 Custom Themes", label: "Rajasthani, South, Rose Gold, Celestial", icon: <Palette className="text-[#b38728] w-6 h-6" /> },
                  { value: "No Watermark", label: "Full 1080×1920 Cinematic", icon: <Check className="text-[#b38728] w-6 h-6" /> }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#120a04]/40 border border-[#b38728]/20 p-5 rounded-2xl flex items-center gap-4 hover:border-[#b38728]/40 transition-all">
                    <div className="p-3 bg-black rounded-xl border border-[#b38728]/30">
                      {stat.icon}
                    </div>
                    <div>
                      <h4 className="font-serif text-gold-gradient font-bold text-lg leading-tight">{stat.value}</h4>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* THEME PRESET CATALOGUE */}
              <div id="presets-section" className="space-y-8 pt-10 border-t border-gray-900">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/30 border border-[#b38728]/30 text-[10px] font-mono text-[#fcf6ba] uppercase tracking-wider">
                    ✨ 50+ Luxury 3D Templates
                  </div>
                  <h3 className="font-serif text-3xl text-gold-gradient font-bold uppercase tracking-wider">
                    Cinematic Template Catalogue
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xl mx-auto">
                    Choose from over 50+ premium 3D presets designed for different Indian cultural traditions, modern metallic palettes, and divine celestial constellations. Fully customizable.
                  </p>
                </div>

                {/* Filter and Search controls */}
                <div className="space-y-4 bg-[#0f0b06]/70 border border-[#b38728]/20 p-5 rounded-2xl">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-1.5 px-4 rounded-full text-[11px] font-serif uppercase tracking-wider font-bold whitespace-nowrap transition-all border ${
                          selectedCategory === cat
                            ? "bg-gold-gradient text-black border-transparent shadow-[0_0_12px_rgba(179,135,40,0.3)]"
                            : "bg-black/40 text-gray-400 border-gray-900 hover:text-white hover:border-gray-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search 50+ templates by name, tradition, region, color (e.g. Bihar, Royal, Rose Gold, Flute)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black border border-gray-900 text-xs p-3.5 pl-10 pr-4 text-gray-200 rounded-xl focus:outline-none focus:border-[#b38728] placeholder-gray-600 font-sans"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b38728]/60">
                      <Palette size={14} />
                    </div>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid display */}
                {(() => {
                  const filtered = TEMPLATE_PRESETS.filter((tpl) => {
                    const matchesCategory = selectedCategory === "All Themes" || tpl.category === selectedCategory;
                    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          (tpl.category && tpl.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                          (tpl.musicName && tpl.musicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                          (tpl.musicVibe && tpl.musicVibe.toLowerCase().includes(searchQuery.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 bg-black/20 border border-dashed border-gray-900 rounded-2xl">
                        <Palette className="mx-auto w-8 h-8 text-gray-600 mb-2" />
                        <h4 className="text-gray-400 font-serif text-sm">No Matching Templates Found</h4>
                        <p className="text-gray-600 text-[10px] mt-1">Try another search query or clear the filter.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {filtered.map((preset) => (
                        <div 
                          key={preset.id}
                          className="bg-[#0f0b06]/80 border border-[#b38728]/30 rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.02] hover:border-[#b38728]/70 transition-all group relative overflow-hidden"
                        >
                          <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-900/50">
                              <span className="text-[9px] uppercase font-mono tracking-wider text-[#bf953f] font-bold">
                                {preset.category || "Luxury Traditional"}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: preset.primaryColor }} title="Primary Theme" />
                                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: preset.secondaryColor }} title="Secondary Motif" />
                                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: preset.accentColor }} title="Accent Text" />
                              </div>
                            </div>
                            
                            <h4 className="font-serif text-sm text-[#fcf6ba] font-bold uppercase tracking-wide group-hover:text-white transition-colors">
                              {preset.name}
                            </h4>
                            
                            <p className="text-[11px] text-gray-400 leading-relaxed min-h-[48px] line-clamp-3">
                              {preset.description}
                            </p>
                            
                            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1 pt-1">
                              <span className="text-[#bf953f]">🎵 {preset.musicName}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setExploreTheme(preset)}
                            className="mt-4 w-full py-2 rounded bg-black group-hover:bg-gold-gradient group-hover:text-black border border-[#bf953f]/40 text-[#fcf6ba] text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer relative z-10 flex items-center justify-center gap-1.5"
                          >
                            Explore & Preview ✨
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* CREATOR SECTION / GALLERIES */}
              <div className="bg-gradient-to-r from-amber-950/20 via-black to-amber-950/20 border border-[#b38728]/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <h4 className="font-serif text-gold-gradient text-xl font-bold uppercase">
                    Designed by Abhinav • Instagram: @ahirgaming2.0
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This studio is fully built with advanced browser-side WebGL Canvas rendering pipelines, client-side recorders, and integration with the Gemini 3.5 Flash Model. You can generate custom print snaps, complete wedding card scrolls, or 60 FPS mobile videos totally watermark-free!
                  </p>
                  <div className="flex items-center gap-2.5 pt-1.5">
                    <span className="text-[10px] bg-black/60 border border-gray-800 text-gray-400 px-3 py-1 rounded-full font-mono">HTML5 / WebGL</span>
                    <span className="text-[10px] bg-black/60 border border-gray-800 text-gray-400 px-3 py-1 rounded-full font-mono">Three.js / GSAP</span>
                    <span className="text-[10px] bg-black/60 border border-gray-800 text-gray-400 px-3 py-1 rounded-full font-mono">Gemini AI</span>
                  </div>
                </div>

                <div className="flex flex-col items-center p-5 bg-black/70 border border-[#b38728]/20 rounded-2xl w-full md:max-w-xs text-center space-y-3">
                  <Smartphone className="w-10 h-10 text-[#b38728]" />
                  <h5 className="font-serif text-sm text-[#fcf6ba] uppercase font-bold">WhatsApp & Reels Format</h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Outputs are locked into the 1080×1920 (9:16) portrait grid, perfect for digital sharing and mobile displays.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* VIEW 2: FULL-STACK STUDIO WORKSPACE */}
          {view === "studio" && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex-grow flex flex-col w-full"
            >
              {/* Floating Notice */}
              {showGlowNotice && (
                <div className="bg-[#1b1105] border-b border-[#b38728]/30 px-6 py-2 flex justify-between items-center text-xs text-[#dfc384] font-serif">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#b38728] animate-bounce" />
                    <span><strong>Pro Tip:</strong> Click the <strong>\"Gemini AI Helper\"</strong> tab in the sidebar editor to let Google AI write stunning traditional shlokas & recommend raga colors!</span>
                  </div>
                  <button onClick={() => setShowGlowNotice(false)} className="hover:text-white ml-2 text-sm">✕</button>
                </div>
              )}

              {/* Split Screen Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
                
                {/* Column 1: Live Preview Canvas (Lg: spans 5) */}
                <div className="lg:col-span-5 flex flex-col justify-start">
                  {/* Back to Home Button */}
                  <button
                    onClick={() => setView("home")}
                    className="self-start py-2 px-4 rounded border border-gray-800 hover:border-gray-700 bg-black text-gray-300 hover:text-white text-xs font-serif uppercase tracking-wider mb-5 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft size={13} /> Return Dashboard
                  </button>

                  <InvitationRenderer
                    details={details}
                    currentTheme={activeTheme}
                    audioRef={audioRef}
                    isMusicPlaying={isMusicPlaying}
                    toggleMusic={toggleMusic}
                  />
                </div>

                {/* Column 2: Editor Deck (Lg: spans 7) */}
                <div className="lg:col-span-7 h-[calc(100vh-140px)] min-h-[500px]">
                  <InvitationEditor
                    details={details}
                    onChange={setDetails}
                    onThemeChange={handleThemeChange}
                  />
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b0805] border-t border-gray-900 py-6 px-6 text-center text-xs text-gray-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
        <div>
          © 2026 Royal Indian Invitation Studio. Built in India.
        </div>
        <div>
          Created by <span className="text-[#bf953f] font-serif font-bold">Abhinav</span> • Instagram: <a href="https://instagram.com/ahirgaming2.0" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#bf953f] transition-colors">@ahirgaming2.0</a>
        </div>
      </footer>

      {/* 3D ROYAL TEMPLATE EXPLORER MODAL */}
      <AnimatePresence>
        {exploreTheme && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#0f0b06] border-2 border-[#b38728]/50 rounded-3xl max-w-4xl w-full p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden shadow-[0_0_60px_rgba(179,135,40,0.35)]"
            >
              {/* Gold Ornamental Background Corner Accents */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#b38728]/20 rounded-tl-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#b38728]/20 rounded-tr-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#b38728]/20 rounded-bl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#b38728]/20 rounded-br-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setExploreTheme(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-gray-900 bg-black/80 text-gray-400 hover:text-white hover:border-[#b38728]/50 transition-all cursor-pointer z-20"
                title="Close Explorer"
              >
                <X size={18} />
              </button>

              {/* LEFT COLUMN: THE INTERACTIVE LIVE-ANIMATED SMARTPHONE MOCKUP PREVIEW */}
              <div className="w-full md:w-[320px] shrink-0 flex flex-col items-center justify-center">
                <div 
                  className="w-full aspect-[9/16] rounded-2xl p-6 relative overflow-hidden shadow-2xl border-4 border-[#b38728]/30 flex flex-col justify-between"
                  style={{ backgroundColor: exploreTheme.backgroundColor }}
                >
                  {/* Subtle ambient card shadow glow */}
                  <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />

                  {/* LIVE FLOATING SIMULATED PARTICLES IN THE EXPLORER CARD */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    {Array.from({ length: 15 }).map((_, idx) => {
                      const size = Math.random() * 8 + 4;
                      const delay = Math.random() * 8;
                      const duration = Math.random() * 4 + 4;
                      const left = Math.random() * 100;
                      const rot = Math.random() * 360;
                      const isGoldDust = exploreTheme.particleType === "gold-dust" || exploreTheme.particleType === "sparkles";
                      const color = isGoldDust ? "rgba(252, 246, 186, 0.7)" : "#ff4d6d";
                      
                      return (
                        <div
                          key={idx}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            left: `${left}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            background: exploreTheme.particleType === "marigold" 
                              ? "radial-gradient(circle, #ffb703 0%, #fb8500 100%)"
                              : exploreTheme.particleType === "rose-petals"
                              ? "radial-gradient(circle, #ff4d6d 0%, #800f2f 100%)"
                              : color,
                            top: `-20px`,
                            opacity: Math.random() * 0.7 + 0.3,
                            animation: `float-down-${idx % 3} ${duration}s linear infinite`,
                            animationDelay: `${delay}s`,
                            transform: `rotate(${rot}deg)`
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Dynamic CSS animations styles injected inline for safe zero-dependency simulation */}
                  <style>{`
                    @keyframes float-down-0 {
                      0% { top: -20px; transform: translateX(0) rotate(0deg); }
                      50% { transform: translateX(15px) rotate(180deg); }
                      100% { top: 110%; transform: translateX(-10px) rotate(360deg); }
                    }
                    @keyframes float-down-1 {
                      0% { top: -20px; transform: translateX(0) rotate(0deg); }
                      40% { transform: translateX(-20px) rotate(120deg); }
                      100% { top: 110%; transform: translateX(10px) rotate(360deg); }
                    }
                    @keyframes float-down-2 {
                      0% { top: -20px; transform: translateX(0) rotate(0deg); }
                      60% { transform: translateX(25px) rotate(240deg); }
                      100% { top: 110%; transform: translateX(-25px) rotate(360deg); }
                    }
                  `}</style>

                  {/* Arch Ornamental Frame inside simulated card */}
                  <div className="absolute inset-2 border border-[#b38728]/15 rounded-xl pointer-events-none" />
                  
                  {exploreTheme.archeStyle === "palace" && (
                    <div className="absolute inset-x-4 top-4 h-12 border-t-2 border-x-2 border-[#b38728]/30 rounded-t-full pointer-events-none" />
                  )}
                  {exploreTheme.archeStyle === "temple" && (
                    <div className="absolute inset-x-4 top-4 h-16 border-t-2 border-x-2 border-dashed border-[#b38728]/25 rounded-t pointer-events-none" />
                  )}
                  {exploreTheme.archeStyle === "mandala" && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-dashed border-[#b38728]/15 rounded-full animate-[spin_50s_linear_infinite] pointer-events-none" />
                  )}

                  {/* Motif Top Emblem */}
                  <div className="text-center pt-4 relative z-10">
                    <div className="inline-block px-3 py-1 rounded border border-[#b38728]/20 bg-black/60 text-[9px] font-mono tracking-widest text-[#fcf6ba] uppercase">
                      ॐ SHUBH VIVAH ॐ
                    </div>
                  </div>

                  {/* Main Wedding Text mockups */}
                  <div className="text-center space-y-3 relative z-10 flex-grow flex flex-col justify-center items-center">
                    <Heart className="w-8 h-8 text-[#bf953f] animate-pulse" />
                    
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-[#bf953f]">Wedding of</p>
                      <h4 className="font-serif text-xl font-bold tracking-normal uppercase" style={{ color: exploreTheme.secondaryColor }}>
                        {details.brideName.split(" ")[0]}
                      </h4>
                      <p className="text-[10px] font-serif text-gray-400 italic">and</p>
                      <h4 className="font-serif text-xl font-bold tracking-normal uppercase" style={{ color: exploreTheme.secondaryColor }}>
                        {details.groomName.split(" ")[0]}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-[#b38728]/10 w-2/3 mx-auto">
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{details.events[0]?.date || "DECEMBER 2026"}</p>
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">{details.events[0]?.time || "WEDDING CEREMONY"}</p>
                    </div>
                  </div>

                  {/* Card Footer Motif */}
                  <div className="text-center pb-4 relative z-10">
                    <p className="text-[8px] font-mono text-[#bf953f]/60 uppercase tracking-widest">👑 Royal 3D invitation card scroll</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-500 font-mono mt-3 text-center">
                  Live physics-based particle & shade simulation
                </p>
              </div>

              {/* RIGHT COLUMN: DETAIL METADATA AND LAUNCH CONTROLS */}
              <div className="flex-grow flex flex-col justify-between space-y-6">
                
                {/* Header Information */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-950/40 border border-[#b38728]/30 text-[10px] font-mono font-bold text-[#fcf6ba] uppercase tracking-wide">
                      {exploreTheme.category || "Traditional Heritage"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-gray-900 text-[9px] font-mono text-gray-500 uppercase">
                      Style: {exploreTheme.archeStyle}
                    </span>
                  </div>

                  <h3 className="font-serif text-gold-gradient text-3xl md:text-4xl font-bold uppercase tracking-wider leading-tight">
                    {exploreTheme.name}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans border-l-2 border-[#b38728]/30 pl-3">
                    {exploreTheme.description}
                  </p>
                </div>

                {/* Technical Aesthetic Breakdown (Colors & Motifs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 border border-gray-900 p-4 rounded-2xl">
                  {/* Theme Colors */}
                  <div className="space-y-2">
                    <h5 className="font-serif text-[11px] text-[#fcf6ba] uppercase tracking-wider flex items-center gap-1.5">
                      <Palette size={12} className="text-[#bf953f]" /> Master Palette Swatches
                    </h5>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-gray-800 shadow-inner" style={{ backgroundColor: exploreTheme.primaryColor }} />
                        <span className="text-[10px] text-gray-400 font-mono uppercase">{exploreTheme.primaryColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-gray-800 shadow-inner" style={{ backgroundColor: exploreTheme.secondaryColor }} />
                        <span className="text-[10px] text-gray-400 font-mono uppercase">{exploreTheme.secondaryColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-gray-800 shadow-inner" style={{ backgroundColor: exploreTheme.accentColor }} />
                        <span className="text-[10px] text-gray-400 font-mono uppercase">{exploreTheme.accentColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ambient Soundtrack Selection */}
                  <div className="space-y-2">
                    <h5 className="font-serif text-[11px] text-[#fcf6ba] uppercase tracking-wider flex items-center gap-1.5">
                      <Music size={12} className="text-[#bf953f]" /> Prescribed Auspicious Raga
                    </h5>
                    <div className="text-[11px] text-gray-400 font-mono leading-tight">
                      <p className="text-[#bf953f] font-serif font-bold">{exploreTheme.musicName}</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">{exploreTheme.musicVibe}</p>
                    </div>
                  </div>
                </div>

                {/* LISTEN PREVIEW SECTION */}
                <div className="bg-[#120a05]/60 border border-[#b38728]/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleExploreAudio}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        isExploreAudioPlaying 
                          ? "bg-[#bf953f] text-black border-transparent shadow-[0_0_12px_rgba(179,135,40,0.5)]" 
                          : "bg-black text-[#fcf6ba] border-[#bf953f]/30 hover:bg-[#b38728]/10"
                      }`}
                      title={isExploreAudioPlaying ? "Pause Audio Preview" : "Play Audio Preview"}
                    >
                      {isExploreAudioPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    <div>
                      <h4 className="font-serif text-xs text-white uppercase font-bold tracking-wide">
                        {isExploreAudioPlaying ? "Now Listening..." : "Listen Soundtrack Vibe"}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {isExploreAudioPlaying ? "Authentic cultural shehnai/instrumental loop" : "Tap play to listen to this template's specific audio raga"}
                      </p>
                    </div>
                  </div>

                  {/* Animated Waveform when playing */}
                  {isExploreAudioPlaying && (
                    <div className="flex items-end gap-0.5 h-6 shrink-0 pr-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-gradient-to-t from-[#bf953f] to-[#fcf6ba] rounded animate-[sound-wave_1s_ease-in-out_infinite_alternate]"
                          style={{
                            height: "100%",
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                      <style>{`
                        @keyframes sound-wave {
                          0% { height: 20%; }
                          100% { height: 100%; }
                        }
                      `}</style>
                    </div>
                  )}
                </div>

                {/* Action CTA Group */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => {
                      // Apply theme, stop any active preview audio, and redirect to Studio with master music playing!
                      if (exploreAudioRef.current) {
                        exploreAudioRef.current.pause();
                        exploreAudioRef.current = null;
                        setIsExploreAudioPlaying(false);
                      }
                      
                      loadTemplate(exploreTheme.id);
                      setExploreTheme(null);
                      // Turn on the master background music immediately to complete the majestic experience!
                      setTimeout(() => {
                        setIsMusicPlaying(true);
                        if (audioRef.current) {
                          audioRef.current.play().catch(e => console.log("Master play deferred", e));
                        }
                      }, 100);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-gold-gradient text-black font-serif font-bold uppercase tracking-wider text-xs transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(179,135,40,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    👑 Customize & Launch Template
                  </button>

                  <button
                    onClick={() => setExploreTheme(null)}
                    className="px-6 py-3.5 rounded-xl border border-gray-800 bg-black text-gray-400 hover:text-white hover:border-gray-700 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back to Catalogue
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
