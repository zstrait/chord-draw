<script lang="ts">
    import Header from "#lib/components/Header.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";

    let chord = $state(createDefaultChord());

    let past = $state<Chord[]>([]);
    let future = $state<Chord[]>([]);

    function updateChord(changes: Partial<Chord>) {
        past.push($state.snapshot(chord));
        future = [];

        Object.assign(chord, changes);
        console.log("Saved states:", past.length);
    }

    function undo() {
        const previous = past.pop();

        if (previous === undefined) {
            return;
        }

        future.push($state.snapshot(chord));
        chord = previous;
    }

    function redo() {
        const latest = future.pop();

        if (latest === undefined) {
            return;
        }

        past.push($state.snapshot(chord));
        chord = latest;
    }
</script>

<svelte:window
    onkeydown={(event) => {
        if (
            event.key === "Enter" &&
            !event.isComposing &&
            event.target instanceof HTMLInputElement
        ) {
            event.preventDefault();
            event.target.blur();
        }
    }}
/>

<div class="flex h-dvh gap-4 p-2 pl-0">
    <Menu {chord} onChordChange={updateChord} />
    <div class="flex min-w-0 flex-1 flex-col">
        <Header />
        <Content {chord} onChordChange={updateChord} />
        <Toolbar
            onChordChange={updateChord}
            onUndo={undo}
            canUndo={past.length > 0}
            onRedo={redo}
            canRedo={future.length > 0}
        />
    </div>
</div>
