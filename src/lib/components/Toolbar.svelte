<script lang="ts">
    import {
        Trash,
        Undo2,
        Redo2,
        Copy,
        Download,
        Share,
        ChevronDown,
        ChevronUp,
    } from "@lucide/svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";

    type Props = {
        isOpen: boolean;
        onToggle: () => void;
        onChordChange: (changes: Partial<Chord>) => void;
        onUndo: () => void;
        canUndo: boolean;
        onRedo: () => void;
        canRedo: boolean;
        onCopy: (format: "SVG" | "PNG", width: number) => void;
        onDownload: (format: "SVG" | "PNG", width: number) => void;
        canDownload: boolean;
    };

    let {
        isOpen,
        onToggle,
        onChordChange,
        onUndo,
        canUndo,
        onRedo,
        canRedo,
        onCopy,
        onDownload,
        canDownload,
    }: Props = $props();

    let format = $state<"SVG" | "PNG">("SVG");
    let exportWidth = $state(1024);
</script>

<div
    class="relative shrink-0 overflow-hidden transition-[height] duration-300 ease-in-out motion-reduce:transition-none"
    style:height={isOpen ? "4.5rem" : "3rem"}
>
    {#if !isOpen}
        <button
            type="button"
            class="toolbar-open absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0"
            tabindex="-1"
            onclick={onToggle}
            aria-label="Expand toolbar"
            aria-expanded="false"
            aria-controls="toolbar-actions"
        >
            <span
                class="toolbar-hover absolute inset-y-0 left-0 right-16"
                aria-hidden="true"
            ></span>
        </button>
    {/if}

    <div
        class="toolbar-background pointer-events-none absolute inset-0 bg-[#526E93] transition-[transform,border-radius] duration-300 ease-in-out motion-reduce:transition-none"
        style:--toolbar-offset={isOpen ? "0rem" : "calc(100% - 1rem)"}
        style:border-radius={isOpen ? "0.75rem" : "0.75rem 1.5rem 0 0"}
    ></div>

    <div
        class="toolbar-tab pointer-events-none absolute inset-y-0 right-0 w-16 bg-[#526E93] transition-[border-radius] duration-300 ease-in-out motion-reduce:transition-none"
        style:border-radius={isOpen ? "0.75rem" : "1.5rem 1.5rem 0 0"}
    ></div>

    <div
        id="toolbar-actions"
        class="relative z-10 flex h-18 items-center justify-between pl-4 pr-18 transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none"
        class:opacity-0={!isOpen}
        style:transform={isOpen ? "translateY(0)" : "translateY(100%)"}
        inert={!isOpen}
    >
        <div class="flex">
            <button
                class="btn btn-square"
                onclick={(event) => {
                    onChordChange(createDefaultChord());
                }}
            >
                <Trash color="currentColor" />
            </button>
            <div class="divider divider-horizontal mx-2"></div>
            <div class="flex gap-2">
                <button
                    type="button"
                    class="btn btn-square"
                    onclick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                >
                    <Undo2 color="currentColor" />
                </button>
                <button
                    type="button"
                    class="btn btn-square"
                    onclick={onRedo}
                    disabled={!canRedo}
                    aria-label="Redo"
                >
                    <Redo2 color="currentColor" />
                </button>
            </div>
        </div>

        <div class="flex">
            <div class="flex gap-4">
                <button
                    type="button"
                    class="btn btn-square"
                    onclick={() => onCopy(format, exportWidth)}
                    disabled={!canDownload}
                    aria-label="Copy chord"
                >
                    <Copy color="currentColor" />
                </button>

                <button
                    type="button"
                    class="btn btn-primary btn-square"
                    onclick={() => onDownload(format, exportWidth)}
                    disabled={!canDownload}
                    aria-label="Download chord"
                >
                    <Download color="currentColor" />
                </button>

                <select bind:value={format} class="select w-20 shrink-0">
                    <option value="PNG">PNG</option>
                    <option value="SVG">SVG</option>
                </select>

                {#if format === "PNG"}
                    <select
                        bind:value={exportWidth}
                        class="select w-25 shrink-0"
                        aria-label="Export size"
                    >
                        <option value={512}>Small</option>
                        <option value={1024}>Medium</option>
                        <option value={2048}>Large</option>
                    </select>
                {/if}
            </div>
            <div class="divider divider-horizontal mx-2"></div>
            <button class="btn btn-square">
                <Share color="currentColor" />
            </button>
        </div>
    </div>

    <div
        class="absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-center"
    >
        {#if isOpen}
            <span
                class="absolute inset-y-4 left-0 w-0.5 bg-base-300"
                aria-hidden="true"
            ></span>
        {/if}
        <button
            type="button"
            class="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
            onclick={onToggle}
            aria-expanded={isOpen}
            aria-controls="toolbar-actions"
            aria-label={isOpen ? "Collapse toolbar" : "Expand toolbar"}
        >
            {#if isOpen}
                <ChevronDown size={40} color="currentColor" class="shrink-0" />
            {:else}
                <ChevronUp size={40} color="currentColor" class="shrink-0" />
            {/if}
        </button>
    </div>
</div>

<style>
    .toolbar-background {
        transform: translateY(var(--toolbar-offset));
    }

    .toolbar-tab::after {
        content: "";
        position: absolute;
        right: 100%;
        bottom: 1rem;
        width: 0.5rem;
        height: 0.5rem;
        background-color: inherit;
        mask-image: radial-gradient(
            circle at top left,
            transparent calc(0.5rem - 0.5px),
            #000 0.5rem
        );
    }

    .toolbar-open:has(.toolbar-hover:hover) ~ .toolbar-background {
        transform: translateY(0);
    }
</style>
