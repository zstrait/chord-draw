<script lang="ts">
    import { onDestroy, onMount, tick, untrack } from "svelte";
    import {
        HueyRoot,
        SaturationArea,
        HueSlider,
        HexInput,
        ColorPreview,
        hueyColor,
        type HueyRootProps,
    } from "@hueycolor/svelte";

    let {
        label,
        value,
        anchor,
        onApply,
        onClose,
        onPreview,
    }: {
        label: string;
        value: string;
        anchor: HTMLElement;
        onApply: (value: string) => void;
        onClose: () => void;
        onPreview: (value: string | null) => void;
    } = $props();

    let popup: HTMLDivElement;
    let color = $state<HueyRootProps["color"]>(hueyColor(untrack(() => value)));
    let finished = false;

    $effect(() => {
        const value = hueyColor(color).toHexString().toUpperCase();
        untrack(() => onPreview(value));
    });

    onDestroy(() => onPreview(null));

    function close(restoreFocus = true) {
        popup.hidePopover();
        const trigger = anchor.querySelector("button");
        if (restoreFocus) trigger?.focus({ preventScroll: true });
        else trigger?.blur();
    }

    function save() {
        if (finished) return;
        finished = true;
        const hex =
            popup.querySelector<HTMLInputElement>('[huey-input="hex"]')
                ?.value ?? "";
        const current = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)
            ? hex
            : color;
        onApply(hueyColor(current).toHexString().toUpperCase());
    }

    function cancel() {
        finished = true;
        close();
    }

    async function apply(restoreFocus = true) {
        await tick();
        save();
        close(restoreFocus);
    }

    function position() {
        const bounds = anchor.getBoundingClientRect();
        popup.style.left = `${Math.max(8, Math.min(bounds.right + 8, window.innerWidth - popup.offsetWidth - 8))}px`;
        popup.style.top = `${Math.max(8, Math.min(bounds.top, window.innerHeight - popup.offsetHeight - 8))}px`;
    }

    onMount(() => {
        popup.showPopover();
        position();
        popup.focus({ preventScroll: true });
    });
</script>

<svelte:window
    onresize={position}
    onkeydown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented && !finished) {
            event.preventDefault();
            cancel();
        }
    }}
/>

<div
    bind:this={popup}
    popover="auto"
    role="dialog"
    tabindex="-1"
    aria-label={`Custom ${label.toLowerCase()}`}
    class="color-picker w-64 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-3 text-base-content shadow-[0_6px_20px_rgb(30_45_67_/16%)]"
    onbeforetoggle={(event) => {
        if (event.newState === "closed") save();
    }}
    ontoggle={(event) => {
        if (event.newState === "closed") onClose();
    }}
    onkeydown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
            event.preventDefault();
            cancel();
        } else if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();
            apply(false);
        }
    }}
>
    <form
        onsubmit={(event) => {
            event.preventDefault();
            apply();
        }}
    >
        <h2 class="mb-3 text-base font-medium text-primary">{label}</h2>
        <HueyRoot bind:color>
            <div class="flex flex-col gap-3">
                <SaturationArea
                    colorFormat="hex"
                    aria-label="Saturation and brightness"
                />
                <HueSlider aria-label="Hue" />
                <div class="flex items-center gap-2">
                    <ColorPreview splitPreview={false} />
                    <HexInput
                        class="input h-9 min-w-0 flex-1 rounded-lg text-sm shadow-none"
                        aria-label="Hex color"
                    />
                </div>
            </div>
        </HueyRoot>
        <div class="mt-3 flex justify-end gap-2">
            <button
                type="button"
                class="btn btn-ghost btn-sm rounded-lg font-medium shadow-none"
                onclick={cancel}>Cancel</button
            >
            <button
                type="submit"
                class="btn btn-primary btn-sm rounded-lg font-medium shadow-none"
                >Apply</button
            >
        </div>
    </form>
</div>

<style>
    .color-picker {
        position: fixed;
        inset: auto;
        margin: 0;
    }

    .color-picker:not(:popover-open) {
        display: none;
    }

    .color-picker :global([huey-area]) {
        --huey-area-width: 100%;
        --huey-area-height: 10rem;
        --huey-area-radius: 0.5rem;
        cursor: crosshair;
    }

    .color-picker :global([huey-slider-track]) {
        --huey-slider-track-width: 100%;
        --huey-slider-track-height: 0.75rem;
    }

    .color-picker :global([huey-slider-thumb]) {
        box-shadow:
            0 0 0 2px white,
            0 0 0 3px black;
    }

    .color-picker :global([huey-slider-thumb]:focus-visible) {
        outline: 2px solid var(--color-primary);
        outline-offset: 3px;
    }

    .color-picker :global([huey-preview]) {
        width: 2.25rem;
        height: 2.25rem;
        flex-shrink: 0;
        border: 1px solid var(--color-base-300);
        border-radius: 0.5rem;
    }
</style>
