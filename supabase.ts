import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jkkcmppzgoumxazgxmnu.supabase.co"
const supabaseKey = "sb_publishable_7eqDgs7f0MmQ7daYySeWrw_2Aflh_Hr"

export const supabase = createClient(supabaseUrl, supabaseKey)