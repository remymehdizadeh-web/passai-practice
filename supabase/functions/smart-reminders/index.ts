import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudySession {
  user_id: string;
  session_date: string;
  questions_completed: number;
  study_hour: number; // 0-23
  day_of_week: number; // 0-6 (Sunday-Saturday)
}

interface ReminderPayload {
  user_id: string;
  action: 'track_session' | 'get_reminder_time' | 'check_missed_session';
  session_data?: {
    questions_completed: number;
  };
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: ReminderPayload = await req.json();

    console.log('Smart reminders request:', payload.action, 'for user:', payload.user_id);

    switch (payload.action) {
      case 'track_session': {
        // Track when user studies
        const now = new Date();
        const sessionData = {
          user_id: payload.user_id,
          session_date: now.toISOString().split('T')[0],
          study_hour: now.getHours(),
          day_of_week: now.getDay(),
          questions_completed: payload.session_data?.questions_completed || 1,
        };

        // Upsert study pattern
        const { error } = await supabase
          .from('study_patterns')
          .upsert(sessionData, { onConflict: 'user_id,session_date' });

        if (error) {
          console.error('Error tracking session:', error);
          // Table might not exist yet, that's ok
        }

        console.log('Tracked study session for user:', payload.user_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Session tracked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_reminder_time': {
        // Calculate optimal reminder time based on user's study patterns
        const { data: patterns } = await supabase
          .from('study_patterns')
          .select('study_hour, day_of_week')
          .eq('user_id', payload.user_id)
          .order('session_date', { ascending: false })
          .limit(30);

        let optimalHour = 19; // Default 7 PM
        let optimalDays = [1, 2, 3, 4, 5]; // Weekdays by default

        if (patterns && patterns.length >= 5) {
          // Calculate most common study hour
          const hourCounts: Record<number, number> = {};
          patterns.forEach(p => {
            hourCounts[p.study_hour] = (hourCounts[p.study_hour] || 0) + 1;
          });
          
          optimalHour = parseInt(
            Object.entries(hourCounts)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || '19'
          );

          // Calculate most common study days
          const dayCounts: Record<number, number> = {};
          patterns.forEach(p => {
            dayCounts[p.day_of_week] = (dayCounts[p.day_of_week] || 0) + 1;
          });
          
          optimalDays = Object.entries(dayCounts)
            .filter(([_, count]) => count >= 2)
            .map(([day]) => parseInt(day));
        }

        console.log('Optimal reminder time for user:', payload.user_id, 'hour:', optimalHour, 'days:', optimalDays);

        return new Response(
          JSON.stringify({
            success: true,
            optimalHour,
            optimalDays,
            hasEnoughData: (patterns?.length || 0) >= 5,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_missed_session': {
        // Check if user missed their usual study time
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        // Get user's typical study patterns
        const { data: patterns } = await supabase
          .from('study_patterns')
          .select('study_hour, day_of_week')
          .eq('user_id', payload.user_id)
          .order('session_date', { ascending: false })
          .limit(14);

        // Check if user already studied today
        const { data: todaySession } = await supabase
          .from('study_patterns')
          .select('id')
          .eq('user_id', payload.user_id)
          .eq('session_date', today)
          .single();

        if (todaySession) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              shouldRemind: false,
              reason: 'User already studied today'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Determine if this is a typical study day/time
        let isTypicalStudyDay = false;
        let typicalStudyHour = 19;

        if (patterns && patterns.length >= 5) {
          const dayPatterns = patterns.filter(p => p.day_of_week === currentDay);
          isTypicalStudyDay = dayPatterns.length >= 2;
          
          if (dayPatterns.length > 0) {
            const hourCounts: Record<number, number> = {};
            dayPatterns.forEach(p => {
              hourCounts[p.study_hour] = (hourCounts[p.study_hour] || 0) + 1;
            });
            typicalStudyHour = parseInt(
              Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '19'
            );
          }
        }

        // Generate contextual reminder message
        let reminderMessage = '';
        const hoursPastTypical = currentHour - typicalStudyHour;

        if (isTypicalStudyDay && hoursPastTypical >= 1 && hoursPastTypical <= 3) {
          reminderMessage = "You usually study around this time. Ready for a quick session?";
        } else if (isTypicalStudyDay && hoursPastTypical > 3) {
          reminderMessage = "Missed your usual study time today? Even 5 questions helps!";
        } else if (currentHour >= 20 && currentHour < 22) {
          reminderMessage = "End your day strong with a quick practice session.";
        }

        console.log('Missed session check for user:', payload.user_id, 
          'shouldRemind:', !!reminderMessage, 
          'message:', reminderMessage);

        return new Response(
          JSON.stringify({
            success: true,
            shouldRemind: !!reminderMessage,
            message: reminderMessage,
            isTypicalStudyDay,
            typicalStudyHour,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in smart-reminders function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
