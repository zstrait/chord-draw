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

    function changeFret(index: number, value: string) {
        const fret = value === "" ? null : Number(value);

        onChordChange({
            strings: chord.strings.map((note, noteIndex) => {
                if (noteIndex === index) {
                    return { ...note, fret };
                }

                return note;
            }),
        });
    }

    function changeMarkerText(index: number, value: string) {
        const markerText = value === "" ? null : value;

        onChordChange({
            strings: chord.strings.map((note, noteIndex) => {
                if (noteIndex === index) {
                    return { ...note, markerText };
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
            <ChordOverlay {hoverTargets} {showTargets} />
        </div>
    </div>
    <div class="flex gap-4 justify-between p-4">
        {#each chord.strings as stringNote, index}
            <div class="flex flex-col w-14">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Fret</legend>
                    <input
                        type="number"
                        class="input"
                        value={stringNote.fret}
                        oninput={(event) => {
                            changeFret(index, event.currentTarget.value);
                        }}
                    />
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Text</legend>
                    <input
                        type="text"
                        class="input"
                        value={stringNote.markerText}
                        oninput={(event) => {
                            changeMarkerText(
                                index,
                                event.currentTarget.value,
                            );
                        }}
                    />
                </fieldset>
            </div>
        {/each}
    </div>
</div>

<style>
    input[type="number"] {
        appearance: textfield;
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
