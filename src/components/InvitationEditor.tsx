import React, { useState } from "react";
import { WeddingDetails, WeddingEvent, WeddingThemeId } from "../types";
import { Sparkles, Calendar, MapPin, Music, Palette, User, Heart, ChevronRight, Eye, RefreshCw, Upload, AlignLeft, AlignCenter, AlignRight, Video } from "lucide-react";
import { TEMPLATE_PRESETS, CATEGORIES } from "../data/templates";

interface InvitationEditorProps {
  details: WeddingDetails;
  onChange: (updated: WeddingDetails) => void;
  onThemeChange: (themeId: WeddingThemeId) => void;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  details,
  onChange,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<"couple" | "events" | "styling" | "ai">("couple");
  
  // Compact editor theme selector state
  const [editorCategory, setEditorCategory] = useState<string>("All Themes");
  const [editorSearch, setEditorSearch] = useState<string>("");
  
  // AI assistant local state
  const [aiStyle, setAiStyle] = useState<string>("Rajasthani Palace");
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isAiAestheticsLoading, setIsAiAestheticsLoading] = useState<boolean>(false);
  const [aiSuggestionMessage, setAiSuggestionMessage] = useState<string>("");

  // Granular text editing state
  const [selectedFieldStyleKey, setSelectedFieldStyleKey] = useState<"brideName" | "groomName" | "date" | "venue">("brideName");

  // Handler for text inputs
  const handleTextChange = (field: keyof WeddingDetails, value: string) => {
    onChange({ ...details, [field]: value });
  };

  // Handler for individual event change
  const handleEventChange = (index: number, field: keyof WeddingEvent, value: string) => {
    const updatedEvents = [...details.events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    onChange({ ...details, events: updatedEvents });
  };

  // Upload Bride Photo
  const handleBridePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ ...details, bridePhoto: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Groom Photo
  const handleGroomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ ...details, groomPhoto: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Background Music
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ ...details, musicUrl: event.target.result as string, musicId: "custom" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Built-in Music Selection
  const selectBuiltInMusic = (musicId: string, url: string) => {
    onChange({ ...details, musicId, musicUrl: url });
  };

  // Calling Gemini to Generate Luxury Content
  const generateAIIvitation = async () => {
    setIsAiGenerating(true);
    setAiSuggestionMessage("");
    try {
      const response = await fetch("/api/gemini/generate-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: details.brideName,
          groomName: details.groomName,
          brideParents: details.brideParents,
          groomParents: details.groomParents,
          venue: details.venue,
          style: aiStyle,
          customPrompt: aiCustomPrompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to invoke AI Writer");
      const data = await response.json();

      if (data.shloka) {
        onChange({
          ...details,
          invitationMessage: `${data.shloka}\n\nTranslation:\n${data.shlokaTranslation}`,
          closingMessage: `${data.welcomeMessage}\n\n${data.lovePoem}\n\n${data.closingBlessing}`,
        });
        setAiSuggestionMessage("✨ Royal Wedding Script successfully written by Gemini AI! Loaded directly into text cards.");
      }
    } catch (err: any) {
      console.error(err);
      setAiSuggestionMessage("⚠️ Could not invoke Gemini Writer. Please check your setup.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Calling Gemini to Recommend regional aesthetics
  const suggestAIAesthetics = async () => {
    setIsAiAestheticsLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-aesthetics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionalVibe: aiStyle }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      let themeToSet: WeddingThemeId = "rajasthani";
      if (aiStyle.toLowerCase().includes("temple") || aiStyle.toLowerCase().includes("south")) {
        themeToSet = "temple";
      } else if (aiStyle.toLowerCase().includes("rose") || aiStyle.toLowerCase().includes("champagne")) {
        themeToSet = "rosegold";
      } else if (aiStyle.toLowerCase().includes("vedic") || aiStyle.toLowerCase().includes("stars")) {
        themeToSet = "celestial";
      }

      onThemeChange(themeToSet);
      setAiSuggestionMessage(`🎨 Aesthetic Advice: Recommending colors ${data.colors?.primary}, secondary ${data.colors?.secondary}. Vibe: ${data.decorStyle}. Music style: ${data.musicVibe}. Setting theme to ${themeToSet.toUpperCase()}!`);
    } catch (err) {
      setAiSuggestionMessage("⚠️ Couldn't fetch aesthetic palette from Gemini.");
    } finally {
      setIsAiAestheticsLoading(false);
    }
  };

  const defaultMusicTracks = [
    { id: "shehnai", name: "Royal Shehnai (Auspicious)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // high quality royalty free
    { id: "flute", name: "Divine flute of Vrindavan", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "sitar", name: "Royal Sitar & Tabla", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "chanting", name: "Sacred Vedic Chanting", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#090603] border border-[#b38728]/30 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Tabs Navigation */}
      <div className="flex bg-[#120c06] border-b border-[#b38728]/20 text-xs font-serif uppercase tracking-wider font-bold">
        {[
          { id: "couple", label: "Couple Details", icon: <User size={13} /> },
          { id: "events", label: "Events & Dates", icon: <Calendar size={13} /> },
          { id: "styling", label: "Music & Styles", icon: <Music size={13} /> },
          { id: "ai", label: "Gemini AI Helper", icon: <Sparkles size={13} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-1.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#b38728] text-[#fcf6ba] bg-[#b38728]/10"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline text-[11px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Editor Scroll Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-gray-300">
        
        {/* TAB 1: COUPLE DETAILS */}
        {activeTab === "couple" && (
          <div className="space-y-4">
            <h4 className="font-serif text-gold-gradient text-sm font-bold uppercase tracking-wider border-b border-gray-900 pb-2 flex items-center gap-2">
              <Heart size={14} className="text-[#b38728]" />
              Bride & Groom Particulars
            </h4>

            {/* Groom Details */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Groom (वर)</h5>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Groom's Name</label>
                <input
                  type="text"
                  value={details.groomName}
                  onChange={(e) => handleTextChange("groomName", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gold-gradient text-sm p-2 rounded focus:border-[#b38728] focus:outline-none font-serif"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Groom's Parents (S/O Shri...)</label>
                <input
                  type="text"
                  value={details.groomParents}
                  onChange={(e) => handleTextChange("groomParents", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-sm p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Groom's Address</label>
                <input
                  type="text"
                  value={details.groomAddress}
                  onChange={(e) => handleTextChange("groomAddress", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-sm p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Upload Groom Photo</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-1.5 px-3 bg-[#1e1106] hover:bg-[#2b1b0d] border border-[#bf953f]/40 rounded text-xs text-[#dfc384] flex items-center gap-1.5">
                    <Upload size={12} /> Choose JPG/PNG
                    <input type="file" accept="image/*" className="hidden" onChange={handleGroomPhotoUpload} />
                  </label>
                  {details.groomPhoto && <span className="text-[10px] text-emerald-400 font-mono">✓ Image Attached</span>}
                </div>
              </div>
            </div>

            {/* Bride Details */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Bride (वधू)</h5>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Bride's Name</label>
                <input
                  type="text"
                  value={details.brideName}
                  onChange={(e) => handleTextChange("brideName", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gold-gradient text-sm p-2 rounded focus:border-[#b38728] focus:outline-none font-serif"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Bride's Parents (D/O Shri...)</label>
                <input
                  type="text"
                  value={details.brideParents}
                  onChange={(e) => handleTextChange("brideParents", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-sm p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Bride's Address</label>
                <input
                  type="text"
                  value={details.brideAddress}
                  onChange={(e) => handleTextChange("brideAddress", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-sm p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Upload Bride Photo</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-1.5 px-3 bg-[#1e1106] hover:bg-[#2b1b0d] border border-[#bf953f]/40 rounded text-xs text-[#dfc384] flex items-center gap-1.5">
                    <Upload size={12} /> Choose JPG/PNG
                    <input type="file" accept="image/*" className="hidden" onChange={handleBridePhotoUpload} />
                  </label>
                  {details.bridePhoto && <span className="text-[10px] text-emerald-400 font-mono">✓ Image Attached</span>}
                </div>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Wedding Venue</h5>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Full Address & Details</label>
                <textarea
                  rows={2}
                  value={details.venue}
                  onChange={(e) => handleTextChange("venue", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-xs p-2 rounded focus:border-[#b38728] focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS TIMELINE */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <h4 className="font-serif text-gold-gradient text-sm font-bold uppercase tracking-wider border-b border-gray-900 pb-2 flex items-center gap-2">
              <Calendar size={14} className="text-[#b38728]" />
              Ceremonies & Timeline
            </h4>
            <p className="text-[11px] text-gray-400 font-sans italic leading-relaxed">
              Customize the dates and descriptions for the main pre-wedding, wedding, and reception rituals.
            </p>

            <div className="space-y-3">
              {details.events.map((ev, idx) => (
                <div key={ev.id} className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-900 pb-1.5 mb-1.5">
                    <span className="text-xs font-serif text-[#fcf6ba] font-bold uppercase">{idx + 1}. {ev.name}</span>
                    <input
                      type="text"
                      value={ev.name}
                      onChange={(e) => handleEventChange(idx, "name", e.target.value)}
                      className="bg-black border border-gray-950 text-[10px] text-right text-[#b38728] px-1 py-0.5 max-w-[130px] rounded"
                      placeholder="Rename ceremony"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500 font-mono uppercase block mb-1">Date</label>
                      <input
                        type="text"
                        value={ev.date}
                        onChange={(e) => handleEventChange(idx, "date", e.target.value)}
                        className="w-full bg-black border border-gray-900 text-xs p-1.5 text-gray-300 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 font-mono uppercase block mb-1">Time</label>
                      <input
                        type="text"
                        value={ev.time}
                        onChange={(e) => handleEventChange(idx, "time", e.target.value)}
                        className="w-full bg-black border border-gray-900 text-xs p-1.5 text-gray-300 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 font-mono uppercase block mb-1">Description / Mantra / Subtitle</label>
                    <input
                      type="text"
                      value={ev.description}
                      onChange={(e) => handleEventChange(idx, "description", e.target.value)}
                      className="w-full bg-black border border-gray-900 text-xs p-1.5 text-gray-300 rounded focus:outline-none italic"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STYLING & MUSIC */}
        {activeTab === "styling" && (
          <div className="space-y-4">
            <h4 className="font-serif text-gold-gradient text-sm font-bold uppercase tracking-wider border-b border-gray-900 pb-2 flex items-center gap-2">
              <Palette size={14} className="text-[#b38728]" />
              Royal Music & Cinematic Themes
            </h4>

            {/* User live preview tip banner */}
            <div className="bg-amber-950/20 border border-[#b38728]/30 rounded-xl p-3 text-[11px] text-[#dfc384] leading-relaxed flex items-start gap-2">
              <Sparkles size={14} className="text-[#b38728] shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>Live Exploration:</strong> Click any template below to instantly load its authentic soundtrack, 3D particles, and custom traditional borders on the live canvas on the left!
              </span>
            </div>

            {/* Theme Vibe Selectors */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Cinematic 3D Theme Select ({TEMPLATE_PRESETS.length} presets)</h5>
                {details.themeId && (
                  <span className="text-[10px] text-[#bf953f] font-mono uppercase bg-amber-950/40 px-2 py-0.5 rounded border border-[#b38728]/20">
                    Active: {TEMPLATE_PRESETS.find(p => p.id === details.themeId)?.name || details.themeId}
                  </span>
                )}
              </div>

              {/* Compact Horiz Category scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-gray-900/40">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditorCategory(cat)}
                    className={`py-1 px-2.5 rounded text-[10px] font-mono tracking-tight whitespace-nowrap transition-all ${
                      editorCategory === cat
                        ? "bg-[#bf953f]/20 text-[#fcf6ba] border border-[#b38728]/40"
                        : "bg-black/30 text-gray-500 border border-transparent hover:text-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Compact Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter templates..."
                  value={editorSearch}
                  onChange={(e) => setEditorSearch(e.target.value)}
                  className="w-full bg-black border border-gray-900 text-[11px] py-1.5 pl-7 pr-4 text-gray-300 rounded focus:outline-none focus:border-[#b38728] placeholder-gray-700"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600">
                  <Palette size={11} />
                </div>
              </div>

              {/* Scrollable Compact Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {(() => {
                  const filtered = TEMPLATE_PRESETS.filter((tpl) => {
                    const matchesCategory = editorCategory === "All Themes" || tpl.category === editorCategory;
                    const matchesSearch = tpl.name.toLowerCase().includes(editorSearch.toLowerCase()) || 
                                          tpl.description.toLowerCase().includes(editorSearch.toLowerCase()) || 
                                          (tpl.category && tpl.category.toLowerCase().includes(editorSearch.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-6 text-[10px] text-gray-600">
                        No presets match filters
                      </div>
                    );
                  }

                  return filtered.map((th) => {
                    const isActive = details.themeId === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => onThemeChange(th.id)}
                        className={`p-2 rounded text-left transition-all relative overflow-hidden border ${
                          isActive
                            ? "border-[#b38728] bg-[#bf953f]/10 text-white"
                            : "border-gray-900 bg-black/40 text-gray-400 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 justify-between">
                          <span className="text-[11px] font-serif font-bold truncate pr-1 text-gray-200 group-hover:text-white">
                            {th.name}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.primaryColor }} />
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.secondaryColor }} />
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 font-sans block leading-tight line-clamp-1">
                          {th.description}
                        </span>
                        {isActive && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-[#b38728] text-black flex items-center justify-center rounded-bl font-bold text-[7px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Back Music Library */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Background Raga & Soundtracks</h5>
              <p className="text-[10px] text-gray-400">
                Choose a pre-selected divine audio track or upload your own devotional wedding music.
              </p>

              {/* Upload Music */}
              <div className="mb-3">
                <label className="cursor-pointer py-1.5 px-3 bg-[#1c1206] hover:bg-[#2b1b0d] border border-[#bf953f]/40 rounded text-xs text-[#dfc384] flex items-center justify-center gap-2 w-full transition-all">
                  <Upload size={12} /> Upload Custom Wedding MP3
                  <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
                </label>
                {details.musicId === "custom" && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono text-center">✓ Custom audio file active</p>
                )}
              </div>

              {/* Default List */}
              <div className="space-y-1.5">
                {defaultMusicTracks.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => selectBuiltInMusic(tr.id, tr.url)}
                    className={`w-full py-2 px-3 text-left text-xs rounded border transition-all ${
                      details.musicId === tr.id
                        ? "bg-[#bf953f]/10 text-[#fcf6ba] border-[#b38728]"
                        : "bg-black/30 text-gray-400 border-transparent hover:bg-black/50"
                    }`}
                  >
                    🎵 {tr.name}
                  </button>
                ))}
              </div>
            </div>

            {/* TEXT EFFECTS & COLORS CUSTOMIZATION */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-4">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide flex items-center gap-2">
                <Sparkles size={13} className="text-[#b38728]" />
                Royal Font Typography & Animations
              </h5>
              
              {/* Primary & Secondary Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Primary Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={details.textColor || "#bf953f"}
                      onChange={(e) => handleTextChange("textColor", e.target.value)}
                      className="w-8 h-8 rounded border border-[#b38728]/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={details.textColor || "#bf953f"}
                      onChange={(e) => handleTextChange("textColor", e.target.value)}
                      className="flex-1 bg-black border border-gray-800 text-gray-300 text-xs px-2 py-1 rounded focus:outline-none focus:border-[#b38728] font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { hex: "#bf953f", name: "Gold" },
                      { hex: "#f27e2b", name: "Saffron" },
                      { hex: "#e52b50", name: "Ruby" },
                      { hex: "#e5b1a5", name: "Rose" },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleTextChange("textColor", col.hex)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 border border-gray-950 text-gray-400 hover:text-white"
                        style={{ borderLeft: `3px solid ${col.hex}` }}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Secondary Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={details.secondaryTextColor || "#ffffff"}
                      onChange={(e) => handleTextChange("secondaryTextColor", e.target.value)}
                      className="w-8 h-8 rounded border border-[#b38728]/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={details.secondaryTextColor || "#ffffff"}
                      onChange={(e) => handleTextChange("secondaryTextColor", e.target.value)}
                      className="flex-1 bg-black border border-gray-800 text-gray-300 text-xs px-2 py-1 rounded focus:outline-none focus:border-[#b38728] font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { hex: "#ffffff", name: "Pure" },
                      { hex: "#fff7ed", name: "Cream" },
                      { hex: "#fcf6ba", name: "Chiffon" },
                      { hex: "#e2e8f0", name: "Silver" },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleTextChange("secondaryTextColor", col.hex)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 border border-gray-950 text-gray-400 hover:text-white"
                        style={{ borderLeft: `3px solid ${col.hex}` }}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10+ Text Effects Selector */}
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Select Text Animation Effect (10+ Options)</label>
                <select
                  value={details.textEffectId || "gold-foil"}
                  onChange={(e) => handleTextChange("textEffectId", e.target.value)}
                  className="w-full bg-black text-[#dfc384] text-xs py-2 px-3 border border-[#bf953f]/40 rounded focus:outline-none"
                >
                  <option value="gold-foil">✨ Shining Gold Foil Shimmer (Dynamic Metallic Glow)</option>
                  <option value="divine-glow">🔥 Divine Aura Glow (Warm Radiant Halo Pulsing)</option>
                  <option value="typewriter">✍️ Vedic Typewriter Reveal (Progressive Letter Stroke)</option>
                  <option value="cinematic-fade">🎬 Celestial Zoom Fade-In (High-End Cinema Entrance)</option>
                  <option value="double-shadow">👥 Royal Silhouette (High Contrast Double Drop Shadow)</option>
                  <option value="stroke-outline">🔲 Golden Border Stroke Outline (Elegant Filled Borders)</option>
                  <option value="wave-floating">🌊 Sinusoidal Float (Ethereal Gently Floating Wave)</option>
                  <option value="chroma-shift">🌈 Chromatic Flare Separation (Premium Red-Gold Shift)</option>
                  <option value="bouncy-entrance">🎈 Joyous Bounce Entrance (Playful Celebration Bounce)</option>
                  <option value="slow-zoom">🔍 Kinetic Camera Zoom (Subtle Drift Animation)</option>
                  <option value="sparkle-vertex">⭐ Stardust Sparkles (Glittering Vertices over Font)</option>
                </select>
                <p className="text-[10px] text-gray-500 font-sans mt-1">
                  * Note: Text effects apply live inside the portrait sequence animations as cards move.
                </p>
              </div>

              {/* Cinematic Intro Overlays */}
              <div className="border-t border-[#b38728]/10 pt-4 space-y-3">
                <h5 className="font-serif text-[11px] text-[#fcf6ba] uppercase tracking-wide flex items-center gap-1.5">
                  <Video size={13} className="text-[#b38728]" />
                  Cinematic Intro Overlay Transition
                </h5>
                <p className="text-[10px] text-gray-400">
                  Select an elegant dramatic opening overlay that runs at the beginning of the invitation (the Lord Ganesha scene).
                </p>

                <select
                  value={details.videoEffectId || "curtain-open"}
                  onChange={(e) => handleTextChange("videoEffectId", e.target.value)}
                  className="w-full bg-black text-[#dfc384] text-xs py-2 px-3 border border-[#bf953f]/30 rounded focus:outline-none focus:border-[#b38728] font-sans"
                >
                  <option value="curtain-open">🎪 Royal Velvet Curtain Opening (Parda Khulna)</option>
                  <option value="sliding-gates">🏛️ Temple Golden Gates Sliding (Sone Ka Dwar)</option>
                  <option value="saffron-smoke">💨 Saffron Mystic Smoke (Pavandev Cloud Reveal)</option>
                  <option value="flower-shower">🌸 Sacred Pushpa Varsha (Luxe Marigold & Rose Shower)</option>
                  <option value="none">❌ No Overlay Transition (Clean Cinematic Cut)</option>
                </select>
                <p className="text-[9px] text-gray-500 font-sans">
                  * Dynamic transitions are simulated live at 60 FPS using Vector Canvas physics, and are baked into WebM video exports.
                </p>
              </div>
            </div>

            {/* GRANULAR TYPOGRAPHY & FIELD STYLES */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-4">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide flex items-center gap-2">
                <Palette size={13} className="text-[#b38728]" />
                Granular Typography & Text Style
              </h5>
              <p className="text-[10px] text-gray-400">
                Pick an individual text field below to customize its font family, size, alignment, and luxury gold gradient colors.
              </p>

              {/* Field Target Select Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-gray-900/50">
                {[
                  { key: "brideName", label: "👰 Bride Name" },
                  { key: "groomName", label: "🤵 Groom Name" },
                  { key: "date", label: "📅 Wedding Date" },
                  { key: "venue", label: "📍 Venue" }
                ].map((item) => {
                  const isActive = selectedFieldStyleKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedFieldStyleKey(item.key as any)}
                      className={`py-1 px-2.5 rounded text-[10px] font-mono tracking-tight whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-[#bf953f]/20 text-[#fcf6ba] border border-[#b38728]/40"
                          : "bg-black/30 text-gray-500 border border-transparent hover:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Controls for current selected field */}
              {(() => {
                const currentFieldStyle = details.fieldStyles?.[selectedFieldStyleKey] || {
                  fontFamily: selectedFieldStyleKey === "brideName" || selectedFieldStyleKey === "groomName" ? "Great Vibes" : "Inter",
                  fontSize: selectedFieldStyleKey === "brideName" || selectedFieldStyleKey === "groomName" ? 80 : selectedFieldStyleKey === "date" ? 26 : 28,
                  align: "center",
                  color: selectedFieldStyleKey === "brideName" || selectedFieldStyleKey === "groomName" ? "gradient:royal-gold" : "#ffffff"
                };

                const updateFieldStyle = (key: string, value: any) => {
                  const updatedStyles = {
                    ...details.fieldStyles,
                    [selectedFieldStyleKey]: {
                      ...currentFieldStyle,
                      [key]: value
                    }
                  };
                  onChange({
                    ...details,
                    fieldStyles: updatedStyles
                  });
                };

                return (
                  <div className="space-y-3 pt-1">
                    {/* 1. Font Family Picker */}
                    <div>
                      <label className="text-[9px] text-gray-400 font-mono uppercase block mb-1">Font Family</label>
                      <select
                        value={currentFieldStyle.fontFamily || "Inter"}
                        onChange={(e) => updateFieldStyle("fontFamily", e.target.value)}
                        className="w-full bg-black text-[#dfc384] text-xs py-1.5 px-2 border border-gray-900 rounded focus:outline-none focus:border-[#b38728]"
                      >
                        <option value="Great Vibes">🌸 Great Vibes (Romantic Calligraphy)</option>
                        <option value="Cinzel">🏛️ Cinzel (Royal Roman Serif)</option>
                        <option value="Yatra One">🔱 Yatra One (Traditional Devanagari Style)</option>
                        <option value="Playfair Display">📖 Playfair Display (Elegant Editorial)</option>
                        <option value="Alex Brush">✒️ Alex Brush (Fluid Formal Script)</option>
                        <option value="Montserrat">⚙️ Montserrat (Modern Premium Sans)</option>
                        <option value="Parisienne">🎀 Parisienne (Chic French Script)</option>
                        <option value="Pinyon Script">🏰 Pinyon Script (Spencerian Script)</option>
                        <option value="Inter">💻 Inter (Clean Swiss Modern)</option>
                      </select>
                    </div>

                    {/* 2. Font Size Slider & Alignment Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] text-gray-400 font-mono uppercase">Font Size</label>
                          <span className="text-[10px] text-[#bf953f] font-mono">{currentFieldStyle.fontSize || 32}px</span>
                        </div>
                        <input
                          type="range"
                          min={selectedFieldStyleKey === "brideName" || selectedFieldStyleKey === "groomName" ? "30" : "14"}
                          max={selectedFieldStyleKey === "brideName" || selectedFieldStyleKey === "groomName" ? "150" : "60"}
                          value={currentFieldStyle.fontSize || 32}
                          onChange={(e) => updateFieldStyle("fontSize", parseInt(e.target.value))}
                          className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#bf953f]"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-400 font-mono uppercase block mb-1">Text Alignment</label>
                        <div className="grid grid-cols-3 gap-1 bg-black border border-gray-900 p-0.5 rounded">
                          {(["left", "center", "right"] as const).map((alignMode) => {
                            const isSelected = (currentFieldStyle.align || "center") === alignMode;
                            return (
                              <button
                                key={alignMode}
                                type="button"
                                onClick={() => updateFieldStyle("align", alignMode)}
                                className={`py-1 text-center flex justify-center items-center rounded transition-all ${
                                  isSelected ? "bg-[#bf953f]/20 text-[#fcf6ba] border border-[#b38728]/30" : "text-gray-500 hover:text-gray-300"
                                }`}
                              >
                                {alignMode === "left" && <AlignLeft size={12} />}
                                {alignMode === "center" && <AlignCenter size={12} />}
                                {alignMode === "right" && <AlignRight size={12} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 3. Color Picker and Gold presets */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[9px] text-gray-400 font-mono uppercase block">Text Color & Luxury Gold Gradients</label>
                      
                      {/* Gradient Presets Selection */}
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { id: "gradient:royal-gold", bg: "linear-gradient(135deg, #bf953f, #fcf6ba, #aa771c)", name: "Royal Gold" },
                          { id: "gradient:champagne", bg: "linear-gradient(135deg, #fef5e7, #f5cba7, #af601a)", name: "Champagne" },
                          { id: "gradient:rose-gold", bg: "linear-gradient(135deg, #fadbd8, #e5b1a5, #9c645c)", name: "Rose Gold" },
                          { id: "gradient:white-gold", bg: "linear-gradient(135deg, #ffffff, #d5dbdb, #a6acaf)", name: "White Gold" },
                          { id: "gradient:saffron-sunset", bg: "linear-gradient(135deg, #f5b041, #e74c3c, #78281f)", name: "Sunset Saffron" }
                        ].map((preset) => {
                          const isSelected = currentFieldStyle.color === preset.id;
                           return (
                             <button
                               key={preset.id}
                               type="button"
                               onClick={() => updateFieldStyle("color", preset.id)}
                               title={preset.name}
                               className={`h-7 rounded transition-all relative border ${
                                 isSelected ? "border-white scale-105 shadow-md shadow-[#bf953f]/20" : "border-gray-950 hover:border-gray-700"
                               }`}
                               style={{ background: preset.bg }}
                             >
                               {isSelected && (
                                 <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-[8px] drop-shadow-md">
                                   ✓
                                 </div>
                               )}
                             </button>
                           );
                        })}
                      </div>

                      {/* Manual Solid Color Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] text-gray-500 font-mono">Or solid:</span>
                        <input
                          type="color"
                          value={currentFieldStyle.color?.startsWith("gradient:") ? "#bf953f" : currentFieldStyle.color || "#ffffff"}
                          onChange={(e) => updateFieldStyle("color", e.target.value)}
                          className="w-5 h-5 rounded border border-[#b38728]/30 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={currentFieldStyle.color || "#ffffff"}
                          onChange={(e) => updateFieldStyle("color", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 bg-black border border-gray-900 text-gray-300 text-[10px] py-0.5 px-1.5 rounded focus:outline-none focus:border-[#b38728] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Cards text customizers */}
            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-3">
              <h5 className="font-serif text-xs text-[#fcf6ba] uppercase tracking-wide">Sacred Welcomes & Blessings</h5>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Opening Shloka / Chants</label>
                <textarea
                  rows={2}
                  value={details.invitationMessage}
                  onChange={(e) => handleTextChange("invitationMessage", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-xs p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">RSVP / Closing blessings</label>
                <textarea
                  rows={3}
                  value={details.closingMessage}
                  onChange={(e) => handleTextChange("closingMessage", e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-200 text-xs p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GEMINI AI HELPER */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <h4 className="font-serif text-gold-gradient text-sm font-bold uppercase tracking-wider border-b border-gray-900 pb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-[#b38728]" />
              Gemini Royal AI Writer & Advisor
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Power up your invitation cards with the Google Gemini AI. Instantly write traditional Sanskrit-style wedding poetry, royal wording, and receive high-end aesthetic suggestions custom-tailored to regional cultures.
            </p>

            <div className="bg-[#120a05]/60 border border-[#b38728]/20 p-4 rounded-xl space-y-4">
              <div>
                <label className="text-[10px] text-[#fcf6ba] font-mono uppercase block mb-1">Choose Cultural Style Vibe</label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full bg-black text-[#dfc384] text-xs py-2 px-3 border border-[#bf953f]/40 rounded focus:outline-none"
                >
                  <option value="Royal Rajasthani Palace">Royal Rajasthani Palace & Jodhpur Marood</option>
                  <option value="Sanskritized Vedic Heritage">Sanskritized Vedic Temple Heritage</option>
                  <option value="Punjabi Grandeur Celebration">Punjabi Grandeur Royal Celebrations</option>
                  <option value="South Indian Classical Temple">South Indian Classical Temple & Nadaswaram</option>
                  <option value="Modern Royal Rose Gold">Modern Royal Rose Gold Champagne Elegant</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Additional custom cues (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Include bride's grandma name, mention Araria Bihar"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-300 text-xs p-2 rounded focus:border-[#b38728] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={generateAIIvitation}
                  disabled={isAiGenerating}
                  className="py-2.5 px-3 rounded bg-gold-gradient text-black font-bold uppercase tracking-wider text-[11px] transition-all hover:opacity-90 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <>
                      <RefreshCw className="animate-spin text-black" size={13} /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} /> AI Write Cards
                    </>
                  )}
                </button>

                <button
                  onClick={suggestAIAesthetics}
                  disabled={isAiAestheticsLoading}
                  className="py-2.5 px-3 rounded bg-black border border-[#bf953f]/60 text-[#fcf6ba] font-bold uppercase tracking-wider text-[11px] transition-all hover:bg-[#b38728]/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAiAestheticsLoading ? (
                    <>
                      <RefreshCw className="animate-spin text-[#b38728]" size={13} /> Advising...
                    </>
                  ) : (
                    <>
                      <Palette size={13} /> AI Suggest Vibe
                    </>
                  )}
                </button>
              </div>

              {aiSuggestionMessage && (
                <div className="p-3 bg-black/60 border border-amber-900/40 rounded-lg text-[11px] text-[#dfc384] font-sans leading-relaxed">
                  {aiSuggestionMessage}
                </div>
              )}
            </div>

            <div className="border border-dashed border-gray-800 p-3.5 rounded-lg text-[10px] text-gray-500 font-mono leading-relaxed">
              * Note: The AI Writer processes details of Bride ({details.brideName}) and Groom ({details.groomName}) dynamically. Ensure details are correct in Tab 1 before invoking.
            </div>
          </div>
        )}
      </div>

      {/* Editor footer */}
      <div className="bg-[#0f0b06] px-5 py-3 border-t border-[#b38728]/20 flex justify-between items-center text-[11px]">
        <span className="text-gray-500 font-mono">Status: Ready to Export</span>
        <span className="text-[#bf953f] font-serif font-bold">100% Watermark Free</span>
      </div>
    </div>
  );
};
