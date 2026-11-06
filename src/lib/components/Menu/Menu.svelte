<script lang="ts">
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";
    import { ChevronLeft, ChevronRight } from "@lucide/svelte";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        isOpen: boolean;
        onToggle: () => void;
    };

    let { chord, onChordChange, isOpen, onToggle }: Props = $props();
</script>

<div
    class="shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
    style:width={isOpen ? "20rem" : "4rem"}
>
    <div
        class="relative flex h-full w-80 flex-col p-4 transition-transform duration-300 ease-in-out motion-reduce:transition-none"
        style:transform={isOpen
            ? "translateX(0)"
            : "translateX(calc(4rem - 20rem))"}
    >
        {#if !isOpen}
            <button
                type="button"
                class="sidebar-open absolute inset-y-0 right-0 z-20 w-16 cursor-pointer border-0 bg-transparent p-0"
                tabindex="-1"
                onclick={onToggle}
                aria-label="Expand sidebar"
                aria-expanded="false"
                aria-controls="sidebar-settings"
            >
                <span
                    class="sidebar-hover absolute inset-x-0 bottom-0 top-16"
                    aria-hidden="true"
                ></span>
            </button>
        {/if}

        <div
            class="sidebar-background pointer-events-none absolute inset-0 rounded-xl bg-blue-400 transition-transform duration-300 ease-in-out motion-reduce:transition-none"
            style:--sidebar-offset={isOpen
                ? "0rem"
                : "calc(1rem - 4rem)"}
        ></div>

        <div
            class={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-blue-400 ${isOpen ? "rounded-xl" : "rounded-r-full"}`}
        ></div>

        <div class="relative z-10 flex shrink-0 items-center justify-between">
            <span class="text-xl font-bold" class:invisible={!isOpen}>
                Edit Menu
            </span>

            <button
                type="button"
                class="btn btn-ghost btn-circle w-8 h-8 border-0 bg-transparent shadow-none hover:bg-blue-500/20"
                onclick={onToggle}
                aria-expanded={isOpen}
                aria-controls="sidebar-settings"
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
                {#if isOpen}
                    <ChevronLeft size={40} color="#0a0a0a" />
                {:else}
                    <ChevronRight size={40} color="#0a0a0a" />
                {/if}
            </button>
        </div>

        <div
            id="sidebar-settings"
            class="relative z-10 min-h-0 flex-1 overflow-y-auto transition-opacity duration-300 motion-reduce:transition-none"
            class:opacity-0={!isOpen}
            inert={!isOpen}
        >
            <EditMenu {chord} {onChordChange} />
            <div class="divider my-3"></div>
            <CustomizeMenu {chord} {onChordChange} />
        </div>
    </div>
</div>

<style>
    .sidebar-background {
        transform: translateX(var(--sidebar-offset));
    }

    .sidebar-open:has(.sidebar-hover:hover) ~ .sidebar-background {
        transform: translateX(0);
    }
</style>
