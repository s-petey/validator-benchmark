import { createHighlighter } from "@tanstack/highlight/core";
import { ts } from "@tanstack/highlight/languages/ts";

export const highlighter = createHighlighter({
  languages: [ts],
});
