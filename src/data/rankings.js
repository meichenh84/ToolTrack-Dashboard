export const SITES = ["TPE","XM","FQ"];
export const ONE_MONTH_AGO = Date.now() - 30 * 24 * 3600000;

export function rank(arr, key, filterFn = () => true) {
  const m = {};
  arr.filter(filterFn).forEach(l => { m[typeof key==="function"?key(l):l[key]] = (m[typeof key==="function"?key(l):l[key]]||0)+1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

export function rankToolUsage(logs, tools) {
  const m = {};
  const idToName = {};
  tools.forEach(t => { m[t.id] = 0; idToName[t.id] = t.name; });
  const toolIds = new Set(tools.map(t=>t.id));
  logs.filter(l=>toolIds.has(l.toolId)).forEach(l => { m[l.toolId] = (m[l.toolId]||0) + 1; });
  return Object.entries(m).map(([id,c])=>({name:idToName[id],count:c})).sort((a,b)=>b.count-a.count);
}

export function rankToolBySite(site, tools, logs) {
  const m = {};
  const idToName = {};
  tools.forEach(t => { m[t.id] = 0; idToName[t.id] = t.name; });
  const toolIds = new Set(tools.map(t=>t.id));
  logs.filter(l=>l.test_site===site&&toolIds.has(l.toolId)).forEach(l => { m[l.toolId] = (m[l.toolId]||0) + 1; });
  return Object.entries(m).map(([id,c])=>({name:idToName[id],count:c})).sort((a,b)=>b.count-a.count);
}

export function computeRankings(tools, allLogs) {
  const toolIds = new Set(tools.map(t=>t.id));
  const activeLogs = allLogs.filter(l=>toolIds.has(l.toolId));
  const recentActive = activeLogs.filter(l=>l.time>=ONE_MONTH_AGO);
  return {
    recentToolUsage:  rankToolUsage(recentActive, tools),
    recentSiteUsage:  rank(recentActive, "test_site"),
    recentToolBySite: Object.fromEntries(SITES.map(s=>[s, rankToolBySite(s, tools, recentActive)])),
    totalToolBySite:  Object.fromEntries(SITES.map(s=>[s, rankToolBySite(s, tools, activeLogs)])),
    toolFails:        tools.filter(t=>t.hasReport).map(t=>({
                        name:t.name,
                        count:activeLogs.filter(l=>l.toolId===t.id&&l.result==="fail").length,
                      })).sort((a,b)=>b.count-a.count),
    testerUploads:    rank(activeLogs, "tester"),
  };
}
