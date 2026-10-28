<script>
    import { RectangleVertical, Expand } from "@lucide/svelte";
</script>

<div class="flex justify-between">
    <div class="flex items-center">
        <button class="flex">
            <RectangleVertical size={28} color="#0a0a0a" />
            <RectangleVertical size={28} color="#0a0a0a" />
        </button>
        <div class="divider divider-horizontal mx-0"></div>
        <button>
            <RectangleVertical size={28} color="#0a0a0a" />
        </button>
    </div>
    <button class="btn btn-square">
        <Expand color="#0a0a0a" />
    </button>
</div>
