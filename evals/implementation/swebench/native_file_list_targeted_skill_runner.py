"""Separate study adapter: identical verification guidance for both arms; native skill invocation."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
VERIFICATION_GUIDANCE = (
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


def make_prompt(original, row, cell):
    prompt = original(row, cell)
    if not prompt.endswith(row['problem_statement']):
        raise ValueError('Expected unmodified issue as prompt suffix')
    # Operate only on harness instructions; never replace matching text in the public issue.
    prefix = prompt[:-len(row['problem_statement'])] if row['problem_statement'] else prompt
    if cell['arm'] != 'baseline':
        if cell.get('invocation', 'required') != 'required':
            raise ValueError('This study requires initial skill invocation')
        skill = '/home/agent/.agents/skills/jevgrep/SKILL.md' if cell['engine'] == 'codex' else '/home/agent/.claude/skills/jevgrep/SKILL.md'
        instruction = f'Use the jevgrep skill for initial repository research. Read and follow {skill}.\n\n'
        if prefix.count(instruction) != 1:
            raise ValueError('Expected one harness skill instruction')
        prefix = prefix.replace(instruction, '')
    guidance = f"The entire task, including verification, has a {cell['timeout_seconds']}-second deadline. " + VERIFICATION_GUIDANCE
    result = prefix + guidance + '\n\n' + row['problem_statement']
    if cell['arm'] != 'baseline':
        result = ('$jevgrep\n\n' if cell['engine'] == 'codex' else '/jevgrep ') + result
    return result


def main():
    plan_path = Path(sys.argv[sys.argv.index('--plan') + 1])
    plan = json.loads(plan_path.read_text())
    registered = {Path(p).resolve(): h for p, h in plan['artifacts'].items()}
    if registered.get(Path(__file__).resolve()) != hashlib.sha256(Path(__file__).read_bytes()).hexdigest():
        raise ValueError('Unregistered verification adapter')
    engine = sys.argv[sys.argv.index('--engine') + 1]
    if engine not in ['codex', 'claude']:
        raise ValueError('Unsupported engine')
    path = HERE / ('native_file_list_targeted_sol_runner.py' if engine == 'codex' else 'native_parser_grounded_claude_runner.py')
    spec = importlib.util.spec_from_file_location('native_runner', path)
    runner = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(runner)
    original = runner.task_prompt
    runner.task_prompt = lambda row, cell: make_prompt(original, row, cell)
    return runner.main()


if __name__ == '__main__':
    raise SystemExit(main())
