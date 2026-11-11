<script lang="ts">
    import { onDestroy, tick, untrack } from "svelte";
    import Header from "#lib/components/Header.svelte";
    import ChartMenu from "#lib/components/Menu/ChartMenu.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import ChartGrid from "#lib/components/Content/ChartGrid.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import WorkspaceControls from "#lib/components/Content/WorkspaceControls.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";
    import ConfirmModal from "#lib/components/ConfirmModal.svelte";
    import {
        createChartChord,
        createDefaultChart,
        getChartDisplayChord,
    } from "#lib/chart.ts";
    import { resetChordStyling } from "#lib/chord.ts";
    import { renderChartSvg } from "#lib/chart-export.ts";
    import { copyPng, copySvg, downloadPng, downloadSvg } from "#lib/export.ts";
    import type { Chord, ChordChart, ChartSlotPosition } from "#lib/types.ts";
    import { blurInputOnEnter } from "#lib/utils.ts";
    import { handleKeybind } from "#lib/keybinds.ts";

    let chart = $state(createDefaultChart());
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
    let header = $state<ReturnType<typeof Header>>();
    let toolbar = $state<ReturnType<typeof Toolbar>>();
    let selectedChordId = $state<string | null>(null);
    let isChordFocused = $state(false);
    let isMoveMode = $state(false);
    let isPreviewMode = $state(false);
    let chartSvg = $state("");
    let previewUrl = $state("");
    let isExporting = $state(false);
    let exportError = $state("");
    let exportMessage = $state("");
    let exportRevision = $state(0);
    let renderedRevision = -1;
    let rendering: Promise<void> | null = null;
    let exportTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    let workspace = $state<HTMLElement>();
    let gridScroll = { left: 0, top: 0 };
    let chordPreview = $state<Partial<Chord> | null>(null);
    let chartPreview = $state<Partial<Chord> | null>(null);
    let selectedChord = $derived(findChord(selectedChordId));
    let hasEmptySlots = $derived(
        chart.slots.some((row) => row.some((slot) => slot === null)),
    );
    let confirmModal: ConfirmModal;

    $effect(() => {
        if (!isPreviewMode) return;
        exportRevision;
        untrack(getChartSvg).catch(reportExportError);
    });

    $effect(() => {
        if (!isPreviewMode || !chartSvg) {
            previewUrl = "";
            return;
        }
        const url = URL.createObjectURL(
            new Blob([chartSvg], { type: "image/svg+xml" }),
        );
        previewUrl = url;
        return () => URL.revokeObjectURL(url);
    });

    onDestroy(() => {
        disposed = true;
        clearTimeout(exportTimer);
    });

    async function getChartSvg(): Promise<string> {
        while (
            !disposed &&
            (renderedRevision !== exportRevision || !chartSvg)
        ) {
            if (rendering) {
                await rendering;
                continue;
            }
            const revision = exportRevision;
            isExporting = true;
            exportError = "";
            rendering = renderChartSvg($state.snapshot(chart))
                .then((svg) => {
                    if (!disposed && revision === exportRevision) {
                        chartSvg = svg;
                        renderedRevision = revision;
                    }
                })
                .catch((error) => {
                    if (!disposed)
                        exportError =
                            "Could not generate the chart preview. Please try again.";
                    throw error;
                })
                .finally(() => {
                    rendering = null;
                    if (!disposed) isExporting = false;
                });
            await rendering;
        }
        return disposed ? "" : chartSvg;
    }

    async function togglePreview() {
        if (!isPreviewMode) {
            if (workspace)
                gridScroll = {
                    left: workspace.scrollLeft,
                    top: workspace.scrollTop,
                };
            isMoveMode = false;
            isPreviewMode = true;
            await tick();
            workspace?.scrollTo({ left: 0, top: 0, behavior: "instant" });
        } else {
            isPreviewMode = false;
            await tick();
            workspace?.scrollTo({ ...gridScroll, behavior: "instant" });
        }
    }

    function showExportMessage(message: string) {
        if (disposed) return;
        clearTimeout(exportTimer);
        exportMessage = message;
        exportTimer = setTimeout(() => {
            exportMessage = "";
        }, 2500);
    }

    function reportExportError(error: unknown) {
        console.error(error);
        showExportMessage("Could not export the chart. Please try again.");
    }

    async function handleDownload(format: "SVG" | "PNG", width: number) {
        try {
            const svg = await getChartSvg();
            if (!svg) return;
            if (format === "SVG") downloadSvg(svg, "chart.svg");
            else await downloadPng(svg, width, "chart.png");
        } catch (error) {
            reportExportError(error);
        }
    }

    async function handleCopy(format: "SVG" | "PNG", width: number) {
        try {
            const svg =
                renderedRevision === exportRevision && chartSvg
                    ? chartSvg
                    : getChartSvg();
            if (format === "SVG") await copySvg(svg);
            else await copyPng(svg, width);
            showExportMessage("Copied!");
        } catch (error) {
            reportExportError(error);
        }
    }

    function findChord(id: string | null) {
        return chart.slots.flat().find((slot) => slot?.id === id) ?? null;
    }

    async function selectChord(id: string | null) {
        if (id === null) isChordFocused = false;
        for (const popup of document.querySelectorAll<HTMLElement>(
            "[popover]:popover-open",
        )) {
            popup.hidePopover();
        }
        if (id === selectedChordId) return;
        selectedChordId = id;
        chordPreview = null;
        await focusSelectedChord();
    }

    async function focusSelectedChord(preventScroll = true) {
        const id = selectedChordId;
        await tick();
        if (id !== null && selectedChordId === id)
            document
                .querySelector<HTMLElement>(`[data-chart-chord="${id}"]`)
                ?.focus({ preventScroll });
    }

    function focusChord(id: string) {
        isChordFocused = true;
        if (id === selectedChordId) focusSelectedChord();
        else selectChord(id);
    }

    function backToChart() {
        isChordFocused = false;
        focusSelectedChord(false);
    }

    function toggleMaximize() {
        const openBoth = !menuOpen && !toolbarOpen;
        menuOpen = openBoth;
        toolbarOpen = openBoth;
    }

    function toggleMoveMode() {
        if (isPreviewMode) return;
        isMoveMode = !isMoveMode;
        if (isMoveMode) selectChord(null);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.defaultPrevented || event.isComposing) return;
        const activeChord =
            !isPreviewMode && !isMoveMode ? selectedChord : null;
        const canNavigate = !!activeChord && !isChordFocused;
        if (
            handleKeybind(event, {
                move: toggleMoveMode,
                preview: togglePreview,
                rotate,
                maximize: toggleMaximize,
                fill: fillEmptySlots,
                theme: () => header?.toggleTheme(),
                download: () => toolbar?.download(),
                copy: () => toolbar?.copy(),
                clear: clearChart,
                menu: () => {
                    menuOpen = !menuOpen;
                },
                toolbar: () => {
                    toolbarOpen = !toolbarOpen;
                },
                addColumn: () => resizeChart("columns", 1),
                removeColumn: () => resizeChart("columns", -1),
                addRow: () => resizeChart("rows", 1),
                removeRow: () => resizeChart("rows", -1),
                focus: activeChord
                    ? () => focusChord(activeChord.id)
                    : undefined,
                remove: activeChord
                    ? () => removeChord(activeChord.id)
                    : undefined,
                left: canNavigate ? () => navigateChords(0, -1) : undefined,
                right: canNavigate ? () => navigateChords(0, 1) : undefined,
                up: canNavigate ? () => navigateChords(-1, 0) : undefined,
                down: canNavigate ? () => navigateChords(1, 0) : undefined,
            })
        )
            return;

        if (event.key === "Escape" && !event.isComposing && isPreviewMode) {
            event.preventDefault();
            togglePreview();
            return;
        }
        if (event.key === "Escape" && !event.isComposing && isMoveMode) {
            event.preventDefault();
            isMoveMode = false;
            return;
        }
        blurInputOnEnter(event);
        if (
            event.key !== "Enter" ||
            isPreviewMode ||
            event.defaultPrevented ||
            event.isComposing ||
            selectedChordId === null ||
            !(event.target instanceof Element) ||
            event.target.closest(
                "button, input, textarea, select, a, summary, [contenteditable], [role='button'], [role='menuitem']",
            ) ||
            document.querySelector(
                ".marker-menu, [popover]:popover-open, dialog[open]",
            )
        )
            return;

        event.preventDefault();
        selectChord(null);
    }

    function addChord(row: number, column: number) {
        if (chart.slots[row][column] !== null) return;
        const slot = createChartChord($state.snapshot(chart.settings));
        updateChart({
            slots: chart.slots.map((entries, rowIndex) =>
                entries.map((entry, columnIndex) =>
                    rowIndex === row && columnIndex === column ? slot : entry,
                ),
            ),
        });
        selectChord(slot.id);
    }

    function fillEmptySlots() {
        if (!hasEmptySlots) return;
        const settings = $state.snapshot(chart.settings);

        updateChart({
            slots: chart.slots.map((row) =>
                row.map((slot) => slot ?? createChartChord(settings)),
            ),
        });
    }

    function resizeChart(dimension: "rows" | "columns", change: number) {
        const value = chart[dimension] + change;
        if (value >= 1) updateChart({ [dimension]: value });
    }

    async function navigateChords(rowChange: number, columnChange: number) {
        if (!selectedChord) return;
        const row = chart.slots.findIndex((entries) =>
            entries.some((slot) => slot?.id === selectedChordId),
        );
        if (row < 0) return;
        const column = chart.slots[row].findIndex(
            (slot) => slot?.id === selectedChordId,
        );
        let nextRow = row + rowChange;
        let nextColumn = column + columnChange;
        while (
            nextRow >= 0 &&
            nextRow < chart.rows &&
            nextColumn >= 0 &&
            nextColumn < chart.columns &&
            !chart.slots[nextRow]?.[nextColumn]
        ) {
            nextRow += rowChange;
            nextColumn += columnChange;
        }
        const next = chart.slots[nextRow]?.[nextColumn];
        if (!next) return;
        await selectChord(next.id);
        if (selectedChordId === next.id)
            document
                .querySelector<HTMLElement>(`[data-chart-chord="${next.id}"]`)
                ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    function moveChord(from: ChartSlotPosition, to: ChartSlotPosition) {
        if (
            !chart.slots[from.row]?.[from.column] ||
            chart.slots[to.row]?.[to.column] === undefined ||
            (from.row === to.row && from.column === to.column)
        )
            return;

        const slots = chart.slots.map((row) => [...row]);
        [slots[from.row][from.column], slots[to.row][to.column]] = [
            slots[to.row][to.column],
            slots[from.row][from.column],
        ];
        updateChart({ slots });
    }

    function updateChord(id: string, changes: Partial<Chord>) {
        const slot = findChord(id);
        if (!slot) return;
        updateChart({
            slots: chart.slots.map((row) =>
                row.map((entry) =>
                    entry?.id === id
                        ? { ...entry, chord: { ...entry.chord, ...changes } }
                        : entry,
                ),
            ),
        });
    }

    function removeChord(id: string) {
        updateChart({
            slots: chart.slots.map((row) =>
                row.map((slot) => (slot?.id === id ? null : slot)),
            ),
        });
    }

    function rotate() {
        if (selectedChord && !isPreviewMode) {
            updateChord(selectedChord.id, {
                rotation: (selectedChord.chord.rotation + 90) % 360,
            });
        } else {
            updateChart({
                settings: {
                    ...chart.settings,
                    rotation: (chart.settings.rotation + 90) % 360,
                },
                slots: chart.slots.map((row) =>
                    row.map((slot) =>
                        slot
                            ? {
                                  ...slot,
                                  chord: {
                                      ...slot.chord,
                                      rotation:
                                          (slot.chord.rotation + 90) % 360,
                                  },
                              }
                            : null,
                    ),
                ),
            });
        }
    }

    function resetStyling(id: string) {
        const slot = findChord(id);
        if (slot)
            updateChord(
                id,
                resetChordStyling(slot.chord, chart.settings.styling),
            );
    }

    function clearChart() {
        function clear() {
            isMoveMode = false;
            selectChord(null);
            updateChart(createDefaultChart());
        }

        if (chart.slots.some((row) => row.some((slot) => slot !== null))) {
            confirmModal.show({
                title: "Clear chart?",
                message:
                    "This will remove all chords and reset the chart settings.",
                confirmLabel: "Clear chart",
                wide: true,
                onConfirm: clear,
            });
        } else {
            clear();
        }
    }

    function updateChart(changes: Partial<ChordChart>) {
        const rows = changes.rows ?? chart.rows;
        const columns = changes.columns ?? chart.columns;

        function applyChanges() {
            if (rows !== chart.rows || columns !== chart.columns) {
                changes = {
                    ...changes,
                    slots:
                        changes.slots ??
                        Array.from({ length: rows }, (_, row) =>
                            Array.from(
                                { length: columns },
                                (_, column) =>
                                    chart.slots[row]?.[column] ?? null,
                            ),
                        ),
                };
            }

            Object.assign(chart, changes);
            exportRevision++;
            if (selectedChordId && !findChord(selectedChordId))
                selectChord(null);
        }

        const removedChords = changes.slots
            ? 0
            : chart.slots.reduce(
                  (count, row, rowIndex) =>
                      count +
                      row.filter(
                          (slot, columnIndex) =>
                              slot !== null &&
                              (rowIndex >= rows || columnIndex >= columns),
                      ).length,
                  0,
              );
        if (removedChords > 0) {
            const area =
                rows < chart.rows && columns < chart.columns
                    ? "rows and columns"
                    : rows < chart.rows
                      ? chart.rows - rows === 1
                          ? "row"
                          : "rows"
                      : chart.columns - columns === 1
                        ? "column"
                        : "columns";
            confirmModal.show({
                title: `Remove ${area}?`,
                message: `There ${removedChords === 1 ? "is a chord" : `are ${removedChords} chords`} in the ${area} you’re removing.\n${removedChords === 1 ? "This chord" : "These chords"} will be deleted.`,
                confirmLabel: `Remove ${area}`,
                onConfirm: applyChanges,
            });
        } else {
            applyChanges();
        }
    }
</script>

<svelte:window
    onkeydown={handleKeydown}
    onpointerdown={(event) => {
        const target = event.target;
        if (
            !isPreviewMode &&
            target instanceof Element &&
            target.closest("[data-chart-workspace]") &&
            !target.closest("[data-chart-chord], button, [popover]")
        )
            selectChord(null);
    }}
/>

<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    {#if selectedChord && !isPreviewMode}
        {#key selectedChord.id}
            {@const id = selectedChord.id}
            <Menu
                chord={selectedChord.chord}
                chartChord
                onChordChange={(changes) => updateChord(id, changes)}
                onChordPreview={(changes) => {
                    if (selectedChordId === id) chordPreview = changes;
                }}
                onResetStyling={() => resetStyling(id)}
                isOpen={menuOpen}
                onToggle={() => {
                    menuOpen = !menuOpen;
                }}
            />
        {/key}
    {:else}
        <ChartMenu
            {chart}
            onChartChange={updateChart}
            onChartPreview={(changes) => {
                chartPreview = changes;
            }}
            isOpen={menuOpen}
            onToggle={() => {
                menuOpen = !menuOpen;
            }}
        />
    {/if}
    <div
        class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
        style:padding-bottom={toolbarOpen ? "0.5rem" : "0rem"}
    >
        <Header bind:this={header} />
        <div
            class="divider m-0 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5"
            aria-hidden="true"
        ></div>
        {#if isChordFocused && selectedChord && !isPreviewMode}
            {@const id = selectedChord.id}
            <div
                role="region"
                aria-label="Focused chord"
                tabindex="-1"
                data-chart-chord={id}
                class="flex min-h-0 min-w-0 flex-1 outline-none"
            >
                <Content
                    chord={getChartDisplayChord(
                        chordPreview
                            ? { ...selectedChord.chord, ...chordPreview }
                            : selectedChord.chord,
                        chart.settings,
                    )}
                    sidebarOpen={menuOpen}
                    onChordChange={(changes) => updateChord(id, changes)}
                    onBack={backToChart}
                    isMaximized={!menuOpen && !toolbarOpen}
                    onMaximize={toggleMaximize}
                />
            </div>
        {:else}
            <main
                bind:this={workspace}
                data-chart-workspace
                aria-label="Chord chart workspace"
                class="-mr-2 flex min-h-0 min-w-0 flex-1 justify-center-safe overflow-auto pt-5.5 pr-4 pb-2 transition-[margin-left,padding-left] duration-300 ease-in-out motion-reduce:transition-none"
                style:margin-left={menuOpen ? "-1rem" : "-3rem"}
                style:padding-left={menuOpen ? "1.5rem" : "3.5rem"}
            >
                <div
                    class="flex min-h-full min-w-full shrink-0 items-center-safe"
                >
                    <div
                        class="flex min-h-full flex-1 items-center-safe justify-center"
                    >
                        {#if isPreviewMode}
                            <div class="shrink-0 p-4" aria-busy={isExporting}>
                                {#if previewUrl}
                                    <img
                                        src={previewUrl}
                                        alt="Chart export preview"
                                        class="max-w-none rounded-xl bg-white shadow-sm"
                                    />
                                {:else if exportError}
                                    <p
                                        role="alert"
                                        class="text-sm text-base-content"
                                    >
                                        {exportError}
                                    </p>
                                {:else}
                                    <p
                                        role="status"
                                        class="text-sm text-base-content/70"
                                    >
                                        Preparing preview…
                                    </p>
                                {/if}
                            </div>
                        {:else}
                            <ChartGrid
                                {chart}
                                {selectedChordId}
                                {chordPreview}
                                {chartPreview}
                                {isMoveMode}
                                onChartChange={updateChart}
                                onAddChord={addChord}
                                onSelectChord={selectChord}
                                onRemoveChord={removeChord}
                                onFocusChord={focusChord}
                                onChordChange={updateChord}
                                onMoveChord={moveChord}
                            />
                        {/if}
                    </div>
                    <WorkspaceControls
                        rotation={!isPreviewMode && selectedChord
                            ? selectedChord.chord.rotation
                            : chart.settings.rotation}
                        isMaximized={!menuOpen && !toolbarOpen}
                        onMaximize={toggleMaximize}
                        onRotate={rotate}
                        rotateLabel={selectedChord && !isPreviewMode
                            ? "Rotate active chord 90 degrees clockwise"
                            : "Rotate all chords 90 degrees clockwise"}
                        showChartActions
                        onFillEmptySlots={fillEmptySlots}
                        {hasEmptySlots}
                        {isMoveMode}
                        onToggleMove={toggleMoveMode}
                        {isPreviewMode}
                        onTogglePreview={togglePreview}
                    />
                </div>
            </main>
        {/if}
        <div class="relative shrink-0">
            {#if exportMessage}
                <div
                    class="toast toast-end pointer-events-none absolute right-0 bottom-full z-50 mb-3 p-0"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        class="alert rounded-xl border-0 bg-neutral px-4 py-3 text-sm font-medium text-neutral-content shadow-lg"
                    >
                        {exportMessage}
                    </div>
                </div>
            {/if}
            <Toolbar
                bind:this={toolbar}
                subject="chart"
                isOpen={toolbarOpen}
                onToggle={() => {
                    toolbarOpen = !toolbarOpen;
                }}
                onClear={clearChart}
                svg={chartSvg}
                onCopy={handleCopy}
                onDownload={handleDownload}
                canDownload={!isExporting}
            />
        </div>
    </div>
</div>

<ConfirmModal bind:this={confirmModal} />
