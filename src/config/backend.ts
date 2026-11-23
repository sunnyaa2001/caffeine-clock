// 서버(Supabase) 연결 정보. 비워 두면 기기에만 저장하는 로컬 모드로 동작한다.
// anon key는 브라우저에 공개되는 용도의 키다. service_role key는 절대 넣지 않는다.
export const BACKEND = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};
export const isRemoteMode = () => Boolean(BACKEND.supabaseUrl && BACKEND.supabaseAnonKey);
