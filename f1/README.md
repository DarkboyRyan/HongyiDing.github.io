# F1 research figures

The page displays five original notebook exports: `figures/downforce.png`, `figures/grip.png`, `figures/tradeoff.png`, `figures/drag-penalty.png`, and `figures/flow-field.png`. The notebook `Final-Project.ipynb` is retained as research provenance. Existing bilingual descriptions explain the sampled lap-time proxy and the limitations of the unvalidated CFD prototype.

Unused generated SVG figures and the undisplayed `longitudinal.png` / `circuits.png` were archived outside the website during cleanup on 2026-11-10.

`f1/tools/render_f1_plots.py` and `f1/tests/f1-model.test.py` remain useful for checking the analytical model. Running the renderer optionally regenerates four SVG figures; they are not required by the current website.

## Folder layout

- `index.html`, `f1-*.js`, `f1-project.css`: bilingual research page.
- `Final-Project.ipynb`: original Jupyter notebook (unchanged).
- `figures/`: five displayed PNG exports.
- `tools/`: optional renderer, output goes to `figures/`.
- `tests/`: analytical model checks.

From the website root, run `python3 -B f1/tests/f1-model.test.py`. Shared site styles, language switching and music stay in the website root.
