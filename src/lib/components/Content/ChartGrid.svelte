<script lang="ts">
    import { CircleMinus, CirclePlus } from "@lucide/svelte";
    import type { Chord, ChordChart } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import ChartHeading from "./ChartHeading.svelte";

    let {
        chart,
        selectedChordId,
        chordPreview,
        onChartChange,
        onAddChord,
        onSelectChord,
        onChordChange,
    }: {
        chart: ChordChart;
        selectedChordId: string | null;
        chordPreview: Partial<Chord> | null;
        onChartChange: (changes: Partial<ChordChart>) => void;
        onAddChord: (row: number, column: number) => void;
        onSelectChord: (id: string | null) => void;
        onChordChange: (
            id: string,
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
    } = $props();

    const dimensions = ["columns", "rows"] as const;
    let headingEditing = $state(false);
    let hasHeading = $derived(
        !!chart.title ||
            (chart.settings.showTuningLabel && !!chart.settings.tuning.label) ||
            chart.settings.showStringNoteLabels ||
            chart.settings.ShowCapoLabel ||
            headingEditing,
    );
    let gridRow = $derived(hasHeading ? 2 : 1);
</script>

<div class="grid shrink-0 grid-cols-[auto_auto] gap-6 p-4">
    {#if hasHeading}
        <div class="col-start-1 min-w-0 [contain:inline-size]">
            <ChartHeading
                {chart}
                {onChartChange}
                onEditStart={() => onSelectChord(null)}
                onEditingChange={(value) => {
                    headingEditing = value;
                }}
            />
        </div>
    {/if}
    <div
        class="col-start-1 grid gap-6"
        style:grid-row={gridRow}
        style:grid-template-columns={`repeat(${chart.columns}, 13rem)`}
    >
        {#each chart.slots as row, rowIndex}
            {#each row as slot, columnIndex (slot?.id ?? columnIndex)}
                {#if slot}
                    {@const selected = slot.id === selectedChordId}
                    {@const chord =
                        selected && chordPreview
                            ? { ...slot.chord, ...chordPreview }
                            : slot.chord}
                    <div
                        role="group"
                        aria-label={`Chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                        aria-current={selected ? "true" : undefined}
                        tabindex="-1"
                        data-chart-chord={slot.id}
                        class="relative w-52 rounded-xl ring-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        class:ring-2={selected}
                        onpointerdown={() => onSelectChord(slot.id)}
                    >
                        <ChordEditor
                            chord={{
                                ...chord,
                                tuning: chart.settings.tuning,
                                fretCount: chart.settings.fretCount,
                                showFretLabel: chart.settings.showFretLabel,
                                showStringNoteLabels: false,
                                showTuningLabel: false,
                                ShowCapoLabel: false,
                            }}
                            rotation={chord.rotation}
                            active={selected}
                            onChordChange={(changes, input) =>
                                onChordChange(slot.id, changes, input)}
                        />
                        {#if !selected}
                            <button
                                type="button"
                                class="absolute inset-0 cursor-pointer rounded-xl border-0 bg-transparent p-0 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                aria-label={`Edit chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                onclick={() => onSelectChord(slot.id)}
                            ></button>
                        {/if}
                    </div>
                {:else}
                    <button
                        type="button"
                        class="flex aspect-[11/14] w-52 cursor-pointer items-center justify-center rounded-xl border-2 border-primary/30 bg-transparent text-primary/60 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        aria-label={`Add chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                        onclick={() => onAddChord(rowIndex, columnIndex)}
                    >
                        <CirclePlus
                            size={52}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </button>
                {/if}
            {/each}
        {/each}
    </div>
    {#each dimensions as dimension}
        {@const vertical = dimension === "columns"}
        <div
            class="flex items-center gap-3 text-primary/60"
            class:flex-col={vertical}
            class:col-start-1={!vertical}
            class:col-start-2={vertical}
            style:grid-row={vertical ? gridRow : gridRow + 1}
        >
            <span
                class="flex-1 border-dotted border-primary/40"
                class:border-l-2={vertical}
                class:border-t-2={!vertical}
                aria-hidden="true"
            ></span>
            {#each vertical ? [1, -1] : [-1, 1] as change}
                <button
                    type="button"
                    class="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 enabled:hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-30"
                    aria-label={`${change === 1 ? "Add" : "Remove"} ${vertical ? "column" : "row"}`}
                    disabled={change === -1 && chart[dimension] <= 1}
                    onclick={() =>
                        onChartChange({
                            [dimension]: chart[dimension] + change,
                        })}
                >
                    {#if change === 1}
                        <CirclePlus
                            size={44}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    {:else}
                        <CircleMinus
                            size={44}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    {/if}
                </button>
            {/each}
            <span
                class="flex-1 border-dotted border-primary/40"
                class:border-l-2={vertical}
                class:border-t-2={!vertical}
                aria-hidden="true"
            ></span>
        </div>
    {/each}
</div>

<style>
    [data-chart-chord][aria-current="true"] {
        --tw-ring-color: transparent;
        outline: 3px solid var(--color-primary);
        outline-offset: 2px;
    }

    :global([data-theme="dark"]) [data-chart-chord][aria-current="true"] {
        outline-color: #6096dc;
    }
</style>
