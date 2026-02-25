const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hmaphrnontmiqeecefmg.supabase.co';
const supabaseAnonKey = 'sb_publishable_bu-A6BLo6H8uygCMJto1WA_TI_P77ML';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogin() {
    const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'gawadediksha020@gmail.com',
        password: '12345huggi'
    });
    console.log("Auth user id:", authData?.user?.id);

    if (authData?.user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', authData.user.id);
        console.log("Profile:", profileData);
    }
}
checkLogin();
