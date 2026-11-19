import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { CV_PDF_URL } from "../data/julietteProfile";

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CvPreviewModal({ isOpen, onClose }: CvPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Juliette Garel Curriculum Vitae"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[85vh] bg-[#F4EDE2] border border-[rgba(59,35,20,0.16)] rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[rgba(59,35,20,0.12)]">
          <div>
            <h2 className="font-editorial text-3xl font-bold text-[#3B2314]">
              Curriculum Vitae — Juliette Garel
            </h2>
            <p className="text-xs text-[#5C4738]">
              Alternance Assistante Social Media &amp; Contenus Digitaux
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={CV_PDF_URL}
              download="CV_Juliette_Garel.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B2314] text-[#F4EDE2] text-xs font-medium rounded-lg hover:bg-[#4E2F1C] transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#F7C6D4]" aria-hidden="true" />
              <span>Download PDF</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close CV preview"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[rgba(59,35,20,0.18)] text-[#3B2314] hover:bg-[#DFD3C0] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#DFD3C0]">
          <iframe
            src={CV_PDF_URL}
            title="Juliette Garel CV PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
