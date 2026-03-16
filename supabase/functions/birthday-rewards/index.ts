import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Get current date (day and month)
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const currentYear = today.getFullYear()

    console.log(`Checking birthdays for: ${month}-${day}`)

    // 2. Fetch users whose birthday is today and haven't received a reward this year
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, loyalty_points, full_name, last_birthday_reward_year')
      .filter('birthday', 'not.is', null)
      // We need to filter by day and month in SQL or post-process
    
    if (fetchError) throw fetchError

    const birthdayUsers = (users || []).filter(user => {
      const birthday = new Date(user.birthday)
      return (birthday.getMonth() + 1 === month && 
              birthday.getDate() === day && 
              user.last_birthday_reward_year !== currentYear)
    })

    if (birthdayUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No birthdays today' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Get reward points from settings
    const { data: settingsData } = await supabase
      .from('loyalty_settings')
      .select('value')
      .eq('key', 'birthday_bonus')
      .single()
    
    const birthdayPoints = settingsData?.value || 100

    // 4. Process rewards
    const results = []
    for (const user of birthdayUsers) {
      // Add points
      const newPoints = (user.loyalty_points || 0) + birthdayPoints
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          loyalty_points: newPoints,
          last_birthday_reward_year: currentYear
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Failed to update user ${user.id}:`, updateError)
        continue
      }

      // Log reward
      await supabase.from('loyalty_history').insert({
        user_id: user.id,
        points: birthdayPoints,
        type: 'bonus',
        reason: 'Birthday Bonus 🎉'
      })

      await supabase.from('birthday_rewards_log').insert({
        user_id: user.id,
        points_awarded: birthdayPoints,
        reward_date: today.toISOString().split('T')[0]
      })

      // Send In-App Notification (Simulated by adding to a notifications table if it exists, or just logging)
      // If we had a notifications table, we'd insert there.
      
      results.push({ user: user.full_name, points: birthdayPoints })
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${results.length} birthday rewards`,
      details: results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
