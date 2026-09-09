/**
 * Google Apps Script for the "STUDIO Leads" sheet.
 *
 *  - setup()  : run ONCE from the editor (Run ▸ setup). Builds the Leads tab: headers, dropdowns,
 *               colours, column widths, frozen header. Safe to re-run; it never deletes rows.
 *  - doPost() : web-app endpoint the website calls for every contact-form inquiry.
 *
 * Deploy: Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Who has access: Anyone.
 * Put the web-app URL in Vercel as SHEETS_WEBHOOK_URL and SECRET (below) as SHEETS_WEBHOOK_SECRET.
 */
var SHEET_NAME = "Leads";
var SECRET = ""; // ← same value as SHEETS_WEBHOOK_SECRET in Vercel ("" accepts any caller)

var HEADERS = [
  "Date",
  "Business",
  "Contact name",
  "Phone",
  "Email",
  "Website",
  "Niche",
  "City / Country",
  "Source",
  "Status",
  "Subject / Interest",
  "Last contact",
  "Next action",
  "Next action date",
  "Demo link sent",
  "Notes",
];

var STATUSES = ["New", "Called - no answer", "Called - talked", "Demo sent", "Follow-up", "Meeting booked", "Proposal sent", "Won", "Lost", "Not interested"];
var SOURCES = ["Website", "Cold call", "Email", "Referral", "LinkedIn", "Other"];
var NICHES = ["Trades", "Dental / clinic", "Restaurant / cafe", "E-commerce", "Real estate", "SaaS / startup", "Other"];

var STATUS_COLOURS = {
  "New": "#e8f0fe",
  "Called - no answer": "#f1f3f4",
  "Called - talked": "#fef7e0",
  "Demo sent": "#fce8b2",
  "Follow-up": "#fdd663",
  "Meeting booked": "#d2e3fc",
  "Proposal sent": "#c6ff3f",
  "Won": "#b7e1cd",
  "Lost": "#f4c7c3",
  "Not interested": "#e0e0e0",
};

/** One-time setup of the Leads tab. Re-runnable. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getName() !== "STUDIO Leads") ss.rename("STUDIO Leads");
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet && sheet.getLastRow() > 0 && !hasCurrentHeaders(sheet)) {
    // Old layout with data in it: keep it aside, never delete anything.
    sheet.setName(uniqueName(ss, SHEET_NAME + " (old)"));
    sheet = null;
  }
  if (!sheet) {
    var first = ss.getSheets()[0];
    if (first.getLastRow() === 0 && first.getName() !== "Today") {
      first.setName(SHEET_NAME);
      sheet = first;
    } else {
      sheet = ss.insertSheet(SHEET_NAME, 0);
    }
  }

  // Header row
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#0b0b0c")
    .setFontColor("#c6ff3f")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);

  // Column widths
  var widths = [110, 200, 140, 130, 200, 180, 130, 150, 110, 150, 200, 110, 200, 130, 220, 320];
  widths.forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });

  var rows = Math.max(sheet.getMaxRows() - 1, 500);
  var col = function (name) {
    return HEADERS.indexOf(name) + 1;
  };

  // Dropdowns
  setDropdown(sheet, col("Status"), rows, STATUSES);
  setDropdown(sheet, col("Source"), rows, SOURCES);
  setDropdown(sheet, col("Niche"), rows, NICHES);

  // Date formats
  ["Date", "Last contact", "Next action date"].forEach(function (name) {
    sheet.getRange(2, col(name), rows, 1).setNumberFormat("yyyy-mm-dd");
  });

  // Status colours (whole row tinted by status)
  var statusCol = col("Status");
  var statusLetter = columnLetter(statusCol);
  var range = sheet.getRange(2, 1, rows, HEADERS.length);
  var rules = [];
  Object.keys(STATUS_COLOURS).forEach(function (status) {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$' + statusLetter + '2="' + status + '"')
        .setBackground(STATUS_COLOURS[status])
        .setRanges([range])
        .build()
    );
  });
  // Overdue next action → red text
  var nextLetter = columnLetter(col("Next action date"));
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + nextLetter + '2<>"", $' + nextLetter + '2<TODAY(), $' + statusLetter + '2<>"Won", $' + statusLetter + '2<>"Lost", $' + statusLetter + '2<>"Not interested")')
      .setFontColor("#c5221f")
      .setBold(true)
      .setRanges([sheet.getRange(2, col("Next action date"), rows, 1)])
      .build()
  );
  sheet.setConditionalFormatRules(rules);

  // "Today" filter view helper: a second tab with the day's follow-ups
  var today = ss.getSheetByName("Today");
  if (!today) {
    today = ss.insertSheet("Today");
    today.getRange("A1").setValue("Follow-ups due today or overdue (auto)");
    today.getRange("A1").setFontWeight("bold");
    today
      .getRange("A2")
      .setFormula(
        '=IFERROR(SORT(FILTER(Leads!A2:P, Leads!N2:N<>"", Leads!N2:N<=TODAY(), Leads!J2:J<>"Won", Leads!J2:J<>"Lost", Leads!J2:J<>"Not interested"), 14, TRUE), "Nothing due 🎉")'
      );
  }

  ss.setActiveSheet(sheet);
}

/** True when row 1 already holds the current HEADERS. */
function hasCurrentHeaders(sheet) {
  var row = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  return HEADERS.every(function (h, i) {
    return row[i] === h;
  });
}

function uniqueName(ss, base) {
  var name = base;
  for (var i = 2; ss.getSheetByName(name); i++) name = base + " " + i;
  return name;
}

function setDropdown(sheet, column, rows, values) {
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, column, rows, 1).setDataValidation(rule);
}

function columnLetter(n) {
  var s = "";
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Website inquiries land here. */
function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ ok: false, error: "invalid json" });
  }
  if (SECRET && data.secret !== SECRET) return respond({ ok: false, error: "forbidden" });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || !hasCurrentHeaders(sheet)) {
    setup();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  var row = {};
  HEADERS.forEach(function (h) {
    row[h] = "";
  });
  row["Date"] = new Date(data.receivedAt || Date.now());
  row["Business"] = data.business || data.name || "";
  row["Contact name"] = data.name || "";
  row["Phone"] = data.phone || "";
  row["Email"] = data.email || "";
  row["Website"] = data.website || "";
  row["Niche"] = data.niche || "";
  row["City / Country"] = data.location || "";
  row["Source"] = data.origin || "Website";
  row["Status"] = data.status || "New";
  row["Subject / Interest"] = data.subject || "";
  row["Next action"] = data.nextAction || "Reply within 24h";
  row["Next action date"] = new Date();
  row["Notes"] = [data.source ? "form source: " + data.source : "", data.message || ""].filter(String).join(" — ");

  sheet.appendRow(
    HEADERS.map(function (h) {
      return row[h];
    })
  );
  return respond({ ok: true });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
