<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { resolve } from "$app/paths";
    import { Moon, Sun } from "@lucide/svelte";
    import gitLogoLight from "#lib/assets/git-logo-light.svg";
    import gitLogoDark from "#lib/assets/git-logo-dark.svg";

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

<header class=" p-2 items-center flex h-14 justify-between">
    <span class="brand text-2xl text-primary">ChordDraw</span>

    <nav
        aria-label="Workspace"
        class="flex items-center gap-4 text-sm font-medium"
    >
        <a
            href={resolve("/")}
            aria-current={page.route.id === "/" ? "page" : undefined}
            class="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            class:text-primary={page.route.id === "/"}
            class:underline={page.route.id === "/"}
            class:underline-offset-4={page.route.id === "/"}>Diagram</a
        >
        <a
            href={resolve("chart/")}
            aria-current={page.route.id === "/chart" ? "page" : undefined}
            class="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            class:text-primary={page.route.id === "/chart"}
            class:underline={page.route.id === "/chart"}
            class:underline-offset-4={page.route.id === "/chart"}>Chart</a
        >
    </nav>

    <div class="flex items-center gap-2">
        <button
            type="button"
            class="flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"}
            onclick={toggleTheme}
        >
            {#if darkMode}
                <Sun size={24} color="currentColor" aria-hidden="true" />
            {:else}
                <Moon size={24} color="currentColor" aria-hidden="true" />
            {/if}
        </button>
        <a
            href="https://github.com/zstrait/chord-draw"
            target="_blank"
            rel="noopener noreferrer"
            class="flex size-9 items-center justify-center rounded-full hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="View ChordDraw on GitHub (opens in a new tab)"
        >
            <img
                src={darkMode ? gitLogoDark : gitLogoLight}
                width="26"
                height="26"
                alt=""
            />
        </a>
    </div>
</header>

<style>
    .brand {
        font-family: "Rock Salt", cursive;
    }
</style>
