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
        canvas.height = Math.round(
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