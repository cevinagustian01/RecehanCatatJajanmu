const fs=require('fs');
const l=fs.readFileSyncSync('src/app/(dashboard)/profile/ProfileClient.tsx','utf8').split('\n');
console.log(l.length);