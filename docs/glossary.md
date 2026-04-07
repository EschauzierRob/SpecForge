# Glossary

## Spec

A structured source-of-truth artifact describing product intent, requirements, and acceptance criteria.

## Overlay

A separate metadata layer containing planning state and execution-oriented signals linked to specs by stable IDs.

## Canonical Model

Normalized in-memory hierarchy (Epic → Feature → Story → Task) used by SpecForge for traversal, validation, and UI projections.

## Parser

Component that discovers and extracts structured information from source spec files.

## Composer

Component that merges canonical spec data with overlay metadata into runtime view models without mutating sources.

## Validation

Rule-based analysis that identifies structural and metadata problems and emits actionable findings.

## Next Work

Ranked list of actionable items produced from overlay signals (status, rank, block state, dependencies) and hierarchy context.

## Drift Compensation

Future capability to reconcile specs and overlay when IDs, paths, or structures change over time.

## Local-First

Operational mode where repositories and metadata are read from local filesystem sources before any remote integrations.
