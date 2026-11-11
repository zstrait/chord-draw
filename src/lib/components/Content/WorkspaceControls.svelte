<script lang="ts">
    import { Maximize2, Minimize2, RotateCwSquare } from "@lucide/svelte";

    let {
        rotation,
        onRotate,
        onMaximize,
        isMaximized,
        rotateLabel = "Rotate drawing 90 degrees clockwise",
    }: {
        rotation: number;
        onRotate: () => void;
        onMaximize: () => void;
        isMaximized: boolean;
        rotateLabel?: string;
    } = $props();
</script>

<div class="absolute right-4 top-2 z-10 flex flex-col gap-3">
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
    <div class="tooltip tooltip-left" data-tip="Rotate">
        <button
            type="button"
            class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={rotateLabel}
            onclick={(event) => {
                if (event.detail > 0) event.currentTarget.blur();
                onRotate();
            }}
        >
            <RotateCwSquare
                size={24}
                color="currentColor"
                class="origin-center"
                style={`transform: rotate(${rotation}deg)`}
            />
        </button>
    </div>
</div>
