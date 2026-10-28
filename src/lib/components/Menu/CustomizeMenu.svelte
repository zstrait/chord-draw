<script lang="ts">
    import { RotateCcw } from "@lucide/svelte";
</script>

<div>
    <div class="flex justify-between items-center">
        <span class="text-xl font-bold">Customize</span>
        <button class="btn btn-square w-8 h-8">
            <RotateCcw color="#0a0a0a" />
        </button>
    </div>
    <div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Styling</legend>
            <select defaultValue="Normal" class="select">
                <option>Normal</option>
                <option>Handdrawn</option>
            </select>
        </fieldset>
        <div class="flex justify-between gap-4">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Line Thickness</legend>
                <input type="number" class="input" placeholder="" />
            </fieldset>
            <fieldset class="fieldset w-55">
                <legend class="fieldset-legend">Line Color</legend>
                <select defaultValue="Black" class="select">
                    <option>Black</option>
                    <option>White</option>
                    <option>Blue</option>
                    <option>Red</option>
                    <option>Green</option>
                    <option>Custom...</option>
                </select>
            </fieldset>
        </div>
        <div class="flex justify-between gap-4">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Circle Size</legend>
                <input type="number" class="input" placeholder="" />
            </fieldset>
            <fieldset class="fieldset w-55">
                <legend class="fieldset-legend">Circle Color</legend>
                <select defaultValue="Black" class="select">
                    <option>Black</option>
                    <option>White</option>
                    <option>Blue</option>
                    <option>Red</option>
                    <option>Green</option>
                    <option>Custom...</option>
                </select>
            </fieldset>
        </div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Background Color</legend>
            <select defaultValue="Transparent" class="select">
                <option>Transparent</option>
                <option>Black</option>
                <option>White</option>
                <option>Blue</option>
                <option>Red</option>
                <option>Green</option>
                <option>Custom...</option>
            </select>
        </fieldset>
    </div>
    <div class="flex justify-between gap-4">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Title Font Size</legend>
            <input type="number" class="input" placeholder="" />
        </fieldset>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Finger Font Size</legend>
            <input type="number" class="input" placeholder="" />
        </fieldset>
    </div>
</div>
