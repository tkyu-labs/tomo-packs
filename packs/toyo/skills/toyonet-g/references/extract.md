# Scoped result extraction

Read `../scripts/read-records.js` and run the full expression in `browser_console` on the matching result
page. Edit only `REQUEST`. Set `kind` to one mode, `fields` to the smallest useful list, `filters` to exact
displayed values, and `limit` to the number needed (1–200). Use `filters: {}` when no filter is needed.
Navigation and display are separate actions described in [pages.md](pages.md).

| Question | `kind` | Available fields | Filter keys |
| --- | --- | --- | --- |
| Registered classes | `registered` | `day`, `period`, `term`, `code`, `numbering`, `course`, `format`, `instructor`, `room`, `campus`, `credits`, `scheduleNote` | `course`, `code`, `term`, `day`, `period`, `campus` |
| History and grades | `history` | `category`, `course`, `instructor`, `credits`, `grade`, `gradeNote`, `year`, `offeringPeriod`, `yearLevel`, `semester` | `course`, `category`, `year`, `offeringPeriod`, `yearLevel`, `semester` |
| Requirements and shortfalls | `requirements` | `requirement`, `required`, `earned`, `inProgress`, `assessed`, `shortfall` | `requirement` |
| In-person and remote credits | `deliveryCredits` | `year`, `term`, `inPerson`, `remote`, `total`, `summary` | `year`, `term` |
| GPA by year and term | `termGrades` | `year`, `term`, `registered`, `earned`, `gpa`, `summary`, optional grade breakdown fields below | `year`, `term` |
| GPA by year of study | `yearGrades` | `yearLevel`, `registered`, `earned`, `gpa`, optional grade breakdown fields below | `yearLevel` |
| Published university timetable | `universityTimetable` | `schedule`, `category`, `course`, `yearLevel`, `instructor`, `campus`, `format`, `credits` | `course`, `category`, `yearLevel`, `campus` |
| Campus cancellation board | `cancellations` | `date`, `schedule`, `instructor`, `course`, `note` | `course`, `date` |

The grade breakdown fields are `s`, `a`, `b`, `c`, `d`, `e`, `asterisk`, `t`, and `gradeHo`. Preserve
the original column labels `S`, `A`, `B`, `C`, `D`, `E`, `*`, `T`, and `保` in answers.
For a single GPA question use only `gpa` and its scope columns. An unfiltered term report can include a
summary row, so request `summary` along with `year` and `term`. For a weekday, use `月` through `日`.
Rows with a merged unscheduled slot carry `scheduleNote`; its weekday and period remain empty.

The expression matches the result origin, known paths, and expected headers. It uses visible tables, keeps
all matching history sections, and expands merged cells before reading requested fields. The identity
header is excluded. Blank values stay null; the expression returns displayed strings without grade
conversion or GPA arithmetic. A single-course match can be narrowed by offering year or term; an empty
match leaves the requested course or period unconfirmed.

Handle `unexpected_page` by checking the active browser window and page. `recognized_table_missing` calls
for a layout check or navigation guidance. `irregularRows` and `truncated` indicate limits on completeness.
State that partial scope in the answer. Use an exact course or period filter when possible before raising
the limit. A cancellation board can have a valid header and no dated course rows. State the board and
the date checked when explaining that result. For a current board lookup, `filters.date` accepts a
month/day string such as `4/1`, which matches a displayed month/day with an optional weekday suffix.
A month/day-only row does not establish a year. Use exact displayed dates for explicitly dated searches
and disclose when the requested year cannot be confirmed.

For developer verification, run the script in the browser against the displayed pages. Return only schema
assertions, success flags and field names from the browser. Keep actual values and record rows inside the
browser. The populated qualification or minor branch, other locale layouts, and formal exam and graduation
results require additional verification before adding new extraction modes.
