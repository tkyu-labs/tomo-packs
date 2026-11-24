---
name: school-info
description: Search Toyo University's official website for public academic calendars, holidays, student procedures, scholarships, university notices and campus information. Cite the official pages or PDFs used.
version: 0.1.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  tomo:
    title: { en: "School information search", zh: "学校信息检索", ja: "大学情報検索" }
    summary:
      en: Searches Toyo University's official website for academic calendars, procedures, support and campus information.
      zh: 在东洋大学官网查询学年历、办事手续、学生支援和校区信息，并注明出处。
      ja: 東洋大学公式サイトで学年暦・各種手続き・学生支援・キャンパス情報を調べ、出典を示します。
---

# Toyo University information search

## When to Use

- When does the fall term start? Are there classes on a public holiday?
- How do I get a certificate or find the student service counter?
- Where are the scholarship and tuition reduction guidelines for international students?
- How do I get to the Akabanedai campus?

Use `toyonet-g` for a student's own registered timetable, grades, credit record, or formal graduation result.

## Rules

1. Start with `web_search` and include `site:toyo.ac.jp` in every query. Use Japanese terms from the
   question and add the academic year, campus, faculty, or audience when relevant and known.
2. Read the relevant public official page or PDF before answering. Use `web_extract` for a result page.
   If it links the applicable PDF, read the PDF or its official text version. Search snippets are leads.
3. Search before asking for context. Never put personal identifiers or private records into a search.
   If the official pages show different rules and the missing detail changes the answer, ask one
   focused question or present the applicable variants.
4. Stay within public official sources on `toyo.ac.jp` and its subdomains. Use the university's public
   referring page when a resource requires sign-in or redirects to another domain. Report what the
   referring page actually verifies.

## Procedure

1. **Search in the school's terms.** Use a short query such as `site:toyo.ac.jp 東洋大学 学年暦 春学期`,
   `site:toyo.ac.jp 東洋大学 在学生 証明書 発行`, or `site:toyo.ac.jp 東洋大学 留学生 奨学金`.
   Done when you have a relevant official result or have tried a second Japanese wording with the
   same domain filter.
2. **Read and check applicability.** Open the result. Compare its year or update date, student
   category, and campus or faculty against the question. Follow the official link to the current
   calendar or guide if the landing page points to one. Done when the source supports the answer
   for the requested scope or the gap is clear.
3. **Answer in the student's language.** Give the result or next step, preserve Japanese labels for
   offices and procedures, and cite the official page or PDF you read. State when the information
   is unavailable or the public source only gives an entry point. Done when the student can verify
   the answer from the citation.

## Interpretation

- `学年暦` is the academic calendar. Use the academic year stated on the document. The year runs
  from April through March, and the school publishes semester and quarter calendars.
- `在学生` means current students. Check whether a procedure is for them, prospective students,
  or graduates. `留学生対象` marks information for international students.

## Pitfalls

- A past notice may rank above this year's policy. Check the year, audience and any updated guide
  linked from the official page before giving dates, fees or deadlines.
- A university-wide calendar gives common dates. Look for the faculty or campus notice for a
  question about a particular procedure, class or deadline.

## Verification

Confirm that the cited source is on `toyo.ac.jp` or a subdomain, that you read the page or document,
and that each date, fee, eligibility condition, or campus instruction matches the source's scope.
