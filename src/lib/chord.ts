import type { Chord } from "./types";

export function createDefaultChord(): Chord {
  return {
    title: "",
    rotation: 0,
    tuning: { label: "Standard", notes: ["E", "A", "D", "G", "B", "E"] },
    customTuning: null,
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
      circleSize: 18,
      circleColor: "#000000",
      backgroundColor: "transparent",
      titleFontSize: 36,
      fingerFontSize: 20,
    },
  };
}

export function resetChordStyling(
  chord: Chord,
  styling = createDefaultChord().styling,
): Partial<Chord> {
  return {
    styling: { ...styling },
    strings: chord.strings.map((note) => ({ ...note, color: undefined })),
    barres: chord.barres.map((barre) => ({ ...barre, color: undefined })),
  };
}
