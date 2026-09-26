"""Prompt boundary: same verification rules, unchanged public issue, isolated skill instruction."""
from pathlib import Path
import importlib.util
HERE=Path(__file__).resolve().parent

def load(name):
 spec=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module

adapter=load('native_verification_skill_runner')
issue='Preserve this reproduction verbatim.\n\n```python\nvalue = "Use the jevgrep skill"\n```\n'
for engine,source in [('codex','native_sol_gateway_runner'),('claude','native_stream_delivery_runner')]:
 original=load(source).task_prompt;row={'problem_statement':issue};prefixes=[]
 for arm in ['baseline','chunks']:
  cell={'engine':engine,'arm':arm,'invocation':'required','timeout_seconds':900}
  prompt=adapter.make_prompt(original,row,cell)
  assert prompt.endswith(issue) and prompt.count(issue)==1,'Issue changed or duplicated'
  prefix=prompt[:-len(issue)]
  if arm=='chunks':
   invocation='$jevgrep\n\n' if engine=='codex' else '/jevgrep '
   assert prefix.startswith(invocation);prefix=prefix[len(invocation):]
  else:assert 'jevgrep' not in prefix,'Baseline received retrieval instructions'
  prefixes.append(prefix)
 assert prefixes[0]==prefixes[1],'Verification/task rules differ between arms'
 assert prefixes[0].count(adapter.VERIFICATION_GUIDANCE)==1
print('PASS: real runner prompts preserve the issue and share identical rules; only treatment invokes the skill')
