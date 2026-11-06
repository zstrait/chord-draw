<script lang="ts">
    import type { HoverTarget } from "#lib/types.ts";

    let {
        hoverTargets,
        showTargets,
        onNoteClick,
    }: {
        hoverTargets: HoverTarget[];
        showTargets: boolean;
        onNoteClick: (stringIndex: number, fret: number) => void;
    } = $props();
</script>

<div class="pointer-events-none absolute inset-0">
    {#each hoverTargets as target (`${target.stringIndex}-${target.fret}`)}
        <button
            type="button"
            class="hover-target"
            class:show-target={showTargets}
            aria-label={`Toggle note on string ${target.stringIndex + 1}, visible fret ${target.fret}`}
            onclick={() => onNoteClick(target.stringIndex, target.fret)}
            style:left={`${target.x}px`}
            style:top={`${target.y}px`}
            style:width={`${target.width}px`}
            style:height={`${target.height}px`}
            style:--diameter={`${target.diameter}px`}
        >
            <span class="hover-circle"></span>
        </button>
    {/each}
</div>

<style>
    .hover-target {
        position: absolute;
        pointer-events: auto;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: crosshair;
    }

    .show-target {
        outline: 1px dashed rgb(59 130 246 / 45%);
        outline-offset: -1px;
        background: rgb(59 130 246 / 5%);
    }

    .hover-circle {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: var(--diameter);
        height: var(--diameter);
        border: 2px solid #2563eb;
        border-radius: 50%;
        background: rgb(59 130 246 / 30%);
        opacity: 0;
        pointer-events: none;
    }

    .hover-target:hover .hover-circle,
    .hover-target:focus-visible .hover-circle {
        opacity: 1;
    }

    .hover-target:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: -2px;
    }
</style>
