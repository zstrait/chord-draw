import { createDefaultChord, resetChordStyling } from "./chord.ts";
import type { ChartChord, Chord, ChordChart } from "./types.ts";

export function applyChartStyling(
    chord: Chord,
    styling: Chord["styling"],
    clearMarkerColors = false,
): Chord {
    return {
        ...chord,
        ...(clearMarkerColors
            ? resetChordStyling(chord, styling)
            : { styling: { ...styling } }),
    };
}

export function createChartChord(settings: ChordChart["settings"]): ChartChord {
    return {
        id: crypto.randomUUID(),
        chord: { ...createDefaultChord(), ...structuredClone(settings) },
    };
}

export function createDefaultChart(): ChordChart {
    const { title, strings, barres, ...settings } = createDefaultChord();
    const rows = 2;
    const columns = 4;

    return {
        title,
        rows,
        columns,
        settings,
        slots: Array.from({ length: rows }, () =>
            Array.from({ length: columns }, () => null),
        ),
    };
}
