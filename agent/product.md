# DevPreview — Product Context

## One-Liner

> Share your localhost instantly.

## Problem

Developers frequently need to show unfinished work to:

* teammates
* clients
* designers
* managers
* testers
* interviewers

Existing workflows often require:

```text
Deploying
DNS
Cloud configuration
Git pushes
Preview environments
Manual tunnel setup
```

DevPreview should reduce this to:

```bash
npx devpreview
```

## Target User

Primary:

* web developers
* full-stack developers
* indie hackers
* startup teams
* students
* open-source contributors

## Core Job To Be Done

"When my app is running locally, I want to give someone a URL so they can open it without being on my machine/network."

## Product Personality

DevPreview should feel:

* fast
* technical
* clean
* lightweight
* trustworthy
* developer-native

Avoid:

* enterprise dashboard aesthetics
* unnecessary onboarding
* excessive animations
* marketing-heavy CLI output
* unnecessary configuration

## Product Hierarchy

### V1

```text
localhost
→ temporary URL
```

### V2

```text
localhost
→ temporary URL
→ request logs
```

### V3

```text
localhost
→ temporary URL
→ request logs
→ screenshots
→ feedback
```

### V4

```text
GitHub PR
→ preview
→ browser testing
→ feedback
```

Never build V3/V4 before V1 is reliable.
