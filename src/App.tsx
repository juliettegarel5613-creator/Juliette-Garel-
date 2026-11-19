import { useState } from "react";
import { ArrowUpRight, Download, Mail, Mic, Phone } from "lucide-react";
import {
  CV_PDF_URL,
  JULIETTE_EDUCATION,
  JULIETTE_EXPERIENCE,
  JULIETTE_SKILLS,
  type SupportedLang,
} from "./data/julietteProfile";
import { useLiveVoice } from "./hooks/useLiveVoice";
import { VoiceStudio } from "./components/VoiceStudio";
import { CvPreviewModal } from "./components/CvPreviewModal";

export default function App() {
  const [lang, setLang] = useState<SupportedLang>("en");
  const [isCvOpen, setIsCvOpen] = useState(false);

  const {
    status,
    micState,
    isMuted,
    isSpeaking,
    errorMessage,
    messages,
    startSession,
    stopSession,
    toggleMute,
    enableMicrophone,
    sendTextMessage,
    getAudioLevels,
  } = useLiveVoice();

  return (
    <div id="top" className="min-h-screen bg-[#EAE0D0] text-[#2D1E16]">
      {/* 3-Zone Top Navigation Bar */}
      <header className="border-b border-[rgba(59,35,20,0.18)] bg-[#3B2314] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-editorial text-3xl font-bold tracking-tight text-[#F4EDE2] whitespace-nowrap shrink-0"
          >
            Juliette Garel
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#F7C6D4]"
          >
            <a
              href="#assistant"
              className="text-[#F7C6D4] hover:text-[#FDE4EC] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Assistant
            </a>
            <a
              href="#experience"
              className="text-[#F7C6D4] hover:text-[#FDE4EC] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Expérience
            </a>
            <a
              href="#education"
              className="text-[#F7C6D4] hover:text-[#FDE4EC] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Education
            </a>
            <a
              href="#contact"
              className="text-[#F7C6D4] hover:text-[#FDE4EC] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCvOpen(true)}
              className="px-4 py-2 text-xs font-medium bg-[#F4EDE2] text-[#3B2314] rounded-lg hover:bg-[#F7C6D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7C6D4]"
            >
              View CV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Hero Split */}
        <section
          id="assistant"
          className="py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch"
        >
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs tracking-wide text-[#5C4738] mb-4">
              Vannes, France · Digital Communications &amp; Social Media
            </p>

            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-[4.25rem] font-bold leading-[0.98] tracking-tight text-[#3B2314] text-balance">
              Speak with <span className="text-[#C45D7B]">Juul</span>, Juliette&apos;s multilingual voice assistant.
            </h1>

            <p className="mt-6 text-base text-[#5C4738] leading-relaxed max-w-xl">
              Passionate about communications and digital media, Juliette Garel
              brings three years of hands-on community management, campaign
              coordination, and creative content production. Ask{" "}
              <span className="font-medium text-[#C45D7B]">Juul</span> anything
              in English, French, or Spanish.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {status === "idle" || status === "error" ? (
                <button
                  type="button"
                  onClick={() => startSession(lang)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#3B2314] text-[#F4EDE2] text-sm font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
                >
                  <Mic className="w-4 h-4 text-[#F7C6D4]" aria-hidden="true" />
                  <span>Start Voice Conversation</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopSession}
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#3B2314] text-[#F4EDE2] text-sm font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2314]"
                >
                  <span>End Conversation</span>
                </button>
              )}

              <a
                href={CV_PDF_URL}
                download="CV_Juliette_Garel.pdf"
                className="inline-flex items-center gap-2 px-5 py-3 border border-[rgba(59,35,20,0.22)] bg-[#F4EDE2] text-sm font-medium text-[#3B2314] rounded-lg hover:bg-[#DFD3C0] transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Download PDF</span>
              </a>
            </div>

            <div className="mt-10 pt-6 border-t border-[rgba(59,35,20,0.14)] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C4738]">
              <span>Seeking Alternance: Social Media &amp; Digital Content</span>
              <span aria-hidden="true">·</span>
              <span>Fluent in English, Français &amp; Español</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <VoiceStudio
              lang={lang}
              onSelectLang={setLang}
              status={status}
              micState={micState}
              isMuted={isMuted}
              isSpeaking={isSpeaking}
              errorMessage={errorMessage}
              messages={messages}
              onStart={startSession}
              onStop={stopSession}
              onToggleMute={toggleMute}
              onEnableMic={enableMicrophone}
              onSendText={sendTextMessage}
              getAudioLevels={getAudioLevels}
            />
          </div>
        </section>

        {/* Full-Width 4-Column Key Facts Strip */}
        <section
          aria-label="Key highlights"
          className="border-y border-[rgba(59,35,20,0.15)] py-8 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div>
            <p className="font-editorial text-4xl font-bold text-[#3B2314] tabular-nums">
              2022–2025
            </p>
            <p className="text-xs text-[#5C4738] mt-1">
              Community Management &amp; Marketing
            </p>
          </div>
          <div>
            <p className="font-editorial text-4xl font-bold text-[#3B2314] tabular-nums">
              3 Languages
            </p>
            <p className="text-xs text-[#5C4738] mt-1">
              French · English · Spanish
            </p>
          </div>
          <div>
            <p className="font-editorial text-4xl font-bold text-[#3B2314]">
              Bachelor
            </p>
            <p className="text-xs text-[#5C4738] mt-1">
              Commerce, Marketing &amp; Negotiation
            </p>
          </div>
          <div>
            <p className="font-editorial text-4xl font-bold text-[#3B2314]">
              Vannes, 56000
            </p>
            <p className="text-xs text-[#5C4738] mt-1">
              Brittany, France · Permis B
            </p>
          </div>
        </section>

        {/* 01. Experience */}
        <section id="experience" className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#3B2314]">
                01. Experience
              </h2>
              <p className="mt-3 text-sm text-[#5C4738] leading-relaxed max-w-xs">
                From fashion headquarters immersion at Paco Rabanne to full-cycle
                social media leadership and agency campaigns.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[rgba(59,35,20,0.14)] border-t border-[rgba(59,35,20,0.14)]">
              {JULIETTE_EXPERIENCE.map((item) => (
                <article
                  key={`${item.organization}-${item.period}`}
                  className="py-7 first:pt-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-editorial text-3xl font-bold text-[#3B2314]">
                        {item.role}
                      </h3>
                      <p className="text-sm text-[#5C4738] mt-0.5">
                        {item.organization}
                        <span className="mx-2 text-[#786252]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[#786252]">{item.contract}</span>
                      </p>
                    </div>
                    <span className="text-xs text-[#786252] tabular-nums shrink-0">
                      {item.period}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-1.5 text-sm text-[#5C4738] leading-relaxed">
                    {item.highlights.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span
                          className="text-[#3B2314] select-none"
                          aria-hidden="true"
                        >
                          —
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 02. Education & Capabilities */}
        <section
          id="education"
          className="py-20 border-t border-[rgba(59,35,20,0.14)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Academic Formations */}
            <div className="lg:col-span-6">
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#3B2314] mb-8">
                02. Education
              </h2>

              <div className="divide-y divide-[rgba(59,35,20,0.14)] border-t border-[rgba(59,35,20,0.14)]">
                {JULIETTE_EDUCATION.map((edu) => (
                  <div
                    key={edu.degree}
                    className="py-5 flex items-baseline justify-between gap-6"
                  >
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#3B2314]">
                        {edu.degree}
                      </h3>
                      <p className="text-sm text-[#5C4738] mt-0.5">
                        {edu.institution}
                        {edu.detail && (
                          <>
                            <span
                              className="mx-2 text-[#786252]"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                            <span className="text-[#786252]">{edu.detail}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-[#786252] tabular-nums shrink-0">
                      {edu.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools, Soft Skills, Languages, Interests */}
            <div className="lg:col-span-6">
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#3B2314] mb-8">
                Capabilities &amp; Profile
              </h2>

              <div className="divide-y divide-[rgba(59,35,20,0.14)] border-t border-[rgba(59,35,20,0.14)]">
                <div className="py-5">
                  <p className="text-xs text-[#786252] mb-1.5">
                    Creative &amp; Productivity Tools
                  </p>
                  <p className="text-sm text-[#2D1E16] leading-relaxed">
                    {JULIETTE_SKILLS.tools.join(" · ")}
                  </p>
                </div>

                <div className="py-5">
                  <p className="text-xs text-[#786252] mb-1.5">
                    Social Platforms
                  </p>
                  <p className="text-sm text-[#2D1E16] leading-relaxed">
                    {JULIETTE_SKILLS.platforms.join(" · ")}
                  </p>
                </div>

                <div className="py-5">
                  <p className="text-xs text-[#786252] mb-1.5">Soft Skills</p>
                  <p className="text-sm text-[#2D1E16] leading-relaxed">
                    {JULIETTE_SKILLS.softSkills.join(" · ")}
                  </p>
                </div>

                <div className="py-5">
                  <p className="text-xs text-[#786252] mb-1.5">Languages</p>
                  <p className="text-sm text-[#2D1E16] leading-relaxed">
                    {JULIETTE_SKILLS.languages.join(" · ")}
                  </p>
                </div>

                <div className="py-5">
                  <p className="text-xs text-[#786252] mb-1.5">Interests</p>
                  <p className="text-sm text-[#2D1E16] leading-relaxed">
                    {JULIETTE_SKILLS.interests.join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03. Contact & CV */}
        <section
          id="contact"
          className="py-20 border-t border-[rgba(59,35,20,0.14)]"
        >
          <div className="bg-[#F4EDE2] border border-[rgba(59,35,20,0.14)] rounded-xl p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs text-[#786252] mb-2">
                03. Direct Contact
              </p>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-[#3B2314] text-balance">
                Connect with Juliette Garel
              </h2>
              <p className="mt-3 text-sm text-[#5C4738] leading-relaxed">
                Available for apprenticeship opportunities in digital
                communications, social media management, and event coordination.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#2D1E16]">
                <a
                  href="mailto:juliettegarel5613@gmail.com"
                  className="inline-flex items-center gap-2 hover:text-[#3B2314] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#786252]" aria-hidden="true" />
                  <span>juliettegarel5613@gmail.com</span>
                </a>

                <a
                  href="tel:+33665103356"
                  className="inline-flex items-center gap-2 hover:text-[#3B2314] transition-colors tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#786252]" aria-hidden="true" />
                  <span>06 65 10 33 56</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCvOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgba(59,35,20,0.22)] bg-[#EAE0D0] text-sm font-medium text-[#3B2314] rounded-lg hover:bg-[#DFD3C0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Preview CV</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={CV_PDF_URL}
                download="CV_Juliette_Garel.pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B2314] text-[#F4EDE2] text-sm font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4 text-[#F7C6D4]" aria-hidden="true" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(59,35,20,0.14)] py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C4738]">
          <span>Juliette Garel · Vannes, Brittany, France</span>
          <span>
            <span className="font-medium text-[#C45D7B]">Juul</span> —
            Multilingual Voice Assistant (EN · FR · ES)
          </span>
        </div>
      </footer>

      <CvPreviewModal isOpen={isCvOpen} onClose={() => setIsCvOpen(false)} />
    </div>
  );
}
