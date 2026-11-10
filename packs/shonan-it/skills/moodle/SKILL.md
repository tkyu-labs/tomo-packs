---
name: moodle
description: The student's courses on the school's Moodle (one site per academic year) — deadlines, assignments and their status, quizzes, grades and feedback, course material and announcements; quick messages to classmates and teachers (Moodle forwards them as mail).
version: 0.1.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, moodle, lms, assignments, quizzes, deadlines, grades]
    related_skills: [campussquare, google-workspace, syllabus]
  tomo:
    title: { en: "Moodle", zh: "Moodle", ja: "Moodle" }
    summary:
      en: "Reads your Moodle in a browser window you can see: what is due, your assignments and quizzes, grades and feedback, each class's material, and messages to teachers and classmates. Submitting and sending are always yours."
      zh: "在你看得见的浏览器窗口里读取 Moodle：要交的作业、作业和小测、成绩与反馈、每门课的课件，还能给老师和同学写消息。提交和发送永远由你决定。"
      ja: "見えるブラウザで Moodle を読みます：締切、課題や小テスト、評点とフィードバック、各授業の資料、先生や友だちへのメッセージ。提出と送信は必ずあなたが行います。"
---

# Moodle (Shonan Institute of Technology)

The school opens a new Moodle every academic year: `https://moodle{year}.shonan-it.ac.jp` (the year the academic
year starts: April 2026 – March 2027 is `moodle2026`). Last year's site stays online as an archive; older ones open
only inside the school network. The account is the same as CampusSquare (student number and password). Moodle's app
API is switched off at this school, so this skill works in Tomo's visible browser and reads with `browser_console`
from the signed-in page (`references/extract.md`).

## When to Use

- "What's due this week?", "Did I submit the report for X?", "Which quizzes are still open?"
- "What did the teacher write on my assignment?", "What is my grade in X?"
- "What is this week's material for X?", "Explain today's slides", "Help me with today's 必須課題"
- "Which classes do I have on Moodle?" (course names carry the term and the slot, e.g. `[火1]`)
- "Send a message to Prof. 佐藤: I'll be absent on Tuesday", "Ask my classmate X about the group work" (Moodle
  messages; Moodle forwards them to the person's mail)

Don't use for: credits, GPA and the official grades (`campussquare`), the syllabus (`syllabus`), school mail
(`google-workspace`), or anything when the student said Tomo may not read their personal data (see `USER.md`) —
then say where to look and stop.

## Rules

0. **Newer Tomo only.** Tomo protects Moodle as a personal-data site only from the version that has the
   `tomo_page_image` tool. Without that tool, do not open Moodle at all: tell the student that this needs a newer
   Tomo (Settings → About) and where to look in Moodle themselves.
1. **The right year.** This academic year's site unless the student asks about last year (then the archive) or
   an older year (say it opens only on campus). Never guess another host.
2. **Signing in: never type or read the password.** On the login form (`ユーザー名`, `パスワード`, button
   `ログイン`): first check with `browser_console` whether the browser has filled in the password
   (`document.querySelectorAll('input[type=password]:-webkit-autofill').length`; try three times, a second apart,
   the browser fills in a moment after the page opens). Filled → press `ログイン` once (`browser_click`). Otherwise
   (and on a year's site the student has not used yet, where the browser only *offers* the saved login) ask once
   with `clarify` (choice "Done"): "Please click the user name field, choose your saved login (or type it) and sign
   in." Never press `ログイン` on an empty form: a failed sign-in counts against the account.
3. **Personal data: Tomo decides.** Moodle is a personal-data site under the student's one-time consent: page
   snapshots show only headings and controls; read values with `browser_console` (`references/extract.md`). Never ask
   for permission yourself. Read only the courses and activities the question needs.
4. **Images: only through `tomo_page_image`.** A figure in a question or slide (a table drawn as an image, a chart):
   `tomo_page_image(src)` then `vision_analyze` on the file it returns. It refuses anything that is not question or
   course material; page screenshots are not available on Moodle. Older Tomo has no such tool: say the question has
   a figure you cannot see and describe what the text asks.
5. **Quizzes and assignments follow the answer mode** (the "Answer mode" line Tomo adds to every question):
   - *direct answer*: work out each answer, select or fill it in on the page (`browser_click` on the choice,
     `browser_type` for a short answer) and tell the student briefly why for each one.
   - *information chain*: do not choose or fill in anything. Explain what each question asks, the idea behind it and
     where in the course material it is (week, file, page); the student answers.
   In both modes: **never press `テストを終了する …`, `すべてを送信して終了する`, `提出する`, `課題を提出する` or any
   final submit** — stop there and tell the student what is left for them to check and submit. Start a new quiz
   attempt (`受験する`) only when the student asked to do that quiz now, after telling them the time limit and
   attempts allowed (from the quiz page); continuing an open attempt (`あなたの受験を続ける`) is fine.
6. **Messages: you write, the student sends.** A message cannot be taken back. Write it into the message box and
   stop; then either leave `メッセージを送信する` to the student, or ask with `clarify` (show recipient and the whole
   text; choices "Send" / "Not yet") and press `メッセージを送信する` only after "Send". Never press Enter in the
   message box (Moodle may send on Enter). Make sure of the recipient first: several people share a family name; a
   student's entry starts with a student number, a teacher's has none; when more than one could be meant, ask which.
7. **Otherwise read-only.** Never upload files, post in forums, answer questionnaires or feedback forms, change
   settings or mark activities complete. Say which button the student presses.
8. **Close when done.** `tomo_browser_close` (if it exists) unless the student keeps working there. Do not sign out
   (staying signed in spares the next sign-in).

## Procedure

1. **Open the year's site.** `browser_navigate` `https://moodle<year>.shonan-it.ac.jp/my/`. Signed in when the page
   is `/my/` (not `/login/index.php`); else Rule 2. Done when signed in.
2. **Find what the question is about** with `browser_console` ("Courses", "Upcoming", "Notifications", "Course
   outline" in `references/extract.md`). Course names: `【学部】学期_科目名[曜日時限]`. Sections are usually one per
   class meeting with its date (`第７回　１１月１０日`): "today's" = the section with today's date.
3. **Details** by page ("Assignment", "Quiz", "Grades in a course", "All grades"): `browser_navigate` to the
   activity's URL, then the extraction. Text material (`ページ`, labels) is read the same way. Files (`ファイル`, PDFs):
   Tomo cannot read them yet — give the file's name and link and let the student open it.
4. **A quiz** (Rule 5): open it, note 受験 status, time limit and attempts; continue or start as allowed; per page
   read the question ("Quiz page"), answer or explain, `次のページ`; stop before the finishing button and summarise
   (each question, the chosen answer and why — or, in information chain mode, what to look at).
5. **A message** (Rule 6): open the message drawer (the speech-bubble icon top right, `メッセージドロワを切り替える`),
   click the `検索` box, type the name and press Enter there; results are under `コンタクト` / `非コンタクト`, press
   `さらに読み込む` until it is gone. Pick the person ("Message recipients" in `references/extract.md`); open the
   conversation, click `メッセージを書く ...` and put the text in with `browser_type` (no Enter). Write in Japanese for
   teachers (`様` / `先生`, name and student number as `{{FULL_NAME}}` / `{{STUDENT_NUMBER}}`; see the google-workspace
   skill's writing guide). Done when the text is in the box; then Rule 6.
6. **Answer** with course, activity, dates with weekday and time (Asia/Tokyo), status as Moodle shows it
   (提出済み, 未提出, 評定済み …), and the link. Name the site year when it is the archive.

## Interpretation

- `提出ステータス`: 提出済み (submitted), 未提出 / 提出物なし (not submitted), 下書き (draft, not submitted yet).
  `評定ステータス`: 評定済み (graded) / 未評定. `残り時間` turns into "期限超過" after the deadline.
- Upcoming events: `assign:due` = assignment deadline, `quiz:close` / `questionnaire:close` / `feedback:close` =
  closes then; `overdue: true` = past and not done.
- A quiz's `評定方法: 最高評点` = the best attempt counts.
- 必須課題 / 自由課題 are the teacher's names (required / optional); the course's own rules (deadline notes in the
  description) win over guesses.

## Pitfalls

- The archive's courses have no end date: whether a course is "past" comes from the site's year, not Moodle.
- `modname` in the course outline is localised (`ファイル`, `課題`); use `module` (`resource`, `assign`, `quiz`).
- A quiz page shows one question; a question's figure is an `<img>` in `.qtext` (Rule 4).
- Moodle's session expires after a while: a login page in the middle means Rule 2 again.

## Verification

- Every item named has course, activity, date and link; nothing was submitted, posted or uploaded.
- In information chain mode no answer was chosen or filled in; in direct mode each filled answer has a short reason.
- Quizzes stopped before the finishing button, and the answer says what the student still has to do.
- A message was sent only after the student chose "Send" in a `clarify`, or it was left in the box for them.
