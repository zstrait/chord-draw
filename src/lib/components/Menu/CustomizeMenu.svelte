<script lang="ts">
    import { RotateCcw } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { resetChordStyling } from "#lib/chord.ts";
    import { validatePositiveInput } from "#lib/utils.ts";
    import Dropdown from "../Dropdown.svelte";
    import ColorPicker from "../ColorPicker.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
    };

    type ColorField = "chordColor" | "lineColor" | "circleColor" | "backgroundColor";

    let { chord, onChordChange }: Props = $props();
    let colorFields = $state<Partial<Record<ColorField, HTMLFieldSetElement>>>({});
    let picker = $state<{ field: ColorField; anchor: HTMLElement } | null>(null);
    let customColors = $state<Partial<Record<ColorField, string>>>({});

    const colorLabels: Record<ColorField, string> = {
        chordColor: "Chord color",
        lineColor: "Line color",
        circleColor: "Circle color",
        backgroundColor: "Background color",
    };

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

    function getColorOptions(field: ColorField) {
        const options = [
            ...colorPresets.map((color) => ({
                label: color.name,
                value: color.hex,
                color: color.hex,
            })),
            { label: "Custom...", value: "custom", color: customColors[field], reselect: true },
        ];

        return field === "backgroundColor"
            ? [{ label: "Transparent", value: "transparent", color: "transparent" }, ...options]
            : options;
    }

    function getColorValue(value: string) {
        return value === "transparent" || colorPresets.some((color) => color.hex === value)
            ? value
            : "custom";
    }

    function changeColor(field: ColorField, value: string) {
        if (value === "custom") {
            const anchor = colorFields[field];
            if (anchor) picker = { field, anchor };
            return;
        }

        const styling = { ...chord.styling, [field]: value };
        if (field === "chordColor") {
            styling.lineColor = value;
            styling.circleColor = value;
        }
        onChordChange({ styling });
    }

    function applyCustomColor(value: string) {
        if (!picker) return;
        const field = picker.field;
        customColors[field] = value;
        if (field === "chordColor") {
            customColors.lineColor = value;
            customColors.circleColor = value;
        }
        changeColor(field, value);
    }
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

            <fieldset class="fieldset" bind:this={colorFields.chordColor}>
                <legend class="fieldset-legend">Chord Color</legend>
                <Dropdown
                    label="Chord color"
                    value={getColorValue(chord.styling.chordColor)}
                    options={getColorOptions("chordColor")}
                    onchange={(value) => changeColor("chordColor", value)}
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

            <fieldset class="fieldset" bind:this={colorFields.lineColor}>
                <legend class="fieldset-legend">Line Color</legend>
                <Dropdown
                    label="Line color"
                    value={getColorValue(chord.styling.lineColor)}
                    options={getColorOptions("lineColor")}
                    onchange={(value) => changeColor("lineColor", value)}
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

            <fieldset class="fieldset" bind:this={colorFields.circleColor}>
                <legend class="fieldset-legend">Circle Color</legend>
                <Dropdown
                    label="Circle color"
                    value={getColorValue(chord.styling.circleColor)}
                    options={getColorOptions("circleColor")}
                    onchange={(value) => changeColor("circleColor", value)}
                />
            </fieldset>
        </div>

        <fieldset class="fieldset" bind:this={colorFields.backgroundColor}>
            <legend class="fieldset-legend">Background Color</legend>
            <Dropdown
                label="Background color"
                value={getColorValue(chord.styling.backgroundColor)}
                options={getColorOptions("backgroundColor")}
                onchange={(value) => changeColor("backgroundColor", value)}
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

{#if picker}
    {#key picker.field}
        <ColorPicker
            label={colorLabels[picker.field]}
            value={customColors[picker.field] ?? (
                chord.styling[picker.field] === "transparent"
                    ? "#FFFFFF"
                    : chord.styling[picker.field]
            )}
            anchor={picker.anchor}
            onApply={applyCustomColor}
            onClose={() => { picker = null; }}
        />
    {/key}
{/if}

<style>
    .reset-tooltip[data-tip]::before {
        font-size: 0.8125rem;
    }
</style>
