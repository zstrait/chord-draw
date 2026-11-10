import { createDefaultChord } from "./chord.ts";
import type { ChartChord, ChordChart } from "./types.ts";

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
