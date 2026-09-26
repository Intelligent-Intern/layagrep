"""Accept admitted compatibility commits; reject a mismatched or dirty source."""
import unittest
from native_sol_gateway_runner import verify_source
class SourceGuard(unittest.TestCase):
 def test_admitted_tree_is_required(self):
  cell={'expected_image_head':'compatibility-commit','expected_source_tree':'admitted-tree'}
  good={'official_image_head':'compatibility-commit','official_image_tree':'admitted-tree','official_source_status':''}
  verify_source(cell,good)
  for field,value in [('official_image_head','other-commit'),('official_image_tree','other-tree'),('official_source_status',' M changed.py')]:
   with self.subTest(field=field),self.assertRaises(ValueError):verify_source(cell,{**good,field:value})
if __name__=='__main__':unittest.main()
