import React, { useEffect, useRef, useState } from "react";
import { WeddingDetails, WeddingThemeId } from "../types";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Image as ImageIcon, Video, Film, Eye } from "lucide-react";
// Import Ganesha asset
import lordGanesha from "../assets/images/lord_ganesha_1783241087489.jpg";

interface InvitationRendererProps {
  details: WeddingDetails;
  currentTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    archeStyle: "palace" | "temple" | "modern" | "mandala";
  };
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

// Particle definitions
interface Sparkle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  decay: number;
  color: string;
}

interface RosePetal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  cosFactor: number; // For 3D tumbling effect
  cosSpeed: number;
  alpha: number;
}

export const InvitationRenderer: React.FC<InvitationRendererProps> = ({
  details,
  currentTheme,
  audioRef,
  isMusicPlaying,
  toggleMusic,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Video settings & recording state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [selectedRes, setSelectedRes] = useState<"1080p" | "4k">("1080p");
  const [fps, setFps] = useState<30 | 60>(30);

  const duration = 24; // 24 seconds total video
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Particles
  const sparklesRef = useRef<Sparkle[]>([]);
  const petalsRef = useRef<RosePetal[]>([]);

  // Cached Images
  const ganeshaImgRef = useRef<HTMLImageElement | null>(null);
  const brideImgRef = useRef<HTMLImageElement | null>(null);
  const groomImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize Lord Ganesha
  useEffect(() => {
    const img = new Image();
    img.src = lordGanesha;
    img.onload = () => {
      ganeshaImgRef.current = img;
    };
  }, []);

  // Update Bride & Groom Image refs on details change
  useEffect(() => {
    if (details.bridePhoto) {
      const img = new Image();
      img.src = details.bridePhoto;
      img.onload = () => {
        brideImgRef.current = img;
      };
    } else {
      brideImgRef.current = null;
    }
  }, [details.bridePhoto]);

  useEffect(() => {
    if (details.groomPhoto) {
      const img = new Image();
      img.src = details.groomPhoto;
      img.onload = () => {
        groomImgRef.current = img;
      };
    } else {
      groomImgRef.current = null;
    }
  }, [details.groomPhoto]);

  // Dynamic Text Rendering Engine supporting 11 luxury effects and custom font colors
  const drawCustomText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string,
    role: "primary" | "secondary" | "white" | "caption",
    progress: number,
    fieldStyleKey?: "brideName" | "groomName" | "date" | "venue"
  ) => {
    const primaryCol = details.textColor || "#bf953f";
    const secondaryCol = details.secondaryTextColor || "#ffffff";
    const effectId = details.textEffectId || "gold-foil";
    
    let actualColor = "#ffffff";
    if (role === "primary") {
      actualColor = primaryCol;
    } else if (role === "secondary") {
      actualColor = secondaryCol;
    } else if (role === "caption") {
      actualColor = "#dfc384";
    }

    let finalFont = font;
    let finalAlign: CanvasTextAlign = ctx.textAlign || "center";
    let finalColor = actualColor;

    if (fieldStyleKey && details.fieldStyles?.[fieldStyleKey]) {
      const customStyle = details.fieldStyles[fieldStyleKey];
      
      const weight = font.includes("bold") || font.includes("700") ? "bold" : font.includes("italic") ? "italic" : "normal";
      const size = customStyle.fontSize !== undefined ? customStyle.fontSize : parseInt(font.replace(/[^0-9]/g, "")) || 32;
      const family = customStyle.fontFamily || (font.includes("Great Vibes") ? "Great Vibes" : font.includes("Cinzel") ? "Cinzel" : font.includes("Yatra One") ? "Yatra One" : "Inter");
      
      finalFont = `${weight} ${size}px '${family}'`;
      
      if (customStyle.align) {
        finalAlign = customStyle.align as CanvasTextAlign;
      }
      
      if (customStyle.color) {
        finalColor = customStyle.color;
      }
    }

    ctx.font = finalFont;
    ctx.textAlign = finalAlign;

    // Default text properties reset
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Handle gradient preset or solid color for actualColor inside effects
    let textFill: string | CanvasGradient = finalColor;
    if (finalColor.startsWith("gradient:")) {
      const presetId = finalColor.replace("gradient:", "");
      const grad = ctx.createLinearGradient(x - 200, y, x + 200, y);
      if (presetId === "royal-gold") {
        grad.addColorStop(0, "#bf953f");
        grad.addColorStop(0.25, "#fcf6ba");
        grad.addColorStop(0.5, "#b38728");
        grad.addColorStop(0.75, "#fbf5b7");
        grad.addColorStop(1, "#aa771c");
      } else if (presetId === "champagne") {
        grad.addColorStop(0, "#fef5e7");
        grad.addColorStop(0.5, "#f5cba7");
        grad.addColorStop(1, "#af601a");
      } else if (presetId === "rose-gold") {
        grad.addColorStop(0, "#fadbd8");
        grad.addColorStop(0.5, "#e5b1a5");
        grad.addColorStop(1, "#9c645c");
      } else if (presetId === "white-gold") {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#d5dbdb");
        grad.addColorStop(1, "#a6acaf");
      } else if (presetId === "saffron-sunset") {
        grad.addColorStop(0, "#f5b041");
        grad.addColorStop(0.5, "#e74c3c");
        grad.addColorStop(1, "#78281f");
      } else {
        grad.addColorStop(0, "#bf953f");
        grad.addColorStop(1, "#fcf6ba");
      }
      textFill = grad;
    }

    switch (effectId) {
      case "gold-foil": {
        const grad = ctx.createLinearGradient(x - 200, y, x + 200, y);
        const shift = (Date.now() / 1500) % 2;
        
        let color1 = finalColor;
        let color2 = "#ffffff";
        let color3 = finalColor;
        
        if (finalColor.startsWith("gradient:")) {
          const presetId = finalColor.replace("gradient:", "");
          if (presetId === "royal-gold") {
            color1 = "#bf953f"; color3 = "#aa771c";
          } else if (presetId === "champagne") {
            color1 = "#fef5e7"; color3 = "#af601a";
          } else if (presetId === "rose-gold") {
            color1 = "#fadbd8"; color3 = "#9c645c";
          } else if (presetId === "white-gold") {
            color1 = "#ffffff"; color3 = "#a6acaf";
          } else if (presetId === "saffron-sunset") {
            color1 = "#f5b041"; color3 = "#78281f";
          }
        }
        
        grad.addColorStop(0, color1);
        grad.addColorStop(Math.max(0, Math.min(1, shift - 0.4)), color1);
        grad.addColorStop(Math.max(0, Math.min(1, shift)), color2); // shimmer shine
        grad.addColorStop(Math.max(0, Math.min(1, shift + 0.4)), color3);
        grad.addColorStop(1, color3);
        ctx.fillStyle = grad;
        ctx.fillText(text, x, y);
        break;
      }
      case "divine-glow": {
        ctx.save();
        const pulse = 8 + Math.sin(Date.now() / 200) * 4;
        ctx.shadowColor = typeof textFill === "string" ? textFill : "#bf953f";
        ctx.shadowBlur = pulse;
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y);
        ctx.restore();
        break;
      }
      case "typewriter": {
        const charCount = Math.floor(text.length * Math.min(1, progress * 1.5));
        const visibleText = text.substring(0, charCount);
        ctx.fillStyle = textFill;
        ctx.fillText(visibleText, x, y);
        if (progress < 0.7 && Math.floor(Date.now() / 200) % 2 === 0) {
          const textW = ctx.measureText(visibleText).width;
          ctx.fillText("।", x + textW / 2 + 5, y);
        }
        break;
      }
      case "cinematic-fade": {
        ctx.save();
        const easeIn = Math.min(1, progress * 3);
        const offsetY = (1 - easeIn) * -15;
        ctx.fillStyle = textFill;
        const oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = oldAlpha * easeIn;
        ctx.fillText(text, x, y + offsetY);
        ctx.globalAlpha = oldAlpha;
        ctx.restore();
        break;
      }
      case "double-shadow": {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillText(text, x + 4, y + 4);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillText(text, x + 2, y + 2);
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y);
        ctx.restore();
        break;
      }
      case "stroke-outline": {
        ctx.save();
        ctx.strokeStyle = typeof textFill === "string" ? textFill : "#bf953f";
        ctx.lineWidth = 1.5;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillText(text, x, y);
        ctx.restore();
        break;
      }
      case "wave-floating": {
        const waveY = Math.sin(Date.now() / 300 + x * 0.05) * 8;
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y + waveY);
        break;
      }
      case "chroma-shift": {
        ctx.save();
        ctx.fillStyle = "rgba(255, 50, 50, 0.4)";
        ctx.fillText(text, x - 2, y);
        ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
        ctx.fillText(text, x + 2, y);
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y);
        ctx.restore();
        break;
      }
      case "bouncy-entrance": {
        ctx.save();
        const bounceProg = Math.min(1, progress * 4);
        const bounceY = Math.abs(Math.sin(bounceProg * Math.PI * 1.8)) * -25 * (1 - bounceProg);
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y + bounceY);
        ctx.restore();
        break;
      }
      case "slow-zoom": {
        ctx.save();
        const driftScale = 1 + (progress * 0.06);
        ctx.translate(x, y);
        ctx.scale(driftScale, driftScale);
        ctx.fillStyle = textFill;
        ctx.fillText(text, 0, 0);
        ctx.restore();
        break;
      }
      case "sparkle-vertex": {
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y);
        
        ctx.save();
        const textWidth = ctx.measureText(text).width;
        const sparkleCount = Math.min(4, Math.max(2, Math.floor(text.length / 4)));
        for (let i = 0; i < sparkleCount; i++) {
          const sx = x - textWidth / 2 + (i / (sparkleCount - 1)) * textWidth;
          const sy = y - 10 + Math.sin(Date.now() / 250 + i) * 12;
          const size = 3 + Math.abs(Math.sin(Date.now() / 150 + i)) * 4;
          
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = primaryCol;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - size, sy);
          ctx.lineTo(sx + size, sy);
          ctx.moveTo(sx, sy - size);
          ctx.lineTo(sx, sy + size);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      default: {
        ctx.fillStyle = textFill;
        ctx.fillText(text, x, y);
      }
    }
  };

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= duration) {
            return 0; // loop
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Sync Audio with Playback state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && isMusicPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMusicPlaying]);

  // Sparkles & Petal emitter loops
  const initParticles = (width: number, height: number) => {
    if (sparklesRef.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        sparklesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 1,
          speedY: -(Math.random() * 0.8 + 0.2),
          speedX: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.5 + 0.2,
          decay: Math.random() * 0.005 + 0.002,
          color: `hsl(${Math.random() * 15 + 35}, 80%, ${Math.random() * 20 + 70}%)`, // golden values
        });
      }
    }

    if (petalsRef.current.length === 0) {
      for (let i = 0; i < 25; i++) {
        petalsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 12 + 6,
          speedY: Math.random() * 1.5 + 0.8,
          speedX: Math.random() * 0.6 - 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.03,
          cosFactor: Math.random() * Math.PI,
          cosSpeed: Math.random() * 0.02 + 0.01,
          alpha: Math.random() * 0.6 + 0.4,
        });
      }
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: always 1080x1920 (ultra HD aspect ratio)
    const W = 1080;
    const H = 1920;

    initParticles(W, H);

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Draw Royal Background Gradients based on theme
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * 0.8);
      
      const themePrimary = currentTheme?.primaryColor || "#7d0e14";
      const themeBg = currentTheme?.backgroundColor || "#160405";

      if (details.themeId === "celestial" || currentTheme?.id === "celestial" || currentTheme?.archeStyle === "mandala" || currentTheme?.category === "Cosmic Celestial") {
        bgGrad.addColorStop(0, "#08101F");
        bgGrad.addColorStop(1, "#020408");
      } else if (details.themeId === "rosegold" || currentTheme?.id === "rosegold" || currentTheme?.category === "Enchanted Floral") {
        bgGrad.addColorStop(0, "#2c1619");
        bgGrad.addColorStop(1, "#0d0506");
      } else if (details.themeId === "temple" || currentTheme?.id === "temple" || currentTheme?.archeStyle === "temple" || currentTheme?.category === "Divine Temple") {
        bgGrad.addColorStop(0, "#2b090a");
        bgGrad.addColorStop(1, "#0b0102");
      } else {
        // Dynamically build the gradient from the theme's core primary color (to form a glowing rich core)
        // to the rich deep background color of that template, and fade out to near-black at the frame borders
        bgGrad.addColorStop(0, themePrimary);
        bgGrad.addColorStop(0.45, themeBg);
        bgGrad.addColorStop(1, "#030101");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Draw background patterns (Royal Mandalas & Grid) using the template's custom secondary color
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = currentTheme?.secondaryColor || "#bf953f";
      ctx.lineWidth = 1.5;
      
      // Draw spinning mandalas in background
      ctx.translate(W / 2, H / 2);
      ctx.rotate(currentTime * 0.03);
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-250, -250, 500, 500);
        ctx.beginPath();
        ctx.arc(0, 0, 300, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Draw elegant royal corner borders
      drawRoyalBorders(ctx, W, H);

      // 2. Active Scene Rendering
      const sceneIndex = Math.floor(currentTime / 4); // 6 scenes, 4s each
      const sceneProgress = (currentTime % 4) / 4; // 0 to 1

      // Render physical background particles
      updateAndDrawParticles(ctx, W, H);

      // Simulated Cinematic Camera Movement
      ctx.save();
      const zoom = 1 + Math.sin(sceneProgress * Math.PI) * 0.03; // subtle slow zoom
      const panX = Math.cos(sceneProgress * Math.PI) * 10;
      ctx.translate(W / 2, H / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-W / 2 + panX, -H / 2);

      // Render standard components based on timeline
      switch (sceneIndex) {
        case 0:
          renderSceneGanesh(ctx, W, H, sceneProgress);
          break;
        case 1:
          renderSceneGroom(ctx, W, H, sceneProgress);
          break;
        case 2:
          renderSceneBride(ctx, W, H, sceneProgress);
          break;
        case 3:
          renderSceneEvents(ctx, W, H, sceneProgress);
          break;
        case 4:
          renderSceneVenue(ctx, W, H, sceneProgress);
          break;
        case 5:
          renderSceneBlessing(ctx, W, H, sceneProgress);
          break;
        default:
          break;
      }

      ctx.restore();

      // Volumetric lighting / Bloom overlay
      drawVolumetricGlow(ctx, W, H);

      // Cinematic Intro Overlay Transition (Curtain, Gates, Smoke, Flower Shower)
      drawCinematicOverlay(ctx, W, H);

      // Brand badge in video (premium watermark-free branding requested)
      drawVideoBranding(ctx, W, H);
    };

    render();
  }, [currentTime, details, currentTheme]);

  // Render Scene 1: Ganesha & Sacred Opening (0-4s)
  const renderSceneGanesh = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Background Mandalas
    ctx.strokeStyle = "#bf953f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 200, 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw Ganesha Image
    if (ganeshaImgRef.current) {
      ctx.drawImage(ganeshaImgRef.current, W / 2 - 150, H / 2 - 350, 300, 300);
    } else {
      // Elegant placeholder Ganesha vector if not loaded yet
      ctx.fillStyle = "#bf953f";
      ctx.font = "bold 40px 'Cinzel'";
      ctx.textAlign = "center";
      ctx.fillText("ॐ", W / 2, H / 2 - 200);
    }

    // Sacred chants
    ctx.textAlign = "center";
    drawCustomText(ctx, "॥ श्री गणेशाय नमः ॥", W / 2, H / 2 + 50, "400 36px 'Yatra One'", "secondary", progress);

    // Subtitle
    drawCustomText(ctx, "MANGALAM BHAGWAN VISHNU", W / 2, H / 2 + 100, "bold 24px 'Inter'", "white", progress);

    // Golden Dividers
    drawGoldDivider(ctx, W / 2, H / 2 + 150, 300);

    // Wedding Invitation
    drawCustomText(ctx, "Wedding Invitation", W / 2, H / 2 + 220, "italic 44px 'Great Vibes'", "primary", progress);

    // Custom shloka or intro shloka
    const shlokaText = details.invitationMessage || "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥";
    const lines = shlokaText.split("\n");
    lines.forEach((line, i) => {
      drawCustomText(ctx, line, W / 2, H / 2 + 300 + i * 40, "300 22px 'Inter'", "caption", progress);
    });

    ctx.restore();
  };

  // Render Scene 2: Bride Reveal (4-8s)
  const renderSceneBride = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";
    drawCustomText(ctx, "Introducing The Beautiful Bride", W / 2, H / 2 - 500, "bold 32px 'Cinzel'", "caption", progress);

    // Frame styling
    const frameX = W / 2;
    const frameY = H / 2 - 150;
    const frameR = 180;

    // Draw glowing back circles
    ctx.strokeStyle = "rgba(191, 149, 63, 0.4)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR + 20, 0, Math.PI * 2);
    ctx.stroke();

    // Clip photo in circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR, 0, Math.PI * 2);
    ctx.clip();

    if (brideImgRef.current) {
      // Cover crop
      const img = brideImgRef.current;
      const aspect = img.width / img.height;
      let drawW = frameR * 2;
      let drawH = frameR * 2;
      if (aspect > 1) {
        drawW = drawH * aspect;
      } else {
        drawH = drawW / aspect;
      }
      ctx.drawImage(img, frameX - drawW / 2, frameY - drawH / 2, drawW, drawH);
    } else {
      // Gorgeous Royal Silhouette Placeholder
      ctx.fillStyle = "#1e1113";
      ctx.fillRect(frameX - frameR, frameY - frameR, frameR * 2, frameR * 2);
      ctx.fillStyle = "#bf953f";
      ctx.font = "bold 60px 'Cinzel'";
      ctx.fillText("BRIDE", frameX, frameY + 20);
    }
    ctx.restore();

    // Gold frame border
    ctx.strokeStyle = "#bf953f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR, 0, Math.PI * 2);
    ctx.stroke();

    // Flowers details on border
    drawLotusOrnament(ctx, frameX, frameY - frameR);
    drawLotusOrnament(ctx, frameX, frameY + frameR);

    // Bride Name
    drawCustomText(ctx, details.brideName, W / 2, H / 2 + 180, "700 80px 'Great Vibes'", "secondary", progress, "brideName");

    // Parents details
    drawCustomText(ctx, "Daughter of", W / 2, H / 2 + 250, "bold 24px 'Cinzel'", "white", progress);
    drawCustomText(ctx, details.brideParents, W / 2, H / 2 + 300, "400 32px 'Great Vibes'", "primary", progress);
    drawCustomText(ctx, details.brideAddress, W / 2, H / 2 + 350, "300 24px 'Inter'", "caption", progress);

    ctx.restore();
  };

  // Render Scene 3: Groom Reveal (8-12s)
  const renderSceneGroom = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";
    drawCustomText(ctx, "Introducing The Elegant Groom", W / 2, H / 2 - 500, "bold 32px 'Cinzel'", "caption", progress);

    // Frame styling
    const frameX = W / 2;
    const frameY = H / 2 - 150;
    const frameR = 180;

    // Draw glowing back circles
    ctx.strokeStyle = "rgba(191, 149, 63, 0.4)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR + 20, 0, Math.PI * 2);
    ctx.stroke();

    // Clip photo in circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR, 0, Math.PI * 2);
    ctx.clip();

    if (groomImgRef.current) {
      // Cover crop
      const img = groomImgRef.current;
      const aspect = img.width / img.height;
      let drawW = frameR * 2;
      let drawH = frameR * 2;
      if (aspect > 1) {
        drawW = drawH * aspect;
      } else {
        drawH = drawW / aspect;
      }
      ctx.drawImage(img, frameX - drawW / 2, frameY - drawH / 2, drawW, drawH);
    } else {
      // Gorgeous Royal Silhouette Placeholder
      ctx.fillStyle = "#111a24";
      ctx.fillRect(frameX - frameR, frameY - frameR, frameR * 2, frameR * 2);
      ctx.fillStyle = "#bf953f";
      ctx.font = "bold 60px 'Cinzel'";
      ctx.fillText("GROOM", frameX, frameY + 20);
    }
    ctx.restore();

    // Gold frame border
    ctx.strokeStyle = "#bf953f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(frameX, frameY, frameR, 0, Math.PI * 2);
    ctx.stroke();

    // Ornament
    drawLotusOrnament(ctx, frameX, frameY - frameR);
    drawLotusOrnament(ctx, frameX, frameY + frameR);

    // Groom Name
    drawCustomText(ctx, details.groomName, W / 2, H / 2 + 180, "700 80px 'Great Vibes'", "secondary", progress, "groomName");

    // Parents details
    drawCustomText(ctx, "Son of", W / 2, H / 2 + 250, "bold 24px 'Cinzel'", "white", progress);
    drawCustomText(ctx, details.groomParents, W / 2, H / 2 + 300, "400 32px 'Great Vibes'", "primary", progress);
    drawCustomText(ctx, details.groomAddress, W / 2, H / 2 + 350, "300 24px 'Inter'", "caption", progress);

    ctx.restore();
  };

  // Render Scene 4: Wedding Events Timeline (12-16s)
  const renderSceneEvents = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";
    drawCustomText(ctx, "Auspicious Ceremonies", W / 2, H / 2 - 500, "bold 44px 'Cinzel'", "secondary", progress);
    drawGoldDivider(ctx, W / 2, H / 2 - 450, 350);

    // List events with stylized gold panels
    const events = details.events;
    events.forEach((ev, idx) => {
      const startY = H / 2 - 350 + idx * 160;

      // Draw subtle gold decorative border
      ctx.strokeStyle = "rgba(191, 149, 63, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "rgba(12, 6, 2, 0.6)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 400, startY, 800, 130, 12);
      ctx.fill();
      ctx.stroke();

      // Event title
      ctx.textAlign = "left";
      drawCustomText(ctx, ev.name, W / 2 - 350, startY + 50, "bold 32px 'Cinzel'", "primary", progress);

      // Description/Chant
      drawCustomText(ctx, ev.description || "Shubh Vivah Celebrations", W / 2 - 350, startY + 95, "italic 22px 'Great Vibes'", "caption", progress);

      // Date & Time on the right
      ctx.textAlign = "right";
      drawCustomText(ctx, ev.date, W / 2 + 350, startY + 50, "bold 26px 'Inter'", "white", progress, "date");
      drawCustomText(ctx, ev.time || "05:00 PM onwards", W / 2 + 350, startY + 95, "300 20px 'Inter'", "caption", progress);

      // Gold circle decoration
      ctx.fillStyle = "#bf953f";
      ctx.beginPath();
      ctx.arc(W / 2 - 375, startY + 40, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // Render Scene 5: Venue & Details (16-20s)
  const renderSceneVenue = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";
    drawCustomText(ctx, "Wedding Venue", W / 2, H / 2 - 400, "bold 44px 'Cinzel'", "secondary", progress);
    drawGoldDivider(ctx, W / 2, H / 2 - 350, 300);

    // Elegant scroll design
    ctx.strokeStyle = "rgba(191, 149, 63, 0.5)";
    ctx.fillStyle = "rgba(20, 12, 4, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 350, H / 2 - 250, 700, 500, 15);
    ctx.fill();
    ctx.stroke();

    // Map Coordinates Outline Icon (geometric)
    ctx.save();
    ctx.strokeStyle = "#bf953f";
    ctx.lineWidth = 2.5;
    ctx.translate(W / 2, H / 2 - 120);
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(30, -10);
    ctx.lineTo(0, 20);
    ctx.lineTo(-30, -10);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -15, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // Venue Text
    ctx.textAlign = "center";
    drawCustomText(ctx, "VENUE LOCATION", W / 2, H / 2 + 20, "bold 34px 'Cinzel'", "white", progress);

    const venueLines = details.venue.split("\n");
    venueLines.forEach((line, i) => {
      drawCustomText(ctx, line, W / 2, H / 2 + 90 + i * 45, "300 28px 'Inter'", "caption", progress, "venue");
    });

    // Invitation message translation
    drawCustomText(ctx, "Your presence will double our joy.", W / 2, H / 2 + 320, "italic 26px 'Great Vibes'", "white", progress);

    ctx.restore();
  };

  // Render Scene 6: Outro Blessing & RSVP (20-24s)
  const renderSceneBlessing = (ctx: CanvasRenderingContext2D, W: number, H: number, progress: number) => {
    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";
    drawCustomText(ctx, "With Warm Regards", W / 2, H / 2 - 400, "700 85px 'Great Vibes'", "secondary", progress);

    // Decorative Mandala in center
    ctx.save();
    ctx.translate(W / 2, H / 2 - 150);
    ctx.rotate(currentTime * 0.1);
    ctx.strokeStyle = "rgba(191, 149, 63, 0.4)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.ellipse(0, 0, 100, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Closing Message (Hindi / English request)
    const closeLines = details.closingMessage.split("\n");
    closeLines.forEach((line, i) => {
      drawCustomText(ctx, line, W / 2, H / 2 + 50 + i * 45, "300 24px 'Inter'", "white", progress);
    });

    // Separator
    drawGoldDivider(ctx, W / 2, H / 2 + 200, 250);

    // RSVP Section
    drawCustomText(ctx, "RSVP & BLESSINGS", W / 2, H / 2 + 260, "bold 26px 'Cinzel'", "primary", progress);
    drawCustomText(ctx, "All Friends & Relatives", W / 2, H / 2 + 310, "400 24px 'Inter'", "caption", progress);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "16px 'Inter'";
    ctx.fillText("A premium creation of Abhinav • Instagram: @ahirgaming2.0", W / 2, H / 2 + 400);

    ctx.restore();
  };

  // Helper: Draw Volumetric Glow overlays
  const drawVolumetricGlow = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const xGrad = ctx.createLinearGradient(0, 0, W, H);
    xGrad.addColorStop(0, "rgba(191, 149, 63, 0.05)");
    xGrad.addColorStop(0.5, "rgba(255, 246, 186, 0.15)");
    xGrad.addColorStop(1, "rgba(170, 119, 28, 0.05)");
    ctx.fillStyle = xGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // Helper: Draw Ganesha / Lotus Border Ornaments
  const drawRoyalBorders = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    const borderCol = currentTheme?.secondaryColor || "#bf953f";
    ctx.strokeStyle = borderCol;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 4;

    // Corner padding
    const p = 40;

    // Outer frame
    ctx.beginPath();
    ctx.roundRect(p, p, W - p * 2, H - p * 2, 20);
    ctx.stroke();

    // Inner thin border
    ctx.strokeStyle = borderCol;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(p + 15, p + 15, W - (p + 15) * 2, H - (p + 15) * 2, 15);
    ctx.stroke();

    // Corner Ornaments (triangles / mandalas)
    const corners = [
      { x: p, y: p, rot: 0 },
      { x: W - p, y: p, rot: Math.PI / 2 },
      { x: W - p, y: H - p, rot: Math.PI },
      { x: p, y: H - p, rot: -Math.PI / 2 },
    ];

    corners.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.strokeStyle = borderCol;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 3;
      
      // Draw floral corner curves
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.quadraticCurveTo(20, 20, 60, 0);
      ctx.moveTo(0, 40);
      ctx.quadraticCurveTo(15, 15, 40, 0);
      ctx.stroke();

      ctx.restore();
    });

    ctx.restore();
  };

  // Helper: Lotus Drawing
  const drawLotusOrnament = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = currentTheme?.secondaryColor || "#bf953f";
    ctx.beginPath();
    // Center petal
    ctx.moveTo(0, -15);
    ctx.quadraticCurveTo(10, 0, 0, 15);
    ctx.quadraticCurveTo(-10, 0, 0, -15);
    // Right petal
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -10, 25, 5);
    ctx.quadraticCurveTo(10, 10, 0, 15);
    // Left petal
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -10, -25, 5);
    ctx.quadraticCurveTo(-10, 10, 0, 15);
    ctx.fill();
    ctx.restore();
  };

  // Helper: Divider line
  const drawGoldDivider = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number) => {
    ctx.save();
    const borderCol = currentTheme?.secondaryColor || "#bf953f";
    const jewelCol = currentTheme?.accentColor || "#fcf6ba";
    const grad = ctx.createLinearGradient(x - length / 2, y, x + length / 2, y);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(0.5, borderCol);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - length / 2, y);
    ctx.lineTo(x + length / 2, y);
    ctx.stroke();

    // Center jewel
    ctx.fillStyle = jewelCol;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Render physical elements
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const type = currentTheme.particleType || "sparkles";

    if (type === "sparkles" || type === "gold-dust") {
      // 1. Sparkles / Gold Dust
      sparklesRef.current.forEach((sp) => {
        // gold dust cascades down, sparkles rise up
        sp.y += sp.speedY * (type === "gold-dust" ? -1.5 : 1);
        sp.x += sp.speedX;
        sp.alpha -= sp.decay;

        // Wrap or respawn
        if (type === "gold-dust" ? sp.y > H : sp.y < 0 || sp.alpha <= 0) {
          sp.y = type === "gold-dust" ? -10 : H;
          sp.x = Math.random() * W;
          sp.alpha = Math.random() * 0.5 + 0.3;
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = type === "gold-dust" ? "rgba(252, 246, 186, " + sp.alpha + ")" : sp.color;
        ctx.beginPath();
        if (type === "gold-dust") {
          // Sparkle-like 4-point star for premium gold dust
          const size = sp.size * 1.8;
          ctx.translate(sp.x, sp.y);
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.3, -size * 0.3);
          ctx.lineTo(size, 0);
          ctx.lineTo(size * 0.3, size * 0.3);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.3, size * 0.3);
          ctx.lineTo(-size, 0);
          ctx.lineTo(-size * 0.3, -size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    if (type === "rose-petals" || type === "marigold") {
      // 2. Petals (Rose / Marigold)
      petalsRef.current.forEach((pt) => {
        pt.y += pt.speedY;
        pt.x += pt.speedX;
        pt.rotation += pt.rotSpeed;
        pt.cosFactor += pt.cosSpeed;

        // Wrap or respawn
        if (pt.y > H) {
          pt.y = -50;
          pt.x = Math.random() * W;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation);
        // Simulate 3D spin by scaling width based on cosine factor
        const scaleX = Math.cos(pt.cosFactor);
        ctx.scale(scaleX, 1);

        if (type === "marigold") {
          // Marigold sacred flower petal (golden-orange double shade)
          const petalGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, pt.size);
          petalGrad.addColorStop(0, "#ffb703"); // vibrant gold
          petalGrad.addColorStop(0.7, "#fb8500"); // orange
          petalGrad.addColorStop(1, "#d44000"); // deep saffron
          ctx.fillStyle = petalGrad;

          ctx.beginPath();
          // Draw ruffled marigold bloom shape
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const rx = Math.cos(angle) * pt.size * 0.6;
            const ry = Math.sin(angle) * pt.size * 0.6;
            ctx.arc(rx, ry, pt.size * 0.4, 0, Math.PI * 2);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // Draw stylized pink rose petal
          const petGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, pt.size);
          petGrad.addColorStop(0, "#ff4d6d");
          petGrad.addColorStop(0.8, "#c9184a");
          petGrad.addColorStop(1, "#800f2f");
          ctx.fillStyle = petGrad;

          ctx.beginPath();
          ctx.moveTo(0, -pt.size);
          ctx.bezierCurveTo(pt.size * 1.5, -pt.size, pt.size * 1.5, pt.size, 0, pt.size);
          ctx.bezierCurveTo(-pt.size * 1.5, pt.size, -pt.size * 1.5, -pt.size, 0, -pt.size);
          ctx.fill();
        }

        ctx.restore();
      });
    }
  };

  // Draw custom cinematic intro / transition overlays on top of the canvas
  const drawCinematicOverlay = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const effectId = details.videoEffectId || "curtain-open";
    if (effectId === "none") return;

    // These transitions run mostly during the first 2.8 seconds (Ganesha intro scene)
    const transitionDuration = 2.8;
    
    if (currentTime >= transitionDuration) {
      // If we are past the intro transition, we don't draw curtain/gate/smoke overlays
      return;
    }

    const progress = currentTime / transitionDuration; // 0 to 1
    // Smooth transition easing: smoothstep
    const ease = progress * progress * (3 - 2 * progress); 

    ctx.save();

    switch (effectId) {
      case "curtain-open": {
        // Stage Curtain Opening (Parda Khulna - Red Royal Velvet with Gold Tassels)
        const curtainWidth = W / 2;
        const openOffset = ease * curtainWidth;

        // Left Curtain: X goes from 0 to -curtainWidth
        const leftCurtainRightX = curtainWidth - openOffset;
        if (leftCurtainRightX > 0) {
          // Draw curtain cloth base
          const clothGrad = ctx.createLinearGradient(0, 0, leftCurtainRightX, 0);
          clothGrad.addColorStop(0, "#4a0002");
          clothGrad.addColorStop(0.3, "#a30005");
          clothGrad.addColorStop(0.6, "#730003");
          clothGrad.addColorStop(0.9, "#d9000a");
          clothGrad.addColorStop(1.0, "#520002");
          
          ctx.fillStyle = clothGrad;
          ctx.fillRect(0, 0, leftCurtainRightX, H);

          // Draw vertical folds shadows for realistic velvet look
          const foldCount = 8;
          const foldWidth = leftCurtainRightX / foldCount;
          for (let i = 0; i < foldCount; i++) {
            const fx = i * foldWidth;
            const foldGrad = ctx.createLinearGradient(fx, 0, fx + foldWidth, 0);
            foldGrad.addColorStop(0, "rgba(0,0,0,0.4)");
            foldGrad.addColorStop(0.5, "rgba(255,255,255,0.15)");
            foldGrad.addColorStop(1.0, "rgba(0,0,0,0.5)");
            ctx.fillStyle = foldGrad;
            ctx.fillRect(fx, 0, foldWidth, H);
          }

          // Gold tasselled trimming border at the opening edge (right edge of left curtain)
          const goldTrimGrad = ctx.createLinearGradient(leftCurtainRightX - 25, 0, leftCurtainRightX, 0);
          goldTrimGrad.addColorStop(0, "#bf953f");
          goldTrimGrad.addColorStop(0.5, "#fcf6ba");
          goldTrimGrad.addColorStop(1, "#aa771c");
          ctx.fillStyle = goldTrimGrad;
          ctx.fillRect(leftCurtainRightX - 25, 0, 25, H);

          // Detailed tassel borders (vertical stripes)
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = 1;
          for (let tx = leftCurtainRightX - 20; tx < leftCurtainRightX; tx += 4) {
            ctx.beginPath();
            ctx.moveTo(tx, 0);
            ctx.lineTo(tx, H);
            ctx.stroke();
          }
        }

        // Right Curtain: X goes from curtainWidth to W + curtainWidth
        const rightCurtainLeftX = curtainWidth + openOffset;
        const rightCurtainWidth = W - rightCurtainLeftX;
        if (rightCurtainWidth > 0) {
          // Draw curtain cloth base
          const clothGrad = ctx.createLinearGradient(rightCurtainLeftX, 0, W, 0);
          clothGrad.addColorStop(0, "#520002");
          clothGrad.addColorStop(0.1, "#d9000a");
          clothGrad.addColorStop(0.4, "#730003");
          clothGrad.addColorStop(0.7, "#a30005");
          clothGrad.addColorStop(1.0, "#4a0002");

          ctx.fillStyle = clothGrad;
          ctx.fillRect(rightCurtainLeftX, 0, rightCurtainWidth, H);

          // Draw vertical folds shadows
          const foldCount = 8;
          const foldWidth = rightCurtainWidth / foldCount;
          for (let i = 0; i < foldCount; i++) {
            const fx = rightCurtainLeftX + i * foldWidth;
            const foldGrad = ctx.createLinearGradient(fx, 0, fx + foldWidth, 0);
            foldGrad.addColorStop(0, "rgba(0,0,0,0.5)");
            foldGrad.addColorStop(0.5, "rgba(255,255,255,0.15)");
            foldGrad.addColorStop(1.0, "rgba(0,0,0,0.4)");
            ctx.fillStyle = foldGrad;
            ctx.fillRect(fx, 0, foldWidth, H);
          }

          // Gold tasselled trimming border at the opening edge (left edge of right curtain)
          const goldTrimGrad = ctx.createLinearGradient(rightCurtainLeftX, 0, rightCurtainLeftX + 25, 0);
          goldTrimGrad.addColorStop(0, "#aa771c");
          goldTrimGrad.addColorStop(0.5, "#fcf6ba");
          goldTrimGrad.addColorStop(1, "#bf953f");
          ctx.fillStyle = goldTrimGrad;
          ctx.fillRect(rightCurtainLeftX, 0, 25, H);

          // Detailed tassel borders
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = 1;
          for (let tx = rightCurtainLeftX; tx < rightCurtainLeftX + 20; tx += 4) {
            ctx.beginPath();
            ctx.moveTo(tx, 0);
            ctx.lineTo(tx, H);
            ctx.stroke();
          }
        }

        // Horizontal Valance Drape at the top (frames the stage, fades out slightly)
        const valanceOpacity = Math.max(0, 1 - progress * 0.8);
        if (valanceOpacity > 0) {
          ctx.globalAlpha = valanceOpacity;
          
          // Outer drape base
          const valanceHeight = 180;
          const valGrad = ctx.createLinearGradient(0, 0, 0, valanceHeight);
          valGrad.addColorStop(0, "#4a0002");
          valGrad.addColorStop(0.7, "#a30005");
          valGrad.addColorStop(1.0, "#2a0001");
          ctx.fillStyle = valGrad;
          ctx.fillRect(0, 0, W, valanceHeight);

          // Golden fringe banner
          const fringeGrad = ctx.createLinearGradient(0, 0, W, 0);
          fringeGrad.addColorStop(0, "#bf953f");
          fringeGrad.addColorStop(0.5, "#fcf6ba");
          fringeGrad.addColorStop(1, "#aa771c");
          ctx.fillStyle = fringeGrad;
          ctx.fillRect(0, valanceHeight - 15, W, 15);

          // Swags (curved drapes) decoration across top
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 2;
          ctx.fillStyle = "#800002";
          const swagCount = 5;
          const swagWidth = W / swagCount;
          for (let i = 0; i < swagCount; i++) {
            const sx = i * swagWidth;
            ctx.beginPath();
            ctx.moveTo(sx, valanceHeight - 15);
            ctx.quadraticCurveTo(sx + swagWidth / 2, valanceHeight + 40, sx + swagWidth, valanceHeight - 15);
            ctx.fill();
            ctx.stroke();
          }
        }
        break;
      }

      case "sliding-gates": {
        // Temple Golden Gates Sliding (Sone Ka Dwar)
        const gateWidth = W / 2;
        const openOffset = ease * gateWidth;

        // Left Gate
        const leftGateRightX = gateWidth - openOffset;
        if (leftGateRightX > 0) {
          const goldGrad = ctx.createLinearGradient(0, 0, leftGateRightX, 0);
          goldGrad.addColorStop(0, "#4d380f");
          goldGrad.addColorStop(0.5, "#dfc384");
          goldGrad.addColorStop(0.8, "#b38728");
          goldGrad.addColorStop(1.0, "#ffd97d");
          ctx.fillStyle = goldGrad;
          ctx.fillRect(0, 0, leftGateRightX, H);

          // Jali Pattern lines (carved traditional squares)
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 3;
          for (let y = 100; y < H - 100; y += 120) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(leftGateRightX, y);
            ctx.stroke();
          }
          for (let x = 60; x < leftGateRightX; x += 120) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
          }

          // Half of center Mandala lock plate
          ctx.fillStyle = "#ffd97d";
          ctx.beginPath();
          ctx.arc(leftGateRightX, H / 2, 140, -Math.PI / 2, Math.PI / 2);
          ctx.fill();
          ctx.strokeStyle = "#4d380f";
          ctx.lineWidth = 4;
          ctx.stroke();

          // Mandala inner carvings
          ctx.beginPath();
          ctx.arc(leftGateRightX, H / 2, 90, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        }

        // Right Gate
        const rightGateLeftX = gateWidth + openOffset;
        const rightGateWidth = W - rightGateLeftX;
        if (rightGateWidth > 0) {
          const goldGrad = ctx.createLinearGradient(rightGateLeftX, 0, W, 0);
          goldGrad.addColorStop(0, "#ffd97d");
          goldGrad.addColorStop(0.2, "#b38728");
          goldGrad.addColorStop(0.5, "#dfc384");
          goldGrad.addColorStop(1.0, "#4d380f");
          ctx.fillStyle = goldGrad;
          ctx.fillRect(rightGateLeftX, 0, rightGateWidth, H);

          // Jali pattern lines
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 3;
          for (let y = 100; y < H - 100; y += 120) {
            ctx.beginPath();
            ctx.moveTo(rightGateLeftX, y);
            ctx.lineTo(W, y);
            ctx.stroke();
          }
          for (let x = rightGateLeftX + 60; x < W; x += 120) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
          }

          // Half of center Mandala lock plate
          ctx.fillStyle = "#ffd97d";
          ctx.beginPath();
          ctx.arc(rightGateLeftX, H / 2, 140, Math.PI / 2, -Math.PI / 2);
          ctx.fill();
          ctx.strokeStyle = "#4d380f";
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(rightGateLeftX, H / 2, 90, Math.PI / 2, -Math.PI / 2);
          ctx.stroke();
        }
        break;
      }

      case "saffron-smoke": {
        // Sandalwood & Saffron Mystic Smoke Transition
        const smokeAlpha = 1 - ease;
        if (smokeAlpha > 0) {
          ctx.globalAlpha = smokeAlpha;
          
          // Layer 1: Radial Saffron Glow
          const radialGlow = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, H * 0.7);
          radialGlow.addColorStop(0, "rgba(251, 133, 0, 0.95)");
          radialGlow.addColorStop(0.5, "rgba(231, 76, 60, 0.8)");
          radialGlow.addColorStop(1.0, "rgba(120, 40, 31, 0.98)");
          ctx.fillStyle = radialGlow;
          ctx.fillRect(0, 0, W, H);

          // Layer 2: Draw some stylized vector clouds (Pavandev clouds)
          ctx.fillStyle = "rgba(252, 246, 186, 0.3)";
          for (let i = 0; i < 6; i++) {
            const cx = W / 2 + Math.cos(progress * Math.PI + i * 2) * 350;
            const cy = H / 2 + Math.sin(progress * Math.PI + i * 1.5) * 600;
            const cr = 200 + i * 50;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case "flower-shower": {
        // Sacred Pushpa Varsha (Thick blossom cascade of gold, orange marigolds and red roses)
        const alphaFade = Math.max(0, 1 - progress);
        if (alphaFade > 0) {
          ctx.globalAlpha = alphaFade * 0.8;
          ctx.fillStyle = "#fb8500";
          ctx.fillRect(0, 0, W, H);
        }

        // Draw active flower shower
        ctx.globalAlpha = 1;
        const count = 45;
        for (let i = 0; i < count; i++) {
          const tSpeed = 400 + i * 12;
          const fy = ((currentTime * tSpeed) + (i * 110)) % H;
          const fx = (i * 27) % W + Math.sin(currentTime * 3 + i) * 50;
          const fSize = 14 + (i % 16);
          const fRot = currentTime * 2.5 + i;

          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(fRot);

          if (i % 2 === 0) {
            const petalGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, fSize);
            petalGrad.addColorStop(0, "#ffb703");
            petalGrad.addColorStop(0.7, "#fb8500");
            petalGrad.addColorStop(1, "#d44000");
            ctx.fillStyle = petalGrad;

            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
              const rx = Math.cos(angle) * fSize * 0.6;
              const ry = Math.sin(angle) * fSize * 0.6;
              ctx.arc(rx, ry, fSize * 0.4, 0, Math.PI * 2);
            }
            ctx.fill();
          } else {
            const petGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, fSize);
            petGrad.addColorStop(0, "#ff4d6d");
            petGrad.addColorStop(0.8, "#c9184a");
            petGrad.addColorStop(1, "#800f2f");
            ctx.fillStyle = petGrad;

            ctx.beginPath();
            ctx.moveTo(0, -fSize);
            ctx.bezierCurveTo(fSize * 1.5, -fSize, fSize * 1.5, fSize, 0, fSize);
            ctx.bezierCurveTo(-fSize * 1.5, fSize, -fSize * 1.5, -fSize, 0, -fSize);
            ctx.fill();
          }

          ctx.restore();
        }
        break;
      }
    }

    ctx.restore();
  };

  // Draw branding credit inside the video
  const drawVideoBranding = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    // Watermark/branding removed from the video canvas per user request so templates and downloads remain clean!
  };

  // Seek timeline directly
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  // Capture Image (PNG or JPG)
  const handleExportFrame = (format: "png" | "jpg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set to full scale temporary or download active canvas state
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, 1.0);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `royal_wedding_invitation_${Math.floor(currentTime)}s.${format}`;
    link.click();
  };

  // Browser-based client-side high fidelity Recording
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);
      setIsPlaying(false);
      setCurrentTime(0);

      // We'll record in real-time step by step from 0 to 24s.
      const recordedChunks: Blob[] = [];
      const stream = canvas.captureStream(fps);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: selectedRes === "4k" ? 8000000 : 4000000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `royal_indian_wedding_invitation_${selectedRes}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      // Play and capture
      mediaRecorder.start();
      setIsPlaying(true);

      // Track progress
      const progressInterval = setInterval(() => {
        setCurrentTime((prev) => {
          const prog = (prev / duration) * 100;
          setRecordingProgress(Math.min(prog, 100));
          
          if (prev >= duration - 0.1) {
            clearInterval(progressInterval);
            mediaRecorder.stop();
            setIsPlaying(false);
            setCurrentTime(0);
          }
          return prev;
        });
      }, 100);

    } catch (err) {
      console.error("Recording error:", err);
      alert("Failed to record canvas. WebM recording is supported in most modern browsers.");
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full" id="renderer-card">
      {/* Live Preview Monitor Screen */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center w-full max-w-[340px] md:max-w-[420px] aspect-[9/16] bg-[#0c0804] border-4 border-[#b38728] rounded-2xl shadow-[0_0_40px_rgba(179,135,40,0.3)] overflow-hidden group"
      >
        {/* Background Canvas */}
        <canvas 
          ref={canvasRef}
          width={1080}
          height={1920}
          className="w-full h-full object-cover"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex justify-between items-center pointer-events-auto">
            <span className="text-xs font-serif bg-black/70 text-[#fcf6ba] px-3 py-1 rounded-full border border-[#bf953f]/40">
              Scene: {Math.floor(currentTime / 4) + 1} / 6
            </span>
            <button 
              onClick={toggleMusic}
              className="p-2 rounded-full bg-black/80 hover:bg-[#b38728] text-[#fcf6ba] transition-all border border-[#bf953f]/30"
              title="Toggle Royal Ambient Music"
            >
              {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <div className="pointer-events-auto text-center">
            <p className="text-[10px] font-mono text-[#dfc384] bg-black/70 px-2 py-1 rounded inline-block">
              Time: {currentTime.toFixed(1)}s / {duration}s
            </p>
          </div>
        </div>

        {/* Recording / Exporting Progress Bar */}
        {isRecording && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="royal-glow text-[#fcf6ba] mb-4">
              <Video className="w-12 h-12 mx-auto animate-bounce text-[#b38728]" />
            </div>
            <h3 className="font-serif text-lg text-gold-gradient font-bold mb-1">
              Generating 3D Wedding Video
            </h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">
              Capturing Canvas at {fps} FPS • {selectedRes}
            </p>
            <div className="w-full bg-[#1c1206] rounded-full h-2 overflow-hidden border border-[#bf953f]/30">
              <div 
                className="bg-gold-gradient h-full transition-all duration-100" 
                style={{ width: `${recordingProgress}%` }}
              />
            </div>
            <span className="text-xs text-[#dfc384] font-mono mt-2 font-bold">
              {recordingProgress.toFixed(0)}% Complete
            </span>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              Recording runs in real-time. Please do not close this tab or change scenes during export.
            </p>
          </div>
        )}
      </div>

      {/* Web-only "Created by Abhinav" premium floating badge */}
      <div className="mt-3 text-center select-none">
        <div className="inline-flex items-center gap-2 bg-[#120a05]/95 border border-[#bf953f]/30 px-3.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm transition-all hover:border-[#bf953f]/60 group">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] font-serif text-gray-300">
            Designed & Crafted by <span className="text-[#fcf6ba] font-bold">Abhinav</span>
          </span>
          <span className="text-[9px] font-mono bg-[#bf953f]/10 text-[#fcf6ba] px-2 py-0.5 rounded border border-[#bf953f]/20 uppercase">
            Web Exclusive
          </span>
        </div>
      </div>

      {/* Timeline Seeker & Control Deck */}
      <div className="w-full mt-6 bg-[#0f0b06]/90 border border-[#b38728]/30 rounded-xl p-4 flex flex-col gap-4">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#dfc384] w-10">
            {Math.floor(currentTime)}s
          </span>
          <input 
            type="range"
            min="0"
            max={duration - 0.1}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow h-1.5 bg-[#1c1206] rounded-lg appearance-none cursor-pointer accent-[#b38728]"
          />
          <span className="text-xs font-mono text-[#dfc384] w-10 text-right">
            {duration}s
          </span>
        </div>

        {/* Video Controls Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-lg bg-gold-gradient text-black hover:opacity-90 font-bold transition-all flex items-center gap-1.5"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="text-xs uppercase tracking-wider font-bold">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-2.5 rounded-lg bg-[#1c1206] hover:bg-[#2b1e0d] text-[#fcf6ba] border border-[#bf953f]/30 transition-all"
              title="Reset Video"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Quick Scene Jumper */}
          <div className="flex flex-wrap gap-1.5 max-sm:w-full max-sm:justify-center">
            {[
              { label: "Ganesh", t: 0 },
              { label: "Groom", t: 4 },
              { label: "Bride", t: 8 },
              { label: "Events", t: 12 },
              { label: "Venue", t: 16 },
              { label: "Outro", t: 20 },
            ].map((sc) => (
              <button
                key={sc.label}
                onClick={() => {
                  setCurrentTime(sc.t);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 text-[11px] rounded font-serif border transition-all ${
                  Math.floor(currentTime / 4) === sc.t / 4
                    ? "bg-[#b38728]/20 text-[#fcf6ba] border-[#b38728]"
                    : "bg-[#090603] text-gray-400 border-gray-800 hover:border-gray-700"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setExportModalOpen(true)}
            className="p-2.5 rounded-lg bg-gold-gradient text-black hover:opacity-90 font-bold transition-all flex items-center gap-2"
          >
            <Download size={18} />
            <span className="text-xs uppercase tracking-wider font-bold">Export Studio</span>
          </button>
        </div>
      </div>

      {/* Export Studio Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0b06] border-2 border-[#b38728] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(179,135,40,0.4)] relative">
            <h3 className="font-serif text-2xl text-gold-gradient font-bold text-center mb-2">
              Royal Export Studio
            </h3>
            <p className="text-xs text-gray-400 text-center mb-6">
              Generate premium, high-resolution media outputs from your wedding invitation templates.
            </p>

            <div className="space-y-6">
              {/* Image Exports */}
              <div className="border border-[#bf953f]/30 p-4 rounded-xl bg-[#1c1206]/40">
                <h4 className="font-serif text-sm text-[#fcf6ba] font-bold mb-3 flex items-center gap-1.5">
                  <ImageIcon size={16} className="text-[#b38728]" />
                  1. High-Res Snapshot Exports
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Export the active frame of your video at full 1080×1920 print-ready resolution instantly.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleExportFrame("png");
                      setExportModalOpen(false);
                    }}
                    className="py-2 px-4 rounded bg-gradient-to-r from-amber-900 to-amber-950 text-[#fcf6ba] hover:brightness-110 border border-[#bf953f]/40 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> PNG Frame
                  </button>
                  <button
                    onClick={() => {
                      handleExportFrame("jpg");
                      setExportModalOpen(false);
                    }}
                    className="py-2 px-4 rounded bg-gradient-to-r from-amber-900 to-amber-950 text-[#fcf6ba] hover:brightness-110 border border-[#bf953f]/40 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> JPG Frame
                  </button>
                </div>
              </div>

              {/* Video Exports */}
              <div className="border border-[#bf953f]/30 p-4 rounded-xl bg-[#1c1206]/40">
                <h4 className="font-serif text-sm text-[#fcf6ba] font-bold mb-3 flex items-center gap-1.5">
                  <Film size={16} className="text-[#b38728]" />
                  2. Full 3D Cinematic Video Export
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Records your entire 24-second timeline at ultra-smooth frame rates in WebM format.
                </p>

                {/* Configuration Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Resolution</label>
                    <select
                      value={selectedRes}
                      onChange={(e) => setSelectedRes(e.target.value as any)}
                      className="w-full bg-black text-[#dfc384] text-xs py-2 px-3 border border-[#bf953f]/40 rounded focus:outline-none"
                    >
                      <option value="1080p">1080 × 1920 (FHD)</option>
                      <option value="4k">2160 × 3840 (4K Cinematic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Frame Rate</label>
                    <select
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value) as any)}
                      className="w-full bg-black text-[#dfc384] text-xs py-2 px-3 border border-[#bf953f]/40 rounded focus:outline-none"
                    >
                      <option value={30}>30 FPS Standard</option>
                      <option value={60}>60 FPS Ultra-Fluid</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setExportModalOpen(false);
                    handleStartRecording();
                  }}
                  className="w-full py-2.5 rounded bg-gold-gradient text-black font-bold uppercase tracking-wider text-xs transition-all hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Video size={16} /> Generate Cinematic Video
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setExportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#fcf6ba] font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
