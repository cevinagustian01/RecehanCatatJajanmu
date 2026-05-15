var fs = require("fs");
var c = fs.readFileSync("src/app/(dashboard)/profile/ProfileClient.tsx", "utf8");

var oldStr = "window.location.href = \"https://t.me/dompttapp_bot/start/\" + d.code";
var newStr = "window.open(\"https://t.me/dompttapp_bot/start/\" + d.code, \"_blank\"); setTimeout(function() { window.location.reload(); }, 5000); toast.info(\"Waiting for Telegram verification...\")";

var nc = c.split(oldStr).join(newStr);
if(nc === c) {
  console.log("STRING NOT FOUND");
} else {
  fs.writeFileSync("src/app/(dashboard)/profile/ProfileClient.tsx", nc);
  console.log("DONE");
}
