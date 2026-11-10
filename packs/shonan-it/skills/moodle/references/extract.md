# Reading Moodle

Run these with `browser_console(expression=...)` on a signed-in page of the year's site (`moodle<year>.shonan-it.ac.jp`).
Each returns compact JSON. The first four use Moodle's own page requests (the signed-in session's `sesskey`); the
others read a page's HTML with the same session. Values in examples are fictional.

Which year: the academic year starts in April — `new Date()` before April → last calendar year.

## Helper (paste in front of the first four)

```js
const call = async (methodname, args) => {
  const r = await fetch(`${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=${methodname}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify([{ index: 0, methodname, args }]) });
  const d = (await r.json())[0];
  if (d.error) throw new Error(d.exception?.errorcode || "error");
  return d.data;
};
```

## Courses

```js
(async () => {
  /* helper */
  const { courses } = await call("core_course_get_enrolled_courses_by_timeline_classification",
    { classification: "all", limit: 0, offset: 0, sort: "fullname" });
  return JSON.stringify(courses.map(c => ({ id: c.id, name: c.fullname, url: c.viewurl, progress: c.progress ?? null })));
})()
```

Names look like `【情】後学期_ビジネスとデータサイエンス[火1]`: faculty, term, course, weekday + period.

## Upcoming (deadlines, closing quizzes)

From a week ago (overdue ones) onward; `DAYS` ahead.

```js
(async () => {
  /* helper */
  const DAYS = 14, now = Math.floor(Date.now() / 1000);
  const { events } = await call("core_calendar_get_action_events_by_timesort",
    { timesortfrom: now - 7 * 86400, timesortto: now + DAYS * 86400, limitnum: 50 });
  const when = s => new Date(s * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", weekday: "short", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return JSON.stringify(events.map(e => ({ course: e.course?.fullname, activity: e.activityname || e.name, kind: `${e.modulename}:${e.eventtype}`,
    when: when(e.timesort), overdue: !!e.overdue, action: e.action?.name || null, url: e.url })));
})()
```

## Notifications

```js
(async () => {
  /* helper */
  const d = await call("message_popup_get_popup_notifications", { useridto: M.cfg.userId, newestfirst: true, limit: 15, offset: 0 });
  return JSON.stringify({ unread: d.unreadcount, items: d.notifications.map(n => ({ subject: n.subject, read: n.read,
    time: new Date(n.timecreated * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }), url: n.contexturl })) });
})()
```

## Course outline (sections and activities)

Set `COURSE` (id from "Courses"). `module` is the type (`resource` file, `assign`, `quiz`, `forum`, `url`, `page`,
`label`, `questionnaire`, `feedback`); `modname` is the localised label.

```js
(async () => {
  /* helper */
  const COURSE = 1415;
  const s = JSON.parse(await call("core_courseformat_get_state", { courseid: COURSE }));
  const cm = Object.fromEntries(s.cm.map(m => [m.id, m]));
  return JSON.stringify(s.section.map(x => ({ section: x.title, activities: x.cmlist.map(id => cm[id]).filter(Boolean)
    .filter(m => m.uservisible).map(m => ({ type: m.module, name: m.name, url: m.url })) })).filter(x => x.activities.length));
})()
```

## Assignment (status, deadline, feedback)

On or for an assignment page (`/mod/assign/view.php?id=…`): set `URL` to it (or `location.href`).

```js
(async () => {
  const URL_ = location.href;
  const d = new DOMParser().parseFromString(await (await fetch(URL_)).text(), "text/html");
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const rows = {};
  for (const tr of d.querySelectorAll(".submissionstatustable tr, .feedback tr")) {
    const k = t(tr.querySelector("th")?.textContent), v = t(tr.querySelector("td")?.textContent);
    if (k && v && !/氏名|名前/.test(k)) rows[k] = v.slice(0, 300);
  }
  return JSON.stringify({ title: t(d.querySelector("h1, h2")?.textContent), dates: [...d.querySelectorAll("[data-region=activity-dates] div")].map(x => t(x.textContent)),
    description: t(d.querySelector(".activity-description, #intro")?.textContent).slice(0, 800), status: rows });
})()
```

## Quiz (overview) and quiz page

Overview (`/mod/quiz/view.php?id=…`): rules and attempts.

```js
(() => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  return JSON.stringify({ info: t(document.querySelector(".quizinfo, .activity-description, #intro")?.innerText).slice(0, 600),
    attempts: [...document.querySelectorAll("table.quizreviewsummary tr, table.quizattemptsummary tr")].map(r => t(r.innerText)).slice(0, 12),
    buttons: [...document.querySelectorAll("[role=main] button, [role=main] a.btn, [role=main] input[type=submit]")].map(b => t(b.innerText || b.value)) });
})()
```

On an attempt page (`/mod/quiz/attempt.php?…&page=N`): the question, its choices (value + label), images, what is
selected, and the navigation buttons. `images` lists `src` for `tomo_page_image`.

```js
(() => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  return JSON.stringify([...document.querySelectorAll(".que")].map(q => ({
    no: t(q.querySelector(".qno")?.innerText), type: q.className.split(" ")[1], text: t(q.querySelector(".qtext")?.innerText),
    images: [...q.querySelectorAll(".qtext img")].map(i => i.getAttribute("src")),
    choices: [...q.querySelectorAll(".answer input[type=radio], .answer input[type=checkbox]")].map(i => ({ value: i.value,
      label: t(document.getElementById(i.id + "_label")?.innerText || document.querySelector(`label[for="${i.id}"]`)?.innerText || i.closest("div")?.innerText) })),
    selected: [...q.querySelectorAll(".answer input:checked")].map(i => i.value),
  })).concat([{ buttons: [...document.querySelectorAll(".submitbtns input, .submitbtns button")].map(b => t(b.value || b.innerText)) }]));
})()
```

Choose a choice with `browser_click` on its radio / label (snapshot ref), then `次のページ`.

## Grades in a course

```js
(async () => {
  const COURSE = 1415;
  const d = new DOMParser().parseFromString(await (await fetch(`/grade/report/user/index.php?id=${COURSE}`)).text(), "text/html");
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const table = d.querySelector("table.user-grade");
  if (!table) return JSON.stringify({ error: "no grade table" });
  const head = [...table.querySelectorAll("thead th")].map(x => t(x.textContent));
  const rows = [...table.querySelectorAll("tbody tr")].map(r => [...r.querySelectorAll("th, td")].map(c => t(c.textContent))).filter(r => r.length > 2);
  return JSON.stringify({ columns: head, rows: rows.slice(0, 60) });
})()
```

## All grades (one line per course)

The page has a calendar table first; the grades are the `generaltable`.

```js
(async () => {
  const d = new DOMParser().parseFromString(await (await fetch("/grade/report/overview/index.php")).text(), "text/html");
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const table = [...d.querySelectorAll("table.generaltable")].find(x => /コース名|Course/.test(x.textContent));
  return JSON.stringify(table ? [...table.querySelectorAll("tbody tr")].map(r => [...r.cells].map(c => t(c.textContent))).filter(r => r[0]) : []);
})()
```

## Message recipients (search results in the message drawer)

After searching in the drawer and pressing `さらに読み込む` until it is gone. Each entry: name, whether it shows a
student number (student) or not (teacher). Click the chosen one (`browser_click`) to open the conversation.

```js
(() => {
  const box = document.querySelector("[data-region=message-drawer]");
  const rows = [...box.querySelectorAll("[data-region=search-results-container] [data-route=view-conversation]")].filter(e => e.offsetParent);
  return JSON.stringify(rows.map((e, i) => { const text = e.innerText.replace(/\s+/g, " ").trim();
    return { index: i, text: text.slice(0, 60), student: /\b\d{2}[A-Z]\d{3,}|\d{6,}/.test(text) }; }));
})()
```
