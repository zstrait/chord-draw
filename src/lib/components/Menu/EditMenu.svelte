<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import { tuningPresets } from "#lib/tunings.ts";
    import { validatePositiveInput } from "#lib/utils.ts";
    import Dropdown from "../Dropdown.svelte";

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
                <input
                    type="number"
                    class="input capo-fret"
                    placeholder="None"
                    value={chord.capoFret}
                    oninput={(event) => {
                        if (event.currentTarget.value === "") {
                            onChordChange(
                                { capoFret: null },
                                event.currentTarget,
                            );
                            return;
                        }

                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange(
                                {
                                    capoFret: Number(event.currentTarget.value),
                                },
                                event.currentTarget,
                            );
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
                    class="input"
                    value={chord.startFret}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange(
                                { startFret: value },
                                event.currentTarget,
                            );
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(chord.startFret);
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Frets</legend>
                <input
                    type="number"
                    class="input"
                    min="1"
                    value={chord.fretCount}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange(
                                {
                                    fretCount: Number(event.currentTarget.value),
                                },
                                event.currentTarget,
                            );
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(chord.fretCount);
                    }}
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
