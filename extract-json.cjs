const fs = require('fs');
const lines = fs.readFileSync('transcript-apple-utf8.txt', 'utf8').split('\n');
for (let l of lines) {
  try {
    if (!l.trim()) continue;
    const obj = JSON.parse(l);
    if (obj.content && obj.content.includes('"masterEntityProfile"') && obj.content.includes('"Apple Inc"')) {
      let start = obj.content.indexOf('{');
      let end = obj.content.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        fs.writeFileSync('backend/src/data/infynd-complete.json', obj.content.substring(start, end + 1));
        console.log('Extracted perfectly!');
        break;
      }
    }
  } catch (e) {}
}
