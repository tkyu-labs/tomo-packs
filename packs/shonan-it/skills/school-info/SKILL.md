---
name: school-info
description: Find school information (calendar, holidays, exams, procedures, notices) on the official Shonan Institute of Technology website, and the school's own guides for classes (PC and software setup, BYOD) and other material teachers uploaded. Use it before a general web search.
version: 0.2.2
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, school-website, calendar, holidays, procedures, notices, byod, software-setup, class-materials]
    related_skills: [campussquare]
  tomo:
    title: { en: "School information search", zh: "学校信息检索", ja: "大学情報検索" }
    summary:
      en: "Searches the school's official website and its PDFs, and the guides the school provides for classes (PC and software setup, BYOD), for the academic calendar, procedures, rules and notices, and cites the source; students' tips from the community BBS, marked as such."
      zh: "检索学校官网和官网发布的 PDF，以及学校为课程准备的指南（电脑和软件的准备、BYOD），查找学年暦、各种手续、规定和通知，并注明出处；也会参考社区 BBS 上同学们的经验，并注明不是官方说明。"
      ja: "大学公式サイトと公開 PDF、授業のために大学が用意した手順書（PC・ソフトの準備、BYOD）を検索し、学年暦・各種手続き・規程・お知らせを調べて出典を示します。学生掲示板の体験談も、公式情報ではないと明示して参考にします。"
---

# School information search (www.shonan-it.ac.jp and the school's own guides)

Answers general questions about Shonan Institute of Technology from its official website and from the guides the
school keeps for its classes (setting up the student's own PC and the software classes use: BYOD, 環境構築; other
material teachers uploaded): the academic calendar
(学年暦: term dates, holidays, exam periods, course registration), procedures (証明書, 学籍変更, 奨学金, 授業料),
support for international students (在留管理, 在籍確認), cancelled classes, guidance materials and notices. The site is
**Japanese only**, so you always search and read in Japanese and answer in the student's language.

## When to Use

- "When is the summer break this year?", "When do classes start?", "When is course registration?"
- "When are the final exams?", "Is there class on a national holiday?"
- "How do I get a certificate / change my address / apply for a scholarship?"
- "What do international students have to report?", "Where is the student counselling room?"
- "How do I install VS Code / Unity / Python for class?", "Which Unity version does the class use?",
  "What software do I need on my PC before classes start?" — the school's own setup guides come before any general
  instructions on the web: they name the versions and settings the classes use.

Don't use for: the student's own timetable, grades or credits (use `campussquare`); courses and their content (use
`syllabus`);
visa or city procedures beyond what the school publishes (government sources only).

## Rules

1. **Ask the school's search service first.** The pack's school information API holds the whole official site,
   its PDFs (by page), the parsed 学年暦, and the guides and material the school uploaded (categories such as
   `shonan-it-byod`: PC and software setup for classes), and answers in one call (see "Search service" below).
   **The first search has no `source`**: it covers every category, so a guide a teacher uploaded is found as well as
   the website; narrow with `source` afterwards if needed. For PC and software setup (installing, versions,
   licences, settings) also search `source=shonan-it-byod`, with the software's name and what is asked
   (`Unity インストール バージョン`), not words like 授業 (they pull in syllabus pages instead of the guides). Use `web_search`
   only when the service does not answer (network error, `5xx`) or when nothing it returns fits after the retries
   in rule 2 — then as before: `site:shonan-it.ac.jp`, Japanese terms, the entry pages in `references/pages.md`.
2. **Ask in Japanese, in the school's words.** The site, the PDFs and the search model are Japanese: a question in
   Chinese or English finds the wrong pages. Rewrite every question into short Japanese with the school's own terms
   (table below), e.g. 怎么申请奖学金 → `奨学金 申請方法`, "library opening hours" → `図書館 開館時間`,
   "I missed class, what do I submit?" → `公欠 欠席届`. If the first results miss, try one or two other wordings
   (synonyms from the table) before falling back.
3. **Dates come from the calendar.** For "when" questions (授業開始, 休業期間, 履修登録期間, 学位記授与式 …) call
   `calendar` first; it gives every 学年暦 event of the academic year with real dates. Search the site only for
   what the calendar does not list (exam timetables, office hours, application deadlines on notices).
4. **No questions before you look.** The service and pages and files on `shonan-it.ac.jp` are trusted: read and
   download without asking. Only a file on another site may get one short question first; never more than once.
5. **Current, not just found.** Every hit has a `date` and a `category`. For rules and procedures prefer standing
   pages (学生生活, 在学生の方へ, the PDFs 修学上の情報等, 学則) over news (`ニュース`). A news hit older than the current
   academic year may be outdated: say its date ("2021年のお知らせでは…") or look for a newer page.
6. **The current academic year.** The year runs April–March: in January–March, "this year" means the year that
   started last April. 令和 = Western year − 2018 (2026 = 令和8年度, `R8`). Prefer that year's document; if only
   another year's exists, say so.
7. **Undergraduate or graduate.** The calendar and many pages have one version for 学部 (工学部・情報学部) and one for
   大学院. Use the student's faculty from memory (`USER.md`); if it is not there, use 学部 and mention that the
   graduate school has its own (calendar: `program=大学院`).
8. **Students' experience: the community BBS, after the official site.** For practical questions the school's pages
   do not answer well (which scholarships international students actually get, the canteen, connecting to Wi-Fi,
   setting up a PC, where to ask in Chinese), also search the BBS (`source=sitoss-bbs`; its posts are mostly Chinese,
   the search finds them with Japanese words). Say plainly that it is what students shared on the BBS, not the
   school's word, with its date; where it differs from an official page, the official page wins and you say so.
   Never use the BBS for rules, deadlines or requirements on its own.
9. **Never invent.** Every date, deadline, amount or place in the answer comes from a result, page or file you read
   in this conversation.

## Search service

The school information service (read-only, no key) is called only through the script in this skill's folder: it has
the service's address built in. Copy the script's path exactly as these commands show it (this skill's folder on
this computer). **Japanese goes only in the JSON body of a here-doc**, never in a command-line argument: Windows turns
Japanese arguments into `???` (then the results are wrong).

```bash
# first: every category (the site, its PDFs, the school's guides such as BYOD, the BBS); one hit per page / file
bash "${HERMES_SKILL_DIR}/scripts/school-api.sh" search <<'JSON'
{"q": "Visual Studio Code インストール", "limit": 8}
JSON
# only the official site and its PDFs
bash "${HERMES_SKILL_DIR}/scripts/school-api.sh" search <<'JSON'
{"q": "奨学金 申請方法", "source": "shonan-it-site", "limit": 6}
JSON
# the 学年暦 of the academic year a date falls in (date: default today; program: 学部, or 大学院 for graduate students)
bash "${HERMES_SKILL_DIR}/scripts/school-api.sh" calendar <<'JSON'
{"date": "2026-09-28", "program": "学部"}
JSON
# the community BBS (students' posts, mostly Chinese; hits carry category コミュニティ（BBS）)
bash "${HERMES_SKILL_DIR}/scripts/school-api.sh" search <<'JSON'
{"q": "奨学金 留学生 申請", "source": "sitoss-bbs", "limit": 4}
JSON
# a whole page or PDF when a passage is not enough (document_id from a hit)
bash "${HERMES_SKILL_DIR}/scripts/school-api.sh" document 12345
```

- `search` → `results[]`: `source` (the category: `shonan-it-site`, `sitoss-bbs`, `shonan-it-byod` …), `title`,
  `url`, `date`, `category`, `section` (`p.3` = page 3 of a PDF), `text` (the passage), `more_in_document`. Read the
  passages; open the document when the answer may continue elsewhere in it (a setup guide: always, for every step).
- A hit **without `url`** is a document the school uploaded (a guide, a handout): cite it by its title and say it
  is the school's guide, e.g. 「大学の手順書『作業3マニュアル』（BYOD）」; never make up a link for it. Open every
  guide you answer from with `document` and read it whole: a passage is not the guide. Never say a guide does not
  mention something unless you read that guide whole in this conversation ("not in the guides I read" otherwise).
  Follow its steps and versions; where it covers less than the student asks (only Windows, an older version), say so plainly,
  then add the vendor's official instructions from the web and mark that part as coming from there.
- `calendar` → `events[]` (`term`, `label`, `start`, `end`, `as_printed`), `today` (events covering the date),
  `terms.<前学期|後学期>` (`registration`, `correction`, `classes_start`), `registration_open` (the term whose
  registration or correction period includes the date, else `null`), `source` (title, URL of the 学年暦 PDF).
  `found: false` means that year's calendar is not in the service yet: read the PDF from the official page
  `https://www.shonan-it.ac.jp/campuslife/schedule/` (Procedure step 4).
- `document` → `body` (the full text), `title`, `url`, `info_date`. Long PDFs: read only what you need.
- Use the script exactly as shown (also on Windows). Never type the service's address or a `curl` command for it
  yourself, never start a command with `bash <<` or `bash -c`, and do not write your own client in Python, node or
  another language (those ask the student for approval).

What the script prints, and what to do:

- **JSON**: the answer.
- **`REQUEST ERROR …`**: your request was wrong. Fix it as the message says and run it again; this is no reason to
  leave the service.
- **`SERVICE UNAVAILABLE …`**: the script already tried three times. Say in the answer that the school information
  service could not be reached, then fall back (Procedure step 3) for this question.
- **`No such file`, `command not found` or `USAGE …`**: the command was mistyped. Copy it again from this skill and
  run it again; this is not a service failure.

## Procedure

Folders (terminal): Tomo sets `TOMO_DOWNLOADS` (scratch) and `TOMO_DOCUMENTS` (Documents/Tomo). Older Tomo versions
do not, so every command below starts with the same two lines, which fall back to a temporary folder and
`~/Documents/Tomo`:

```bash
DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
KEEP="${TOMO_DOCUMENTS:-$HOME/Documents/Tomo}/shonan-it"
```

1. **Rewrite the question** into one or two Japanese searches (Rules 2, 3). Done when you have the Japanese terms.
2. **Ask the service.** Dates: `calendar`. Everything else: `search` without `source` first (every category,
   including the school's setup guides), then `source=shonan-it-site` if the site needs a closer look; if nothing
   fits, one or two other wordings. For students' practical experience, then also `source=sitoss-bbs` (Rule 8). Open a document when the passage is cut off or the answer needs the whole page.
   Done when a current page or PDF answers the question, or the script said SERVICE UNAVAILABLE / found nothing fitting.
3. **Fallback only then.** `ls "$KEEP" 2>/dev/null` for a kept file that fits; else `web_search` with
   `site:shonan-it.ac.jp`, then the entry pages in `references/pages.md`; `web_extract` the page.
4. **Read a PDF yourself** only when the service did not have it (fallback): download it, then `read_file`:

   ```bash
   DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
   mkdir -p "$DL" && curl -fsSL --max-time 60 -o "$DL/schedule2026_AB.pdf" "https://www.shonan-it.ac.jp/media/schedule2026_AB.pdf" && echo "$DL/schedule2026_AB.pdf"
   ```

   If `read_file` reports scanned pages without text (`NEEDS OCR`), say the file has no text, give its link and stop.
5. **Answer with the source.** Short answer first, in the student's language, then the source: title (Japanese,
   with a translation), its date or year (令和8（2026）年度; a news item's date), a PDF's page (`p.3`), the URL on
   `shonan-it.ac.jp` (never the service's URL). Keep the Japanese terms the student will meet at school, with a
   translation, e.g. 履修訂正期間 (course change period).
6. **Offer to keep a PDF, once** — only for a PDF you downloaded yourself in step 4: ask with `clarify` and two
   choices whether to keep it for next time. If yes:

   ```bash
   DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
   KEEP="${TOMO_DOCUMENTS:-$HOME/Documents/Tomo}/shonan-it"
   mkdir -p "$KEEP" && cp "$DL/schedule2026_AB.pdf" "$KEEP/R8学年暦_学部.pdf" && echo "$KEEP/R8学年暦_学部.pdf"
   ```

   Name it so the student recognises it and say where it is ("Documents › Tomo › shonan-it"). Never ask twice in a
   chat for the same file, and never for HTML pages.

## Japanese terms

| The student asks about | Search for |
|---|---|
| school calendar, term dates, when classes start/end | 学年暦, 授業開始, 授業期間 |
| summer / winter / spring break | 夏季休業期間, 冬季休業期間, 春季休業期間 (all in 学年暦) |
| exams | 定期試験, 期末試験, 追試験 |
| missing class, absence, late | 公欠, 欠席届, 出欠, 遅刻 (rules in 修学上の情報等) |
| leave of absence, quitting, changing department | 休学, 退学, 転科, 再入学 |
| commuting, bicycle, motorbike, car | 通学について, 自転車通学, 駐輪場, バイク通学 |
| Wi-Fi, PC, Moodle, accounts | 無線LAN, 学内Wi-Fi, メディア情報センター, Moodle |
| lost something, student card | 遺失物・拾得物, 学生証 |
| course registration | 履修登録期間, 履修訂正期間, 履修登録について |
| cancelled classes, make-up classes | 休講情報, 補講, 時間割変更 |
| health check | 健康診断 |
| guidance, rules of study | 学年ガイダンス, 履修要項 |
| tuition, scholarships | 授業料, 学費, 奨学金, 日本学生支援機構 |
| certificates, address change, student card | 証明書発行, 学籍の変更, 住所変更, 学生証 |
| international students | 留学生支援, 在留管理制度, 在籍確認, 所属機関に関する届出 |
| counselling, health, harassment | 学生相談室, 健康管理, ハラスメント相談 |
| library | 附属図書館, 開館時間 |
| jobs, careers | キャリア支援, 就職, アルバイト紹介 |

## Reading PDFs

Only in the fallback (step 4). The service already parsed the 学年暦: its dates come with the right month. In a PDF
you read yourself, `read_file` flattens tables (`２日（火）～３月３１日（水）|春季休業期間`): the month of a day is often in
another column; work it out from the grid and the term (前学期 April–September, 後学期 October–March) or give the
range as printed with the document name. Holidays that are teaching days are listed separately (`授業分の振替休日`).

## Verification

- Every date in the answer appears in a calendar result, passage, page or PDF you read in this conversation.
- The searches were in Japanese, with the school's terms; a non-Japanese question was rewritten first.
- The source line names the document, its date or year (and PDF page) and the URL on `shonan-it.ac.jp`.
- A news item older than this academic year is named with its date, not presented as current.
- Anything from the BBS is introduced as students' posts (with the date), never as the school's information.
- You asked at most one question about keeping a PDF, and none before searching or downloading from the school site.
