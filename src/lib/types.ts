// -1 = muted, 0 = open, number = fret
interface StringNote {
    fret: number | null;
    markerText: string | null;
}

interface Barre {
    fret: number | null;
    startString: number;
    endString: number;
    markerText: string | null;
}

export interface Tuning {
    label: string;
    notes: string[];
}

interface Styling {
    style: string;
    chordColor: string; // all "color" fields are hex codes
    lineThickness: number;
    lineColor: string;
    circleSize: number;
    circleColor: string;
    backgroundColor: string;
    titleFontSize: number;
    fingerFontSize: number;
}

export interface Chord {
    // id: string,  // will eventually use as a content hash
    title: string;
    tuning: Tuning;
    showStringNoteLabels: boolean;
    showTuningLabel: boolean;
    startFret: number;
    fretCount: number;
    capoFret: number | null;
    showFretLabel: boolean;
    ShowCapoLabel: boolean;
    stringCount: number;
    strings: StringNote[];
    barres: Barre[];
    styling: Styling;
}

export type HoverTarget = {
    kind: "note" | "string";
    stringIndex: number;
    fret: number;
    x: number;
    y: number;
    width: number;
    height: number;
    diameter: number;
};
