<script lang="ts">
    import Header from "#lib/components/Header.svelte";
    import Sidebar from "#lib/components/Menu/Sidebar.svelte";
    import Toolbar from "#lib/components/Toolbar.svelte";
    import { createDefaultChart } from "#lib/chart.ts";

    let chart = $state(createDefaultChart());
    let menuOpen = $state(true);
    let toolbarOpen = $state(true);
</script>

<div class="flex h-dvh gap-4 p-2 pl-0 pb-0">
    <Sidebar
        title="Chart Menu"
        isOpen={menuOpen}
        onToggle={() => { menuOpen = !menuOpen; }}
    />
    <div
        class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
        style:padding-bottom={toolbarOpen ? "0.5rem" : "0rem"}
    >
        <Header />
        <div class="divider mt-0 mb-3.5 h-0.5 shrink-0 overflow-hidden rounded-full opacity-40 before:h-0.5 after:h-0.5" aria-hidden="true"></div>
        <main aria-label="Chord chart workspace" class="min-h-0 min-w-0 flex-1 overflow-auto p-2"></main>
        <Toolbar
            subject="chart"
            isOpen={toolbarOpen}
            onToggle={() => { toolbarOpen = !toolbarOpen; }}
            onClear={() => { chart = createDefaultChart(); }}
            canClear={chart.slots.some((row) => row.some((slot) => slot !== null))}
        />
    </div>
</div>
