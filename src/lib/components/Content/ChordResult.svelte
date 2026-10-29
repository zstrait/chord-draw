<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    let { heading, chord }: { heading: string; chord: Chord } = $props();
</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <div class="border border-green-500 w-110 h-140 rounded-xl">
        <pre
            class="h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-sm">{JSON.stringify(
                chord,
                null,
                2,
            )}</pre>
    </div>
</div>
