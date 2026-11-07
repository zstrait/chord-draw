<script lang="ts" generics="T extends string | number">
    import { Check, ChevronDown } from "@lucide/svelte";

    type Option = {
        label: string;
        value: T;
        color?: string;
        disabled?: boolean;
        reselect?: boolean;
        tooltip?: string;
    };

    type Props = {
        label: string;
        value: T;
        options: readonly Option[];
        onchange: (value: T) => void;
        placement?: "top" | "bottom";
        class?: string;
    };

    let {
        label,
        value,
        options,
        onchange,
        placement = "bottom",
        class: className = "w-full",
    }: Props = $props();

    const menuId = $props.id();
    let trigger: HTMLButtonElement;
    let menu: HTMLUListElement;
    let open = $state(false);
    let tooltip: HTMLDivElement;
    let tooltipText = $state("");
    let selected = $derived(options.find((option) => option.value === value));
    let search = "";
    let lastKeyTime = 0;

    function optionButtons() {
        return Array.from(
            menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
        );
    }

    function close(restoreFocus = false) {
        hideTooltip();
        menu.hidePopover();
        if (restoreFocus) {
            trigger.focus({ preventScroll: true });
        }
    }

    function hideTooltip() {
        tooltip.hidePopover();
    }

    function showTooltip(event: MouseEvent | FocusEvent, text?: string) {
        if (!text) return;
        const button = event.currentTarget as HTMLButtonElement;
        const bounds = button.getBoundingClientRect();
        tooltipText = text;
        tooltip.style.left = `${bounds.left}px`;
        tooltip.style.top = `${bounds.top + bounds.height / 2}px`;
        tooltip.showPopover();
    }

    function focusOption(button?: HTMLButtonElement) {
        if (!button) return;
        button.focus({ preventScroll: true });
        const bounds = button.getBoundingClientRect();
        const menuBounds = menu.getBoundingClientRect();
        if (bounds.top < menuBounds.top + 6) {
            menu.scrollTop -= menuBounds.top + 6 - bounds.top;
        } else if (bounds.bottom > menuBounds.bottom - 6) {
            menu.scrollTop += bounds.bottom - menuBounds.bottom + 6;
        }
    }

    function show(focusLast = false) {
        menu.showPopover();

        const bounds = trigger.getBoundingClientRect();
        const gap = 6;
        const above = Math.max(0, bounds.top - gap - 8);
        const below = Math.max(0, window.innerHeight - bounds.bottom - gap - 8);
        menu.style.width = `${Math.min(Math.max(bounds.width, 144), window.innerWidth - 16)}px`;
        menu.style.maxHeight = `${window.innerHeight - 16}px`;
        const height = menu.scrollHeight + 2;
        const useTop = placement === "top"
            ? height <= above || above >= below
            : height > below && above > below;
        const available = useTop ? above : below;

        menu.style.maxHeight = `${available}px`;
        menu.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - menu.offsetWidth - 8))}px`;
        menu.style.top = `${useTop ? bounds.top - gap - Math.min(height, available) : bounds.bottom + gap}px`;

        search = "";
        const buttons = optionButtons();
        const current = menu.querySelector<HTMLButtonElement>(
            '[aria-checked="true"]:not(:disabled)',
        );
        const target = focusLast ? buttons.at(-1) : current ?? buttons[0];
        focusOption(target);
    }

    function handleKeydown(event: KeyboardEvent) {
        const buttons = optionButtons();
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            focusOption(buttons[(index + step + buttons.length) % buttons.length]);
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            focusOption(event.key === "Home" ? buttons[0] : buttons.at(-1));
        } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close(true);
        } else if (event.key === "Tab") {
            close(true);
        } else if (
            event.key.length === 1 && event.key !== " " &&
            !event.ctrlKey && !event.metaKey && !event.altKey
        ) {
            event.preventDefault();
            const now = Date.now();
            search = now - lastKeyTime < 500 ? search + event.key : event.key;
            lastKeyTime = now;
            const query = /^([\s\S])\1*$/.test(search) ? search[0] : search;
            const ordered = [...buttons.slice(index + 1), ...buttons.slice(0, index + 1)];
            focusOption(ordered.find((button) =>
                button.textContent?.trim().toLowerCase().startsWith(query.toLowerCase()),
            ));
        }
    }
</script>

<svelte:window onresize={() => { if (open) close(); }} />
<svelte:document onscrollcapture={(event) => {
    if (open) hideTooltip();
    if (open && event.target instanceof Node && !menu.contains(event.target)) {
        close();
    }
}} />

<div class={`min-w-0 ${className}`}>
    <button
        bind:this={trigger}
        type="button"
        class="dropdown-trigger"
        aria-label={`${label}: ${selected?.label ?? value}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        popovertarget={menuId}
        onclick={(event) => {
            event.preventDefault();
            if (menu.matches(":popover-open")) {
                close();
            } else {
                show();
            }
        }}
        onkeydown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                show(event.key === "ArrowUp");
            }
        }}
    >
        {#if selected?.color}
            <span
                class="color-swatch"
                class:transparent={selected.color === "transparent"}
                style:background-color={selected.color}
                aria-hidden="true"
            ></span>
        {/if}
        <span class="min-w-0 flex-1 truncate">{selected?.label ?? value}</span>
        <ChevronDown size={14} class="shrink-0" aria-hidden="true" />
    </button>

    <ul
        bind:this={menu}
        id={menuId}
        popover="auto"
        class="dropdown menu option-menu"
        role="menu"
        tabindex="-1"
        aria-label={label}
        ontoggle={(event) => {
            open = event.newState === "open";
            if (!open) hideTooltip();
        }}
        onkeydown={handleKeydown}
    >
        {#each options as option (option.value)}
            <li role="none">
                <button
                    type="button"
                    class="option-button"
                    class:selected={option.value === value}
                    role="menuitemradio"
                    aria-checked={option.value === value}
                    aria-label={option.tooltip ? `${option.label}: ${option.tooltip}` : undefined}
                    disabled={option.disabled}
                    tabindex="-1"
                    onmouseenter={(event) => showTooltip(event, option.tooltip)}
                    onmouseleave={hideTooltip}
                    onfocus={(event) => showTooltip(event, option.tooltip)}
                    onblur={hideTooltip}
                    onclick={() => {
                        if (option.value !== value || option.reselect) {
                            onchange(option.value);
                        }
                        close(true);
                    }}
                >
                    {#if option.color}
                        <span
                            class="color-swatch"
                            class:transparent={option.color === "transparent"}
                            style:background-color={option.color}
                            aria-hidden="true"
                        ></span>
                    {/if}
                    <span class="min-w-0 flex-1">{option.label}</span>
                    {#if option.value === value}
                        <Check size={14} class="shrink-0" aria-hidden="true" />
                    {/if}
                </button>
            </li>
        {/each}
    </ul>
    <div
        bind:this={tooltip}
        popover="manual"
        class="option-tooltip tooltip tooltip-left tooltip-open"
        data-tip={tooltipText}
        aria-hidden="true"
    ></div>
</div>

<style>
    .option-tooltip {
        position: fixed;
        inset: auto;
        width: 0;
        height: 0;
        margin: 0;
        padding: 0;
        border: 0;
        overflow: visible;
        pointer-events: none;
    }

    .option-tooltip:not(:popover-open) {
        display: none;
    }

    .dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        height: 2.25rem;
        padding-inline: 0.75rem;
        border: 1px solid var(--color-base-300);
        border-radius: 0.5rem;
        background: var(--color-base-100);
        color: var(--color-base-content);
        font-size: 0.875rem;
        text-align: left;
        cursor: pointer;
    }

    .dropdown-trigger:hover,
    .dropdown-trigger[aria-expanded="true"] {
        border-color: var(--color-primary);
    }

    .dropdown-trigger:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .option-menu {
        position: fixed;
        position-area: none;
        inset: auto;
        margin: 0;
        padding: 0.375rem;
        flex-wrap: nowrap;
        overflow-y: auto;
        border: 1px solid var(--color-base-300);
        border-radius: 0.75rem;
        background: var(--color-base-100);
        color: var(--color-base-content);
        box-shadow: 0 6px 20px rgb(30 45 67 / 16%);
        animation: none;
        transition: none;
        scale: 1;
    }

    .option-menu .option-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 2.25rem;
        padding: 0.375rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        text-align: left;
        box-shadow: none;
    }

    .option-menu::backdrop {
        background: transparent;
    }

    .option-button:hover:not(:disabled),
    .option-button:focus-visible,
    .option-button.selected {
        background: color-mix(in srgb, var(--color-primary) 10%, transparent);
        color: var(--color-primary);
    }

    .option-button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
    }

    .color-swatch {
        flex-shrink: 0;
        width: 0.875rem;
        height: 0.875rem;
        border: 1px solid var(--color-base-300);
        border-radius: 0.25rem;
    }

    .color-swatch.transparent {
        background-image: repeating-conic-gradient(#cbd7e6 0% 25%, white 0% 50%);
        background-size: 8px 8px;
    }

    @media (pointer: coarse) {
        .dropdown-trigger,
        .option-menu .option-button {
            min-height: 2.75rem;
        }

        .dropdown-trigger {
            font-size: 1rem;
        }
    }
</style>
