# Build Section Tokenizer and Field Mapper

## ID
T-0101

## Type
Task

## Parent
S-0101

## Summary
Implement markdown section tokenization and field mapping utilities for canonical extraction.

## Problem / Context
Parser behavior must be explicit and testable.

## Goals
- Produce deterministic section map from markdown.

## Non-goals
- Full markdown AST processing.

## Requirements
- [ ] R1: Tokenizer identifies `##` section headings and associated content blocks.
- [ ] R2: Mapper resolves canonical field keys from expected section names.

## Acceptance Criteria
- [ ] AC1: Given a valid spec file, mapper returns expected canonical field object.
- [ ] AC2: Unknown sections are preserved as diagnostics metadata.

## Dependencies
- S-0101

## Open Questions
- None.

## Notes
Keep implementation language-agnostic and modular.
