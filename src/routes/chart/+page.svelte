<script lang="ts">
    import Header from "#lib/components/Header.svelte";
    import ChartMenu from "#lib/components/Menu/ChartMenu.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";
    import { createDefaultChart } from "#lib/chart.ts";
    import type { ChordChart } from "#lib/types.ts";
    import { blurInputOnEnter } from "#lib/utils.ts";

    let chart = $state(createDefaultChart());
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);

    function updateChart(changes: Partial<ChordChart>) {
        const rows = changes.rows ?? chart.rows;
        const columns = changes.columns ?? chart.columns;

        if (rows !== chart.rows || columns !== chart.columns) {
            const removesChords = chart.slots.some((row, rowIndex) =>
                row.some((slot, columnIndex) =>
                    slot !== null && (rowIndex >= rows || columnIndex >= columns),
                ),
            );
            if (removesChords && !window.confirm("Reducing the grid will remove chords outside the new size. Continue?")) return;

            changes = {
                ...changes,
                slots: Array.from({ length: rows }, (_, row) =>
                    Array.from({ length: columns }, (_, column) => chart.slots[row]?.[column] ?? null),
                ),
            };
        }

        Object.assign(chart, changes);
    }
</script>

<svelte:window onkeydown={blurInputOnEnter} />

<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    <ChartMenu
        {chart}
        onChartChange={updateChart}
        isOpen={menuOpen}
        onToggle={() => { menuOpen = !menuOpen; }}
    />
    <div
        class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
        style:padding-bottom={toolbarOpen ? "0.5rem" : "0rem"}
    >
        <Header />
        <div class="divider mt-0 mb-3.5 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5" aria-hidden="true"></div>
        <main aria-label="Chord chart workspace" class="min-h-0 min-w-0 flex-1 overflow-auto p-2"></main>
        <Toolbar
            subject="chart"
            isOpen={toolbarOpen}
            onToggle={() => { toolbarOpen = !toolbarOpen; }}
            onClear={() => { chart = createDefaultChart(); }}
        />
    </div>
</div>
