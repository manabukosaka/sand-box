# 環境構築手順書 (Environment Setup Guide)

本ドキュメントは、Mini Datadog の開発に必要な実行環境の構築手順を記述します。

## 1. Rust 開発環境の構築

バックエンド開発には Rust ツールチェーンが必要です。公式が推奨する `rustup` を使用してインストールします。

### インストール手順
以下のコマンドを実行して Rust をインストールします。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

### パスの通し方
インストール完了後、現在のシェルに設定を反映させるには以下のコマンドを実行します。

```bash
. "$HOME/.cargo/env"
```

永続的に反映させるには、使用しているシェルの設定ファイル（`.bashrc` や `.zshrc`）に以下を追記します。

```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### インストールの確認
以下のコマンドでバージョンが表示されれば成功です。

```bash
cargo --version
rustc --version
```

## 2. フロントエンド開発環境の構築 (Node.js)

フロントエンド開発には Node.js と npm/yarn/pnpm が必要です。`nvm` (Node Version Manager) 等を用いたインストールを推奨します。

### インストールの確認
```bash
node --version
npm --version
```

---
*最終更新日: 2026-04-26*
