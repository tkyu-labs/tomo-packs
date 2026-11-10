"""Check a draft course plan against the hard rules, so no model has to count: every number in the answer comes from
here. Runs on the student's computer only (grades never leave it); standard library only.

    "${TOMO_PYTHON:-python3}" check_plan.py plan.json      # prints the result as JSON
    "${TOMO_PYTHON:-python3}" check_plan.py - <<'JSON'     # the plan on stdin
    {…}
    JSON
    "${TOMO_PYTHON:-python3}" check_plan.py --self-test    # fictional cases

plan.json (the skill builds it from CampusSquare, the syllabus service and the student's memory):
{
  "student": {"year": 2, "term": "後学期", "max_hard_per_term": 1},
  "cap_left": 8,                                   # 登録可能(CAP残り), credits; null = unknown
  "earned_total": 60, "registered_total": 20,      # 修得 and 履修 (this term) credits; graduation needs 124
  "categories": [{"name": "■社会人基礎科目", "base": 24, "max": null, "earned": 18, "registered": 4}],
  "passed": ["プログラミング基礎", …], "failed": ["確率統計リテラシ１", …],
  "candidates": [{"code": "S-…", "name": "…", "grade": "2年次", "term": "後学期", "credits": 2, "counts_for": "■社会人基礎科目",
                  "prerequisites": [{"name": "線形代数", "required": true}], "hard": false}],
  "plan": ["S-…", …]
}
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata

GRADUATION = 124


def norm(name: str) -> str:
    """Course names as compared: NFKC, no spaces, no 【…】 notes or trailing marks (CampusSquare shortens and adds them)."""
    n = unicodedata.normalize("NFKC", name or "")
    n = re.sub(r"【[^】]*】|\[[^\]]*\]", "", n)
    n = re.sub(r"[\s　*＊※]+", "", n)
    return n.strip()


def base_name(name: str) -> str:
    """A course without its コース / option (学術横断プログラム２Ｂ ～ＡＩコース～ → 学術横断プログラム2B)."""
    return re.sub(r"[~～〜].*$", "", norm(name))


def grades_of(text: str) -> set[int]:
    """配当年次 as printed → the years it names (2年次 → {2}, 1・2・3年次 → {1,2,3}, 2年次以上 → {2,…,6})."""
    t = unicodedata.normalize("NFKC", text or "")
    years = {int(x) for x in re.findall(r"(\d)", t)}
    if len(years) == 1 and "以上" in t:
        years = set(range(min(years), 7))
    return years


def term_fits(course_term: str, term: str) -> bool:
    t = unicodedata.normalize("NFKC", course_term or "")
    return term in t or ("前学期" in t and "後学期" in t)


def check(data: dict) -> dict:
    student = data.get("student") or {}
    year, term = student.get("year"), student.get("term") or ""
    by_code = {c["code"]: c for c in data.get("candidates") or []}
    passed = {norm(x) for x in data.get("passed") or []}
    failed = {norm(x) for x in data.get("failed") or []} - passed
    plan = [by_code.get(code) or {"code": code, "name": "", "unknown": True} for code in data.get("plan") or []]
    results, seen_names, seen_bases = [], {}, {}
    for c in plan:
        errors, warnings = [], []
        if c.get("unknown"):
            errors.append("not among the candidates (look it up first)")
        n, b = norm(c.get("name", "")), base_name(c.get("name", ""))
        if n and n in passed:
            errors.append("already passed: a passed course cannot be taken again")
        if n in seen_names:
            errors.append(f"twice in the plan (also {seen_names[n]})")
        elif b and b in seen_bases and b != n:
            errors.append(f"another option of the same course is in the plan ({seen_bases[b]}): only one counts")
        seen_names.setdefault(n, c["code"])
        seen_bases.setdefault(b, c["code"])
        years = grades_of(c.get("grade") or "")
        if year and years and year < min(years):
            errors.append(f"配当年次 {c['grade']}: not open to year {year} yet")
        elif year and years and year > max(years):
            # later years often may take it (a retake, a missed elective); the 履修要項 decides
            warnings.append(f"配当年次 {c['grade']}: a course of an earlier year; check that year {year} may register it")
        if term and c.get("term") and not term_fits(c["term"], term):
            errors.append(f"taught in {c['term']}, not {term}")
        for p in c.get("prerequisites") or []:
            if norm(p.get("name", "")) not in passed:
                (errors if p.get("required") else warnings).append(
                    f"{'requires' if p.get('required') else 'recommends'} {p.get('name')} first (not passed)")
        if n in failed:
            warnings.append("a retake of a failed course")
        results.append({"code": c["code"], "name": c.get("name", ""), "credits": c.get("credits") or 0,
                        "status": "error" if errors else "warning" if warnings else "ok", "errors": errors, "warnings": warnings})
    planned = sum(r["credits"] for r in results if r["status"] != "error")
    out: dict = {"courses": results, "plan_credits": planned}
    # CAP
    cap = data.get("cap_left")
    if cap is not None:
        out["cap"] = {"left": cap, "planned": planned, "over": max(0, planned - cap)}
    # categories: what each short ■ row needs, what the plan adds (up to 上限), what is still missing
    cats = []
    for row in data.get("categories") or []:
        base, earned, registered = row.get("base") or 0, row.get("earned") or 0, row.get("registered") or 0
        cap_row = row.get("max")
        add = sum(r["credits"] for r in results if r["status"] != "error" and by_code.get(r["code"], {}).get("counts_for") == row["name"])
        have = earned + registered
        counted = min(add, max(0, cap_row - have)) if cap_row is not None else add
        cats.append({"name": row["name"], "base": base, "have": have, "short_before": max(0, base - have),
                     "plan_adds": counted, "short_after": max(0, base - have - counted),
                     **({"over_limit": add - counted} if add > counted else {})})
    out["categories"] = cats
    # retakes offered now but not planned
    offered = {norm(c["name"]): c["code"] for c in by_code.values()}
    planned_names = {norm(r["name"]) for r in results}
    out["retakes_not_planned"] = [{"name": n, "code": offered[n]} for n in sorted(failed) if n in offered and n not in planned_names]
    # hard subjects spread over terms
    hard = [r["code"] for r in results if r["status"] != "error" and by_code.get(r["code"], {}).get("hard")]
    limit = student.get("max_hard_per_term", 1)
    out["hard_subjects"] = {"planned": hard, "limit": limit, "too_many": len(hard) > limit}
    # totals
    if data.get("earned_total") is not None:
        after = (data.get("earned_total") or 0) + (data.get("registered_total") or 0) + planned
        out["totals"] = {"earned": data["earned_total"], "registered": data.get("registered_total") or 0, "plan": planned,
                         "after": after, "graduation": GRADUATION, "left": max(0, GRADUATION - after)}
    out["ok"] = (not any(r["status"] == "error" for r in results) and not out.get("cap", {}).get("over")
                 and not out["hard_subjects"]["too_many"])
    return out


def self_test() -> None:
    data = {
        "student": {"year": 2, "term": "後学期", "max_hard_per_term": 1},
        "cap_left": 6, "earned_total": 60, "registered_total": 20,
        "categories": [{"name": "■社会人基礎科目", "base": 24, "max": None, "earned": 18, "registered": 4},
                       {"name": "■共通基盤科目", "base": 16, "max": 20, "earned": 14, "registered": 4}],
        "passed": ["プログラミング基礎", "線形代数【Lin Mei】"], "failed": ["確率統計リテラシ１"],
        "candidates": [
            {"code": "A", "name": "キャリアデザイン２", "grade": "2年次", "term": "後学期", "credits": 2, "counts_for": "■社会人基礎科目"},
            {"code": "B", "name": "プログラミング基礎", "grade": "1年次", "term": "前学期", "credits": 2},
            {"code": "C", "name": "応用数学", "grade": "1・2・3年次", "term": "後学期", "credits": 2, "hard": True, "counts_for": "■共通基盤科目",
             "prerequisites": [{"name": "線形代数", "required": True}]},
            {"code": "D", "name": "解析学", "grade": "２年次", "term": "前学期・後学期", "credits": 2, "hard": True, "counts_for": "■共通基盤科目"},
            {"code": "E", "name": "学術横断プログラム２Ｂ ～ＡＩコース～", "grade": "2年次", "term": "後学期", "credits": 2},
            {"code": "F", "name": "学術横断プログラム２Ｂ ～IoTコース～", "grade": "2年次", "term": "後学期", "credits": 2},
            {"code": "G", "name": "確率統計リテラシ１", "grade": "1・2年次", "term": "後学期", "credits": 2},
            {"code": "H", "name": "卒業研究Ａ", "grade": "4年次", "term": "前学期", "credits": 4,
             "prerequisites": [{"name": "情報学課題解決実習３", "required": True}]},
        ],
        "plan": ["A", "B", "C", "D", "E", "F", "H"],
    }
    r = check(data)
    st = {c["code"]: c for c in r["courses"]}
    assert st["A"]["status"] == "ok", st["A"]
    assert any("already passed" in e for e in st["B"]["errors"]) and any("not 後学期" in e for e in st["B"]["errors"])
    assert st["C"]["status"] == "ok"                      # 線形代数 passed (【…】 stripped), year 2 in 1・2・3年次
    assert st["D"]["status"] == "ok"                      # full-width ２, all-year course
    assert st["E"]["status"] == "ok" and any("same course" in e for e in st["F"]["errors"])
    assert any("not open to year 2 yet" in e for e in st["H"]["errors"]) and any("requires 情報学課題解決実習３" in e for e in st["H"]["errors"])
    assert r["plan_credits"] == 8 and r["cap"] == {"left": 6, "planned": 8, "over": 2}
    soc = next(c for c in r["categories"] if c["name"] == "■社会人基礎科目")
    assert (soc["short_before"], soc["plan_adds"], soc["short_after"]) == (2, 2, 0)
    com = next(c for c in r["categories"] if c["name"] == "■共通基盤科目")
    assert (com["have"], com["plan_adds"], com.get("over_limit")) == (18, 2, 2)   # 上限 20: only 2 of 4 count
    assert r["retakes_not_planned"] == [{"name": "確率統計リテラシ1", "code": "G"}]
    assert r["hard_subjects"]["too_many"] and r["totals"]["after"] == 88 and r["ok"] is False
    later = check({"student": {"year": 3, "term": "後学期"}, "candidates": [data["candidates"][0]], "plan": ["A"]})
    assert later["courses"][0]["status"] == "warning" and "earlier year" in later["courses"][0]["warnings"][0]
    print("self-test ok")


def main() -> None:
    if sys.argv[1:] == ["--self-test"]:
        self_test()
        return
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    if sys.argv[1] == "-":
        sys.stdin.reconfigure(encoding="utf-8")
        result = check(json.load(sys.stdin))
    else:
        with open(sys.argv[1], encoding="utf-8") as f:
            result = check(json.load(f))
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
