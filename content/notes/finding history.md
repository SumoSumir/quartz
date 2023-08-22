---
title: "Finding History"
tag: 
- CTF
- Vulns
- Found
aliases:
- Issues
enableToc: true
---

## CTF Flags
### Flag 1: CTF-j2XHEnfhLSBr6sfcxy4Fga1gUmyry65i

Severity: Informational

Description: CTF flag found in source code of homepage

POC :
1. Visit https://sumirbroota.com/ and click view source.
2. Flag is exposed in the href of 'a' tag
![Image:](Flag1.png)

Affected URL: https://sumirbroota.com/

Impact: It may have no impact as the flag is exposed intentionally but may refer to a similar real world scenario where sensitive data is exposed.

Recommendation: As this is an intentional exposure, but if referred to actual situations, sensitive data must not be exposed, preferably not in plaintext.

Finding by: [Kapil Varma](https://www.linkedin.com/in/kapilvarmapsy/) <br>
Congrats on the win !!!