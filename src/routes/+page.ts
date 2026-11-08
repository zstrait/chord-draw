import type { PageLoad } from "./$types";
import { decodeChord } from "#lib/share.ts";

export const load: PageLoad = ({ url }) => ({
    chord: decodeChord(url.searchParams),
});
