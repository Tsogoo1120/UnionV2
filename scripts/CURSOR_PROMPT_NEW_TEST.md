# Cursor Prompt: Create a New Psychology Test Seed

Paste this entire file as context into Cursor, then append your test content at the bottom.

---

## Your Task

I will give you the questions, answer options, and result summaries for a new psychology test.  
You must produce **one `.sql` seed file** ready to run in the Supabase SQL editor.  
Do **not** create any other files unless I ask.

---

## Project Context

- Stack: Next.js 14 App Router + Supabase (Postgres)
- Path: `supabase/seeds/<slug>_test.sql`
- Language: **Mongolian** (all user-facing text must be in Mongolian exactly as I provide it)
- Scoring type for this test: **`category_count`**

---

## Database Table: `psychology_tests`

```sql
CREATE TABLE psychology_tests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  questions        JSONB DEFAULT '[]'::jsonb,
  scoring_rules    JSONB DEFAULT '{"ranges":[]}'::jsonb,
  is_published     BOOLEAN DEFAULT false,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

---

## SQL Seed Template (follow this structure exactly)

```sql
-- <Test name> (<N> questions, category_count scoring, Mongolian)
-- Run once in Supabase SQL editor. Idempotent on slug.

INSERT INTO psychology_tests (slug, title, description, questions, scoring_rules, is_published, published_at)
VALUES (
  '<slug>',
  '<Test title in Mongolian>',
  '<Description paragraph in Mongolian>',
  '<QUESTIONS_JSON>'::jsonb,
  '<SCORING_RULES_JSON>'::jsonb,
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title         = EXCLUDED.title,
  description   = EXCLUDED.description,
  questions     = EXCLUDED.questions,
  scoring_rules = EXCLUDED.scoring_rules,
  is_published  = EXCLUDED.is_published,
  updated_at    = now();
```

---

## Questions JSON Format

The `questions` field is a **JSON array** of question objects.

```json
[
  {
    "id": "q1",
    "text": "Question text in Mongolian",
    "meta": {
      "section": "Section name in Mongolian"
    },
    "options": [
      { "id": "q1_A", "text": "Option A text", "value": 1 },
      { "id": "q1_B", "text": "Option B text", "value": 2 },
      { "id": "q1_C", "text": "Option C text", "value": 3 },
      { "id": "q1_D", "text": "Option D text", "value": 4 }
    ]
  },
  {
    "id": "q2",
    ...
  }
]
```

### Rules
- Question IDs: `q1`, `q2`, `q3` … sequential integers, no gaps
- Option IDs: `q1_A`, `q1_B`, `q1_C`, `q1_D` (always uppercase A/B/C/D)
- Option values: always `1`, `2`, `3`, `4` mapping to categories A, B, C, D respectively
- `meta.section`: the section/topic this question belongs to (group consecutive questions under the same section)
- Each question must have **exactly 4 options** (A, B, C, D)
- No extra fields — keep the structure minimal

---

## Scoring Rules JSON Format (category_count)

```json
{
  "type": "category_count",
  "optionValueToCategory": {
    "1": "A",
    "2": "B",
    "3": "C",
    "4": "D"
  },
  "categoryOrder": ["A", "B", "C", "D"],
  "categories": {
    "A": {
      "title": "Category A title in Mongolian",
      "subtitle": "Short tagline in Mongolian",
      "shortLabel": "English label (shown as badge)",
      "meaning": "Full description paragraph in Mongolian"
    },
    "B": {
      "title": "...",
      "subtitle": "...",
      "shortLabel": "...",
      "meaning": "..."
    },
    "C": { ... },
    "D": { ... }
  }
}
```

### Rules
- `type` must be exactly `"category_count"`
- `optionValueToCategory` is always `{"1":"A","2":"B","3":"C","4":"D"}` — never change this
- `categoryOrder` is always `["A","B","C","D"]`
- Each category needs: `title`, `subtitle`, `shortLabel`, `meaning`
- `shortLabel` should be the English name (e.g. `"Secure Attachment"`) — it's used for a small badge in the UI
- `meaning` should be 3–6 sentences explaining what this result means for the person

---

## How Scoring Works at Runtime

1. User completes the test and submits answers
2. Server reads each answer's selected option `value` (1–4)
3. Maps value → category letter using `optionValueToCategory`
4. Counts how many answers fall into each category (A, B, C, D)
5. **Winner = category with the most answers**
6. Displays the winning category's `title`, `subtitle`, and `meaning` on the result page
7. Also shows a bar breakdown of all category counts

---

## Checklist Before Finalizing

- [ ] Slug is lowercase, hyphen-separated (e.g. `love-languages`, `stress-response`)
- [ ] Every question has exactly 4 options with values 1/2/3/4
- [ ] Option IDs follow pattern `q{N}_A`, `q{N}_B`, `q{N}_C`, `q{N}_D`
- [ ] `meta.section` is set on every question
- [ ] All 4 categories (A, B, C, D) are defined in `scoring_rules.categories`
- [ ] The JSON embedded in the SQL is valid (no trailing commas, proper escaping)
- [ ] SQL ends with the `ON CONFLICT` upsert block
- [ ] File saved to `supabase/seeds/<slug>_test.sql`

---

## How to Embed JSON in SQL

Use single quotes with the `::jsonb` cast. Escape any single quotes inside the JSON with `''` (two single quotes):

```sql
  '[{"id":"q1","text":"Та''ны асуулт..."}]'::jsonb,
```

If there are no single quotes in your Mongolian text (there usually aren't), no escaping is needed.

---

## Example: Minimal 2-Question Seed (reference only)

```sql
-- Example test (2 questions, category_count, Mongolian)
INSERT INTO psychology_tests (slug, title, description, questions, scoring_rules, is_published, published_at)
VALUES (
  'example-test',
  'Жишээ тест',
  'Энэ бол жишээ тестийн тайлбар.',
  '[{"id":"q1","text":"Асуулт 1","meta":{"section":"Хэсэг 1"},"options":[{"id":"q1_A","text":"Хариулт А","value":1},{"id":"q1_B","text":"Хариулт Б","value":2},{"id":"q1_C","text":"Хариулт В","value":3},{"id":"q1_D","text":"Хариулт Г","value":4}]},{"id":"q2","text":"Асуулт 2","meta":{"section":"Хэсэг 1"},"options":[{"id":"q2_A","text":"Хариулт А","value":1},{"id":"q2_B","text":"Хариулт Б","value":2},{"id":"q2_C","text":"Хариулт В","value":3},{"id":"q2_D","text":"Хариулт Г","value":4}]}]'::jsonb,
  '{"type":"category_count","optionValueToCategory":{"1":"A","2":"B","3":"C","4":"D"},"categoryOrder":["A","B","C","D"],"categories":{"A":{"title":"A категори","subtitle":"A дэд гарчиг","shortLabel":"Category A","meaning":"А категорийн тайлбар."},"B":{"title":"B категори","subtitle":"B дэд гарчиг","shortLabel":"Category B","meaning":"В категорийн тайлбар."},"C":{"title":"C категори","subtitle":"C дэд гарчиг","shortLabel":"Category C","meaning":"С категорийн тайлбар."},"D":{"title":"D категори","subtitle":"D дэд гарчиг","shortLabel":"Category D","meaning":"Д категорийн тайлбар."}}}'::jsonb,
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title         = EXCLUDED.title,
  description   = EXCLUDED.description,
  questions     = EXCLUDED.questions,
  scoring_rules = EXCLUDED.scoring_rules,
  is_published  = EXCLUDED.is_published,
  updated_at    = now();
```

---

## Now — Here Is My Test Content

> **Replace everything below with your actual test data, then send to Cursor.**

**Test name (Mongolian):**  
_e.g. Хайрын хэл тест_

**Slug:**  
_e.g. love-languages_

**Description (Mongolian, 2–4 sentences):**  
_..._

**Categories / Result summaries:**

| Letter | Title (MN) | Subtitle (MN) | English label | Meaning paragraph (MN) |
|--------|-----------|--------------|--------------|------------------------|
| A | ... | ... | ... | ... |
| B | ... | ... | ... | ... |
| C | ... | ... | ... | ... |
| D | ... | ... | ... | ... |

**Questions (one per row):**

| # | Section | Question text (MN) | Option A | Option B | Option C | Option D |
|---|---------|-------------------|----------|----------|----------|----------|
| 1 | ... | ... | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... | ... | ... |
| … | … | … | … | … | … | … |
