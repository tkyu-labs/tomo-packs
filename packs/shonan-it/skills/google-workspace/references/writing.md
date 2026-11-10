# Writing a mail to the school (Japanese)

Students write to faculty and offices in polite Japanese. Keep it short; one request per mail. Write the draft in
Japanese and explain it to the student in their language.

## Parts

1. **件名** (subject): what it is about, with name: `【欠席連絡】11月20日（木）2限 情報リテラシー／{{FULL_NAME}}`.
   Common labels: 【欠席連絡】, 【質問】, 【課題提出】, 【ご相談】, 【お願い】.
2. **宛名**: `〇〇先生` for faculty (no 様 after 先生); an office: `学生課 御中` (the office) or `学生課 ご担当者様`.
3. **名乗り**: `情報学部情報学科2年の{{FULL_NAME}}です。学籍番号は{{STUDENT_NUMBER}}です。` (faculty, year from memory).
4. **本文**: the reason, the request, the date and class (曜日・時限・科目名), what is attached. Polite, no excuses at length.
5. **結び**: `お忙しいところ恐れ入りますが、よろしくお願いいたします。`
6. **署名**:
   ```
   ----
   {{FULL_NAME}}
   湘南工科大学 情報学部情報学科 2年
   学籍番号：{{STUDENT_NUMBER}}
   {{SCHOOL_EMAIL}}
   ```
   (`{{SCHOOL_EMAIL}}` only if the student added it in About you; otherwise leave the line out.)

## Example (fictional)

```
件名：【欠席連絡】11月20日（木）2限 情報リテラシー／{{FULL_NAME}}

山田先生

情報学部情報学科2年の{{FULL_NAME}}です。学籍番号は{{STUDENT_NUMBER}}です。

体調不良のため、11月20日（木）2限の「情報リテラシー」を欠席いたします。
配布資料と課題がありましたら、確認方法を教えていただけますでしょうか。

お忙しいところ恐れ入りますが、よろしくお願いいたします。

----
{{FULL_NAME}}
湘南工科大学 情報学部情報学科 2年
学籍番号：{{STUDENT_NUMBER}}
```

## Replies

`Re:` the original subject; quote only the line you answer, or none. Thank first (`ご連絡ありがとうございます。`),
answer every question asked, then the signature.

## Checks before showing the draft

- Recipient is the right person or office (from the mail being answered, or the official site via `school-info`);
  never guess an address.
- Dates have the weekday; class has 曜日・時限・科目名.
- No information the student did not give (reasons, illness details): ask one short question instead.
