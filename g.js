var fs=require("fs");
var c=fs.readFileSync("src/app/(dashboard)/profile/ProfileClient.tsx","utf8");
var si=c.indexOf("  onClick");
var ei=c.indexOf("</button>",si)+9;
var old=c.substring(si,ei);
