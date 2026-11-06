<script lang="ts">
    import Header from "#lib/components/Header.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";
    import { downloadSvg, downloadPng, copySvg, copyPng } from "#lib/export.ts";

    let chord = $state(createDefaultChord());

    let past = $state<Chord[]>([]);
    let future = $state<Chord[]>([]);
    let svg = $state("");
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
    let groupedInput: HTMLInputElement | null = null;

    function handleSvgChange(value: string) {
        svg = value;
        console.log(value.slice(0, 200));
    }

    function updateChord(
        changes: Partial<Chord>,
        input: HTMLInputElement | null = null,
    ) {
        if (input === null || input !== groupedInput) {
            past.push($state.snapshot(chord));
        }

        groupedInput = input;
        future = [];

        Object.assign(chord, changes);
    }

    function endInputEdit() {
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

    function handleCopy(format: "SVG" | "PNG", width: number) {
        if (svg === "") {
            return;
        }

        if (format === "SVG") {
            copySvg(svg).catch(console.error);
        } else {
            copyPng(svg, width).catch(console.error);
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
                (target.closest("input, textarea, select") ||
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

<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    <Menu
        {chord}
        onChordChange={updateChord}
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
        <Content
            {chord}
            onChordChange={updateChord}
            onSvgChange={handleSvgChange}
        />
        <Toolbar
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
            canDownload={svg !== ""}
        />
    </div>
</div>
