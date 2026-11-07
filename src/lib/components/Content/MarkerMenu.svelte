<script lang="ts">
    type Props = {
        onSelect: (text: string | null) => void;
        onClose: () => void;
    };

    let { onSelect, onClose }: Props = $props();

    let menu: HTMLUListElement;

    let customText = $state("");

    const labels = ["1", "2", "3", "4", "T"];
</script>

<svelte:window
    onpointerdown={(event) => {
        if (event.target instanceof Node && !menu.contains(event.target)) {
            onClose();
        }
    }}
    onkeydown={(event) => {
        if (event.key === "Escape") {
            onClose();
        }
    }}
/>

<ul
    bind:this={menu}
    class="marker-menu grid w-44 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-[0_6px_20px_rgb(30_45_67_/_16%)]"
>
    {#each labels as label}
        <li>
            <button
                type="button"
                class="btn btn-ghost w-full rounded-lg border-primary/15 bg-primary/5 font-medium text-primary hover:bg-primary/15"
                onclick={() => onSelect(label)}
            >
                {label}
            </button>
        </li>
    {/each}

    <li>
        <button
            type="button"
            class="btn btn-ghost w-full rounded-lg border-primary/15 bg-primary/5 font-medium text-primary hover:bg-primary/15"
            onclick={() => onSelect(null)}
        >
            None
        </button>
    </li>

    <li class="col-span-2 mt-1 border-t border-base-300/60 pt-2.5">
        <input
            type="text"
            class="input w-full rounded-lg"
            aria-label="Custom marker text"
            placeholder="Custom text"
            bind:value={customText}
            onkeydown={(event) => {
                if (event.key === "Enter" && !event.isComposing) {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelect(customText.trim() || null);
                }
            }}
        />
    </li>

    <li class="col-span-2">
        <button
            type="button"
            class="btn btn-primary w-full rounded-lg font-medium"
            onclick={() => onSelect(customText.trim() || null)}
        >
            Apply
        </button>
    </li>
</ul>

<style>
    .marker-menu .btn,
    .marker-menu .input {
        height: 2.25rem;
        min-height: 2.25rem;
        font-size: 0.875rem;
        box-shadow: none;
    }

    .marker-menu .input:focus-within {
        border-color: var(--color-primary);
        outline-color: var(--color-primary);
    }

    @media (pointer: coarse) {
        .marker-menu .btn,
        .marker-menu .input {
            height: 2.75rem;
            min-height: 2.75rem;
        }

        .marker-menu .input {
            font-size: 1rem;
        }
    }
</style>
