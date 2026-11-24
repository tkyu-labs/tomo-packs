// Run with node packs/toyo/evals/extraction-fixtures.js. All record values here are fictional.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "../skills/toyonet-g/scripts/read-records.js"), "utf8");
const origin = "https://g-sys.toyo.ac.jp";
const registeredPath = "/univision/action/in/f08/Usin080111";
const historyPath = "/univision/action/in/f08/Usin080321";
const creditPath = "/univision/action/in/f08/Usin080421";
const universityPath = "/univision/action/in/f02/Usin026411";
const boardPath = "/univision/www/html/kyukoC11_en.html";
const rects = () => [{}];

function cell(innerText, options = {}) {
  return { innerText, tagName: "TD", colSpan: 1, rowSpan: 1, ...options };
}

const row = (...cells) => ({
  cells: cells.map((value) => typeof value === "string" ? cell(value) : value),
  getClientRects: rects,
});
const head = (labels) => row(...labels.split("|").map((label) => cell(label, { tagName: "TH" })));
const table = (...rows) => ({ rows, getClientRects: rects });
const unreadable = cell("");
Object.defineProperty(unreadable, "innerText", {
  get() { throw new Error("Read a field outside the requested scope"); },
});

function query(pathname, kind, fields, tables, filters = {}, limit = 50, host = origin) {
  const request = { kind, fields, filters, limit };
  const expression = script.replace(/const REQUEST = \{[\s\S]+?\n  \};/, () =>
    "const REQUEST = " + JSON.stringify(request) + ";");
  const result = vm.runInNewContext(expression, {
    location: { origin: host, pathname },
    document: { querySelectorAll: () => tables },
    getComputedStyle: () => ({ visibility: "visible" }),
  });
  return JSON.parse(JSON.stringify(result));
}

const identity = table(head("学籍番号|氏名"), row(unreadable, unreadable));
const registered = table(
  head("曜日|時限|学期||授業コード|科目ナンバリング|科目名|実施形態|担当者|教室|キャンパス|単位"),
  row(cell("春学期", { colSpan: 12 })),
  row("火曜日", "2", "", "", "TEST101", "", "架空科目A", "", unreadable, "架空教室", "", ""),
  row(cell("集中", { colSpan: 3, rowSpan: 2 }), "", "TEST102", "", "架空科目B", "", unreadable, "", "", ""),
  row("", "TEST103", "", "架空科目C", "", unreadable, "", "", ""),
);
const registeredFields = ["course", "day", "period", "term", "scheduleNote"];
assert.deepEqual(query(registeredPath + ";session=fictional", "registered", registeredFields, [
  identity, registered,
]).rows, [
  { course: "架空科目A", day: "火曜日", period: "2", term: "春学期", scheduleNote: null },
  { course: "架空科目B", day: null, period: null, term: "春学期", scheduleNote: "集中" },
  { course: "架空科目C", day: null, period: null, term: "春学期", scheduleNote: "集中" },
]);
assert.deepEqual(query(registeredPath, "registered", ["course", "room"], [registered], { day: "火" }).rows,
  [{ course: "架空科目A", room: "架空教室" }]);
assert.equal(query(registeredPath, "registered", ["studentNumber"], [identity]).error, "invalid_fields");
assert.equal(query(historyPath, "registered", ["course"], [registered]).error, "unexpected_page");
assert.equal(query(registeredPath, "registered", ["course"], [registered], {}, 1, "https://example.test").error,
  "unexpected_page");
assert.equal(query(registeredPath, "registered", ["course"], [registered], {}, 1).truncated, true);

const history = (course, grade) => table(
  head("|区分|科目名|担当者|単位|成績|成績備考|開講年度|開講期間|履修学年|履修セメスタ"),
  row("", "架空区分", course, unreadable, "2", grade, unreadable, "2098", "春学期", "1", "1"),
);
assert.deepEqual(query(historyPath, "history", ["course", "grade"], [
  identity, history("架空科目A", "A"), history("架空科目B", ""),
]).rows, [{ course: "架空科目A", grade: "A" }, { course: "架空科目B", grade: null }]);

const grades = table(
  head("年度|学期|履修単位|修得単位|GPA|S|A|B|C|D|E|*|T|保"),
  row("2098", "春学期", "12", "10", "3.25", ...Array(9).fill(unreadable)),
  row(cell("合計", { colSpan: 2 }), "12", "10", "3.25", ...Array(9).fill(unreadable)),
);
assert.deepEqual(query(creditPath, "termGrades", ["year", "term", "gpa", "summary"], [grades]).rows, [
  { year: "2098", term: "春学期", gpa: "3.25", summary: null },
  { year: null, term: null, gpa: "3.25", summary: "合計" },
]);
assert.deepEqual(query(creditPath, "termGrades", ["gpa"], [grades], { year: "2098", term: "春学期" }).rows,
  [{ gpa: "3.25" }]);

const university = table(
  head("時間割|区分|科目名|学年|担当教員|キャンパス|実施\n形態|単位|他曜日時限"),
  row("火2", "架空区分", "架空科目A", "1", unreadable, "白山", "対面", "2", unreadable),
);
assert.deepEqual(query(universityPath, "universityTimetable", ["schedule", "course", "format"], [university]).rows,
  [{ schedule: "火2", course: "架空科目A", format: "対面" }]);

const boardHeader = head("No|Date|Schedule|Instructor|Course name|Note");
const board = table(boardHeader, row("1", "2098-04-01", "2", unreadable, "Fictional course", unreadable));
assert.deepEqual(query(boardPath, "cancellations", ["course"], [
  table(boardHeader, row(cell("No announcements", { colSpan: 6 }))),
]).rows, []);
assert.deepEqual(query(boardPath, "cancellations", ["course"], [board]).rows, [{ course: "Fictional course" }]);
const monthDayBoard = table(boardHeader, row("1", "04/01 (Wed)", "2", unreadable, "Fictional course", unreadable));
assert.deepEqual(query(boardPath, "cancellations", ["course"], [monthDayBoard], { date: "4/1" }).rows,
  [{ course: "Fictional course" }]);
assert.deepEqual(query(boardPath, "cancellations", ["course"], [monthDayBoard], { date: "2098-04-01" }).rows, []);

console.log("ToyoNet-G extraction fixtures passed");
