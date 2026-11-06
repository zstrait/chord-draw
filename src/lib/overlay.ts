import type { BarreDrag, HoverTarget } from "./types";

export function getPreview(targets: HoverTarget[], drag: BarreDrag | null) {
    if (!drag?.hasDragged || drag.startString === drag.endString) {
        return null;
    }

    const start = targets.find(
        (target) =>
            target.kind === "note" &&
            target.fret === drag.fret &&
            target.stringIndex === drag.startString,
    );
    const end = targets.find(
        (target) =>
            target.kind === "note" &&
            target.fret === drag.fret &&
            target.stringIndex === drag.endString,
    );

    if (!start || !end) {
        return null;
    }

    const startX = start.x + start.width / 2;
    const endX = end.x + end.width / 2;

    return {
        x: Math.min(startX, endX) - start.width / 4,
        y: start.y + (start.height - start.diameter) / 2,
        width: Math.abs(endX - startX) + start.width / 2,
        height: start.diameter,
    };
}

export function findTarget(
    targets: HoverTarget[],
    fret: number,
    x: number,
    y: number,
) {
    const notes = targets.filter((target) => target.kind === "note");

    if (
        !notes.length ||
        y < Math.min(...notes.map((target) => target.y)) ||
        y > Math.max(...notes.map((target) => target.y + target.height))
    ) {
        return;
    }

    return notes.find(
        (target) =>
            target.fret === fret &&
            x >= target.x &&
            x <= target.x + target.width,
    );
}
