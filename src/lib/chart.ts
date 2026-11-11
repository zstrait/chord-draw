import { createDefaultChord, formatCapo, resetChordStyling } from "./chord.ts";
import type { ChartChord, Chord, ChordChart } from "./types.ts";

export function getChartLabels(chart: ChordChart, editingTuning = false) {
    const labels: { kind: "tuning" | "notes" | "capo"; text: string }[] = [];
    if (
        chart.settings.showTuningLabel &&
        (chart.settings.tuning.label || editingTuning)
    )
        labels.push({ kind: "tuning", text: chart.settings.tuning.label });
    if (chart.settings.showStringNoteLabels)
        labels.push({
            kind: "notes",
            text: chart.settings.tuning.notes.join(" "),
        });
    if (chart.settings.ShowCapoLabel)
        labels.push({
            kind: "capo",
            text: formatCapo(chart.settings.capoFret),
        });
    return labels;
}

export function getChartDisplayChord(
    chord: Chord,
    settings: ChordChart["settings"],
): Chord {
    return {
        ...chord,
        tuning: settings.tuning,
        fretCount: settings.fretCount,
        showFretLabel: settings.showFretLabel,
        showStringNoteLabels: false,
        showTuningLabel: false,
        ShowCapoLabel: false,
    };
}

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
