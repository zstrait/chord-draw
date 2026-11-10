import { createDefaultChord } from "./chord.ts";
import type { ChordChart } from "./types.ts";

export function createDefaultChart(): ChordChart {
    const { title, strings, barres, ...settings } = createDefaultChord();
    const rows = 2;
    const columns = 3;

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
