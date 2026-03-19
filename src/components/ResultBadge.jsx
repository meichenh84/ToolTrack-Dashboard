export default function ResultBadge({result}){
  if(!result)return<span style={{color:"var(--text-muted)",fontSize:10}}>—</span>;
  const m={pass:"badge-pass",fail:"badge-fail",warning:"badge-warn",stopped:"badge-warn","n/a":"badge-run",pending:"badge-run",incomplete:"badge-warn"};
  const l={pass:"PASS",fail:"FAIL",warning:"WARN",stopped:"STOPPED","n/a":"N/A",pending:"PEND",incomplete:"INCMP"};
  return<span className={`badge ${m[result]||"badge-run"}`}>{l[result]||result}</span>;
}
