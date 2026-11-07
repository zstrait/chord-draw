<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Barre, BarreDrag, HoverTarget } from "#lib/types.ts";
    import { findTarget, getPreview } from "#lib/overlay.ts";

    let {
        hoverTargets,
        onNoteClick,
        onStringClick,
        onBarreCreate,
        onMarkerContextMenu
    }: {
        hoverTargets: HoverTarget[];
        onNoteClick: (stringIndex: number, fret: number) => void;
        onStringClick: (stringIndex: number) => void;
        onBarreCreate: (barre: Barre) => void;
        onMarkerContextMenu: (event: MouseEvent, target: HoverTarget) => void;
    } = $props();

    let container: HTMLDivElement;
    let pointerId: number | null = null;
    let captureTarget: HTMLButtonElement | null = null;
    let suppressClick = false;
    let barreDrag = $state<BarreDrag | null>(null);

    let preview = $derived(getPreview(hoverTargets, barreDrag));

    function targetAt(event: PointerEvent) {
        if (!barreDrag) {
            return;
        }

        const bounds = container.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        return findTarget(hoverTargets, barreDrag.fret, x, y);
    }

    function startDrag(event: PointerEvent, target: HoverTarget) {
        if (event.button !== 0 || !event.isPrimary || pointerId !== null) {
            return;
        }

        suppressClick = false;

        if (target.kind !== "note") {
            return;
        }

        captureTarget = event.currentTarget as HTMLButtonElement;
        pointerId = event.pointerId;
        captureTarget.setPointerCapture(pointerId);
        barreDrag = {
            fret: target.fret,
            startString: target.stringIndex,
            endString: target.stringIndex,
            hasDragged: false,
        };
    }

    function moveDrag(event: PointerEvent) {
        if (event.pointerId !== pointerId || !barreDrag) {
            return;
        }

        const target = targetAt(event);

        if (target && target.stringIndex !== barreDrag.endString) {
            barreDrag = {
                ...barreDrag,
                endString: target.stringIndex,
                hasDragged:
                    barreDrag.hasDragged ||
                    target.stringIndex !== barreDrag.startString,
            };
        }
    }

    function finishDrag(cancelled: boolean) {
        if (pointerId === null) {
            return;
        }

        const id = pointerId;
        const button = captureTarget;
        const drag = barreDrag;
        suppressClick = cancelled || Boolean(drag?.hasDragged);
        pointerId = null;
        captureTarget = null;
        barreDrag = null;

        if (button?.hasPointerCapture(id)) {
            button.releasePointerCapture(id);
        }

        if (
            !cancelled &&
            drag?.hasDragged &&
            drag.startString !== drag.endString
        ) {
            onBarreCreate({
                fret: drag.fret,
                startString: Math.min(drag.startString, drag.endString),
                endString: Math.max(drag.startString, drag.endString),
                markerText: null,
            });
        }
    }

    function endDrag(event: PointerEvent) {
        if (event.pointerId !== pointerId) {
            return;
        }

        if (!targetAt(event)) {
            finishDrag(!barreDrag?.hasDragged || !hoverTargets.length);
            return;
        }

        moveDrag(event);
        finishDrag(false);
    }

    function cancelDrag(event: PointerEvent) {
        if (event.pointerId === pointerId) {
            finishDrag(true);
        }
    }

    function handleClick(event: MouseEvent, target: HoverTarget) {
        if (pointerId !== null || (event.detail !== 0 && suppressClick)) {
            event.preventDefault();
            return;
        }

        if (target.kind === "string") {
            onStringClick(target.stringIndex);
        } else {
            onNoteClick(target.stringIndex, target.fret);
        }
    }

    onDestroy(() => finishDrag(true));
</script>

<svelte:window
    onkeydown={(event) => {
        if (event.key === "Escape" && pointerId !== null) {
            event.preventDefault();
            finishDrag(true);
        }
    }}
/>

<div
    class="pointer-events-none absolute inset-0"
    class:dragging={barreDrag?.hasDragged ?? false}
    bind:this={container}
>
    {#each hoverTargets as target (`${target.stringIndex}-${target.fret}`)}
        <button
            type="button"
            class="hover-target"
            class:note-target={target.kind === "note"}
            aria-label={target.kind === "string"
                ? `Cycle string ${target.stringIndex + 1} between open, muted, and blank`
                : `Toggle note on string ${target.stringIndex + 1}, visible fret ${target.fret}`}
            onpointerdown={(event) => startDrag(event, target)}
            onpointermove={moveDrag}
            onpointerup={endDrag}
            onpointercancel={cancelDrag}
            onlostpointercapture={cancelDrag}
            oncontextmenu={(event) => onMarkerContextMenu(event, target)}
            onclick={(event) => handleClick(event, target)}
            style:left={`${target.x}px`}
            style:top={`${target.y}px`}
            style:width={`${target.width}px`}
            style:height={`${target.height}px`}
            style:--diameter={`${target.diameter}px`}
        >
            <span
                class="hover-circle"
                class:string-indicator={target.kind === "string"}
            ></span>
        </button>
    {/each}
    {#if preview}
        <div
            class="barre-preview"
            style:left={`${preview.x}px`}
            style:top={`${preview.y}px`}
            style:width={`${preview.width}px`}
            style:height={`${preview.height}px`}
        ></div>
    {/if}
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

    .note-target {
        touch-action: none;
        user-select: none;
    }

    .hover-circle {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: var(--diameter);
        height: var(--diameter);
        border: 2px solid rgb(52 110 195 / 35%);
        border-radius: 50%;
        background: rgb(52 110 195 / 16%);
        opacity: 0;
        pointer-events: none;
    }

    .hover-target:hover .hover-circle,
    .hover-target:focus-visible .hover-circle {
        opacity: 1;
    }

    .string-indicator {
        width: 80%;
        height: 80%;
        border: 0;
        border-radius: 6px;
        background: rgb(52 110 195 / 16%);
    }

    .dragging .hover-target .hover-circle {
        opacity: 0;
    }

    .barre-preview {
        position: absolute;
        pointer-events: none;
        border: 2px solid rgb(52 110 195 / 35%);
        border-radius: 999px;
        background: rgb(52 110 195 / 16%);
    }

    .hover-target:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: -2px;
    }
</style>
