export class VoiceService {
  private static synth: SpeechSynthesis | null =
    typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  private static recognition: any = null;

  static isSynthesisSupported(): boolean {
    return !!this.synth;
  }

  static isRecognitionSupported(): boolean {
    return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }

  static speak(
    text: string,
    lang = "en",
    rate = 1.0,
    onEnd?: () => void
  ) {
    if (!this.synth) return;
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    // Pick best available voice for language
    const langCode = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
    utterance.lang = langCode;

    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang) || v.lang === langCode);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  static formatDigitsForSpeech(text: string, groupSize = 4): string {
    const digitsOnly = text.replace(/\D/g, "");
    if (digitsOnly.length < 6) return text;

    const groups: string[] = [];
    for (let i = 0; i < digitsOnly.length; i += groupSize) {
      const slice = digitsOnly.slice(i, i + groupSize);
      // Insert spaces between individual digits for deliberate, clear recitation
      groups.push(slice.split("").join(" "));
    }
    return groups.join(", ");
  }

  static listen(
    lang = "en",
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): () => void {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onError("Speech recognition is not supported in this browser.");
      return () => {};
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      recognition.onerror = (event: any) => {
        onError(event.error || "Speech recognition error");
      };

      recognition.start();
      this.recognition = recognition;

      return () => {
        try {
          recognition.abort();
        } catch {}
      };
    } catch (e: any) {
      onError(e.message || "Failed to initialize speech recognition");
      return () => {};
    }
  }
}
