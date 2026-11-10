# Reading Gmail and Google files

Run these with `browser_console(expression=...)`. Each returns compact JSON. They use the signed-in page's own session
(same origin), so run each on the matching site: the Gmail ones on a `mail.google.com/mail/u/N/` page, the file ones
on the file's `docs.google.com` page. Values shown in examples are fictional.

## Unread count (Atom feed)

The newest unread mails (Gmail's own feed: subject, sender, time; no body). `message` is the newest message's hex id:
"Thread text" accepts it for a one-message thread; for longer threads take the thread id from "List".

```js
(async () => {
  const BASE = location.pathname.match(/^\/mail\/u\/\d+\//)?.[0] || "/mail/u/0/";
  const t = await (await fetch(BASE + "feed/atom", { credentials: "include" })).text();
  const pick = (s, tag) => (s.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1] || "";
  const entries = [...t.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 10).map(([, e]) => ({
    subject: pick(e, "title"), from: pick(pick(e, "author"), "name"), issued: pick(e, "issued"),
    message: (pick(e, "id").match(/:(\d+)$/) || [])[1] ? BigInt((pick(e, "id").match(/:(\d+)$/))[1]).toString(16) : null,
  }));
  return JSON.stringify({ unread: Number(pick(t, "fullcount") || 0), entries });
})()
```

## List (inbox or search results)

After `browser_navigate` to `<base>#inbox` or `<base>#search/<query>`. Rows of the visible list: unread, sender,
subject, snippet (start of the mail), date, thread id (for "Thread text").

```js
(() => {
  const LIMIT = 20;
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const rows = [...document.querySelectorAll("tr.zA")].filter(r => r.offsetParent).slice(0, LIMIT);
  if (!rows.length) return JSON.stringify({ error: "no mail rows on this page", url: location.hash });
  return JSON.stringify(rows.map(r => ({
    unread: r.classList.contains("zE"),
    from: r.querySelector(".yW [email]")?.getAttribute("name") || t(r.querySelector(".yW")?.innerText),
    subject: t(r.querySelector(".bog")?.innerText),
    snippet: t(r.querySelector(".y2")?.innerText).replace(/^-\s*/, "").slice(0, 120),
    date: r.querySelector(".xW span[title]")?.getAttribute("title") || t(r.querySelector(".xW")?.innerText),
    thread: r.querySelector("[data-legacy-thread-id]")?.getAttribute("data-legacy-thread-id") || null,
  })));
})()
```

## Thread text (print view)

The whole thread as plain text: each message's sender, date, recipients and body. Set `THREAD` (hex id from "List"
or "Unread count"). Opening it this way does not mark the mail as read.

```js
(async () => {
  const THREAD = "1a2b3c4d5e6f7a8b", MAX = 8000;
  const BASE = location.pathname.match(/^\/mail\/u\/\d+\//)?.[0] || "/mail/u/0/";
  const ik = window.GLOBALS?.[9];
  const r = await fetch(`${BASE}?ik=${ik}&view=pt&search=all&th=${THREAD}`, { credentials: "include" });
  const html = await r.text();
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, "")
    .replace(/<br\s*\/?>|<\/(p|div|tr|table|h\d)>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  return JSON.stringify({ status: r.status, text: text.slice(0, MAX), cut: text.length > MAX });
})()
```

`status` 400 with 削除されています: wrong thread id (use the hex id as listed).

## Export (Docs, Sheets, Slides)

On the file's page (`docs.google.com/{document|spreadsheets|presentation}/d/<id>/…`). Docs → plain text, Sheets → CSV
of one sheet (`GID` from the URL's `#gid=`; 0 = first), Slides → the slides' text.

```js
(async () => {
  const GID = 0, MAX = 8000;
  const m = location.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
  if (!m) return JSON.stringify({ error: "not a Docs / Sheets / Slides page" });
  const [, kind, id] = m;
  const url = kind === "document" ? `/document/d/${id}/export?format=txt`
    : kind === "spreadsheets" ? `/spreadsheets/d/${id}/export?format=csv&gid=${GID}`
    : `/presentation/d/${id}/export/txt`;
  // same-origin credentials only: the export redirects to googleusercontent.com, which refuses "include"
  const r = await fetch(url);
  const text = (await r.text()).replace(/\r\n/g, "\n");
  return JSON.stringify({ kind, status: r.status, text: text.slice(0, MAX), cut: text.length > MAX });
})()
```

## Form questions

On a form's `viewform` page. Questions with their `entry.<id>` (for a pre-filled link), type and options.
Types: 0 short answer, 1 paragraph, 2 multiple choice, 3 drop-down, 4 checkboxes, 5 scale, 9 date, 10 time.

```js
(() => {
  const data = window.FB_PUBLIC_LOAD_DATA_;
  if (!data) return JSON.stringify({ error: "no form data (not a viewform page, or the form is not open to you)" });
  const items = (data[1]?.[1] || []).filter(q => q[4]).map(q => ({
    title: q[1], type: q[3], required: !!q[4][0][2],
    entry: q[4][0][0], options: (q[4][0][1] || []).map(o => o[0]).filter(Boolean).slice(0, 20),
  }));
  return JSON.stringify({ form: data[1]?.[8] || data[3], items });
})()
```

Pre-filled link: `https://docs.google.com/forms/d/e/<form id>/viewform?usp=pp_url&entry.<id>=<value>&entry.<id>=<value>`
(values URL-encoded; a choice must match an option exactly). The student checks it and presses `送信`.
