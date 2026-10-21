"""Checks the physical balances and reported values behind the web figures."""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('f1_plots', ROOT / 'tools/render_f1_plots.py')
f1 = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(f1)


class F1ResultsTest(unittest.TestCase):
    def test_terminal_speed_satisfies_power_balance(self):
        for cd in (0.5, 0.75, 1.0):
            v = f1.terminal_speed(cd)
            power = .5 * 1.225 * cd * 1.5 * v**3 + .018 * 798 * 9.81 * v
            self.assertAlmostEqual(power, 750_000, places=6)
        self.assertAlmostEqual(f1.terminal_speed(.5) * 3.6, 420.777654, places=5)
        self.assertAlmostEqual(f1.terminal_speed(1.) * 3.6, 334.483280, places=5)
        self.assertGreater(f1.terminal_speed(.5), f1.terminal_speed(1.))

    def test_grip_limit_satisfies_force_balance(self):
        v = f1.corner_speed(4.)
        self.assertAlmostEqual(798 * v*v / 80, 1.8 * (798 * 9.81 + .5 * 1.225 * 4 * 1.5 * v*v), places=6)
        self.assertAlmostEqual(v * 3.6, 233.133704, places=5)
        with self.assertRaises(ValueError):
            f1.corner_speed(7.)

    def test_lap_proxy_reproduces_boundary_minima_and_sensitivity(self):
        reference_ratios = [1.2564138408, 1.4937938003, 1.6244098090]
        values = f1.samples(.5, 4.)
        for (_, straight, corner, count), ratio in zip(f1.CIRCUITS, reference_ratios):
            times = [f1.lap_time(cl, straight, corner, count) for cl in values]
            self.assertEqual(values[times.index(min(times))], 4.)
            self.assertAlmostEqual(times[0] / min(times), ratio, places=9)
        self.assertGreater(f1.top_speed(.5), f1.top_speed(4.))
        self.assertLess(f1.corner_speed(.5), f1.corner_speed(4.))


if __name__ == '__main__':
    unittest.main()
