"""No-network checks of benchmark/task-input and artifact isolation gates."""
import importlib.util
import json
import tempfile
import types
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('native_runner', HERE.parent / 'native_runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)

class GateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        p = Path(self.tmp.name)
        self.inputs = p / 'inputs.json'
        self.inputs.write_text(json.dumps([{'instance_id': 'synthetic', 'repo': 'synthetic/repo', 'base_commit': 'abc', 'image': 'official/source', 'problem_statement': 'synthetic'}]))
        self.plan = p / 'plan.json'
        self.data = {'status': 'frozen', 'artifacts': {}, 'cells': [{'id': 'cell', 'instance_id': 'synthetic', 'engine': 'codex', 'arm': 'baseline', 'image': 'sha256:synthetic', 'source_image': 'official/source', 'model': 'gpt-5.6-sol', 'effort': 'medium', 'timeout_seconds': 900}]}
        for path in [HERE.parent / 'native_runner.py', HERE / 'model_proxy.py', self.inputs]:
            self.data['artifacts'][str(path)] = runner.sha(path)
        self.args = types.SimpleNamespace(plan=self.plan, cell='cell', inputs=self.inputs, candidate=None, engine='codex')
    def load(self):
        self.plan.write_text(json.dumps(self.data))
        return runner.load_cell(self.args)
    def test_safe_frozen_cell(self):
        cell, row = self.load()
        self.assertEqual(cell['id'], 'cell')
        self.assertEqual(row['instance_id'], 'synthetic')
    def test_rejects_hidden_fields_even_with_matching_hash(self):
        rows = json.loads(self.inputs.read_text())
        rows[0]['test_patch'] = 'must not enter agent input'
        self.inputs.write_text(json.dumps(rows))
        self.data['artifacts'][str(self.inputs)] = runner.sha(self.inputs)
        with self.assertRaisesRegex(ValueError, 'safe exported'):
            self.load()
    def test_rejects_changed_artifact(self):
        self.inputs.write_text('[]')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            self.load()
    def test_rejects_unfrozen_plan(self):
        self.data['status'] = 'draft'
        with self.assertRaisesRegex(ValueError, 'not frozen'):
            self.load()
    def test_rejects_wrong_source_image(self):
        self.data['cells'][0]['source_image'] = 'different/source'
        with self.assertRaisesRegex(ValueError, 'source image differs'):
            self.load()
    def test_baseline_cannot_receive_candidate(self):
        self.args.candidate = HERE / 'model_proxy.py'
        with self.assertRaisesRegex(ValueError, 'Baseline cannot receive'):
            self.load()

if __name__ == '__main__':
    unittest.main()
