# License sources omitted or abbreviated upstream

`provider-utils-5.0.45.LICENSE` is the Vercel AI repository license at
[the exact provider-utils 5.0.45 tag revision](https://github.com/vercel/ai/blob/08ae5ad05bc12496dd1ffcf64e34419e0831300d/LICENSE).
That npm package declares Apache-2.0 but omits its license file. The override is
version-specific so an upgrade cannot silently reuse an unchecked notice.

`Apache-2.0.txt` contains the [Apache Software Foundation's full license terms](https://www.apache.org/licenses/LICENSE-2.0.txt).
The notice generator retains package copyright notices and includes these terms
when emitted dependencies use Apache-2.0. Builds read these retained sources;
there is no build-time or runtime license download.
