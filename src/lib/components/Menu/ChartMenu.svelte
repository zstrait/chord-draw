<script lang="ts">
    import type { Chord, ChordChart } from "#lib/types.ts";
    import { createDefaultChord } from "#lib/chord.ts";
    import { applyChartStyling } from "#lib/chart.ts";
    import Sidebar from "./Sidebar.svelte";
    import EditMenu from "./EditMenu.svelte";
    import CustomizeMenu from "./CustomizeMenu.svelte";
    import NumberInput from "./NumberInput.svelte";

    type Props = {
        chart: ChordChart;
        onChartChange: (
            changes: Partial<ChordChart>,
            input?: HTMLInputElement,
        ) => void;
        onChartPreview: (changes: Partial<Chord> | null) => void;
        isOpen: boolean;
        onToggle: () => void;
    };

    let { chart, onChartChange, onChartPreview, isOpen, onToggle }: Props =
        $props();
    const defaultChord = createDefaultChord();
    let chord = $derived({
        ...defaultChord,
        ...chart.settings,
        title: chart.title,
    });

    function updateSettings(changes: Partial<Chord>, input?: HTMLInputElement) {
        const { title, strings, barres, ...settings } = changes;
        const styling = settings.styling;
        const startFret = settings.startFret;
        const updateChord = (chord: Chord) => {
            const updated = styling
                ? applyChartStyling(
                      chord,
                      styling,
                      strings !== undefined || barres !== undefined,
                  )
                : chord;
            return startFret === undefined
                ? updated
                : { ...updated, startFret };
        };
        onChartChange(
            {
                ...(title !== undefined ? { title } : {}),
                settings: { ...chart.settings, ...settings },
                ...(styling || startFret !== undefined
                    ? {
                          slots: chart.slots.map((row) =>
                              row.map((slot) =>
                                  slot
                                      ? {
                                            ...slot,
                                            chord: updateChord(slot.chord),
                                        }
                                      : null,
                              ),
                          ),
                      }
                    : {}),
            },
            input,
        );
    }
</script>

<Sidebar title="Chart Menu" {isOpen} {onToggle}>
    <div class="chart-menu-content">
        <EditMenu
            {chord}
            titleLabel="Chart Title"
            tuningLabel="Chart Tuning"
            onChordChange={updateSettings}
        />
        <div class="divider my-3"></div>
        <div class="grid grid-cols-2 gap-3 py-1">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Number of Rows</legend>
                <NumberInput
                    label="Number of Rows"
                    value={chart.rows}
                    max={12}
                    onchange={(value, input) =>
                        onChartChange({ rows: value }, input)}
                />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Chords Per Row</legend>
                <NumberInput
                    label="Chords Per Row"
                    value={chart.columns}
                    max={12}
                    onchange={(value, input) =>
                        onChartChange({ columns: value }, input)}
                />
            </fieldset>
        </div>
        <div class="divider my-3"></div>
        <CustomizeMenu
            {chord}
            title="Chart Customization"
            onChordChange={updateSettings}
            onChordPreview={onChartPreview}
        />
    </div>
</Sidebar>

<style>
    .chart-menu-content :global(fieldset.fieldset) {
        gap: 0.25rem;
        padding-block: 0.3125rem;
    }

    .chart-menu-content :global(legend.fieldset-legend) {
        padding-block: 0.25rem;
    }

    .chart-menu-content :global(.divider) {
        height: 1px;
        margin-block: 0.5rem;
    }

    .chart-menu-content :global(.pt-2) {
        padding-top: 0.25rem;
    }
</style>
