import { mount, unmount } from "svelte";
import { getChartLabels } from "./chart.ts";
import type { ChordChart } from "./types.ts";

export type ChartDrawing = {
    svg: string;
    viewBox: { x: number; y: number; width: number; height: number };
};

type ExportFont = { family: string; css: string };
type LabelPart = { text: string; separator?: boolean };
type DrawingBounds = {
    left: number;
    top: number;
    width: number;
    height: number;
};
const padding = 16;
const gap = 24;
const columnGap = 20;
const rowGap = 28;
let fontPromise: Promise<ExportFont> | undefined;

export function getChartSlotSize(rotation: number) {
    const width = rotation % 180 ? (208 * 14) / 11 : 208;
    return { width, height: rotation % 180 ? 208 : (208 * 14) / 11 };
}

export function getChartLayout(
    chart: ChordChart,
    bounds: Map<string, DrawingBounds>,
) {
    function union(entries: DrawingBounds[]): DrawingBounds {
        const left = Math.min(...entries.map((entry) => entry.left));
        const top = Math.min(...entries.map((entry) => entry.top));
        return {
            left,
            top,
            width:
                Math.max(...entries.map((entry) => entry.left + entry.width)) -
                left,
            height:
                Math.max(...entries.map((entry) => entry.top + entry.height)) -
                top,
        };
    }
    const size = getChartSlotSize(chart.settings.rotation);
    const fallback = bounds.size
        ? union([...bounds.values()])
        : { left: -size.width / 2, top: 0, ...size };
    const slots = chart.slots.map((row) =>
        row.map((slot) => (slot ? bounds.get(slot.id) : undefined)),
    );
    const columnBounds = Array.from({ length: chart.columns }, (_, column) => {
        const entries = slots
            .map((row) => row[column])
            .filter((entry) => entry !== undefined);
        return entries.length ? union(entries) : fallback;
    });
    const rowBounds = slots.map((row) => {
        const entries = row.filter((entry) => entry !== undefined);
        return entries.length ? union(entries) : fallback;
    });
    const columns = columnBounds.map((entry) => entry.width);
    const rows = rowBounds.map((entry) => entry.height);
    return {
        columns,
        rows,
        lefts: columnBounds.map((entry) => entry.left),
        tops: rowBounds.map((entry) => entry.top),
        width:
            columns.reduce((sum, width) => sum + width, 0) +
            columnGap * (columns.length - 1),
        height:
            rows.reduce((sum, height) => sum + height, 0) +
            rowGap * (rows.length - 1),
    };
}

function getExportFont(): Promise<ExportFont> {
    return (fontPromise ??= (async () => {
        const signal = AbortSignal.timeout(8000);
        const response = await fetch(
            "https://fonts.googleapis.com/css2?family=Lexend:wght@400..600&display=swap",
            { signal },
        );
        if (!response.ok) throw new Error("Could not load the heading font");
        let css = (await response.text()).replaceAll(
            "Lexend",
            "ChordDrawExport",
        );
        const urls = [
            ...new Set(
                [...css.matchAll(/url\(([^)]+)\)/g)].map((match) =>
                    match[1].replace(/["']/g, ""),
                ),
            ),
        ];
        await Promise.all(
            urls.map(async (url) => {
                const font = await fetch(url, { signal });
                if (!font.ok)
                    throw new Error("Could not load the heading font");
                const data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error);
                    font.blob().then(
                        (blob) => reader.readAsDataURL(blob),
                        reject,
                    );
                });
                css = css.replaceAll(url, data);
            }),
        );
        return { family: "ChordDrawExport", css };
    })().catch(() => ({ family: "Arial", css: "" })));
}

export function wrapChartText(
    text: string,
    width: number,
    measure: (value: string) => number,
) {
    const lines: string[] = [];
    let line = "";
    for (const word of text.trim().split(/\s+/u)) {
        const candidate = line ? `${line} ${word}` : word;
        if (measure(candidate) <= width) {
            line = candidate;
            continue;
        }
        if (line) lines.push(line);
        line = "";
        for (const character of word) {
            if (line && measure(line + character) > width) {
                lines.push(line);
                line = "";
            }
            line += character;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function svgNode(
    tag: string,
    attributes: Record<string, string | number> = {},
) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attributes)) {
        if (key === "xml:space")
            element.setAttributeNS(
                "http://www.w3.org/XML/1998/namespace",
                key,
                String(value),
            );
        else if (key === "xmlns")
            element.setAttributeNS(
                "http://www.w3.org/2000/xmlns/",
                key,
                String(value),
            );
        else element.setAttribute(key, String(value));
    }
    return element;
}

function prefixIds(svg: Element, prefix: string) {
    const ids = new Map<string, string>();
    for (const element of [svg, ...svg.querySelectorAll("[id]")]) {
        const id = element.id;
        if (!id) continue;
        ids.set(id, `${prefix}-${id}`);
        element.id = ids.get(id)!;
    }
    for (const element of [svg, ...svg.querySelectorAll("*")]) {
        for (const attribute of [...element.attributes]) {
            let value = attribute.value.replace(
                /url\(#([^)]+)\)/g,
                (_, id) => `url(#${ids.get(id) ?? id})`,
            );
            if (attribute.localName === "href" && value.startsWith("#"))
                value = `#${ids.get(value.slice(1)) ?? value.slice(1)}`;
            element.setAttributeNS(
                attribute.namespaceURI,
                attribute.name,
                value,
            );
        }
    }
}

export function createChartSvg(
    chart: ChordChart,
    drawings: Map<string, ChartDrawing>,
    font: ExportFont,
): string {
    const diagrams = new Map<string, { element: Element } & DrawingBounds>();
    for (const slot of chart.slots.flat()) {
        if (!slot) continue;
        const drawing = drawings.get(slot.id);
        if (!drawing) throw new Error("A chord diagram is not ready");
        const element = new DOMParser().parseFromString(
            drawing.svg,
            "image/svg+xml",
        ).documentElement;
        const box = element
            .getAttribute("viewBox")!
            .split(/[\s,]+/)
            .map(Number);
        const size = getChartSlotSize(slot.chord.rotation);
        const area = { width: size.width - 26, height: size.height - 44 };
        const scale = Math.min(
            area.width / drawing.viewBox.width,
            area.height / drawing.viewBox.height,
        );
        // Preserve the editor's diagram scale and alignment, without its card padding.
        diagrams.set(slot.id, {
            element,
            left:
                -size.width / 2 +
                13 +
                (area.width - drawing.viewBox.width * scale) / 2 +
                (box[0] - drawing.viewBox.x) * scale,
            top:
                17 +
                (area.height - drawing.viewBox.height * scale) / 2 +
                (box[1] - drawing.viewBox.y) * scale,
            width: box[2] * scale,
            height: box[3] * scale,
        });
    }
    const layout = getChartLayout(chart, diagrams);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not measure the chart heading");
    const setFont = (size: number, weight: number) => {
        context.font = `${weight} ${size}px "${font.family}", sans-serif`;
    };
    const measure = (value: string) => context.measureText(value).width;
    setFont(24, 600);
    const titles = wrapChartText(chart.title, layout.width, measure);
    setFont(14, 400);
    const labels: LabelPart[][] = [];
    let line: LabelPart[] = [];
    for (const label of getChartLabels(chart)) {
        const chunks = wrapChartText(label.text, layout.width, measure);
        for (const [index, text] of chunks.entries()) {
            const separator = index === 0 && line.length ? "  |  " : "";
            if (
                line.length &&
                measure(
                    line.map((part) => part.text).join("") + separator + text,
                ) > layout.width
            ) {
                labels.push(line);
                line = [];
            }
            if (index === 0 && line.length)
                line.push({ text: "  |  ", separator: true });
            line.push({ text });
            if (index < chunks.length - 1) {
                labels.push(line);
                line = [];
            }
        }
    }
    if (line.length) labels.push(line);
    const headingHeight =
        titles.length * 36 +
        (titles.length && labels.length ? 8 : 0) +
        labels.length * 24 +
        Math.max(0, labels.length - 1) * 4;
    const gridTop = padding + (headingHeight ? headingHeight + gap : 0);
    const width = layout.width + padding * 2;
    const height = gridTop + layout.height + padding;
    const svg = svgNode("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: `0 0 ${width} ${height}`,
        width,
        height,
    });
    if (font.css) {
        const style = svgNode("style");
        style.textContent = font.css;
        svg.append(style);
    }
    if (chart.settings.styling.backgroundColor !== "transparent")
        svg.append(
            svgNode("rect", {
                width,
                height,
                fill: chart.settings.styling.backgroundColor,
            }),
        );
    let textY = padding;
    function addLine(
        parts: LabelPart[],
        size: number,
        weight: number,
        lineHeight: number,
    ) {
        const text = svgNode("text", {
            x: width / 2,
            y: textY + lineHeight / 2,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-family": `${font.family}, sans-serif`,
            "font-size": size,
            "font-weight": weight,
            "xml:space": "preserve",
            fill: chart.settings.styling.chordColor,
        });
        for (const part of parts) {
            const span = svgNode(
                "tspan",
                part.separator ? { opacity: 0.5 } : {},
            );
            span.textContent = part.text;
            text.append(span);
        }
        svg.append(text);
        textY += lineHeight;
    }
    for (const title of titles) addLine([{ text: title }], 24, 600, 36);
    if (titles.length && labels.length) textY += 8;
    for (const parts of labels) {
        addLine(parts, 14, 400, 24);
        textY += 4;
    }
    let y = gridTop;
    chart.slots.forEach((row, rowIndex) => {
        let x = padding;
        row.forEach((slot, columnIndex) => {
            if (slot) {
                const drawing = diagrams.get(slot.id)!;
                const nested = drawing.element;
                nested.setAttribute(
                    "x",
                    String(x + drawing.left - layout.lefts[columnIndex]),
                );
                nested.setAttribute(
                    "y",
                    String(y + drawing.top - layout.tops[rowIndex]),
                );
                nested.setAttribute("width", String(drawing.width));
                nested.setAttribute("height", String(drawing.height));
                prefixIds(nested, `chord-${rowIndex}-${columnIndex}`);
                svg.append(nested);
            }
            x += layout.columns[columnIndex] + columnGap;
        });
        y += layout.rows[rowIndex] + rowGap;
    });
    return new XMLSerializer().serializeToString(svg);
}

export async function renderChartSvg(chart: ChordChart): Promise<string> {
    let font =
        chart.title.trim() || getChartLabels(chart).length
            ? await getExportFont()
            : { family: "Arial", css: "" };
    const host = document.createElement("div");
    host.style.cssText =
        "position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none";
    host.setAttribute("aria-hidden", "true");
    host.inert = true;
    const style = document.createElement("style");
    style.textContent = font.css;
    host.append(style);
    document.body.append(host);
    let renderer: ReturnType<typeof mount> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        try {
            await Promise.all([
                document.fonts.load(
                    `600 24px "${font.family}"`,
                    chart.title || " ",
                ),
                document.fonts.load(
                    `400 14px "${font.family}"`,
                    getChartLabels(chart)
                        .map((label) => label.text)
                        .join(" ") || " ",
                ),
            ]);
        } catch {
            font = { family: "Arial", css: "" };
        }
        const { default: ChartExportRenderer } =
            await import("./components/Content/ChartExportRenderer.svelte");
        const drawings = chart.slots.some((row) => row.some(Boolean))
            ? await new Promise<Map<string, ChartDrawing>>(
                  (resolve, reject) => {
                      timer = setTimeout(
                          () => reject(new Error("Chart rendering timed out")),
                          10000,
                      );
                      renderer = mount(ChartExportRenderer, {
                          target: host,
                          props: { chart, onReady: resolve, onError: reject },
                      });
                  },
              )
            : new Map<string, ChartDrawing>();
        return createChartSvg(chart, drawings, font);
    } finally {
        clearTimeout(timer);
        if (renderer) await unmount(renderer);
        host.remove();
    }
}
