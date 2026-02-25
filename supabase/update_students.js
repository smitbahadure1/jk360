const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hmaphrnontmiqeecefmg.supabase.co';
const supabaseAnonKey = 'sb_publishable_bu-A6BLo6H8uygCMJto1WA_TI_P77ML';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rawData = [
    { roll: '2025012010', name: 'DHAMAL SIDDHI SANJAY SARIKA' },
    { roll: '2025012013', name: 'DUBEY SUMIT KUMAR DILIP KUMAR PADMA' },
    { roll: '2025012014', name: 'GAUTAM KRISHNA PAPPU POONAM' },
    { roll: '2025012017', name: 'GOUND VIRENDRA KUMAR VIJAY SATBINDAR' },
    { roll: '2025012018', name: 'GUPTA OM JITENDRA SANGEETA' },
    { roll: '2025012020', name: 'GURAV KARTIK PRAKASH CHANDRAKALA' },
    { roll: '2025012022', name: 'HATLE HARSHAL DILIP DIPIKA' },
    { roll: '2025012025', name: 'KADAM SHUBHAM CHANDRAKANT LEELA' },
    { roll: '2025012029', name: 'KARANGUTKAR SOHAM PRAVIN PRERNA' },
    { roll: '2025012031', name: 'KHAW SURAJ ANIL GUDIYA' },
    { roll: '2025012032', name: 'KUMAWAT LALIT DUDARAM SANTOSHI' },
    { roll: '2025012036', name: 'PANDEY HARSH BRAMHADEV KAVITA' },
    { roll: '2025012041', name: 'PATIL SUJAL SURESH VARSHA' },
    { roll: '2025012053', name: 'SHELAR MANISH DHONDIBA SARITA' },
    { roll: '2025012057', name: 'SIDDIQUE MOHD RASHID MOHD NASTAIN AFSHARI KHATOON' },
    { roll: '2025012058', name: 'SINGH AMIT RANDHIR MALA' },
    { roll: '2025012059', name: 'SINGH DIVYANSHU DHANANJAY KAMALADEVI' },
    { roll: '2025012061', name: 'SONI BHARAT RAMPRAKASH ANITA' },
    { roll: '2025012064', name: 'VISHWAKARMA KARAN ASHOK GUNJAN' },
    { roll: '2025012068', name: 'YADAV ABHISHEK KAMLESH RITA' },
    { roll: '2025012070', name: 'YADAV ANSHIKA RAMESH VINDU' },
    { roll: '2025012073', name: 'JANRAO NEHA ABHIMANYU DIPALI' },
    { roll: '2025012074', name: 'YADAV ABHISHEK RAMSWARTH SARITA' }
];

async function run() {
    // Login as admin to bypass standard RLS restrictions 
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'gawadediksha020@gmail.com',
        password: '12345huggi'
    });
    if (authErr) {
        console.error("Auth error:", authErr);
        return;
    }

    console.log("Deleting old data...");
    await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const formatted = rawData.map(r => {
        const parts = r.name.split(' ');
        // usually: Last Name, First Name, Middle Name...
        return {
            first_name: parts[1] || 'Unknown',
            last_name: parts[0] || 'Unknown',
            roll_number: r.roll,
            class_name: 'BSC.CS-TY',
            section: 'A',
            email: `${r.roll}@jkcollege.edu`.toLowerCase(),
            gender: 'Other',
            date_of_birth: '2004-01-01',
            guardian_name: parts.slice(2).join(' ') || '-'
        };
    });

    console.log("Inserting new students into live Supabase DB...");
    const { data, error } = await supabase.from('students').insert(formatted).select();
    if (error) {
        console.error("Failed to insert:", error);
    } else {
        console.log(`Success! Inserted ${data.length} actual students.`);
    }
}

run();
