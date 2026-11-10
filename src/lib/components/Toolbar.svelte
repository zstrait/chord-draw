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

    import Dropdown from "./Dropdown.svelte";
    import { getPngSize } from "#lib/export.ts";

    type Props = {
        isOpen: boolean;
        onToggle: () => void;
        onClear?: () => void;
        canClear?: boolean;
        onUndo?: () => void;
        canUndo?: boolean;
        onRedo?: () => void;
        canRedo?: boolean;
        onCopy?: (format: "SVG" | "PNG", width: number) => void;
        onDownload?: (format: "SVG" | "PNG", width: number) => void;
        onShare?: () => void;
        canDownload?: boolean;
        svg?: string;
        subject?: "chord" | "chart";
    };

    let {
        isOpen,
        onToggle,
        onClear,
        canClear = true,
        onUndo,
        canUndo = false,
        onRedo,
        canRedo = false,
        onCopy,
        onDownload,
        onShare,
        canDownload = false,
        svg = "",
        subject = "chord",
    }: Props = $props();

    let format = $state<"SVG" | "PNG">("PNG");
    let exportWidth = $state(1024);

    const formatOptions = [
        { label: "PNG", value: "PNG" },
        { label: "SVG", value: "SVG" },
    ] as const;

    const exportSizes = [
        { label: "Small", value: 512 },
        { label: "Medium", value: 1024 },
        { label: "Large", value: 2048 },
    ];

    const sizeOptions = $derived(exportSizes.map((option) => {
        const size = getPngSize(svg, option.value);
        return {
            ...option,
            tooltip: size ? `${size.width} × ${size.height} px` : undefined,
        };
    }));
</script>

<div
    class="relative shrink-0 transition-[height] duration-300 ease-in-out motion-reduce:transition-none"
    class:overflow-hidden={!isOpen}
    style:height={isOpen ? "4rem" : "3rem"}
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
        class="toolbar-background pointer-events-none absolute inset-0 transition-[transform,border-radius] duration-300 ease-in-out motion-reduce:transition-none"
        style:--toolbar-offset={isOpen ? "0rem" : "calc(100% - 1rem)"}
        style:border-radius={isOpen ? "0.75rem" : "0.75rem 1.5rem 0 0"}
    ></div>

    <div
        class="toolbar-tab pointer-events-none absolute inset-y-0 right-0 w-16 transition-[border-radius] duration-300 ease-in-out motion-reduce:transition-none"
        style:border-radius={isOpen ? "0.75rem" : "1.5rem 1.5rem 0 0"}
    ></div>

    <div
        id="toolbar-actions"
        class="relative z-10 flex h-16 items-center justify-between pl-4 pr-18 transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none"
        class:opacity-0={!isOpen}
        style:transform={isOpen ? "translateY(0)" : "translateY(100%)"}
        inert={!isOpen}
    >
        <div class="flex items-center gap-3">
            <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Clear">
                <button
                    type="button"
                    class="toolbar-control btn btn-ghost btn-square"
                    aria-label={`Reset ${subject}`}
                    onclick={onClear}
                    disabled={!canClear || !onClear}
                >
                    <Trash size={24} color="currentColor" />
                </button>
            </div>
            <span class="h-6 w-px shrink-0 bg-white/25" aria-hidden="true"></span>
            <div class="flex items-center gap-1">
                <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Undo">
                    <button
                        type="button"
                        class="toolbar-control btn btn-ghost btn-square"
                        onclick={onUndo}
                        disabled={!canUndo || !onUndo}
                        aria-label="Undo"
                    >
                        <Undo2 size={24} color="currentColor" />
                    </button>
                </div>
                <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Redo">
                    <button
                        type="button"
                        class="toolbar-control btn btn-ghost btn-square"
                        onclick={onRedo}
                        disabled={!canRedo || !onRedo}
                        aria-label="Redo"
                    >
                        <Redo2 size={24} color="currentColor" />
                    </button>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <fieldset class="flex items-center gap-2 border-0 p-0" disabled={!canDownload}>
                <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Copy">
                    <button
                        type="button"
                        class="toolbar-control btn btn-ghost btn-square"
                        onclick={() => onCopy?.(format, exportWidth)}
                        disabled={!canDownload || !onCopy}
                        aria-label={`Copy ${subject}`}
                    >
                        <Copy size={24} color="currentColor" />
                    </button>
                </div>

                <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Download">
                    <button
                        type="button"
                        class="toolbar-control btn btn-ghost btn-square"
                        onclick={() => onDownload?.(format, exportWidth)}
                        disabled={!canDownload || !onDownload}
                        aria-label={`Download ${subject}`}
                    >
                        <Download size={24} color="currentColor" />
                    </button>
                </div>

                <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Export type">
                    <Dropdown
                        label="Export type"
                        value={format}
                        options={formatOptions}
                        onchange={(value) => {
                            format = value;
                        }}
                        placement="top"
                        class="w-20 shrink-0"
                    />
                </div>

                {#if format === "PNG"}
                    <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Export size">
                        <Dropdown
                            label="Export size"
                            value={exportWidth}
                            options={sizeOptions}
                            onchange={(value) => {
                                exportWidth = value;
                            }}
                            placement="top"
                            class="w-26 shrink-0"
                        />
                    </div>
                {/if}
            </fieldset>
            <span class="h-6 w-px shrink-0 bg-white/25" aria-hidden="true"></span>
            <div class="tooltip tooltip-top inline-flex shrink-0" data-tip="Share">
                <button type="button" class="toolbar-control btn btn-ghost btn-square" aria-label={`Share ${subject}`} onclick={onShare} disabled={!onShare}>
                    <Share size={24} color="currentColor" />
                </button>
            </div>
        </div>
    </div>

    <div
        class="absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-center"
    >
        {#if isOpen}
            <span
                class="absolute inset-y-5 left-0 w-px bg-white/25"
                aria-hidden="true"
            ></span>
        {/if}
        <button
            type="button"
            class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
            onclick={onToggle}
            aria-expanded={isOpen}
            aria-controls="toolbar-actions"
            aria-label={isOpen ? "Collapse toolbar" : "Expand toolbar"}
        >
            {#if isOpen}
                <ChevronDown size={32} color="currentColor" class="shrink-0" />
            {:else}
                <ChevronUp size={40} color="currentColor" class="shrink-0" />
            {/if}
        </button>
    </div>
</div>

<style>
    .toolbar-background,
    .toolbar-tab {
        background-color: var(--toolbar-bg);
    }

    .toolbar-control {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        color: white;
        box-shadow: none;
    }

    .toolbar-control.btn-ghost {
        background-color: transparent;
        border-color: transparent;
    }

    .toolbar-control.btn-ghost:hover:not(:disabled) {
        background-color: rgb(255 255 255 / 12%);
    }

    .toolbar-control:focus-visible {
        outline-color: white;
    }

    .toolbar-control:disabled {
        background-color: transparent;
        border-color: transparent;
        color: rgb(255 255 255 / 30%);
    }

    @media (pointer: coarse) {
        .toolbar-control {
            width: 2.75rem;
            height: 2.75rem;
        }
    }

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
