<script lang="ts">
    import { onDestroy, untrack } from "svelte";
    import { fly } from "svelte/transition";
    import Header from "#lib/components/Header.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";

    import type { Chord } from "#lib/types.ts";
    import type { PageProps } from "./$types";
    import { encodeChord } from "#lib/share.ts";
    import { downloadSvg, downloadPng, copySvg, copyPng } from "#lib/export.ts";

    let { data }: PageProps = $props();
    let chord = $state(untrack(() => $state.snapshot(data.chord)));
    let stylingPreview = $state<Chord["styling"] | null>(null);

    let past = $state<Chord[]>([]);
    let future = $state<Chord[]>([]);
    let svg = $state("");
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
    let copyMessage = $state("");
    let copyToastTimer: ReturnType<typeof setTimeout> | undefined;
    let groupedInput: HTMLInputElement | null = null;

    onDestroy(() => clearTimeout(copyToastTimer));

    $effect.pre(() => {
        const initial = data.chord;
        untrack(() => {
            chord = $state.snapshot(initial);
            past = [];
            future = [];
            groupedInput = null;
            stylingPreview = null;
            copyMessage = "";
            clearTimeout(copyToastTimer);
        });
    });

    function showCopyToast(message: string) {
        copyMessage = message;
        clearTimeout(copyToastTimer);
        copyToastTimer = setTimeout(() => { copyMessage = ""; }, 2000);
    }

    async function handleShare() {
        const url = new URL(window.location.href);
        url.search = encodeChord(chord).toString();
        url.hash = "";
        try {
            await navigator.clipboard.writeText(url.href);
            showCopyToast("Link copied!");
        } catch (error) {
            console.error(error);
            showCopyToast("Couldn’t copy link");
        }
    }

    function toastSlide(node: Element, { x }: { x: number }) {
        return fly(node, {
            x,
            duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200,
        });
    }

    function handleSvgChange(value: string) {
        svg = value;
        console.log(value.slice(0, 200));
    }

    function updateChord(
        changes: Partial<Chord>,
        input: HTMLInputElement | null = null,
    ) {
        if (input === null || input !== groupedInput) {
            endInputEdit();
            past.push($state.snapshot(chord));
        }

        groupedInput = input;
        future = [];

        Object.assign(chord, changes);
    }

    function endInputEdit() {
        if (groupedInput && JSON.stringify(past.at(-1)) === JSON.stringify(chord)) {
            past.pop();
        }
        groupedInput = null;
    }

    function undo() {
        endInputEdit();
        const previous = past.pop();

        if (previous === undefined) {
            return;
        }

        future.push($state.snapshot(chord));
        chord = previous;
    }

    function redo() {
        endInputEdit();
        const latest = future.pop();

        if (latest === undefined) {
            return;
        }

        past.push($state.snapshot(chord));
        chord = latest;
    }

    function handleDownload(format: "SVG" | "PNG", width: number) {
        if (svg === "") {
            return;
        }

        if (format === "SVG") {
            downloadSvg(svg);
        } else {
            downloadPng(svg, width).catch(console.error);
        }
    }

    async function handleCopy(format: "SVG" | "PNG", width: number) {
        if (svg === "") {
            return;
        }

        try {
            if (format === "SVG") {
                await copySvg(svg);
            } else {
                await copyPng(svg, width);
            }

            showCopyToast("Copied!");
        } catch (error) {
            console.error(error);
        }
    }
</script>

<svelte:window
    onfocusin={endInputEdit}
    onfocusout={endInputEdit}
    onkeydown={(event) => {
        if (event.defaultPrevented || event.isComposing) {
            return;
        }

        if (
            (event.metaKey || event.ctrlKey) &&
            !event.altKey &&
            event.key.toLowerCase() === "z"
        ) {
            const target = event.target;

            if (
                target instanceof HTMLElement &&
                (target.closest('input, textarea, select, [role="menu"], [aria-haspopup="menu"]') ||
                    target.isContentEditable)
            ) {
                return;
            }

            event.preventDefault();

            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }

            return;
        }

        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            event.target.blur();
        }
    }}
/>

{#key data.chord}
<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    <Menu
        {chord}
        onChordChange={updateChord}
        onStylingPreview={(styling) => { stylingPreview = styling; }}
        isOpen={menuOpen}
        onToggle={() => {
            menuOpen = !menuOpen;
        }}
    />
    <div
        class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
        style:padding-bottom={toolbarOpen ? "0.5rem" : "0rem"}
    >
        <Header />
        <div class="divider mt-0 mb-3.5 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5" aria-hidden="true"></div>
        <Content
            chord={stylingPreview ? { ...chord, styling: stylingPreview } : chord}
            onChordChange={updateChord}
            onSvgChange={handleSvgChange}
            isMaximized={!menuOpen && !toolbarOpen}
            onMaximize={() => {
                const openBoth = !menuOpen && !toolbarOpen;
                menuOpen = openBoth;
                toolbarOpen = openBoth;
            }}
        />
        <div class="relative shrink-0">
            <div
                class="toast toast-end pointer-events-none absolute right-0 bottom-full z-50 mb-3 p-0"
                role="status"
                aria-live="polite"
            >
                {#if copyMessage}
                    <div
                        class="alert animate-none rounded-xl border-0 bg-neutral px-4 py-3 text-sm font-medium text-neutral-content shadow-lg"
                        in:toastSlide={{ x: 48 }}
                        out:toastSlide={{ x: 48 }}
                    >
                        <span>{copyMessage}</span>
                    </div>
                {/if}
            </div>
            <Toolbar
                {svg}
                isOpen={toolbarOpen}
                onToggle={() => {
                    toolbarOpen = !toolbarOpen;
                }}
                onChordChange={updateChord}
                onUndo={undo}
                canUndo={past.length > 0}
                onRedo={redo}
                canRedo={future.length > 0}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onShare={handleShare}
                canDownload={svg !== ""}
            />
        </div>
    </div>
</div>
{/key}
