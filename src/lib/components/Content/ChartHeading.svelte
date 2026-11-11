<script lang="ts">
    import { tick } from "svelte";
    import type { ChordChart } from "#lib/types.ts";
    import { getChartLabels } from "#lib/chart.ts";
    import { normalizeTuningNote } from "#lib/tunings.ts";

    let {
        chart,
        onChartChange,
        onEditStart,
        onEditingChange,
    }: {
        chart: ChordChart;
        onChartChange: (
            changes: Partial<ChordChart>,
            input?: HTMLInputElement,
        ) => void;
        onEditStart: () => void;
        onEditingChange: (editing: boolean) => void;
    } = $props();

    type Field = "title" | "tuning" | number;
    let editing = $state<Field | null>(null);
    let input = $state<HTMLInputElement>();
    let original = $state("");
    let labels = $derived(getChartLabels(chart, editing === "tuning"));

    function value(field: Field) {
        if (field === "title") return chart.title;
        if (field === "tuning") return chart.settings.tuning.label;
        return chart.settings.tuning.notes[field];
    }

    function change(field: Field, next: string) {
        if (field === "title") {
            onChartChange({ title: next }, input);
            return;
        }
        onChartChange(
            {
                settings: {
                    ...chart.settings,
                    tuning:
                        field === "tuning"
                            ? { ...chart.settings.tuning, label: next }
                            : {
                                  ...chart.settings.tuning,
                                  notes: chart.settings.tuning.notes.map(
                                      (note, index) =>
                                          index === field ? next : note,
                                  ),
                              },
                },
            },
            input,
        );
    }

    async function start(field: Field) {
        original = value(field);
        editing = field;
        onEditingChange(true);
        onEditStart();
        await tick();
        input?.focus({ preventScroll: true });
        input?.select();
    }

    function finish(apply = true) {
        if (editing === null) return;
        if (!apply && value(editing) !== original) change(editing, original);
        editing = null;
        onEditingChange(false);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.isComposing || editing === null) return;
        if (event.key === "Tab" && typeof editing === "number") {
            const next = editing + (event.shiftKey ? -1 : 1);
            if (next >= 0 && next < chart.settings.tuning.notes.length) {
                event.preventDefault();
                event.stopPropagation();
                finish();
                start(next);
            }
        } else if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            finish(event.key === "Enter");
        }
    }

    function handleInput(event: Event) {
        if (editing === null) return;
        const field = event.currentTarget as HTMLInputElement;
        const next =
            typeof editing === "number"
                ? normalizeTuningNote(field.value)
                : field.value;
        if (next === null) return;
        if (field.value !== next) field.value = next;
        if (next !== value(editing)) change(editing, next);
    }
</script>

<svelte:window
    onpointerdown={(event) => {
        if (editing !== null && event.target !== input) finish();
    }}
/>

<header
    class="flex min-w-0 flex-col items-center gap-2 text-center text-base-content"
>
    {#if chart.title || editing === "title"}
        <h1 class="min-h-9 w-full break-words text-2xl font-semibold leading-9">
            {#if editing === "title"}
                <input
                    bind:this={input}
                    type="text"
                    value={chart.title}
                    class="input mx-auto h-9 w-full max-w-md rounded-md border-primary bg-base-100 px-2 text-center text-2xl font-semibold text-base-content shadow-none"
                    aria-label="Chart title"
                    oninput={handleInput}
                    onblur={() => {
                        if (editing === "title") finish();
                    }}
                    onkeydown={handleKeydown}
                />
            {:else}
                <button
                    type="button"
                    class="max-w-full cursor-text rounded-md border-0 bg-transparent p-0 text-2xl font-semibold leading-9 text-inherit hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label="Edit chart title"
                    onclick={() => start("title")}>{chart.title}</button
                >
            {/if}
        </h1>
    {/if}
    {#if labels.length}
        <p
            class="flex max-w-full flex-wrap justify-center gap-y-1 break-words text-sm leading-6"
        >
            {#each labels as label, index}
                <span class="inline-flex items-center">
                    {#if index > 0}<span
                            class="mx-[0.55em] text-base-content/50"
                            aria-hidden="true">|</span
                        >{/if}
                    {#if label.kind === "tuning" && chart.settings.tuning.custom}
                        {#if editing === "tuning"}
                            <input
                                bind:this={input}
                                type="text"
                                value={chart.settings.tuning.label}
                                class="input inline-block h-6 min-w-0 rounded-md border-primary bg-base-100 px-1 text-center text-sm text-base-content shadow-none"
                                style:width={`${Math.max(8, original.length + 1)}ch`}
                                aria-label="Tuning name"
                                autocomplete="off"
                                spellcheck="false"
                                oninput={handleInput}
                                onblur={() => {
                                    if (editing === "tuning") finish();
                                }}
                                onkeydown={handleKeydown}
                            />
                        {:else}
                            <button
                                type="button"
                                class="cursor-text rounded-md border-0 bg-transparent p-0 text-inherit hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                                aria-label="Edit tuning name"
                                onclick={() => start("tuning")}
                                >{label.text}</button
                            >
                        {/if}
                    {:else if label.kind === "notes" && chart.settings.tuning.custom}
                        <span class="inline-flex gap-1">
                            {#each chart.settings.tuning.notes as note, noteIndex}
                                {#if editing === noteIndex}
                                    <input
                                        bind:this={input}
                                        type="text"
                                        value={note}
                                        class="input inline-block h-6 w-[3ch] min-w-0 rounded-md border-primary bg-base-100 px-0 text-center text-sm text-base-content shadow-none"
                                        aria-label={`String ${noteIndex + 1} tuning note`}
                                        autocomplete="off"
                                        spellcheck="false"
                                        oninput={handleInput}
                                        onblur={() => {
                                            if (editing === noteIndex) finish();
                                        }}
                                        onkeydown={handleKeydown}
                                    />
                                {:else}
                                    <button
                                        type="button"
                                        class="cursor-text rounded-md border-0 bg-transparent p-0 text-inherit hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                                        aria-label={`Edit string ${noteIndex + 1} tuning note`}
                                        onclick={() => start(noteIndex)}
                                        >{note}</button
                                    >
                                {/if}
                            {/each}
                        </span>
                    {:else}
                        {label.text}
                    {/if}
                </span>
            {/each}
        </p>
    {/if}
</header>
