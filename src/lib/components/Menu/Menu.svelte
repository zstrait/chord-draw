<script lang="ts">
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";

    type Props = {
        chord: Chord;
        onTitleChange: (value: string) => void;
    };

    let { chord, onTitleChange }: Props = $props();
</script>

<div class="w-75 shrink-0 bg-blue-500 rounded-xl p-4">
    <EditMenu {chord} {onTitleChange} />
    <div class="divider my-3"></div>
    <CustomizeMenu {chord} />
</div>
