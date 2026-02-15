## 2024-05-23 - Accessibility of Icon-Only Buttons
**Learning:** This app extensively uses icon-only buttons for actions (close, menu, social links) but consistently missed `aria-label` attributes. This made navigation and key actions completely invisible to screen reader users.
**Action:** When creating new components with icon-only actions, always verify: 1. `aria-label` is present and descriptive. 2. `aria-hidden="true"` is on the icon itself to prevent redundancy. 3. `aria-expanded` is used for toggle buttons.
