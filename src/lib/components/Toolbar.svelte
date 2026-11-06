<script lang="ts">
    import {
        Trash,
        Undo2,
        Redo2,
        Copy,
        Download,
        Share,
        PanelBottomClose,
    } from "@lucide/svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";

    type Props = {
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

<div class="h-18 bg-red-300 px-4 rounded-xl items-center flex justify-between">
    <div class="flex">
        <button
            class="btn btn-square"
            onclick={(event) => {
                onChordChange(createDefaultChord());
            }}
        >
            <Trash color="#0a0a0a" />
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
                <Undo2 color="#0a0a0a" />
            </button>
            <button
                type="button"
                class="btn btn-square"
                onclick={onRedo}
                disabled={!canRedo}
                aria-label="Undo"
            >
                <Redo2 color="#0a0a0a" />
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
                <Copy color="#0a0a0a" />
            </button>

            <button
                type="button"
                class="btn btn-square"
                onclick={() => onDownload(format, exportWidth)}
                disabled={!canDownload}
                aria-label="Download chord"
            >
                <Download color="#0a0a0a" />
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
            <Share color="#0a0a0a" />
        </button>
        <div class="divider divider-horizontal mx-2"></div>
        <button class="btn btn-square">
            <PanelBottomClose color="#0a0a0a" />
        </button>
    </div>
</div>
