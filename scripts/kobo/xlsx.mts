import ExcelJS from "exceljs";

export type Row = Record<string, string>;

function readCell(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) {
    return String(value.text).trim();
  }
  if (typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }
  return String(value).trim();
}

/** Reads the first sheet into plain objects keyed by column name. */
export async function readRows(file: string): Promise<Row[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("File tidak berisi sheet apa pun: " + file);
  }

  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, index) => {
    headers[index] = readCell(cell);
  });

  const rows: Row[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const entry: Row = {};
    row.eachCell({ includeEmpty: true }, (cell, index) => {
      const key = headers[index];
      if (key) entry[key] = readCell(cell);
    });
    rows.push(entry);
  });

  return rows;
}
