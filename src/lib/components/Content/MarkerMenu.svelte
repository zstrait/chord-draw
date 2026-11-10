<script lang="ts">
  import { untrack } from "svelte";
  import { RotateCcw } from "@lucide/svelte";
  import ColorPicker from "../ColorPicker.svelte";

  type Props = {
    text: string | null;
    color: string;
    onColorChange: (color: string | null) => void;
    onColorPreview: (color: string | null) => void;
    onSelect: (text: string | null) => void;
    onClose: () => void;
    onOutsideContextMenu: (event: MouseEvent) => void;
  };

  let {
    text,
    color,
    onColorChange,
    onColorPreview,
    onSelect,
    onClose,
    onOutsideContextMenu,
  }: Props = $props();

  let menu: HTMLUListElement;
  let colorAnchor = $state<HTMLDivElement>();
  let pickerOpen = $state(false);

  const labels = ["1", "2", "3", "4", "T"];
  let customText = $state(
    untrack(() =>
      labels.includes(text?.toUpperCase() ?? "") ? "" : (text ?? ""),
    ),
  );
  let customTextEdited = $state(false);

  function apply() {
    onSelect(customTextEdited ? customText.trim() || null : text);
  }
</script>

<svelte:window
  onkeydown={(event) => {
    if (!pickerOpen && event.key === "Escape") {
      onClose();
    } else if (
      !pickerOpen &&
      event.key === "Enter" &&
      !event.isComposing &&
      !(
        event.target instanceof HTMLButtonElement && menu.contains(event.target)
      )
    ) {
      event.preventDefault();
      apply();
    }
  }}
/>

<button
  type="button"
  tabindex="-1"
  class="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
  aria-label="Apply marker changes and close menu"
  onclick={() => {
    if (!pickerOpen) apply();
  }}
  oncontextmenu={(event) => {
    event.preventDefault();
    apply();
    onOutsideContextMenu(event);
  }}
></button>

<ul
  bind:this={menu}
  class="marker-menu relative z-50 grid w-44 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-[0_6px_20px_rgb(30_45_67_/16%)]"
>
  {#each labels as label}
    <li>
      <button
        type="button"
        class="btn btn-ghost w-full rounded-lg border-transparent bg-primary/5 font-medium text-primary hover:bg-primary/15"
        onclick={() => onSelect(label)}
      >
        {label}
      </button>
    </li>
  {/each}

  <li>
    <button
      type="button"
      class="btn btn-ghost w-full rounded-lg border-transparent bg-primary/5 font-medium text-primary hover:bg-primary/15"
      onclick={() => onSelect(null)}
    >
      None
    </button>
  </li>

  <li class="col-span-2 mt-0.5 border-t border-base-300/40 pt-2">
    <input
      type="text"
      class="input w-full min-w-0 rounded-lg px-2.5"
      aria-label="Custom marker text"
      placeholder="Custom text"
      bind:value={customText}
      oninput={() => {
        customTextEdited = true;
      }}
      onkeydown={(event) => {
        if (event.key === "Enter" && !event.isComposing) {
          event.preventDefault();
          event.stopPropagation();
          apply();
        }
      }}
    />
  </li>

  <li class="col-span-2 flex items-center justify-between gap-1.5">
    <button
      type="button"
      class="btn btn-primary min-w-0 flex-1 rounded-lg px-4 font-medium"
      onclick={apply}
    >
      Apply
    </button>
    <div class="flex shrink-0 items-center rounded-lg bg-primary/5 p-0.5">
      <div bind:this={colorAnchor}>
        <button
          type="button"
          class="icon-button btn btn-ghost rounded-full text-primary hover:bg-primary/15"
          aria-label="Marker color"
          title="Marker color"
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          onclick={() => {
            pickerOpen = true;
          }}
        >
          <span
            class="size-5 rounded-full border border-base-300"
            style:background-color={color}
          ></span>
        </button>
      </div>
      <button
        type="button"
        class="icon-button btn btn-ghost rounded-full text-primary hover:bg-primary/15"
        aria-label="Reset marker color"
        title="Reset marker color"
        onclick={() => onColorChange(null)}
        onkeydown={(event) => {
          if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            apply();
          }
        }}
      >
        <RotateCcw size={16} />
      </button>
    </div>
  </li>
</ul>

{#if pickerOpen && colorAnchor}
  <ColorPicker
    label="Marker color"
    value={color}
    anchor={colorAnchor}
    onApply={(value) => {
      onColorChange(value);
      onClose();
    }}
    onPreview={onColorPreview}
    onClose={() => {
      pickerOpen = false;
    }}
  />
{/if}

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

  .marker-menu .icon-button {
    width: 2rem;
    height: 2rem;
    min-height: 2rem;
    padding: 0;
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

    .marker-menu .icon-button {
      width: 2.25rem;
      height: 2.25rem;
      min-height: 2.25rem;
    }
  }
</style>
