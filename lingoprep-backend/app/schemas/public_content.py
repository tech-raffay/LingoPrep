"""Allowlisted presentation data: grading keys never belong in test content."""

from pydantic import BaseModel, Field


class LabelledText(BaseModel):
    label: str = ""
    text: str = ""


class Note(BaseModel):
    heading: str = ""
    items: list[str] = Field(default_factory=list)


class FlowNode(BaseModel):
    text: str = ""
    is_blank: bool = False


class DiagramElement(BaseModel):
    label: str | None = None
    text: str | None = None
    position: str | None = None
    clue: str | None = None


class PublicQuestionData(BaseModel):
    # Pydantic ignores extra fields at every level, including nested objects.
    headings: list[LabelledText] | None = None
    features: list[LabelledText] | None = None
    endings: list[LabelledText] | None = None
    paragraphs: list[str] | None = None
    max_words: int | None = None
    instruction: str | None = None
    hide_instruction: bool | None = None
    list_title: str | None = None
    table_title: str | None = None
    summary_title: str | None = None
    flowchart_title: str | None = None
    diagram: str | None = None
    choices: list[str] | None = None
    template: str | None = None
    prefix: str | None = None
    missing: int | None = None
    task: str | None = None
    summary_text: str | None = None
    has_word_list: bool | None = None
    word_list: list[str] | None = None
    notes: list[Note] | None = None
    columns: list[str] | None = None
    rows: list[list[str]] | None = None
    nodes: list[FlowNode] | None = None
    direction: str | None = None
    diagram_type: str | None = None
    diagram_title: str | None = None
    elements: list[DiagramElement] | None = None
    diagram_description: str | None = None


PUBLIC_QUESTION_COLUMNS = (
    "id,passage_id,question_text,difficulty,sort_order,question_type,"
    "question_group_label,question_data"
)
PUBLIC_OPTION_COLUMNS = "id,question_id,option_text,option_label,sort_order"


def public_question(question: dict) -> dict:
    """Build a new response; do not mutate authoritative grading data."""
    result = {field: question[field] for field in PUBLIC_QUESTION_COLUMNS.split(",")
              if field in question and field != "question_data"}
    result["question_type"] = question.get("question_type") or "multiple_choice"
    result["question_group_label"] = question.get("question_group_label") or ""
    result["question_data"] = PublicQuestionData.model_validate(
        question.get("question_data") or {}
    ).model_dump(exclude_none=True)
    return result
