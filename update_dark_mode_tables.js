const fs = require('fs');
const path = 'src/app/clients/[id]/page.tsx';

try {
    let content = fs.readFileSync(path, 'utf8');
    let count = 0;

    // Helper to replace and count
    function replaceAll(search, replace) {
        if (content.includes(search)) {
            const matches = content.split(search).length - 1;
            content = content.replaceAll(search, replace);
            count += matches;
            console.log(`Replaced ${matches} occurrences of: ${search}`);
        }
    }

    // Table Containers (already done, but double check divide colors if not covered)
    replaceAll('className="min-w-full divide-y divide-gray-200"', 'className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"');

    // Headers
    replaceAll('className="bg-gray-50"', 'className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200"');
    replaceAll('className="bg-green-50"', 'className="bg-green-50 dark:bg-gray-700 dark:text-gray-200"');
    replaceAll('className="bg-blue-50"', 'className="bg-blue-50 dark:bg-gray-700 dark:text-gray-200"');

    // Bodies
    replaceAll('className="bg-white divide-y divide-gray-200"', 'className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"');

    // Text Colors (Common patterns in this file)
    // Be careful not to double-replace if already has dark class. 
    // Simple way: check if not followed by dark:

    // We will just do simple replacement. CSS cascade handles duplicates mostly, but cleaner to avoid.
    // However, for this task, simple is robust.

    replaceAll('text-gray-900 mb-4', 'text-gray-900 dark:text-white mb-4'); // Headings in forms
    replaceAll('text-gray-900">{', 'text-gray-900 dark:text-white">{'); // Table cells with dynamic content
    replaceAll('text-gray-500">', 'text-gray-500 dark:text-gray-400">'); // Table cells static
    replaceAll('text-gray-500 uppercase', 'text-gray-500 dark:text-gray-400 uppercase'); // Table headers text 
    replaceAll('text-gray-700 uppercase', 'text-gray-700 dark:text-gray-300 uppercase'); // Other table headers

    fs.writeFileSync(path, content, 'utf8');
    console.log(`Total replacements: ${count}`);

} catch (e) {
    console.error('Error:', e);
}
