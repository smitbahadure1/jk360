const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hmaphrnontmiqeecefmg.supabase.co';
const supabaseAnonKey = 'sb_publishable_bu-A6BLo6H8uygCMJto1WA_TI_P77ML';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'gawadediksha020@gmail.com',
        password: '12345huggi'
    });
    if (error) {
        console.error("Login Error:", error.message, error.name, error.status);
    } else {
        console.log("Login Success! User:", data.user.id);
    }
}
checkLogin();
