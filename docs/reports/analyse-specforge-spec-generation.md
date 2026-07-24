Ja, dit voorbeeld maakt vrij duidelijk waar mijn format afwijkt. De SpecForge-instructies waren te los: ze zeiden vooral wat conceptueel moet, maar niet hoe een canonical specbestand er exact uit moet zien.
Belangrijkste verschillen
Bestandsstructuur
Voorbeeld:
specs/
  epic-0001-foundation/
    epic.md
    feature-0001-canonical-spec-model.md
    feature-0002-overlay-model.md
Mijn output:
specs/
  E-0001-viable-technical-shell.md
  E-0002-campaign-scene-preparation.md
Dus: SpecForge verwacht blijkbaar een map per epic, met epic.md voor de epic zelf en losse featurebestanden ernaast. Mijn versie stopt alle features/stories/tasks inline in één epicbestand.

Geen YAML frontmatter in voorbeeld
Voorbeeld gebruikt expliciete markdownsecties:
## ID
E-0001

## Type
Epic

## Parent
None
Mijn specs gebruiken:
---
specId: E-0001
type: epic
title: ...
---
Dus de instructies moeten waarschijnlijk zeggen: gebruik géén frontmatter; alle canonical fields staan als ##-secties in markdown.

Vaste secties ontbreken in mijn format
Het voorbeeld heeft consequent:
## ID
## Type
## Parent
## Summary
## Problem / Context
## Goals
## Non-goals
## Requirements
## Acceptance Criteria
## Dependencies
## Open Questions
## Notes
Mijn specs hebben vrije secties zoals Intent, Features, Stories, Tasks. Dat is menselijk leesbaar, maar waarschijnlijk niet parsebaar volgens SpecForge.

Parent-relaties zijn expliciet in voorbeeld
Voorbeeld feature:
## Parent
E-0001
Mijn feature-relatie is impliciet door nesting onder ## Features. Voor SpecForge moet parenthood dus waarschijnlijk altijd een veld zijn, niet afgeleid uit headings.

Features zijn zelfstandige specs
In het voorbeeld is F-0001 een eigen bestand met eigen requirements, acceptance criteria, dependencies en notes.
In mijn specs zijn features slechts subsecties binnen een epic. Daardoor kunnen ze minder goed apart gevalideerd, gecomposeerd, gelinkt of met overlaymetadata verrijkt worden.

Stories en tasks horen waarschijnlijk ook als eigen canonical entity mogelijk te zijn
Het voorbeeld noemt “Epic → Feature → Story → Task hierarchy”, maar bevat alleen epic en feature voorbeelden. Mijn specs hebben stories/tasks als inline bullets.
Als SpecForge strikt is, moeten instructies verduidelijken of stories/tasks:
eigen bestanden moeten zijn;
inline onder features mogen staan;
of pas later worden uitgesplitst.
Nu is dat niet vastgelegd, dus ik koos verkeerd/te vrij.

Requirements en Acceptance Criteria zijn checkbox-items met labels
Voorbeeld:
- [ ] R1: ...
- [ ] AC1: ...
Mijn versie:
- The application starts...
SpecForge lijkt gelabelde checkbox requirements te verwachten. Dat helpt parser, reviewer en statusprojectie.

Dependencies horen in canonical specs
Voorbeeld heeft:
## Dependencies
- F-0001
Mijn dependencies zitten alleen deels in overlay of helemaal niet. De instructies moeten onderscheid maken:
product/structurele dependencies in /specs;
planning/execution-status in overlay.

Overlay-instructie is oké, maar onvolledig gekoppeld aan canonical format
De huidige instructie zegt wel dat overlay planningmetadata bevat, maar specificeert niet dat canonical specs via ## ID gekoppeld worden. Daardoor gebruikte ik specId frontmatter en overlay entries voor feature IDs die niet als zelfstandige canonical files bestaan.

Wat scherper in ai-coder-instructions.md moet
Ik zou de instructies aanvullen met zoiets:
## Canonical Spec Format

Specs must follow the SpecForge markdown section format. Do not use YAML frontmatter.

Every canonical spec artifact must include these sections in this order:

# <Title>

## ID
<stable ID, e.g. E-0001>

## Type
Epic | Feature | Story | Task | Decision

## Parent
<parent ID or None>

## Summary
<short summary>

## Problem / Context
<context>

## Goals
- ...

## Non-goals
- ...

## Requirements
- [ ] R1: ...
- [ ] R2: ...

## Acceptance Criteria
- [ ] AC1: ...
- [ ] AC2: ...

## Dependencies
- None
or
- F-0001

## Open Questions
- None
or
- ...

## Notes
<notes or None>
En daarnaast:
## File and Folder Layout

Use one directory per epic:

specs/
  epic-0001-short-name/
    epic.md
    feature-0001-short-name.md
    feature-0002-short-name.md

Feature specs must be separate files. Do not embed feature specs inside epic.md.

Do not use files named E-0001-short-name.md at the specs root.
Nog één extra regel die veel ellende voorkomt:
## Hierarchy Rules

Parent relationships must be explicit through the `## Parent` section.
Do not rely on markdown nesting to imply hierarchy.
En voor stories/tasks zou ik een expliciete keuze toevoegen, want dat is nu nog het grootste open punt:
## Story and Task Representation

Until story/task file templates are added, do not create canonical Story or Task specs.
Represent implementation detail as Requirements and Acceptance Criteria on the Feature spec.
Of juist, als je ze wel apart wilt:
Stories and tasks must be separate files using the same canonical section format.
Use filenames like story-0001-short-name.md and task-0001-short-name.md.
Mijn aanbeveling: voor nu geen aparte story/taskbestanden, maar requirements en acceptance criteria op epic/feature-niveau. Dat past beter bij het voorbeeld en voorkomt dat de backlog meteen explodeert in tientallen files.