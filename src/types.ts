export interface WeddingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
}

export type WeddingThemeId = string;

export interface WeddingTheme {
  id: WeddingThemeId;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  musicName: string;
  musicVibe: string;
  description: string;
  archeStyle: "palace" | "temple" | "modern" | "mandala";
  category?: string;
  decorPattern?: string;
  particleType?: "sparkles" | "rose-petals" | "marigold" | "gold-dust";
}

export interface FieldStyle {
  fontFamily?: string;
  fontSize?: number; // base font size in px on 1080x1920 canvas
  align?: "left" | "center" | "right";
  color?: string; // hex color or gradient:preset-name
}

export interface WeddingDetails {
  brideName: string;
  groomName: string;
  brideParents: string; // e.g. "Suresh Ji & Saroj Devi"
  groomParents: string; // e.g. "Vinod Ji & Jaymala Devi"
  brideAddress: string; // e.g. "At + Post - Posdaha"
  groomAddress: string; // e.g. "At + Post - Manikpur"
  venue: string; // e.g. "Narpatganj, Araria, Bihar"
  invitationMessage: string;
  closingMessage: string;
  bridePhoto: string; // base64 or placeholder
  groomPhoto: string; // base64 or placeholder
  musicUrl: string; // Selected music url or file
  musicId: string; // Built-in music ID
  themeId: WeddingThemeId;
  events: WeddingEvent[];
  textColor?: string; // custom primary text color (default gold #bf953f)
  secondaryTextColor?: string; // custom secondary text color (default white/cream)
  textEffectId?: string; // Selected 10+ dynamic text entry effect
  videoEffectId?: string; // Selected cinematic intro video transition overlay effect
  fieldStyles?: {
    brideName?: FieldStyle;
    groomName?: FieldStyle;
    date?: FieldStyle;
    venue?: FieldStyle;
  };
}

export type ExportFormat = "mp4" | "png" | "jpg" | "html" | "zip";
export type VideoResolution = "1080p" | "4k";
