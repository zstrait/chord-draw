export type KeybindActions = Partial<
    Record<
        | "move"
        | "preview"
        | "rotate"
        | "maximize"
        | "fill"
        | "theme"
        | "download"
        | "copy"
        | "share"
        | "clear"
        | "menu"
        | "toolbar"
        | "addColumn"
        | "removeColumn"
        | "addRow"
        | "removeRow"
        | "focus"
        | "remove"
        | "left"
        | "right"
        | "up"
        | "down",
        () => void
    >
>;

type Keybind = {
    action: keyof KeybindActions;
    key?: string;
    code?: string;
    command?: boolean;
    shift?: boolean;
    alt?: boolean;
    repeat?: boolean;
};

const keybinds: Keybind[] = [
    { key: "m", action: "move" },
    { key: "p", action: "preview" },
    { key: "r", action: "rotate" },
    { key: "f", action: "maximize" },
    { code: "Equal", action: "fill" },
    { key: "d", action: "theme" },
    { key: "e", command: true, action: "download" },
    { key: "c", command: true, action: "copy" },
    { key: "l", shift: true, action: "share" },
    { key: "x", command: true, action: "clear" },
    { key: "m", shift: true, action: "menu" },
    { key: "t", shift: true, action: "toolbar" },
    { code: "Equal", shift: true, action: "addColumn" },
    { code: "Minus", shift: true, action: "removeColumn" },
    { code: "Equal", alt: true, action: "addRow" },
    { code: "Minus", alt: true, action: "removeRow" },
    { key: "f", shift: true, action: "focus" },
    { key: "x", shift: true, action: "remove" },
    { key: "arrowleft", action: "left", repeat: true },
    { key: "arrowright", action: "right", repeat: true },
    { key: "arrowup", action: "up", repeat: true },
    { key: "arrowdown", action: "down", repeat: true },
];

export function canHandleKeybind(event: KeyboardEvent): boolean {
    if (event.defaultPrevented || event.isComposing) return false;
    for (const target of [event.target, document.activeElement]) {
        if (
            target instanceof HTMLElement &&
            (target.isContentEditable ||
                target.closest(
                    'input, textarea, select, [role="menu"], [role="listbox"], [role="slider"]',
                ))
        )
            return false;
    }
    return !document.querySelector(
        ".marker-menu, [popover]:popover-open, dialog[open]",
    );
}

export function handleKeybind(
    event: KeyboardEvent,
    actions: KeybindActions,
): boolean {
    if (!canHandleKeybind(event) || (event.metaKey && event.ctrlKey))
        return false;
    const command = event.metaKey || event.ctrlKey;
    const binding = keybinds.find(
        (binding) =>
            (binding.code
                ? event.code === binding.code
                : event.key.toLowerCase() === binding.key) &&
            command === !!binding.command &&
            event.shiftKey === !!binding.shift &&
            event.altKey === !!binding.alt,
    );
    const action = binding && actions[binding.action];
    if (!binding || !action) return false;
    event.preventDefault();
    if (!event.repeat || binding.repeat) action();
    return true;
}
