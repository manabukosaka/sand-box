# Sports Motion App

日本語版は下にあります。

Sports Motion App is an installable mobile-app product in progress. The current
implementation is a dependency-free PWA prototype plus domain-model tests for
the baseball pitching MVP.

## Current Prototype

- `app/`: mobile-first PWA prototype for capture, metrics, ROM recalculation, and
  external sharing flows.
- `src/domain.mjs`: MVP domain model and analysis/ROM mock logic.
- `src/mockApi.mjs`: local mock API that follows the MVP contract and persists
  prototype state in browser storage.
- `tests/`: Node test coverage for athlete creation, ROM versioning, and
  raw-versus-adjusted analysis separation.
- `docs/`: requirements, architecture, API contract, evidence metrics, project
  plan, V&V checklist, and ADR.

## Commands

```bash
npm test
npm run serve
```

`npm run serve` starts a local static server on port 4173. Open
`http://127.0.0.1:4173/app/`.

The prototype supports English and Japanese. Use the language switch in the app
header to change display language. Domain IDs and API-facing values stay in
English so they remain stable across locales.

## Boundary

This product is separate from Mini Datadog. Shared Codex harness rules live in
`.agents/docs/product-boundaries.md`.

## 日本語

Sports Motion App は、インストール型モバイルアプリとして開発中のプロダクトです。現在は、野球投球MVP向けの依存ゼロPWAプロトタイプと、ドメインモデルのテストを実装しています。

## 現在のプロトタイプ

- `app/`: 撮影、指標、ROM再計算、外部共有フローを確認するモバイルファーストPWAプロトタイプ。
- `src/domain.mjs`: MVPのドメインモデルと解析/ROMのモックロジック。
- `src/mockApi.mjs`: MVP契約に沿ったローカルモックAPI。ブラウザストレージへプロトタイプ状態を保存します。
- `tests/`: 選手作成、ROM versioning、raw値と補正値の分離を確認するNodeテスト。
- `docs/`: 要求、アーキテクチャ、API契約、エビデンス指標、プロジェクト計画、V&Vチェックリスト、ADR。

## コマンド

```bash
npm test
npm run serve
```

`npm run serve` は port 4173 でローカル静的サーバーを起動します。
`http://127.0.0.1:4173/app/` を開いてください。

プロトタイプは英語と日本語の表示に対応しています。アプリ上部の言語切替で表示言語を変更できます。ドメインIDやAPI向けの値は、localeに依存しないよう英語のまま保持します。

## 境界

このプロダクトは Mini Datadog とは別プロダクトです。共有Codex harnessのルールは `.agents/docs/product-boundaries.md` にあります。
