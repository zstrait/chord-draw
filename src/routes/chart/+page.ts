import type { PageLoad } from "./$types";
import { decodeChart } from "#lib/share.ts";

export const load: PageLoad = ({ url }) => ({
    chart: decodeChart(url.searchParams),
});

export const prerender = true;
export const trailingSlash = "always";
