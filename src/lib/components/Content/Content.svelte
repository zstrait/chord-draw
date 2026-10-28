<script lang="ts">
    import ChordView from "./ChordView.svelte";
    import ContentHeader from "./ContentHeader.svelte";
    import type { Chord } from "#lib/types.ts";

    let { chord }: { chord: Chord } = $props();
</script>

<div class="flex flex-col flex-1 border border-green-500 p-2">
    <ContentHeader />
    <div class="flex justify-center px-12 py-4 gap-24">
        <ChordView heading="Editor" {chord} />
        <ChordView heading="Result" {chord} />
    </div>
</div>
