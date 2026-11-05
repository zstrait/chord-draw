import type { Chord } from "./types";

export function createDefaultChord(): Chord {
    return {
        title: "",
        tuning: { label: "Standard", notes: ["E", "A", "D", "G", "B", "E"] },
        showStringNoteLabels: false,
        showTuningLabel: false,
        startFret: 1,
        fretCount: 4,
        capoFret: null,
        showFretLabel: true,
        ShowCapoLabel: false,
        stringCount: 6,
        strings: [
            {
                fret: null,
                markerText: null,
            },
            {
                fret: null,
                markerText: null,
            },
            {
                fret: null,
                markerText: null,
            },
            {
                fret: null,
                markerText: null,
            },
            {
                fret: null,
                markerText: null,
            },
            {
                fret: null,
                markerText: null,
            },
        ],
        barres: [],
        styling: {
            style: "normal",
            chordColor: "#000000",
            lineThickness: 2,
            lineColor: "#000000",
            circleSize: 20,
            circleColor: "#000000",
            backgroundColor: "transparent",
            titleFontSize: 32,
            fingerFontSize: 20,
        },
    };
}

export function resetChordStyling(): Partial<Chord> {
    return {
        styling: createDefaultChord().styling,
    };
}
