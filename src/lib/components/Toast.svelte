<script lang="ts">
    import { onDestroy } from "svelte";
    import { fly } from "svelte/transition";

    let message = $state("");
    let aboveTooltip = $state(false);
    let nextToast: { message: string; aboveTooltip: boolean } | null = null;
    let exiting = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    onDestroy(() => clearTimeout(timer));

    export function show(value: string, aboveTooltip = false) {
        nextToast = { message: value, aboveTooltip };
        clearTimeout(timer);
        if (message) {
            hide();
        } else if (!exiting) {
            showNext();
        }
    }

    function hide() {
        exiting = true;
        message = "";
    }

    function showNext() {
        exiting = false;
        if (!nextToast) return;
        message = nextToast.message;
        aboveTooltip = nextToast.aboveTooltip;
        nextToast = null;
        timer = setTimeout(hide, 2000);
    }

    function slide(node: Element, { x }: { x: number }) {
        return fly(node, {
            x,
            duration: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? 0
                : 200,
        });
    }
</script>

<div
    class="toast toast-end pointer-events-none absolute right-0 bottom-full z-50 p-0"
    style:margin-bottom={aboveTooltip ? "calc(2.5rem - 2px)" : "0.75rem"}
    role="status"
    aria-live="polite"
>
    {#if message}
        <div
            class="alert animate-none rounded-xl border-0 bg-neutral px-4 py-3 text-sm font-medium text-neutral-content shadow-lg"
            in:slide={{ x: 48 }}
            out:slide={{ x: 48 }}
            onoutroend={showNext}
        >
            <span>{message}</span>
        </div>
    {/if}
</div>
