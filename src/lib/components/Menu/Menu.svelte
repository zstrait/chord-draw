<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";

    type Props = {
        chord: Chord;
        chartChord?: boolean;
        onResetStyling?: () => void;
        onChordChange: (
            changes: Partial<Chord>,
            input?: HTMLInputElement,
        ) => void;
        onChordPreview: (changes: Partial<Chord> | null) => void;
        isOpen: boolean;
        onToggle: () => void;
    };

    let { chord, chartChord = false, onChordChange, onChordPreview, onResetStyling, isOpen, onToggle }: Props = $props();
</script>

<Sidebar title="Edit Menu" {isOpen} {onToggle}>
    <EditMenu {chord} {chartChord} {onChordChange} />
    <div class="divider mt-3 mb-2"></div>
    <CustomizeMenu {chord} {onChordChange} {onChordPreview} {onResetStyling} titleClass="text-lg" />
</Sidebar>
