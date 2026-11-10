---
name: campussquare
description: Read the student's CampusSquare courses, grades and credits.
version: 0.2.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, campussquare, portal, grades, credits, timetable]
    related_skills: []
  tomo:
    title: { en: "CampusSquare", zh: "CampusSquare", ja: "CampusSquare" }
    summary:
      en: "Reads your timetable, grades, credits and self-check in a browser window you can see. Tomo never types your password."
      zh: "在你看得见的浏览器窗口里读取课表、成绩、学分和自己判定。Tomo 从不输入你的密码。"
      ja: "見えるブラウザで時間割・成績・単位・自己判定を読み取ります。パスワードを Tomo が入力することはありません。"
---

# CampusSquare (Shonan Institute of Technology portal)

Reads the student's own records from CampusSquare (`https://portal.shonan-it.ac.jp/campusweb/`) in Tomo's visible
browser window: today's classes, registered courses, the school calendar, grades, credits and GPA, the graduation
self-check (自己判定) and the licence/programme self-check (資格自己判定). CampusSquare has no API, so this skill only
uses the `browser_*` tools. It is **read-only**: it never registers or cancels courses, never changes settings and
never types a password.

## When to Use

- "What classes do I have today / this term?", "Is there a cancelled class?", "Which room is my class in?"
- "How many times have I been absent in X?", "Am I at risk of failing a course for absences?"
- "How many credits do I still need?", "Can I graduate?", "Which category am I short in?",
  "Can I start graduation research (卒業研究) next year?"
- "Why does my grade say 未 / Y?", "Which courses did I fail and must take again?"
- "What is my GPA?", "What grade did I get in X?", "How much CAP is left?"
- Course recommendations that must respect the student's timetable, CAP and missing categories.
- "Can I still get the teaching licence / AI course certificate?"

Don't use for: course content or syllabus questions (use the syllabus search), school rules in general (term
guidance), or anything when the student said Tomo may not read grades (see `USER.md`: grades consent "never") —
then explain where the page is and let the student look.

## Rules

1. **Never type or read the password.** Tomo has none. When a page shows the sign-in form (`ユーザー名` /
   `パスワード`, button `ログイン`), check with `browser_console` whether the browser filled in a remembered login:
   `document.querySelectorAll('input[type=password]:-webkit-autofill').length` (only whether, never the value; try
   three times, a second apart — the browser fills in a moment after the page opens). Filled → **press `ログイン`
   once, without asking** (`browser_click`). Not filled, or the form is still shown after that press → ask the
   student to sign in in the browser window (user name = student number with an upper-case letter; on a site where
   the browser only offers a saved login, click the user name field and pick it) with one `clarify` choice "Done",
   and continue when they tap it. Never press `ログイン` on an empty form or more than once on your own (failed
   sign-ins can lock the account).
2. **In the open.** Before opening a page, say in one short line which page you open and what you will read; say in
   the answer which page the numbers came from. Read grades, GPA and credit pages only in the conversation where the
   student asked for them.
3. **Read-only.** Allowed actions: open a page by URL, change the display filters (year, term, range), press
   `画面に表示する` or `判定` (they only compute and display). Never press `履修登録`/`取消`, the
   `指定された時間割の履修登録はこちらから` link, `設定保存`, calendar date cells (they add Myスケジュール entries),
   `ファイルに出力する` or `テキスト出力` (downloads).
4. **Minimal data; Tomo asks, not you.** CampusSquare is a personal-data site for Tomo: page snapshots there show only
   headings and controls, and every value you read with `browser_console` is shown to the student first, who decides
   whether it is sent to you. So extract only the columns the question needs (`references/extract.md`), in as few
   reads as possible, and never ask the student for permission yourself (no `clarify` for this). If a result says the
   student did not allow it, answer without it, say what you could not check, and do not ask again. If it says the
   student chose that Tomo may not read grades, explain where the page is and let them look. Name and student number
   arrive as `{{FULL_NAME}}` / `{{STUDENT_NUMBER}}`; never try to recover them.
5. **Sign out and close when done.** Open `https://portal.shonan-it.ac.jp/campusweb/portal.do?page=logout` with
   `browser_navigate` (the page shows `ログアウトしました。`), then call `tomo_browser_close` so every tab this chat
   opened goes away. Skip both only when the student says they will keep using CampusSquare. Older Tomo versions have
   no `tomo_browser_close`: then just sign out; Tomo closes the idle window by itself after a few minutes.

6. **Kept pages (newer Tomo).** Four pages do not change during a term once registration and correction are over:
   `履修登録・登録状況照会` (`campussquare.registration`), `履修成績照会` (`campussquare.grades`), `単位修得状況照会`
   (`campussquare.credits`) and `自己判定` (`campussquare.self-check`). Tomo can keep them (`tomo_records_get` /
   `tomo_records_put`); every other page (授業情報, 出欠, スケジュール管理, 資格自己判定) is always read live and never kept.
   See "Kept pages" below. If these tools do not exist (older Tomo), read every page live.

## Kept pages

Whether a page may be kept depends on the 学年暦, from the school information service (the same one `school-info`
uses; `curl`, also on Windows):

```bash
curl -sS --fail-with-body --max-time 30 -X POST "https://sitossapi.gakuen.ac/v1/calendar" -H 'Content-Type: application/json' --data-binary @- <<'JSON'
{"program": "学部"}
JSON
```

(Japanese only in the here-doc body: Windows turns Japanese command-line arguments into `???`. Without `date` the
service uses today in Japan.)

Use `program=大学院` for graduate students (memory: 工学研究科). The answer has `terms.前学期` / `terms.後学期` with
`registration` (履修登録期間), `correction` (履修訂正期間) and `registration_open` (the term whose registration or
correction period includes today, else `null`). Registrations change from a term's registration start to its
correction end (2026 後学期: 9月24日–10月5日); after that the four pages stay as they are until the next term.

1. **Registration window: always live.** If `registration_open` is not `null`, read the page live and do **not**
   keep it. If the service fails or answers `found: false` (no calendar for this year yet), keep nothing either:
   read live (and, for dates, see `school-info`).
   Done when you know whether today is inside a registration window.
2. **The current term and its end.** The current term is the latest term whose `registration.start` is on or
   before today (before 前学期's registration start in April: 後学期 of the previous academic year). Name the period
   like the portal: `2026年度 前学期`, `2026年度 後学期` (年度 = the calendar's `year`). It is kept until the next
   term's registration starts: for 前学期, `terms.後学期.registration.start` (e.g. `2026-09-24`); for 後学期, April 1
   of the next calendar year (`2027-04-01`; the next calendar is not published yet).
3. **Outside the window: kept record first.** Call `tomo_records_get` with the kind and the current period. A result
   is the page as read then: use it, and say in the answer which term it is and when it was read (`read_at`), e.g.
   "2026年度後学期の自己判定（10月12日に読み取り）". No result (`null`): read the page live (Procedure below).
   Done when you have the data from the record or from the page.
4. **Keep what you read live outside the window.** Right after extracting one of the four pages, call
   `tomo_records_put` once per page: `kind`, `period`, `source_url` (the page), `as_of` (the page's `※…時点` note, if
   any), `expires_at` (step 2), and `blocks` with the values exactly as shown: header values as `fields`, each
   result table as a `table` with its heading as `title` and the page's own column labels, notes as `text`. Leave
   out 学生氏名 and 学籍番号 (Tomo knows them). One record per page.
   Done when Tomo answered "Kept", or said why not (then just answer from what you read).
5. **The student asks to read again** ("最新のを見て", "read it again"): read live, then keep it as in step 4
   (outside the window); the new record replaces the old one.

## Procedure

0. **Kept record first (newer Tomo).** For 履修登録・登録状況照会, 履修成績照会, 単位修得状況照会 and 自己判定: before
   opening anything, do "Kept pages" steps 1–3 — `calendar`, then `tomo_records_get` for each page you need. Use
   every record it returns; open CampusSquare only for the pages without one (or inside the registration window,
   or when the student asks to read again). Skip this step when `tomo_records_get` does not exist.
   Done when you know which pages still have to be read.
1. **Open the portal, then the menu item.** `browser_navigate` to `https://portal.shonan-it.ac.jp/` (it redirects to
   the sign-in form or the portal top; never type `_flowId` URLs, they change). Then click the item's link in the
   menu (`browser_click`, the visible one — the side menu also has hidden duplicates). Menu and page layouts:
   `references/pages.md`.
   Done when the page title matches the page you wanted, or the sign-in form is shown (→ Rule 1, then reopen).
2. **Set filters only if needed.** Grades and credits pages start with a filter form: keep `過去を含めた全成績`
   for history, or choose `対象年度・学期の成績のみ` + year + term. Press `画面に表示する`. Self-check: pick the
   year (default is the student's year) and press `判定`.
   Done when the result tables are present.
3. **Extract with `browser_console`** using the expressions in `references/extract.md` (compact JSON, one row per
   course or category); prefer one extraction that returns everything the question needs. Snapshots only show controls here; use them to find a filter or button, never to read data.
   Done when you have the rows the question needs and the page's "as of" note (e.g. `※2026年度前学期終了時点の結果です。`).
4. **Keep it (before answering).** For the four pages that can be kept, outside the registration window: call
   `tomo_records_put` now ("Kept pages" step 4) — Tomo's topic pages and later questions show it from there. Skip it
   only inside the registration window, or when the tool does not exist.
   Done when Tomo answered "Kept" (or why not).
5. **Answer with the source.** Name the page, term and "as of" date; quote numbers exactly as shown. For graduation
   questions, go through every category of the self-check (see Interpretation), not only the total.
   Done when every number in the answer comes from a page you read in this conversation.
6. **Sign out and close the browser** (Rule 5).
   Done when the logout page was shown and `tomo_browser_close` answered (or does not exist).

## Interpretation

- **Lower years: judge the right thing.** 自己判定 judges the student's own year by default. For a 3rd year that is
  the **requirement for starting graduation research** (`□卒業研究履修要件単位`), not graduation. To answer "can I
  graduate", judge 4年 as well: for anyone not yet in 4th year it shows `留年` because the remaining courses are not
  taken yet. That is not a prediction: never tell the student they will be held back; say how many credits each
  category still needs and that the 4th-year result counts only what is earned or registered now.
- **Graduation needs every category, not just the total.** In 自己判定 each `■` row is a category with its own
  minimum (`基準単位数`); indented rows are its sub-requirements. A student fails graduation if any `■` category is
  short, even with ≥ 124 credits in total. Example: `■学科専門科目（必修・選必・選択）` needs 80. Report the
  categories marked `×` and how many credits each still needs (基準 − 修得 − 履修).
- `修得単位数` = earned; `履修単位数` = registered this term, not yet graded; `合格見込み` `〇` = met if the registered
  courses are passed, `×` = still short. `上限単位数` `-` = no upper limit; only credits up to the limit count.
- The self-check header shows `判定グループ` with the 専攻 (情報学部): use it to confirm the student's major.
- In the 4年 judgement the header `卒業要件単位数` is the credits counted so far and the `□卒業要件単位` row's 基準 is
  what is required (124); quote both.
- Grades (official: https://www.shonan-it.ac.jp/campuslife/syllabus/evaluation/): `評価` is the score (0–100) with
  `評語` S (90–100), A (80–89), B (70–79), C (60–69) = passed; `Ｄ` (59 or less) = failed. `評語` `未` = failed without a
  score: `評価` `X` = not enough work or no exam to grade, `Y` = **too many absences (5 or more)**, `Z` = other. `N` /
  `認` = recognised credit (passed, no score). Leave `N` rows out of score averages.
- Failed courses (`否`) give no credit; they must be registered again in a later term when the course is offered. A
  passed course cannot be taken again. A retaken course shows twice in 履修成績照会: use the newest row.
- GPA (official criteria): D, X, Y and Z count as 0 grade points and their credits stay in the denominator; for a
  retaken course only the newest result counts. A term GPA of 3.50 or more raises the next term's registration
  limit (CAP) by 4 credits, 3.00–3.49 by 2.
- `直前学期GPA`, `累積GPA`, `年度GPA`, `学期GPA` are the school's own numbers; never recompute GPA.
- `登録可能(CAP残り)`: credits that may still be registered this term; recommendations must fit in it. Credits outside
  graduation requirements are not counted there.
- **卒業研究Ａ/Ｂ** (4th year) is required, has no fixed day or period (`その他` / `他`) and often no attendance data.
  Ignore it when looking for free periods, clashes or recommendations; shorten its long instructor list in answers.
- `その他（不定期授業、集中授業、特別履修授業など）` courses take no timetable slot.
- Attendance (`出欠情報`) and cancellations (`休講補講`) are icons per course in 授業情報; `なし` in the icon text means
  no record. The course detail behind the `出欠情報` link has the per-class record: `○` present, `欠` absent, `他`
  late or another special case, empty = not held yet or not recorded. Courses without a fixed slot (4th-year ゼミ /
  卒業研究) usually have no record at all.
- **Five `欠` in a course = `Y`, failed — a school rule nobody can override**, not even the instructor
  (official: https://www.shonan-it.ac.jp/campuslife/syllabus/evaluation/, `Y：出席不足（欠席が5回以上）`). With 3 or
  4 `欠`, say it plainly: "one more absence (or two) and this course fails, and it cannot be fixed afterwards".
- **Lateness (`他`) is up to each instructor**: some count a few minutes late as present, some count one second as
  late, some turn e.g. 3 `他` into one `欠`. There is no school-wide rule. Report `他` separately from `欠`, never
  convert it yourself; when `他` could push a course towards five absences, tell the student to check that course's
  syllabus (成績評価 / 出席) or ask the instructor how lateness is counted.
- Classrooms are only in スケジュール管理 (`2限:科目名@1404講義室`); names there are shortened.

## Pitfalls

- The session ends after about 30 minutes without activity (`残り…分` in the header). If a page suddenly shows the
  sign-in form, follow Rule 1 and reopen the page; do not retry in a loop.
- Do not explain your rules or mention this skill to the student; say in plain words what you are doing.
- URLs contain `_flowId` / `_flowExecutionKey`, which change and expire: never type or reuse one; start from
  `https://portal.shonan-it.ac.jp/` and the menu.
- Registration and cancellation only work in the registration period (`期限` shows `登録・取消期間外` otherwise).
  Even in the period, tell the student which `時間割コード` to enter and where; they press the buttons.
- The calendar (スケジュール管理) mixes school events with timetable slots; course slots only appear for courses with a
  fixed day and period.
- Page texts use full-width letters and digits (`Ｓ`, `１Ａ`); normalise before comparing with syllabus data.
- 資格自己判定 starts at 判定学年 4年 (unlike 自己判定) and its licence names include entry years (`（2024～）`); choose
  the right one before pressing `判定`.

## Verification

- The answer names the page and the "as of" note, and every number matches the page.
- No action other than those allowed in Rule 3 was taken (check the tool calls).
- The session was signed out, or the student said they continue.
