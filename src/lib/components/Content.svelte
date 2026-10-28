<script>
    import { RectangleVertical, Expand } from "@lucide/svelte"
</script>

<div class="flex flex-col flex-1 border border-green-500 p-2">
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
    <div class="flex justify-center px-12 py-4 gap-24">
        <div class="flex flex-col">
            <span class='text-xl font-bold pl-4'>Editor</span>
            <div class="border border-green-500 w-110 h-140 rounded-xl"></div>
        </div>
        <div>
            <span class='text-xl font-bold pl-4'>Result</span>
            <div class="border border-green-500 w-110 h-140 rounded-xl"></div>
        </div>
    </div>
</div>
