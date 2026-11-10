---
name: google-workspace
description: Read and search the student's school Gmail, explain mails, write drafts (sent only when the student says so), and open Docs / Sheets / Slides / Forms / Calendar links from mail.
version: 0.1.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, gmail, mail, google-workspace, drafts, google-forms, google-calendar]
    related_skills: [campussquare, school-info]
  tomo:
    title: { en: "School mail (Gmail)", zh: "学校邮件（Gmail）", ja: "大学のメール（Gmail）" }
    summary:
      en: "Reads and searches your school Gmail in a browser window you can see, explains mails and writes drafts. It never sends a mail unless you ask it to or say OK."
      zh: "在你看得见的浏览器窗口里读取和搜索学校 Gmail，解释邮件内容并帮你写草稿。除非你要求或同意，否则不会发送邮件。"
      ja: "見えるブラウザで大学の Gmail を読み、検索し、内容の説明や下書きをします。あなたが頼むか OK しない限り、メールを送信しません。"
---

# School mail and Google Workspace (Shonan Institute of Technology)

The school's mail is Google Workspace (Gmail, `@sit.shonan-it.ac.jp`). There is no API for Tomo: everything happens
in Tomo's visible browser window with the student's own Google sign-in, which stays signed in between chats. Gmail is
the main use; Docs, Sheets, Slides, Forms and Calendar links (usually found in mails) are read or pre-filled the same way.

## When to Use

- "Any new mail?", "Did 学生課 / my professor write to me?", "Find the mail about 奨学金 / 履修取消"
- "What does this mail mean / what do I have to do and by when?" (Japanese mails explained in the student's language)
- "Write a mail to my professor: I will be absent", "Reply to the mail from 学生課" (drafts)
- "Send it" (only after a draft the student has seen, see Rule 3)
- A Google Form, Doc, Sheet or Slides link in a mail: read it; fill a form in advance; add a date to Google Calendar

Don't use for: the official website's notices (`school-info`), CampusSquare (`campussquare`), anything when the
student said Tomo may not read their personal data (see `USER.md`) — then tell them where to look and stop.

## Rules

1. **The student's own account, in the open.** Start at `https://mail.google.com/a/sit.shonan-it.ac.jp` (the school
   account, even when the browser also has a private Google account). Say in one short line what you open and what
   you read. Name every mail you used (sender, subject, date) in the answer.
2. **Signing in: the student does it.** Never type or read a password. If the page is Google's sign-in
   (`accounts.google.com`), ask the student once with `clarify` (choice "Done") to sign in in the browser window with
   the school address, and continue when they tap it. If Chrome asks whether to create a work profile for the school
   account, tell them to choose the option that continues **without a new profile** (signs in in this window only).
   Do not sign out when done: staying signed in is what spares the next sign-in.
3. **Sending needs the student's word.** Reading, searching and writing drafts are allowed (with the consent in
   Rule 4). **Never send** unless (a) the student asked in this conversation to send this mail, or (b) you showed the
   finished draft (to, cc, subject, body) and asked with `clarify` — choices "Send" / "Not yet" — and they chose
   "Send". Then open the draft and press `送信` once. A wish to send stated before the draft existed covers only that
   draft, never a changed recipient. Never send to an address the student did not see. Never delete, archive, move,
   label, mark as spam or unsubscribe, never change settings or filters, never forward.
4. **Personal data: Tomo decides, not you.** Gmail and the Google files are personal-data sites for Tomo, under the
   same one-time consent as CampusSquare: page snapshots show only headings and controls; mail text is read with
   `browser_console` (`references/extract.md`). Never ask for permission yourself. If a result says the student did
   not allow it, do not read mail: say where to look (Gmail, which search) and stop. Read only the mails the question
   needs (list first, then at most the few threads that matter).
5. **Other people's data.** Mails contain other people's names and addresses: use them only for the answer or the
   draft at hand, quote no more than needed, never copy them into memory.
6. **Identifiers.** The student's name, student number and school mail arrive as `{{FULL_NAME}}`,
   `{{STUDENT_NUMBER}}`, `{{SCHOOL_EMAIL}}`; never try to recover them. Write them as placeholders in a draft link:
   newer Tomo (it has `tomo_records_get`) fills them in when the page opens; older Tomo cannot — then leave the
   signature's name and number out and tell the student to add them.
7. **Close when done.** `tomo_browser_close` (if it exists) when the task is finished, unless the student keeps
   working in the browser.

## Procedure

1. **Open Gmail.** `browser_navigate` `https://mail.google.com/a/sit.shonan-it.ac.jp`. Signed in when the URL is
   `https://mail.google.com/mail/u/N/…`; keep that `/mail/u/N/` as the base for every later link (the `N` belongs to
   the school account). Sign-in page → Rule 2. Done when the base is known.
2. **Find the mails.**
   - New / unread: `browser_console` with "Unread count" (Atom feed): count and the newest unread subjects.
   - A list or a search: `browser_navigate` `<base>#search/<query>` (Gmail search; e.g. `is:unread newer_than:7d`,
     `from:shonan-it.ac.jp 奨学金`, `subject:履修`, `has:attachment`, URL-encoded), wait a moment, then
     `browser_console` with "List" (sender, subject, snippet, date, unread, thread id). Inbox: `<base>#inbox`.
   - Search words in Japanese (mails are Japanese); translate the student's words first.
3. **Read a mail.** `browser_console` with "Thread text" and the thread id: the whole thread as plain text (Gmail's
   print view). Explain in the student's language: who wrote, what it asks, deadlines (with the date and weekday),
   what to do next, links and attachments named (not opened unless asked).
4. **Draft.** Write the mail in Japanese for the school (`references/writing.md`: subject, 宛名, greeting, body,
   signature with `{{FULL_NAME}}` and `{{STUDENT_NUMBER}}`). Show it to the student in the chat first when they asked
   for a draft to look at; otherwise open it directly. `browser_navigate`
   `<base>?view=cm&fs=1&to=<to>&cc=<cc>&su=<subject>&body=<body>` (every value URL-encoded, line breaks `%0A`).
   Gmail saves it in 下書き by itself after a few seconds. Very long bodies (over about 1,500 characters): open the
   compose window with the first part and add the rest with `browser_type` in the body box. A reply in the same
   thread: open the thread (`<base>#all/<thread id>`), press `返信`, then type the body with `browser_type`; if that
   fails, make a new draft with `Re: <subject>` to the sender. Done when the draft exists; tell the student it is in
   下書き and that it was **not** sent.
5. **Send (Rule 3 only).** Open the draft (`<base>#drafts`, then the draft) and press `送信` (`browser_click`). Check
   that `メッセージを送信しました` appears. Done when it did; say so.
6. **Links in the mail** (open each only when the question needs it; same consent):
   - Docs / Sheets / Slides: open the link, then read it as text with "Export" (`references/extract.md`). Do not edit
     these files in the browser (typing there is unreliable); offer the text, or a file made on the computer, instead.
   - Google Form: open it, read the questions with "Form questions"; to help, open a pre-filled link
     (`viewform?usp=pp_url&entry.<id>=<value>`) and let the student check and press `送信` themselves. Name and
     student number only in forms from the school (a `shonan-it.ac.jp` account or a link in a school mail).
   - A date to remember: open `https://calendar.google.com/calendar/render?action=TEMPLATE&text=<title>&dates=<start>/<end>&ctz=Asia/Tokyo&details=<note>`
     (dates `YYYYMMDDTHHMMSS`, or `YYYYMMDD/YYYYMMDD` for a whole day, end exclusive); the student presses `保存`.

## Interpretation

- Senders: `@shonan-it.ac.jp` addresses are school staff (学生課, 教務課, 学生支援 …) and faculty; `@sit.shonan-it.ac.jp`
  are student and club accounts; `noreply` / Google mails are automatic (security notices: tell the student to check
  them in Gmail, never act on them).
- Typical requests in school mails: 提出 (submit), 期限 / 締切 (deadline), 必着 (must arrive by), 要返信 (reply
  needed), 至急 (urgent), 休講 / 補講 (class cancelled / make-up), 履修取消 (course withdrawal, often a Google Form).
- Gmail dates in the list are local time (Asia/Tokyo); "Thread text" shows the full date of each message.

## Pitfalls

- Several Google accounts in the browser: always go through `/a/sit.shonan-it.ac.jp` once and keep its `/u/N/`.
- Gmail's page markup changes; if "List" finds no rows on a page that shows mail, use "Unread count" and Gmail search
  results' text from "Thread text", and say the list could not be read.
- The print view does not mark mail as read; opening a thread in Gmail's own view does. Prefer the print view.
- A compose link opens a new draft each time: open it once per draft; to change a draft, edit the open one
  (`browser_type`) or tell the student what to change.
- `送信` sends at once (Gmail may offer `元に戻す` for a few seconds): never press it to "test".

## Verification

- Every mail named in the answer has sender, subject and date; deadlines have date and weekday.
- Nothing was sent unless Rule 3 allowed it; a draft answer says "saved in 下書き, not sent".
- No other person's address or name was kept beyond the answer.
