<script lang="ts">
    let { heading }: { heading: string } = $props();
</script>

<div>
    <span class="text-xl font-bold pl-4">{heading}</span>
    <div class="border border-green-500 w-110 h-140 rounded-xl"></div>
</div>
