<script lang="ts">
    import type { Chord } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";
    import WorkspaceControls from "./WorkspaceControls.svelte";

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
    <WorkspaceControls
        rotation={chord.rotation}
        {isMaximized}
        {onMaximize}
        onRotate={() =>
            onChordChange({ rotation: (chord.rotation + 90) % 360 })}
    />
    <div class="flex flex-1 items-center justify-center px-4 py-4">
        <ChordEditor
            {chord}
            rotation={chord.rotation}
            {onChordChange}
            {onSvgChange}
        />
    </div>
</div>
