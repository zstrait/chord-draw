import type { Chord } from "./types";

export function createDefaultChord(): Chord {
    return {
        title: "",
        tuning: { label: "Standard", notes: ["E", "A", "D", "G", "B", "E"] },
        showStringNoteLabels: false,
        showTuningLabel: false,
        startFret: 0,
        fretCount: 5,
        capoIndicator: false,
        stringCount: 6,
        strings: [],
        barres: [],
        styling: {
            style: "normal",
            lineThickness: 11,
            lineColor: "#000000",
            circleSize: 10,
            circleColor: "#000000",
            backgroundColor: "transparent",
            titleFontSize: 18,
            fingerFontSize: 16,
        },
    };
}

export function resetChordStyling(): Partial<Chord> {
    return {
        styling: createDefaultChord().styling,
    };
}