<script lang="ts">
  import { tick } from "svelte";
  import Header from "#lib/components/Header.svelte";
  import ChartMenu from "#lib/components/Menu/ChartMenu.svelte";
  import Menu from "#lib/components/Menu/Menu.svelte";
  import ChartGrid from "#lib/components/Content/ChartGrid.svelte";
  import Toolbar from "#lib/components/Toolbar.svelte";
  import ConfirmModal from "#lib/components/ConfirmModal.svelte";
  import { createChartChord, createDefaultChart } from "#lib/chart.ts";
  import { resetChordStyling } from "#lib/chord.ts";
  import type { Chord, ChordChart } from "#lib/types.ts";
  import { blurInputOnEnter } from "#lib/utils.ts";

  let chart = $state(createDefaultChart());
  let menuOpen = $state(true);
  let toolbarOpen = $state(true);
  let selectedChordId = $state<string | null>(null);
  let chordPreview = $state<Partial<Chord> | null>(null);
  let selectedChord = $derived(findChord(selectedChordId));
  let confirmModal: ConfirmModal;

  function findChord(id: string | null) {
    return chart.slots.flat().find((slot) => slot?.id === id) ?? null;
  }

  async function selectChord(id: string | null) {
    if (id === selectedChordId) return;
    for (const popup of document.querySelectorAll<HTMLElement>(
      "[popover]:popover-open",
    )) {
      popup.hidePopover();
    }
    selectedChordId = id;
    chordPreview = null;
    if (id !== null) {
      await tick();
      if (selectedChordId === id) {
        document
          .querySelector<HTMLElement>(`[data-chart-chord="${id}"]`)
          ?.focus({ preventScroll: true });
      }
    }
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

  function resetStyling(id: string) {
    const slot = findChord(id);
    if (slot)
      updateChord(id, resetChordStyling(slot.chord, chart.settings.styling));
  }

  function clearChart() {
    function clear() {
      selectChord(null);
      updateChart(createDefaultChart());
    }

    if (chart.slots.some((row) => row.some((slot) => slot !== null))) {
      confirmModal.show({
        title: "Clear chart?",
        message: "This will remove all chords and reset the chart settings.",
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
                (_, column) => chart.slots[row]?.[column] ?? null,
              ),
            ),
        };
      }

      Object.assign(chart, changes);
      if (selectedChordId && !findChord(selectedChordId)) selectChord(null);
    }

    const removedChords = changes.slots
      ? 0
      : chart.slots.reduce(
          (count, row, rowIndex) =>
            count +
            row.filter(
              (slot, columnIndex) =>
                slot !== null && (rowIndex >= rows || columnIndex >= columns),
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
  onkeydown={blurInputOnEnter}
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
    <main
      data-chart-workspace
      aria-label="Chord chart workspace"
      class="flex min-h-0 min-w-0 flex-1 overflow-auto p-2"
    >
      <ChartGrid
        {chart}
        {selectedChordId}
        {chordPreview}
        onChartChange={updateChart}
        onAddChord={addChord}
        onSelectChord={selectChord}
        onChordChange={updateChord}
      />
    </main>
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
