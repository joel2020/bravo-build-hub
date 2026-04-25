# Supabase MCP Setup Status

Date: 2026-04-25 (UTC)

## Requested steps

1. Attempted to add Supabase MCP server with:
   `codex mcp add supabase --url https://mcp.supabase.com/mcp?project_ref=ijkyeqetwzsaiqcecvqp&features=storage%2Cbranching%2Cfunctions%2Cdevelopment%2Cdebugging%2Cdatabase%2Caccount%2Cdocs`
2. Enabled remote MCP client support in `~/.codex/config.toml`:

```toml
[mcp]
remote_mcp_client_enabled = true
```

3. Attempted authentication with:
   `codex mcp login supabase`
4. Attempted optional skills install with:
   `npx skills add supabase/agent-skills`

## Outcome

- `codex` CLI is not installed in this environment (`codex: command not found`), so add/login/`/mcp` verification could not be completed here.
- `~/.codex/config.toml` was created and updated successfully.
- Skills install command failed with npm registry access/policy error (HTTP 403).
