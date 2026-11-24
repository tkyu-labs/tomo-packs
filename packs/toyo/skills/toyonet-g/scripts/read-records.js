(() => {
  const REQUEST = {
    kind: "registered",
    fields: ["course", "term", "day", "period"],
    filters: {},
    limit: 50,
  };

  const gradeColumns = "S|A|B|C|D|E|*|T|保";
  const gradeFields = "s|a|b|c|d|e|asterisk|t|gradeHo";
  const creditPath = "/univision/action/in/f08/Usin080421";
  const boardPath = /^\/univision\/www\/html\/kyukoC(?:11|13|14|16|19|20)(?:_en)?\.html$/;
  const configs = {
    registered: {
      path: "/univision/action/in/f08/Usin080111",
      headers: "曜日|時限|学期||授業コード|科目ナンバリング|科目名|実施形態|担当者|教室|キャンパス|単位",
      keys: "day|period|term||code|numbering|course|format|instructor|room|campus|credits",
      anchor: "course",
      filterable: ["course", "code", "term", "day", "period", "campus"],
      extra: ["scheduleNote"],
    },
    history: {
      path: "/univision/action/in/f08/Usin080321",
      headers: "|区分|科目名|担当者|単位|成績|成績備考|開講年度|開講期間|履修学年|履修セメスタ",
      keys: "|category|course|instructor|credits|grade|gradeNote|year|offeringPeriod|yearLevel|semester",
      anchor: "course",
      filterable: ["course", "category", "year", "offeringPeriod", "yearLevel", "semester"],
    },
    requirements: {
      path: creditPath,
      headers: "要件|条件単位|修得単位|履修中単位|判定単位|不足単位",
      keys: "requirement|required|earned|inProgress|assessed|shortfall",
      anchor: "requirement",
      filterable: ["requirement"],
    },
    deliveryCredits: {
      path: creditPath,
      headers: "年度|学期|対面単位|非対面単位|合計単位",
      keys: "year|term|inPerson|remote|total",
      anchor: "year",
      filterable: ["year", "term"],
      extra: ["summary"],
    },
    termGrades: {
      path: creditPath,
      headers: "年度|学期|履修単位|修得単位|GPA|" + gradeColumns,
      keys: "year|term|registered|earned|gpa|" + gradeFields,
      anchor: "year",
      filterable: ["year", "term"],
      extra: ["summary"],
    },
    yearGrades: {
      path: creditPath,
      headers: "学年|履修単位|修得単位|GPA|" + gradeColumns,
      keys: "yearLevel|registered|earned|gpa|" + gradeFields,
      anchor: "yearLevel",
      filterable: ["yearLevel"],
    },
    universityTimetable: {
      path: "/univision/action/in/f02/Usin026411",
      headers: "時間割|区分|科目名|学年|担当教員|キャンパス|実施形態|単位|他曜日時限",
      keys: "schedule|category|course|yearLevel|instructor|campus|format|credits|",
      anchor: "course",
      filterable: ["course", "category", "yearLevel", "campus"],
    },
    cancellations: {
      path: boardPath,
      headers: "No|休講日|時間割|教員名|科目名|備考",
      englishHeaders: "No|Date|Schedule|Instructor|Course name|Note",
      keys: "|date|schedule|instructor|course|note",
      selector: "table",
      anchor: "course",
      filterable: ["course", "date"],
    },
  };

  const normalize = (value) => value.normalize("NFKC").replace(/\s+/g, " ").trim();
  const text = (cell) => (cell?.innerText ?? cell?.textContent ?? "").replace(/\s+/g, " ").trim();
  const headerText = (value) => normalize(value).replace(/\s+/g, "");
  const visible = (element) => element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility === "visible";
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const error = (code) => ({ error: code });
  const { kind, fields, filters, limit } = REQUEST;

  if (!own(configs, kind)) return error("unknown_kind");
  const config = configs[kind];
  const path = location.pathname.split(";")[0];
  const pathMatches = typeof config.path === "string" ? path === config.path : config.path.test(path);
  if (location.origin !== "https://g-sys.toyo.ac.jp" || !pathMatches) return error("unexpected_page");

  const keys = config.keys.split("|");
  const allowed = [...keys.filter(Boolean), ...(config.extra || [])];
  if (!Array.isArray(fields) || !fields.length || fields.some((key) => !allowed.includes(key))) {
    return error("invalid_fields");
  }
  if (!filters || typeof filters !== "object" || Array.isArray(filters) ||
      Object.entries(filters).some(([key, value]) =>
        !config.filterable.includes(key) || typeof value !== "string" || !normalize(value))) {
    return error("invalid_filters");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) return error("invalid_limit");

  const expectedHeaders = [
    config.headers.split("|"),
    ...(config.englishHeaders ? [config.englishHeaders.split("|")] : []),
  ];
  const matchesHeader = (row) => expectedHeaders.some((expected) => {
    const cells = Array.from(row.cells);
    return cells.length === expected.length && expected.every((label, index) => {
      const cell = cells[index];
      const expectedLabel = headerText(label);
      return cell.tagName === "TH" && (headerText(cell.textContent ?? text(cell)) === expectedLabel ||
        headerText(text(cell)) === expectedLabel);
    });
  });

  // Retain cell references while expanding spans, so unrelated values never have to be read.
  function expandRow(row, carried, width) {
    const cells = Array(width).fill(null);
    const next = Array(width).fill(null);
    carried.forEach((entry, index) => {
      if (!entry) return;
      cells[index] = entry.cell;
      if (entry.remaining > 1) next[index] = { cell: entry.cell, remaining: entry.remaining - 1 };
    });
    let column = 0;
    for (const cell of row.cells) {
      while (column < width && cells[column]) column++;
      const end = column + cell.colSpan;
      if (end > width || cell.rowSpan < 1 || cells.slice(column, end).some(Boolean)) return null;
      for (; column < end; column++) {
        cells[column] = cell;
        if (cell.rowSpan > 1) next[column] = { cell, remaining: cell.rowSpan - 1 };
      }
    }
    return cells.every(Boolean) ? { cells, next } : null;
  }

  function readRow(cells, sectionTerm) {
    const firstColumnsMerged = cells[0] === cells[1];
    const mergedSchedule = kind === "registered" && firstColumnsMerged && cells[1] === cells[2];
    const summary = Boolean(config.extra?.includes("summary") && firstColumnsMerged);
    const valueFor = (key) => {
      if (key === "summary") return summary ? text(cells[0]) || null : null;
      if (key === "scheduleNote") return mergedSchedule ? text(cells[0]) || null : null;
      if (summary && (key === "year" || key === "term")) return null;
      if (mergedSchedule && (key === "day" || key === "period")) return null;
      if (key === "term" && kind === "registered") {
        return (!mergedSchedule && text(cells[keys.indexOf(key)])) || sectionTerm;
      }
      return text(cells[keys.indexOf(key)]) || null;
    };
    if (!summary && !valueFor(config.anchor)) return null;
    if (kind === "registered" && !valueFor("code")) return null;
    if (kind === "cancellations" && !valueFor("date")) return null;
    if (!Object.entries(filters).every(([key, expected]) => {
      const value = valueFor(key);
      if (!value) return false;
      const actual = normalize(value);
      const target = normalize(expected);
      if (key === "day" && /^[月火水木金土日](?:曜(?:日)?)?$/.test(target)) {
        return /^[月火水木金土日](?:曜(?:日)?)?$/.test(actual) && actual[0] === target[0];
      }
      if (kind === "cancellations" && key === "date") {
        const requestedMonthDay = /^(\d{1,2})\/(\d{1,2})$/.exec(target);
        const displayedMonthDay = /^(\d{1,2})\s*[/.-]\s*(\d{1,2})(?!\d)/.exec(actual);
        if (requestedMonthDay && displayedMonthDay) {
          return Number(requestedMonthDay[1]) === Number(displayedMonthDay[1]) &&
            Number(requestedMonthDay[2]) === Number(displayedMonthDay[2]);
        }
      }
      return actual === target;
    })) return null;
    return Object.fromEntries(fields.map((key) => [key, valueFor(key)]));
  }

  const tables = Array.from(document.querySelectorAll(config.selector || "table.list"))
    .filter(visible);
  const rows = [];
  let sawHeader = false;
  let irregularRows = 0;
  let truncated = false;

  for (const table of tables) {
    const tableRows = Array.from(table.rows);
    const headerIndex = tableRows.findIndex(matchesHeader);
    if (headerIndex < 0) continue;
    sawHeader = true;
    const width = tableRows[headerIndex].cells.length;
    let carried = [];
    let sectionTerm = null;
    for (const row of tableRows.slice(headerIndex + 1)) {
      if (!visible(row)) continue;
      if (row.cells.length === 1 && row.cells[0].colSpan === width) {
        if (kind === "registered") {
          const label = normalize(text(row.cells[0]));
          sectionTerm = /^(?:春学期|秋学期|通年|第[1-4]クォーター)$/.test(label) ? label : null;
        }
        carried = [];
        continue;
      }
      const expanded = expandRow(row, carried, width);
      if (!expanded) {
        irregularRows++;
        carried = [];
        continue;
      }
      carried = expanded.next;
      const record = readRow(expanded.cells, sectionTerm);
      if (record) {
        if (rows.length === limit) {
          truncated = true;
          break;
        }
        rows.push(record);
      }
    }
    if (truncated) break;
  }
  if (!sawHeader) return error("recognized_table_missing");
  return { kind, rows, irregularRows, truncated };
})()
