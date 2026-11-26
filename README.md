# ENGL 010 Writing Tutor

A self-contained static HTML writing tutor for ENGL 010 Tasks 1–4.

## Run locally

Open `index.html` in a web browser.

## Cloudflare Worker

Deploy the folder as a Cloudflare Worker with assets. Add `OPENAI_API_KEY` as a Cloudflare secret. Optionally add `OPENAI_MODEL` as a normal variable.

The API key must never be placed in `index.html` or committed to GitHub.
