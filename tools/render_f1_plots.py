"""Recreate the analytic F1 figures without running or modifying the notebook.

Run: python3 tools/render_f1_plots.py
The CFD image and the two original cornering parameter-sweep figures are
preserved separately. All numbers here come from the notebook's models.
"""
from pathlib import Path
from math import sqrt, isfinite
from html import escape

OUTPUT = Path(__file__).resolve().parents[1] / 'assets' / 'f1'
MASS, RHO, AREA, POWER, GRAVITY = 798.0, 1.225, 1.5, 750_000.0, 9.81
MU, RADIUS, EFFICIENCY, CRR = 1.8, 80.0, 0.88, 0.018
CIRCUITS = [('Power', 1000.0, 100.0, 11), ('Balanced', 600.0, 200.0, 12), ('Technical', 200.0, 300.0, 19)]
COLORS = ['#235bc0', '#ba5b16', '#21816a']


def terminal_speed(cd):
    """Positive root of P = drag power + rolling-resistance power (m/s)."""
    if cd <= 0:
        raise ValueError('Drag coefficient must be positive')
    low, high = 0.0, 200.0
    def required(v):
        return 0.5 * RHO * cd * AREA * v**3 + CRR * MASS * GRAVITY * v
    while required(high) < POWER:
        high *= 2
    for _ in range(80):
        mid = (low + high) / 2
        if required(mid) < POWER:
            low = mid
        else:
            high = mid
    return (low + high) / 2


def drag(cl):
    return 0.40 + 0.25 * cl


def top_speed(cl):
    """Notebook lap-time model: efficiency included; rolling resistance omitted."""
    return (2 * EFFICIENCY * POWER / (RHO * drag(cl) * AREA)) ** (1 / 3)


def corner_speed(cl):
    denominator = MASS / RADIUS - 0.5 * MU * RHO * cl * AREA
    if denominator <= 0:
        raise ValueError('No finite grip-limited speed in this simplified model')
    return sqrt(MU * MASS * GRAVITY / denominator)


def lap_time(cl, straight, corner, count):
    return straight / top_speed(cl) + count * corner / corner_speed(cl)


def samples(low, high, count=200):
    return [low + (high - low) * i / (count - 1) for i in range(count)]


def chart(filename, title, subtitle, xlabel, ylabel, series, bounds, xticks, yticks, marker=None):
    """Write a standalone vector plot with explicit scales and an accessible title."""
    x0, x1, y0, y1 = bounds
    left, right, top, bottom = 96, 856, 112, 464
    def px(x): return left + (x - x0) / (x1 - x0) * (right - left)
    def py(y): return bottom - (y - y0) / (y1 - y0) * (bottom - top)
    def label(x, y, value, size=14, color='#536577', anchor='middle', extra=''):
        return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" {extra}>{escape(str(value))}</text>'
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600" role="img" aria-labelledby="title desc">',
             '<title id="title">' + escape(title) + '</title>', '<desc id="desc">' + escape(subtitle) + '</desc>',
             '<rect width="900" height="600" fill="white"/>', '<g font-family="Arial, Helvetica, sans-serif">',
             label(32, 36, title, 23, '#192b3a', 'start'), label(32, 64, subtitle, 14, anchor='start')]
    for x in xticks:
        parts += [f'<path d="M{px(x):.3f} {top}V{bottom}" stroke="#e2e8f0"/>', label(px(x), bottom + 28, f'{x:g}')]
    for y in yticks:
        parts += [f'<path d="M{left} {py(y):.3f}H{right}" stroke="#e2e8f0"/>', label(left - 14, py(y) + 5, f'{y:g}', anchor='end')]
    parts += [f'<path d="M{left} {top}V{bottom}H{right}" fill="none" stroke="#607382"/>',
              label((left + right) / 2, 520, xlabel, 16, '#192b3a'),
              label(0, 0, ylabel, 16, '#192b3a', extra='transform="translate(26 288) rotate(-90)"')]
    if marker:
        value, description = marker
        parts += [f'<path d="M{px(value):.3f} {top}V{bottom}" stroke="#607382" stroke-dasharray="5 5"/>',
                  label(right, 92, description, 13, anchor='end')]
    for i, (name, points) in enumerate(series):
        assert all(isfinite(x) and isfinite(y) and x0 <= x <= x1 and y0 <= y <= y1 for x, y in points)
        coords = ' '.join(f'{px(x):.3f},{py(y):.3f}' for x, y in points)
        color = COLORS[i % len(COLORS)]
        parts.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="3" stroke-linejoin="round"/>')
        legend_x = 96 + i * 245
        parts += [f'<path d="M{legend_x} 565h28" stroke="{color}" stroke-width="3"/>', label(legend_x + 38, 570, name, 14, anchor='start')]
    parts += ['</g></svg>']
    (OUTPUT / filename).write_text('\n'.join(parts) + '\n')


def render():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    cds, cls = samples(0.5, 1.0), samples(0.5, 4.0)
    chart('terminal-speed.svg', 'Drag and steady-state top speed',
          'Idealized power balance; no launch or acceleration prediction', 'Drag coefficient CD', 'Steady-state speed (km/h)',
          [('Power-limited model', [(cd, terminal_speed(cd) * 3.6) for cd in cds])],
          (.5, 1., 320., 440.), [.5, .6, .7, .8, .9, 1.], [320, 340, 360, 380, 400, 420, 440])
    chart('tradeoff.svg', 'Straight-line speed and cornering limit',
          'Prescribed coupling: CD = 0.40 + 0.25 CL', 'Downforce coefficient CL', 'Speed (km/h)',
          [('Straight-line top speed', [(cl, top_speed(cl) * 3.6) for cl in cls]),
           ('Grip-limited corner speed', [(cl, corner_speed(cl) * 3.6) for cl in cls])],
          (.5, 4., 120., 420.), [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], [150, 200, 250, 300, 350, 400], (4., 'Lowest sampled lap-time proxy: CL = 4.0 (boundary)'))
    normalized = []
    for name, ls, lc, count in CIRCUITS:
        values = [lap_time(cl, ls, lc, count) for cl in cls]
        normalized.append((name, list(zip(cls, [v / min(values) for v in values]))))
    chart('circuits.svg', 'Lap-time sensitivity across circuit types',
          'Each curve is normalized by its own minimum within the tested range', 'Downforce coefficient CL', 'Normalized lap-time proxy',
          normalized, (.5, 4., .95, 1.7), [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7], (4., 'All three minima occur at the upper boundary'))
    chart('drag-penalty.svg', 'Assumed drag–downforce relationship',
          'A model input, not a relationship measured from the CFD visualization', 'Downforce coefficient CL', 'Drag coefficient CD',
          [('CD = 0.40 + 0.25 CL', [(cl, drag(cl)) for cl in cls])],
          (.5, 4., .4, 1.5), [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], [.4, .6, .8, 1, 1.2, 1.4])


if __name__ == '__main__':
    render()
