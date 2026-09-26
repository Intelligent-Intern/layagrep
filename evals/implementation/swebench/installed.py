#!/usr/bin/env python3
"""Prepare, execute and grade one frozen installed-package SWE-bench treatment."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.parse
import urllib.request
import uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RUNS = ROOT / 'evals/runs/swebench'
TOOLING = ROOT / 'evals/runs/tooling/swebench'
TASK = 'psf__requests-1142'
BASELINE_ID = 'lookahead-native-v88-psf__requests-1142-codex-baseline'
RUNTIME_IMAGE = 'sha256:2264606b0765897361bb392db8aa3226e171719ba97e82ce5205ba122a43eaff'
HARNESS_COMMIT = '02e7a74ffd0b707aab73d203fe87bdc7c76afc8e'
BASELINE = RUNS / 'lookahead-native-v88' / TASK / 'codex-baseline'
SAFE_FIELDS = {'instance_id', 'repo', 'base_commit', 'image', 'problem_statement'}
VERSIONS = {'node': 'v24.14.0', 'codex': 'codex-cli 0.153.4', 'claude': '2.1.278 (Claude Code)'}
VERIFICATION = (
    'Save test stdout/stderr to a log and preserve the test exit status. Inspect that log '
    'to understand failures; do not rerun unchanged tests merely to change an output filter. '
    'Prefer foreground test commands with an adequate tool timeout within the task deadline. '
    'In Claude, a Bash timeout may background a command rather than stop it. If backgrounded, '
    'use its completion notification and output or exit-status file; do not invent process-name '
    'polling with pgrep or add fixed sleeps. '
    'Keep your implementation applied in /testbed during long-running verification. '
    'If a pristine comparison is needed, use a separate temporary checkout and verify tests import '
    'that checkout. Report verification that could not finish.'
)


def baseline_prompt(row):
    common = ('Implement the following request in /testbed. Work only from local source and tests; '
              'do not fetch external research, packages, solutions or hidden tests. Do not use network tools. '
              'Preserve existing behavior outside the request. Run relevant available tests and wait for their results. '
              'Report what changed, completed verification, and any unresolved limitations. '
              'Do not change Git history or make commits.\n\n')
    return common + 'The entire task, including verification, has a 900-second deadline. ' + VERIFICATION + '\n\n' + row['problem_statement']


def treatment_prompt(row):
    return ('$jevgrep\n\nFor this benchmark, you must run jg for initial repository research before '
            'independently inspecting implementation files, even when the affected path seems known. '
            'Read and follow /home/agent/.agents/skills/jevgrep/SKILL.md, then invoke the installed jg '
            'command. This benchmark requirement overrides the skill\'s optional invocation guidance.\n\n'
            + baseline_prompt(row))


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')
    path.chmod(0o600)


def command(args, **kwargs):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)


def text(args):
    return command(args).stdout.decode().strip()


def load_pair(baseline, inputs, task):
    receipt = json.loads((baseline / 'receipt.json').read_text())
    cell = receipt['cell']
    if task != TASK or cell['instance_id'] != task or cell['arm'] != 'baseline' or cell['id'] != BASELINE_ID or receipt['image'] != RUNTIME_IMAGE or cell['image'] != RUNTIME_IMAGE:
        raise ValueError('This checkpoint reuses only the registered Requests baseline')
    if (cell['model'], cell['effort'], cell['timeout_seconds']) != ('openai/gpt-5.6-sol', 'medium', 900):
        raise ValueError('Baseline model/effort/deadline differs from the registered harness')
    if receipt['versions'] != VERSIONS or receipt['provider_route'] != 'vercel-ai-gateway':
        raise ValueError('Baseline runtime or provider differs from the registered harness')
    rows = json.loads(inputs.read_text())
    if not isinstance(rows, list) or any(not isinstance(row, dict) or set(row) != SAFE_FIELDS for row in rows):
        raise ValueError('Only safe exported agent-input fields are accepted')
    matches = [row for row in rows if row['instance_id'] == task]
    if len(matches) != 1 or matches[0]['image'] != cell['source_image']:
        raise ValueError('Task input must match the fixed baseline source image')
    row = matches[0]
    prompt = baseline_prompt(row).encode()
    if hashlib.sha256(prompt).hexdigest() != receipt['prompt_sha256'] or (baseline / 'prompt.txt').read_bytes() != prompt:
        raise ValueError('Baseline prompt differs; do not rerun or overwrite it')
    grade = json.loads((baseline / 'grading-receipt.json').read_text())
    if grade.get('resolved_instances') != 1:
        raise ValueError('Expected the retained officially resolved Requests baseline')
    return receipt, row


def check_image(image):
    if not re.fullmatch(r'sha256:[a-f0-9]{64}', image):
        raise ValueError('Use the immutable retained runtime image ID')
    return text(['docker', 'image', 'inspect', image, '--format', '{{.Id}}'])


def prepare(args):
    baseline, row = load_pair(args.baseline.resolve(), args.inputs.resolve(), args.task)
    image = check_image(baseline['image'])
    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=False)
    out.chmod(0o700)
    package = out / 'package.tgz'
    shutil.copyfile(args.package, package)
    package.chmod(0o600)
    name = 'jg-prepare-' + uuid.uuid4().hex[:12]
    # Preparation may fetch pinned npm dependencies. The coding agent never receives that network.
    install = '''set -eu
cd /tmp
npm install --global --prefix /opt/jg-install /tmp/package.tgz --ignore-scripts --no-audit --no-fund
/opt/jg-install/bin/jg --version > /tmp/jg-version.txt
/opt/jg-install/bin/jg skill > /tmp/jg-skill.md
node -e 'const fs=require("fs"),cp=require("child_process");const p=require("/opt/jg-install/lib/node_modules/@dzhng/jevgrep/package.json");if(fs.realpathSync("/opt/jg-install/bin/jg")!=="/opt/jg-install/lib/node_modules/@dzhng/jevgrep/dist/bin/index.js")throw Error("Unexpected executable");const git=a=>cp.execFileSync("git",["-C","/testbed",...a],{encoding:"utf8"}).trim();fs.writeFileSync("/tmp/install.json",JSON.stringify({package:p.name,version:p.version,head:git(["rev-parse","HEAD"]),tree:git(["rev-parse","HEAD^{tree}"]),status:git(["status","--porcelain"])}));'
tar -C /opt -cf /tmp/installed-prefix.tar jg-install
'''
    try:
        command(['docker', 'create', '--platform', 'linux/amd64', '--name', name, image, 'sh', '-c', install])
        command(['docker', 'cp', str(package), name + ':/tmp/package.tgz'])
        with (out / 'prepare.log').open('wb') as log:
            subprocess.run(['docker', 'start', '-a', name], stdout=log, stderr=subprocess.STDOUT, check=True)
        for remote, local in [('installed-prefix.tar', 'installed-prefix.tar'), ('install.json', 'installation.json'), ('jg-skill.md', 'skill.md'), ('jg-version.txt', 'version.txt')]:
            command(['docker', 'cp', name + ':/tmp/' + remote, str(out / local)])
            (out / local).chmod(0o600)
        installed = json.loads((out / 'installation.json').read_text())
        cell = baseline['cell']
        if installed['package'] != '@dzhng/jevgrep' or installed['status'] or installed['head'] != cell['expected_image_head'] or installed['tree'] != cell['expected_source_tree']:
            raise ValueError('Installation changed source identity or installed the wrong package')
        if (out / 'skill.md').read_bytes() != args.skill.read_bytes():
            raise ValueError('Packaged skill differs from the canonical skill')
        write_json(out / 'agent-inputs.json', [row])
        cell = {**cell, 'id': 'installed-' + TASK + '-' + uuid.uuid4().hex[:12], 'arm': 'chunks', 'candidate': str(out / 'installed-prefix.tar')}
        artifacts = [Path(__file__).resolve(), HERE / 'gateway_broker.py', package, out / 'installed-prefix.tar', out / 'skill.md', out / 'agent-inputs.json']
        plan = {'status': 'frozen', 'purpose': 'Installed production Requests checkpoint; reuse the fixed baseline once, no baseline rerun.',
                'cell': cell, 'baseline': str(args.baseline.resolve()), 'baseline_receipt_sha256': digest(args.baseline / 'receipt.json'),
                'baseline_cost_usd': 0.2685004, 'baseline_resolved': True, 'inputs': str(out / 'agent-inputs.json'),
                'skill': str(out / 'skill.md'), 'package': str(package), 'output': str(out / 'attempt'),
                'artifacts': {str(path): digest(path) for path in artifacts}}
        write_json(out / 'plan.json', plan)
        print(json.dumps({'status': 'prepared', 'plan': str(out / 'plan.json'), 'cell': cell['id'], 'image': image}))
    finally:
        subprocess.run(['docker', 'rm', '-f', name], capture_output=True)


def load_plan(path):
    plan = json.loads(path.read_text())
    if plan.get('status') != 'frozen':
        raise ValueError('Plan must be frozen before execution')
    for artifact, expected in plan['artifacts'].items():
        if digest(artifact) != expected:
            raise ValueError('Frozen artifact changed: ' + artifact)
    required = [Path(__file__).resolve(), HERE / 'gateway_broker.py', Path(plan['inputs']), Path(plan['skill']), Path(plan['package']), Path(plan['cell']['candidate'])]
    if any(str(path) not in plan['artifacts'] for path in required):
        raise ValueError('Plan omits a required artifact')
    base = Path(plan['baseline'])
    if digest(base / 'receipt.json') != plan['baseline_receipt_sha256']:
        raise ValueError('The retained baseline changed')
    baseline, row = load_pair(base, Path(plan['inputs']), plan['cell']['instance_id'])
    for key in ['instance_id', 'engine', 'invocation', 'source_image', 'source_pinned_ref', 'image', 'model', 'effort', 'timeout_seconds', 'gateway_model', 'expected_image_head', 'expected_source_tree']:
        if plan['cell'][key] != baseline['cell'][key]:
            raise ValueError('Treatment pairing changed: ' + key)
    if plan['cell']['arm'] != 'chunks' or plan['cell']['id'] == baseline['cell']['id'] or not re.fullmatch(r'[A-Za-z0-9_.-]+', plan['cell']['id']):
        raise ValueError('Treatment must use its own registered cell')
    return plan, row


def run(args):
    plan, row = load_plan(args.plan.resolve())
    cell = plan['cell']
    image = check_image(cell['image'])
    if args.dry_run:
        print(json.dumps({'status': 'validated', 'paid_calls': 0, 'baseline_reused': plan['baseline'], 'image': image, 'cell': cell['id']}))
        return
    if not os.environ.get('AI_GATEWAY_API_KEY'):
        raise ValueError('AI_GATEWAY_API_KEY is required; load it through the authorized credential workflow')
    out = Path(plan['output'])
    out.mkdir(parents=True, exist_ok=False)
    out.chmod(0o700)
    tag = 'jg-native-' + uuid.uuid4().hex[:12]
    network, proxy = tag + '-net', tag + '-proxy'
    receipt = {'engine': 'codex', 'cell': cell, 'image': image, 'plan_sha256': digest(args.plan), 'started': time.time(), 'status': 'preparing',
               'provider_route': 'vercel-ai-gateway', 'gateway_model': 'openai/gpt-5.6-sol', 'baseline': plan['baseline']}
    def dx(argv, user=None):
        return command(['docker', 'exec', *(['-u', user] if user else []), tag, *argv])
    def put(container, path, data, owner='agent:agent', mode='600'):
        command(['docker', 'exec', '-i', container, 'sh', '-c', 'umask 077; cat > "$1"; chown "$2" "$1"; chmod "$3" "$1"', 'sh', path, owner, mode], input=data)
    def capture(remote, destination):
        return subprocess.run(['docker', 'cp', remote, str(destination)], capture_output=True).returncode == 0
    try:
        command(['docker', 'network', 'create', '--internal', network])
        command(['docker', 'run', '-d', '--name', proxy, '-e', 'JEVGREP_TRACE_DIR=/run/jev-traces', image, 'python3', '-u', '-c', (HERE / 'gateway_broker.py').read_text()])
        command(['docker', 'network', 'connect', '--alias', 'model-egress', network, proxy])
        command(['docker', 'run', '-d', '--name', tag, '--network', network,
                 '-e', 'HTTP_PROXY=http://model-egress:3128', '-e', 'HTTPS_PROXY=http://model-egress:3128',
                 '-e', 'NO_PROXY=localhost,127.0.0.1,model-egress', image, 'sleep', '1800'])
        dx(['sh', '-c', 'useradd -m -u 1001 agent; mkdir -p /home/agent/.codex /home/agent/.claude /workspace; chown -R agent:agent /home/agent /workspace'])
        receipt['official_image_head'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD']).stdout.decode().strip()
        receipt['official_source_status'] = dx(['git', '-C', '/testbed', 'status', '--porcelain']).stdout.decode()
        receipt['official_image_tree'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD^{tree}']).stdout.decode().strip()
        if receipt['official_source_status'] or receipt['official_image_head'] != cell['expected_image_head'] or receipt['official_image_tree'] != cell['expected_source_tree']:
            raise ValueError('Native source differs from the retained baseline')
        dx(['sh', '-c', 'cd /testbed && tracked=$(mktemp) && git ls-files -z > "$tracked" && rm -rf .git && git init -q && git config user.email agent@localhost && git config user.name Agent && git --literal-pathspecs add -f --pathspec-from-file="$tracked" --pathspec-file-nul && rm "$tracked" && git commit -qm "Pristine official image source" && chown -R agent:agent /testbed'])
        base = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD'], 'agent').stdout.decode().strip()
        receipt['synthetic_base'] = base
        receipt['source_tree'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD^{tree}'], 'agent').stdout.decode().strip()
        if receipt['source_tree'] != cell['expected_source_tree']:
            raise ValueError('Normalized source tree changed')
        receipt['versions'] = {name: dx([name, '--version']).stdout.decode().strip() for name in VERSIONS}
        if receipt['versions'] != VERSIONS:
            raise ValueError('Agent runtime changed')
        command(['docker', 'cp', cell['candidate'], tag + ':/tmp/installed-prefix.tar'])
        dx(['tar', '-xf', '/tmp/installed-prefix.tar', '-C', '/opt'])
        skill_dir = '/home/agent/.agents/skills/jevgrep'
        dx(['mkdir', '-p', skill_dir])
        put(tag, skill_dir + '/SKILL.md', Path(plan['skill']).read_bytes())
        receipt['installed_skills'] = {skill_dir: dx(['sha256sum', skill_dir + '/SKILL.md']).stdout.decode().split()[0]}
        if receipt['installed_skills'][skill_dir] != digest(plan['skill']):
            raise ValueError('Installed skill differs from the frozen package')
        receipt['jg_version'] = dx(['/opt/jg-install/bin/jg', '--version'], 'agent').stdout.decode().strip()
        receipt['candidate_sha256'] = digest(cell['candidate'])
        receipt['package_sha256'] = digest(plan['package'])
        prompt = treatment_prompt(row)
        (out / 'prompt.txt').write_text(prompt)
        receipt['prompt_sha256'] = digest(out / 'prompt.txt')
        token = uuid.uuid4().hex
        put(proxy, '/run/gateway.json', json.dumps({'key': os.environ['AI_GATEWAY_API_KEY'], 'token': token, 'agent_engine': 'codex', 'allow_jev': True}).encode(), 'root:root')
        config = ('model = "openai/gpt-5.6-sol"\nmodel_provider = "vercel"\nmodel_reasoning_effort = "medium"\n'
                  '[model_providers.vercel]\nname = "Vercel AI Gateway"\n'
                  'base_url = "http://model-egress:3129/codex/v1"\nenv_key = "JEVGREP_MODEL_TOKEN"\nwire_api = "responses"\n')
        put(tag, '/home/agent/.codex/config.toml', config.encode())
        native = ['codex', 'exec', '--model', 'openai/gpt-5.6-sol', '-c', 'model_reasoning_effort="medium"', '-c', 'web_search="disabled"', '--json', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt]
        receipt['command'] = native
        path = '/opt/jg-install/bin:/opt/node-v24.14.0-linux-x64/bin:/opt/miniconda3/envs/testbed/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        invocation = ['docker', 'exec', '-u', 'agent', '-e', 'HOME=/home/agent', '-e', 'PATH=' + path,
                      '-e', 'CONDA_PREFIX=/opt/miniconda3/envs/testbed', '-e', 'JEVGREP_MODEL_TOKEN=' + token,
                      '-e', 'AI_GATEWAY_API_KEY=' + token, '-e', 'AI_GATEWAY_BASE_URL=http://model-egress:3129', '-w', '/testbed', tag, *native]
        receipt['status'] = 'running'
        receipt['agent_started_at'] = time.time()
        start = time.monotonic()
        with (out / 'events.jsonl').open('wb') as stdout, (out / 'stderr.txt').open('wb') as stderr:
            try:
                result = subprocess.run(invocation, stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr, timeout=900)
                receipt['exit_code'] = result.returncode
            except subprocess.TimeoutExpired:
                receipt['timed_out'] = True
                subprocess.run(['docker', 'exec', tag, 'pkill', '-KILL', '-u', '1001'], capture_output=True)
        receipt['agent_elapsed_seconds'] = time.monotonic() - start
        receipt['agent_finished_at'] = time.time()
        receipt['timing_valid'] = abs(receipt['agent_finished_at'] - receipt['agent_started_at'] - receipt['agent_elapsed_seconds']) <= 5
        events = []
        for line in (out / 'events.jsonl').read_text().splitlines():
            try: events.append(json.loads(line))
            except ValueError: pass
        receipt['native_completed'] = any(event.get('type') == 'turn.completed' for event in events)
        executions = [event['item'].get('command', '') for event in events if event.get('type') == 'item.completed' and event.get('item', {}).get('type') == 'command_execution']
        receipt['required_retrieval_observed'] = any(re.search(r'(?<![A-Za-z0-9_])jg\s+(?!doctor\b|skill\b|auth\b|cache\b|--help\b|--version\b)', execution) for execution in executions)
        receipt['usage_events'] = [event for event in events if event.get('type') == 'turn.completed']
        receipt['source_status'] = dx(['git', '-C', '/testbed', 'status', '--porcelain'], 'agent').stdout.decode()
        dx(['git', '-C', '/testbed', 'add', '-A'], 'agent')
        (out / 'agent.patch').write_bytes(dx(['git', '-C', '/testbed', 'diff', '--cached', base, '--binary'], 'agent').stdout)
        receipt['patch_sha256'] = digest(out / 'agent.patch')
        receipt['all_sessions_copied'] = capture(tag + ':/home/agent/.codex/sessions', out / 'codex-sessions')
        sessions = list((out / 'codex-sessions').rglob('*.jsonl'))
        if len(sessions) == 1:
            shutil.copyfile(sessions[0], out / 'raw-rollout.jsonl')
        receipt['status'] = 'completed' if receipt.get('exit_code') == 0 and receipt['native_completed'] and receipt['required_retrieval_observed'] else 'failed'
    except Exception as error:
        receipt['status'] = 'failed'
        # Tool output may contain environment arguments: retain error types, never raw commands or keys.
        receipt['error_type'] = type(error).__name__
    finally:
        logs = subprocess.run(['docker', 'logs', proxy], capture_output=True)
        (out / 'proxy.jsonl').write_bytes(logs.stdout)
        (out / 'proxy-stderr.txt').write_bytes(logs.stderr)
        receipt['jev_traces_copied'] = capture(proxy + ':/run/jev-traces', out / 'jev-traces')
        for container in [tag, proxy]: subprocess.run(['docker', 'rm', '-f', container], capture_output=True)
        subprocess.run(['docker', 'network', 'rm', network], capture_output=True)
        receipt['total_elapsed_seconds'] = time.time() - receipt['started']
        write_json(out / 'receipt.json', receipt)
    print(json.dumps({'status': receipt['status'], 'output': str(out), 'error_type': receipt.get('error_type')}))
    if receipt['status'] != 'completed': raise SystemExit(1)


def grade(args):
    plan, _ = load_plan(args.plan.resolve())
    out, cell = Path(plan['output']), plan['cell']
    receipt = json.loads((out / 'receipt.json').read_text())
    if receipt['plan_sha256'] != digest(args.plan) or receipt['cell'] != cell:
        raise ValueError('Attempt does not belong to this frozen plan')
    run_id = 'jg-' + cell['id']
    report = args.tooling.resolve() / 'logs/evaluation' / run_id / 'results.json'
    if report.exists() or (out / 'grading-receipt.json').exists():
        raise ValueError('Refusing to reuse an official grading run ID')
    harness = args.tooling.resolve() / 'repo'
    if text(['git', '-C', str(harness), 'rev-parse', 'HEAD']) != HARNESS_COMMIT or text(['git', '-C', str(harness), 'status', '--porcelain']):
        raise ValueError('Official harness checkout changed')
    module = text([str(args.tooling.resolve() / 'venv/bin/python'), '-B', '-c', 'import pathlib,swebench; print(pathlib.Path(swebench.__file__).resolve())'])
    if Path(module).parent.parent != harness:
        raise ValueError('Python environment does not use the pinned official harness')
    prediction = out / 'predictions.jsonl'
    prediction.write_text(json.dumps({'instance_id': cell['instance_id'], 'model_name_or_path': cell['id'], 'model_patch': (out / 'agent.patch').read_text()}) + '\n')
    start = time.monotonic()
    with (out / 'grading-console.log').open('w') as log:
        result = subprocess.run([str(args.tooling.resolve() / 'venv/bin/python'), '-m', 'swebench.harness.run_evaluation', '--dataset_name', str(args.dataset.resolve()), '--predictions_path', str(prediction), '--instance_ids', cell['instance_id'], '--max_workers', '1', '--timeout', '1800', '--run_id', run_id], cwd=args.tooling, stdout=log, stderr=subprocess.STDOUT)
    grading = {'run_id': run_id, 'exit_code': result.returncode, 'grading_seconds': time.monotonic() - start, 'report': str(report)}
    if report.exists():
        summary = json.loads(report.read_text())
        grading.update({key: summary.get(key) for key in ['resolved_instances', 'unresolved_instances', 'infra_failure_instances', 'error_instances']})
    write_json(out / 'grading-receipt.json', grading)
    print(json.dumps(grading))


def valid_cost(value):
    return type(value) in (int, float) and math.isfinite(value) and value >= 0


def account(args):
    plan, _ = load_plan(args.plan.resolve())
    out = Path(plan['output'])
    events = [json.loads(line) for line in (out / 'proxy.jsonl').read_text().splitlines()]
    starts = [event for event in events if event.get('kind') == 'codex-request-start' and event.get('operation') == 'generation']
    request_ids = {event['requestId'] for event in starts}
    ends = [event for event in events if event.get('kind') == 'codex-gateway' and event.get('requestId') in request_ids]
    observations = [event for event in events if event.get('kind') == 'codex-generation']
    identifiers = list(dict.fromkeys(event['generationId'] for event in observations))
    path = out / 'generation-lookups.json'
    cached = {row['id']: row for row in json.loads(path.read_text())} if path.exists() else {}
    lookups = []
    for identifier in identifiers:
        if identifier in cached and 'metadata' in cached[identifier]:
            lookups.append(cached[identifier]); continue
        if not os.environ.get('AI_GATEWAY_API_KEY'): raise ValueError('Gateway credential required for uncached generation accounting')
        request = urllib.request.Request('https://ai-gateway.vercel.sh/v1/generation?' + urllib.parse.urlencode({'id': identifier}), headers={'Authorization': 'Bearer ' + os.environ['AI_GATEWAY_API_KEY']})
        try:
            with urllib.request.urlopen(request, timeout=20) as response: metadata = json.load(response)['data']
            if metadata['id'] != identifier or metadata['model'] != 'openai/gpt-5.6-sol': raise ValueError('Generation identity differs')
            lookups.append({'id': identifier, 'metadata': metadata})
        except (OSError, ValueError, KeyError) as error: lookups.append({'id': identifier, 'error_type': type(error).__name__})
    write_json(path, lookups)
    complete = bool(identifiers) and len(starts) == len(ends) == len(identifiers) == len(lookups) and request_ids == {event.get('requestId') for event in ends} == {event.get('requestId') for event in observations} and all(event.get('streamTerminal') == 'response.completed' and not event.get('incompleteStream') and not event.get('transportError') and event.get('status') == 200 for event in ends) and all(valid_cost(row.get('metadata', {}).get('total_cost')) for row in lookups)
    known = sum(row.get('metadata', {}).get('total_cost', 0) for row in lookups if valid_cost(row.get('metadata', {}).get('total_cost')))
    result = {'cell': plan['cell']['id'], 'request_starts': len(starts), 'generation_ids': len(identifiers), 'all_requests_accounted': complete, 'known_gateway_cost_usd': known, 'gateway_cost_usd': known if complete else None, 'baseline_cost_usd': plan['baseline_cost_usd'], 'jev_cost_usd': 0}
    grading = out / 'grading-receipt.json'
    if grading.exists():
        result['official_resolved'] = json.loads(grading.read_text()).get('resolved_instances') == 1
        result['protocol_valid'] = json.loads((out / 'receipt.json').read_text()).get('required_retrieval_observed') is True
        result['successful_cost_win'] = complete and result['official_resolved'] and result['protocol_valid'] and known < plan['baseline_cost_usd']
    write_json(out / 'generation-accounting.json', result)
    print(json.dumps(result))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='operation', required=True)
    prep = sub.add_parser('prepare', help='Install a package in the retained image and freeze a new treatment; no model calls')
    prep.add_argument('--package', type=Path, required=True)
    prep.add_argument('--output', type=Path, required=True)
    prep.add_argument('--task', default=TASK)
    prep.add_argument('--baseline', type=Path, default=BASELINE)
    prep.add_argument('--inputs', type=Path, default=RUNS / 'auto-research-80/ten-agent-inputs.json')
    prep.add_argument('--skill', type=Path, default=ROOT / 'skills/jevgrep/SKILL.md')
    execute = sub.add_parser('run', help='Run the paid coding-agent treatment once, or validate without calls')
    execute.add_argument('--plan', type=Path, required=True)
    execute.add_argument('--dry-run', action='store_true')
    grading = sub.add_parser('grade', help='Run the official evaluator under a new run ID')
    grading.add_argument('--plan', type=Path, required=True)
    grading.add_argument('--dataset', type=Path, default=RUNS / 'auto-research-80/evaluator-only/ten-dataset.json')
    grading.add_argument('--tooling', type=Path, default=TOOLING)
    billing = sub.add_parser('account', help='Reconcile full Sol billing; never count unknown charges as zero')
    billing.add_argument('--plan', type=Path, required=True)
    args = parser.parse_args()
    {'prepare': prepare, 'run': run, 'grade': grade, 'account': account}[args.operation](args)


if __name__ == '__main__':
    try: main()
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print(json.dumps({'status': 'failed', 'error_type': type(error).__name__, 'message': str(error) if isinstance(error, ValueError) else 'Inspect the retained attempt or preparation log.'}))
        raise SystemExit(1)
