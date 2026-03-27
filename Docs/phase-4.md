# Phase 4 — Rule Engine + Transform (Plan)

**Duration:** 6 days
**Depends on:** Phase 3 (AnalysisResult, PromptGap, PromptElement types + Analyzer output)
**External dependencies:** None — pure logic. Weights come from DB but the engine accepts them as input.

---

## Overview

Phase 4 is the **core transformation layer**. It takes the `AnalysisResult` from Phase 3 and the raw user text, then rewrites the prompt by applying rules that inject missing structure. Each rule targets a specific gap (role, context, constraints, etc.) and formats its output for the target model (Claude/GPT/general).

Three components:

```
AnalysisResult + Raw Text + Weights → Rule Engine → Model Adapter → Transformed Prompt
                                                                  ↓
                                                              Merger (blends with learned patterns)
```

---

## Files to Create (4 files)

```
src/
└── agent/
    ├── rule-engine.ts         → 7 rules + engine core (sort, check, apply)
    ├── model-adapter.ts       → wrapSection() — formats per target model
    ├── merger.ts              → Blends rule output with past high-scoring prompts
    └── (rules could be inline in rule-engine.ts or split into src/agent/rules/)
```

**Decision: inline rules vs. separate files?**

| Approach | Pros | Cons |
|---|---|---|
| **Inline (chosen)** | All 7 rules in one file. Easy to read the full picture. ~150 lines total | Longer single file |
| Separate files | Each rule is its own file. Clean isolation | 7 extra files for ~20 lines each. Over-engineering for now |

**Recommendation:** Inline in `rule-engine.ts` for v1. If we add 10+ rules later → extract to `src/agent/rules/`.

---

## Task Breakdown (6 days)

| # | Task | Days | Detail |
|---|------|------|--------|
| 1 | Model adapter (`wrapSection()`) | 0.5 | Single function: formats label+content per target model (XML/MD/bracket) |
| 2 | Rule engine core (sort, check, apply loop) | 1 | Accept rules array + weights → sort by weight → check condition → apply in order → return result + applied list |
| 3 | `add_role` rule | 0.5 | 5 category-specific role templates. Prepend to text |
| 4 | `add_context` rule | 0.5 | Build context from intent. Insert after role block |
| 5 | `structure_task` rule | 0.5 | Wrap text in task block with top keywords as focus areas |
| 6 | `add_constraints` rule | 0.5 | Category-specific constraint lists (base + category-specific) |
| 7 | `add_output_format` rule | 0.5 | Category + model specific format instructions |
| 8 | `improve_specificity` rule | 0.5 | Vague word replacement map |
| 9 | `add_quality_markers` rule | 0.5 | Quality requirements for medium/complex prompts |
| 10 | Merger | 0.5 | Extract sections from learned prompts, append missing ones |
| 11 | Testing all rules with sample inputs | 0.5 | Verify each rule produces correct output per model |

---

## Component 1: Model Adapter

### What It Does

A single function that wraps a label + content block in the correct format for the target model.

### Formatting Per Target

| Target | Format | Example |
|---|---|---|
| `claude` | XML tags | `<role>\nYou are a senior engineer.\n</role>` |
| `gpt` | Markdown H2 | `## Role\nYou are a senior engineer.` |
| `general` | Brackets | `[ROLE]\nYou are a senior engineer.` |

### Function Signature

```typescript
wrapSection(label: string, content: string, target: TargetModel): string
```

### Why a Separate File

Every rule calls `wrapSection()`. If it lived inside rule-engine.ts, it would be buried. As a separate 10-line file, it's:
- Importable independently (merger also uses section detection that mirrors this format)
- Testable in isolation
- Single responsibility

---

## Component 2: Rule Engine Core

### What It Does

Accepts the full rule set + learned weights → sorts rules by weight → checks each rule's condition → applies matching rules in sequence → returns the transformed text + list of applied rule IDs.

### Algorithm

```
1. Build weightMap from LearnedWeight[] → Map<ruleId, weight>
2. Sort rules by weight DESC (highest weight = runs first)
   - If no weight found for a rule → default weight 1.0
3. For each sorted rule:
   a. Check: rule.condition(analysis) → boolean
   b. If true → result = rule.apply(result, analysis, targetModel)
   c. Track rule ID in appliedRules[]
4. Return { result, appliedRules }
```

### Why Weight-Based Sorting Matters

Without weights, rules always run in definition order (add_role → add_context → ...). With weights:

| Scenario | Effect |
|---|---|
| Day 1 (all weights = 1.0) | Rules run in definition order |
| After 100 ratings on coding prompts | `add_constraints` weight = 1.8 → runs BEFORE `add_role` (1.5) |
| After weight decay | All weights drift toward 1.0 → back to near-default order |

The engine **adapts rule priority per category** based on what users rate highly. This is the core learning mechanism.

### Why Sequential (Not Parallel)

Each rule transforms the text. Rule N's output is Rule N+1's input. They must run in sequence:

```
"write a sort function"
  → add_role    → "<role>...</role>\n\nwrite a sort function"
  → add_context → "<role>...</role>\n\n<context>...</context>\n\nwrite a sort function"
  → structure_task → "<role>...</role>\n\n<context>...</context>\n\n<task>...</task>"
```

If they ran in parallel, each rule would only see the original text and their outputs would conflict.

### Exports

| Export | Signature | Purpose |
|---|---|---|
| `RuleEngine.apply()` | `(text, analysis, target, weights?) → { result, appliedRules }` | Run all matching rules |
| `RuleEngine.getRuleIds()` | `() → string[]` | List all rule IDs (for weight initialization) |

---

## Component 3: The 7 Rules

### Rule Interface

Every rule follows the same contract:

```typescript
interface TransformRule {
  id: string;                   // unique identifier, e.g. "add_role"
  name: string;                 // human readable, e.g. "Add Role"
  element: PromptElement;       // which gap it addresses
  condition: (analysis: AnalysisResult) => boolean;  // when to fire
  apply: (text: string, analysis: AnalysisResult, target: TargetModel) => string; // how to transform
}
```

---

### Rule 1: `add_role`

**Element:** `role`
**Condition:** `gaps.role !== 'ok'` (fires on `missing` or `weak`)
**Action:** Prepend a category-specific role template to the text.

**Role templates:**

| Category | Template |
|---|---|
| coding | "You are a senior software engineer with deep expertise in clean code and best practices." |
| writing | "You are a professional content writer with expertise in clear, engaging communication." |
| analysis | "You are a data analyst specializing in extracting actionable insights from information." |
| marketing | "You are a senior marketing strategist with expertise in digital marketing and copywriting." |
| general | "You are a helpful and knowledgeable assistant." |

**Output example (Claude target):**
```xml
<role>
You are a senior software engineer with deep expertise in clean code and best practices.
</role>

write me a function that sorts an array
```

**Why category-specific:** "You are a helpful assistant" is too generic. A coding prompt needs an engineer persona. A marketing prompt needs a strategist. The role sets the expertise level and perspective for the entire response.

---

### Rule 2: `add_context`

**Element:** `context`
**Condition:** `gaps.context === 'missing'` (only fires on fully missing, not weak)
**Action:** Build a context section from the detected category + intent. Insert after the role block if it exists.

**Template:**
```
The user needs help with a {category} task. Their core intent: {intent}.
```

**Insertion logic:**
1. Check if text already has a role block (`</role>`, `## Role`, or `[ROLE]`)
2. If yes → insert context immediately after the role block
3. If no → prepend context before everything

**Why only on `missing`, not `weak`:** If the user already wrote some context (even weak), adding auto-generated context would conflict with or duplicate what they wrote. Better to leave weak context alone.

---

### Rule 3: `structure_task`

**Element:** `task`
**Condition:** `gaps.task !== 'ok'` (fires on `missing` or `weak`)
**Action:** Wrap the entire user text in a task block with top keywords as focus areas.

**Template:**
```
Your task: {original user text}

Key focus areas: {top 5 keywords joined by ", "}
```

**Important:** This rule REPLACES the raw text with a structured version. The original text becomes the content inside the task block, not a standalone sentence anymore.

**Output example (GPT target):**
```markdown
## Task
Your task: write me a function that sorts an array

Key focus areas: write, sort, function, array
```

---

### Rule 4: `add_constraints`

**Element:** `constraints`
**Condition:** `gaps.constraints !== 'ok'`
**Action:** Append category-specific constraints to the text.

**Constraint sets:**

| Category | Base (always) | Category-specific |
|---|---|---|
| All | "Do NOT include unnecessary filler or preamble.", "Be specific and actionable." | — |
| coding | — | "Do NOT use `any` type.", "Use strict TypeScript.", "Handle edge cases.", "No deprecated APIs." |
| writing | — | "Do NOT use clichés or generic phrases.", "Match the specified tone consistently.", "Keep paragraphs concise." |
| analysis | — | "Support claims with data.", "Present findings objectively.", "Include methodology if applicable." |
| marketing | — | "Focus on benefits, not features.", "Include a clear call to action.", "Target the specified audience." |
| general | — | (none) |

**Output:** Base constraints + category-specific constraints joined, each prefixed with `- `.

**Output example (Claude target):**
```xml
<constraints>
- Do NOT include unnecessary filler or preamble.
- Be specific and actionable.
- Do NOT use `any` type.
- Use strict TypeScript.
- Handle edge cases.
- No deprecated APIs.
</constraints>
```

---

### Rule 5: `add_output_format`

**Element:** `outputFormat`
**Condition:** `gaps.outputFormat !== 'ok'`
**Action:** Append output format instructions based on category + target model.

**Format templates:**

| Category | Format instruction |
|---|---|
| coding | "Respond with clean, well-typed code. Include brief inline comments only where logic is non-obvious." |
| writing | "Respond with polished prose. Use clear headings if the content has multiple sections." |
| analysis | "Respond with a structured analysis. Use sections: Summary, Findings, Recommendations." |
| marketing | "Respond with copy ready to publish. Include headline, body, and CTA." |
| general | "Respond clearly and concisely. Structure your response logically." |

**Model-specific additions:**

| Target | Appended |
|---|---|
| claude | "Wrap code blocks in appropriate language tags." |
| gpt | "Use markdown formatting." |
| general | (nothing extra) |

---

### Rule 6: `improve_specificity`

**Element:** `task`
**Condition:** `complexity === 'simple' AND rawScore < 5` (only fires on vague simple prompts)
**Action:** Replace vague/weak words with specific alternatives.

**Replacement map:**

| Vague word | Replacement |
|---|---|
| `good` | `high-quality, production-ready` |
| `nice` | `well-structured` |
| `simple` | `concise and maintainable` |
| `some` | `specific` |
| `stuff` | `components` |
| `thing(s)` | `element(s)` |
| `etc.` | (removed) |

**Example:**
```
Input:  "make me some good stuff for my thing"
Output: "make me specific high-quality, production-ready components for my element"
```

**Why only simple + low score:** Complex prompts are already specific enough (they have many keywords). This rule only helps the short, lazy prompts.

**Why regex replacement (not AI rewrite):** Deterministic, instant, no side effects. The replacements are conservative — they improve without changing meaning. An AI rewrite could hallucinate intent changes.

---

### Rule 7: `add_quality_markers`

**Element:** `constraints`
**Condition:** `complexity !== 'simple'` (fires on medium and complex only)
**Action:** Append quality requirements section.

**Quality templates:**

| Category | Quality markers |
|---|---|
| coding | "Ensure: type safety, error handling, edge cases covered, no unnecessary comments." |
| non-coding | "Ensure: accuracy, clarity, logical structure, no filler content." |

**Why only medium/complex:** Simple prompts ("sort an array") don't need quality markers — they'd be noise. Medium/complex prompts ("build a REST API with auth, validation, and tests") benefit from explicit quality expectations.

**Output example (general target):**
```
[QUALITY]
Ensure: type safety, error handling, edge cases covered, no unnecessary comments.
```

---

## Component 4: Merger

### What It Does

After the rule engine produces transformed text, the **Merger** (called by Phase 6, not Phase 4 directly) compares it with a high-scoring similar prompt from the past. If the learned prompt has sections the current output is missing, it appends them.

### Algorithm

```
1. Extract sections from learned prompt (detect XML tags, MD headers, brackets)
2. Extract sections from current prompt
3. For each section in learned that doesn't exist in current:
   → Append it to current
4. Return merged text
```

### Section Extraction

Three formats to detect:

| Format | Regex | Example |
|---|---|---|
| XML | `/<(\w+)>([\s\S]*?)<\/\1>/g` | `<examples>...</examples>` |
| Markdown | `/^## (\w+)\n([\s\S]*?)(?=\n## \|\n\[\|$)/gm` | `## Examples\n...` |
| Bracket | `/^\[([A-Z_]+)\]\n([\s\S]*?)(?=\n\[\|$)/gm` | `[EXAMPLES]\n...` |

### When Merger Runs

The merger is NOT called by the rule engine. It's called by the Agent Engine (Phase 6) AFTER the rule engine returns:

```
Rule Engine output → Merger.merge(ruleOutput, learnedPrompt) → Final output
```

**Condition to merge:** The learner found a similar prompt with `score ≥ 8` AND `similarity > 0.5`. If no match → merger is skipped entirely.

### Why Merger Is Separate From Rules

Rules are generic (same for all inputs). The merger is specific (uses a particular past prompt). Mixing them would make rules non-deterministic — the same input could produce different outputs depending on what's in the DB. Keeping them separate means:
- Rules always produce the same output for the same input + weights
- Merger adds learned patterns on top
- You can debug rules independently from learned patterns

---

## How All 4 Components Connect

```
Phase 3 output (AnalysisResult)
    ↓
Model Adapter ← imported by all rules
    ↓
Rule Engine
    │
    ├── sort rules by learned weights
    ├── for each rule: condition? → apply (calls wrapSection)
    └── return { result, appliedRules }
    ↓
(Phase 6 calls Merger if similar prompt exists)
    ↓
Merger
    │
    ├── extract sections from learned prompt
    ├── extract sections from current
    └── append missing sections
    ↓
Final optimized prompt
```

---

## Full Transformation Example

**Input:**
```
text: "write me a function that sorts an array"
targetModel: "claude"
category: "coding"
complexity: "simple"
rawScore: 1
gaps: [role:missing, context:missing, task:weak, constraints:missing, format:missing, examples:missing]
weights: [add_constraints:1.8, add_role:1.5, ...]
```

**After all rules (execution order by weight):**

```xml
<role>
You are a senior software engineer with deep expertise in clean code and best practices.
</role>

<context>
The user needs help with a coding task. Their core intent: User wants to: write, sort, function, array.
</context>

<task>
Your task: write me a function that sorts an array

Key focus areas: write, sort, function, array
</task>

<constraints>
- Do NOT include unnecessary filler or preamble.
- Be specific and actionable.
- Do NOT use `any` type.
- Use strict TypeScript.
- Handle edge cases.
- No deprecated APIs.
</constraints>

<output_format>
Respond with clean, well-typed code. Include brief inline comments only where logic is non-obvious.
Wrap code blocks in appropriate language tags.
</output_format>
```

**Rules applied:** `["add_constraints", "add_role", "add_context", "structure_task", "add_output_format", "improve_specificity"]`

**Same input with `targetModel: "gpt"`:**

```markdown
## Role
You are a senior software engineer with deep expertise in clean code and best practices.

## Context
The user needs help with a coding task. Their core intent: User wants to: write, sort, function, array.

## Task
Your task: write me a function that sorts an array

Key focus areas: write, sort, function, array

## Constraints
- Do NOT include unnecessary filler or preamble.
- Be specific and actionable.
- Do NOT use `any` type.
- Use strict TypeScript.
- Handle edge cases.
- No deprecated APIs.

## Output_format
Respond with clean, well-typed code. Include brief inline comments only where logic is non-obvious.
Use markdown formatting.
```

---

## Test Cases

### Rule Engine Core

| Test | Input | Expected |
|---|---|---|
| No rules match | All gaps = ok, complexity = simple, score = 10 | Return original text unchanged, appliedRules = [] |
| All rules match | All gaps = missing, complexity = medium, score = 1 | All 7 rules fire, text fully structured |
| Weight sorting | Rule A weight 2.0, Rule B weight 1.0 | Rule A fires before Rule B |
| Default weight | Rule with no learned weight | Uses 1.0 as default |

### Individual Rules

| Rule | Input | Expected output contains |
|---|---|---|
| add_role (claude) | coding prompt, role:missing | `<role>You are a senior software engineer` |
| add_role (gpt) | coding prompt, role:missing | `## Role\nYou are a senior software engineer` |
| add_context | context:missing, intent="write, sort" | `coding task. Their core intent: User wants to: write, sort` |
| add_context skip | context:weak | Rule does NOT fire (only fires on missing) |
| structure_task | task:weak, keywords=["write","sort"] | `Your task:` + `Key focus areas: write, sort` |
| add_constraints | coding, constraints:missing | Contains "Do NOT use `any` type" |
| add_constraints | writing, constraints:missing | Contains "Do NOT use clichés" |
| add_output_format (claude) | coding, format:missing | Contains "Wrap code blocks in appropriate language tags" |
| add_output_format (gpt) | coding, format:missing | Contains "Use markdown formatting" |
| improve_specificity | simple, score=2, text="make good stuff" | "make high-quality, production-ready components" |
| improve_specificity skip | medium, score=2 | Rule does NOT fire (only simple) |
| improve_specificity skip | simple, score=6 | Rule does NOT fire (score ≥ 5) |
| add_quality_markers | coding, medium | Contains "type safety, error handling" |
| add_quality_markers | writing, complex | Contains "accuracy, clarity, logical structure" |
| add_quality_markers skip | coding, simple | Rule does NOT fire |

### Model Adapter

| Label | Content | Target | Expected |
|---|---|---|---|
| "role" | "You are an expert." | claude | `<role>\nYou are an expert.\n</role>` |
| "role" | "You are an expert." | gpt | `## Role\nYou are an expert.` |
| "role" | "You are an expert." | general | `[ROLE]\nYou are an expert.` |

### Merger

| Current sections | Learned sections | Expected merge |
|---|---|---|
| role, task, constraints | role, task, constraints, examples | Current + examples appended |
| role, task | role, context, task, constraints, format | Current + context + constraints + format appended |
| role, task, constraints, format, examples | role, task | No change (current already has more) |

---

## Design Decisions

### Why 7 rules and not more?

These 7 cover the 6 prompt elements from Phase 3 (role, context, task, constraints, outputFormat, examples) plus a cross-cutting quality marker. Every element the Gap Scorer detects has a corresponding rule to fix it.

**Missing:** There's no `add_examples` rule. Why? Auto-generating examples requires understanding the task deeply — something a rule engine can't do reliably. Examples are left as a "suggestion" in the output. Future: an AI-powered rule could generate examples as a premium feature.

### Why templates are hardcoded, not from DB?

- Rules change with code deploys, not at runtime
- Template strings are short (~20 words each) — not worth a DB round-trip
- **Future:** If users can create custom templates → load from `templates` collection. But that's a v2 feature.

### Why `improve_specificity` uses regex replacement, not AI?

- Deterministic: same input → same output
- Instant: <0.1ms
- No side effects: never changes meaning, only makes it more precise
- **Tradeoff:** Limited vocabulary (7 replacements). But these 7 cover the most common vague words. Add more as data shows patterns.

### Why merger is a separate class from rule engine?

- **Rule engine:** deterministic transform based on gaps. Same input + weights → same output.
- **Merger:** data-dependent. Output depends on what's in the DB (past prompts). Non-deterministic.
- Separating them means you can test/debug rules without DB, and merger failures don't break rule transforms.

---

## What Phase 4 Outputs

Used by:

| Consumer | What it uses | Why |
|---|---|---|
| **Phase 5 — Learner** | `appliedRules[]` from engine output | Stored in prompt_history. Used to boost/penalize rule weights on feedback |
| **Phase 6 — Agent Engine** | Full pipeline: calls rule-engine.apply() → then merger.merge() → produces final output |
| **Phase 6** | `RuleEngine.getRuleIds()` | For weight initialization (seed script) |
| **API Response** | `appliedRules[]` | Returned to user for transparency |

---

## Verification Checklist

After Phase 4 is coded:

- [ ] Model adapter produces correct format for all 3 targets (XML, MD, bracket)
- [ ] Rule engine sorts by weight DESC (verified with custom weights)
- [ ] Rule engine applies rules sequentially (each rule sees previous rule's output)
- [ ] Rule engine skips rules whose condition returns false
- [ ] Rule engine returns correct `appliedRules[]` list
- [ ] All 7 rules fire when their conditions are met
- [ ] Each rule produces output in the correct target model format
- [ ] `add_role` prepends (doesn't append)
- [ ] `add_context` inserts after role (not at start, not at end)
- [ ] `add_context` only fires on `missing`, not on `weak`
- [ ] `structure_task` wraps original text, doesn't duplicate it
- [ ] `add_constraints` includes base + category-specific constraints
- [ ] `add_output_format` adds model-specific suffix (Claude: code tags, GPT: markdown)
- [ ] `improve_specificity` only fires on `simple + score < 5`
- [ ] `add_quality_markers` only fires on `medium` or `complex`
- [ ] Merger extracts sections from all 3 formats (XML, MD, bracket)
- [ ] Merger only appends sections that don't already exist in current
- [ ] Merger doesn't duplicate or overwrite existing sections
- [ ] `getRuleIds()` returns all 7 IDs
- [ ] No database imports in rule-engine.ts or model-adapter.ts (pure logic)
- [ ] Merger has no DB imports (receives learned text as parameter)

---

## Next: Phase 5

Phase 5 builds the Learner — the MongoDB-powered component that searches for similar past prompts, loads learned weights, records results, and updates weights from user feedback. This is what makes the engine smarter over time.
