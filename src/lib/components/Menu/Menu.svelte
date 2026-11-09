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
        onChordPreview: (changes: Partial<Chord> | null) => void;
        isOpen: boolean;
        onToggle: () => void;
    };

    let { chord, onChordChange, onChordPreview, isOpen, onToggle }: Props = $props();
</script>

<div
    class="mb-2 shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
    style:width={isOpen ? "20rem" : "3rem"}
>
    <div
        class="relative flex h-full w-80 flex-col p-4 transition-transform duration-300 ease-in-out motion-reduce:transition-none"
        style:transform={isOpen
            ? "translateX(0)"
            : "translateX(calc(3rem - 20rem))"}
    >
        {#if !isOpen}
            <button
                type="button"
                class="sidebar-open absolute inset-y-0 right-0 z-20 w-12 cursor-pointer border-0 bg-transparent p-0"
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
            class="sidebar-background pointer-events-none absolute inset-0 bg-[var(--sidebar-bg)] transition-[transform,border-radius] duration-300 ease-in-out motion-reduce:transition-none"
            style:--sidebar-offset={isOpen ? "0rem" : "-2rem"}
            style:border-radius={isOpen ? "0.75rem" : "0.75rem 1.5rem 0.75rem 0.75rem"}
        ></div>

        <div
            class="sidebar-tab pointer-events-none absolute inset-x-0 top-0 h-16 bg-[var(--sidebar-bg)] transition-[border-radius] duration-300 ease-in-out motion-reduce:transition-none"
            style:border-radius={isOpen ? "0.75rem" : "0 1.5rem 1.5rem 0"}
        ></div>

        <div class="relative z-10 flex h-8 shrink-0 items-center pr-12">
            <span class="text-xl font-bold text-primary" aria-hidden={!isOpen}>
                Edit Menu
            </span>
        </div>

        <div
            class="absolute z-10 flex items-center justify-center transition-[top,right,width,height] duration-300 ease-in-out motion-reduce:transition-none"
            style:top={isOpen ? "1rem" : "0rem"}
            style:right={isOpen ? "1rem" : "0rem"}
            style:width={isOpen ? "2rem" : "3rem"}
            style:height={isOpen ? "2rem" : "4rem"}
        >
            <button
                type="button"
                class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                onclick={onToggle}
                aria-expanded={isOpen}
                aria-controls="sidebar-settings"
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
                {#if isOpen}
                    <ChevronLeft size={32} color="currentColor" class="shrink-0" />
                {:else}
                    <ChevronRight size={40} color="currentColor" class="shrink-0" />
                {/if}
            </button>
        </div>

        <div
            id="sidebar-settings"
            class="sidebar-settings relative z-10 min-h-0 flex-1 overflow-y-auto transition-opacity duration-300 motion-reduce:transition-none"
            class:opacity-0={!isOpen}
            inert={!isOpen}
        >
            <EditMenu {chord} {onChordChange} />
            <div class="divider my-3"></div>
            <CustomizeMenu {chord} {onChordChange} {onChordPreview} />
        </div>
    </div>
</div>

<style>
    .sidebar-settings {
        margin-inline: -0.25rem;
        padding-inline: 0.25rem;
        scrollbar-width: none;
    }

    .sidebar-settings::-webkit-scrollbar {
        display: none;
    }

    .sidebar-settings :global(.fieldset) {
        min-width: 0;
        padding-block: 0.375rem;
    }

    .sidebar-settings :global(.fieldset-legend) {
        padding-block: 0.375rem;
        font-weight: 500;
    }

    .sidebar-settings :global(.input) {
        width: 100%;
        min-width: 0;
        height: 2.25rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        box-shadow: none;
    }

    .sidebar-settings :global(.input:focus-within) {
        border-color: var(--color-primary);
        outline-color: var(--color-primary);
    }

    @media (pointer: coarse) {
        .sidebar-settings :global(.input) {
            height: 2.75rem;
            font-size: 1rem;
        }

        .sidebar-settings :global(.menu-check) {
            min-height: 2.75rem;
        }
    }

    .sidebar-background {
        transform: translateX(var(--sidebar-offset));
    }

    .sidebar-tab::after {
        content: "";
        position: absolute;
        right: calc(3rem - 1rem - 0.5rem);
        top: 100%;
        width: 0.5rem;
        height: 0.5rem;
        background-color: inherit;
        mask-image: radial-gradient(
            circle at bottom right,
            transparent calc(0.5rem - 0.5px),
            #000 0.5rem
        );
    }

    .sidebar-open:has(.sidebar-hover:hover) ~ .sidebar-background {
        transform: translateX(0);
    }
</style>
