export function trimSvg(svg: SVGSVGElement, titleOffset = 0): string {
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const backgroundSelector = ":scope > rect, :scope > [data-chord-rotation] > rect";
    const background = svg.querySelector(backgroundSelector);
    let exportedBackground = copy.querySelector(backgroundSelector);
    if (exportedBackground?.getAttribute("fill") === "transparent") {
        exportedBackground.remove();
        exportedBackground = null;
    }
    const inverse = svg.getScreenCTM()?.inverse();
    if (!inverse) return copy.outerHTML;
    const title = svg.querySelector("text.title");
    const exportedTitle = copy.querySelector("text.title");
    if (exportedTitle && titleOffset) {
        exportedTitle.setAttribute("transform", `${exportedTitle.getAttribute("transform") ?? ""} translate(0 ${titleOffset})`);
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (const element of svg.querySelectorAll<SVGGraphicsElement>("path, line, rect, circle, ellipse, polygon, polyline, text")) {
        if (element === background || element.closest("defs, .top-left, .top-right")) continue;
        if (element.tagName === "text" && !element.textContent?.trim()) continue;
        const box = element.getBBox();
        if (!box.width && !box.height) continue;
        const transform = element.getScreenCTM();
        if (!transform) continue;
        const matrix = inverse.multiply(transform);
        const style = getComputedStyle(element);
        const stroke = style.stroke === "none" ? 0 : (parseFloat(style.strokeWidth) || 0) / 2;
        const offset = element === title ? titleOffset : 0;

        for (const x of [box.x - stroke, box.x + box.width + stroke]) {
            for (const y of [box.y + offset - stroke, box.y + box.height + offset + stroke]) {
                const point = new DOMPoint(x, y).matrixTransform(matrix);
                left = Math.min(left, point.x);
                top = Math.min(top, point.y);
                right = Math.max(right, point.x);
                bottom = Math.max(bottom, point.y);
            }
        }
    }

    if (![left, top, right, bottom].every(Number.isFinite)) return copy.outerHTML;
    const margin = 12;
    const x = left - margin;
    const y = top - margin;
    const width = right - left + margin * 2;
    const height = bottom - top + margin * 2;
    copy.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
    copy.setAttribute("width", String(width));
    copy.setAttribute("height", String(height));

    if (exportedBackground) {
        exportedBackground.setAttribute("x", String(x));
        exportedBackground.setAttribute("y", String(y));
        exportedBackground.setAttribute("width", String(width));
        exportedBackground.setAttribute("height", String(height));
        copy.prepend(exportedBackground);
    }
    return copy.outerHTML;
}

export function downloadSvg(svg: string) {
    const file = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "chord.svg";

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getPngSize(svg: string, width: number) {
    const viewBox = svg.match(/\bviewBox\s*=\s*["']([^"']+)["']/)?.[1]
        .trim().split(/[\s,]+/).map(Number);

    if (
        !viewBox || viewBox.length !== 4 ||
        !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0
    ) {
        return null;
    }

    return {
        width,
        height: Math.max(1, Math.round(width * viewBox[3] / viewBox[2])),
    };
}

export async function svgToPng(svg: string, width = 1024): Promise<Blob> {
    const file = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(file);

    try {
        const image = new Image();
        image.src = url;

        await image.decode();

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = getPngSize(svg, width)?.height ?? Math.round(
            canvas.width * (image.naturalHeight / image.naturalWidth),
        );

        const context = canvas.getContext("2d");

        if (context === null) {
            throw new Error("Could not create a canvas drawing context");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const png = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (png === null) {
            throw new Error("Could not create the PNG file");
        }

        return png;
    } finally {
        URL.revokeObjectURL(url);
    }
}

export async function downloadPng(svg: string, width = 1024) {
    const png = await svgToPng(svg, width);
    const url = URL.createObjectURL(png);
    const link = document.createElement("a");

    link.href = url;
    link.download = "chord.png";

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copySvg(svg: string) {
    await navigator.clipboard.writeText(svg);
}

export async function copyPng(svg: string, width = 1024) {
    const item = new ClipboardItem({
        "image/png": svgToPng(svg, width),
    });

    await navigator.clipboard.write([item]);
}
