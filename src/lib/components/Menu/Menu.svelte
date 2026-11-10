<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";

    type Props = {
        chord: Chord;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onChordPreview: (changes: Partial<Chord> | null) => void;
        isOpen: boolean;
        onToggle: () => void;
    };

    let { chord, onChordChange, onChordPreview, isOpen, onToggle }: Props = $props();
</script>

<Sidebar title="Edit Menu" {isOpen} {onToggle}>
    <EditMenu {chord} {onChordChange} />
    <div class="divider my-3"></div>
    <CustomizeMenu {chord} {onChordChange} {onChordPreview} />
</Sidebar>
