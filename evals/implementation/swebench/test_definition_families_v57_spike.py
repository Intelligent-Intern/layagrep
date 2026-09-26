from pathlib import Path
import importlib.util,unittest
spec=importlib.util.spec_from_file_location('spike',Path(__file__).with_name('definition-families-v57-spike.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class Tests(unittest.TestCase):
 def test_inheritance_groups_overrides_but_not_unrelated_same_names(self):
  text='class Base:\n    def convert(self): return 1\nclass Child(Base):\n    def convert(self): return self\nclass Unrelated:\n    def convert(self): return 3\n'
  cs=[{'id':name,'path':'a.py','symbol':name+'.convert'} for name in ['Base','Child','Unrelated']]
  r=mod.families([{'path':'a.py','text':text}],cs)
  self.assertEqual({frozenset(f['members']) for f in r['families']},{frozenset(['Base','Child']),frozenset(['Unrelated'])})
  self.assertEqual([(e['derived'],e['base']) for e in r['inheritance_edges']],[('Child','Base')])
 def test_nested_scope_and_unknown_cross_file_bases_do_not_merge(self):
  text='class Base:\n    def f(self): return 0\nclass Scope:\n    class Base:\n        def f(self): return 1\n    class Child(Base):\n        def f(self): return 2\n'
  docs=[{'path':'a.py','text':text},{'path':'b.py','text':'class Child(Base):\n    def f(self): return 3\n'}]
  cs=[{'id':s,'path':'a.py','symbol':s+'.f'} for s in ['Base','Scope.Base','Scope.Child']]+[{'id':'external','path':'b.py','symbol':'Child.f'}]
  r=mod.families(docs,cs)
  self.assertEqual({frozenset(f['members']) for f in r['families']},{frozenset(['Base']),frozenset(['Scope.Base','Scope.Child']),frozenset(['external'])})
  self.assertTrue(any(u['path']=='b.py' and u['base']=='Base' for u in r['unresolved_bases']))
 def test_function_and_nested_class_do_not_close_over_outer_class_namespace(self):
  text='class Base:\n    def f(self): return 0\nclass Scope:\n    class Base:\n        def f(self): return 1\n    def make():\n        class Child(Base):\n            def f(self): return 2\n    class Nested:\n        class Child(Base):\n            def f(self): return 3\n'
  names=['Base','Scope.Base','Scope.make.Child','Scope.Nested.Child']
  r=mod.families([{'path':'a.py','text':text}],[{'id':n,'path':'a.py','symbol':n+'.f'} for n in names])
  self.assertEqual({frozenset(f['members']) for f in r['families']},{frozenset(['Base','Scope.make.Child','Scope.Nested.Child']),frozenset(['Scope.Base'])})
if __name__=='__main__':unittest.main()
