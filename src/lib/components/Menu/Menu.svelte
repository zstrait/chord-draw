<script lang="ts">
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";

    type Props = {
        chord: Chord;
        onChordChange: (changes: Partial<Chord>) => void;
    };

    let { chord, onChordChange }: Props = $props();
</script>

<div class="w-80 shrink-0 bg-blue-400 rounded-xl p-4">
    <EditMenu {chord} {onChordChange} />
    <div class="divider my-3"></div>
    <CustomizeMenu {chord} {onChordChange}/>
</div>
