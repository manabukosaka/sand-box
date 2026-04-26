# ADR 0003: フロントエンドアーキテクチャの選定 (Frontend Architecture)

## 1. コンテキストと課題 (Context & Problem Statement)
Mini Datadog の Web UI を構築するためのフロントエンドフレームワークとビルド戦略を選定する。
重要な制約として、「バックエンド（Rust）とフロントエンドを統合し、最終的に単一の実行バイナリとして配布可能にすること」がある。

## 2. 評価基準 (Decision Criteria)
1. **単一バイナリ化の容易さ (Single Binary Ease):** ビルド成果物（HTML/JS/CSS）を Rust バイナリに埋め込む際の簡潔さ。
2. **開発体験 (Developer Experience):** HMR (Hot Module Replacement)、型安全、エコシステムの充実度。
3. **パフォーマンス (Performance):** 初回読み込み速度、インタラクションのレスポンス。
4. **複雑さの回避 (Minimal Complexity):** サーバーサイドレンダリング (SSR) の必要性と、それによる運用コストの増加。

## 3. 比較候補 (Alternatives)

### A. Next.js (App Router / Pages Router)
- **概要:** React ベースのフルスタックフレームワーク。
- **メリット:** 
  - ルーティング、最適化、データフェッチのパターンが確立されている。
  - サーバーサイドの処理も一貫して書ける。
- **デメリット:** 
  - 本来は Node.js サーバーでの動作を前提としており、Rust と統合するには `output: 'export'` による静的サイト生成 (SSG) が必須となる。
  - SSG モードでは Next.js の強力な機能（Dynamic SSR, API Routes など）の多くが制限される。
  - ビルドプロセスが重くなりがち。

### B. Vite + React (SPA)
- **概要:** 高速なビルドツール Vite を用いた、シンプルなシングルページアプリケーション (SPA)。
- **メリット:**
  - ビルド成果物が単純な静的ファイル（`index.html` + `assets/`）であり、Rust の `include_bytes!` や `rust-embed` クレートを用いてバイナリに埋め込むのが極めて容易。
  - 開発時の起動が圧倒的に高速。
  - サーバーサイドのロジックは全て Rust API に寄せる設計（API-driven）と相性が良い。
- **デメリット:**
  - SEO や初期表示速度の最適化（SSR）が必要な場合には不向き（ただし、今回の「監視ツール」という用途では SEO は不要）。

## 4. 意思決定 (Decision)

**採用案: B. Vite + React (SPA)**

**選定理由:**
1. **単一バイナリへの最適性:** 監視ツールというプロダクトの性質上、SEO は不要であり、複雑な SSR よりも「1つの実行ファイルで完結する」というポータビリティを最優先する。Vite の出力する純粋な静的ファイル群は Rust との親和性が最も高い。
2. **関心の分離:** フロントエンドは UI とデータの可視化に専念し、ビジネスロジックやデータ集計は強力な Rust バックエンドで行うという明確な役割分担が可能になる。
3. **軽量さ:** Next.js ほどの重厚なフレームワーク機能は必要なく、Vite のスピードと React の柔軟性で十分要件を満たせる。

## 5. 影響と次のアクション (Consequences & Next Actions)

- **影響:**
  - ルーティングは `react-router-dom` 等のクライアントサイドルーティングを使用する。
  - バックエンド API との型共有（TypeScript <-> Rust）を容易にするため、OpenAPI ツールや `ts-rs` などのクレートの利用を検討する。
- **今後のアクション:**
  - `web/` ディレクトリに Vite + React (TypeScript) のプロジェクトを作成する。
  - Rust 側で静的ファイルを配信するための `tower-http` 等の設定を検証する。
