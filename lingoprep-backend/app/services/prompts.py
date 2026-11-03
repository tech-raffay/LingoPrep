"""One writing prompt catalog for listing, random selection and submission.

Static examples are used only for an empty catalog, never to hide a DB outage.
"""
from app.services.supabase_client import get_client

TOEFL_PROMPTS = [
    {
        "id": "toefl_w1",
        "exam_type": "toefl",
        "task_type": "1",
        "question": "Build a coherent, grammatically correct sentence using the following words/phrase: 'due to', 'unforeseen circumstances', 'postponed'. Make sure the sentence makes academic sense.",
        "overall": 0,
    },
    {
        "id": "toefl_w2",
        "exam_type": "toefl",
        "task_type": "2",
        "question": "Write an email to your professor, Dr. Evelyn Vance, requesting a short extension on your term paper. Explain the reasons for your request and propose a new deadline. Write between 120 and 150 words.",
        "overall": 0,
    },
    {
        "id": "toefl_w3",
        "exam_type": "toefl",
        "task_type": "3",
        "question": "Your professor is teaching a class on sociology. Write a response to the discussion prompt: 'Some people argue that government funding should focus entirely on STEM subjects (science, technology, engineering, and mathematics), while others believe that the arts and humanities deserve equal support. What is your opinion?' Support your response with specific reasons and examples.",
        "overall": 0,
    },
]


IELTS_PROMPTS = [{
    "id": "p1", "exam_type": "ielts", "task_type": "task2",
    "question": "Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views and give your opinion.",
    "overall": 0,
}]


def list_writing_prompts(exam_type):
    if exam_type == "toefl":
        return [dict(p) for p in TOEFL_PROMPTS]
    rows = (get_client().table("writing_samples")
            .select("id,exam_type,task_type,question,overall")
            .eq("exam_type", exam_type).order("id").limit(50).execute().data or [])
    return rows or [dict(p) for p in IELTS_PROMPTS]


def get_writing_prompt(prompt_id):
    for prompt in TOEFL_PROMPTS + IELTS_PROMPTS:
        if prompt["id"] == prompt_id:
            return dict(prompt)
    # Database prompts use UUIDs. Invalid identifiers are missing prompts, not DB errors.
    from uuid import UUID
    try:
        UUID(prompt_id)
    except ValueError:
        return None
    return (get_client().table("writing_samples")
            .select("id,exam_type,task_type,question,overall")
            .eq("id", prompt_id).single().execute().data)
