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

export function isSavedChart(value: unknown): value is ChordChart {
    function object(value: unknown): value is Record<string, unknown> {
        return (
            value !== null && typeof value === "object" && !Array.isArray(value)
        );
    }

    function integer(value: unknown, minimum: number): value is number {
        return (
            typeof value === "number" &&
            Number.isSafeInteger(value) &&
            value >= minimum
        );
    }

    function tuning(value: unknown) {
        return (
            object(value) &&
            typeof value.label === "string" &&
            Array.isArray(value.notes) &&
            value.notes.length === 6 &&
            value.notes.every((note) => typeof note === "string") &&
            (value.custom === undefined || typeof value.custom === "boolean")
        );
    }

    function marker(value: unknown) {
        return (
            object(value) &&
            (value.fret === null || integer(value.fret, -1)) &&
            (value.markerText === null ||
                typeof value.markerText === "string") &&
            (value.color === undefined || typeof value.color === "string")
        );
    }

    const defaultStyling = createDefaultChord().styling;
    function settings(value: unknown) {
        if (!object(value) || !object(value.styling)) return false;
        const styling = value.styling;
        return (
            typeof value.rotation === "number" &&
            [0, 90, 180, 270].includes(value.rotation) &&
            integer(value.startFret, 1) &&
            integer(value.fretCount, 1) &&
            value.stringCount === 6 &&
            (value.capoFret === null || integer(value.capoFret, 1)) &&
            tuning(value.tuning) &&
            (value.customTuning === null || tuning(value.customTuning)) &&
            [
                "showStringNoteLabels",
                "showTuningLabel",
                "showFretLabel",
                "ShowCapoLabel",
            ].every((field) => typeof value[field] === "boolean") &&
            typeof styling.style === "string" &&
            ["normal", "handdrawn"].includes(styling.style) &&
            Object.entries(defaultStyling).every(([field, fallback]) => {
                const entry = styling[field];
                return (
                    typeof entry === typeof fallback &&
                    (typeof entry !== "number" ||
                        (Number.isFinite(entry) && entry > 0))
                );
            })
        );
    }

    function chord(value: unknown) {
        return (
            object(value) &&
            settings(value) &&
            typeof value.title === "string" &&
            Array.isArray(value.strings) &&
            value.strings.length === 6 &&
            value.strings.every(marker) &&
            Array.isArray(value.barres) &&
            value.barres.every(
                (barre) =>
                    object(barre) &&
                    marker(barre) &&
                    integer(barre.fret, 1) &&
                    integer(barre.startString, 0) &&
                    integer(barre.endString, 0) &&
                    barre.startString < barre.endString &&
                    barre.endString < 6,
            )
        );
    }

    if (
        !object(value) ||
        typeof value.title !== "string" ||
        !integer(value.rows, 1) ||
        !integer(value.columns, 1) ||
        !settings(value.settings) ||
        !Array.isArray(value.slots) ||
        value.slots.length !== value.rows
    )
        return false;

    const columns = value.columns;
    const ids = new Set<string>();
    return value.slots.every(
        (row) =>
            Array.isArray(row) &&
            row.length === columns &&
            row.every((slot) => {
                if (slot === null) return true;
                if (
                    !object(slot) ||
                    typeof slot.id !== "string" ||
                    !/^[\w-]+$/.test(slot.id) ||
                    ids.has(slot.id) ||
                    !chord(slot.chord)
                )
                    return false;
                ids.add(slot.id);
                return true;
            }),
    );
}
