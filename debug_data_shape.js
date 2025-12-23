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
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
    console.log('--- Debugging Data Shape ---');

    // 1. Find a link
    const linkRes = await supabase.from('client_representatives').select('client_id').limit(1);
    if (linkRes.error) {
        console.error('Error finding link:', linkRes.error);
        return;
    }
    if (!linkRes.data || linkRes.data.length === 0) {
        console.log('No client_representatives found in DB. Cannot test.');
        return;
    }
    const clientId = linkRes.data[0].client_id;
    console.log('Found client with representative:', clientId);

    // 2. Query clients table with nested join
    const { data, error } = await supabase
        .from('clients')
        .select(`
            id, 
            alias, 
            client_representatives (
                representatives (id, full_name)
            ), 
            client_services (
                services (id, name)
            )
        `)
        .eq('id', clientId)
        .single();

    if (error) {
        console.error('Error fetching client nested data:', error);
    } else {
        console.log('--- Client Data Structure ---');
        console.log(JSON.stringify(data, null, 2));
    }
}

debugData();
