// -1 = muted, 0 = open, number = fret
type FretValue = number | null;
type Finger = string | null;

interface StringNote {
    fret: FretValue;
    finger: Finger;
}

interface Barre {
    fret: FretValue;
    startString: number;
    endString: number;
    finger: Finger;
}

export interface Tuning {
    label: string;
    notes: string[];
}

interface Styling {
    style: "normal" | "handdrawn";
    lineThickness: number;
    lineColor: string; // all "color" fields are hex codes
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
    capoIndicator: boolean;
    stringCount: number;
    strings: StringNote[];
    barres: Barre[];
    styling: Styling;
}
