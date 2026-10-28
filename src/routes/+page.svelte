<script lang="ts">
    import Header from "../lib/components/Header.svelte";
    import Menu from "../lib/components/Menu/Menu.svelte";
    import Content from "../lib/components/Content/Content.svelte";
    import Toolbar from "../lib/components/Toolbar.svelte";
</script>

<div class="flex h-dvh gap-4 p-2">
    <Menu />
    <div class="flex min-w-0 flex-1 flex-col">
        <Header />
        <Content />
        <Toolbar />
    </div>
</div>
