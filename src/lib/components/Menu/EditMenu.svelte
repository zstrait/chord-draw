<script lang="ts">
    import { PanelLeftClose } from "@lucide/svelte";
    import type { Chord } from "#lib/types.ts";

    let { chord }: { chord: Chord } = $props();
</script>

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
                <input type="number" class="input" defaultValue="0" />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Number of Frets</legend>
                <input type="number" class="input" defaultValue="5" />
            </fieldset>
        </div>
        <label class="label pt-2 text-xs">
            <input type="checkbox" checked class="checkbox" />
            Capo Indicator
        </label>
    </div>
</div>
