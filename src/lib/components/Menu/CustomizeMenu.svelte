<script lang="ts">
    import { RotateCcw } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { resetChordStyling } from "#lib/chord.ts";
    import Dropdown from "../Dropdown.svelte";
    import ColorPicker from "../ColorPicker.svelte";
    import NumberInput from "../NumberInput.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onChordPreview: (changes: Partial<Chord> | null) => void;
    };

    type ColorField = "chordColor" | "lineColor" | "circleColor" | "backgroundColor";

    let { chord, onChordChange, onChordPreview }: Props = $props();
    let colorFields = $state<Partial<Record<ColorField, HTMLFieldSetElement>>>({});
    let picker = $state<{ field: ColorField; anchor: HTMLElement } | null>(null);
    let customColors = $state<Partial<Record<ColorField, string>>>({});
    let hasMarkerColors = $derived([...chord.strings, ...chord.barres].some((marker) => marker.color !== undefined));

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
                reselect: hasMarkerColors && (field === "circleColor" || field === "chordColor"),
            })),
            {
                label: "Custom...",
                selectedLabel: "Custom",
                value: "custom",
                color: customColors[field] ?? (
                    getColorValue(chord.styling[field]) === "custom" ? chord.styling[field] : undefined
                ),
                reselect: true,
            },
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

    function colorChanges(field: ColorField, value: string): Partial<Chord> {
        const styling = { ...chord.styling, [field]: value };
        if (field === "chordColor") {
            styling.lineColor = value;
            styling.circleColor = value;
        }
        const changes: Partial<Chord> = { styling };
        if (field === "circleColor" || field === "chordColor") {
            changes.strings = chord.strings.map((note) => ({ ...note, color: undefined }));
            changes.barres = chord.barres.map((barre) => ({ ...barre, color: undefined }));
        }
        return changes;
    }

    function changeColor(field: ColorField, value: string) {
        if (value === "custom") {
            const anchor = colorFields[field];
            if (anchor) picker = { field, anchor };
            return;
        }

        onChordChange(colorChanges(field, value));
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
                class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Reset customization"
                onclick={() => onChordChange(resetChordStyling(chord))}
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
                <NumberInput
                    label="Line Thickness"
                    value={chord.styling.lineThickness}
                    max={10}
                    onchange={(value, input) => onChordChange({
                        styling: { ...chord.styling, lineThickness: value },
                    }, input)}
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
                <NumberInput
                    label="Circle Size"
                    value={chord.styling.circleSize}
                    max={40}
                    onchange={(value, input) => onChordChange({
                        styling: { ...chord.styling, circleSize: value },
                    }, input)}
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
            <NumberInput
                label="Title Font Size"
                value={chord.styling.titleFontSize}
                max={72}
                onchange={(value, input) => onChordChange({
                    styling: { ...chord.styling, titleFontSize: value },
                }, input)}
            />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Finger Font Size</legend>
            <NumberInput
                label="Finger Font Size"
                value={chord.styling.fingerFontSize}
                max={48}
                onchange={(value, input) => onChordChange({
                    styling: { ...chord.styling, fingerFontSize: value },
                }, input)}
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
            onPreview={(value) => onChordPreview(
                value !== null && picker ? colorChanges(picker.field, value) : null,
            )}
            onClose={() => { picker = null; }}
        />
    {/key}
{/if}

<style>
    .reset-tooltip[data-tip]::before {
        font-size: 0.8125rem;
    }
</style>
