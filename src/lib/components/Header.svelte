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

<header class="flex h-14 items-center justify-between p-2">
    <span class="brand text-2xl text-primary">ChordDraw</span>

    <nav
        aria-label="Workspace"
        class="flex items-center gap-3 text-base font-medium"
    >
        <a
            href={resolve("/")}
            aria-current={page.route.id === "/" ? "page" : undefined}
            class="nav-link relative rounded-sm whitespace-nowrap hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            class:text-primary={page.route.id === "/"}>Chord Diagram</a
        >
        <span
            class="nav-divider divider divider-horizontal m-0 h-6 w-2 shrink-0"
            aria-hidden="true"
        ></span>
        <a
            href={resolve("chart/")}
            aria-current={page.route.id === "/chart" ? "page" : undefined}
            class="nav-link relative rounded-sm whitespace-nowrap hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            class:text-primary={page.route.id === "/chart"}>Chord Chart</a
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

    .nav-link[aria-current="page"]::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: -0.2rem;
        left: 0;
        height: 0.125rem;
        border-radius: 9999px;
        background-color: currentColor;
    }

    :global([data-theme="dark"]) .nav-link {
        color: var(--color-primary);
    }

    :global([data-theme="dark"]) .nav-link[aria-current="page"],
    :global([data-theme="dark"]) .nav-link:hover {
        color: var(--color-base-content);
    }

    :global([data-theme="dark"]) .nav-link[aria-current="page"]::after {
        background-color: var(--color-primary);
    }

    .nav-divider::before {
        border-radius: 9999px;
    }

    .nav-divider::after {
        display: none;
    }
</style>
