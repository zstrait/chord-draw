import type { Tuning } from "./types.ts";

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
