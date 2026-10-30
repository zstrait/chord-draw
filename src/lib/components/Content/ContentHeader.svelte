<script lang="ts">
    import { RectangleVertical, Expand, ArrowRightLeft } from "@lucide/svelte";

    type Props = {
        isDoubleView: boolean;
        onViewChange: (value: boolean) => void;
        isEditorView: boolean;
        onSingleViewChange: (value: boolean) => void;
    };

    let {
        isDoubleView,
        onViewChange,
        isEditorView,
        onSingleViewChange,
    }: Props = $props();
</script>

<div class="flex justify-between">
    <div class="flex items-center">
        <button
            class="flex btn"
            onclick={() => {
                onViewChange(true);
            }}
        >
            <RectangleVertical size={28} color="#0a0a0a" />
            <RectangleVertical size={28} color="#0a0a0a" />
        </button>

        <div class="divider divider-horizontal mx-0"></div>

        <button
            class="btn"
            onclick={() => {
                onViewChange(false);
            }}
        >
            <RectangleVertical size={28} color="#0a0a0a" />
        </button>

        {#if !isDoubleView}
            <button
                class="btn btn-square ml-4"
                onclick={() => {
                    onSingleViewChange(!isEditorView);
                }}
            >
                <ArrowRightLeft size={28} color="#0a0a0a" />
            </button>
        {/if}
    </div>

    <button class="btn btn-square">
        <Expand color="#0a0a0a" />
    </button>
</div>
