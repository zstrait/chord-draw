<script lang="ts">
    import type { ChordChart } from "#lib/types.ts";
    import { formatCapo } from "#lib/chord.ts";

    let { chart }: { chart: ChordChart } = $props();
    let labels = $derived(
        [
            chart.settings.showTuningLabel ? chart.settings.tuning.label : "",
            chart.settings.showStringNoteLabels
                ? chart.settings.tuning.notes.join(" ")
                : "",
            chart.settings.ShowCapoLabel
                ? formatCapo(chart.settings.capoFret)
                : "",
        ].filter(Boolean),
    );
</script>

<header
    class="flex min-w-0 flex-col items-center gap-2 text-center text-base-content"
>
    {#if chart.title}
        <h1 class="max-w-full break-words text-2xl font-semibold">
            {chart.title}
        </h1>
    {/if}
    {#if labels.length}
        <p class="max-w-full whitespace-pre-wrap break-words text-sm">
            {#each labels as label, index}
                {#if index > 0}<span
                        class="text-base-content/50"
                        aria-hidden="true">{"  |  "}</span
                    >{/if}{label}
            {/each}
        </p>
    {/if}
</header>
