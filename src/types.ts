interface StringNote {
    fret: number // -1 = muted, 0 = open, number = fret
    finger: string | null
}

interface Barre {
    fret: number;
    startString: number,
    endString: number,
    finger: string | null
}

interface Chord {
    id: string,
    label: string | null,
    tuning: string | null,
    startFret: number,
    fretCount: number,
    capoFret: number | null,
    stringCount: number,
    strings: StringNote[],
    barres: Barre[]
}
