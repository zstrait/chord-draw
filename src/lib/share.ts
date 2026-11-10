import type { Chord } from "./types.ts";
import { createDefaultChord } from "./chord.ts";
import { normalizeTuningNote, selectTuning, tuningPresets } from "./tunings.ts";

const numbers = {
    start: ["startFret", Number.MAX_SAFE_INTEGER],
    frets: ["fretCount", 100],
    capo: ["capoFret", Number.MAX_SAFE_INTEGER],
} as const;

const flags = {
    nl: "showStringNoteLabels",
    tl: "showTuningLabel",
    fl: "showFretLabel",
    cl: "ShowCapoLabel",
} as const;

const sizes = {
    lineWidth: ["lineThickness", 1000],
    circleSize: ["circleSize", 1000],
    titleFontSize: ["titleFontSize", 1000],
    fingerFontSize: ["fingerFontSize", 1000],
} as const;

const colors = {
    color: "chordColor",
    lineColor: "lineColor",
    circleColor: "circleColor",
    background: "backgroundColor",
} as const;

const customDefault = selectTuning(createDefaultChord(), "custom").tuning!;

function integer(value: unknown, min: number, max: number): value is number {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= min &&
        value <= max
    );
}

function json(value: string | null): unknown {
    try {
        return value === null ? null : JSON.parse(value);
    } catch {
        return null;
    }
}

function color(value: string | null): string | null {
    const hex = value?.replace(/^#/, "");
    if (!hex || !/^(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex))
        return null;
    return `#${hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex}`.toUpperCase();
}

export function hasChordParams(params: URLSearchParams): boolean {
    return [
        "title",
        "strings",
        "labels",
        "noteColors",
        "barre",
        "barreColors",
        "tuning",
        "tuningNotes",
        "tuningName",
        "style",
        "rotation",
        ...Object.keys(numbers),
        ...Object.keys(flags),
        ...Object.keys(sizes),
        ...Object.keys(colors),
    ].some((name) => params.has(name));
}

export function encodeChord(chord: Chord): URLSearchParams {
    const defaults = createDefaultChord();
    const params = new URLSearchParams();

    function set(name: string, value: unknown, fallback: unknown) {
        if (value !== fallback) params.set(name, String(value));
    }

    set("title", chord.title, defaults.title);
    set(
        "strings",
        chord.strings
            .map(({ fret }) => (fret === null ? "_" : fret === -1 ? "x" : fret))
            .join("-"),
        "_-_-_-_-_-_",
    );
    const labels = chord.strings.map(({ markerText }) => markerText);
    const sparseLabels = JSON.stringify(
        Object.fromEntries(
            labels.flatMap((label, index) =>
                label === null ? [] : [[index, label]],
            ),
        ),
    );
    if (sparseLabels !== "{}") {
        const denseLabels = JSON.stringify(labels);
        params.set(
            "labels",
            sparseLabels.length < denseLabels.length
                ? sparseLabels
                : denseLabels,
        );
    }
    const noteColors = Object.fromEntries(
        chord.strings.flatMap((note, index) =>
            note.color && note.fret !== null && note.fret > 0
                ? [[index, note.color.replace(/^#/, "")]]
                : [],
        ),
    );
    if (Object.keys(noteColors).length)
        params.set("noteColors", JSON.stringify(noteColors));
    for (const { fret, startString, endString, markerText } of chord.barres) {
        params.append(
            "barre",
            `${fret}-${startString}-${endString}${markerText === null ? "" : `-${markerText}`}`,
        );
    }
    const barreColors = Object.fromEntries(
        chord.barres.flatMap((barre, index) =>
            barre.color ? [[index, barre.color.replace(/^#/, "")]] : [],
        ),
    );
    if (Object.keys(barreColors).length)
        params.set("barreColors", JSON.stringify(barreColors));
    set(
        "tuning",
        chord.tuning.custom ? "custom" : chord.tuning.label,
        defaults.tuning.label,
    );
    if (chord.tuning.custom) {
        set(
            "tuningNotes",
            chord.tuning.notes.join(","),
            customDefault.notes.join(","),
        );
        set("tuningName", chord.tuning.label, customDefault.label);
    }
    for (const [name, [field]] of Object.entries(numbers))
        set(name, chord[field], defaults[field]);
    for (const [name, field] of Object.entries(flags))
        set(name, chord[field], defaults[field]);
    set("style", chord.styling.style, defaults.styling.style);
    for (const [name, [field]] of Object.entries(sizes))
        set(name, chord.styling[field], defaults.styling[field]);
    for (const [name, field] of Object.entries(colors)) {
        const fallback =
            field === "lineColor" || field === "circleColor"
                ? chord.styling.chordColor
                : defaults.styling[field];
        set(
            name,
            chord.styling[field].replace(/^#/, ""),
            fallback.replace(/^#/, ""),
        );
    }
    set("rotation", chord.rotation, defaults.rotation);
    return params;
}

export function decodeChord(params: URLSearchParams): Chord {
    const chord = createDefaultChord();
    chord.title = params.get("title") ?? chord.title;

    const strings = params.get("strings")?.split("-");
    if (strings?.length === 6) {
        strings.forEach((value, index) => {
            if (value === "x") chord.strings[index].fret = -1;
            else if (
                /^\d+$/.test(value) &&
                integer(Number(value), 0, Number.MAX_SAFE_INTEGER)
            ) {
                chord.strings[index].fret = Number(value);
            }
        });
    }

    const labels = json(params.get("labels"));
    if (
        labels !== null &&
        typeof labels === "object" &&
        (!Array.isArray(labels) || labels.length === 6)
    ) {
        for (const [index, value] of Object.entries(labels)) {
            if (
                /^[0-5]$/.test(index) &&
                (typeof value === "string" || value === null)
            ) {
                chord.strings[Number(index)].markerText = value;
            }
        }
    }

    const noteColors = json(params.get("noteColors"));
    if (
        noteColors !== null &&
        typeof noteColors === "object" &&
        !Array.isArray(noteColors)
    ) {
        for (const [index, value] of Object.entries(noteColors)) {
            if (!/^[0-5]$/.test(index) || typeof value !== "string") continue;
            const parsed = color(value);
            const note = chord.strings[Number(index)];
            if (parsed && note.fret !== null && note.fret > 0)
                note.color = parsed;
        }
    }

    for (const value of params.getAll("barre")) {
        const match = /^(\d+)-([0-5])-([0-5])(?:-(.*))?$/s.exec(value);
        if (!match) continue;
        const [, fret, startString, endString, markerText] = match;
        if (
            !integer(Number(fret), 1, Number.MAX_SAFE_INTEGER) ||
            Number(startString) >= Number(endString)
        )
            continue;
        chord.barres.push({
            fret: Number(fret),
            startString: Number(startString),
            endString: Number(endString),
            markerText: markerText ?? null,
        });
    }

    const barreColors = json(params.get("barreColors"));
    if (
        barreColors !== null &&
        typeof barreColors === "object" &&
        !Array.isArray(barreColors)
    ) {
        for (const [index, value] of Object.entries(barreColors)) {
            if (!/^(0|[1-9]\d*)$/.test(index) || typeof value !== "string")
                continue;
            const parsed = color(value);
            const barre = chord.barres[Number(index)];
            if (parsed && barre) barre.color = parsed;
        }
    }

    const tuning = params.get("tuning");
    if (tuning === "custom") {
        chord.tuning = { ...customDefault, notes: [...customDefault.notes] };
        chord.tuning.label = params.get("tuningName") ?? chord.tuning.label;
        const notes = params.get("tuningNotes")?.split(",");
        if (notes?.length === 6) {
            chord.tuning.notes = notes.map(
                (note) => normalizeTuningNote(note) ?? "_",
            );
        }
    } else {
        const preset = tuningPresets.find((preset) => preset.label === tuning);
        if (preset) chord.tuning = { ...preset, notes: [...preset.notes] };
    }

    for (const [name, [field, max]] of Object.entries(numbers)) {
        const value = Number(params.get(name));
        if (integer(value, 1, max)) chord[field] = value;
    }
    for (const [name, field] of Object.entries(flags)) {
        const value = params.get(name);
        if (value === "true" || value === "false")
            chord[field] = value === "true";
    }
    const style = params.get("style");
    if (style === "normal" || style === "handdrawn")
        chord.styling.style = style;
    for (const [name, [field, max]] of Object.entries(sizes)) {
        const value = Number(params.get(name));
        if (integer(value, 1, max)) chord.styling[field] = value;
    }
    for (const [name, field] of Object.entries(colors)) {
        const value = params.get(name);
        const parsed =
            name === "background" && value === "transparent"
                ? value
                : color(value);
        if (parsed !== null) {
            chord.styling[field] = parsed;
            if (field === "chordColor") {
                chord.styling.lineColor = parsed;
                chord.styling.circleColor = parsed;
            }
        }
    }
    const rotation = Number(params.get("rotation"));
    if ([0, 90, 180, 270].includes(rotation)) chord.rotation = rotation;
    return chord;
}
