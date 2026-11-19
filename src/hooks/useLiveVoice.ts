import { useCallback, useEffect, useRef, useState } from "react";
import type { SupportedLang } from "../data/julietteProfile";

export type VoiceConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error";

export type MicPermissionState =
  | "idle"
  | "active"
  | "denied"
  | "unavailable";

export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function float32ToBase64Pcm16(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

function mergeTranscriptChunk(existing: string, incoming: string): string {
  if (!existing) return incoming.trimStart();
  if (!incoming) return existing;
  if (incoming.startsWith(existing)) return incoming;
  const needsSpace =
    !/\s$/.test(existing) &&
    !/^[\s.,!?;:'"’)\-]/.test(incoming);
  return existing + (needsSpace ? " " : "") + incoming;
}

export function useLiveVoice() {
  const [status, setStatus] = useState<VoiceConnectionStatus>("idle");
  const [micState, setMicState] = useState<MicPermissionState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef<boolean>(false);
  const pendingTextQueueRef = useRef<string[]>([]);

  const currentUserMsgIdRef = useRef<string | null>(null);
  const currentAssistantMsgIdRef = useRef<string | null>(null);
  const speakingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const clearAudioPlayback = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Ignore already stopped sources
      }
    }
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsSpeaking(false);
  }, []);

  const cleanupMic = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      try {
        processorRef.current.disconnect();
      } catch {
        // Ignore
      }
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore
      }
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }

    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }

    inputAnalyserRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    if (speakingTimeoutRef.current !== null) {
      window.clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }

    clearAudioPlayback();
    cleanupMic();

    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }

    outputAnalyserRef.current = null;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }

    currentUserMsgIdRef.current = null;
    currentAssistantMsgIdRef.current = null;
    pendingTextQueueRef.current = [];
    setIsSpeaking(false);
    setMicState("idle");
  }, [cleanupMic, clearAudioPlayback]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const attachMicrophone = useCallback(async (): Promise<MicPermissionState> => {
    cleanupMic();

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setMicState("unavailable");
      return "unavailable";
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      if (inputCtx.state === "suspended") {
        await inputCtx.resume().catch(() => {});
      }
      inputCtxRef.current = inputCtx;

      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 128;
      inputAnalyserRef.current = inputAnalyser;

      const source = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const silentGain = inputCtx.createGain();
      silentGain.gain.value = 0;

      source.connect(inputAnalyser);
      inputAnalyser.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(inputCtx.destination);

      processor.onaudioprocess = (event) => {
        if (isMutedRef.current) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }
        const channelData = event.inputBuffer.getChannelData(0);
        const base64Audio = float32ToBase64Pcm16(channelData);
        wsRef.current.send(
          JSON.stringify({ type: "audio", data: base64Audio })
        );
      };

      setMicState("active");
      setIsMuted(false);
      isMutedRef.current = false;
      return "active";
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      const nextMicState: MicPermissionState =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "denied"
          : "unavailable";
      setMicState(nextMicState);
      return nextMicState;
    }
  }, [cleanupMic]);

  const scheduleAudioChunk = useCallback((base64Pcm: string) => {
    const ctx = outputCtxRef.current;
    const analyser = outputAnalyserRef.current;
    if (!ctx || !analyser) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const float32 = base64Pcm16ToFloat32(base64Pcm);
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    activeSourcesRef.current.add(source);
    setIsSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        if (speakingTimeoutRef.current !== null) {
          window.clearTimeout(speakingTimeoutRef.current);
        }
        speakingTimeoutRef.current = window.setTimeout(() => {
          if (activeSourcesRef.current.size === 0) {
            setIsSpeaking(false);
          }
        }, 180);
      }
    };
  }, []);

  const appendTranscript = useCallback(
    (role: "user" | "assistant", chunk: string) => {
      if (!chunk || !chunk.trim()) return;

      if (role === "user") {
        currentAssistantMsgIdRef.current = null;
        if (!currentUserMsgIdRef.current) {
          const newId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          currentUserMsgIdRef.current = newId;
          setMessages((prev) => [
            ...prev,
            { id: newId, role: "user", text: chunk.trimStart() },
          ]);
        } else {
          const targetId = currentUserMsgIdRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === targetId
                ? { ...m, text: mergeTranscriptChunk(m.text, chunk) }
                : m
            )
          );
        }
      } else {
        currentUserMsgIdRef.current = null;
        if (!currentAssistantMsgIdRef.current) {
          const newId = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          currentAssistantMsgIdRef.current = newId;
          setMessages((prev) => [
            ...prev,
            { id: newId, role: "assistant", text: chunk.trimStart() },
          ]);
        } else {
          const targetId = currentAssistantMsgIdRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === targetId
                ? { ...m, text: mergeTranscriptChunk(m.text, chunk) }
                : m
            )
          );
        }
      }
    },
    []
  );

  const startSession = useCallback(
    async (lang: SupportedLang, initialTextPrompt?: string) => {
      cleanup();
      setErrorMessage(null);
      setStatus("connecting");
      setIsMuted(false);
      isMutedRef.current = false;

      if (initialTextPrompt) {
        pendingTextQueueRef.current.push(initialTextPrompt);
      }

      try {
        // Always initialize 24kHz playback context inside user click gesture
        const outputCtx = new AudioContext({ sampleRate: 24000 });
        if (outputCtx.state === "suspended") {
          await outputCtx.resume().catch(() => {});
        }
        outputCtxRef.current = outputCtx;

        const outputAnalyser = outputCtx.createAnalyser();
        outputAnalyser.fftSize = 128;
        outputAnalyserRef.current = outputAnalyser;

        // Try microphone capture; if denied/unavailable in browser or iframe,
        // continue gracefully in voice-output + text-input mode
        await attachMicrophone();

        const wsProtocol =
          window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(
          `${wsProtocol}//${window.location.host}/live?lang=${encodeURIComponent(lang)}`
        );
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as {
              type?: string;
              data?: string;
              text?: string;
              message?: string;
            };

            if (msg.type === "ready") {
              setStatus("connected");
              if (pendingTextQueueRef.current.length > 0) {
                for (const queuedText of pendingTextQueueRef.current) {
                  ws.send(JSON.stringify({ type: "text", data: queuedText }));
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      role: "user",
                      text: queuedText,
                    },
                  ]);
                }
                pendingTextQueueRef.current = [];
              }
            } else if (msg.type === "audio" && msg.data) {
              scheduleAudioChunk(msg.data);
            } else if (msg.type === "inputTranscript" && msg.text) {
              appendTranscript("user", msg.text);
            } else if (msg.type === "outputTranscript" && msg.text) {
              appendTranscript("assistant", msg.text);
            } else if (msg.type === "interrupted") {
              clearAudioPlayback();
              currentAssistantMsgIdRef.current = null;
            } else if (msg.type === "turnComplete") {
              currentUserMsgIdRef.current = null;
              currentAssistantMsgIdRef.current = null;
            } else if (msg.type === "error") {
              setErrorMessage(
                msg.message || "Voice assistant encountered an error."
              );
              setStatus("error");
              cleanup();
            } else if (msg.type === "closed") {
              setStatus("idle");
              cleanup();
            }
          } catch {
            // Ignore unparseable messages
          }
        };

        ws.onerror = () => {
          setErrorMessage(
            "Unable to connect to the live voice service. Please try again."
          );
          setStatus("error");
          cleanup();
        };

        ws.onclose = () => {
          setStatus((prev) => (prev === "error" ? "error" : "idle"));
        };
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not initialize audio playback or start session.";
        setErrorMessage(msg);
        setStatus("error");
        cleanup();
      }
    },
    [
      appendTranscript,
      attachMicrophone,
      cleanup,
      clearAudioPlayback,
      scheduleAudioChunk,
    ]
  );

  const enableMicrophone = useCallback(async () => {
    await attachMicrophone();
  }, [attachMicrophone]);

  const stopSession = useCallback(() => {
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const sendTextMessage = useCallback(
    (text: string, displayInTranscript = true) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "text", data: trimmed }));
        if (displayInTranscript) {
          currentUserMsgIdRef.current = null;
          currentAssistantMsgIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            {
              id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              role: "user",
              text: trimmed,
            },
          ]);
        }
      }
    },
    []
  );

  const getAudioLevels = useCallback(() => {
    const readLevel = (analyser: AnalyserNode | null): number => {
      if (!analyser) return 0;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }
      return Math.min(1, Math.sqrt(sum / data.length) * 3.2);
    };

    return {
      input: isMutedRef.current ? 0 : readLevel(inputAnalyserRef.current),
      output: readLevel(outputAnalyserRef.current),
    };
  }, []);

  return {
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
  };
}
