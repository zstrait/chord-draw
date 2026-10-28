<script>
    import {
        Trash,
        Undo2,
        Redo2,
        Copy,
        Download,
        Share,
        PanelBottomClose,
    } from "@lucide/svelte";
</script>

<div class="h-18 bg-red-300 px-4 rounded-xl items-center flex justify-between">
    <div class="flex">
        <button class="btn btn-square">
            <Trash color="#0a0a0a" />
        </button>
        <div class="divider divider-horizontal mx-2"></div>
        <div class="flex gap-2">
            <button class="btn btn-square">
                <Undo2 color="#0a0a0a" />
            </button>
            <button class="btn btn-square">
                <Redo2 color="#0a0a0a" />
            </button>
        </div>
    </div>

    <div class="flex">
        <div class="flex gap-4">
            <div class="flex gap-2">
                <button class="btn btn-square">
                    <Copy color="#0a0a0a" />
                </button>
                <select defaultValue="PNG" class="select w-20 shrink-0">
                    <option>PNG</option>
                    <option>JPEG</option>
                    <option>SVG</option>
                </select>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-square">
                    <Download color="#0a0a0a" />
                </button>
                <select defaultValue="PNG" class="select w-20 shrink-0">
                    <option>PNG</option>
                    <option>JPEG</option>
                    <option>SVG</option>
                </select>
            </div>
            <select defaultValue="Medium" class="select w-25 shrink-0">
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
            </select>
        </div>
        <div class="divider divider-horizontal mx-2"></div>
        <button class="btn btn-square">
            <Share color="#0a0a0a" />
        </button>
        <div class="divider divider-horizontal mx-2"></div>
        <button class="btn btn-square">
            <PanelBottomClose color="#0a0a0a" />
        </button>
    </div>
</div>
