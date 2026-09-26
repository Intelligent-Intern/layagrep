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

    def fixture(self, root, all_tasks=False):
        registry = json.loads(json.dumps(runner.REGISTRY))
        entries = registry['tasks'] if all_tasks else [registry['tasks'][4]]
        cells, rows = [], []
        skill = root/'skill.md'; skill.write_text('installed skill')
        package = root/'package.tgz'; package.write_bytes(b'package')
        prefix = root/'installed-prefix.tar'; prefix.write_bytes(b'installed prefix')
        for index, entry in enumerate(entries):
            baseline = root / ('baseline-' + str(index)); baseline.mkdir()
            cell = entry['cell']
            row = {'instance_id':entry['task'],'repo':'fixture/repo','base_commit':'public-base','image':cell['source_image'],'problem_statement':'Fix behavior.'}
            rows.append(row)
            (baseline/'prompt.txt').write_text(runner.baseline_prompt(row))
            runner.write_json(baseline/'receipt.json',{'image':cell['image'],'cell':cell,'versions':runner.VERSIONS,'provider_route':'vercel-ai-gateway','prompt_sha256':runner.digest(baseline/'prompt.txt')})
            runner.write_json(baseline/'grading-receipt.json',{'resolved_instances':int(entry['resolved'])})
            entry['files']={name:runner.digest(baseline/name) for name in ['receipt.json','prompt.txt','grading-receipt.json']}
            cells.append({'baseline':str(baseline),'baseline_cost_usd':entry['cost_usd'],'baseline_resolved':entry['resolved'],
                          'cell':{**cell,'id':'installed-' + str(index),'arm':'chunks','candidate':str(prefix)},'output':str(root / ('attempt-' + str(index)))})
        registry_path = root/'fixed-baselines.json';runner.write_json(registry_path,registry)
        patcher=patch.object(runner,'REGISTRY',registry);patcher.start();self.addCleanup(patcher.stop)
        inputs = root / 'agent-inputs.json'; runner.write_json(inputs,rows)
        dataset=root/'dataset.json';dataset.write_text('fixture dataset')
        paths = [dataset,Path(runner.__file__),HERE/'gateway_broker.py',registry_path,inputs,skill,package,prefix]
        plan = {'schema':2,'status':'frozen','cells':cells,'runner':str(Path(runner.__file__)),'broker':str(HERE/'gateway_broker.py'),
                'registry':str(registry_path),'tooling':str(root/'tooling'),'dataset':str(root/'dataset.json'),
                'inputs':str(inputs),'skill':str(skill),'package':str(package),'artifacts':{str(p):runner.digest(p) for p in paths}}
        plan_path=root/'plan.json';runner.write_json(plan_path,plan)
        return plan_path,{**plan,**cells[0]}

    def receipt(self, path, plan, status='completed'):
        out=Path(plan['output']);out.mkdir(exist_ok=True)
        runner.write_json(out/'receipt.json',{'plan_sha256':runner.digest(path),'cell':plan['cell'],'status':status,
                                            'required_retrieval_observed':True,'timing_valid':True,'native_completed':True,'exit_code':0,'host_pid':os.getpid()})
        return out

    def test_dry_run_validates_pair_without_credentials_or_agent(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary))
            with patch.object(runner,'check_image',return_value=plan['cell']['image']),patch.object(runner,'command',side_effect=AssertionError('No agent or paid command allowed')),patch.dict(os.environ,{},clear=True),contextlib.redirect_stdout(io.StringIO()) as stdout:
                runner.run(argparse.Namespace(plan=path,dry_run=True,task=None))
            self.assertEqual(json.loads(stdout.getvalue())['paid_calls'],0)
            self.assertFalse(Path(plan['output']).exists())
            Path(plan['cell']['candidate']).write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError,'Frozen artifact changed'):runner.load_plan(path)

    def test_changed_model_is_not_paired_to_the_old_baseline(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary))
            cohort=json.loads(path.read_text());cohort['cells'][0]['cell']['model']='another-model';runner.write_json(path,cohort)
            with self.assertRaisesRegex(ValueError,'pairing changed'):runner.load_plan(path)

    def test_grading_rejects_a_changed_official_harness_before_execution(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);path,plan=self.fixture(root);self.receipt(path,plan)
            with patch.object(runner,'text',return_value='changed-harness'),patch.object(runner.subprocess,'run',side_effect=AssertionError('No grader launched')):
                with self.assertRaisesRegex(ValueError,'harness checkout changed'):
                    runner.grade(argparse.Namespace(plan=path,tooling=root/'tooling',dataset=root/'dataset.json',task=None))

    def test_incomplete_billing_never_counts_missing_charges_as_free(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary));out=self.receipt(path,plan)
            events=[{'kind':'codex-request-start','operation':'generation','requestId':'one'},{'kind':'codex-generation','requestId':'one','generationId':'gen_one'},{'kind':'codex-gateway','requestId':'one','status':200,'streamTerminal':'response.completed'}, {'kind':'codex-request-start','operation':'generation','requestId':'missing'}]
            (out/'proxy.jsonl').write_text('\n'.join(json.dumps(e) for e in events))
            runner.write_json(out/'generation-lookups.json',[{'id':'gen_one','metadata':{'id':'gen_one','model':'openai/gpt-5.6-sol','total_cost':0.1}}])
            runner.write_json(out/'grading-receipt.json',{'resolved_instances':1})
            with patch.object(runner.urllib.request,'urlopen',side_effect=AssertionError('No network')),contextlib.redirect_stdout(io.StringIO()):runner.account(argparse.Namespace(plan=path,task=None))
            result=json.loads((out/'generation-accounting.json').read_text())
            self.assertEqual(result['known_gateway_cost_usd'],0.1)
            self.assertIsNone(result['gateway_cost_usd']);self.assertFalse(result['successful_cost_win'])

    def test_terminal_failures_are_retained_and_active_attempts_stop(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary));out=self.receipt(path,plan,'failed')
            with patch.object(runner,'text',side_effect=AssertionError('Terminal attempts need no process probe')):
                self.assertTrue(runner.existing_attempt(plan))
            self.receipt(path,plan,'running')
            with patch.object(runner,'text',return_value='active-container'):
                with self.assertRaisesRegex(ValueError,'active'):runner.existing_attempt(plan)
            with patch.object(runner.os,'kill',side_effect=ProcessLookupError),patch.object(runner,'text',return_value=''):
                self.assertTrue(runner.existing_attempt(plan))
            self.assertEqual(json.loads((out/'receipt.json').read_text())['status'],'interrupted')

    def test_cohort_gate_requires_eight_preserved_and_seven_fully_billed_wins(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary),all_tasks=True)
            for index,item in enumerate(plan['cells']):
                out=self.receipt(path,item)
                runner.write_json(out/'grading-receipt.json',{'run_id':'jg-'+item['cell']['id'],'exit_code':0,'resolved_instances':int(item['baseline_resolved'])})
                runner.write_json(out/'generation-accounting.json',{'cell':item['cell']['id'],'all_requests_accounted':index<7,'gateway_cost_usd':0.01 if index<7 else None,'known_gateway_cost_usd':0.01})
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertTrue(result['accepted']);self.assertEqual(result['baseline_solves_preserved'],8)
            self.assertEqual(result['fully_billed_solved_cost_wins'],7);self.assertIsNone(result['fully_billed_total_usd'])
            for item in plan['cells'][8:]:
                self.receipt(path,item,'failed')
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertTrue(result['accepted'])
            self.assertFalse(result['cells'][-1]['protocol_valid'])
            self.assertAlmostEqual(result['known_gateway_subtotal_usd'],0.1)
            last=plan['cells'][-1]
            runner.write_json(Path(last['output'])/'grading-receipt.json',{'run_id':'jg-'+last['cell']['id'],'exit_code':1})
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertTrue(result['accepted'])
            out=Path(plan['cells'][0]['output']);runner.write_json(out/'generation-accounting.json',{'cell':plan['cells'][0]['cell']['id'],'all_requests_accounted':False,'gateway_cost_usd':None,'successful_cost_win':True})
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertFalse(result['accepted']);self.assertEqual(result['fully_billed_solved_cost_wins'],6)
            runner.write_json(out/'grading-receipt.json',{'run_id':'jg-'+plan['cells'][0]['cell']['id'],'exit_code':0,'resolved_instances':0})
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertEqual(result['baseline_solves_preserved'],7)

    def test_cohort_cannot_mix_installations_or_reuse_an_attempt_directory(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,_=self.fixture(Path(temporary),all_tasks=True)
            plan=json.loads(path.read_text())
            original=plan['cells'][1]['cell']['candidate']
            plan['cells'][1]['cell']['candidate']='different-installation';runner.write_json(path,plan)
            with self.assertRaisesRegex(ValueError,'one prefix'):runner.load_cohort(path)
            plan['cells'][1]['cell']['candidate']=original
            plan['cells'][1]['output']=plan['cells'][0]['output'];runner.write_json(path,plan)
            with self.assertRaisesRegex(ValueError,'distinct attempt'):runner.load_cohort(path)

    def test_single_task_cannot_claim_full_cohort_acceptance(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,_=self.fixture(Path(temporary))
            with contextlib.redirect_stdout(io.StringIO()):result=runner.aggregate(argparse.Namespace(plan=path))
            self.assertFalse(result['prospective_full_cohort']);self.assertFalse(result['accepted'])

    def jev_fixture(self, root):
        traces=root/'jev-traces';traces.mkdir()
        events=[]
        for index,cost in enumerate(['0.01','0.02']):
            identifier=str(index)*32
            request=traces/(identifier+'.request.json');request.write_text('{}')
            response=traces/(identifier+'.response.json')
            runner.write_json(response,{'usage':{'inputTokens':10,'outputTokens':2},'providerMetadata':{'gateway':{'cost':cost,'routing':{'totalProviderAttemptCount':index+1}}}})
            events.extend([{'kind':'jev-request-start','requestId':identifier},
                           {'kind':'gateway','requestId':identifier,'status':200,'requestBytes':request.stat().st_size,'responseBytes':response.stat().st_size}])
        return events

    def test_jev_reports_response_cost_once_and_provider_retry_counts_separately(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);events=self.jev_fixture(root)
            result=runner.observed_jev(root,events,True,True)
            self.assertTrue(result['complete']);self.assertEqual(result['observed_cost_usd'],0.03)
            self.assertEqual(result['client_calls'],2);self.assertEqual(result['provider_attempts'],3)
            self.assertEqual(result['input_tokens'],20);self.assertEqual(result['output_tokens'],4)
            self.assertFalse(result['included_in_scored_task_cost'])

    def test_jev_missing_invalid_or_unfinished_responses_leave_total_unknown(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);events=self.jev_fixture(root)
            response=root/'jev-traces'/('1'*32+'.response.json')
            original=response.read_bytes()
            for value in [b'{',b'{}',b'{"providerMetadata":{"gateway":{"cost":"NaN"}}}',b'{"providerMetadata":{"gateway":{"cost":true}}}']:
                response.write_bytes(value)
                result=runner.observed_jev(root,events,True,True)
                self.assertFalse(result['complete']);self.assertIsNone(result['observed_cost_usd'])
                self.assertEqual(result['known_cost_usd'],0.01)
            response.write_bytes(original)
            for log_valid,copied,extra in [(False,True,[]),(True,False,[]),(True,True,[events[0]])]:
                result=runner.observed_jev(root,events+extra,log_valid,copied)
                self.assertFalse(result['complete']);self.assertIsNone(result['observed_cost_usd'])
            events[-1]['transportError']='Interrupted'
            self.assertIsNone(runner.observed_jev(root,events,True,True)['observed_cost_usd'])

    def test_retained_jev_cost_survives_missing_log_or_request_start(self):
        for missing_log in [True, False]:
            with self.subTest(missing_log=missing_log),tempfile.TemporaryDirectory() as temporary:
                path,plan=self.fixture(Path(temporary));out=self.receipt(path,plan)
                events=self.jev_fixture(out)
                if not missing_log:
                    (out/'proxy.jsonl').write_text('\n'.join(json.dumps(event) for event in events[1:]))
                receipt=json.loads((out/'receipt.json').read_text());receipt['jev_traces_copied']=True;runner.write_json(out/'receipt.json',receipt)
                with patch.object(runner.urllib.request,'urlopen',side_effect=AssertionError('No network')),contextlib.redirect_stdout(io.StringIO()):
                    runner.account(argparse.Namespace(plan=path,task=None))
                result=json.loads((out/'generation-accounting.json').read_text())['jev']
                self.assertEqual(result['known_cost_usd'],0.03)
                self.assertEqual(result['responses_with_cost'],2)
                self.assertEqual(result['known_input_tokens'],20)
                self.assertEqual(result['known_provider_attempts'],3)
                self.assertFalse(result['complete']);self.assertIsNone(result['observed_cost_usd'])

    def test_observed_jev_cost_does_not_change_scored_sol_cost_win(self):
        with tempfile.TemporaryDirectory() as temporary:
            path,plan=self.fixture(Path(temporary));out=self.receipt(path,plan)
            events=self.jev_fixture(out)
            identifier='0'*32;response=out/'jev-traces'/(identifier+'.response.json')
            body=json.loads(response.read_text());body['providerMetadata']['gateway']['cost']='100';runner.write_json(response,body)
            events[1]['responseBytes']=response.stat().st_size
            events.extend([{'kind':'codex-request-start','operation':'generation','requestId':'sol'},
                           {'kind':'codex-generation','requestId':'sol','generationId':'gen_sol'},
                           {'kind':'codex-gateway','requestId':'sol','status':200,'streamTerminal':'response.completed'}])
            (out/'proxy.jsonl').write_text('\n'.join(json.dumps(event) for event in events))
            receipt=json.loads((out/'receipt.json').read_text());receipt['jev_traces_copied']=True;runner.write_json(out/'receipt.json',receipt)
            runner.write_json(out/'generation-lookups.json',[{'id':'gen_sol','metadata':{'id':'gen_sol','model':'openai/gpt-5.6-sol','total_cost':0.1}}])
            runner.write_json(out/'grading-receipt.json',{'run_id':'jg-'+plan['cell']['id'],'exit_code':0,'resolved_instances':1})
            with patch.object(runner.urllib.request,'urlopen',side_effect=AssertionError('No network')),contextlib.redirect_stdout(io.StringIO()):
                runner.account(argparse.Namespace(plan=path,task=None))
            result=json.loads((out/'generation-accounting.json').read_text())
            self.assertEqual(result['gateway_cost_usd'],0.1);self.assertTrue(result['successful_cost_win'])
            self.assertEqual(result['jev']['observed_cost_usd'],100.02)

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
