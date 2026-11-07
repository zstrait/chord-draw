<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import { Maximize2, Minimize2, RotateCwSquare } from "@lucide/svelte";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
        onSvgChange: (svg: string) => void;
        onMaximize: () => void;
        isMaximized: boolean;
    };

    let { chord, onChordChange, onSvgChange, onMaximize, isMaximized }: Props = $props();
    let rotation = $state(0);
</script>

<div class="relative flex min-h-0 min-w-0 flex-col flex-1 overflow-auto p-2">
    <div class="absolute right-2 top-2 z-10 flex flex-col gap-2">
        <div
            class="tooltip tooltip-left"
            data-tip={isMaximized ? "Minimize" : "Maximize"}
        >
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={isMaximized ? "Restore panels" : "Maximize workspace"}
                onclick={onMaximize}
            >
                {#if isMaximized}
                    <Minimize2 size={24} color="currentColor" />
                {:else}
                    <Maximize2 size={24} color="currentColor" />
                {/if}
            </button>
        </div>
        <div class="tooltip tooltip-left" data-tip="Rotate clockwise">
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Rotate drawing 90 degrees clockwise"
                onclick={() => { rotation = (rotation + 90) % 360; }}
            >
                <RotateCwSquare size={24} color="currentColor" />
            </button>
        </div>
    </div>
    <div class="flex flex-1 items-center justify-center px-4 py-4">
        <ChordEditor {chord} {rotation} {onChordChange} {onSvgChange} />
    </div>
</div>
