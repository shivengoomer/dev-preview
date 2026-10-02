# DevPreview — Security Rules

DevPreview exposes a local application to the public internet.

Treat this as a security-sensitive product.

## Never Expose

Never intentionally expose:

```text
.env
.git/
SSH
local databases
arbitrary filesystem paths
other localhost ports
process environment
credentials
private keys
```

The selected port is the only intended target.

## Secrets

Never log:

```text
API keys
JWT secrets
database credentials
AWS credentials
tokens
passwords
environment variables
```

When debugging, redact sensitive values.

## Public URLs

Assume every generated preview URL is public.

Do not treat:

```text
https://abc.trycloudflare.com
```

as private.

## Authentication

MVP:

* no mandatory account
* no mandatory authentication

Future protected previews should support:

```text
password
token
access control
```

Do not implement authentication by inventing insecure URL/query-token schemes without documenting the threat model.

## Tunnel Lifecycle

Stop tunnels when:

```text
Ctrl+C
SIGTERM
SIGINT
fatal CLI error
```

Do not leave background tunnel processes running.

## Dependency Security

Avoid unnecessary dependencies.

Review dependencies before adding them.

Do not execute arbitrary downloaded binaries without validating the installation/update mechanism.

## Security Principle

The safest default is:

> expose exactly one developer-selected local service, for exactly as long as the preview is running, and nothing else.
