<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import { Expand } from "@lucide/svelte";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
        onSvgChange: (svg: string) => void;
    };

    let { chord, onChordChange, onSvgChange }: Props = $props();
</script>

<div class="flex min-h-0 flex-col flex-1 overflow-auto borde p-2">
    <div class="flex justify-end">
        <button type="button" class="btn btn-square" aria-label="Fullscreen">
            <Expand color="currentColor" />
        </button>
    </div>
    <div class="flex justify-center px-12 py-4 gap-24">
        <ChordEditor {chord} {onChordChange} {onSvgChange} />
    </div>
</div>
