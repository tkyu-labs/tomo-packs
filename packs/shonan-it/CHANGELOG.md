# Changelog

## 0.2.2

- EN: Questions about setting up your PC and the software for classes (BYOD) first use the guides the school provides.
- ZH: 关于电脑和上课用软件准备的问题（BYOD），会先查学校提供的指南。
- JA: PC や授業で使うソフトの準備（BYOD）についての質問は、まず大学が用意した手順書を調べます。

## 0.2.1

- EN: Course and school searches reach the school information service more reliably; when it cannot be reached, Tomo says so before using the website.
- ZH: 课程和学校信息的检索更稳定地使用学校信息服务；连不上时，Tomo 会先说明，再改用网站。
- JA: 科目や学校情報の検索で、学校情報サービスをより確実に使うようにしました。つながらないときは、その旨を伝えてからウェブサイトを使います。

## 0.2.0

- EN: New: Moodle — what's due, assignments, quizzes, grades and feedback; messages to teachers and classmates.
- ZH: 新增 Moodle：要交的作业、小测、成绩和老师反馈，还能给老师和同学写消息。
- JA: 新機能：Moodle — 締切、課題、小テスト、評点とフィードバック。先生や友だちへのメッセージも。
- EN: New: school mail (Gmail) — new mail, what a mail asks you to do, and drafts. Nothing is sent without your OK.
- ZH: 新增学校邮件（Gmail）：新邮件、邮件要你做什么、帮你写草稿。没有你的同意不会发送。
- JA: 新機能：大学のメール（Gmail）— 新着、メールの内容と対応、下書き。あなたの OK なしに送信しません。
- EN: New: course planning — a plan for next term from your credits and the syllabus, checked on your computer.
- ZH: 新增选课规划：根据你的学分和シラバス给出下学期的计划，并在本机核对。
- JA: 新機能：履修プランニング — 単位とシラバスから次の学期の案を作り、端末上で確認します。
- EN: New: syllabus search — find courses by conditions (online, no exam, your year) or by keyword.
- ZH: 新增シラバス检索：按条件（メディア授業、无考试、你的年级）或关键词找课。
- JA: 新機能：シラバス検索 — 条件（メディア授業、試験なし、学年）やキーワードで科目を探します。
- EN: School information now searches the whole official site and its PDFs, and students' tips on the BBS.
- ZH: 学校信息检索覆盖整个官网和 PDF，也会参考 BBS 上同学的经验分享。
- JA: 学校情報は公式サイト全体と PDF を検索し、BBS の学生の情報も参考にします。
- EN: Saved pages: after registration, your CampusSquare records are kept encrypted so you sign in less often.
- ZH: 选课期结束后，CampusSquare 的记录会加密保存在本机，减少重复登录。
- JA: 履修登録期間の後、CampusSquare の記録を暗号化して保存し、サインインの回数を減らします。
- EN: Signing in is safer: Tomo presses ログイン only when your browser has filled in your login.
- ZH: 登录更安全：只有浏览器已经填好账号密码时，Tomo 才会点「ログイン」。
- JA: サインインがより安全に：ブラウザがログイン情報を入力したときだけ「ログイン」を押します。

## 0.1.2

- Reading grades is decided once (the Hatch question, or Tomo asks the first time) and can be changed in Tomo's
  Settings; no approval per item any more. The Hatch text and the `campussquare` skill (0.1.1) say so.

## 0.1.1

- The pack's name in Japanese and Chinese: 湘南工科大学パック / 湘南工科大学能力包 (was English in every language).

## 0.1.0

- Pack skeleton: manifest, Hatch questionnaire, SOUL fragment.
- `campussquare` skill: reads timetable, grades, credits, GPA and the self-checks from CampusSquare in the visible
  browser; read-only, the student signs in.
- Quick topics: My timetable, Credits & graduation.
- CampusSquare is a personal-data site (`personal_origins`): Tomo shows the model only headings and controls of its
  pages and asks the student before sending any value read there; the Hatch answer "No" to grade reading refuses it
  (`personal_consent`). The skill no longer asks for permission itself.
- `school-info` skill: searches the official website in Japanese (`site:shonan-it.ac.jp`), reads its pages and PDFs
  (academic calendar, procedures, international-student support, notices) and offers once to keep a PDF in
  Documents › Tomo › shonan-it for next time. Quick topic: Calendar & procedures.
- `campussquare`, checked with a 3rd-year account: per-course attendance (`○` / `欠` / `他`, five absences = `Y`
  failed with no exception, lateness per the instructor's rule) with a one-call extraction, classrooms from the schedule, the official meaning of `Ｄ` / `未` (`X`, `Y`,
  `Z`) and GPA rules, failed and retaken courses, and lower-year self-checks (the 3rd-year judgement is the
  graduation-research requirement; a 4th-year judgement shows `留年` until the remaining courses are taken).
- Hatch: the faculty comes from the student number's third character (A 工学部, B 情報学部, T 大学院, any other letter
  left for the student to pick); graduate school and its majors (機械工学専攻, 電気情報工学専攻) added.
