<script lang="ts">
    import { RotateCcw } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { resetChordStyling } from "#lib/chord.ts";
    import { validatePositiveInput } from "#lib/utils.ts";
    import Dropdown from "../Dropdown.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
    };

    let { chord, onChordChange }: Props = $props();

    type Color = {
        name: string;
        hex: string;
    };

    const colorPresets: Color[] = [
        {
            name: "Black",
            hex: "#000000",
        },
        {
            name: "White",
            hex: "#FFFFFF",
        },
        {
            name: "Blue",
            hex: "#5A9ED6",
        },
        {
            name: "Red",
            hex: "#CD3E44",
        },
        {
            name: "Green",
            hex: "#8AAE6E",
        },
    ];

    const colorOptions = [
        ...colorPresets.map((color) => ({
            label: color.name,
            value: color.hex,
            color: color.hex,
        })),
        { label: "Custom...", value: "custom", disabled: true },
    ];

    const backgroundOptions = [
        { label: "Transparent", value: "transparent", color: "transparent" },
        ...colorOptions,
    ];
</script>

<div>
    <div class="flex justify-between items-center">
        <span class="text-base font-semibold text-primary">Customize</span>
        <div class="reset-tooltip tooltip tooltip-left" data-tip="Reset styling">
            <button
                type="button"
                class="btn btn-ghost btn-circle btn-sm text-primary shadow-none"
                aria-label="Reset customization"
                onclick={() => onChordChange(resetChordStyling())}
            >
                <RotateCcw size={22} color="currentColor" />
            </button>
        </div>
    </div>
    <div>
        <div class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Style</legend>
                <Dropdown
                    label="Style"
                    value={chord.styling.style}
                    options={[
                        { label: "Normal", value: "normal" },
                        { label: "Handdrawn", value: "handdrawn" },
                    ]}
                    onchange={(value) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                style: value,
                            },
                        });
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Chord Color</legend>
                <Dropdown
                    label="Chord color"
                    value={chord.styling.chordColor}
                    options={colorOptions}
                    onchange={(value) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                chordColor: value,
                                lineColor: value,
                                circleColor: value,
                            },
                        });
                    }}
                />
            </fieldset>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Line Thickness</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.styling.lineThickness}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange(
                                {
                                    styling: {
                                        ...chord.styling,
                                        lineThickness: Number(
                                            event.currentTarget.value,
                                        ),
                                    },
                                },
                                event.currentTarget,
                            );
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(
                            chord.styling.lineThickness,
                        );
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Line Color</legend>
                <Dropdown
                    label="Line color"
                    value={chord.styling.lineColor}
                    options={colorOptions}
                    onchange={(value) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                lineColor: value,
                            },
                        });
                    }}
                />
            </fieldset>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Circle Size</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.styling.circleSize}
                    oninput={(event) => {
                        const value = validatePositiveInput(event);

                        if (value !== null) {
                            onChordChange(
                                {
                                    styling: {
                                        ...chord.styling,
                                        circleSize: Number(
                                            event.currentTarget.value,
                                        ),
                                    },
                                },
                                event.currentTarget,
                            );
                        }
                    }}
                    onblur={(event) => {
                        event.currentTarget.value = String(
                            chord.styling.circleSize,
                        );
                    }}
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Circle Color</legend>
                <Dropdown
                    label="Circle color"
                    value={chord.styling.circleColor}
                    options={colorOptions}
                    onchange={(value) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                circleColor: value,
                            },
                        });
                    }}
                />
            </fieldset>
        </div>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Background Color</legend>
            <Dropdown
                label="Background color"
                value={chord.styling.backgroundColor}
                options={backgroundOptions}
                onchange={(value) => {
                    onChordChange({
                        styling: {
                            ...chord.styling,
                            backgroundColor: value,
                        },
                    });
                }}
            />
        </fieldset>
    </div>

    <div class="grid grid-cols-2 gap-3">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Title Font Size</legend>
            <input
                type="number"
                class="input"
                value={chord.styling.titleFontSize}
                oninput={(event) => {
                    const value = validatePositiveInput(event);

                    if (value !== null) {
                        onChordChange(
                            {
                                styling: {
                                    ...chord.styling,
                                    titleFontSize: Number(
                                        event.currentTarget.value,
                                    ),
                                },
                            },
                            event.currentTarget,
                        );
                    }
                }}
                onblur={(event) => {
                    event.currentTarget.value = String(
                        chord.styling.titleFontSize,
                    );
                }}
            />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Finger Font Size</legend>
            <input
                type="number"
                class="input"
                value={chord.styling.fingerFontSize}
                oninput={(event) => {
                    const value = validatePositiveInput(event);

                    if (value !== null) {
                        onChordChange(
                            {
                                styling: {
                                    ...chord.styling,
                                    fingerFontSize: Number(
                                        event.currentTarget.value,
                                    ),
                                },
                            },
                            event.currentTarget,
                        );
                    }
                }}
                onblur={(event) => {
                    event.currentTarget.value = String(
                        chord.styling.fingerFontSize,
                    );
                }}
            />
        </fieldset>
    </div>
</div>

<style>
    .reset-tooltip[data-tip]::before {
        font-size: 0.8125rem;
    }
</style>
