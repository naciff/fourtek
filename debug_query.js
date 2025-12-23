const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local to get credentials
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing query...');
    try {
        const { data, error } = await supabase
            .from('representatives')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching rep:', error);
        } else {
            if (data.length > 0) {
                console.log('Representative keys:', Object.keys(data[0]));
                console.log('Sample Data:', JSON.stringify(data[0], null, 2));
            } else {
                console.log("No representatives found.");
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testQuery();
