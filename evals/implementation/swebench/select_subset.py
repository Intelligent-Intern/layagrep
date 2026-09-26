"""Selection uses only instance_id and repo; never materializes solution/test columns."""
import hashlib,json,pathlib,datetime
import pyarrow.parquet as pq
ROOT=pathlib.Path(__file__).resolve().parents[3]
DATA=ROOT/'evals/runs/swebench/dataset/data/test-00000-of-00001.parquet'
OUT=ROOT/'evals/implementation/swebench/selection.json'
SEED='jevgrep-swebench-verified-2026-09-20-v1'
if OUT.exists():raise SystemExit('Selection already registered; refusing overwrite')
rows=pq.read_table(DATA,columns=['instance_id','repo']).to_pylist()
h=lambda v:hashlib.sha256((SEED+'\0'+v).encode()).hexdigest()
repos=sorted({r['repo'] for r in rows},key=h)
groups={repo:sorted([r for r in rows if r['repo']==repo],key=lambda r:h(r['instance_id'])) for repo in repos}
ordered=[]
for i in range(max(map(len,groups.values()))):
 for repo in repos:
  if i<len(groups[repo]):ordered.append(groups[repo][i])
selection={'registeredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dataset':{'id':'SWE-bench/SWE-bench_Verified','revision':'78f471bf655a3137b2e8a75af1501690ec009ec3','split':'test','sha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'rows':len(rows)},'harnessCommit':'02e7a74ffd0b707aab73d203fe87bdc7c76afc8e','policy':'Sort repositories by SHA256(seed NUL repo); sort IDs within each repository by SHA256(seed NUL instance_id); round-robin until10. Next item is calibration, excluded from10. No difficulty/test/patch/platform/solution filtering. Infrastructure failures retained; no replacement.','seed':SEED,'selectionFields':['instance_id','repo'],'tasks':ordered[:10],'calibration':ordered[10],'status':'registered before gold/test contents inspection; calibration admission pending'}
OUT.write_text(json.dumps(selection,indent=2)+'\n');print(json.dumps({'tasks':selection['tasks'],'calibration':selection['calibration']},indent=2))
