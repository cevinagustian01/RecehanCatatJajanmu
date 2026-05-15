var fs=require("fs");
var c=fs.readFileSync("src/app/api/telegram/webhook/route.ts","utf8");
var l=c.split(String.fromCharCode(10));
var si=l.findIndex(function(x){return x.includes("AI Parsing")});
var ei=l.findIndex(function(x){return x.includes("AI Done")});
var newBlock=["","    // Simple regex parsing (fallback from AI)","    let amount=0,type=\"EXPENSE\",intent=\"TRANSACTION\",merchant=\"Unknown\",category=\"Lainnya\",wallet_name=\"Main Wallet\";","    var txt2=text.toLowerCase();","    var ma=txt2.match(/(\\d+)\\s*(rb|jt|juta|k)?/);","    if(ma){var n=Number(ma[1]);amount=ma[2]===\"jt\"||ma[2]===\"juta\"?n*1000000:ma[2]===\"k\"?n*1000:n;}","    if([\"gaji\",\"terima\",\"masuk\",\"diterima\",\"saldo\",\"balance\"].some(function(w){return txt2.includes(w);}))type=\"INCOME\";","    if([\"berapa\",\"cek\",\"saldo\",\"balance\",\"report\"].some(function(w){return txt2.includes(w);}))intent=\"QUERY\";","    var r={intent:intent,amount:amount,type:type,category:category,merchant:merchant,wallet_name:wallet_name};",""];
