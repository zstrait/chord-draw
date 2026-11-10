import type { PageLoad } from "./$types";
import { decodeChord, hasChordParams } from "#lib/share.ts";

export const load: PageLoad = ({ url }) => ({
  chord: decodeChord(url.searchParams),
  hasSharedChord: hasChordParams(url.searchParams),
});
