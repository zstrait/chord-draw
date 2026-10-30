<script lang="ts">
    import { onMount } from "svelte";
    import type { Chord } from "#lib/types.ts";
    import { SVGuitarChord, type Finger } from "svguitar";

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

    $effect(() => {
        const drawing = new SVGuitarChord(container);

        drawing
            .chord({
                fingers: stringsToFingers(chord.strings),
                barres: [],
                title: chord.title,
            })
            .draw();

        return () => drawing.remove();
    });
</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <div class="border border-green-500 w-110 h-140 rounded-xl flex flex-col justify-end pb-12">
        <div bind:this={container}></div>
    </div>
</div>
