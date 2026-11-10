import type { Chord, Tuning } from "./types.ts";

export function normalizeTuningNote(value: string): string | null {
  const note = /^([a-g])\s*(#|♯|s|b|♭|flat)?$/i.exec(value.trim());
  if (!note) return null;
  const accidental = note[2];
  return (
    note[1].toUpperCase() +
    (accidental ? (/^(b|♭|flat)$/i.test(accidental) ? "♭" : "#") : "")
  );
}

export function selectTuning(chord: Chord, value: string): Partial<Chord> {
  const customTuning = chord.tuning.custom ? chord.tuning : chord.customTuning;
  if (value === "custom") {
    return {
      tuning: customTuning ?? {
        label: "Custom Tuning",
        notes: Array(chord.stringCount).fill("_"),
        custom: true,
      },
      showStringNoteLabels: true,
    };
  }
  const tuning = tuningPresets.find((preset) => preset.label === value);
  return tuning ? { tuning, customTuning } : {};
}

export const tuningPresets: Tuning[] = [
  {
    label: "Standard",
    notes: ["E", "A", "D", "G", "B", "E"],
  },
  {
    label: "E♭ Standard",
    notes: ["E♭", "A♭", "D♭", "G♭", "B♭", "E♭"],
  },
  {
    label: "D Standard",
    notes: ["D", "G", "C", "F", "A", "D"],
  },
  {
    label: "Drop D",
    notes: ["D", "A", "D", "G", "B", "E"],
  },
  {
    label: "Drop C#",
    notes: ["C#", "G#", "C#", "F#", "A#", "D#"],
  },
];
