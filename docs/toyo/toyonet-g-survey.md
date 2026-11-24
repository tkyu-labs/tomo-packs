# ToyoNet-G discovery notes

Developer reference for the planned `toyo` pack and `toyonet-g` skill. Surveyed on 2026-11-24 in a contributor's signed-in browser. The inventory records fixed labels, routes, controls, and table schemas. Availability and layout can vary by faculty, enrollment status, and term.

## Verification coverage

| Level | Pages and flows |
| --- | --- |
| Result structure observed | `履修登録確認表`, standard `履修・修得科目` and `単位数集計表`, `授業時間割表照会` after expanding all periods, the instructor picker reached from `教員別担当授業一覧照会`, and the campus cancellation board templates. |
| Landing or empty-state structure observed | All six top-level tabs, `抽選実施科目一覧`, the portal's `休講照会` and `補講照会` lists, and the three event pages. A populated list or a downstream action needs its own verification. |
| Route opened, result structure unavailable | `試験時間割表照会`, `卒業等各種判定結果照会`, `資格・副専攻照会`, `実習照会`, and `奨学生情報一覧` rendered without a visible result grid in the surveyed session. The syllabus and instructor-profile child window showed a browser error. |
| Menu only | Enrollment changes, grade inquiries, printing, reservations and submissions, language changes, and the guarantor, bank-account, and health views. |

## Entry and navigation

The student signs in at [ToyoNet-G](https://g-sys.toyo.ac.jp/portal/). The survey began after sign-in, so the sign-in form and session timeout remain unverified. The header contains `ログアウト`. The sign-out confirmation and redirect were outside this survey.

All paths below are relative to `https://g-sys.toyo.ac.jp`. They record the observed route path, with query strings and session suffixes removed. Use the visible menu path when implementing navigation. In particular, some result paths follow a form submission and may depend on the preceding screen.

| Top-level tab | Observed path | Structure and purpose |
| --- | --- | --- |
| `ＨＯＭＥ` | `/portal/action/pt/f01/Uspt010111` | `お知らせ` with a search field and a `詳細` control. Separate same-origin frames for `休講情報` and `補講情報` load `/univision/action/in/f15/Usin150611` and `/univision/action/in/f16/Usin160811`. |
| `学生メニュー／Menu` | `/portal/action/pt/f11/Uspt11Z111` | Academic and student-service functions grouped into accordions. |
| `相談予約／Appointments` | `/portal/action/pt/f17/Uspt170511` | Consultation search with category and campus selectors, a text field, and `検索`. The reservation flow was outside the survey. |
| `アンケート／Surveys` | `/portal/action/pt/f12/Uspt121311` | Survey landing page. Individual surveys and submissions were outside the survey. |
| `各種資料／Resources` | `/portal/action/pt/f18/Uspt180111` | Resource listing. Linked files and services were outside the survey. |
| `リンク／Links` | `/portal/action/pt/f11/Uspt110111` | Service link directory. Linked services can have their own sign-in. |

The student menu uses JavaScript to open a separate window. Its placeholder link targets and the DOM presence of an item in a closed accordion are insufficient for navigation. Expand the group, click the visible item, wait for the child window and its expected heading, and return to the menu before opening another child. The portal checks for an existing child before opening another one.

## Student menu

| Group | Visible entries and purposes |
| --- | --- |
| `言語切替 / Change Language` | `言語切替 / Change Language` changes the interface language. Menu only. |
| `履修登録` | `履修登録（正規登録期間）`, `履修登録（追加登録期間）`, and `履修取消申請` are student actions. `抽選実施科目一覧` is a read-only list of lottery courses. |
| `履修・授業照会` | `履修登録確認表`, `履修・修得科目`, `単位数集計表`, `成績表印刷`, `授業時間割表照会`, `シラバス・教員プロフィール`, `教員別担当授業一覧照会`. |
| `休講・補講` | `休講照会` and `補講照会` open cancellation and makeup-class lists. |
| `休講（キャンパスごと）` | Japanese cancellation boards for 白山, 総合スポーツセンター, 川越, 朝霞, 赤羽台WELLB, and 赤羽台INIAD. |
| `休講（キャンパスごと）-英語表示-` | English cancellation boards for the same six locations. The link labels repeat the Japanese group, so select by group and label together. |
| `学期末試験` | `試験時間割表照会` opens the end-of-term exam schedule. |
| `成績調査申請` | `成績調査申請` starts a grade inquiry. Student action. |
| `判定結果照会` | `卒業等各種判定結果照会` opens the school's formal graduation and other decision results. |
| `資格・副専攻` | `資格・副専攻登録` is a student action. `資格・副専攻照会` is the corresponding read-only inquiry. |
| `実習` | `実習登録` is a student action. `実習照会` is the corresponding read-only inquiry. |
| `個人情報管理` | `学生情報申請` handles student-information requests. `保証人情報照会` is a guarantor inquiry. Both are menu only. |
| `奨学金` | `奨学生情報一覧` opens scholarship information. `学生振込口座照会` and `学生振込口座登録申請` cover bank-account inquiry and registration. The two bank-account entries are menu only. |
| `健康診断結果照会` | `健康診断結果照会` opens health examination results. Menu only. |
| `学生生活` | `サークル管理` manages student clubs. `施設予約` handles facility reservations. Both are menu only. |
| `イベント照会` | `イベント簡易検索`, `イベント詳細検索`, and `申込イベント一覧` open event searches and the list of events applied for. |

## Verified read-only screens

| Menu item | Observed path | Structure |
| --- | --- | --- |
| `履修登録確認表` | `/univision/action/in/f08/Usin080111` | Registered-course view with a separate identity header and a 12-column grid. See the exact column order and extraction notes below. |
| `履修・修得科目` | `/univision/action/in/f08/Usin080311` → `Usin080321` | Search course history by offering-year range, with a qualification or minor option and a checkbox for prior-year failed courses. See the exact result columns below. |
| `単位数集計表` | `/univision/action/in/f08/Usin080411` → `Usin080421` | Search by the regular curriculum or a qualification or minor. See the four result-table schemas and their calculation scopes below. |
| `授業時間割表照会` | `/univision/action/in/f02/Usin026411` | University timetable inquiry with `開講年度`. `全時限を表示` revealed the course grids in the same window. `全時限を非表示` is also present. |
| `教員別担当授業一覧照会` | `/univision/action/in/f02/Usin025611` | Search form with instructor affiliation and name, `検索`, and `クリア`. Search opened an instructor picker with row links. |
| `抽選実施科目一覧` | `/univision/action/in/f07/Usin07Z211` | Lottery-course inquiry with academic year and term context. The populated list layout needs verification. |
| `休講照会` and `補講照会` | `/univision/action/in/f15/Usin150XXX` and `/univision/action/in/f16/Usin160XXX` | Both list routes were opened. The populated row layouts and scope relative to the registered-course grid need verification. |
| `イベント簡易検索` | `/univision/action/em/f05/Usem05011Z` | Filters for application status and a link to advanced search. |
| `イベント詳細検索` | `/univision/action/em/f05/Usem05012Y` | Advanced search form with a date range, event keyword input, and campus checkboxes. Result columns need verification. |
| `申込イベント一覧` | `/univision/action/em/f05/Usem050141` | The listing route was opened. Record details and event actions were outside the survey. |

The registration and course-history screens contain a separate identity header. When extracting academic data, scope selectors to the academic table and omit the identity block. Keep earned credits, in-progress credits, assessed credits, and shortfalls separate. A credit shortfall is a report field. For an official graduation decision use `卒業等各種判定結果照会` when the university has made results available.

### Registration confirmation grid

The identity header contains `学籍番号`, `氏名`, and `開講年度`. Locate the course grid within the same window as `table.list` by its `曜日`, `時限`, and `科目名` headers. Its header row has 12 `th` cells inside `tbody`, in this order.

| Positions | Header labels |
| --- | --- |
| 1–4 | `曜日`, `時限`, `学期`, blank |
| 5–8 | `授業コード`, `科目ナンバリング`, `科目名`, `実施形態` |
| 9–12 | `担当者`, `教室`, `キャンパス`, `単位` |

The grid uses both `rowspan` and `colspan` below the header. Expand merged cells to logical columns before reading a row. Match course rows by their course code and name, and omit the unlabeled column. The separate `印刷` and credit-display controls are unnecessary for reading the grid. Their behavior was outside this follow-up.

### Registered and earned courses

The search page has two offering-year inputs named `year_from` and `year_to`. The radio labels are `履修・修得科目` and `資格・副専攻履修・修得科目`. The latter has a selector with the placeholder `選択してください`. The checkbox reads `過年度の不合格科目も表示する`. Use `検索` to open results, `クリア` to reset the form, and `戻る` to return from results.

The standard search opens multiple captioned `table.list` sections with the same 11-column layout. Locate them by `区分`, `科目名`, `単位`, and `成績`, and iterate over each matching table. The header is the first row of `tbody`; the observed header and body rows had no merged cells. The identity table is separate.

| Positions | Header labels |
| --- | --- |
| 1–4 | blank, `区分`, `科目名`, `担当者` |
| 5–8 | `単位`, `成績`, `成績備考`, `開講年度` |
| 9–11 | `開講期間`, `履修学年`, `履修セメスタ` |

Read the grade and its remarks as distinct fields. Turning on the prior-year failed-course filter reached the same result route and retained the core course headers. The qualification or minor result remains unverified because the survey could not select a valid option.

### Credit summary

The search page offers `単位数集計表` and `資格・副専攻単位数集計表`. The latter has a selector with the placeholder `選択してください`. The form has `検索` and `クリア`; the result has `戻る`. The standard result was verified. The qualification or minor result remains unverified because the survey could not select a valid option.

| Table purpose | Column headers in order |
| --- | --- |
| Graduation credit requirements | `要件`, `条件単位`, `修得単位`, `履修中単位`, `判定単位`, `不足単位` |
| Delivery-mode credits by year and term | `年度`, `学期`, `対面単位`, `非対面単位`, `合計単位` |
| Credit and grades by year and term (`単位修得状況`) | `年度`, `学期`, `履修単位`, `修得単位`, `GPA`, `S`, `A`, `B`, `C`, `D`, `E`, `*`, `T`, `保` |
| Credit and grades by year of study | `学年`, `履修単位`, `修得単位`, `GPA`, `S`, `A`, `B`, `C`, `D`, `E`, `*`, `T`, `保` |

All four use `table.list` with header cells in `tbody`. Match each table by its distinguishing headers. Both year-and-term tables use merged cells below the header, so normalize spans and identify summary rows before extracting term rows. The asterisk in the grade headers is shown in normalized form.

The report footnotes specify three scopes. The requirements table counts earned credits from graduation-requirement courses. In the year-and-term credit and grade table, the graduation-requirement filter applies to GPA only. In the year-of-study table, the filter applies to earned credits, GPA, and the grade breakdown. Keep the report's `判定単位` and `不足単位` as separate fields. Their formulas and the grade-marker definitions were outside this structural check.

### University timetable and instructor picker

- `授業時間割表照会` expands multiple visible course grids after `全時限を表示`. Match the visible header rows with `時間割`, `区分`, `科目名`, `学年`, `担当教員`, `キャンパス`, `実施形態`, and `単位`. The trailing `他曜日時限` column is outside the extraction scope. The DOM includes hidden grids, so scope extraction to visible sections. Verify course-detail links separately before relying on them.
- `教員別担当授業一覧照会` returns an instructor selection table with `教員コード`, `氏名`, `カナ氏名`, `所属`, and `身分`. That table identifies the instructor. The page reached by selecting an instructor remains unverified.

### Campus cancellation boards

All 12 Japanese and English menu links opened. The Japanese templates use `No`, `休講日`, `時間割`, `教員名`, `科目名`, and `備考`. The English templates use `No`, `Date`, `Schedule`, `Instructor`, `Course name`, and `Note`. Both versions contain merged cells below the header. Require a dated course row before treating a table row as a cancellation. The populated row representation still needs verification.

| Location | Japanese route suffix | English route suffix |
| --- | --- | --- |
| 白山 | `kyukoC11.html` | `kyukoC11_en.html` |
| 総合スポーツセンター | `kyukoC16.html` | `kyukoC16_en.html` |
| 川越 | `kyukoC14.html` | `kyukoC14_en.html` |
| 朝霞 | `kyukoC13.html` | `kyukoC13_en.html` |
| 赤羽台WELLB | `kyukoC20.html` | `kyukoC20_en.html` |
| 赤羽台INIAD | `kyukoC19.html` | `kyukoC19_en.html` |

The shared path prefix is `/univision/www/html/`. These boards are organized by location. Use the course's location when the question concerns a specific class.

### Destinations requiring further verification

| Menu item | Observed path | Open point |
| --- | --- | --- |
| `シラバス・教員プロフィール` | Child window reached `/syllabus/student/auth.php` | The browser showed an error during this survey. The university also publishes a separate [public syllabus entry](https://g-sys.toyo.ac.jp/syllabus/). Public category results appear in the web index. Live availability and search behavior still need checking before the skill relies on the public entry. |
| `試験時間割表照会` | `/univision/action/in/f10/Usin10231X` | The route opened. A populated exam grid and publication-period behavior still need verification. |
| `卒業等各種判定結果照会` | `/univision/action/in/f12/Usin120611` | The route opened. The decision table and status labels still need verification during a publication window. |
| `資格・副専攻照会` | `/univision/action/in/f13/Usin130511` | The route opened. A populated result still needs verification. |
| `実習照会` | `/univision/action/in/f19/Usin190211` | The route opened. A populated result still needs verification. |
| `奨学生情報一覧` | `/univision/action/sa/f01/Ussa0104G1` | The route opened. A populated listing still needs verification. |

The official guide also describes correspondence-course workflows and thesis applications. Their presence and labels may depend on the student's program and were not verified. [ToyoNet-G official guide](https://sites.google.com/toyo.jp/toyonet/information/toyonetg)

## Read-only scope for the skill

- Use `検索`, `クリア`, `表示`, and `戻る` on identified inquiry screens. Match both the screen and action label before activation.
- Leave registration, cancellation, grade inquiries, language changes, application or survey submissions, bookings, account changes, `印刷`, and exports to the student. Treat `成績表印刷` as a print action even when the student asks to see grades. The course-history result already exposes a `成績` column.
- The student's academic views require their presence and consent for personal values. Extract only the fields needed for the answer. Keep guarantor, bank, and health screens outside the initial academic skill scope.
- Use the portal for student-specific results and the university's academic calendar and applicable `履修要覧` for schedules and program rules. The university advises checking ToyoNet-G and the official app for exam details. [Classes and academic calendar](https://www.toyo.ac.jp/campuslife/student_support/lecture/), [Current student and faculty resources](https://www.toyo.ac.jp/students/)
