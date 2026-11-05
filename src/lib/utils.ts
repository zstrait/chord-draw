export function validatePositiveInput(event: Event): number | null {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.valueAsNumber;

    if (Number.isInteger(value) && value >= 1) {
        return value;
    }

    return null;
}
