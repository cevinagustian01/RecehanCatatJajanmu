const fs = require('fs');
const l = fs.readFileSync('src/app/(dashboard)/profile/ProfileClient.tsx', 'utf8').split('\n');

const ins = [
  '',
  '  const [ct, sCT] = useState(false);',
  '  const [rt, sRT] = useState(false);',
  '',
  '  async function hcT() { sCT(true); try { const r = await fetch("/api/telegram/generate-code", {method:"POST"}); const d = await r.json(); if(d.success) window.location.href = "https://t.me/dompttapp_bot?start=" + d.code; else toast.error(d.message||"Failed"); } catch(e) { toast.error("Failed"); } finally { sCT(false); } }',
  '',
  '  async function hdT() { sRT(true); try { const r = await fetch("/api/telegram/revoke", {method:"POST"}); const d = await r.json(); if(d.success) { await refreshUser(); toast.success("Disconnected"); setFormData({...formData, connectTelegram: false}); } else { toast.error(d.message||"Failed"); } } catch(e) { toast.error("Failed"); } finally { sRT(false); } }',
  ''
];

const m = [...l.slice(0, 31), ...ins, ...l.slice(31)];

let ts = -1, te = -1;
for(let i = 0; i < m.length; i++) {
  if(m[i].includes('setFormData({...formData, connectTelegram: !formData.connectTelegram})')) ts = i;
  if(ts !== -1 && m[i].includes('</button>') && m[i].includes('rounded-full') && !m[i].includes('<div')) { te = i; break; }
}
console.log('Toggle:', ts+1, '-', te+1);

const rp = [
  '                <div className="flex items-center gap-2">',
  '                  <span className={cn("rounded-full px-3 py-1 text-xs font-medium", initialUser?.telegramVerified ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400")}>{initialUser?.telegramVerified ? "Connected" : "Not connected"}</span>',
  '                  {initialUser?.telegramVerified ? (<button type="button" onClick={hdT} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50">Putuskan</button>) : (<button type="button" onClick={hcT} className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600">Connect</button>)}',
  '                </div>'
];

const r = [...m.slice(0, ts), ...rp, ...m.slice(te + 1)];
fs.writeFileSync('src/app/(dashboard)/profile/ProfileClient.tsx', r.join('\n'));
console.log('Done:', r.length, 'lines');
