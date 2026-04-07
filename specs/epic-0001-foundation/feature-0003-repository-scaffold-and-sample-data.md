# Repository Scaffold and Sample Data Conventions

## ID
F-0003

## Type
Feature

## Parent
E-0001

## Summary
Provide a coherent repository structure, specification templates, and sample data conventions that enable immediate implementation work.

## Problem / Context
Implementation velocity drops when repository conventions are implicit or inconsistent.

## Goals
- Standardize folder/file naming patterns.
- Include example data and scaffolding for self-hosted dogfooding.

## Non-goals
- Build runnable parser code.

## Requirements
- [ ] R1: Define required top-level folders and ownership.
- [ ] R2: Provide templates for all spec entity levels.
- [ ] R3: Include sample spec repo layout for future integration tests.

## Acceptance Criteria
- [ ] AC1: Contributor can locate docs, specs, overlay, and examples without ambiguity.
- [ ] AC2: Templates can be used to author new specs immediately.
- [ ] AC3: Sample repository contains both specs and overlay directories.

## Dependencies
- F-0001
- F-0002

## Open Questions
- Should future scaffolding include automated validators for naming conventions?

## Notes
This feature defines the onboarding experience baseline for SpecForge contributors.
