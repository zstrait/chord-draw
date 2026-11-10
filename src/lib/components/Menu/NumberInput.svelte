<script lang="ts">
    import { tick } from "svelte";
    import { SlidersVertical } from "@lucide/svelte";

    let { label, value, min = 1, max, placeholder, onchange, onclear }: {
        label: string;
        value: number | null;
        min?: number;
        max: number;
        placeholder?: string;
        onchange: (value: number, input: HTMLInputElement) => void;
        onclear?: (input: HTMLInputElement) => void;
    } = $props();

    const popupId = $props.id();
    let trigger: HTMLButtonElement;
    let popup: HTMLDivElement;
    let slider: HTMLInputElement;
    let open = $state(false);
    let sliderMax = $state<number>();

    function close(restoreFocus = false) {
        popup.hidePopover();
        if (restoreFocus) trigger.focus({ preventScroll: true });
    }

    async function show() {
        sliderMax = Math.max(max, value ?? min);
        await tick();
        slider.value = String(value ?? 0);
        popup.showPopover();
        const bounds = trigger.getBoundingClientRect();
        popup.style.left = `${Math.max(8, Math.min(bounds.right + 8, window.innerWidth - popup.offsetWidth - 8))}px`;
        popup.style.top = `${Math.max(8, Math.min(bounds.top + bounds.height / 2 - popup.offsetHeight / 2, window.innerHeight - popup.offsetHeight - 8))}px`;
        slider.focus({ preventScroll: true });
    }
</script>

<svelte:window onresize={() => { if (open) close(); }} />
<svelte:document onscrollcapture={(event) => {
    if (open && event.target instanceof Node && !popup.contains(event.target)) close();
}} />

<div class="relative min-w-0">
    <input
        type="number"
        class="input number-input pr-9"
        {min}
        step="1"
        {placeholder}
        value={value ?? ""}
        aria-label={label}
        oninput={(event) => {
            const input = event.currentTarget;
            if (input.value === "" && onclear) {
                onclear(input);
            } else if (Number.isInteger(input.valueAsNumber) && input.valueAsNumber >= min) {
                onchange(input.valueAsNumber, input);
            }
        }}
        onblur={(event) => { event.currentTarget.value = value === null ? "" : String(value); }}
    />
    <button
        bind:this={trigger}
        type="button"
        class="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`Adjust ${label.toLowerCase()} with slider`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popupId}
        popovertarget={popupId}
        onclick={(event) => {
            event.preventDefault();
            if (popup.matches(":popover-open")) close();
            else show();
        }}
    >
        <SlidersVertical size={14} aria-hidden="true" />
    </button>
    <div
        bind:this={popup}
        id={popupId}
        popover="auto"
        role="dialog"
        tabindex="-1"
        aria-label={`${label} slider`}
        class="number-slider rounded-xl border border-base-300 bg-base-100 px-2 py-3 text-base-content shadow-[0_6px_20px_rgb(30_45_67_/16%)]"
        ontoggle={(event) => { open = event.newState === "open"; }}
        onkeydown={(event) => {
            if (event.key === "Escape" || event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                close(event.key === "Escape");
                if (event.key === "Enter") trigger.blur();
            } else if (event.key === "Tab") {
                close(true);
            }
        }}
    >
        <div class="flex min-w-8 justify-center">
            <input
                bind:this={slider}
                type="range"
                class="range range-primary range-sm range-vertical h-48 max-h-[calc(100dvh-6rem)]"
                min={onclear ? 0 : min}
                max={sliderMax ?? max}
                step="1"
                value={value ?? 0}
                aria-label={label}
                aria-orientation="vertical"
                aria-valuetext={value === null ? placeholder : undefined}
                oninput={(event) => {
                    const input = event.currentTarget;
                    if (input.valueAsNumber === 0 && onclear) onclear(input);
                    else onchange(input.valueAsNumber, input);
                }}
            />
        </div>
    </div>
</div>

<style>
    .number-input {
        appearance: textfield;
    }

    .number-input::-webkit-inner-spin-button,
    .number-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .number-slider {
        position: fixed;
        position-area: none;
        inset: auto;
        margin: 0;
    }

    .number-slider:not(:popover-open) {
        display: none;
    }
</style>
