/**
 * Google Apps Script — receives website inquiries and appends them to the "Leads" sheet.
 *
 * Setup (once):
 * 1. Create a Google Sheet (e.g. "STUDIO Leads"). Extensions → Apps Script → paste this file.
 * 2. Set SECRET below to a long random string (or leave "" to accept any caller).
 * 3. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.
 * 4. Copy the Web app URL into Vercel env `SHEETS_WEBHOOK_URL` (and the secret into `SHEETS_WEBHOOK_SECRET`).
 *    Redeploy the site. Every contact-form submission now lands as a row with Status "New".
 *
 * Columns match the cold-calling sheet so website leads and called leads live in one place.
 */
var SHEET_NAME = "Leads";
var SECRET = ""; // ← same value as SHEETS_WEBHOOK_SECRET in Vercel

var HEADERS = [
  "Date",
  "Business / Name",
  "Email",
  "Phone",
  "Subject",
  "Source",
  "Message",
  "Status",
  "Next action",
  "Next action date",
  "Notes",
];

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ ok: false, error: "invalid json" });
  }
  if (SECRET && data.secret !== SECRET) return respond({ ok: false, error: "forbidden" });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(data.receivedAt || Date.now()),
    data.name || "",
    data.email || "",
    "", // phone: filled by hand later
    data.subject || "",
    "Website · " + (data.source || "general"),
    data.message || "",
    "New",
    "Reply within 24h",
    new Date(),
    "",
  ]);

  return respond({ ok: true });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
