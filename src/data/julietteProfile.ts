export type SupportedLang = "en" | "fr" | "es";

export const CV_PDF_URL =
  "/assets/aistudio/Copie_de_CV_Juliette_GAREL_a3912f76.pdf";

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  contract: string;
  highlights: string[];
}

export interface EducationItem {
  period: string;
  degree: string;
  institution: string;
  detail?: string;
}

export const JULIETTE_EXPERIENCE: ExperienceItem[] = [
  {
    period: "2022 – 2025",
    role: "Community Manager",
    organization: "L'armoire de Joséphine",
    contract: "Alternance / CDD",
    highlights: [
      "Managed Facebook and Instagram channels: editorial content creation, strategic monitoring, and trend tracking.",
      "Led online influencer relations and brand collaborations.",
      "Created and launched events supported by tailored communication assets.",
    ],
  },
  {
    period: "2024 – 2025",
    role: "Marketing Assistant",
    organization: "Agence Close Up",
    contract: "6-month Internship",
    highlights: [
      "Produced promotional materials in collaboration with the graphic design team.",
      "Planned and managed multi-platform social media campaigns.",
      "Contributed to building and maintaining a client database.",
      "Conducted competitive intelligence and marketing trend analysis.",
    ],
  },
  {
    period: "2022",
    role: "Cashier & Retail Associate",
    organization: "Carrefour City",
    contract: "CDD",
    highlights: [
      "Customer reception, fast and accurate checkout operations.",
      "Promoted loyalty programs and commercial offers.",
      "Managed shelf merchandising and inventory replenishment.",
    ],
  },
  {
    period: "2021",
    role: "Multi-Skilled Server",
    organization: "Chez Woody",
    contract: "CDD · 2 months",
    highlights: [
      "Welcomed and seated guests, managed reservations, and presented menus.",
      "Collaborated seamlessly with the dining and kitchen teams for an attentive guest experience.",
    ],
  },
  {
    period: "2019",
    role: "Headquarters Observation Intern",
    organization: "Paco Rabanne",
    contract: "1-week Immersion",
    highlights: [
      "Discovered administrative and strategic functions inside a luxury fashion headquarters.",
      "Observed cross-departmental coordination and management workflows.",
      "Introduced to corporate commercial and marketing practices.",
    ],
  },
];

export const JULIETTE_EDUCATION: EducationItem[] = [
  {
    period: "2024 – 2025",
    degree: "Bachelor Commerce, Marketing et Négociation",
    institution: "IPAC, Vannes",
    detail: "Apprenticeship (in progress)",
  },
  {
    period: "2022 – 2024",
    degree: "BTS Communication",
    institution: "AFTEC, Vannes",
    detail: "Apprenticeship",
  },
  {
    period: "2018 – 2021",
    degree: "Baccalauréat STMG, Management Option",
    institution: "Lycée Saint-Paul, Vannes",
  },
  {
    period: "2014 – 2018",
    degree: "Diplôme National du Brevet (DNB)",
    institution: "Collège Le Sacré-Coeur, Vannes",
  },
];

export const JULIETTE_SKILLS = {
  tools: ["Canva", "CapCut", "Microsoft Office (Word, Excel, PowerPoint)"],
  platforms: ["Instagram", "Facebook", "LinkedIn", "TikTok"],
  softSkills: ["Curious", "Rigorous", "Creative", "Autonomous"],
  languages: ["French (Native)", "English (Fluent)", "Spanish (Conversational)"],
  interests: ["Travel", "Music", "Fashion", "Sport", "Photography"],
};

export const STUDIO_COPY: Record<
  SupportedLang,
  {
    label: string;
    ready: string;
    connecting: string;
    listening: string;
    listeningTextOnly: string;
    speaking: string;
    muted: string;
    startBtn: string;
    endBtn: string;
    muteBtn: string;
    unmuteBtn: string;
    retryMicBtn: string;
    micDeniedNotice: string;
    placeholder: string;
    emptyHint: string;
    prompts: string[];
  }
> = {
  en: {
    label: "English",
    ready: "Ready to speak",
    connecting: "Connecting to Juul…",
    listening: "Listening — speak naturally",
    listeningTextOnly: "Connected (voice output + text chat)",
    speaking: "Juul is speaking",
    muted: "Microphone muted",
    startBtn: "Start Voice Conversation",
    endBtn: "End Conversation",
    muteBtn: "Mute",
    unmuteBtn: "Unmute",
    retryMicBtn: "Enable Mic",
    micDeniedNotice:
      "Microphone is blocked or unavailable in this browser frame. You can still hear Juul speak and chat by typing or selecting a question below.",
    placeholder: "Type a message to Juul…",
    emptyHint:
      "Ask Juul about Juliette's experience at L'armoire de Joséphine, her internship at Agence Close Up, or her availability.",
    prompts: [
      "Tell me about Juliette's social media experience.",
      "What did she learn at Agence Close Up?",
      "What kind of apprenticeship is she looking for?",
    ],
  },
  fr: {
    label: "Français",
    ready: "Prête à vous écouter",
    connecting: "Connexion avec Juul…",
    listening: "À l'écoute — parlez naturellement",
    listeningTextOnly: "Connectée (voix sortante + écrit)",
    speaking: "Juul parle",
    muted: "Micro coupé",
    startBtn: "Démarrer l'échange vocal",
    endBtn: "Terminer l'échange",
    muteBtn: "Couper le micro",
    unmuteBtn: "Activer le micro",
    retryMicBtn: "Activer le micro",
    micDeniedNotice:
      "Le micro est bloqué ou indisponible dans cet aperçu. Vous pouvez tout de même entendre Juul et lui écrire ci-dessous.",
    placeholder: "Écrire un message à Juul…",
    emptyHint:
      "Interrogez Juul sur l'expérience de Juliette chez L'armoire de Joséphine, son stage à l'Agence Close Up ou ses disponibilités.",
    prompts: [
      "Parle-moi de son expérience en community management.",
      "Quelles sont ses compétences digitales et créatives ?",
      "Quel type d'alternance recherche-t-elle ?",
    ],
  },
  es: {
    label: "Español",
    ready: "Lista para hablar",
    connecting: "Conectando con Juul…",
    listening: "Escuchando — habla con naturalidad",
    listeningTextOnly: "Conectada (voz de salida + texto)",
    speaking: "Juul está hablando",
    muted: "Micrófono silenciado",
    startBtn: "Iniciar conversación de voz",
    endBtn: "Finalizar conversación",
    muteBtn: "Silenciar",
    unmuteBtn: "Activar micro",
    retryMicBtn: "Activar micro",
    micDeniedNotice:
      "El micrófono está bloqueado o no disponible en este navegador. Aún puedes escuchar a Juul y escribirle abajo.",
    placeholder: "Escribe un mensaje a Juul…",
    emptyHint:
      "Pregunta a Juul sobre la experiencia de Juliette en L'armoire de Joséphine, sus prácticas en Agence Close Up o su formación.",
    prompts: [
      "Cuéntame sobre su experiencia en redes sociales.",
      "¿Qué formación está cursando actualmente?",
      "¿Qué tipo de puesto busca Juliette?",
    ],
  },
};
