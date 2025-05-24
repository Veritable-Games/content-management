# Dodecahedron Symbols

The dodecahedron at the center of the visualization represents the core emotional and conceptual states in a symbolic form. Each face of the dodecahedron displays a different symbol representing a fundamental aspect of experience.

## Symbol List

The dodecahedron has a total of 12 faces. The following 11 symbols have been identified:

1. **Elation-Pleasure** - Represents positive emotional states related to joy and satisfaction.
2. **Fear-Anxiety** - Represents states of apprehension and worry.
3. **Gain-Pride** - Represents acquisition and positive self-assessment.
4. **Misery** - Represents deep negative emotional states.
5. **Pain** - Represents suffering and discomfort.
6. **Return-Give** - Represents reciprocity and contribution.
7. **Var-Response** - Represents reactivity and adaptation.
8. **Want-Take** - Represents desire and acquisition.
9. **Empathy** - Represents understanding and connection with others.
10. **Enmity** - Represents opposition and conflict.
11. **Loss-Shame** - Represents reduction and negative self-assessment.

The 12th symbol is currently unidentified and is marked as "MISSING SYMBOL" in the visualization.

## Special Symbols

Two symbols have special behavior based on camera distance (zoom level):

- **Balance** - Appears as a surrounding sphere when zooming out (camera distance > 25). This represents the encompassing state of equilibrium that contains all other states.
- **Depression** - Appears as an inner core when zooming in (camera distance < 8). This represents the inward state that lies beneath all other states.

These special symbols fade in and out gradually based on the zoom level.

## Interaction

Each symbol on the dodecahedron faces will glow when directly viewed, providing visual feedback on which symbol is currently in focus.

Double-clicking toggles orbit mode, which locks rotation around the dodecahedron. A visual "shake" effect confirms the toggle.

## Technical Implementation

The symbols are implemented using:
- PNG images for 8 of the symbols
- Text-based canvas rendering for 3 symbols without images
- A placeholder for the missing 12th symbol
- Special spherical meshes for Balance and Depression with fade effects based on camera distance

The glow effect uses raycasting to detect which symbol is being directly viewed, and applies a pulsing opacity change to highlight it.

## Missing Symbol Note

The 12th symbol has not been identified yet. Currently displayed as a placeholder, research is ongoing to determine what this final symbol represents in the emotional framework of the dodecahedron.