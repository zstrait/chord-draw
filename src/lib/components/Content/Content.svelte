<script lang="ts">
    import ContentHeader from "./ContentHeader.svelte";
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import ChordResult from "./ChordDrawing.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { chord, onChordChange }: Props = $props();

    let isDoubleView = $state(true);
    let isEditorView = $state(true);

    function onViewChange(value: boolean) {
        isDoubleView = value;
    }
    function onSingleViewChange(value: boolean) {
        isEditorView = value;
    }
</script>

<div class="flex flex-col flex-1 border border-green-500 p-2">
    <ContentHeader
        {isDoubleView}
        {onViewChange}
        {isEditorView}
        {onSingleViewChange}
    />
    <div class="flex justify-center px-12 py-4 gap-24">
        {#if isDoubleView}
            <ChordEditor heading="Editor" {chord} {onChordChange} />
            <ChordResult heading="Result" {chord} />
        {:else}
            {#if isEditorView}
                <ChordEditor heading="Editor" {chord} {onChordChange} />
            {:else}
                <ChordResult heading="Result" {chord} />
            {/if}
        {/if}
    </div>
</div>
