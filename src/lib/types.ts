// -1 = muted, 0 = open, number = fret
interface StringNote {
    fret: number | null;
    markerText: string | null;
    color?: string;
}

export interface Barre {
    fret: number | null;
    startString: number;
    endString: number;
    markerText: string | null;
    color?: string;
}

export interface Tuning {
    label: string;
    notes: string[];
    custom?: boolean;
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
    rotation: number;
    tuning: Tuning;
    customTuning: Tuning | null;
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

export interface ChartChord {
    id: string;
    chord: Chord;
}

export interface ChordChart {
    title: string;
    rows: number;
    columns: number;
    settings: Omit<Chord, "title" | "strings" | "barres">;
    slots: (ChartChord | null)[][];
}

export type BarreDrag = {
    fret: number;
    startString: number;
    endString: number;
    hasDragged: boolean;
};

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

export type TitleTarget = {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
};

export type TuningTarget = TitleTarget & {
    stringIndex: number | null;
};
