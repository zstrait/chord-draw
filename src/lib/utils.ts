export function validatePositiveInput(event: Event): number | null {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;

    if (Number.isInteger(value) && value >= 1) {
        return value;
    }

    return null;
}

export function blurInputOnEnter(event: KeyboardEvent) {
    if (
        !event.defaultPrevented && !event.isComposing &&
        event.key === "Enter" && event.target instanceof HTMLInputElement
    ) {
        event.preventDefault();
        event.target.blur();
    }
}
