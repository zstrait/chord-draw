<script lang="ts">
    import { tick } from "svelte";
    import type { TuningTarget } from "#lib/types.ts";

    let {
        value,
        target,
        rotation,
        label,
        normalize = (value: string) => value,
        onchange,
        onstart,
        onnext,
        onprevious,
    }: {
        value: string;
        target: TuningTarget;
        rotation: number;
        label: string;
        normalize?: (value: string) => string | null;
        onchange: (value: string, input: HTMLInputElement) => void;
        onstart: () => void;
        onnext?: () => void;
        onprevious?: () => void;
    } = $props();

    let editing = $state(false);
    let draft = $state("");
    let input = $state<HTMLInputElement>();
    let original = "";

    export async function start() {
        original = value;
        draft = value;
        editing = true;
        onstart();
        await tick();
        input?.focus({ preventScroll: true });
        input?.select();
    }

    function finish(apply = true) {
        if (!editing) return;
        const next = apply ? normalize(draft) ?? original : original;
        editing = false;
        if (next !== value && input) onchange(next, input);
    }
</script>

<svelte:window onpointerdown={(event) => {
    if (editing && event.target !== input) finish();
}} />

<div
    class="absolute"
    class:z-20={editing}
    style:left={`${target.x}px`}
    style:top={`${target.y}px`}
    style:width={`${target.width}px`}
    style:height={`${target.height}px`}
    style:transform={`translate(-50%, -50%) rotate(${rotation}deg)`}
>
    {#if editing}
        <input
            bind:this={input}
            bind:value={draft}
            type="text"
            class="input h-full w-full min-w-0 rounded-md border-primary bg-base-100 px-1 text-center text-base-content shadow-none"
            style:font-size={`${target.fontSize}px`}
            style:font-family={target.fontFamily}
            aria-label={label}
            autocomplete="off"
            spellcheck="false"
            oninput={(event) => {
                const next = normalize(event.currentTarget.value);
                if (next === null) return;
                if (next !== event.currentTarget.value) event.currentTarget.value = next;
                draft = next;
                if (next !== value) onchange(next, event.currentTarget);
            }}
            onblur={() => finish()}
            onkeydown={(event) => {
                if (event.isComposing) return;
                if (event.key === "Tab") {
                    const navigate = event.shiftKey ? onprevious : onnext;
                    if (navigate) {
                        event.preventDefault();
                        event.stopPropagation();
                        finish();
                        navigate();
                    }
                    return;
                }
                if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(event.key === "Enter");
                }
            }}
        />
    {:else}
        <button
            type="button"
            class="h-full w-full cursor-text rounded-md border-0 bg-transparent p-0 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Edit ${label.toLowerCase()}`}
            onclick={start}
        ></button>
    {/if}
</div>
