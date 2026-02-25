const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hmaphrnontmiqeecefmg.supabase.co';
// Need the service role key to bypass RLS, or just use anon key and let RLS block the profiles insert because anon can't insert any profile?
// Wait, the anon key CAN insert if we use the signup process.
const supabaseAnonKey = 'sb_publishable_bu-A6BLo6H8uygCMJto1WA_TI_P77ML';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDemoAuth() {
    console.log('Registering master account...');
    const { data, error } = await supabase.auth.signUp({
        email: 'gawadediksha020@gmail.com',
        password: '12345huggi',
    });

    if (error) {
        console.error('Error signing up:', error.message);
        // It might already exist, so try to log in to get the UUID
        const login = await supabase.auth.signInWithPassword({
            email: 'gawadediksha020@gmail.com',
            password: '12345huggi',
        });
        if (login.data.user) {
            console.log('Logged in successfully. UUID:', login.data.user.id);
            // Check profile
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', login.data.user.id).single();
            if (!prof) {
                console.log('Profile missing. Creating profile as admin...');
                await supabase.from('profiles').insert({
                    id: login.data.user.id,
                    role: 'admin',
                    first_name: 'Diksha',
                    last_name: 'Admin'
                });
            } else {
                console.log('Updating profile to admin...');
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', login.data.user.id);
            }

            // Seed a teacher mapping for this profile
            await supabase.from('teachers').insert({
                profile_id: login.data.user.id,
                class_assigned: 'Class 10',
                section_assigned: 'A'
            }).select('*');
            console.log('Done!');
        }
        return;
    }

    if (data.user) {
        console.log('Signup success. User ID:', data.user.id);

        // Setup admin profile for this new user
        const { error: profErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            role: 'admin',
            first_name: 'Diksha',
            last_name: 'Admin'
        });

        if (profErr) {
            console.error('Profile insertion failed:', profErr.message);
        } else {
            console.log('Admin profile created successfully.');
        }

        const { error: tErr } = await supabase.from('teachers').insert({
            profile_id: data.user.id,
            class_assigned: 'Class 10',
            section_assigned: 'A'
        });

        if (tErr) console.error('Teacher setup failed:', tErr.message);
        else console.log('Teacher module setup successfully.');
    }
}

setupDemoAuth();
