/* ============================================================
   supabase-client.js · 云端数据客户端
   依赖：@supabase/supabase-js（通过 CDN UMD 引入到 window.supabase）
   暴露：window.SB（Supabase Client 实例）
   ============================================================ */

const SUPABASE_URL      = 'https://awszrimfifexyrlsvkjh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XdbW4fIX2fM7HPDtYjQfvA_n7URjKvS';

if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  console.error('[Supabase] SDK 未加载，请检查 index.html / admin.html 是否引入了 supabase-js 的 CDN。');
}

window.SB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: false,
    storage:           window.localStorage,
    storageKey:        'luxe-auth',
  },
  global: {
    headers: { 'x-client-info': 'luxe-beauty/1.0' },
  },
});
