# MCP Guidance

Use MCP only when it removes a real manual loop.

## Good Candidates

- External context changes frequently.
- The source of truth lives outside the repository.
- Codex should use a tool repeatedly instead of relying on pasted text.
- Multiple users or projects need the same integration.

## Current Policy

- Prefer repository-visible docs, scripts, tests, and logs first.
- Add one or two MCP servers only after a repeated workflow proves the need.
- For OpenAI documentation, prefer the official OpenAI docs MCP when available; otherwise restrict browsing to official OpenAI domains.
- Do not wire in broad tool access just because it exists.

## Candidate Integrations

- GitHub PR and CI context.
- Issue tracker or planning system context.
- Local observability logs and metrics when Mini Datadog runtime workflows need it.
