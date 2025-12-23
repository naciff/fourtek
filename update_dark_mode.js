const fs = require('fs');
const path = 'src/app/clients/[id]/page.tsx';
const search = 'className="rounded-lg border bg-white overflow-hidden shadow-sm"';
const replace = 'className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden shadow-sm"';

try {
    let content = fs.readFileSync(path, 'utf8');
    if (content.includes(search)) {
        const newContent = content.replaceAll(search, replace);
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Successfully replaced ' + (content.split(search).length - 1) + ' occurrences.');
    } else {
        console.log('No matches found for string: ' + search);
    }
} catch (e) {
    console.error('Error:', e);
}
