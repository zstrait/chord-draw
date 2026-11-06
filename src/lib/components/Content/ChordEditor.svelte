<script lang="ts">
    import { tick } from "svelte";
    import type { Barre, Chord, HoverTarget } from "#lib/types.ts";
    import ChordDrawing from "./ChordDrawing.svelte";
    import ChordOverlay from "./ChordOverlay.svelte";
    import MarkerMenu from "./MarkerMenu.svelte";

    type Props = {
        heading: string;
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { heading, chord, onChordChange }: Props = $props();

    type SelectedMarker = {
        kind: "note" | "barre";
        index: number;
    };

    let hoverTargets = $state<HoverTarget[]>([]);
    let showTargets = $state(false);
    let selectedMarker = $state<SelectedMarker | null>(null);
    let menuPosition = $state({ x: 0, y: 0 });

    let menuContainer: HTMLDivElement | undefined;

    function handleTargetsChange(targets: HoverTarget[]) {
        hoverTargets = targets;
    }

    function handleNoteClick(stringIndex: number, fret: number) {
        const barres = chord.barres.filter(
            (barre) =>
                barre.fret === null ||
                barre.fret < fret ||
                stringIndex < Math.min(barre.startString, barre.endString) ||
                stringIndex > Math.max(barre.startString, barre.endString),
        );
        const replacesBarre = barres.length !== chord.barres.length;

        onChordChange({
            barres,
            strings: chord.strings.map((note, index) => {
                if (index === stringIndex) {
                    const nextFret =
                        !replacesBarre && note.fret === fret ? null : fret;

                    return {
                        ...note,
                        fret: nextFret,
                        markerText: null,
                    };
                }

                return note;
            }),
        });
    }

    function handleStringClick(stringIndex: number) {
        onChordChange({
            strings: chord.strings.map((note, index) => {
                if (index === stringIndex) {
                    return {
                        ...note,
                        fret:
                            note.fret === 0 ? -1 : note.fret === -1 ? null : 0,
                    };
                }

                return note;
            }),
        });
    }

    function handleBarreCreate(barre: Barre) {
        const { fret, startString, endString } = barre;

        if (fret === null || startString === endString) {
            return;
        }

        onChordChange({
            strings: chord.strings.map((note, index) => {
                if (
                    index >= startString &&
                    index <= endString &&
                    note.fret !== null &&
                    note.fret <= fret
                ) {
                    return { ...note, fret: null, markerText: null };
                }

                return note;
            }),
            barres: [
                ...chord.barres.filter(
                    (barre) =>
                        barre.fret !== fret ||
                        Math.max(barre.startString, barre.endString) <
                            startString ||
                        Math.min(barre.startString, barre.endString) >
                            endString,
                ),
                barre,
            ],
        });
    }

    async function openMarkerMenu(event: MouseEvent, marker: SelectedMarker) {
        menuPosition = {
            x: event.clientX,
            y: event.clientY,
        };
        selectedMarker = marker;

        await tick();

        if (!menuContainer) {
            return;
        }

        const { width, height } = menuContainer.getBoundingClientRect();

        menuPosition = {
            x: Math.max(
                8,
                Math.min(event.clientX, window.innerWidth - width - 8),
            ),
            y: Math.max(
                8,
                Math.min(event.clientY, window.innerHeight - height - 8),
            ),
        };
    }

    function handleMarkerContextMenu(event: MouseEvent, target: HoverTarget) {
        event.preventDefault();

        if (target.kind !== "note") {
            return;
        }

        const note = chord.strings[target.stringIndex];

        if (note.fret === target.fret) {
            openMarkerMenu(event, {
                kind: "note",
                index: target.stringIndex,
            });
            return;
        }
        const barreIndex = chord.barres.findIndex(
            (barre) =>
                barre.fret === target.fret &&
                target.stringIndex >=
                    Math.min(barre.startString, barre.endString) &&
                target.stringIndex <=
                    Math.max(barre.startString, barre.endString),
        );

        if (barreIndex !== -1) {
            openMarkerMenu(event, {
                kind: "barre",
                index: barreIndex,
            });
        }
    }

    function handleMarkerSelect(text: string | null) {
        const marker = selectedMarker;

        if (marker === null) {
            return;
        }

        if (marker.kind === "note") {
            onChordChange({
                strings: chord.strings.map((note, index) => {
                    if (index === marker.index) {
                        return { ...note, markerText: text };
                    }

                    return note;
                }),
            });
        } else {
            onChordChange({
                barres: chord.barres.map((barre, index) => {
                    if (index === marker.index) {
                        return { ...barre, markerText: text };
                    }

                    return barre;
                }),
            });
        }

        selectedMarker = null;
    }
</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <label class="flex items-center gap-2 px-4 text-sm">
        <input
            type="checkbox"
            class="checkbox checkbox-xs"
            bind:checked={showTargets}
        />
        Show hover targets (draft)
    </label>
    {#if chord.styling.style === "handdrawn"}
        <p class="px-4 text-sm">
            Switch to Normal style to try the hover draft.
        </p>
    {/if}
    <div
        class="border border-green-500 w-110 h-140 rounded-xl flex flex-col justify-end pb-12"
    >
        <div class="relative">
            <ChordDrawing {chord} onTargetsChange={handleTargetsChange} />
            <ChordOverlay
                {hoverTargets}
                {showTargets}
                onNoteClick={handleNoteClick}
                onStringClick={handleStringClick}
                onBarreCreate={handleBarreCreate}
                onMarkerContextMenu={handleMarkerContextMenu}
            />
        </div>
    </div>
    {#if selectedMarker !== null}
        <div
            class="fixed z-50 w-max max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-auto"
            style:left={`${menuPosition.x}px`}
            style:top={`${menuPosition.y}px`}
            bind:this={menuContainer}
        >
            <MarkerMenu
                onSelect={handleMarkerSelect}
                onClose={() => {
                    selectedMarker = null;
                }}
            />
        </div>
    {/if}
</div>
