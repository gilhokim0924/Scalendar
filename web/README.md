# Scalendar Web

React + Vite frontend for Scalendar, with optional Tauri desktop wrapper for macOS.

## Prerequisites

- Node.js 22.x recommended
- npm
- Rust toolchain (required for Tauri)
- Tauri CLI via Cargo: `cargo install tauri-cli --version "^2.0.0"`
- Xcode Command Line Tools (macOS desktop build)

## Run Web Only

```bash
cd web
npm ci
npm run dev
```

## Run as macOS Desktop App (Tauri)

```bash
cd web
npm ci
npm run tauri:dev
```

## Build macOS App Bundle

```bash
cd web
npm run tauri:build
```

Output location:

- `web/src-tauri/target/release/bundle/macos/`

## Notes

- Tauri config is in `web/src-tauri/tauri.conf.json`.
- Vite dev server runs on port `1420` for Tauri compatibility.
