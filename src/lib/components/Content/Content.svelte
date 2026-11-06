<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import { Maximize2, Minimize2 } from "@lucide/svelte";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
        onSvgChange: (svg: string) => void;
        onMaximize: () => void;
        isMaximized: boolean;
    };

    let { chord, onChordChange, onSvgChange, onMaximize, isMaximized }: Props = $props();
</script>

<div class="flex min-h-0 flex-col flex-1 overflow-auto borde p-2">
    <div class="flex justify-end">
        <div
            class="tooltip tooltip-left"
            data-tip={isMaximized ? "Minimize" : "Maximize"}
        >
            <button
                type="button"
                class="btn btn-square"
                aria-label={isMaximized ? "Restore panels" : "Maximize workspace"}
                onclick={onMaximize}
            >
                {#if isMaximized}
                    <Minimize2 color="currentColor" />
                {:else}
                    <Maximize2 color="currentColor" />
                {/if}
            </button>
        </div>
    </div>
    <div class="flex justify-center px-12 py-4 gap-24">
        <ChordEditor {chord} {onChordChange} {onSvgChange} />
    </div>
</div>
