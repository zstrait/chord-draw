<script lang="ts">
    import type { ChordChart } from "#lib/types.ts";
    import { getChartDisplayChord } from "#lib/chart.ts";
    import { getChartSlotSize, type ChartDrawing } from "#lib/chart-export.ts";
    import ChordDrawing from "./ChordDrawing.svelte";

    let {
        chart,
        onReady,
        onError,
    }: {
        chart: ChordChart;
        onReady: (drawings: Map<string, ChartDrawing>) => void;
        onError: (error: unknown) => void;
    } = $props();
    let container: HTMLDivElement;
    const drawings = new Map<string, ChartDrawing>();
    let slots = $derived(chart.slots.flat().filter((slot) => slot !== null));
    let complete = false;

    function collect(id: string, svg: string) {
        if (complete) return;
        try {
            const source = container.querySelector<SVGSVGElement>(
                `[data-export-chord="${id}"] svg`,
            );
            if (!source) throw new Error("Could not render a chord diagram");
            const { x, y, width, height } = source.viewBox.baseVal;
            drawings.set(id, { svg, viewBox: { x, y, width, height } });
            if (drawings.size === slots.length) {
                complete = true;
                onReady(drawings);
            }
        } catch (error) {
            complete = true;
            onError(error);
        }
    }
</script>

<svelte:boundary onerror={onError}>
    <div bind:this={container}>
        {#each slots as slot (slot.id)}
            {@const size = getChartSlotSize(slot.chord.rotation)}
            <div
                data-export-chord={slot.id}
                class="relative border border-transparent"
                style:width={`${size.width}px`}
                style:height={`${size.height}px`}
            >
                <div class="absolute inset-x-3 top-4 bottom-6.5">
                    <ChordDrawing
                        chord={getChartDisplayChord(slot.chord, chart.settings)}
                        rotation={slot.chord.rotation}
                        editingTitle={false}
                        onTargetsChange={() => {}}
                        onTitleTargetChange={() => {}}
                        onTuningTargetsChange={() => {}}
                        onSvgChange={(svg) => collect(slot.id, svg)}
                    />
                </div>
            </div>
        {/each}
    </div>
</svelte:boundary>
