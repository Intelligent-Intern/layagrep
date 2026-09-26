"""Extract source conditions for an evaluation-only retrieval experiment."""
import ast
import json
import sys

source = json.load(sys.stdin)['source']
tree = ast.parse(source)
units = []

def walk(node, scope=()):
    if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
        scope = scope + (node.name,)
    if isinstance(node, ast.If):
        end = min(node.end_lineno, max(node.test.end_lineno + 3, node.body[0].lineno + 2))
        units.append(dict(scope='.'.join(scope) or '<module>', startLine=node.lineno, endLine=end))
    for child in ast.iter_child_nodes(node):
        walk(child, scope)

walk(tree)
print(json.dumps(units))
