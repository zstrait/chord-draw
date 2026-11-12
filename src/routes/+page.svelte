<script lang="ts">
    import { untrack } from "svelte";
    import Header from "#lib/components/Header.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";
    import Toast from "#lib/components/Toast.svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";
    import type { PageProps } from "./$types";
    import { encodeChord, decodeChord } from "#lib/share.ts";
    import { downloadSvg, downloadPng, copySvg, copyPng } from "#lib/export.ts";
    import { blurInputOnEnter } from "#lib/utils.ts";
    import { handleKeybind } from "#lib/keybinds.ts";

    let { data }: PageProps = $props();
    const autosaveKey = "chorddraw-chord-v1";
    const historyKey = "chorddraw-history-v1";
    const historyLimit = 50;
    let autosaveReady = $state(false);
    let sessionSource = $state<string | null>(null);
    let firstLoad = true;
    let chord = $state(untrack(() => $state.snapshot(data.chord)));
    let chordPreview = $state<Partial<Chord> | null>(null);

    let past = $state<Chord[]>([]);
    let future = $state<Chord[]>([]);
    let svg = $state("");
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
    let header = $state<ReturnType<typeof Header>>();
    let content = $state<ReturnType<typeof Content>>();
    let toolbar = $state<ReturnType<typeof Toolbar>>();
    let toast = $state<ReturnType<typeof Toast>>();
    let groupedInput: HTMLInputElement | null = null;

    $effect.pre(() => {
        const initial = data.chord;
        const shared = data.hasSharedChord;
        untrack(() => {
            chord = $state.snapshot(initial);
            if (!shared) {
                try {
                    const saved = localStorage.getItem(autosaveKey);
                    if (saved !== null)
                        chord = decodeChord(new URLSearchParams(saved));
                } catch {}
            }
            past = [];
            future = [];
            sessionSource = shared ? encodeChord(initial).toString() : null;
            const navigation = performance.getEntriesByType("navigation")[0] as
                PerformanceNavigationTiming | undefined;
            if (!shared || (firstLoad && navigation?.type === "reload")) {
                restoreHistory(sessionSource);
            }
            firstLoad = false;
            groupedInput = null;
            chordPreview = null;
            autosaveReady = true;
        });
    });

    $effect(() => {
        if (!autosaveReady) return;
        const saved = encodeChord(chord).toString();
        try {
            localStorage.setItem(autosaveKey, saved);
        } catch {}
        const history = JSON.stringify({
            source: sessionSource,
            chord: saved,
            past: past
                .slice(-historyLimit)
                .map((entry) => encodeChord(entry).toString()),
            future: future
                .slice(-historyLimit)
                .map((entry) => encodeChord(entry).toString()),
        });
        try {
            sessionStorage.setItem(historyKey, history);
        } catch {
            try {
                sessionStorage.removeItem(historyKey);
            } catch {}
        }
    });

    function restoreHistory(source: string | null) {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(historyKey) ?? "null",
            );
            if (
                !saved ||
                saved.source !== source ||
                typeof saved.chord !== "string" ||
                !Array.isArray(saved.past) ||
                !saved.past.every(
                    (entry: unknown) => typeof entry === "string",
                ) ||
                !Array.isArray(saved.future) ||
                !saved.future.every(
                    (entry: unknown) => typeof entry === "string",
                )
            )
                return;

            function decode(value: string) {
                const restored = decodeChord(new URLSearchParams(value));
                if (encodeChord(restored).toString() !== value)
                    throw new Error("Invalid saved chord");
                return restored;
            }

            const current = decode(saved.chord);
            const previous = saved.past.slice(-historyLimit).map(decode);
            const next = saved.future.slice(-historyLimit).map(decode);
            chord = current;
            past = previous;
            future = next;
        } catch {}
    }

    function remember(stack: Chord[]) {
        stack.push($state.snapshot(chord));
        if (stack.length > historyLimit) stack.shift();
    }

    async function handleShare() {
        const url = new URL(window.location.href);
        url.search = encodeChord(chord).toString();
        url.hash = "";
        try {
            await navigator.clipboard.writeText(url.href);
            toast?.show("Link copied!", true);
        } catch (error) {
            console.error(error);
            toast?.show("Couldn’t copy link", true);
        }
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
            remember(past);
        }

        groupedInput = input;
        future = [];

        Object.assign(chord, changes);
    }

    function endInputEdit() {
        if (
            groupedInput &&
            JSON.stringify(past.at(-1)) === JSON.stringify(chord)
        ) {
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

        remember(future);
        chord = previous;
    }

    function redo() {
        endInputEdit();
        const latest = future.pop();

        if (latest === undefined) {
            return;
        }

        remember(past);
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

            toast?.show("Copied!");
        } catch (error) {
            console.error(error);
        }
    }

    function toggleMaximize() {
        const openBoth = !menuOpen && !toolbarOpen;
        menuOpen = openBoth;
        toolbarOpen = openBoth;
    }

    function clearChord() {
        updateChord(createDefaultChord());
    }

    function handleKeydown(event: KeyboardEvent) {
        if (
            handleKeybind(event, {
                rotate: () => content?.rotate(),
                maximize: toggleMaximize,
                theme: () => header?.toggleTheme(),
                download: () => toolbar?.download(),
                copy: () => toolbar?.copy(),
                share: () => toolbar?.share(),
                clear: clearChord,
                undo,
                redo,
                menu: () => {
                    menuOpen = !menuOpen;
                },
                toolbar: () => {
                    toolbarOpen = !toolbarOpen;
                },
            })
        )
            return;

        if (event.defaultPrevented || event.isComposing) return;
        blurInputOnEnter(event);
    }
</script>

<svelte:head>
    <link rel="canonical" href="https://chorddraw.com/" />
</svelte:head>

<svelte:window
    onfocusin={endInputEdit}
    onfocusout={endInputEdit}
    onkeydown={handleKeydown}
/>

{#key data.chord}
    <div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
        <Menu
            {chord}
            onChordChange={updateChord}
            onChordPreview={(changes) => {
                chordPreview = changes;
            }}
            isOpen={menuOpen}
            onToggle={() => {
                menuOpen = !menuOpen;
            }}
        />
        <div
            class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
            style:padding-bottom={toolbarOpen ? "0.5rem" : "0rem"}
        >
            <Header bind:this={header} />
            <div
                class="divider m-0 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5"
                aria-hidden="true"
            ></div>
            <Content
                bind:this={content}
                chord={chordPreview ? { ...chord, ...chordPreview } : chord}
                sidebarOpen={menuOpen}
                onChordChange={updateChord}
                onSvgChange={handleSvgChange}
                isMaximized={!menuOpen && !toolbarOpen}
                onMaximize={toggleMaximize}
            />
            <div class="relative shrink-0">
                <Toast bind:this={toast} />
                <Toolbar
                    bind:this={toolbar}
                    {svg}
                    isOpen={toolbarOpen}
                    onToggle={() => {
                        toolbarOpen = !toolbarOpen;
                    }}
                    onClear={clearChord}
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
