"""Disposable prompt-only adapter: test native skill expansion without changing isolation."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
plan_path = Path(sys.argv[sys.argv.index('--plan') + 1])
plan = json.loads(plan_path.read_text())
registered = {Path(p).resolve(): h for p, h in plan['artifacts'].items()}
assert registered.get(Path(__file__).resolve()) == hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
spec = importlib.util.spec_from_file_location('native_runner', HERE / 'native_context_runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
original_prompt = runner.task_prompt


def explicit_skill_prompt(row, cell):
    prompt = original_prompt(row, cell)
    if cell['arm'] == 'baseline':
        return prompt
    assert cell.get('invocation', 'required') == 'required'
    skill = '/home/agent/.agents/skills/jevgrep/SKILL.md' if cell['engine'] == 'codex' else '/home/agent/.claude/skills/jevgrep/SKILL.md'
    instruction = f'Use the jevgrep skill for initial repository research. Read and follow {skill}.\n\n'
    assert prompt.count(instruction) == 1
    return ('$jevgrep\n\n' if cell['engine'] == 'codex' else '/jevgrep ') + prompt.replace(instruction, '')


runner.task_prompt = explicit_skill_prompt
raise SystemExit(runner.main())
