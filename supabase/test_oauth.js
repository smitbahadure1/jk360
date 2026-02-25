const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hmaphrnontmiqeecefmg.supabase.co';
const supabaseAnonKey = 'sb_publishable_bu-A6BLo6H8uygCMJto1WA_TI_P77ML';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOAuth() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'myapp://auth'
        }
    });
    console.log("OAuth test:", data, error);
}
checkOAuth();
