<script lang="ts">
    import { Moon } from "@lucide/svelte"
</script>

<header
    class=" p-2 items-center flex h-14 justify-between"
>
    <span class="text-primary">ChordDraw</span>

    <div class="flex gap-50 items-center">
        <div class="flex gap-4">
            <a href="/" class="underline text-primary">Chord Diagram</a>
            |
            <a href="/">Chord Chart</a>
        </div>

        <button class="btn btn-circle">
            <Moon color="currentColor" />
        </button>
    </div>
</header>
