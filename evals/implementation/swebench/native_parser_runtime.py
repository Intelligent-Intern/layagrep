"""Keep Jevgrep's syntax parser separate from the task's test interpreter."""
import json
import shlex

PARSER_BIN = '/opt/jev/parser-bin'
PARSER_SCRIPT = b'#!/bin/sh\nexec /opt/miniconda3/bin/python3 -I "$@"\n'
PROBE = "import ast,json,sys; print(json.dumps({'version':sys.version,'executable':sys.executable,'isolated':sys.flags.isolated,'end_lineno':getattr(ast.parse('def f():\\n return 1\\n').body[0],'end_lineno',None)}))"


def install_parser(dx, put, container):
    dx(['mkdir', '-p', PARSER_BIN])
    put(container, PARSER_BIN + '/python3', PARSER_SCRIPT, 'root:root', '755')
    result = json.loads(dx([PARSER_BIN + '/python3', '-c', PROBE]).stdout)
    if result.get('isolated') != 1 or result.get('end_lineno') != 2:
        raise ValueError('Jevgrep requires an isolated parser with AST end locations')
    return result


def build_wrapper(token, context):
    if context not in ['files', 'chunks']:
        raise ValueError('Unknown Jevgrep context policy')
    return ('#!/bin/sh\nset -eu\nmetrics=$(mktemp /tmp/jevgrep/call.XXXXXX.json)\n'
            'exec env PATH="/opt/jev/parser-bin:$PATH" AI_GATEWAY_API_KEY=' + shlex.quote(token) +
            ' AI_GATEWAY_BASE_URL=http://model-egress:3129 node /opt/jev/hierarchy.mjs'
            ' --root "$PWD" --query "$*" --metrics "$metrics" --context ' + context + '\n').encode()
