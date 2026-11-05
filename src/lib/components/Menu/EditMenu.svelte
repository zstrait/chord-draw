<script lang="ts">
    import { PanelLeftClose } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { tuningPresets } from "#lib/tunings.ts";
    import { validatePositiveInput } from "#lib/utils.ts";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { chord, onChordChange }: Props = $props();
</script>

<div class="flex flex-col">
    <div class="flex justify-between items-center">
        <span class="text-xl font-bold">Edit Menu</span>
        <button class="btn btn-square w-8 h-8">
            <PanelLeftClose color="#0a0a0a" />
        </button>
    </div>
    <div class="flex flex-col">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Title</legend>
            <input
                type="text"
                class="input"
                value={chord.title}
                oninput={(event) =>
                    onChordChange({ title: event.currentTarget.value })}
            />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Tuning</legend>
            <select
                class="select"
                value={chord.tuning.label}
                onchange={(event) => {
                    const tuning = tuningPresets.find(
                        (preset) => preset.label === event.currentTarget.value,
                    );

                    if (tuning) {
                        onChordChange({ tuning });
                    }
                }}
            >
                <option>Standard</option>
                <option>E♭ Standard</option>
                <option>D Standard</option>
                <option>Drop D</option>
                <option>Drop C#</option>
                <option disabled>Custom...</option>
            </select>
        </fieldset>

        <div class="flex text-xs p-2 pb-0 gap-8">
            <label class="label w-28">
                <input
                    type="checkbox"
                    class="checkbox"
                    checked={chord.showTuningLabel}
                    oninput={(event) => {
                        onChordChange({
                            showTuningLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Tuning Label
            </label>

            <label class="label">
                <input
                    type="checkbox"
                    class="checkbox"
                    checked={chord.showStringNoteLabels}
                    oninput={(event) => {
                        onChordChange({
                            showStringNoteLabels: event.currentTarget.checked,
                        });
                    }}
                />
                String Note Labels
            </label>
        </div>

        <div class="flex justify-between gap-4 pt-2">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Capo Fret</legend>
                <input
                    type="number"
                    class="input capo-fret"
                    placeholder="None"
                    value={chord.capoFret}
                    oninput={(event) => {
                        if (event.currentTarget.value === "") {
                            onChordChange({ capoFret: null });
                            return;
                        }

                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange({
                                capoFret: Number(event.currentTarget.value),
                            });
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(chord.capoFret);
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Starting Fret</legend>
                <input
                    type="number"
                    class="input w-21"
                    value={chord.startFret}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange({ startFret: value });
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(chord.startFret);
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Number of Frets</legend>
                <input
                    type="number"
                    class="input w-26"
                    min="1"
                    value={chord.fretCount}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange({
                                fretCount: Number(event.currentTarget.value),
                            });
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(chord.fretCount);
                    }}
                />
            </fieldset>
        </div>

        <div class="flex text-xs p-2 pb-0 gap-8">
            <label class="label w-28">
                <input
                    type="checkbox"
                    class="checkbox"
                    checked={chord.ShowCapoLabel}
                    oninput={(event) => {
                        onChordChange({
                            ShowCapoLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Capo Label
            </label>

            <label class="label">
                <input
                    type="checkbox"
                    class="checkbox"
                    checked={chord.showFretLabel}
                    oninput={(event) => {
                        onChordChange({
                            showFretLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Starting Fret Label
            </label>
        </div>
    </div>
</div>

<style>
    .capo-fret:placeholder-shown {
        appearance: textfield;
    }

    .capo-fret:placeholder-shown::-webkit-inner-spin-button,
    .capo-fret:placeholder-shown::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
