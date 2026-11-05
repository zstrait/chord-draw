<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import {
        SVGuitarChord,
        ChordStyle,
        type Finger,
        type Barre as SvgBarre,
    } from "svguitar";

    let { heading, chord }: { heading: string; chord: Chord } = $props();

    let container: HTMLDivElement;

    function stringsToFingers(strings: Chord["strings"]): Finger[] {
        const fingers: Finger[] = [];
        strings.forEach((stringNote) => {
            if (stringNote.fret != null) {
                fingers.push([
                    //svguitar strings go from low=6 to high=0, while mine are low=0 to high=6
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
                title: chord.title,
            })
            .draw();

        return () => drawing.remove();
    });
</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <div
        class="border border-green-500 w-110 h-140 rounded-xl flex flex-col justify-end pb-12"
    >
        <div bind:this={container}></div>
    </div>
</div>
