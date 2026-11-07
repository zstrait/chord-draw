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
    const startY = start.y + start.height / 2;
    const endY = end.y + end.height / 2;
    const vertical = Math.abs(endY - startY) > Math.abs(endX - startX);
    const width = vertical ? start.diameter : start.width / 2;
    const height = vertical ? start.height / 2 : start.diameter;

    return {
        x: Math.min(startX, endX) - width / 2,
        y: Math.min(startY, endY) - height / 2,
        width: Math.abs(endX - startX) + width,
        height: Math.abs(endY - startY) + height,
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
        x < Math.min(...notes.map((target) => target.x)) ||
        x > Math.max(...notes.map((target) => target.x + target.width)) ||
        y < Math.min(...notes.map((target) => target.y)) ||
        y > Math.max(...notes.map((target) => target.y + target.height))
    ) {
        return;
    }

    const row = notes.filter((target) => target.fret === fret);
    const vertical = row.length > 1 && Math.abs(row[1].y - row[0].y) > Math.abs(row[1].x - row[0].x);

    return row.find(
        (target) => vertical
            ? y >= target.y && y <= target.y + target.height
            : x >= target.x && x <= target.x + target.width,
    );
}
