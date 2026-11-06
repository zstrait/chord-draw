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
    class="grid grid-cols-2 gap-2 bg-base-100 rounded-box p-3 shadow"
>
    {#each labels as label}
        <li>
            <button
                type="button"
                class="btn btn-ghost btn-sm w-full"
                onclick={() => onSelect(label)}
            >
                {label}
            </button>
        </li>
    {/each}

    <li>
        <button
            type="button"
            class="btn btn-ghost btn-sm w-full"
            onclick={() => onSelect(null)}
        >
            None
        </button>
    </li>

    <li class="col-span-2">
        <input
            type="text"
            class="input input-sm w-full"
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
            class="btn btn-primary btn-sm w-full"
            onclick={() => onSelect(customText.trim() || null)}
        >
            Apply
        </button>
    </li>
</ul>
