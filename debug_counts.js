const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTables() {
    console.log('--- Checking Tables ---');

    // Check Counts
    const { count: repsCount } = await supabase.from('representatives').select('*', { count: 'exact', head: true });
    const { count: linkRepCount } = await supabase.from('client_representatives').select('*', { count: 'exact', head: true });
    const { count: linkSvcCount } = await supabase.from('client_services').select('*', { count: 'exact', head: true });

    console.log('Representatives Count:', repsCount);
    console.log('Client-Representatives Links:', linkRepCount);
    console.log('Client-Services Links:', linkSvcCount);

    if (linkRepCount === 0) {
        console.log('Attempting to create a test link...');
        // Need a client and a rep
        const { data: client } = await supabase.from('clients').select('id').limit(1).single();
        const { data: rep } = await supabase.from('representatives').select('id').limit(1).single();

        if (client && rep) {
            console.log('Linking Client', client.id, 'to Rep', rep.id);
            const { error } = await supabase.from('client_representatives').insert({
                client_id: client.id,
                representative_id: rep.id
            });
            if (error) console.error('Insert Error:', error);
            else console.log('Insert Success!');
        } else {
            console.log('Cannot link: Missing client or rep');
        }
    }
}

checkTables();
