---
name: toyonet-g
description: Read Toyo University registered classes, course grades, displayed GPA and credits through ToyoNet-G. Find the published timetable, campus cancellation boards and navigation for other academic records.
version: 0.1.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  tomo:
    title: { en: "ToyoNet-G academic records", zh: "ToyoNet-G 学业查询", ja: "ToyoNet-G 学修記録" }
    summary:
      en: Check courses, schedules, grades, GPA and credits in the visible browser. You sign in yourself.
      zh: 在可见浏览器中查询课程、课表、成绩、GPA 和学分。登录由你自行完成。
      ja: 見えるブラウザで履修科目・時間割・成績・GPA・単位を確認します。ログインはご自身で行います。
---

# ToyoNet-G

## When to Use

- What classes did I register for? What is my Tuesday timetable? Where is this class?
- What grade did this course receive? What GPA is displayed for this term or year of study?
- Which requirements show a credit shortfall? How many credits are in progress?
- Where can I find the university timetable or today's campus cancellation board?
- Where can I find the exam schedule, official graduation decision or syllabus? For these, give navigation
  from [references/pages.md](references/pages.md) and let the student check the displayed result.

Use the portal to read records. Direct the student to the relevant screen for actions like registration,
cancellation, submissions, settings, bookings, or printing.

## Rules

1. The student signs in and completes any multi-factor authentication themselves in Tomo's visible browser.
   Never type, ask for, store, or inspect credentials, recovery codes, authentication URLs, or session values.
2. Read only while the student is present. Say which page and fields you need. Use Tomo's browser consent
   flow and respect a declined read or Hatch refusal. Give the menu path on refusal.
3. Limit `browser_console` to the supplied extraction expression and the requested fields and filters.
   Leave identity blocks, student numbers, profile fields, guarantor, bank and health pages outside the read.
   Keep records out of files, memory, logs and external services. Never use a screenshot or whole-page dump.
4. Use the visible controls for navigation and read-only display. Allowed examples include `検索`, `クリア`,
   `戻る`, and `全時限を表示` on the matching inquiry screen. Leave `印刷`, `成績表印刷`,
   `履修取消申請`, `成績調査申請`, settings, registration and all submissions to the student.
5. Sign out when done. Return from the child window to the portal and use `ログアウト`, confirming that the
   control is the sign-out action. If Tomo cannot target or close the child window, guide the student back
   and ask them to sign out there. Call `tomo_browser_close` only if available after sign-out.

## Procedure

1. **Pick the page and scope.** Use [references/pages.md](references/pages.md). Take the exact term,
   academic year, course name or campus from the request and available context. For a person asking about
   a single course, filter to it before returning results. Done when the page and minimum fields are known.
2. **Open ToyoNet-G.** Use `browser_navigate` to open `https://g-sys.toyo.ac.jp/portal/` in the visible browser.
   If a sign-in page appears, let the student sign in there. Wait for `学生メニュー／Menu`. Done when the portal
   is visible or you have given the student the entry path to continue.
3. **Open the matching inquiry.** Expand its menu group and click the exact entry. Follow the actual
   child window, letting the student bring it forward if Tomo remains on the parent. Run `検索` on the
   course-history or credit selection screen, or `全時限を表示` on the university timetable. For guidance-only
   questions, give the menu path or official public entry and skip extraction. Done when the intended
   result grid is visible, or the reason it cannot be inspected is clear.
4. **Read the requested records.** Read [references/extract.md](references/extract.md), copy the full
   expression from `scripts/read-records.js`, and set only its `REQUEST` object. Run it with `browser_console`
   on the active result page. Wait for Tomo's consent flow. Done when the requested fields are available
   or the script and the page identify the gap.
5. **Answer and finish.** Cite the ToyoNet-G page label, relevant scope and stable portal or board link.
   If a read failed, describe the visible state and give the exact manual menu path. Sign out as described
   above. Done when the student has the answer or a verified path and the sign-out state is clear.

## Interpretation

- `履修登録確認表` is the student's registration record. `授業時間割表照会` is the university timetable.
  Confirm the academic period for recurring courses. For a question about today, check the date,
  the applicable [academic calendar](https://www.toyo.ac.jp/campuslife/student_support/lecture/) and the
  appropriate cancellation board before claiming a class will meet. Preserve an unscheduled course's
  displayed note or say that the regular weekday and period are unavailable.
- `履修・修得科目` can show multiple attempts. Keep the offering year and period alongside each grade where
  relevant. `成績備考` is a separate field. Leave a blank grade unknown.
- Use the displayed report for GPA. Keep term rows, merged summary rows and year-of-study rows distinct.
  The term GPA counts graduation-requirement courses. In the year-of-study table this scope also applies
  to earned credits and the grade breakdown. Use the displayed scope rather than calculating a new GPA.
- For a shortfall, report the displayed `要件` and `不足単位`. Distinguish `修得単位` (earned),
  `履修中単位` (in progress), and `判定単位` (the assessed figure displayed by the portal).
  Refer to `卒業等各種判定結果照会` for the university's formal decision.

## Pitfalls

- The same portal tab can stay visible when an inquiry opens a child. Wait for the actual result and
  check the route before reading. Keep the parent for return navigation and sign-out.
- A login page, consent refusal, missing table, browser error, or unexpected layout gives no record
  result. Distinguish these from a verified table with no matching rows. If the window is still loading
  or expanding, wait for its result heading and retry the extraction once.
- Some tables contain empty-state rows, merged cells, hidden copies or multiple groups. Run the scoped
  expression. If it reports an unrecognized table or irregular rows, explain the part you could establish.
- The campus cancellation boards are location-specific. 赤羽台WELLB and 赤羽台INIAD are separate boards.
  A board describes cancellations, while makeup classes and later classroom changes use other notices.

## Verification

Before answering, confirm the result is from ToyoNet-G's intended page, the mode matches the question, and
the year, term or campus is the one requested. For personal records, confirm that only needed fields were
returned with consent. Cite the exact display label and state when a result is partial or unavailable.
