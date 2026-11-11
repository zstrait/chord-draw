<script lang="ts">
    import {
        Maximize2,
        Minimize2,
        RotateCwSquare,
        SquareDashedPlus,
        Move,
        ScanEye,
    } from "@lucide/svelte";

    let {
        rotation,
        onRotate,
        onMaximize,
        isMaximized,
        rotateLabel = "Rotate drawing 90 degrees clockwise",
        showChartActions = false,
        onFillEmptySlots,
        hasEmptySlots = false,
        isMoveMode = false,
        onToggleMove,
        isPreviewMode = false,
        onTogglePreview,
    }: {
        rotation: number;
        onRotate: () => void;
        onMaximize: () => void;
        isMaximized: boolean;
        rotateLabel?: string;
        showChartActions?: boolean;
        onFillEmptySlots?: () => void;
        hasEmptySlots?: boolean;
        isMoveMode?: boolean;
        onToggleMove?: () => void;
        isPreviewMode?: boolean;
        onTogglePreview?: () => void;
    } = $props();
</script>

<div class="z-10 flex shrink-0 flex-col gap-3 self-start">
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
                size={25}
                color="currentColor"
                class="origin-center"
                style={`transform: rotate(${rotation}deg)`}
            />
        </button>
    </div>

    {#if showChartActions}
        <div class="tooltip tooltip-left" data-tip="Fill Empty Slots">
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary/5 p-0 text-primary enabled:hover:bg-primary/15 disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Fill empty chord slots"
                disabled={!hasEmptySlots}
                onclick={onFillEmptySlots}
            >
                <SquareDashedPlus size={26} color="currentColor" />
            </button>
        </div>

        <div
            class="tooltip tooltip-left"
            data-tip={isMoveMode ? "Exit Move Mode" : "Move Chords"}
        >
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 p-0 text-primary disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary {isMoveMode
                    ? 'bg-primary/20 ring-1 ring-primary/40 hover:bg-primary/25'
                    : 'bg-primary/5 hover:bg-primary/15'}"
                aria-label="Move chords"
                aria-pressed={isMoveMode}
                disabled={isPreviewMode}
                onclick={onToggleMove}
            >
                <Move size={24} color="currentColor" />
            </button>
        </div>

        <div
            class="tooltip tooltip-left"
            data-tip={isPreviewMode ? "Exit Export Preview" : "Preview Export"}
        >
            <button
                type="button"
                class="flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 p-0 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary {isPreviewMode
                    ? 'bg-primary/20 ring-1 ring-primary/40 hover:bg-primary/25'
                    : 'bg-primary/5 hover:bg-primary/15'}"
                aria-label="Preview export"
                aria-pressed={isPreviewMode}
                onclick={onTogglePreview}
            >
                <ScanEye size={27} color="currentColor" />
            </button>
        </div>
    {/if}
</div>
