import { createContext, useContext, useEffect, useState } from 'react';
import { cvGetActiveTeam, cvSetActiveTeam } from '../lib/cv';
const Ctx = createContext<{teamId:string|null; refresh:()=>Promise<void>; set:(id:string)=>Promise<void>}>({teamId:null,refresh:async()=>{},set:async()=>{}});
export function ActiveTeamProvider({children}:{children:React.ReactNode}){ const [teamId,setTeamId]=useState<string|null>(null); 
  async function refresh(){ setTeamId(await cvGetActiveTeam()); } 
  async function set(id:string){ await cvSetActiveTeam(id); await refresh(); }
  useEffect(()=>{ refresh(); },[]);
  return <Ctx.Provider value={{teamId,refresh,set}}>{children}</Ctx.Provider>;
}
export const useActiveTeam=()=>useContext(Ctx);
