<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Chord, ChartSlotPosition } from "#lib/types.ts";
    import ChordEditor from "./ChordEditor.svelte";

    let {
        chord,
        position,
        onTargetChange,
        onMove,
    }: {
        chord: Chord;
        position: ChartSlotPosition;
        onTargetChange: (target: ChartSlotPosition | null) => void;
        onMove: (target: ChartSlotPosition) => void;
    } = $props();

    let button: HTMLButtonElement;
    let workspace: HTMLElement | null = null;
    let grid: HTMLElement | null = null;
    let frame = 0;
    let drag = $state<{
        pointerId: number;
        startX: number;
        startY: number;
        x: number;
        y: number;
        offsetX: number;
        offsetY: number;
        width: number;
        started: boolean;
    } | null>(null);
    let target = $state<ChartSlotPosition | null>(null);
    let targetOccupied = $state(false);

    function updateTarget() {
        if (!drag?.started) return;
        const element = document
            .elementFromPoint(drag.x, drag.y)
            ?.closest<HTMLElement>("[data-chart-slot]");
        let next =
            element && grid?.contains(element)
                ? {
                      row: Number(element.dataset.chartRow),
                      column: Number(element.dataset.chartColumn),
                  }
                : null;
        if (next?.row === position.row && next.column === position.column)
            next = null;
        if (next?.row === target?.row && next?.column === target?.column)
            return;
        target = next;
        targetOccupied = !!next && element!.hasAttribute("data-chart-chord");
        onTargetChange(next);
    }

    function scrollSpeed(value: number, start: number, end: number) {
        if (value < start + 48) return -Math.min(12, (start + 48 - value) / 4);
        if (value > end - 48) return Math.min(12, (value - end + 48) / 4);
        return 0;
    }

    function scrollWhileDragging() {
        if (!drag?.started || !workspace) return;
        const bounds = workspace.getBoundingClientRect();
        if (
            drag.x >= bounds.left &&
            drag.x <= bounds.right &&
            drag.y >= bounds.top &&
            drag.y <= bounds.bottom
        ) {
            workspace.scrollBy({
                left: scrollSpeed(drag.x, bounds.left, bounds.right),
                top: scrollSpeed(drag.y, bounds.top, bounds.bottom),
                behavior: "instant",
            });
        }
        updateTarget();
        frame = requestAnimationFrame(scrollWhileDragging);
    }

    function startDrag(event: PointerEvent) {
        if (event.button !== 0 || !event.isPrimary || drag) return;
        event.preventDefault();
        event.stopPropagation();
        const bounds = button.getBoundingClientRect();
        workspace = button.closest<HTMLElement>("[data-chart-workspace]");
        grid = button.closest<HTMLElement>("[data-chart-slots]");
        drag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            x: event.clientX,
            y: event.clientY,
            offsetX: event.clientX - bounds.left,
            offsetY: event.clientY - bounds.top,
            width: bounds.width,
            started: false,
        };
        button.setPointerCapture(event.pointerId);
        window.addEventListener("blur", cancelDrag);
    }

    function moveDrag(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (
            !drag.started &&
            Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= 5
        ) {
            drag.started = true;
            frame = requestAnimationFrame(scrollWhileDragging);
        }
        updateTarget();
    }

    function finishDrag(commit = false) {
        if (!drag) return;
        const pointerId = drag.pointerId;
        const destination = commit && drag.started ? target : null;
        drag = null;
        target = null;
        onTargetChange(null);
        cancelAnimationFrame(frame);
        window.removeEventListener("blur", cancelDrag);
        if (button.hasPointerCapture(pointerId))
            button.releasePointerCapture(pointerId);
        workspace = null;
        grid = null;
        if (destination) onMove(destination);
    }

    function cancelDrag(event?: Event) {
        if (
            event instanceof PointerEvent &&
            event.pointerId !== drag?.pointerId
        )
            return;
        finishDrag();
    }

    function endDrag(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        moveDrag(event);
        finishDrag(true);
    }

    onDestroy(() => finishDrag());
</script>

<button
    bind:this={button}
    type="button"
    class="absolute inset-0 touch-none cursor-grab select-none rounded-xl border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    class:dragging={drag?.started ?? false}
    aria-label={`Drag chord, row ${position.row + 1}, column ${position.column + 1}`}
    onpointerdown={startDrag}
    onpointermove={moveDrag}
    onpointerup={endDrag}
    onpointercancel={cancelDrag}
    onlostpointercapture={cancelDrag}
    onclick={(event) => {
        event.preventDefault();
        event.stopPropagation();
    }}
></button>

{#if drag?.started}
    <div
        class="pointer-events-none fixed left-0 top-0 z-50 rounded-xl opacity-90 shadow-xl ring-2 ring-primary"
        style:width={`${drag.width}px`}
        style:transform={`translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)`}
        aria-hidden="true"
        inert
    >
        <ChordEditor
            {chord}
            rotation={chord.rotation}
            active={false}
            onChordChange={() => {}}
        />
        {#if target && targetOccupied}
            <span
                class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-content"
            >
                Swap
            </span>
        {/if}
    </div>
{/if}

<style>
    .dragging {
        cursor: grabbing;
        background: color-mix(in srgb, var(--color-base-100) 60%, transparent);
    }
</style>
