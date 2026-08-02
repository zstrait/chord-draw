// -1 = muted, 0 = open, number = fret
type FretValue = -1 | 0 | number;
type Finger = string | null;

interface StringNote {
	fret: FretValue,
	finger: Finger
}

interface Barre {
	fret: FretValue;
	startString: number,
	endString: number,
	finger: Finger
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