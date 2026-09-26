"""Syntax-only caller variants. Never execute or resolve repository code."""
import ast
import json
import sys
from collections import defaultdict

source = sys.stdin.read()
try:
    tree = ast.parse(source)
except SyntaxError:
    print('[]')
    raise SystemExit(0)

calls = defaultdict(list)
definitions = defaultdict(set)
class_scopes = set()

class Calls(ast.NodeVisitor):
    def __init__(self):
        self.scope = []
        self.owner = None

    def visit_ClassDef(self, node):
        previous = self.owner
        self.owner = None
        self.scope.append(node.name)
        class_scopes.add('.'.join(self.scope))
        for child in node.body:
            self.visit(child)
        self.scope.pop()
        self.owner = previous

    def visit_FunctionDef(self, node):
        previous = self.owner
        definitions['.'.join(self.scope) or '<module>'].add(node.name)
        self.owner = ('.'.join(self.scope) or '<module>', '.'.join([*self.scope, node.name]))
        self.scope.append(node.name)
        for child in node.body:
            self.visit(child)
        self.scope.pop()
        self.owner = previous

    visit_AsyncFunctionDef = visit_FunctionDef

    def visit_Call(self, node):
        if self.owner and isinstance(node.func, (ast.Name, ast.Attribute)):
            scope, owner = self.owner
            callee = ast.unparse(node.func)
            arguments = [(f'positional:{index}', arg) for index, arg in enumerate(node.args)]
            arguments += [(f'keyword:{arg.arg}', arg.value) for arg in node.keywords if arg.arg]
            for argument, value in arguments:
                if isinstance(value, ast.Constant) and isinstance(value.value, (str, int, float, bool, type(None))):
                    calls[(scope, callee, argument)].append(dict(owner=owner, line=node.lineno, value=value.value))
        self.generic_visit(node)

Calls().visit(tree)
groups = []
for (scope, callee, argument), callers in sorted(calls.items()):
    if '--local-only' in sys.argv:
        local_method = callee.startswith('self.') and callee.count('.') == 1 and callee[5:] in definitions[scope] and scope in class_scopes
        local_function = '.' not in callee and (callee in definitions['<module>'] or (scope not in class_scopes and callee in definitions[scope]))
        if not (local_method or local_function):
            continue
    if len({c['owner'] for c in callers}) < 2 or len({json.dumps(c['value']) for c in callers}) < 2:
        continue
    groups.append(dict(scope=scope, callee=callee, argument=argument, callers=callers))
print(json.dumps(groups))
