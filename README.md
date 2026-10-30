# The Numbered library

The styles and templates people have shared from [Numbered](https://numbered.app), as plain files, dedicated to the public domain under CC0.

- `index.json` lists every item in the library.
- `items/<id>/<version>.md` is a style.
- `items/<id>/<version>.json` is a template.

Every night a workflow runs `node export.mjs https://numbered.app .` and commits whatever changed. A version that leaves the library also leaves this tree, but it stays in the history.
