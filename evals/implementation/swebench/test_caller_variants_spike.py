import json
from pathlib import Path
import subprocess
import sys
import unittest

PARSER = Path(__file__).with_name('caller-variants-spike.py')

class CallerVariantsTest(unittest.TestCase):
    def parse(self, source, *flags):
        result = subprocess.run([sys.executable, '-I', str(PARSER), *flags], input=source, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_shared_operation_exposes_distinct_literal_arguments(self):
        groups = self.parse('def load(path):\n    return dispatch("read", path)\ndef save(path):\n    return dispatch("write", path)\n')
        self.assertEqual(groups, [{'scope': '<module>', 'callee': 'dispatch', 'argument': 'positional:0', 'callers': [
            {'owner': 'load', 'line': 2, 'value': 'read'},
            {'owner': 'save', 'line': 4, 'value': 'write'},
        ]}])

    def test_unrelated_scopes_and_identical_values_are_not_variants(self):
        source = 'class Reader:\n    def run(self):\n        return self.dispatch("read")\nclass Writer:\n    def run(self):\n        return self.dispatch("write")\ndef first():\n    return dispatch("same")\ndef second():\n    return dispatch("same")\n'
        self.assertEqual(self.parse(source), [])

    def test_local_only_keeps_declared_target_and_omits_external_calls(self):
        source = 'def dispatch(action):\n    pass\ndef load():\n    dispatch("read")\n    external("one")\ndef save():\n    dispatch("write")\n    external("two")\n'
        groups = self.parse(source, '--local-only')
        self.assertEqual([(g['callee'], [(c['owner'], c['value']) for c in g['callers']]) for g in groups], [('dispatch', [('load', 'read'), ('save', 'write')])])

    def test_invalid_source_falls_back_without_execution(self):
        self.assertEqual(self.parse('def incomplete('), [])

if __name__ == '__main__':
    unittest.main()
