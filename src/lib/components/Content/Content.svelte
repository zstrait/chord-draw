<script lang="ts">
    import ContentHeader from "./ContentHeader.svelte";
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import ChordResult from "./ChordResult.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { chord, onChordChange }: Props = $props();
</script>

<div class="flex flex-col flex-1 border border-green-500 p-2">
    <ContentHeader />
    <div class="flex justify-center px-12 py-4 gap-24">
        <ChordEditor heading="Editor" {chord} {onChordChange}/>
        <ChordResult heading="Result" {chord} />
    </div>
</div>
