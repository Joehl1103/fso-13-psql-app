const { format } = require("sql-formatter");

function logSql(message) {
  const sql = message
    .replace(/^Execut(?:ing|ed) \([^)]+\):\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

  console.log("\n──────── SQL ────────");
  console.log(
    format(sql, {
      language: "postgresql",
    }),
  );
  console.log("─────────────────────\n");
}

module.exports = {
  logSql,
};
