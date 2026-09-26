"""Run serial official calibration controls; never print patch/test contents."""
import json,pathlib,subprocess,hashlib,time
import pyarrow.parquet as pq
ROOT=pathlib.Path(__file__).resolve().parents[3]; TOOL=ROOT/'evals/runs/tooling/swebench'; DATA=ROOT/'evals/runs/swebench/dataset';SEL=json.loads((ROOT/'evals/implementation/swebench/selection.json').read_text())
instance=SEL['calibration']['instance_id']; rows=pq.read_table(DATA/'data/test-00000-of-00001.parquet').to_pylist();row=next(x for x in rows if x['instance_id']==instance)
# Gold and evaluation fields are evaluator-only. Never provide this file to agents.
cal=DATA/'calibration-evaluator-only.json';cal.write_text(json.dumps([row])+'\n');cal.chmod(0o600)
noop='diff --git a/.swebench-noop-control b/.swebench-noop-control\nnew file mode 100644\nindex 0000000..e69de29\n--- /dev/null\n+++ b/.swebench-noop-control\n@@ -0,0 +1 @@\n+Behavior-neutral calibration control.\n'
receipts=[]
for label,patch in [('noop',noop),('gold',row['patch'])]:
 pred=DATA/('calibration-'+label+'-predictions.jsonl');pred.write_text(json.dumps({'instance_id':instance,'model_name_or_path':'calibration-'+label,'model_patch':patch})+'\n');pred.chmod(0o600)
 rid='jevgrep-calibration-'+label+'-20260920-v1';cmd=[str(TOOL/'venv/bin/python'),'-m','swebench.harness.run_evaluation','--dataset_name',str(cal),'--predictions_path',str(pred),'--instance_ids',instance,'--max_workers','1','--timeout','240','--run_id',rid]
 if (TOOL/'logs/evaluation'/rid/'results.json').exists(): raise SystemExit('Refusing cached run ID; preserve existing controls')
 start=time.time();log=TOOL/(label+'-control-console.log')
 try:
  with log.open('w') as f:r=subprocess.run(cmd,cwd=TOOL,stdout=f,stderr=subprocess.STDOUT,timeout=360)
  result={'exitCode':r.returncode}
 except subprocess.TimeoutExpired:result={'timeout':True}
 receipts.append({'control':label,'runId':rid,'elapsedSeconds':time.time()-start,'command':cmd,'consoleLog':str(log),'predictionSha256':hashlib.sha256(pred.read_bytes()).hexdigest(),**result})
 (TOOL/'controls-receipt.json').write_text(json.dumps({'instance':instance,'noopPolicy':'Harmless new non-code dotfile because official main skips empty patches; executes same test evaluator without implementation changes.','runs':receipts},indent=2)+'\n')
 print(json.dumps({'control':label,**result}),flush=True)
