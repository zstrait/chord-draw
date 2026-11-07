<script lang="ts">
    import { onMount } from "svelte";
    import { Moon, Sun } from "@lucide/svelte";

    let darkMode = $state(false);

    onMount(() => {
        darkMode = document.documentElement.dataset.theme === "dark";
    });

    function toggleTheme() {
        darkMode = !darkMode;
        const theme = darkMode ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem("chorddraw-theme", theme);
        } catch {}
    }
</script>

<header
    class=" p-2 items-center flex h-14 justify-between"
>
    <span class="brand text-2xl text-primary">ChordDraw</span>

    <button
        type="button"
        class="flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        onclick={toggleTheme}
    >
        {#if darkMode}
            <Sun size={24} color="currentColor" aria-hidden="true" />
        {:else}
            <Moon size={24} color="currentColor" aria-hidden="true" />
        {/if}
    </button>
</header>

<style>
    .brand {
        font-family: "Rock Salt", cursive;
    }
</style>
