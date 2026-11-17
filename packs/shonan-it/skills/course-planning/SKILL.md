---
name: course-planning
description: Suggest courses for the coming term from the student's credits, wishes and the syllabus, checked against CAP, categories and prerequisites.
version: 0.1.1
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, course-selection, registration, credits, syllabus]
    related_skills: [campussquare, syllabus, school-info]
  tomo:
    title: { en: "Course planning", zh: "选课规划", ja: "履修プランニング" }
    summary:
      en: "Suggests courses for the coming term from your credits (CampusSquare, with your permission), your wishes and the syllabus, and checks the plan against your registration limit, missing categories and prerequisites."
      zh: "根据你的学分（经你同意后读取 CampusSquare）、你的意愿和シラバス推荐下学期的课程，并核对选课上限、尚缺的科目区分和先修条件。"
      ja: "単位の状況（許可があれば CampusSquare から）、希望、シラバスをもとに次の学期の科目を提案し、登録上限・不足している区分・履修条件を確かめます。"
---

# Course planning (履修プランニング)

> **Before you answer, run the checker on your plan** (Procedure step 6): one terminal command with the plan on
> stdin. An answer without its output is not finished. The answer has a "Check" part whose numbers (CAP, each short
> category before → after, total credits) are copied from that output.

Helps the student choose courses for a term: what is still missing for graduation, what can be taken now, what fits
their wishes. It combines three sources and leaves every count to a script:

- **the student**: faculty, department / major, year, goals, workload wish, interests, formats, hard subjects, busy
  times — in memory (`USER.md`, from the first-run questions); ask only for what is missing and matters;
- **CampusSquare** (`campussquare` skill, with its rules for signing in, permission and kept pages): 自己判定 (short
  categories), 単位修得状況照会 (passed and failed courses), 履修登録・登録状況照会 (CAP left, registered courses);
- **the syllabus** (`syllabus` skill's service): candidates, evaluation, 履修の条件.

The school information service (syllabus, calendar) is used only with the commands of the `syllabus` and
`school-info` skills: open them (`skill_view`) and copy their `school-api.sh` commands; never type the service's
address or a `curl` command for it yourself.

## When to Use

- "Which courses should I take next term?", "Help me plan my registration", "I'm short in 社会人基礎科目, what can I take?"
- "Suggest electives for autumn that fit me", "Can I fit these courses into my CAP?"

Don't use for: one course's details or "which courses …" lists without planning (`syllabus`); grades or credits alone
(`campussquare`); dates (`school-info`, calendar).

## Rules

1. **Read-only, advice only.** Never register or cancel anything. The plan is a suggestion; the student registers in
   CampusSquare. Say which 時間割コード to enter only if it is on a page you read.
2. **CampusSquare by its own rules.** Follow `campussquare` for signing in, permission (decided once; if the student
   does not allow reading grades, plan without them and say what you could not check) and kept pages (a kept record
   first outside the registration window).
3. **Counts come from the checker, not from you.** CAP, credits per category, prerequisites, passed courses,
   duplicates, year and term: run `scripts/check_plan.py` on the draft and use its numbers. Fix what it reports and
   run it again (at most three rounds). Without a Python (the command fails), check each rule by hand from the list
   in "Checker" and say that the plan was not checked by the script.
4. **What the data cannot tell.** The syllabus has no day or period: say that clashes are not checked (in the
   registration period the 履修登録 page shows the slots). Which courses are required for the student's major and
   entry year is in the printed 履修要項, not here: call such courses "probably required" (必修 in the syllabus, own
   department, this year) and point to the 履修要項.
5. **Respect the student's wishes and limits.** Workload (`challenge` / `balanced` / `light`), formats (hands-on,
   group work, lectures), interests and hard subjects (at most one hard subject per term unless the student wants
   more; the first-run promise) shape the electives; never trade a missing required category for a preference.
6. **Cite.** Every course with code and Japanese name; CampusSquare numbers with the page, term and "as of" note (or
   the kept record's period and read date); the syllabus year (令和8年度 シラバス).

## Procedure

The checker runs with Tomo's own Python (`TOMO_PYTHON`; older Tomo has none, then a system Python is tried) — see
step 6 for the command.

1. **The term to plan.** `calendar` (school-info's service): if `registration_open` names a term, plan that one;
   otherwise the next term (前学期 of the next year from October, 後学期 from April). The syllabus service has the
   current year (`facets` → `year`); when the term to plan is in a year not published yet, plan with the current
   year's courses and say that courses and their terms may change. Done when you know the term and year.
2. **The student.** From memory: faculty, department / major (情報学部 majors → syllabus department `情報学科`), year,
   wishes. Ask one short question only if the year or department is missing.
3. **The records** (`campussquare`, Rule 2). First `tomo_records_get` for `campussquare.self-check`,
   `campussquare.credits` and `campussquare.registration` (period: the current term, e.g. `2026年度 後学期`; outside the
   registration window). Open CampusSquare only for what has no kept record. What you need: 自己判定 → the `■` rows with base, upper limit, earned, registered;
   単位修得状況照会 → passed (合) and failed (否) course names; 履修登録・登録状況照会 → CAP残り and this term's
   registered courses. CAP残り is for the term on that page: when you plan the next term, its limit is not known
   yet (`cap_left: null`); say so and keep the plan to a usual term's load (about 20–24 credits). Done when you have them, or know they cannot be read (then plan without them, say so).
4. **Candidates** (`syllabus`'s service): `courses` with the student's faculty, department plus 共通基盤科目 and
   社会人基礎科目, `grade`, `term`; drop passed courses; add failed ones that are offered (retakes). For short
   categories, filter by `department` / `field` matching the ■ row. For wishes: `search` with interests,
   `eval` for workload (light: low 試験 share), `form` / `active_learning` for formats.
5. **Details of the short list** (≤ 10): `courses/{code}` → 履修の条件 (prerequisites: course names; "required" when
   the text demands it, else recommended), evaluation, 授業の進め方. Mark a course `hard` when it belongs to one of the
   student's hard subjects (e.g. math: 数学 in its name or 履修の条件).
6. **Draft and check — run the checker on your plan.** Choose a plan (short categories first, retakes,
   probably-required courses, then wishes), give it to the checker (format in "Checker") on stdin.
   Reading the script or `--help` is not a check: the answer's numbers must come from this output.

   ```bash
   PY="${TOMO_PYTHON:-$(command -v python3 || command -v python)}"
   "$PY" "${HERMES_SKILL_DIR}/scripts/check_plan.py" - <<'JSON'
   {"student": {"year": 3, "term": "前学期"}, "cap_left": null, "earned_total": 48, "registered_total": 20,
    "categories": [ … ], "passed": [ … ], "failed": [ … ], "candidates": [ … ], "plan": [ … ]}
   JSON
   ```

   Fix what it reports as `error` (or explain why a `warning` is fine) and run it again. Done when `ok` is true, or
   after three rounds with what is left explained.
7. **Answer.** Short summary first, then a table: code, course (Japanese), category it counts for, credits, term,
   one reason; then **Check** (from the checker's output): each short category before → after the plan, CAP, total
   credits after (of 124), and any warning that stays;
   then what was not checked (day/period, 履修要項) and the sources. Offer one change ("lighter", "more hands-on").

## Checker

`plan.json`:

```json
{
  "student": {"year": 2, "term": "後学期", "max_hard_per_term": 1},
  "cap_left": 8, "earned_total": 60, "registered_total": 20,
  "categories": [{"name": "■社会人基礎科目", "base": 24, "max": null, "earned": 18, "registered": 4}],
  "passed": ["プログラミング基礎"], "failed": ["確率統計リテラシ１"],
  "candidates": [{"code": "S-B231R08-01", "name": "キャリアマネジメント", "grade": "2年次", "term": "後学期", "credits": 2,
                  "counts_for": "■社会人基礎科目", "prerequisites": [], "hard": false}],
  "plan": ["S-B231R08-01"]
}
```

Values as read (names as on the pages; the checker normalises width, spaces and `【…】`). `counts_for` is the ■ row
the course fills (from its 学科・科目区分 / 科目分野), or leave it out. `cap_left` / totals `null` when unknown.

It reports per course `ok` / `warning` / `error` with reasons: already passed; twice or two options of one course
(〜…コース〜); 配当年次 not reached (error) or an earlier year's course (warning: check the 履修要項); taught in another
term; a required prerequisite not passed (error) or a recommended one (warning); a retake. Then `cap` (over by),
`categories` (short before, plan adds within the upper limit, short after), `retakes_not_planned`, `hard_subjects`
(too many), `totals` (after, left to 124) and `ok`.

## Pitfalls

- Names differ between CampusSquare and the syllabus (full-width letters, `【…】`, shortened names): give the
  checker the names as read; for matching codes, use the syllabus.
- CAP counts only credits within graduation requirements (`※上記には卒業要件外の単位は含まない`): teaching-course
  credits may not count against it; say so if the plan has them.
- 集中 courses (`前学期（集中）`) run on set days: mention them; they take no weekly slot.
- A long candidate list: keep the plan to what fits CAP; mention two or three alternatives at most.

## Verification

- Every number in the answer (credits, categories, CAP, totals) is in the checker's last output, or the answer says
  the plan was checked by hand.
- No registered or passed course is suggested again; every suggested course has its code.
- The answer says that day/period clashes and the 履修要項's required courses were not checked.
