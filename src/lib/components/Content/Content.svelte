<script>
    import ChordView from "./ChordView.svelte";
    import ContentHeader from "./ContentHeader.svelte";
</script>

<div class="flex flex-col flex-1 border border-green-500 p-2">
    <ContentHeader />
    <div class="flex justify-center px-12 py-4 gap-24">
        <ChordView heading={"Editor"} />
        <ChordView heading={"Result"} />
    </div>
</div>
