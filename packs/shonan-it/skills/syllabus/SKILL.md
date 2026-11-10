---
name: syllabus
description: Find and compare Shonan Institute of Technology courses from the current syllabus (conditions, keywords, content, evaluation, plan).
version: 0.1.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, syllabus, courses, evaluation, course-selection]
    related_skills: [school-info, campussquare]
  tomo:
    title: { en: "Syllabus search", zh: "シラバス检索", ja: "シラバス検索" }
    summary:
      en: "Finds courses in this year's syllabus by conditions (online classes, no exam, your year), by keyword or by topic, and shows how each is graded and taught."
      zh: "在本年度シラバス中按条件（メディア授業、无考试、你的年级）、关键词或主题查找课程，并说明评分方式和授课内容。"
      ja: "今年度のシラバスから、条件（メディア授業・試験なし・学年）、キーワード、テーマで科目を探し、評価方法や授業内容を示します。"
---

# Syllabus search (令和8年度 シラバス)

Answers questions about courses from the school's current syllabus (every course of 工学部 and 情報学部), through
the pack's school information service: which courses meet conditions, which mention something, which fit a topic,
and what one course is like (evaluation, plan, prerequisites, instructor). The syllabus is **Japanese**: search in
Japanese and answer in the student's language.

## When to Use

- "Which courses are online (メディア授業)?", "Courses without an exam?", "Electives for 2nd-year 情報学科 in autumn?"
- "Which courses use Adobe / Python / Arduino?", "Which courses require 線形代数?"
- "Courses about AI / game design / robots?", "Something hands-on and not too heavy?"
- "How is プログラミング基礎 graded?", "What is covered in week 5?", "Who teaches it, what textbook?"

Don't use for: the student's own registrations, grades or credits (`campussquare`); school rules and dates
(`school-info`); day and period of a class: the syllabus has none (they are only in CampusSquare during the
registration period, or on paper).

## Rules

1. **Pick the tool by the kind of question** (all in "Search service" below):
   - a **condition** (online, no exam, year, term, required/elective, department, credits): `courses` with filters —
     it returns **every** matching course and the `total`; never answer such a question from `search`;
   - "**which courses mention X**" (a tool, a software, a prerequisite): `courses` with `contains` — every course
     whose text has it, with the sentence;
   - a **topic or wish** in the student's words ("about AI", "not much math"): `search`, ranked by meaning; say that
     it shows the closest courses, not all of them;
   - **one course** in detail: `courses/{code}`.
   Combine them: filters narrow, `contains` or `search` finds, `courses/{code}` confirms.
2. **Exact values from `facets`.** Before filtering on department, field, form or term, take the spelling from
   `facets` (e.g. `講義（メディア授業）`, `社会人基礎科目`); a value it does not list matches nothing.
3. **The student's own scope.** Faculty, department and year are in memory (`USER.md`). Courses a student can take
   are their department's plus the common ones (`共通基盤科目`, `社会人基礎科目`, and `教職…` only for the teaching
   course): filter with all of them. Use `grade` for the year. Say when you widened or narrowed the scope.
   情報学部 students have a major in memory (人工知能専攻, 情報工学専攻, 情報メディア専攻, 社会情報学専攻): the syllabus
   lists all their department's courses under `情報学科`; the major is not a filter (read 科目の位置づけ if it matters).
4. **In Japanese, with variants.** Rewrite the question into Japanese terms; for `contains`, also try the other
   spelling (`Illustrator` and `イラストレーター`, `Python` and `パイソン`); width and case do not matter.
5. **Never invent.** Course names, codes, percentages, weeks and instructors come from results you read in this
   conversation. Evaluation is quoted as printed: if `evaluation_sum` is not 100, say the syllabus prints it so.
6. **Cite the syllabus, not the service.** Every course in an answer has its code (`S-B231L03-01`), its Japanese
   name and the year (令和8年度); for one course, its syllabus link (`url`, on `syllabus.shonan-it.ac.jp`). The source
   line names 令和8年度 シラバス (link `https://syllabus.shonan-it.ac.jp/`), never the service's address.
7. **Long lists: count, show a part, offer to narrow.** When `total` is more than about 15, say the number, then a
   table of up to 15 courses with code, name, term and credits (the student's own department and the coming term
   first) and offer one way to narrow (term, department, form). Never write that a card or link holds "the full
   list" unless it really does (the syllabus site's link is not that list).
8. **Only the commands below.** Call the service with `curl` exactly as shown (also on Windows), Japanese only in the
   here-doc body; do not write your own client or encoder in Python, node or another language (a command running a
   script asks the student for approval), and copy filter values from `facets`, never translate them.
9. **Advice stays advice.** You may say which courses fit what the student said; registration itself is the
   student's (CampusSquare). Do not promise a course is offered at a time or has room.

## Search service

`https://sitossapi.gakuen.ac`, read-only, no key. Call it with the terminal (`curl`, also on Windows). **Japanese
goes only in a JSON body from a here-doc**, never in the URL or a command-line argument: Windows turns Japanese
arguments into `???`. Do not encode it yourself. In the body, a list means "any of these" for filters and "all of
these" for `contains` and `eval`.

```bash
API=https://sitossapi.gakuen.ac/v1
# the real values of every field (department, field, form, term, grade, required, credits, sections, evaluation items)
curl -sS --fail-with-body --max-time 30 "$API/courses/facets"
# every course meeting all filters (sorted by code; total + next_offset for more)
curl -sS --fail-with-body --max-time 30 -X POST "$API/courses" -H 'Content-Type: application/json' --data-binary @- <<'JSON'
{"faculty": "情報学部", "department": ["情報学科", "共通基盤科目", "社会人基礎科目"], "grade": 2, "term": "後学期",
 "eval": ["試験=0"], "limit": 50}
JSON
# every course whose text contains a word (optionally only in one section), with the sentence
curl -sS --fail-with-body --max-time 30 -X POST "$API/courses" -H 'Content-Type: application/json' --data-binary @- <<'JSON'
{"contains": ["Adobe"], "section": "履修の条件"}
JSON
# ranked by meaning (same filters as above)
curl -sS --fail-with-body --max-time 30 -X POST "$API/search" -H 'Content-Type: application/json' --data-binary @- <<'JSON'
{"q": "人工知能 機械学習 実習", "source": "shonan-it-syllabus", "faculty": "情報学部", "grade": 2, "limit": 8}
JSON
# one course: all fields, evaluation, the 15 sessions, every section (the code is ASCII: plain GET)
curl -sS --fail-with-body --max-time 30 "$API/courses/S-B231L03-01"
```

Filters of `courses` (and `search`): `faculty`, `department`, `field`, `required` (必修 / 選択 / 選択必修),
`credits` — exact values, repeat for any of several; `term`, `form`, `name`, `instructor`, `contains` — contained;
`grade` — courses open to that year (`1・2・3年次` counts for 1, 2 and 3); `eval` — `試験=0`, `試験<=20`,
`成果物・発表>=40` (items: 受講態度, 授業中の活動, 予習・復習, 成果物・発表, 試験, 学修の振り返り); `section` — where
`contains` looks (e.g. `履修の条件`, `授業の進め方`, `教科書`).

An HTTP 4xx answer is about your request, not the service: read the message it prints (`detail`), fix the request
(a value from `facets`, one value where one is expected) and send it again; never switch to the website for it.
Only no answer (connection error, timeout) or HTTP 5xx twice in a row means the service is down. Then say so and use
the school's own syllabus site `https://syllabus.shonan-it.ac.jp/` (search form; open it with the browser tools or
give the link), without claiming completeness.

## Procedure

1. **Classify and rewrite** the question (Rule 1), in Japanese. Note the student's scope from memory (Rule 3).
   Done when you know which calls you will make.
2. **Look up exact values** with `facets` when you filter on a field (once per chat is enough).
3. **List or find.** `courses` with filters / `contains`, or `search`. Read `total`: if it is larger than what came
   back, page with `offset` or narrow the filters, and say how many there are.
   Done when you have the candidate courses (or know there are none).
4. **Confirm the few you name.** For up to five courses you recommend or describe, `courses/{code}`: evaluation,
   履修の条件, 授業の進め方, plan. Check that each really fits the student's words (a `contains` hit may only mention
   the word: read the sentence).
5. **Answer.** Short answer first in the student's language; for a list, a table with code, name (Japanese), term,
   credits and the fact that matters (e.g. 試験 0 %, メディア授業), at most 15 rows (Rule 7); then the count ("64
   courses match; here are 15 of your department …") and the source: 令和8年度 シラバス, with the link for single
   courses.

## Interpretation

- `form` (授業形態): 講義 lecture, 演習 exercises, 実習 practice, 実験 lab, 実技 practical skills;
  `（メディア授業）` = taught as a media/online class.
- `term`: 前学期 April–September, 後学期 October–March; `（集中）` = intensive course on set days; `前学期・後学期`
  = runs all year.
- `grade` (配当年次): the year from which it can be taken, as printed (`2年次`, `1・2・3年次`).
- `required`: 必修 required, 選択必修 elective-required (choose among a group), 選択 elective.
- `evaluation`: the 全体の評価割合 row, in percent. 試験 = exams; 成果物・発表 = reports, works, presentations;
  授業中の活動 = participation and in-class work; 予習・復習 = homework; 受講態度 = attitude; 学修の振り返り = reflections.
- `active_learning` lists methods (グループワーク, プレゼンテーション, ICTの活用 …): use it for "group work", "hands-on".
- Same name, several codes: the course is offered separately by several departments; they are different courses.
- Attendance rules (5 absences = failed) are school-wide: `school-info` / `campussquare`, not the syllabus.

## Pitfalls

- `search` is ranked and cut off: "all courses that …" questions need `courses`.
- A `contains` hit can be a negation ("Python は使用しない") or another course's name in 履修の条件: read the sentence.
- `limit` is at most 200 for `courses`: use `next_offset` for long lists, and summarise instead of pasting 200 rows.
- The syllabus year is in every result (`year`); courses change every year: say which year you used.

## Verification

- The tool matches the question (conditions → `courses` filters; "mentions" → `contains`; topics → `search`), and
  filter values came from `facets`.
- Counts in the answer equal `total`; every named course has its code and comes from a result of this chat.
- A long list was cut to at most 15 rows with an offer to narrow; nothing claims to be the full list unless it is.
- Percentages and sessions are quoted as printed; the source is 令和8年度 シラバス (and the course link).
