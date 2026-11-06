<script lang="ts">
    import type { Chord, HoverTarget } from "#lib/types.ts";
    import ChordDrawing from "./ChordDrawing.svelte";
    import ChordOverlay from "./ChordOverlay.svelte";

    type Props = {
        heading: string;
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { heading, chord, onChordChange }: Props = $props();

    let hoverTargets = $state<HoverTarget[]>([]);
    let showTargets = $state(false);

    function handleTargetsChange(targets: HoverTarget[]) {
        hoverTargets = targets;
    }

    function handleNoteClick(stringIndex: number, fret: number) {
        onChordChange({
            strings: chord.strings.map((note, index) => {
                if (index === stringIndex) {
                    return {
                        ...note,
                        fret: note.fret === fret ? null : fret,
                    };
                }

                return note;
            }),
        });
    }

    function handleStringClick(stringIndex: number) {
        onChordChange({
            strings: chord.strings.map((note, index) => {
                if (index === stringIndex) {
                    return {
                        ...note,
                        fret: note.fret === 0 ? -1 : note.fret === -1 ? null : 0,
                    };
                }

                return note;
            }),
        });
    }

</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <label class="flex items-center gap-2 px-4 text-sm">
        <input
            type="checkbox"
            class="checkbox checkbox-xs"
            bind:checked={showTargets}
        />
        Show hover targets (draft)
    </label>
    {#if chord.styling.style === "handdrawn"}
        <p class="px-4 text-sm">
            Switch to Normal style to try the hover draft.
        </p>
    {/if}
    <div
        class="border border-green-500 w-110 h-140 rounded-xl flex flex-col justify-end pb-12"
    >
        <div class="relative">
            <ChordDrawing {chord} onTargetsChange={handleTargetsChange} />
            <ChordOverlay
                {hoverTargets}
                {showTargets}
                onNoteClick={handleNoteClick}
                onStringClick={handleStringClick}
            />
        </div>
    </div>
</div>
