# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: academic-hardening.spec.ts >> Academic Hardening Workflows >> should manage report templates
- Location: e2e/academic-hardening.spec.ts:12:9

# Error details

```
Error: browserContext.newPage: Executable doesn't exist at /home/gamp/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux
╔═════════════════════════════════════════════════════════════════╗
║ Video rendering requires ffmpeg binary.                         ║
║ Downloading it will not affect any of the system-wide settings. ║
║ Please run the following command:                               ║
║                                                                 ║
║     npx playwright install ffmpeg                               ║
║                                                                 ║
║ <3 Playwright Team                                              ║
╚═════════════════════════════════════════════════════════════════╝
```