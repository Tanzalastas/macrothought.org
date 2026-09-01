# macrothought.org

The public home of Macrothought: the site at [macrothought.org](https://macrothought.org) and the Macrothought skill pack for [Claude Code](https://claude.com/claude-code).

## The skill pack

Four departments, seventeen skills. Each department installs independently, so a project loads only what it needs. Every skill is distilled from methods in daily use on a working agent estate. Nothing in this pack is aspirational: if a skill describes a practice, that practice has shipped software.

```
/plugin marketplace add Tanzalastas/macrothought.org
/plugin install verification@macrothought
```

| Department | What it covers |
|---|---|
| `verification` | Checks that cannot fail, sabotage and positive controls, chart integrity, unknown versus zero, release gate design. |
| `second-brain` | Department-organized durable memory, evidence-gated triage of machine suggestions, confidence tagging, memory lint. |
| `decision-discipline` | The relentless design interview, doctrine compilation, verdict-first citation, a register of settled calls. |
| `orchestration` | Requirement ledgers, verify-audit-repair loops, context packs, hygiene for concurrent and long-running agents. |

Skills are addressed as `department:skill`, for example `verification:sabotage-and-positive-controls` or `orchestration:concurrent-agent-hygiene`. They also load themselves when a request lands in their territory.

The full list with descriptions: [skills.html](https://macrothought.org/skills.html).

## Why these four departments

Most agent failures we have seen are not model failures. They are checks that could never report failure, memory that silently rotted, decisions relitigated because nobody wrote them down, and fleets of agents stepping on each other. These departments encode what fixed each of those, with the scars documented.

The pack is free under MIT. The hosted Macrothought service builds on the same methods; the site has details.

## Credit

The department-plugin structure follows [headcount](https://github.com/cbrock84/headcount) by Chris Brock, which demonstrated the shape: a marketplace of independently installable departments. The skills here are original work.

## License

MIT. See [LICENSE](LICENSE).
