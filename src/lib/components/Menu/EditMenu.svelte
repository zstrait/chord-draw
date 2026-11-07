<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import { tuningPresets } from "#lib/tunings.ts";
    import Dropdown from "../Dropdown.svelte";
    import NumberInput from "../NumberInput.svelte";

    const tuningOptions = [
        ...tuningPresets.map((preset) => ({
            label: preset.label,
            value: preset.label,
        })),
        { label: "Custom...", value: "custom", disabled: true },
    ];

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
    };

    let { chord, onChordChange }: Props = $props();
</script>

<div class="flex flex-col">
    <div class="flex flex-col">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Title</legend>
            <input
                type="text"
                class="input"
                value={chord.title}
                oninput={(event) =>
                    onChordChange(
                        { title: event.currentTarget.value },
                        event.currentTarget,
                    )}
            />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Tuning</legend>
            <Dropdown
                label="Tuning"
                value={chord.tuning.label}
                options={tuningOptions}
                onchange={(value) => {
                    const tuning = tuningPresets.find(
                        (preset) => preset.label === value,
                    );

                    if (tuning) {
                        onChordChange({ tuning });
                    }
                }}
            />
        </fieldset>

        <div class="grid grid-cols-2 gap-3 pt-2">
            <label class="menu-check flex min-h-8 cursor-pointer items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm rounded-md shadow-none"
                    checked={chord.showTuningLabel}
                    oninput={(event) => {
                        onChordChange({
                            showTuningLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Tuning Label
            </label>

            <label class="menu-check flex min-h-8 cursor-pointer items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm rounded-md shadow-none"
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

        <div class="grid grid-cols-3 gap-3 pt-2">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Capo Fret</legend>
                <NumberInput
                    label="Capo Fret"
                    placeholder="None"
                    value={chord.capoFret}
                    max={24}
                    onchange={(value, input) => onChordChange({ capoFret: value }, input)}
                    onclear={(input) => onChordChange({ capoFret: null }, input)}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Starting Fret</legend>
                <NumberInput
                    label="Starting Fret"
                    value={chord.startFret}
                    max={24}
                    onchange={(value, input) => onChordChange({ startFret: value }, input)}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Frets</legend>
                <NumberInput
                    label="Frets"
                    value={chord.fretCount}
                    max={12}
                    onchange={(value, input) => onChordChange({ fretCount: value }, input)}
                />
            </fieldset>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
            <label class="menu-check flex min-h-8 cursor-pointer items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm rounded-md shadow-none"
                    checked={chord.ShowCapoLabel}
                    oninput={(event) => {
                        onChordChange({
                            ShowCapoLabel: event.currentTarget.checked,
                        });
                    }}
                />
                Capo Label
            </label>

            <label class="menu-check flex min-h-8 cursor-pointer items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm rounded-md shadow-none"
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
