import type { MCQQuestion } from "@/types";

/**
 * The line a completion gap sits in, for the score report.
 *
 * Gaps in a form, notes, table, summary or flow chart have no question text
 * of their own: the gap is inside the material. This finds the n-th gap of
 * the group and returns its line with the gap shown as "____", so the
 * review can say which sentence the answer belongs to.
 */
export function gapContext(q: MCQQuestion, group: MCQQuestion[]): string {
  const data = q.question_data || {};
  const n = group.findIndex((x) => x.id === q.id);
  if (n < 0) return "";

  let lines: string[] = [];
  switch (q.question_type) {
    case "note_completion":
      lines = (data.notes ?? []).flatMap((s) => s.items);
      break;
    case "table_completion":
      lines = (data.rows ?? []).flatMap((row) => row);
      break;
    case "flowchart_completion":
      lines = (data.nodes ?? []).map((node) => (node.is_blank ? "__BLANK__" : node.text));
      break;
    case "summary_completion":
      lines = (data.summary_text ?? "").split(/(?<=[.!?])\s+/);
      break;
    default:
      return "";
  }

  let seen = 0;
  for (const line of lines) {
    const gaps = (line.match(/__BLANK__/g) || []).length;
    if (seen + gaps > n) {
      const which = n - seen;
      let i = -1;
      return line.replace(/__BLANK__/g, () => (++i === which ? "____" : "…"));
    }
    seen += gaps;
  }
  return "";
}
