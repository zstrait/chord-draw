<script lang="ts">
    import { CircleMinus, CirclePlus, X, ZoomIn } from "@lucide/svelte";
    import type { Chord, ChordChart, ChartSlotPosition } from "#lib/types.ts";
    import { applyChartStyling, getChartDisplayChord } from "#lib/chart.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import ChartHeading from "./ChartHeading.svelte";
    import ChartMoveOverlay from "./ChartMoveOverlay.svelte";

    let {
        chart,
        selectedChordId,
        chordPreview,
        chartPreview,
        isMoveMode,
        onChartChange,
        onAddChord,
        onSelectChord,
        onRemoveChord,
        onFocusChord,
        onChordChange,
        onMoveChord,
    }: {
        chart: ChordChart;
        selectedChordId: string | null;
        chordPreview: Partial<Chord> | null;
        chartPreview: Partial<Chord> | null;
        isMoveMode: boolean;
        onChartChange: (
            changes: Partial<ChordChart>,
            input?: HTMLInputElement,
        ) => void;
        onAddChord: (row: number, column: number) => void;
        onSelectChord: (id: string | null) => void;
        onRemoveChord: (id: string) => void;
        onFocusChord: (id: string) => void;
        onChordChange: (
            id: string,
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onMoveChord: (from: ChartSlotPosition, to: ChartSlotPosition) => void;
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
    let moveTarget = $state<ChartSlotPosition | null>(null);
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
        data-chart-slots
        class="col-start-1 grid items-start justify-items-center gap-6"
        style:grid-row={gridRow}
        style:grid-template-columns={`repeat(${chart.columns}, max-content)`}
    >
        {#each chart.slots as row, rowIndex}
            {#each row as slot, columnIndex (slot?.id ?? columnIndex)}
                {@const dropTarget =
                    moveTarget?.row === rowIndex &&
                    moveTarget.column === columnIndex}
                {#if slot}
                    {@const selected =
                        !isMoveMode && slot.id === selectedChordId}
                    {@const selectedChord =
                        selected && chordPreview
                            ? { ...slot.chord, ...chordPreview }
                            : slot.chord}
                    {@const chord = chartPreview?.styling
                        ? applyChartStyling(
                              selectedChord,
                              chartPreview.styling,
                              chartPreview.strings !== undefined ||
                                  chartPreview.barres !== undefined,
                          )
                        : selectedChord}
                    {@const displayChord = getChartDisplayChord(
                        chord,
                        chart.settings,
                    )}
                    <div
                        role="group"
                        aria-label={`Chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                        aria-current={selected ? "true" : undefined}
                        tabindex="-1"
                        data-chart-chord={slot.id}
                        data-chart-slot
                        data-chart-row={rowIndex}
                        data-chart-column={columnIndex}
                        class="group/chart-chord relative rounded-xl ring-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        style:width={chord.rotation % 180
                            ? "calc(13rem * 14 / 11)"
                            : "13rem"}
                        class:ring-2={selected}
                        class:drop-target={dropTarget}
                        onpointerdown={() => {
                            if (!isMoveMode) onSelectChord(slot.id);
                        }}
                    >
                        <ChordEditor
                            chord={displayChord}
                            rotation={chord.rotation}
                            active={selected}
                            onChordChange={(changes, input) =>
                                onChordChange(slot.id, changes, input)}
                        />
                        {#if isMoveMode}
                            <ChartMoveOverlay
                                chord={displayChord}
                                position={{
                                    row: rowIndex,
                                    column: columnIndex,
                                }}
                                onTargetChange={(target) => {
                                    moveTarget = target;
                                }}
                                onMove={(target) =>
                                    onMoveChord(
                                        { row: rowIndex, column: columnIndex },
                                        target,
                                    )}
                            />
                        {:else if !selected}
                            <button
                                type="button"
                                class="absolute inset-0 cursor-pointer rounded-xl border-0 bg-transparent p-0 hover:bg-primary/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                aria-label={`Edit chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                onclick={() => onSelectChord(slot.id)}
                            ></button>
                        {/if}
                        {#if !isMoveMode}
                            <div
                                class="pointer-events-none absolute -inset-x-2.5 -top-2.5 z-20 flex justify-between group-hover/chart-chord:visible group-focus-within/chart-chord:visible"
                                class:invisible={!selected}
                            >
                                <button
                                    type="button"
                                    class="chart-action-remove pointer-events-auto flex size-6 cursor-pointer items-center justify-center rounded-full border border-[#C74646] bg-[#E05454] p-0 text-[#783b3b] shadow-sm transition-transform duration-[250ms] hover:scale-110 hover:bg-[#C74646] focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E05454] motion-reduce:transition-none"
                                    aria-label={`Remove chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                    onpointerdown={(event) =>
                                        event.stopPropagation()}
                                    onclick={() => onRemoveChord(slot.id)}
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    class="chart-action-focus pointer-events-auto flex size-6 cursor-pointer items-center justify-center rounded-full border border-[#2E439A] bg-[#3852B4] p-0 text-[#f1f3f6] shadow-sm transition-transform duration-[250ms] hover:scale-110 hover:bg-[#2E439A] focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3852B4] motion-reduce:transition-none"
                                    aria-label={`Focus chord, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                    onpointerdown={(event) =>
                                        event.stopPropagation()}
                                    onclick={() => onFocusChord(slot.id)}
                                >
                                    <ZoomIn size={16} aria-hidden="true" />
                                </button>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <button
                        type="button"
                        data-chart-slot
                        data-chart-row={rowIndex}
                        data-chart-column={columnIndex}
                        class="flex cursor-pointer items-center justify-center rounded-xl border-2 border-primary/30 bg-transparent text-primary enabled:hover:bg-primary/5 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        style:width={chart.settings.rotation % 180
                            ? "calc(13rem * 14 / 11)"
                            : "13rem"}
                        style:aspect-ratio={chart.settings.rotation % 180
                            ? "14 / 11"
                            : "11 / 14"}
                        aria-label={`${isMoveMode ? "Empty slot" : "Add chord"}, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                        class:drop-target={dropTarget}
                        disabled={isMoveMode}
                        onclick={() => onAddChord(rowIndex, columnIndex)}
                    >
                        <CirclePlus
                            class="opacity-60"
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
            class="flex items-center gap-3 text-primary"
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
                            class="opacity-60"
                            size={44}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    {:else}
                        <CircleMinus
                            class="opacity-60"
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
    :global([data-theme="dark"]) .chart-action-remove {
        border-color: #a24242;
        background-color: #c95555;
        color: #fff1f1;
    }

    :global([data-theme="dark"]) .chart-action-remove:hover {
        background-color: #b64747;
    }

    :global([data-theme="dark"]) .chart-action-remove:focus-visible {
        outline-color: #c95555;
    }

    :global([data-theme="dark"]) .chart-action-focus {
        border-color: #355a89;
        background-color: #4d79b4;
        color: #f1f3f6;
    }

    :global([data-theme="dark"]) .chart-action-focus:hover {
        background-color: #3f6c9f;
    }

    :global([data-theme="dark"]) .chart-action-focus:focus-visible {
        outline-color: #4d79b4;
    }

    [data-chart-chord]:is([aria-current="true"], :hover) {
        outline: 3px solid var(--color-primary);
        outline-offset: 2px;
    }

    [data-chart-chord][aria-current="true"] {
        --tw-ring-color: transparent;
    }

    [data-chart-chord]:not([aria-current="true"]):hover {
        outline-width: 2px;
        outline-color: color-mix(
            in srgb,
            var(--color-primary) 35%,
            transparent
        );
    }

    :global([data-theme="dark"]) [data-chart-chord][aria-current="true"] {
        outline-color: #6096dc;
    }

    :global([data-theme="dark"])
        [data-chart-chord]:not([aria-current="true"]):hover {
        outline-color: color-mix(in srgb, #6096dc 35%, transparent);
    }

    [data-chart-slot].drop-target,
    [data-chart-slot].drop-target:hover {
        outline: 3px solid var(--color-primary);
        outline-offset: 3px;
    }

    :global([data-theme="dark"]) [data-chart-slot].drop-target,
    :global([data-theme="dark"]) [data-chart-slot].drop-target:hover {
        outline-color: #6096dc;
    }
</style>
