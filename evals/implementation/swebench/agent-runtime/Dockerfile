ARG BASE_IMAGE=swebench/sweb.eval.x86_64.sphinx-doc_1776_sphinx-9320@sha256:0dd7b74de29c5734fbcd2fb9ab5295f610b5b281bd2fdd87e9c3c1d3f272f28a
FROM ${BASE_IMAGE}
USER root
RUN curl --fail --silent --show-error https://nodejs.org/dist/v24.14.0/node-v24.14.0-linux-x64.tar.xz -o /tmp/node.tar.xz && tar -xJf /tmp/node.tar.xz -C /opt && rm /tmp/node.tar.xz
ENV PATH=/opt/node-v24.14.0-linux-x64/bin:$PATH
RUN npm install --global @openai/codex@0.153.4 @anthropic-ai/claude-code@2.1.278 && npm cache clean --force
RUN codex --version && claude --version
