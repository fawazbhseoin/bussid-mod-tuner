---
name: Bug report
about: Something does not work, or a mod does not open
title: ""
labels: bug
---

**What happened**
A short description. If a mod did not open, include the exact message the page showed.

**The mod**
Name and a link to where it came from. Please do not attach the mod file itself.

**Diagnostic output** (optional but very helpful)
```
strings -n 4 yourmod.bussidmod | grep -n -i -E "force|maxSpeed|maxRPM|tireFriction|ratio|shiftNextSpeed" | head -40
```

**Where you ran it**
- Browser and version (or "CLI"):
- Device (phone or computer):

**What you expected**
