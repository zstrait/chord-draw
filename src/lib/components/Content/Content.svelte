<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import { Maximize2, Minimize2, RotateCwSquare } from "@lucide/svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onSvgChange: (svg: string) => void;
        onMaximize: () => void;
        isMaximized: boolean;
        sidebarOpen: boolean;
    };

    let {
        chord,
        onChordChange,
        onSvgChange,
        onMaximize,
        isMaximized,
        sidebarOpen,
    }: Props = $props();
</script>

<div
    class="relative -mr-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-auto py-2 pr-4 transition-[margin-left,padding-left] duration-300 ease-in-out motion-reduce:transition-none"
    style:margin-left={sidebarOpen ? "-1rem" : "-3rem"}
    style:padding-left={sidebarOpen ? "1.5rem" : "3.5rem"}
>
    <div class="absolute right-4 top-2 z-10 flex flex-col gap-3">
        <div
            class="tooltip tooltip-left"
            data-tip={isMaximized ? "Minimize" : "Maximize"}
        >
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={isMaximized
                    ? "Restore panels"
                    : "Maximize workspace"}
                onclick={onMaximize}
            >
                {#if isMaximized}
                    <Minimize2 size={24} color="currentColor" />
                {:else}
                    <Maximize2 size={24} color="currentColor" />
                {/if}
            </button>
        </div>
        <div class="tooltip tooltip-left" data-tip="Rotate">
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Rotate drawing 90 degrees clockwise"
                onclick={() =>
                    onChordChange({ rotation: (chord.rotation + 90) % 360 })}
            >
                <RotateCwSquare
                    size={24}
                    color="currentColor"
                    class="origin-center"
                    style={`transform: rotate(${chord.rotation}deg)`}
                />
            </button>
        </div>
    </div>
    <div class="flex flex-1 items-center justify-center px-4 py-4">
        <ChordEditor
            {chord}
            rotation={chord.rotation}
            {onChordChange}
            {onSvgChange}
        />
    </div>
</div>
