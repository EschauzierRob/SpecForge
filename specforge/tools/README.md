# SpecForge Local CLI

This directory contains the vendored SpecForge CLI runtime for this repository.

Use the launchers in `specforge/bin/`:

- `specforge/bin/specforge parse .`
- `specforge/bin/specforge compose .`
- `specforge/bin/specforge validate .`

The runtime is bootstrapped by SpecForge and should not be edited by hand.

The manifest records hashes for managed artifacts. SpecForge upgrades recognized generated versions automatically, repairs missing trusted files, and preserves customized files with a skipped-upgrade report.
