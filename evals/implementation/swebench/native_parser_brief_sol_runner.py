#!/usr/bin/env python3
"""Disposable SWE-bench native-agent spike; task mode requires a frozen plan cell."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shlex
import subprocess
import time
import uuid

HERE = Path(__file__).resolve().parent
SAFE_FIELDS = {'instance_id', 'repo', 'base_commit', 'image', 'problem_statement'}
SMOKE_IMAGE = 'sha256:afa6f7b6e5f59e50a4d9908713e9b8ab1f3950552f976f0a4e6ad609efe805d8'
SMOKE_PROMPT = 'Reply exactly READY. Do not use any tools. This is a connectivity smoke, not a coding task.'


def run(args, **kwargs):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load_parser_runtime():
    import importlib.util
    spec = importlib.util.spec_from_file_location('jev_parser_runtime', HERE / 'native_parser_runtime.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_cell(args):
    if not args.plan:
        if args.inputs or args.cell or args.candidate:
            raise ValueError('Task inputs require --plan and --cell')
        return None, None
    if not args.cell or not args.inputs:
        raise ValueError('Task mode requires --cell and --inputs')
    plan = json.loads(args.plan.read_text())
    if plan.get('status') != 'frozen':
        raise ValueError('Plan is not frozen')
    artifacts = {Path(p).resolve(): h for p, h in plan['artifacts'].items()}
    required = [Path(__file__).resolve(), args.inputs.resolve(), HERE / 'agent-runtime/gateway_responses_proxy.py']
    required.append(HERE / 'native_parser_runtime.py')
    for path in required:
        if path not in artifacts:
            raise ValueError(f'Unregistered task artifact: {path}')
    for path, expected in artifacts.items():
        if sha(path) != expected:
            raise ValueError(f'Artifact hash mismatch: {path}')
    cells = [c for c in plan['cells'] if c['id'] == args.cell]
    if len(cells) != 1:
        raise ValueError('Cell must be uniquely registered')
    cell = cells[0]
    if cell.get('invocation', 'required') not in ['required', 'available']:
        raise ValueError('Unknown skill invocation policy')
    if cell['engine'] != args.engine or cell['arm'] not in ['baseline', 'files', 'chunks']:
        raise ValueError('Engine/arm mismatch')
    expected = ('openai/gpt-5.6-sol', 'medium')
    if (cell['model'], cell['effort']) != expected:
        raise ValueError('Unregistered model/effort')
    if not cell['image'].startswith('sha256:'):
        raise ValueError('Use the pinned derived runtime image ID')
    for field in ['expected_image_head', 'expected_source_tree']:
        if not isinstance(cell.get(field), str) or len(cell[field]) != 40:
            raise ValueError('Explicit admitted source identity required: ' + field)
    if cell['timeout_seconds'] != 900:
        raise ValueError('Expected registered 900-second task deadline')
    if cell['arm'] != 'baseline':
        if (HERE / 'skill-variants/brief/jevgrep/SKILL.md').resolve() not in artifacts:
            raise ValueError('Treatment requires the registered Jevgrep skill')
        if (not args.candidate or args.candidate.resolve() not in artifacts
                or args.candidate.resolve() != Path(cell.get('candidate', '')).resolve()):
            raise ValueError('Treatment requires a registered candidate bundle')
        if not os.environ.get('AI_GATEWAY_API_KEY'):
            raise ValueError('Treatment requires host gateway credential')
    elif args.candidate:
        raise ValueError('Baseline cannot receive the Jev bundle')
    inputs = json.loads(args.inputs.read_text())
    if not isinstance(inputs, list) or any(not isinstance(row, dict) or set(row) != SAFE_FIELDS for row in inputs):
        raise ValueError('Only safe exported agent-input JSON is accepted')
    rows = [row for row in inputs if row['instance_id'] == cell['instance_id']]
    if len(rows) != 1:
        raise ValueError('Task must occur exactly once in safe inputs')
    if cell.get('source_image') != rows[0]['image']:
        raise ValueError('Plan source image differs from exported task image')
    return cell, rows[0]


def verify_source(cell, receipt):
    if receipt['official_source_status']:
        raise ValueError('Registered source must be pristine')
    if receipt['official_image_head'] != cell['expected_image_head']:
        raise ValueError('Source commit differs from admitted compatibility commit')
    if receipt['official_image_tree'] != cell['expected_source_tree']:
        raise ValueError('Source tree differs from admitted baseline')


def task_prompt(row, cell):
    common = ('Implement the following request in /testbed. Work only from local source and tests; '
              'do not fetch external research, packages, solutions or hidden tests. Do not use network tools. '
              'Preserve existing behavior outside the request. Run relevant available tests and wait for their results. '
              'Report what changed, completed verification, and any unresolved limitations. '
              'Do not change Git history or make commits.\n\n')
    if cell['arm'] != 'baseline' and cell.get('invocation', 'required') == 'required':
        skill_path = '/home/agent/.agents/skills/jevgrep/SKILL.md'
        common += f'Use the jevgrep skill for initial repository research. Read and follow {skill_path}.\n\n'
    return common + row['problem_statement']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', choices=['codex'], required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--plan', type=Path)
    ap.add_argument('--cell')
    ap.add_argument('--inputs', type=Path)
    ap.add_argument('--candidate', type=Path)
    args = ap.parse_args()
    if not os.environ.get('AI_GATEWAY_API_KEY'):raise ValueError('Gateway credential required for Sol')
    cell, row = load_cell(args)
    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=False)
    tag = 'jevgrep-native-' + uuid.uuid4().hex[:10]
    network, proxy = tag + '-net', tag + '-proxy'
    image = cell['image'] if cell else SMOKE_IMAGE
    receipt = {'engine': args.engine, 'purpose': 'registered task' if cell else 'synthetic readiness only',
               'image': run(['docker', 'image', 'inspect', image, '--format', '{{.Id}}']).stdout.decode().strip(),
               'network': 'internal agent network; all CONNECT denied; authenticated Sol/JeV broker',
               'started': time.time(), 'status': 'preparing'}
    if cell:
        receipt.update(cell=cell, plan_sha256=sha(args.plan), inputs_sha256=sha(args.inputs))
    def dx(command, **kwargs):
        return run(['docker', 'exec', *kwargs.pop('flags', []), tag, *command], **kwargs)
    def put(container, path, data, owner='agent:agent', mode='600'):
        run(['docker', 'exec', '-i', container, 'sh', '-c',
             'umask 077; cat > "$1"; chown "$2" "$1"; chmod "$3" "$1"', 'sh', path, owner, mode], input=data)
    def save_copy(source, target):
        result = subprocess.run(['docker', 'cp', source, str(target)], capture_output=True)
        return result.returncode == 0
    try:
        run(['docker', 'network', 'create', '--internal', network])
        run(['docker', 'run', '-d', '--name', proxy, image, 'python3', '-u', '-c',
             (HERE / 'agent-runtime/gateway_responses_proxy.py').read_text()])
        run(['docker', 'network', 'connect', '--alias', 'model-egress', network, proxy])
        run(['docker', 'run', '-d', '--name', tag, '--network', network,
             '--env', 'HTTP_PROXY=http://model-egress:3128', '--env', 'HTTPS_PROXY=http://model-egress:3128',
             '--env', 'NO_PROXY=localhost,127.0.0.1,model-egress', image, 'sleep', '1800'])
        dx(['sh', '-c', 'useradd -m -u 1001 agent; mkdir -p /home/agent/.codex /home/agent/.claude /workspace /tmp/jevgrep; chown -R agent:agent /home/agent /workspace /tmp/jevgrep'])
        receipt['official_image_head'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD']).stdout.decode().strip()
        receipt['official_source_status'] = dx(['git', '-C', '/testbed', 'status', '--porcelain']).stdout.decode()
        receipt['official_image_tree'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD^{tree}']).stdout.decode().strip()
        if cell:verify_source(cell, receipt)
        dx(['sh', '-c', 'cd /testbed && tracked=$(mktemp) && git ls-files -z > "$tracked" && rm -rf .git && git init -q && git config user.email agent@localhost && git config user.name Agent && git --literal-pathspecs add -f --pathspec-from-file="$tracked" --pathspec-file-nul && rm "$tracked" && git commit -qm "Pristine official image source" && chown -R agent:agent /testbed'])
        base = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD'], flags=['-u', 'agent']).stdout.decode().strip()
        receipt['synthetic_base'] = base
        receipt['source_tree'] = dx(['git', '-C', '/testbed', 'rev-parse', 'HEAD^{tree}'], flags=['-u', 'agent']).stdout.decode().strip()
        if cell and receipt['source_tree'] != cell['expected_source_tree']:
            raise ValueError('Synthetic checkout differs from admitted source tree')
        receipt['versions'] = {k: dx([k, '--version']).stdout.decode().strip() for k in ['node', 'codex', 'claude']}
        assert receipt['versions']['codex'] == 'codex-cli 0.153.4'
        assert receipt['versions']['claude'].startswith('2.1.278 ')
        prompt = task_prompt(row, cell) if cell else SMOKE_PROMPT
        (out / 'prompt.txt').write_text(prompt)
        receipt['prompt_sha256'] = sha(out / 'prompt.txt')
        token = uuid.uuid4().hex
        put(proxy, '/run/gateway.json', json.dumps({'key': os.environ['AI_GATEWAY_API_KEY'], 'token': token, 'agent_engine': 'codex', 'allow_jev': bool(cell and cell['arm'] != 'baseline')}).encode(), 'root:root')
        receipt['provider_route'] = 'vercel-ai-gateway'
        receipt['gateway_model'] = 'openai/gpt-5.6-sol'
        if cell and cell['arm'] != 'baseline':
            for skill_dir in ['/home/agent/.agents/skills/jevgrep', '/home/agent/.claude/skills/jevgrep']:
                dx(['mkdir', '-p', skill_dir])
                put(tag, skill_dir + '/SKILL.md', (HERE / 'skill-variants/brief/jevgrep/SKILL.md').read_bytes())
            parser_runtime = load_parser_runtime()
            receipt['jev_parser'] = parser_runtime.install_parser(dx, put, tag)
            dx(['mkdir', '-p', '/opt/jev/bin'])
            put(tag, '/opt/jev/hierarchy.mjs', args.candidate.read_bytes(), 'root:root', '644')
            wrapper = parser_runtime.build_wrapper(token, cell['arm'])
            put(tag, '/opt/jev/bin/jevgrep', wrapper, 'root:root', '755')
            receipt['candidate_sha256'] = sha(args.candidate)
        config = ('model = "openai/gpt-5.6-sol"\nmodel_provider = "vercel"\nmodel_reasoning_effort = "medium"\n'
                  '[model_providers.vercel]\nname = "Vercel AI Gateway"\n'
                  'base_url = "http://model-egress:3129/codex/v1"\nenv_key = "JEVGREP_MODEL_TOKEN"\nwire_api = "responses"\n')
        put(tag, '/home/agent/.codex/config.toml', config.encode())
        command = ['codex', 'exec', '--model', 'openai/gpt-5.6-sol', '-c', 'model_reasoning_effort="medium"',
                   '-c', 'web_search="disabled"', '--json',
                   '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt]
        receipt['command'] = command
        receipt['status'] = 'running'
        path = '/opt/jev/bin:/opt/node-v24.14.0-linux-x64/bin:/opt/miniconda3/envs/testbed/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        invocation = ['docker', 'exec', '-u', 'agent', '-e', 'HOME=/home/agent', '-e', 'PATH=' + path,
                      '-e', 'CONDA_PREFIX=/opt/miniconda3/envs/testbed', '-e', 'JEVGREP_MODEL_TOKEN=' + token, '-w', '/testbed' if cell else '/workspace', tag, *command]
        receipt['agent_started_at'] = time.time()
        started = time.monotonic()
        with (out / 'events.jsonl').open('wb') as stdout, (out / 'stderr.txt').open('wb') as stderr:
            try:
                proc = subprocess.run(invocation, stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr, timeout=cell['timeout_seconds'] if cell else 240)
                receipt['exit_code'] = proc.returncode
            except subprocess.TimeoutExpired:
                receipt['timed_out'] = True
                # Stop native process without destroying its filesystem before capture.
                subprocess.run(['docker', 'exec', tag, 'pkill', '-KILL', '-u', '1001'], capture_output=True)
        receipt['agent_elapsed_seconds'] = time.monotonic() - started
        receipt['agent_finished_at'] = time.time()
        receipt['agent_wall_elapsed_seconds'] = receipt['agent_finished_at'] - receipt['agent_started_at']
        receipt['agent_clock_gap_seconds'] = receipt['agent_wall_elapsed_seconds'] - receipt['agent_elapsed_seconds']
        receipt['timing_valid'] = abs(receipt['agent_clock_gap_seconds']) <= 5
        events = []
        for line in (out / 'events.jsonl').read_text().splitlines():
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass
        receipt['usage_events'] = [e for e in events if e.get('type') in ['turn.completed', 'result']]
        receipt['native_completed'] = any(e.get('type') == 'turn.completed' or (e.get('type') == 'result' and not e.get('is_error') and e.get('subtype') == 'success') for e in events)
        receipt['ready_observed'] = any('READY' in json.dumps(e) for e in events)
        receipt['source_status'] = dx(['git', '-C', '/testbed', 'status', '--porcelain'], flags=['-u', 'agent']).stdout.decode()
        dx(['git', '-C', '/testbed', 'add', '-A'], flags=['-u', 'agent'])
        (out / 'agent.patch').write_bytes(dx(['git', '-C', '/testbed', 'diff', '--cached', base, '--binary'], flags=['-u', 'agent']).stdout)
        receipt['patch_sha256'] = sha(out / 'agent.patch')
        if args.engine == 'codex':
            receipt['all_sessions_copied'] = save_copy(tag + ':/home/agent/.codex/sessions', out / 'codex-sessions')
            threads = [e['thread_id'] for e in events if e.get('type') == 'thread.started']
            if len(threads) == 1:
                matches = dx(['find', '/home/agent/.codex/sessions', '-type', 'f', '-name', '*' + threads[0] + '.jsonl']).stdout.decode().splitlines()
                if len(matches) == 1:
                    receipt['raw_session_copied'] = save_copy(tag + ':' + matches[0], out / 'raw-rollout.jsonl')
                    if receipt['raw_session_copied']:
                        tokens = []
                        for line in (out / 'raw-rollout.jsonl').read_text().splitlines():
                            try:
                                event = json.loads(line)
                                payload = event.get('payload', {})
                                if event.get('type') == 'event_msg' and payload.get('type') == 'token_count':
                                    tokens.append({'timestamp': event.get('timestamp'), 'info': payload.get('info')})
                            except json.JSONDecodeError:
                                pass
                        (out / 'token-count-events.json').write_text(json.dumps(tokens, indent=2) + '\n')
                        receipt['token_count_events'] = len(tokens)
        if cell and cell['arm'] != 'baseline':
            receipt['jev_artifacts_copied'] = save_copy(tag + ':/tmp/jevgrep', out / 'jevgrep')
        receipt['status'] = 'completed' if receipt.get('exit_code') == 0 and receipt['native_completed'] else 'failed'
    except Exception as error:
        receipt['status'] = 'failed'
        receipt['error'] = str(error)
        if isinstance(error, subprocess.CalledProcessError):
            receipt['error_stderr'] = error.stderr.decode(errors='replace')[-4000:]
    finally:
        log = subprocess.run(['docker', 'logs', proxy], capture_output=True)
        (out / 'proxy.jsonl').write_bytes(log.stdout)
        (out / 'proxy-stderr.txt').write_bytes(log.stderr)
        for name in [tag, proxy]:
            subprocess.run(['docker', 'rm', '-f', name], capture_output=True)
        subprocess.run(['docker', 'network', 'rm', network], capture_output=True)
        receipt['total_elapsed_seconds'] = time.time() - receipt['started']
        (out / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'engine': args.engine, 'output': str(out), 'status': receipt['status'], 'error': receipt.get('error')}))
    return 0 if receipt['status'] == 'completed' and (cell or receipt.get('ready_observed')) else 1


if __name__ == '__main__':
    raise SystemExit(main())
