<script lang="ts">
    import type { Chord, HoverTarget, TitleTarget, TuningTarget } from "#lib/types.ts";
    import {
        SVGuitarChord,
        ChordStyle,
        type Finger,
        type Barre as SvgBarre,
    } from "svguitar";

    let {
        chord,
        rotation,
        editingTitle,
        onTargetsChange,
        onTitleTargetChange,
        onTuningTargetsChange,
        onSvgChange,
    }: {
        chord: Chord;
        rotation: number;
        editingTitle: boolean;
        onTargetsChange: (targets: HoverTarget[]) => void;
        onTitleTargetChange: (target: TitleTarget | null) => void;
        onTuningTargetsChange: (targets: TuningTarget[]) => void;
        onSvgChange: (svg: string) => void;
    } = $props();

    let container: HTMLDivElement;
    const stringIndicatorSize = 0.6;

    function measureTitle(fontSize: number, angle: number) {
        const svg = container.querySelector("svg");
        const group = svg?.querySelector<SVGGElement>("[data-chord-rotation]");
        const transform = (group ?? svg)?.getScreenCTM();
        const svgTransform = svg?.getScreenCTM();
        if (!svg || !transform || !svgTransform) {
            onTitleTargetChange(null);
            return;
        }

        const title = svg.querySelector<SVGTextElement>("text.title");
        const style = title ? getComputedStyle(title) : null;
        const size = style ? parseFloat(style.fontSize) : fontSize;
        const viewBox = svg.viewBox.baseVal;
        const sourceCenter = new DOMPoint(
            viewBox.x + viewBox.width / 2,
            viewBox.y + viewBox.height / 2,
        ).matrixTransform(svgTransform).matrixTransform(transform.inverse());
        const center = new DOMPoint(
            sourceCenter.x,
            5 + size * 0.6,
        ).matrixTransform(transform);
        const scale = Math.hypot(transform.a, transform.b);
        const bounds = container.getBoundingClientRect();

        onTitleTargetChange({
            x: center.x - bounds.left,
            y: center.y - bounds.top,
            width: (angle % 180 ? viewBox.height : viewBox.width) * scale * 0.9,
            height: Math.max(28, size * 1.2 * scale + 8),
            fontSize: Math.max(12, size * scale),
            fontFamily: style?.fontFamily ?? "Arial, sans-serif",
        });
    }

    function measureTuningTargets(stringCount: number, angle: number, showLabel: boolean) {
        const svg = container.querySelector("svg");
        const transform = (svg?.querySelector<SVGGElement>("[data-chord-rotation]") ?? svg)?.getScreenCTM();
        if (!svg || !transform) {
            onTuningTargetsChange([]);
            return;
        }

        const bounds = container.getBoundingClientRect();
        const scale = Math.hypot(transform.a, transform.b);
        const viewBox = svg.viewBox.baseVal;
        const width = angle % 180 ? viewBox.height : viewBox.width;
        const targets: TuningTarget[] = [];

        function addTarget(text: SVGGraphicsElement, stringIndex: number | null) {
            const box = text.getBBox();
            const style = getComputedStyle(text);
            const size = parseFloat(style.fontSize);
            const center = new DOMPoint(
                box.x + box.width / 2,
                box.y + size * 0.6,
            ).matrixTransform(transform!);

            targets.push({
                stringIndex,
                x: center.x - bounds.left,
                y: center.y - bounds.top,
                width: stringIndex === null
                    ? width * scale * 0.9
                    : Math.max(28, 400 * 0.76 / (stringCount - 1) * scale * 0.95),
                height: Math.max(28, size * 1.2 * scale + 8),
                fontSize: Math.max(12, size * scale),
                fontFamily: style.fontFamily,
            });
        }

        for (let index = 0; index < stringCount; index++) {
            const note = svg.querySelector<SVGTextElement>(`text.tuning-${index}`);
            if (note) addTarget(note, index);
        }
        const caption = svg.querySelector<SVGTextElement>("text.watermark");
        const label = caption?.querySelector<SVGTSpanElement>("tspan") ?? caption;
        if (showLabel && label) addTarget(label, null);
        onTuningTargetsChange(targets);
    }

    function measureTargets(
        stringCount: number,
        fretCount: number,
        circleSize: number,
    ) {
        const svg = container.querySelector("svg");
        const transform = svg?.querySelector("line")?.getScreenCTM();

        if (!svg || !transform) {
            onTargetsChange([]);
            return;
        }

        const strings = Array.from(svg.querySelectorAll("line"))
            .filter(
                (line) =>
                    line.x1.baseVal.value === line.x2.baseVal.value &&
                    line.y2.baseVal.value > line.y1.baseVal.value,
            )
            .sort((a, b) => a.x1.baseVal.value - b.x1.baseVal.value);

        if (strings.length !== stringCount || stringCount < 2) {
            onTargetsChange([]);
            return;
        }

        const firstString = strings[0];
        const left = firstString.x1.baseVal.value;
        const right = strings[stringCount - 1].x1.baseVal.value;
        const top = firstString.y1.baseVal.value;

        const frets = Array.from(svg.querySelectorAll("line")).filter(
            (line) =>
                line.y1.baseVal.value === line.y2.baseVal.value &&
                Math.abs(line.x1.baseVal.value - left) < 0.01 &&
                Math.abs(line.x2.baseVal.value - right) < 0.01 &&
                line.y1.baseVal.value > top,
        );

        if (!frets.length) {
            onTargetsChange([]);
            return;
        }

        const nut = Array.from(svg.querySelectorAll("line")).find(
            (line) =>
                line.y1.baseVal.value === line.y2.baseVal.value &&
                line.y1.baseVal.value < top &&
                line.x1.baseVal.value <= left &&
                line.x2.baseVal.value >= right,
        );

        if (!nut) {
            onTargetsChange([]);
            return;
        }

        const bottom = Math.max(...frets.map((line) => line.y1.baseVal.value));
        const stringSpacing = (right - left) / (stringCount - 1);
        const fretSpacing = (bottom - top) / fretCount;
        const indicatorSize = stringSpacing * stringIndicatorSize;
        const indicatorRowHeight = indicatorSize + 2 * (indicatorSize / 3);
        const nutTop = 2 * nut.y1.baseVal.value - top;
        const wrapper = container.getBoundingClientRect();
        const targets: HoverTarget[] = [];
        const scale = Math.hypot(transform.a, transform.b);

        function targetBounds(x: number, y: number, width: number, height: number) {
            const start = new DOMPoint(x - width / 2, y - height / 2).matrixTransform(transform!);
            const end = new DOMPoint(x + width / 2, y + height / 2).matrixTransform(transform!);
            return {
                x: Math.min(start.x, end.x) - wrapper.left,
                y: Math.min(start.y, end.y) - wrapper.top,
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
            };
        }

        for (let stringIndex = 0; stringIndex < stringCount; stringIndex++) {
            targets.push({
                kind: "string",
                stringIndex,
                fret: 0,
                ...targetBounds(
                    strings[stringIndex].x1.baseVal.value,
                    nutTop - indicatorRowHeight / 2,
                    stringSpacing,
                    indicatorRowHeight,
                ),
                diameter: indicatorSize * scale,
            });

            for (let fret = 1; fret <= fretCount; fret++) {
                targets.push({
                    kind: "note",
                    stringIndex,
                    fret,
                    ...targetBounds(
                        strings[stringIndex].x1.baseVal.value,
                        top + (fret - 0.5) * fretSpacing,
                        stringSpacing,
                        fretSpacing,
                    ),
                    diameter: stringSpacing * scale * (circleSize / 20),
                });
            }
        }

        onTargetsChange(targets);
    }

    function rotateDrawing(angle: number) {
        const svg = container.querySelector("svg");
        if (!angle || !svg || svg.querySelector("[data-chord-rotation]")) return;

        const { x, y, width, height } = svg.viewBox.baseVal;
        const transforms: Record<number, string> = {
            90: `matrix(0 1 -1 0 ${height + y} ${-x})`,
            180: `matrix(-1 0 0 -1 ${width + x} ${height + y})`,
            270: `matrix(0 -1 1 0 ${-y} ${width + x})`,
        };
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("data-chord-rotation", String(angle));
        group.setAttribute("transform", transforms[angle]);
        for (const child of Array.from(svg.children)) {
            if (child.getAttribute("width") === "100%") child.setAttribute("width", String(width));
            if (child.getAttribute("height") === "100%") child.setAttribute("height", String(height));
            group.append(child);
        }
        svg.append(group);
        svg.setAttribute("viewBox", angle % 180 ? `0 0 ${height} ${width}` : `0 0 ${width} ${height}`);
    }

    function stringsToFingers(strings: Chord["strings"]): Finger[] {
        const fingers: Finger[] = [];
        strings.forEach((stringNote) => {
            if (stringNote.fret != null) {
                fingers.push([
                    // svguitar strings go from low=6 to high=0, while mine are low=0 to high=6
                    strings.length - strings.indexOf(stringNote),
                    stringNote.fret === -1 ? "x" : stringNote.fret,
                    stringNote.markerText ?? "",
                ]);
            }
        });

        return fingers;
    }

    function barresToSvg(
        barres: Chord["barres"],
        stringCount: number,
    ): SvgBarre[] {
        const result: SvgBarre[] = [];

        for (const barre of barres) {
            if (barre.fret === null || barre.fret < 1) {
                continue;
            }

            result.push({
                fromString: stringCount - barre.startString,
                toString: stringCount - barre.endString,
                fret: barre.fret,
                text: barre.markerText ?? undefined,
            });
        }

        return result;
    }

    function formatBottomText(
        tuning: string,
        showTuningLabel: boolean,
        capo: number | null,
        showCapoLabel: boolean,
    ): string {
        const text: string[] = [];
        if (showTuningLabel) {
            text.push(tuning);
        }
        if (showCapoLabel) {
            if (capo == null) {
                text.push("(No Capo)");
            } else {
                text.push(`(Capo at ${capo})`);
            }
        }

        return text.join(" ");
    }

    $effect(() => {
        const drawing = new SVGuitarChord(container);
        const text: string = formatBottomText(
            chord.tuning.label || "\u00a0",
            chord.showTuningLabel,
            chord.capoFret,
            chord.ShowCapoLabel,
        );
        const isCircleWhite: boolean = chord.styling.circleColor === "#FFFFFF";

        drawing
            .configure({
                fixedDiagramPosition: true,
                sidePadding: 0.12,
                emptyStringIndicatorSize: stringIndicatorSize,
                title: chord.title || undefined,
                // Edit Menu
                tuning: chord.showStringNoteLabels ? chord.tuning.notes : [],
                frets: chord.fretCount,
                // tuning label
                watermark: text,
                watermarkFontSize: 20,
                // watermarkFontFamily: "Arial, sans-serif",
                position: chord.startFret,
                noPosition: !chord.showFretLabel,

                // Customize Menu
                style:
                    chord.styling.style === "handdrawn"
                        ? ChordStyle.handdrawn
                        : ChordStyle.normal,
                color: chord.styling.chordColor,
                strokeWidth: chord.styling.lineThickness,
                fretColor: chord.styling.lineColor,
                fingerSize: chord.styling.circleSize / 20,
                fingerColor: chord.styling.circleColor,
                fingerTextColor: isCircleWhite ? "#000000" : "#FFFFFF",
                backgroundColor: chord.styling.backgroundColor,
                titleFontSize: chord.styling.titleFontSize,
                fingerTextSize: chord.styling.fingerFontSize,
            })
            .chord({
                fingers: stringsToFingers(chord.strings),
                barres: barresToSvg(chord.barres, chord.stringCount),
            })
            .draw();

        const stringCount = chord.stringCount;
        const fretCount = chord.fretCount;
        const circleSize = chord.styling.circleSize;
        const isNormal = chord.styling.style !== "handdrawn";
        const angle = rotation;
        const titleFontSize = chord.styling.titleFontSize;
        const customTuning = chord.tuning.custom;
        const showTuningLabel = chord.showTuningLabel;
        let frame = 0;

        function queueMeasurement() {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                rotateDrawing(angle);
                onSvgChange(drawing.toSvg());
                measureTitle(titleFontSize, angle);
                if (customTuning) {
                    measureTuningTargets(stringCount, angle, showTuningLabel);
                } else {
                    onTuningTargetsChange([]);
                }

                if (isNormal) {
                    measureTargets(stringCount, fretCount, circleSize);
                } else {
                    onTargetsChange([]);
                }
            });
        }

        const resizeObserver = new ResizeObserver(queueMeasurement);
        resizeObserver.observe(container);

        const mutationObserver = new MutationObserver(queueMeasurement);
        mutationObserver.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        onTargetsChange([]);
        queueMeasurement();

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            drawing.remove();
        };
    });
</script>

<div class="drawing" class:editing-title={editingTitle} bind:this={container}></div>

<style>
    .drawing {
        width: 100%;
        height: 100%;
    }

    .drawing :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }

    .editing-title :global(text.title) {
        visibility: hidden;
    }
</style>
