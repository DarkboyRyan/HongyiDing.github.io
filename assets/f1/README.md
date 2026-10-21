# F1 research figures

Current presentation: only original saved notebook figures are displayed: `downforce.png`, `grip.png`, `tradeoff.png`, `drag-penalty.png`, and `flow-field.png`. Original optimum annotations are unchanged, with adjacent bilingual explanations limiting them to the sampled lap-time proxy. The unvalidated CFD prototype is at the bottom, followed by the model-scope note. Generated SVG figures are not displayed.

Source: Hongyi Ding’s PHYS3211 final-project notebook, dated March 23, 2026.

- `terminal-speed.svg`: newly solves the steady-state power balance from the longitudinal model. Uses 750 kW of assumed wheel power, 798 kg mass, rho=1.225 kg/m³, area=1.5 m², Crr=0.018 and g=9.81 m/s². Replaces the unphysical traction-unlimited launch curve in the web presentation; no acceleration prediction is made.
- `tradeoff.svg`, `circuits.svg`, `drag-penalty.svg`: regenerate the existing prescribed-coefficient calculations with corrected titles and labels. These lap-time calculations use eta=0.88, omit rolling resistance, and sample 200 CL values from 0.5 to 4.0. All sampled circuit minima occur at CL=4.0; no global or circuit-specific optimum is established.
- `downforce.png`, `grip.png`: original saved grip-limit parameter-sweep figures; valid only under the stated force-balance assumptions.
- `flow-field.png`: original saved output of the unvalidated 2D CFD prototype. No re-execution, mesh convergence, conservation audit or surface-force validation has been performed. Its coefficients are not used by the vehicle models.
- Original PNG exports and the supplied notebook copy are retained as provenance, not linked as current results or downloads.

Recreate the four SVG figures with `python3 tools/render_f1_plots.py`. This uses only the Python standard library. The original notebook is unchanged.
