import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mic, MicOff, PhoneOff, Send } from "lucide-react";
import {
  STUDIO_COPY,
  type SupportedLang,
} from "../data/julietteProfile";
import type {
  MicPermissionState,
  TranscriptMessage,
  VoiceConnectionStatus,
} from "../hooks/useLiveVoice";
import { AcousticOrb } from "./AcousticOrb";

interface VoiceStudioProps {
  lang: SupportedLang;
  onSelectLang: (lang: SupportedLang) => void;
  status: VoiceConnectionStatus;
  micState: MicPermissionState;
  isMuted: boolean;
  isSpeaking: boolean;
  errorMessage: string | null;
  messages: TranscriptMessage[];
  onStart: (lang: SupportedLang, initialPrompt?: string) => void;
  onStop: () => void;
  onToggleMute: () => void;
  onEnableMic: () => void;
  onSendText: (text: string) => void;
  getAudioLevels: () => { input: number; output: number };
}

export function VoiceStudio({
  lang,
  onSelectLang,
  status,
  micState,
  isMuted,
  isSpeaking,
  errorMessage,
  messages,
  onStart,
  onStop,
  onToggleMute,
  onEnableMic,
  onSendText,
  getAudioLevels,
}: VoiceStudioProps) {
  const [draft, setDraft] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const copy = STUDIO_COPY[lang];

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLanguageChange = (nextLang: SupportedLang) => {
    onSelectLang(nextLang);
    if (status === "connected") {
      const switchCue =
        nextLang === "fr"
          ? "Please continue speaking in French from now on."
          : nextLang === "es"
            ? "Please continue speaking in Spanish from now on."
            : "Please continue speaking in English from now on.";
      onSendText(switchCue);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDraft("");
    if (status === "connected") {
      onSendText(trimmed);
    } else {
      onStart(lang, trimmed);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    if (status === "connected") {
      onSendText(prompt);
    } else {
      onStart(lang, prompt);
    }
  };

  const statusText =
    status === "connecting"
      ? copy.connecting
      : status === "connected"
        ? isSpeaking
          ? copy.speaking
          : micState === "active"
            ? isMuted
              ? copy.muted
              : copy.listening
            : copy.listeningTextOnly
        : copy.ready;

  const micNoticeVisible =
    status === "connected" &&
    (micState === "denied" || micState === "unavailable");

  return (
    <section
      aria-label="Juul Voice Studio"
      className="flex flex-col justify-between h-full bg-[#F4EDE2] border border-[rgba(59,35,20,0.14)] rounded-xl p-6 sm:p-8"
    >
      {/* Studio Top Bar: Title + Language Segmented Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[rgba(59,35,20,0.12)]">
        <div>
          <h2 className="font-editorial text-3xl font-bold tracking-tight text-[#3B2314]">
            <span className="text-[#C45D7B]">Juul</span> Voice Studio
          </h2>
          <p className="text-xs text-[#5C4738] mt-0.5">{statusText}</p>
        </div>

        <div
          role="group"
          aria-label="Conversation language"
          className="inline-flex items-center gap-1 p-1 bg-[#DFD3C0] rounded-lg"
        >
          {(["en", "fr", "es"] as SupportedLang[]).map((code) => {
            const active = lang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageChange(code)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314] ${
                  active
                    ? "bg-[#F4EDE2] text-[#3B2314] shadow-xs"
                    : "text-[#5C4738] hover:text-[#3B2314]"
                }`}
              >
                {STUDIO_COPY[code].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Acoustic Orb & Call Controls */}
      <div className="py-6 flex flex-col items-center justify-center">
        <AcousticOrb
          status={status}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          getAudioLevels={getAudioLevels}
        />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {status === "idle" || status === "error" ? (
            <button
              type="button"
              onClick={() => onStart(lang)}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-[#3B2314] text-[#F4EDE2] text-sm font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
            >
              <Mic className="w-4 h-4 text-[#F7C6D4]" aria-hidden="true" />
              <span>{copy.startBtn}</span>
            </button>
          ) : (
            <>
              {micState === "active" ? (
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[rgba(59,35,20,0.2)] bg-[#F4EDE2] text-[#3B2314] text-sm font-medium rounded-lg hover:bg-[#DFD3C0] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
                >
                  {isMuted ? (
                    <MicOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Mic className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{isMuted ? copy.unmuteBtn : copy.muteBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onEnableMic}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[rgba(59,35,20,0.2)] bg-[#F4EDE2] text-[#3B2314] text-sm font-medium rounded-lg hover:bg-[#DFD3C0] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
                >
                  <Mic className="w-4 h-4" aria-hidden="true" />
                  <span>{copy.retryMicBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B2314] text-[#F4EDE2] text-sm font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
              >
                <PhoneOff className="w-4 h-4 text-[#F7C6D4]" aria-hidden="true" />
                <span>{copy.endBtn}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Non-blocking Microphone Notice when mic is blocked */}
      {micNoticeVisible && (
        <div className="mb-4 px-4 py-3 text-xs text-[#5C4738] bg-[#EAE0D0] border border-[rgba(59,35,20,0.14)] rounded-lg">
          {copy.micDeniedNotice}
        </div>
      )}

      {/* Inline Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
        >
          {errorMessage}
        </div>
      )}

      {/* Live Editorial Transcript or Starter Questions */}
      <div className="border-t border-[rgba(59,35,20,0.12)] pt-4 flex-1 flex flex-col justify-between min-h-[180px]">
        {messages.length === 0 ? (
          <div className="space-y-3 my-auto">
            <p className="text-xs text-[#5C4738] leading-relaxed">
              {copy.emptyHint}
            </p>
            <div className="flex flex-col divide-y divide-[rgba(59,35,20,0.1)] border-y border-[rgba(59,35,20,0.1)]">
              {copy.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleStarterPrompt(prompt)}
                  className="text-left py-2.5 text-xs text-[#2D1E16] hover:text-[#3B2314] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <span>{prompt}</span>
                  <span className="text-[#786252] shrink-0" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto pr-1 space-y-3 mb-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-relaxed">
                <span
                  className={`text-xs font-medium mr-2 ${
                    msg.role === "assistant"
                      ? "text-[#C45D7B]"
                      : "text-[#786252]"
                  }`}
                >
                  {msg.role === "assistant" ? "Juul" : "You"}
                </span>
                <span
                  className={
                    msg.role === "assistant"
                      ? "text-[#2D1E16]"
                      : "text-[#5C4738]"
                  }
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Text Input Fallback / Mid-Call Prompt */}
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-center gap-2 border-t border-[rgba(59,35,20,0.12)] pt-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-[#2D1E16] placeholder:text-[#786252] py-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[rgba(59,35,20,0.18)] text-[#3B2314] hover:bg-[#DFD3C0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
