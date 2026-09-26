import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('spike',Path(__file__).with_name('call-definitions-v55-spike.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class Tests(unittest.TestCase):
 def test_visible_dynamic_call_yields_all_named_definitions_not_unseen_calls(self):
  caller='def main(v):\n    return v.convert()\n\ndef unrelated(v):\n    return v.hidden()\n'
  defs='class A:\n    def convert(self):\n        return self.copy()\nclass B:\n    def convert(self):\n        return "é😀"\n    def hidden(self):\n        return 1\n'
  boundary=len(caller.split('\n\ndef unrelated')[0].encode())
  r=module.expand([{'path':'caller.py','text':caller,'seed_ranges':[[0,boundary]],'visible_ranges':[[0,boundary]]},{'path':'defs.py','text':defs,'seed_ranges':[],'visible_ranges':[]}])
  self.assertEqual({d['symbol'] for d in r['definitions']},{'A.convert','B.convert'})
  for d in r['definitions']:
   self.assertTrue(d['runtime_dispatch_unknown']);self.assertEqual(defs.encode()[d['sourceByteStart']:d['sourceByteEnd']].decode(),d['text'])
 def test_unicode_clip_and_already_visible_definition_are_explicit(self):
  caller='def main(v): return v.convert()\n'
  defs='class A:\n    def convert(self):\n        return "😀é"\n'
  start=defs.encode().index(b'    def');limit=defs.encode().index('😀'.encode())-start+1
  docs=[{'path':'caller.py','text':caller,'seed_ranges':[[0,len(caller.encode())]],'visible_ranges':[]},{'path':'defs.py','text':defs,'seed_ranges':[],'visible_ranges':[]}]
  r=module.expand(docs,max_definition_bytes=limit);d=r['definitions'][0]
  self.assertTrue(d['truncated']);self.assertEqual(defs.encode()[d['sourceByteStart']:d['sourceByteEnd']].decode(),d['text']);self.assertLess(d['sourceByteEnd'],d['declarationByteEnd'])
  docs[1]['visible_ranges']=[[0,len(defs.encode())]]
  r=module.expand(docs);self.assertEqual(r['definitions'],[]);self.assertEqual([d['symbol'] for d in r['already_visible']],['A.convert'])
 def test_normalized_identifier_keeps_original_source_spelling(self):
  text='def K(): return 1\ndef main(v):\n    return v.K() + K()\n'
  a=text.encode().index(b'def main')
  r=module.expand([{'path':'names.py','text':text,'seed_ranges':[[a,len(text.encode())]],'visible_ranges':[[a,len(text.encode())]]}])
  self.assertEqual([d['symbol'] for d in r['definitions']],['K'])
  self.assertEqual(len(r['visible_calls']),2)
  for c in r['visible_calls']:
   self.assertEqual(text.encode()[c['sourceByteStart']:c['sourceByteEnd']].decode(),'K');self.assertEqual(c['name'],'K');self.assertEqual(c['spelling'],'K')
if __name__=='__main__':unittest.main()
