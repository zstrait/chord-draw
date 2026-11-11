<script lang="ts">
    import { tick } from "svelte";
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
    import type { Chord, ChordChart } from "#lib/types.ts";
    import { blurInputOnEnter } from "#lib/utils.ts";

    let chart = $state(createDefaultChart());
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
    let selectedChordId = $state<string | null>(null);
    let isChordFocused = $state(false);
    let chordPreview = $state<Partial<Chord> | null>(null);
    let chartPreview = $state<Partial<Chord> | null>(null);
    let selectedChord = $derived(findChord(selectedChordId));
    let confirmModal: ConfirmModal;

    function findChord(id: string | null) {
        return chart.slots.flat().find((slot) => slot?.id === id) ?? null;
    }

    async function selectChord(id: string | null) {
        if (id === null) isChordFocused = false;
        if (id === selectedChordId) return;
        for (const popup of document.querySelectorAll<HTMLElement>(
            "[popover]:popover-open",
        )) {
            popup.hidePopover();
        }
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

    function handleKeydown(event: KeyboardEvent) {
        blurInputOnEnter(event);
        if (
            event.key !== "Enter" ||
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
        if (selectedChord) {
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
            target instanceof Element &&
            target.closest("[data-chart-workspace]") &&
            !target.closest("[data-chart-chord], button, [popover]")
        )
            selectChord(null);
    }}
/>

<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    {#if selectedChord}
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
        <Header />
        <div
            class="divider mt-0 mb-3.5 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5"
            aria-hidden="true"
        ></div>
        {#if isChordFocused && selectedChord}
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
                data-chart-workspace
                aria-label="Chord chart workspace"
                class="-mr-2 flex min-h-0 min-w-0 flex-1 justify-center-safe overflow-auto py-2 pr-4 transition-[margin-left,padding-left] duration-300 ease-in-out motion-reduce:transition-none"
                style:margin-left={menuOpen ? "-1rem" : "-3rem"}
                style:padding-left={menuOpen ? "1.5rem" : "3.5rem"}
            >
                <div
                    class="flex min-h-full min-w-full shrink-0 items-center-safe"
                >
                    <div
                        class="flex min-h-full flex-1 items-center-safe justify-center"
                    >
                        <ChartGrid
                            {chart}
                            {selectedChordId}
                            {chordPreview}
                            {chartPreview}
                            onChartChange={updateChart}
                            onAddChord={addChord}
                            onSelectChord={selectChord}
                            onRemoveChord={removeChord}
                            onFocusChord={focusChord}
                            onChordChange={updateChord}
                        />
                    </div>
                    <WorkspaceControls
                        rotation={selectedChord?.chord.rotation ??
                            chart.settings.rotation}
                        isMaximized={!menuOpen && !toolbarOpen}
                        onMaximize={toggleMaximize}
                        onRotate={rotate}
                        rotateLabel={selectedChord
                            ? "Rotate active chord 90 degrees clockwise"
                            : "Rotate all chords 90 degrees clockwise"}
                        showChartActions
                    />
                </div>
            </main>
        {/if}
        <Toolbar
            subject="chart"
            isOpen={toolbarOpen}
            onToggle={() => {
                toolbarOpen = !toolbarOpen;
            }}
            onClear={clearChart}
        />
    </div>
</div>

<ConfirmModal bind:this={confirmModal} />
