<script lang="ts">
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import type { Chord } from "#lib/types.ts";

    let { chord }: { chord: Chord } = $props();
</script>

<div class="w-75 shrink-0 bg-blue-500 rounded-xl p-4">
    <EditMenu {chord} />
    <div class="divider my-3"></div>
    <CustomizeMenu {chord} />
</div>
