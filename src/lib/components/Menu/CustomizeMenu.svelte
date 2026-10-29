<script lang="ts">
    import { RotateCcw } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";
    import { resetChordStyling } from "#lib/chord.ts";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
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
</script>

<div>
    <div class="flex justify-between items-center">
        <span class="text-xl font-bold">Customize</span>
        <button
            class="btn btn-square w-8 h-8"
            onclick={() => onChordChange(resetChordStyling(chord))}
        >
            <RotateCcw color="#0a0a0a" />
        </button>
    </div>
    <div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Style</legend>
            <select
                class="select"
                value={chord.styling.style}
                onchange={(event) => {
                    onChordChange({
                        styling: {
                            ...chord.styling,
                            style: event.currentTarget.value,
                        },
                    });
                }}
            >
                <option value="normal">Normal</option>
                <option value="handdrawn">Handdrawn</option>
            </select>
        </fieldset>
        <div class="flex justify-between gap-4">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Line Thickness</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.styling.lineThickness}
                    onchange={(event) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                lineThickness: Number(
                                    event.currentTarget.value,
                                ),
                            },
                        });
                    }}
                />
            </fieldset>
            <fieldset class="fieldset w-55">
                <legend class="fieldset-legend">Line Color</legend>
                <select
                    class="select"
                    value={chord.styling.lineColor}
                    onchange={(event) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                lineColor: event.currentTarget.value,
                            },
                        });
                    }}
                >
                    {#each colorPresets as color}
                        <option value={color.hex}>{color.name}</option>
                    {/each}
                    <option disabled>Custom...</option>
                </select>
            </fieldset>
        </div>
        <div class="flex justify-between gap-4">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Circle Size</legend>
                <input
                    type="number"
                    class="input"
                    value={chord.styling.circleSize}
                    onchange={(event) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                circleSize: Number(event.currentTarget.value),
                            },
                        });
                    }}
                />
            </fieldset>
            <fieldset class="fieldset w-55">
                <legend class="fieldset-legend">Circle Color</legend>
                <select
                    class="select"
                    value={chord.styling.circleColor}
                    onchange={(event) => {
                        onChordChange({
                            styling: {
                                ...chord.styling,
                                circleColor: event.currentTarget.value,
                            },
                        });
                    }}
                >
                    {#each colorPresets as color}
                        <option value={color.hex}>{color.name}</option>
                    {/each}
                    <option disabled>Custom...</option>
                </select>
            </fieldset>
        </div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Background Color</legend>
            <select
                class="select"
                value={chord.styling.backgroundColor}
                onchange={(event) => {
                    onChordChange({
                        styling: {
                            ...chord.styling,
                            backgroundColor: event.currentTarget.value,
                        },
                    });
                }}
            >
                <option value={"transparent"}>Transparent</option>
                {#each colorPresets as color}
                    <option value={color.hex}>{color.name}</option>
                {/each}
                <option disabled>Custom...</option>
            </select>
        </fieldset>
    </div>
    <div class="flex justify-between gap-4">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Title Font Size</legend>
            <input
                type="number"
                class="input"
                value={chord.styling.titleFontSize}
                onchange={(event) => {
                    onChordChange({
                        styling: {
                            ...chord.styling,
                            titleFontSize: Number(event.currentTarget.value),
                        },
                    });
                }}
            />
        </fieldset>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Finger Font Size</legend>
            <input
                type="number"
                class="input"
                value={chord.styling.fingerFontSize}
                onchange={(event) => {
                    onChordChange({
                        styling: {
                            ...chord.styling,
                            fingerFontSize: Number(event.currentTarget.value),
                        },
                    });
                }}
            />
        </fieldset>
    </div>
</div>
