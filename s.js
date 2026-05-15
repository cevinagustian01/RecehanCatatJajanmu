var fs=require("fs");
var l=fs.readFileSync("src/app/(dashboard)/profile/ProfileClient.tsx","utf8").split(String.fromCharCode(10));
var ins=[
  "",
  "  const [ct,sCT]=useState(false);",
  "  const [rt,sRT]=useState(false);",
  "",
  "  async function hcT(){sCT(true);try{const r=await fetch("/api/telegram/generate-code",{method:\"POST\"});const d=await r.json();if(d.success)window.location.href=\"https://t.me/dompttapp_bot?start=\"+d.code;else toast.error(d.message||\"Failed\");}catch(e){toast.error(\"Failed\");}finally{sCT(false);}}",
