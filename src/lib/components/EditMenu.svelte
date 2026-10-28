<script lang="ts">
    import { PanelLeftClose, RotateCcw } from "@lucide/svelte"
</script>

<div class="w-75 shrink-0 bg-blue-500 rounded-xl p-4">
    <div class="flex flex-col">
        <div class="flex justify-between items-center">
            <span class="text-xl font-bold">Edit Menu</span>
            <button class="btn btn-square w-8 h-8">
                <PanelLeftClose color="#0a0a0a" />
            </button>
        </div>
        <div class="flex flex-col">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Title</legend>
                <input type="text" class="input" placeholder="" />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Tuning</legend>
                <select defaultValue="Standard" class="select">
                    <option>Standard</option>
                    <option>Drop D</option>
                    <option>DADGAD</option>
                    <option>Custom...</option>
                </select>
            </fieldset>
            <div class="flex text-xs justify-between pt-2">
                <label class="label">
                    <input type="checkbox" checked class="checkbox" />
                    String Note Labels
                </label>
                <label class="label">
                    <input type="checkbox" checked class="checkbox" />
                    Tuning Label
                </label>
            </div>
            <div class="flex justify-between gap-4 pt-2">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Starting Fret</legend>
                    <input type="text" class="input" defaultValue="0" />
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Number of Frets</legend>
                    <input type="text" class="input" defaultValue="5" />
                </fieldset>
            </div>
            <label class="label pt-2 text-xs">
                <input type="checkbox" checked class="checkbox" />
                Capo Indicator
            </label>
        </div>
    </div>
    <div class="divider my-3"></div>
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
                    <input type="text" class="input" placeholder="" />
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
                    <input type="text" class="input" placeholder="" />
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
                <legend class="fieldset-legend">Title Font Size</legend>
                <input type="text" class="input" placeholder="" />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Finger Font Size</legend>
                <input type="text" class="input" placeholder="" />
            </fieldset>
        </div>
    </div>
</div>
