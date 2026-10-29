<script lang="ts">
    import Header from "#lib/components/Header.svelte";
    import Menu from "#lib/components/Menu/Menu.svelte";
    import Content from "#lib/components/Content/Content.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";

    import type { Chord } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";

    let chord = $state(createDefaultChord());

    function updateChord(changes: Partial<Chord>) {
        Object.assign(chord, changes);
    }
</script>

<div class="flex h-dvh gap-4 p-2">
    <Menu {chord} onChordChange={updateChord} />
    <div class="flex min-w-0 flex-1 flex-col">
        <Header />
        <Content {chord} onChordChange={updateChord}/>
        <Toolbar onChordChange={updateChord}/>
    </div>
</div>
