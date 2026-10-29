<script lang="ts">
    import type { Chord } from "#lib/types.ts";

    type Props = {
        heading: string;
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { heading, chord, onChordChange }: Props = $props();

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
    <div class="border border-green-500 w-110 h-140 rounded-xl">
        <div class="flex gap-4 justify-between p-4 pt-40">
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
