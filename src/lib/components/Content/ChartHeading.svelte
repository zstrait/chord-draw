<script lang="ts">
    import type { ChordChart } from "#lib/types.ts";
    import { formatCapo } from "#lib/chord.ts";

    let { chart }: { chart: ChordChart } = $props();
</script>

<header
    class="flex min-w-0 flex-col items-center gap-2 text-center text-base-content"
>
    {#if chart.title}
        <h1 class="max-w-full break-words text-2xl font-semibold">
            {chart.title}
        </h1>
    {/if}
    {#if chart.settings.showTuningLabel || chart.settings.showStringNoteLabels || chart.settings.ShowCapoLabel}
        <div
            class="flex max-w-full flex-wrap justify-center gap-x-4 gap-y-1 text-sm"
        >
            {#if chart.settings.showTuningLabel}
                <span>{chart.settings.tuning.label}</span>
            {/if}
            {#if chart.settings.showStringNoteLabels}
                <span>({chart.settings.tuning.notes.join(" ")})</span>
            {/if}
            {#if chart.settings.ShowCapoLabel}
                <span>{formatCapo(chart.settings.capoFret)}</span>
            {/if}
        </div>
    {/if}
</header>
