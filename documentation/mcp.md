# MCP server

Strapi ships a built-in [Model Context Protocol](https://modelcontextprotocol.io) server since v5.47.0. It exposes content types as MCP tools, so AI clients (OpenCode, Claude Code, Cursor, or any Streamable HTTP client) can read and write content without going through the admin panel.

This repo runs Strapi 5.52.2 and enables the server behind the `MCP_ENABLED` environment variable. It is **off by default**, and every request is authenticated with an [Admin token](#admin-tokens).

## Table of contents

- [How it works](#how-it-works)
- [Enabling the server](#enabling-the-server)
- [Admin tokens](#admin-tokens)
  - [Creating a token in the admin panel](#creating-a-token-in-the-admin-panel)
  - [Creating a token through the API](#creating-a-token-through-the-api)
- [Connecting a client](#connecting-a-client)
  - [OpenCode](#opencode)
  - [Other clients](#other-clients)
- [Environments](#environments)
- [Available tools](#available-tools)
- [Verifying](#verifying)
- [Limitations](#limitations)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## How it works

The server is built into Strapi core, not a plugin or an npm package. Content-type tools are registered by the Content Manager plugin, and other plugins can register their own. When enabled it listens on `/mcp` and speaks MCP over Streamable HTTP:

| Property | Value |
| :--- | :--- |
| Endpoint | `<base URL>/mcp` |
| Transport | Streamable HTTP |
| Allowed method | `POST` only (`GET` returns `405` with a JSON-RPC `-32601`) |
| Authentication | `Authorization: Bearer <admin token>` |
| State | Stateless — every request is authenticated and permission-checked independently |

Tools are generated from the content-type schemas at boot and filtered by the token's permissions. A token without `read` on a content type does not see the tools for it at all.

## Enabling the server

The server is gated in `config/server.js`:

```js
module.exports = ({ env }) => ({
  // ...
  mcp: {
    enabled: env.bool("MCP_ENABLED", false),
  },
});
```

Set the flag per environment:

| Environment | Where |
| :--- | :--- |
| Local | `MCP_ENABLED=true` in `.env` (`.env.example` documents the default) |
| Staging / production | `MCP_ENABLED=true` as an environment variable in the Coolify app, then restart the app |

The default is `false`, so deploying the code without the flag changes nothing. The flag is the switch, not the deploy. Coolify does not hot-reload environment variables — restart or redeploy after changing it.

Optional timeouts can be added to the same block:

```js
mcp: {
  enabled: env.bool("MCP_ENABLED", false),
  connectTimeoutMs: 5000,   // default 5_000
  requestTimeoutMs: 60000,  // default 60_000
},
```

## Admin tokens

The MCP server only accepts **Admin tokens**. Content API tokens are a different kind and are rejected with `401`, even if they have full access. Admin tokens are stored in the same database table as API tokens, differentiated by `kind`.

| | Admin token | API token |
| :--- | :--- | :--- |
| `kind` | `admin` | `content-api` |
| Authenticates | `/admin/*` and `/mcp` | `/api/*` |
| Created in | Settings → Administration Panel → Admin Tokens | Settings → API Tokens |
| Works with MCP | Yes | No |

Each environment has its own database, so each environment needs its own token. A token created locally does not exist on staging or production.

### Creating a token in the admin panel

1. Open **Settings → Administration Panel → Admin Tokens**. This page requires the Super Admin role or the `admin::admin-tokens.create` permission.
2. Click **Create new Admin Token**.
3. Give it a name (unique per instance), an optional description, and a duration (`7`, `30`, `90` days or unlimited).
4. Grant **read** only on the content types the client should see.
5. Save and copy the value — it is shown only once.

Granting read on every content type generates roughly 2 tools per collection type and 1 per single type (around 40 tools for this schema). Keep the scope small: fewer tools means less context, and it keeps personal data out of reach.

> **Personal data:** `api::member.member` and `plugin::users-permissions.user` contain personal data. Leave them out unless the client genuinely needs them.

### Creating a token through the API

Admin tokens can be created programmatically with an admin JWT:

```sh
# 1. Log in to get an admin JWT
JWT=$(curl -s -X POST "$STRAPI_URL/admin/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"...","password":"..."}' | jq -r .data.token)

# 2. Create the token
curl -s -X POST "$STRAPI_URL/admin/admin-tokens" \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "OpenCode prod",
    "description": "Read-only MCP client",
    "lifespan": null,
    "adminPermissions": [
      { "action": "plugin::content-manager.explorer.read", "subject": "api::article.article" },
      { "action": "plugin::content-manager.explorer.read", "subject": "api::event.event" },
      { "action": "plugin::content-manager.explorer.read", "subject": "api::activity.activity" }
    ]
  }'
```

The response contains the plaintext `accessKey` once. Notes:

- The field is `adminPermissions`. Sending `permissions` or `type` is rejected by the controller.
- `lifespan` is in milliseconds: `604800000` (7 days), `2592000000` (30 days), `7776000000` (90 days), or `null` for unlimited.
- The token's permissions can never exceed the creating user's own permissions.
- The read action is `plugin::content-manager.explorer.read` with the content type UID as `subject`.

## Connecting a client

### OpenCode

The repo-level [`opencode.json`](/opencode.json) declares three servers under `mcp.servers`. All three carry `"disabled": true`, so a fresh clone does not try to connect; remove the field (or set it to `false`) for the one environment you want to use.

```json
{
  "mcp": {
    "servers": {
      "strapi": {
        "type": "remote",
        "url": "http://localhost:1337/mcp",
        "oauth": false,
        "disabled": true,
        "headers": { "Authorization": "Bearer {env:STRAPI_ADMIN_TOKEN}" }
      }
    }
  }
}
```

| Server | URL | Environment variable |
| :--- | :--- | :--- |
| `strapi` | `http://localhost:1337/mcp` | `STRAPI_ADMIN_TOKEN` |
| `strapi_staging` | `https://staging.admin.scoutinglommel.be/mcp` | `STRAPI_STAGING_ADMIN_TOKEN` |
| `strapi_prod` | `https://admin.scoutinglommel.be/mcp` | `STRAPI_PROD_ADMIN_TOKEN` |

Export the matching token, enable the server, and check the connection:

```sh
export STRAPI_ADMIN_TOKEN='...'
opencode mcp list
```

`✓ strapi connected` means it works. `○ strapi disabled` means the `disabled` field is still set. `✗ strapi failed: ... 401` means the token is missing or invalid.

`oauth` must be `false`: OpenCode enables OAuth by default for remote servers, and Strapi's endpoint does not implement it. OpenCode stores remote-server credentials outside the config, but this server uses a header, so the token lives only in the environment.

Configuration is hot-reloaded, so saving the file is enough to connect or disconnect a server (`/reload` forces it). Environment variables are different: the OpenCode background service reads them from the environment it was started with. If the service was already running when you exported the token, run `opencode service restart` from that shell.

Keep only one environment enabled at a time. Each enabled server adds its full tool list to the context, so enabling local and production together doubles it.

### Other clients

Any client that supports Streamable HTTP works:

```json
{
  "mcpServers": {
    "strapi": {
      "type": "streamable-http",
      "url": "http://localhost:1337/mcp",
      "headers": { "Authorization": "Bearer YOUR_ADMIN_TOKEN" }
    }
  }
}
```

For clients that only support stdio, bridge it with `mcp-remote`:

```sh
npx -y mcp-remote http://localhost:1337/mcp --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Environments

| Environment | MCP URL | Database | Enable with |
| :--- | :--- | :--- | :--- |
| Local | `http://localhost:1337/mcp` | Docker MySQL on `127.0.0.1:3307` | `MCP_ENABLED=true` in `.env` |
| Staging | `https://staging.admin.scoutinglommel.be/mcp` | Own MySQL database | `MCP_ENABLED=true` in the Coolify app |
| Production | `https://admin.scoutinglommel.be/mcp` | Own MySQL database | `MCP_ENABLED=true` in the Coolify app |

The three databases are separate. Token and content changes do not cross environments.

## Available tools

Tool names combine an action with a slug derived from the content type UID:

| Type | Tools |
| :--- | :--- |
| Collection type | `list_<slug>`, `get_<slug>`, plus `create_<slug>`, `update_<slug>`, `delete_<slug>`, `publish_<slug>`, `unpublish_<slug>`, `discard_<slug>_draft` when the token allows them |
| Single type | `get_<slug>`, `write_<slug>`, plus `delete_<slug>`, `publish_<slug>`, `unpublish_<slug>`, `discard_<slug>_draft` when the token allows them |

Examples: `list_article`, `get_home-page`, `update_event`, `plugin-users-permissions_user` for plugin content types.

The draft and publish tools only exist when Draft & Publish is enabled on the content type. Tools the token cannot use are not listed at all.

In development mode (`pnpm dev`, i.e. `autoReload` enabled) Strapi also registers a `log` tool that writes to the server console. It needs no admin permission and is absent in production.

## Verifying

With the server **disabled** (`MCP_ENABLED` unset or `false`):

```sh
curl -i http://localhost:1337/mcp                     # 404, Strapi NotFoundError
curl -i -X POST http://localhost:1337/mcp             # 405, plain text
```

With the server **enabled** but no token:

```sh
curl -s -X POST http://localhost:1337/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1.0.0"}}}'
# 401 {"jsonrpc":"2.0","error":{"code":-32000,"message":"Authentication required"},"id":null}
```

With a valid token, list the tools the token exposes:

```sh
curl -s -X POST http://localhost:1337/mcp \
  -H "Authorization: Bearer $STRAPI_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

If the response is empty for a content type you expected, the token is missing `read` on it.

## Limitations

As of Strapi 5.52.2:

- **No Media Library tools.** They were added in 5.54.0 (`media_list_assets`, `media_delete_assets`, …). This repo does not have them yet.
- **No media upload.** Media fields accept references to existing assets, but files cannot be uploaded over MCP.
- **Dynamic zones are untyped.** Components inside a dynamic zone are passed as untyped arrays, so the client does not know their structure.
- **No nested population.** `list_*` and `get_*` return relations as identity references (`documentId`, and `locale`/`status` where relevant), never as populated objects. There is no `populate` parameter.
- **Custom fields** are mapped to their underlying Strapi type.
- **Circular components** fall back to an open `record<string, unknown>` schema at the point of the cycle.
- **Audit logs** with `origin: mcp` require Strapi 5.52.0+ and an Enterprise plan. The Community plan does not record them.

## Security

- **Least privilege.** Give a token the smallest set of `read` permissions that still does the job. Do not create full-access Admin tokens.
- **Read-only for production.** Production content is public-facing; do not grant `create`, `update`, `delete`, or `publish` there.
- **One token per client per environment.** Revoking one does not affect the others.
- **Never commit tokens.** The OpenCode config reads them from environment variables; no token belongs in `opencode.json`, `.env.example`, or this document.
- **Rotate.** Admin tokens can be regenerated by their owner from the admin panel. Deactivating or deleting the owner immediately invalidates their tokens, and losing a permission re-clamps the token to the owner's new ceiling.
- **Permission changes apply on the next request.** The server is stateless, so there is no session to expire.
- **`/mcp` inherits the server's bind address.** This repo defaults `host` to `0.0.0.0`, so during local development the endpoint is reachable from your LAN, exactly like `/admin`. Set `HOST=127.0.0.1` in `.env` to restrict both.

## Troubleshooting

| Symptom | Cause |
| :--- | :--- |
| `GET /mcp` → `404` and `POST /mcp` → plain `405` | Server is disabled: `MCP_ENABLED` is not `true`, or the app was not restarted after setting it |
| `401 Authentication required` | Missing or invalid token, or a Content API token was used instead of an Admin token |
| Connected but no tools | The Admin token has no permissions granted |
| A specific content type is missing | The token lacks `read` on that content type UID |
| Client connects but tools fail after a permission change | Expected; each request is re-checked. Re-list the tools |
| OpenCode shows the server as failed with `401` | The token is not in the environment of the OpenCode background service. Export it, then `opencode service restart` |
| OpenCode shows `○ disabled` | `disabled: true` is still set on that entry in `opencode.json` |
| OpenCode tries an OAuth browser flow | `oauth: false` is missing from the server entry |

## References

- [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server)
- [Strapi Admin tokens](https://docs.strapi.io/cms/features/admin-tokens)
- [Strapi API tokens](https://docs.strapi.io/cms/features/api-tokens)
- [Model Context Protocol](https://modelcontextprotocol.io)
