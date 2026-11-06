<script lang="ts">
    import type { Chord, HoverTarget } from "#lib/types.ts";
    import {
        SVGuitarChord,
        ChordStyle,
        type Finger,
        type Barre as SvgBarre,
    } from "svguitar";

    let {
        chord,
        onTargetsChange,
        onSvgChange,
    }: {
        chord: Chord;
        onTargetsChange: (targets: HoverTarget[]) => void;
        onSvgChange: (svg: string) => void;
    } = $props();

    let container: HTMLDivElement;
    const stringIndicatorSize = 0.6;

    function measureTargets(
        stringCount: number,
        fretCount: number,
        circleSize: number,
    ) {
        const svg = container.querySelector("svg");
        const transform = svg?.getScreenCTM();

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

        for (let stringIndex = 0; stringIndex < stringCount; stringIndex++) {
            const indicatorCenter = new DOMPoint(
                strings[stringIndex].x1.baseVal.value,
                nutTop - indicatorRowHeight / 2,
            ).matrixTransform(transform);
            const indicatorWidth = stringSpacing * transform.a;
            const indicatorHeight = indicatorRowHeight * transform.d;

            targets.push({
                kind: "string",
                stringIndex,
                fret: 0,
                x: indicatorCenter.x - wrapper.left - indicatorWidth / 2,
                y: indicatorCenter.y - wrapper.top - indicatorHeight / 2,
                width: indicatorWidth,
                height: indicatorHeight,
                diameter: indicatorSize * transform.a,
            });

            for (let fret = 1; fret <= fretCount; fret++) {
                const center = new DOMPoint(
                    strings[stringIndex].x1.baseVal.value,
                    top + (fret - 0.5) * fretSpacing,
                ).matrixTransform(transform);

                const width = stringSpacing * transform.a;
                const height = fretSpacing * transform.d;

                targets.push({
                    kind: "note",
                    stringIndex,
                    fret,
                    x: center.x - wrapper.left - width / 2,
                    y: center.y - wrapper.top - height / 2,
                    width,
                    height,
                    diameter: width * (circleSize / 20),
                });
            }
        }

        onTargetsChange(targets);
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

        return text.join("\n");
    }

    $effect(() => {
        const drawing = new SVGuitarChord(container);
        const text: string = formatBottomText(
            chord.tuning.label,
            chord.showTuningLabel,
            chord.capoFret,
            chord.ShowCapoLabel,
        );
        const isCircleWhite: boolean = chord.styling.circleColor === "#FFFFFF";

        drawing
            .configure({
                fixedDiagramPosition: true,
                emptyStringIndicatorSize: stringIndicatorSize,
                title: chord.title,
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
        let frame = 0;

        function queueMeasurement() {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                onSvgChange(drawing.toSvg());

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

<div bind:this={container}></div>
