"""Export public problem statements only; never read gold/test parquet columns."""
import argparse
import hashlib
import json
from pathlib import Path
import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[3]
ap = argparse.ArgumentParser()
ap.add_argument('--calibration', action='store_true')
args = ap.parse_args()
selection = json.loads((ROOT / 'evals/implementation/swebench/selection.json').read_text())
path = ROOT / 'evals/runs/swebench/dataset/data/test-00000-of-00001.parquet'
assert hashlib.sha256(path.read_bytes()).hexdigest() == selection['dataset']['sha256']
entries = [selection['calibration']] if args.calibration else selection['tasks']
ids = {r['instance_id'] for r in entries}
columns = ['instance_id', 'repo', 'base_commit', 'image', 'problem_statement']
rows = [r for r in pq.read_table(path, columns=columns).to_pylist() if r['instance_id'] in ids]
assert len(rows) == len(ids)
name = 'calibration-agent-inputs.json' if args.calibration else 'agent-inputs.json'
out = ROOT / 'evals/runs/swebench/dataset' / name
if out.exists():
    raise SystemExit('Refusing to overwrite existing safe export')
out.write_text(json.dumps(rows, indent=2) + '\n')
print(json.dumps({'output': str(out), 'instances': len(rows), 'fields': columns, 'sha256': hashlib.sha256(out.read_bytes()).hexdigest()}))
