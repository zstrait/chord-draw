<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import { ArrowLeft } from "@lucide/svelte";
    import ChordEditor from "./ChordEditor.svelte";
    import WorkspaceControls from "./WorkspaceControls.svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onSvgChange?: (svg: string) => void;
        onBack?: () => void;
        onMaximize: () => void;
        isMaximized: boolean;
        sidebarOpen: boolean;
    };

    let {
        chord,
        onChordChange,
        onSvgChange,
        onBack,
        onMaximize,
        isMaximized,
        sidebarOpen,
    }: Props = $props();

    export function rotate() {
        onChordChange({ rotation: (chord.rotation + 90) % 360 });
    }
</script>

<div
    class="relative -mr-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-auto pt-5.5 pr-4 pb-2 transition-[margin-left,padding-left] duration-300 ease-in-out motion-reduce:transition-none"
    style:margin-left={sidebarOpen ? "-1rem" : "-3rem"}
    style:padding-left={sidebarOpen ? "1.5rem" : "3.5rem"}
>
    {#if onBack}
        <button
            type="button"
            class="absolute top-5.5 z-10 flex h-9 cursor-pointer items-center gap-2 rounded-lg border-0 bg-primary/5 px-3 text-sm font-medium text-primary transition-[left] duration-300 ease-in-out hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
            style:left={sidebarOpen ? "1.5rem" : "3.5rem"}
            onclick={onBack}
        >
            <ArrowLeft size={18} aria-hidden="true" />
            Back to chart
        </button>
    {/if}
    <div class="absolute right-4 top-5.5 z-10">
        <WorkspaceControls
            rotation={chord.rotation}
            {isMaximized}
            {onMaximize}
            onRotate={rotate}
        />
    </div>
    <div
        class="flex flex-1 items-center justify-center px-4 py-4"
        class:pt-14={!!onBack}
    >
        <ChordEditor
            {chord}
            rotation={chord.rotation}
            {onChordChange}
            {onSvgChange}
        />
    </div>
</div>
