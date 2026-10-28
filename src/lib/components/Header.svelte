<script lang="ts">
    import { Moon } from "@lucide/svelte"
</script>

<header
    class=" p-2 items-center flex h-14 border border-orange-500 justify-between"
>
    <span>ChordDraw</span>

    <div class="flex gap-50 items-center">
        <div class="flex gap-4">
            <a href="/" class="underline">Chord Diagram</a>
            |
            <a href="/">Chord Chart</a>
        </div>

        <button class="btn btn-circle">
            <Moon color="#0a0a0a" />
        </button>
    </div>
</header>
