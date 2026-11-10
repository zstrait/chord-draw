<script lang="ts">
    import { CircleMinus, CirclePlus } from "@lucide/svelte";
    import type { ChordChart } from "#lib/types.ts";

    let { chart, onChartChange }: {
        chart: ChordChart;
        onChartChange: (changes: Partial<ChordChart>) => void;
    } = $props();

    const dimensions = ["columns", "rows"] as const;
</script>

<div class="m-auto grid shrink-0 grid-cols-[auto_auto] gap-6 p-4">
    <div class="grid gap-6" style:grid-template-columns={`repeat(${chart.columns}, 12rem)`}>
        {#each chart.slots as row, rowIndex}
            {#each row as slot, columnIndex}
                <button
                    type="button"
                    disabled
                    class="flex aspect-[11/14] w-48 items-center justify-center rounded-xl border border-primary/30 bg-transparent text-primary/60"
                    aria-label={`Empty chord slot, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                >
                    <CirclePlus size={48} strokeWidth={1.5} aria-hidden="true" />
                </button>
            {/each}
        {/each}
    </div>
    {#each dimensions as dimension}
        {@const vertical = dimension === "columns"}
        <div
            class="flex items-center gap-3 text-primary/60"
            class:flex-col={vertical}
            class:col-start-1={!vertical}
            class:row-start-2={!vertical}
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
                    class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 enabled:hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-30"
                    aria-label={`${change === 1 ? "Add" : "Remove"} ${vertical ? "column" : "row"}`}
                    disabled={change === -1 && chart[dimension] <= 1}
                    onclick={() => onChartChange({ [dimension]: chart[dimension] + change })}
                >
                    {#if change === 1}
                        <CirclePlus size={40} strokeWidth={1.5} aria-hidden="true" />
                    {:else}
                        <CircleMinus size={40} strokeWidth={1.5} aria-hidden="true" />
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
