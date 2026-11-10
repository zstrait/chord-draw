<script lang="ts">
    import { tick } from "svelte";
    import { CircleAlert } from "@lucide/svelte";

    let dialog: HTMLDialogElement;
    const id = $props.id();
    let content = $state({ title: "", message: "", confirmLabel: "Continue", wide: false });
    let confirmAction: (() => void) | undefined;

    export async function show({ onConfirm, wide = false, ...options }: {
        title: string;
        message: string;
        confirmLabel: string;
        wide?: boolean;
        onConfirm: () => void;
    }) {
        for (const popup of document.querySelectorAll<HTMLElement>("[popover]:popover-open")) {
            popup.hidePopover();
        }
        content = { ...options, wide };
        confirmAction = onConfirm;
        await tick();
        dialog.returnValue = "";
        dialog.showModal();
    }
</script>

<dialog
    bind:this={dialog}
    class="modal"
    aria-labelledby={`${id}-title`}
    aria-describedby={`${id}-message`}
    onkeydown={(event) => {
        if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) dialog.close("confirm");
        }
    }}
    onclose={() => {
        const action = confirmAction;
        confirmAction = undefined;
        if (dialog.returnValue === "confirm") action?.();
    }}
>
    <div class={`modal-box ${content.wide ? "max-w-[30rem]" : "max-w-[25rem]"} overflow-hidden rounded-2xl bg-base-100 p-0 text-base-content shadow-2xl`}>
        <div class="flex items-center gap-2.5 bg-(--toolbar-bg) px-5 py-4 text-neutral-content">
            <CircleAlert size={24} strokeWidth={2.5} class="shrink-0" aria-hidden="true" />
            <h2 id={`${id}-title`} class="text-xl font-semibold">{content.title}</h2>
        </div>
        <div class="p-5 pt-4">
            <p id={`${id}-message`} class="whitespace-pre-line text-base leading-relaxed">{content.message}</p>
            <form method="dialog" class="modal-action mt-5 gap-3">
                <button class="btn btn-primary min-w-28 rounded-lg px-5 text-sm font-semibold shadow-sm" value="confirm">{content.confirmLabel}</button>
                <button class="btn btn-outline min-w-24 rounded-lg px-5 text-sm font-medium shadow-none hover:bg-primary/10 hover:text-base-content" value="cancel">Cancel</button>
            </form>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button value="cancel" aria-label="Cancel">Cancel</button>
    </form>
</dialog>

<style>
    :global([data-theme="dark"]) .modal-box {
        --toolbar-bg: #34465e;
        --color-base-100: #c4cedb;
        --color-base-300: #8597af;
        --color-base-content: #1e2d43;
        --color-primary: #456a98;
        --color-primary-content: #f1f5fa;
    }
</style>
