"""Focused tests run inside Docker; every writable artifact stays in temporary storage."""
import argparse
import contextlib
import hashlib
import http.client
import http.server
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent

def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

runner = load('installed')
broker = load('gateway_broker')

class InstalledTests(unittest.TestCase):
    def test_frozen_prompt_and_required_product_call(self):
        row = {'problem_statement': 'Fix behavior.'}
        self.assertEqual(hashlib.sha256(runner.baseline_prompt(row).encode()).hexdigest(), '41c7e3cf7acbc19d0b24ab55e6ea29fe3cdbc2b777549d158488c6c55baaa643')
        prompt = runner.treatment_prompt(row)
        self.assertTrue(prompt.startswith('$jevgrep\n\n'))
        self.assertIn('must run jg for initial repository research', prompt)
        self.assertTrue(prompt.endswith(runner.baseline_prompt(row)))

    def fixture(self, root):
        baseline = root / 'baseline'; baseline.mkdir()
        row = {'instance_id':runner.TASK,'repo':'psf/requests','base_commit':'public-base','image':'official-image','problem_statement':'Fix behavior.'}
        inputs = root / 'agent-inputs.json'; runner.write_json(inputs,[row])
        cell = {'id':runner.BASELINE_ID,'instance_id':runner.TASK,'engine':'codex','arm':'baseline','invocation':'required','source_image':'official-image','source_pinned_ref':'official@sha256:retained','image':runner.RUNTIME_IMAGE,'model':'openai/gpt-5.6-sol','effort':'medium','timeout_seconds':900,'gateway_model':'openai/gpt-5.6-sol','expected_image_head':'a'*40,'expected_source_tree':'b'*40}
        (baseline/'prompt.txt').write_text(runner.baseline_prompt(row))
        runner.write_json(baseline/'receipt.json',{'image':runner.RUNTIME_IMAGE,'cell':cell,'versions':runner.VERSIONS,'provider_route':'vercel-ai-gateway','prompt_sha256':runner.digest(baseline/'prompt.txt')})
        runner.write_json(baseline/'grading-receipt.json',{'resolved_instances':1})
        skill = root/'skill.md'; skill.write_text('installed skill')
        package = root/'package.tgz'; package.write_bytes(b'package')
        prefix = root/'installed-prefix.tar'; prefix.write_bytes(b'installed prefix')
        paths = [Path(runner.__file__),HERE/'gateway_broker.py',inputs,skill,package,prefix]
        plan = {'status':'frozen','baseline':str(baseline),'baseline_receipt_sha256':runner.digest(baseline/'receipt.json'),'baseline_cost_usd':0.2685004,'cell':{**cell,'id':'installed-new','arm':'chunks','candidate':str(prefix)},'inputs':str(inputs),'skill':str(skill),'package':str(package),'output':str(root/'attempt'),'artifacts':{str(p):runner.digest(p) for p in paths}}
        plan_path=root/'plan.json'; runner.write_json(plan_path,plan)
        return plan_path,plan

    def test_dry_run_validates_pair_without_credentials_or_agent(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary))
            with patch.object(runner,'check_image',return_value=runner.RUNTIME_IMAGE),patch.object(runner,'command',side_effect=AssertionError('No agent or paid command allowed')),patch.dict(os.environ,{},clear=True),contextlib.redirect_stdout(io.StringIO()) as stdout:
                runner.run(argparse.Namespace(plan=path,dry_run=True))
            self.assertEqual(json.loads(stdout.getvalue())['paid_calls'],0)
            self.assertFalse(Path(plan['output']).exists())
            Path(plan['cell']['candidate']).write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError,'Frozen artifact changed'):runner.load_plan(path)

    def test_changed_model_is_not_paired_to_the_old_baseline(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary))
            plan['cell']['model']='another-model';runner.write_json(path,plan)
            with self.assertRaisesRegex(ValueError,'pairing changed'):runner.load_plan(path)

    def test_grading_rejects_a_changed_official_harness_before_execution(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);path,plan=self.fixture(root);out=Path(plan['output']);out.mkdir()
            runner.write_json(out/'receipt.json',{'plan_sha256':runner.digest(path),'cell':plan['cell']})
            with patch.object(runner,'text',return_value='changed-harness'),patch.object(runner.subprocess,'run',side_effect=AssertionError('No grader launched')):
                with self.assertRaisesRegex(ValueError,'harness checkout changed'):
                    runner.grade(argparse.Namespace(plan=path,tooling=root/'tooling',dataset=root/'dataset.json'))

    def test_incomplete_billing_never_counts_missing_charges_as_free(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary));out=Path(plan['output']);out.mkdir()
            events=[{'kind':'codex-request-start','operation':'generation','requestId':'one'},{'kind':'codex-generation','requestId':'one','generationId':'gen_one'},{'kind':'codex-gateway','requestId':'one','status':200,'streamTerminal':'response.completed'}, {'kind':'codex-request-start','operation':'generation','requestId':'missing'}]
            (out/'proxy.jsonl').write_text('\n'.join(json.dumps(e) for e in events))
            runner.write_json(out/'generation-lookups.json',[{'id':'gen_one','metadata':{'total_cost':0.1}}])
            runner.write_json(out/'grading-receipt.json',{'resolved_instances':1});runner.write_json(out/'receipt.json',{'required_retrieval_observed':True})
            with patch.object(runner.urllib.request,'urlopen',side_effect=AssertionError('No network')),contextlib.redirect_stdout(io.StringIO()):runner.account(argparse.Namespace(plan=path))
            result=json.loads((out/'generation-accounting.json').read_text())
            self.assertEqual(result['known_gateway_cost_usd'],0.1)
            self.assertIsNone(result['gateway_cost_usd']);self.assertFalse(result['successful_cost_win'])

    def test_broker_captures_exact_jev_bodies_without_auth_headers(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);config=root/'gateway.json';config.write_text(json.dumps({'key':'REAL_KEY_SENTINEL','token':'BROKER_TOKEN_SENTINEL','allow_jev':True,'agent_engine':'codex'}))
            request_body=b'{"state":{"source":"public fixture"},"questions":{}}';response_body=b'{"answers":{}}'
            class Response(io.BytesIO):
                status=200;headers={'Content-Type':'application/json'}
                def read1(self,size):return self.read(size)
            with patch.object(broker,'CONFIG_PATH',str(config)),patch.object(broker,'TRACE_DIR',str(root/'traces')),patch.object(broker.urllib.request,'urlopen',return_value=Response(response_body)),contextlib.redirect_stdout(io.StringIO()):
                server=http.server.ThreadingHTTPServer(('127.0.0.1',0),broker.Gateway)
                thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
                try:
                    client=http.client.HTTPConnection('127.0.0.1',server.server_port)
                    client.request('POST','/evaluation-model',request_body,{'Authorization':'Bearer BROKER_TOKEN_SENTINEL','ai-model-id':'typesafe-ai/jev'})
                    response=client.getresponse();self.assertEqual(response.status,200);self.assertEqual(response.read(),response_body);client.close()
                finally:server.shutdown();server.server_close();thread.join()
            requests=list((root/'traces').glob('*.request.json'));responses=list((root/'traces').glob('*.response.json'))
            self.assertEqual(requests[0].read_bytes(),request_body);self.assertEqual(responses[0].read_bytes(),response_body)
            for file in requests+responses:
                self.assertEqual(file.stat().st_mode&0o777,0o600)
                self.assertNotIn(b'REAL_KEY_SENTINEL',file.read_bytes());self.assertNotIn(b'BROKER_TOKEN_SENTINEL',file.read_bytes())

if __name__=='__main__':unittest.main()
