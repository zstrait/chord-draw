<script lang="ts">
    import { PanelLeftClose } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { tuningPresets } from "#lib/tunings.ts";

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
        <div class="flex text-xs justify-between pt-2">
            <label class="label">
                <input
                    type="checkbox"
                    class="checkbox"
                    value={chord.showStringNoteLabels}
                    oninput={(event) => {
                        onChordChange({
                            showStringNoteLabels: event.currentTarget.checked,
                        });
                    }}
                />
                String Note Labels
            </label>
            <label class="label">
                <input
                    type="checkbox"
                    class="checkbox"
                    value={chord.showTuningLabel}
                    oninput={(event) => {
                        onChordChange({
                            showTuningLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Tuning Label
            </label>
        </div>
        <div class="flex justify-between gap-4 pt-2">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Starting Fret</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.startFret}
                    oninput={(event) => {
                        onChordChange({
                            startFret: Number(event.currentTarget.value),
                        });
                    }}
                />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Number of Frets</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.fretCount}
                    oninput={(event) => {
                        onChordChange({
                            fretCount: Number(event.currentTarget.value),
                        });
                    }}
                />
            </fieldset>
        </div>
        <label class="label pt-2 text-xs">
            <input
                type="checkbox"
                class="checkbox"
                value={chord.capoIndicator}
                oninput={(event) => {
                    onChordChange({
                        capoIndicator: event.currentTarget.checked,
                    });
                }}
            />
            Capo Indicator
        </label>
    </div>
</div>
