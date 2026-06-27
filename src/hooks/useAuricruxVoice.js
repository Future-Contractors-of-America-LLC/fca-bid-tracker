import { useCallback, useEffect, useRef, useState } from "react";
import { centralApi } from "../api/backendBase";

const PREFERRED_VOICES = [
  "Guy Online",
  "Andrew Online",
  "Ryan Online",
  "Davis Online",
  "Microsoft Guy",
  "Microsoft Andrew",
  "Microsoft Ryan",
  "Microsoft David",
  "Microsoft Mark",
  "Google UK English Male",
  "Daniel",
  "Alex",
  "Tom",
];

const FEMALE_VOICE_HINTS = [
  "zira",
  "jenny",
  "aria",
  "samantha",
  "hazel",
  "susan",
  "catherine",
  "female",
  "ana online",
  "ava online",
  "emma",
  "sonia",
  "michelle",
  "linda",
  "heather",
  "karen",
];

export const SPEECH_TIER_PARAMS = {
  1: { rate: 1.0, pitch: 0.9, label: "Apprentice instructor" },
  2: { rate: 1.02, pitch: 0.91, label: "Journeyman practitioner" },
  3: { rate: 1.04, pitch: 0.92, label: "Field foreman" },
  4: { rate: 1.06, pitch: 0.93, label: "Project superintendent" },
  5: { rate: 1.08, pitch: 0.94, label: "Executive construction operator" },
};

const LANE_TIER_BASE = {
  apprenticeship: 0,
  professional: 0.8,
  certification: 1.2,
  degree: 1.4,
  licensure: 1.6,
};

function clampTier(tier) {
  const value = Number(tier);
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function ttsParamsForTier(tier) {
  const safeTier = clampTier(tier);
  const { rate, pitch } = SPEECH_TIER_PARAMS[safeTier];
  return { rate, pitch, tier: safeTier, label: SPEECH_TIER_PARAMS[safeTier].label };
}

export function resolveSpeechTierFromContext({
  lane = "professional",
  programLevel = 1,
  moduleNumber = 1,
  lessonIndex = 1,
  completedModules = 0,
} = {}) {
  const level = Math.max(1, Number(programLevel) || 1);
  const moduleNum = Math.max(1, Number(moduleNumber) || 1);
  const lessonNum = Math.max(1, Number(lessonIndex) || 1);
  const completed = Math.max(0, Number(completedModules) || 0);

  const laneBase = LANE_TIER_BASE[lane] ?? 0.8;
  const levelScore = (Math.min(level - 1, 9) / 9) * 2.2;
  const moduleScore = (Math.min(moduleNum - 1, 11) / 11) * 1.6;
  const lessonScore = (Math.min(lessonNum - 1, 5) / 5) * 0.8;
  const completedScore = (Math.min(completed, 24) / 24) * 0.9;
  const score = laneBase + levelScore + moduleScore + lessonScore + completedScore;

  if (score < 1.8) return 1;
  if (score < 3.2) return 2;
  if (score < 4.6) return 3;
  if (score < 6) return 4;
  return 5;
}

function isFemaleVoice(name) {
  const lowered = (name || "").toLowerCase();
  return FEMALE_VOICE_HINTS.some((hint) => lowered.includes(hint));
}

function pickVoice(voices) {
  if (!voices?.length) return null;
  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return (
    voices.find((v) => v.lang?.startsWith("en") && !isFemaleVoice(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en-US") && !isFemaleVoice(v.name)) ||
    null
  );
}

function humanizeForSpeech(text) {
  return (text || "").replace(/^AURICRUX:\s*/i, "").replace(/\s+/g, " ").trim();
}

function playAudioBlob(blob, onAudio) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    if (onAudio) onAudio(audio);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

export default function useAuricruxVoice() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    setSupported(true);

    if (!window.speechSynthesis) return undefined;

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current = pickVoice(voices);
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakBrowser = useCallback(
    (cleaned, tier) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !voiceRef.current) {
        return Promise.resolve(false);
      }

      const tierParams = ttsParamsForTier(tier);
      const rate = tierParams.rate;
      const pitch = tierParams.pitch;

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.voice = voiceRef.current;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          setSpeaking(false);
          resolve(true);
        };
        utterance.onerror = () => {
          setSpeaking(false);
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [],
  );

  const speakAzure = useCallback(async (cleaned, tier) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(centralApi("/api/auricrux/speak"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg, application/json" },
        body: JSON.stringify({ text: cleaned, tier: clampTier(tier) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("audio")) {
        return false;
      }
      const blob = await response.blob();
      setSpeaking(true);
      await playAudioBlob(blob, (audio) => {
        audioRef.current = audio;
      });
      audioRef.current = null;
      setSpeaking(false);
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const speak = useCallback(
    async (text, options = {}) => {
      const cleaned = humanizeForSpeech(text);
      if (!cleaned || typeof window === "undefined") return false;

      const tier = options.tier != null ? clampTier(options.tier) : 3;
      stop();

      if (await speakAzure(cleaned, tier)) return true;
      return speakBrowser(cleaned, tier);
    },
    [speakAzure, speakBrowser, stop],
  );

  return { supported, speaking, speak, stop, ttsParamsForTier, resolveSpeechTierFromContext };
}
