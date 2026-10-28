<script lang="ts">
    import Header from "../lib/components/Header.svelte"
    import EditMenu from "../lib/components/EditMenu.svelte"
    import Content from "../lib/components/Content.svelte"
    import Toolbar from "../lib/components/Toolbar.svelte"
</script>

<div class="flex h-dvh gap-4 p-2">
    <EditMenu />
    <div class="flex min-w-0 flex-1 flex-col">
        <Header />
        <Content />
        <Toolbar />
    </div>
</div>
