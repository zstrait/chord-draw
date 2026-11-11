<script lang="ts">
    import { tick } from "svelte";
    import type {
        Barre,
        Chord,
        HoverTarget,
        TitleTarget,
        TuningTarget,
    } from "#lib/types.ts";
    import { normalizeTuningNote } from "#lib/tunings.ts";
    import ChordDrawing from "./ChordDrawing.svelte";
    import ChordOverlay from "./ChordOverlay.svelte";
    import MarkerMenu from "./MarkerMenu.svelte";
    import TuningInput from "./TuningInput.svelte";

    type Props = {
        chord: Chord;
        rotation: number;
        active?: boolean;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onSvgChange?: (svg: string) => void;
    };

    let {
        chord,
        rotation,
        active = true,
        onChordChange,
        onSvgChange,
    }: Props = $props();

    type SelectedMarker = {
        kind: "note" | "barre";
        index: number;
    };

    let hoverTargets = $state<HoverTarget[]>([]);
    let selectedMarker = $state<SelectedMarker | null>(null);
    let currentMarker = $derived(
        selectedMarker === null
            ? undefined
            : selectedMarker.kind === "note"
              ? chord.strings[selectedMarker.index]
              : chord.barres[selectedMarker.index],
    );
    let colorPreview = $state<string | null>(null);
    let lastMarkerColor = $state<string | null>(null);
    let drawingChord = $derived.by(() => {
        const color = colorPreview;
        const marker = selectedMarker;
        if (color === null || marker === null) return chord;
        if (marker.kind === "note") {
            return {
                ...chord,
                strings: chord.strings.map((note, index) =>
                    index === marker.index ? { ...note, color } : note,
                ),
            };
        }
        return {
            ...chord,
            barres: chord.barres.map((barre, index) =>
                index === marker.index ? { ...barre, color } : barre,
            ),
        };
    });
    let menuPosition = $state({ x: 0, y: 0 });
    let menuContainer = $state<HTMLDivElement>();
    let drawingArea = $state<HTMLDivElement>();
    let titleTarget = $state<TitleTarget | null>(null);
    let tuningTargets = $state<TuningTarget[]>([]);
    let tuningInputs = $state<(ReturnType<typeof TuningInput> | undefined)[]>(
        [],
    );
    let editingTitle = $state(false);
    let titleInput = $state<HTMLInputElement>();
    let originalTitle = "";

    $effect(() => {
        if (!active) {
            editingTitle = false;
            selectedMarker = null;
            colorPreview = null;
        }
    });

    function tuningNavigation(index: number | null, direction: number) {
        const next = index === null ? -1 : index + direction;
        if (next < 0 || next >= chord.stringCount) return;
        return () => {
            tuningInputs[next]?.start();
        };
    }

    async function startTitleEdit() {
        originalTitle = chord.title;
        selectedMarker = null;
        editingTitle = true;
        await tick();
        titleInput?.focus({ preventScroll: true });
        titleInput?.select();
    }

    function finishTitleEdit(apply = true) {
        if (!editingTitle) return;
        editingTitle = false;
        if (!apply && chord.title !== originalTitle) {
            onChordChange({ title: originalTitle }, titleInput);
        }
    }

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
                        color: undefined,
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
                        color: undefined,
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
                    return {
                        ...note,
                        fret: null,
                        markerText: null,
                        color: undefined,
                    };
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

    function handleOutsideContextMenu(event: MouseEvent) {
        const bounds = drawingArea?.getBoundingClientRect();
        if (!bounds) return;
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const target = hoverTargets.find(
            (target) =>
                x >= target.x &&
                x <= target.x + target.width &&
                y >= target.y &&
                y <= target.y + target.height,
        );
        if (target) handleMarkerContextMenu(event, target);
    }

    function handleMarkerSelect(text: string | null) {
        const marker = selectedMarker;

        if (marker === null) {
            return;
        }

        if (!currentMarker || currentMarker.markerText === text) {
            selectedMarker = null;
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

    function handleMarkerColor(color: string | null) {
        const marker = selectedMarker;
        if (marker === null || !currentMarker) return;
        if (color !== null) lastMarkerColor = color;
        if (currentMarker.color === (color ?? undefined)) return;
        const update = <T extends { color?: string }>(
            item: T,
            index: number,
        ): T => {
            if (index !== marker.index) return item;
            const updated = { ...item };
            if (color === null) delete updated.color;
            else updated.color = color;
            return updated;
        };
        onChordChange(
            marker.kind === "note"
                ? { strings: chord.strings.map(update) }
                : { barres: chord.barres.map(update) },
        );
    }
</script>

<svelte:window
    onpointerdown={(event) => {
        if (editingTitle && event.target !== titleInput) finishTitleEdit();
    }}
/>

<div
    class="max-w-full shrink-0"
    style:width={rotation % 180 ? "35rem" : "27.5rem"}
>
    <div
        class="relative w-full rounded-xl border border-base-300 shadow-[0_4px_16px_rgb(30_45_67_/8%)]"
        style:background-color={chord.styling.backgroundColor === "transparent"
            ? "#FFFFFF"
            : chord.styling.backgroundColor}
        style:aspect-ratio={rotation % 180 ? "14 / 11" : "11 / 14"}
    >
        <div
            class="absolute inset-x-3 top-[10px] bottom-[18px] sm:top-[16px] sm:bottom-[26px]"
            bind:this={drawingArea}
            inert={!active}
        >
            <ChordDrawing
                chord={drawingChord}
                {rotation}
                {editingTitle}
                onTargetsChange={handleTargetsChange}
                onTitleTargetChange={(target) => {
                    titleTarget = target;
                }}
                onTuningTargetsChange={(targets) => {
                    tuningTargets = targets;
                }}
                {onSvgChange}
            />
            {#if titleTarget}
                <div
                    class="absolute"
                    class:z-20={editingTitle}
                    style:left={`${titleTarget.x}px`}
                    style:top={`${titleTarget.y}px`}
                    style:width={`${titleTarget.width}px`}
                    style:height={`${titleTarget.height}px`}
                    style:transform={`translate(-50%, -50%) rotate(${rotation}deg)`}
                >
                    {#if editingTitle}
                        <input
                            bind:this={titleInput}
                            value={chord.title}
                            type="text"
                            data-theme="light"
                            class="input h-full w-full rounded-md border-primary bg-base-100 px-2 text-center text-base-content shadow-none"
                            style:font-size={`${titleTarget.fontSize}px`}
                            style:font-family={titleTarget.fontFamily}
                            aria-label="Chord title"
                            oninput={(event) =>
                                onChordChange(
                                    { title: event.currentTarget.value },
                                    event.currentTarget,
                                )}
                            onblur={() => finishTitleEdit()}
                            onkeydown={(event) => {
                                if (event.isComposing) return;
                                if (
                                    event.key === "Enter" ||
                                    event.key === "Escape"
                                ) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    finishTitleEdit(event.key === "Enter");
                                }
                            }}
                        />
                    {:else}
                        <button
                            type="button"
                            class="h-full w-full cursor-text rounded-md border-0 bg-transparent p-0 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                            aria-label={chord.title
                                ? "Edit chord title"
                                : "Add chord title"}
                            onclick={startTitleEdit}
                        ></button>
                    {/if}
                </div>
            {/if}
            {#if chord.tuning.custom}
                {#each tuningTargets as target (target.stringIndex)}
                    <TuningInput
                        bind:this={
                            tuningInputs[
                                target.stringIndex ?? chord.stringCount
                            ]
                        }
                        {target}
                        {rotation}
                        value={target.stringIndex === null
                            ? chord.tuning.label
                            : chord.tuning.notes[target.stringIndex]}
                        label={target.stringIndex === null
                            ? "Tuning name"
                            : `String ${target.stringIndex + 1} tuning note`}
                        normalize={target.stringIndex === null
                            ? undefined
                            : normalizeTuningNote}
                        onstart={() => {
                            selectedMarker = null;
                        }}
                        onnext={tuningNavigation(target.stringIndex, 1)}
                        onprevious={tuningNavigation(target.stringIndex, -1)}
                        onchange={(value, input) =>
                            onChordChange(
                                {
                                    tuning:
                                        target.stringIndex === null
                                            ? { ...chord.tuning, label: value }
                                            : {
                                                  ...chord.tuning,
                                                  notes: chord.tuning.notes.map(
                                                      (note, index) =>
                                                          index ===
                                                          target.stringIndex
                                                              ? value
                                                              : note,
                                                  ),
                                              },
                                },
                                input,
                            )}
                    />
                {/each}
            {/if}
            <ChordOverlay
                {hoverTargets}
                onNoteClick={handleNoteClick}
                onStringClick={handleStringClick}
                onBarreCreate={handleBarreCreate}
                onMarkerContextMenu={handleMarkerContextMenu}
            />
        </div>
    </div>
    {#if selectedMarker !== null && currentMarker}
        <div
            class="fixed z-50 w-max max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)]"
            style:left={`${menuPosition.x}px`}
            style:top={`${menuPosition.y}px`}
            bind:this={menuContainer}
        >
            {#key selectedMarker}
                <MarkerMenu
                    text={currentMarker.markerText}
                    color={lastMarkerColor ??
                        currentMarker.color ??
                        chord.styling.circleColor}
                    onColorChange={handleMarkerColor}
                    onColorPreview={(value) => {
                        colorPreview = value;
                    }}
                    onSelect={handleMarkerSelect}
                    onOutsideContextMenu={handleOutsideContextMenu}
                    onClose={() => {
                        selectedMarker = null;
                    }}
                />
            {/key}
        </div>
    {/if}
</div>
