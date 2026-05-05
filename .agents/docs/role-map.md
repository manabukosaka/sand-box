# ロールマップ

role perspective は、焦点を絞った review lens として使う。これは Gemini agent ではなく、Codex sub-agent delegation を意味しない。

## ロール

Mini Datadog 向けの既存 role perspective:

- Product Manager: user value、scope、requirements、acceptance criteria、non-functional needs を明確化する。
- Software Architect: boundary、contract、ADR、storage choice、security posture、maintainability tradeoff を定義する。
- Senior Engineer: 既存 pattern、type safety、focused tests に沿って Rust / TypeScript 変更を実装する。
- QA Engineer: normal、boundary、failure、integration、E2E、regression risk 向けの deterministic tests を設計する。
- Release Manager: 仕様適合性を検証し、ユーザー意図の妥当性を確認し、証跡を要約し、release readiness を管理する。
- Agile Coach: phase flow、risk、blocker、handoff、delivery reporting を調整する。
- Security Researcher: auth、input validation、secret、dependency risk、OWASP 系 issue を非侵襲的に review する。
- DB Tuner: DuckDB ingestion、query plan、retention、file growth、migration / recovery risk を review する。
- SRE Specialist: Linux、Docker、resource limit、startup、shutdown、observability、SLO、recovery を review する。

Sports Motion App 向けの追加 role perspective:

- Sports Motion Product: sports-motion-app の user value、MVP scope、ROM 後処理、外部共有、受け入れ基準を明確化する。
- Sports Biomechanics Analyst: 野球投球 biomechanics、AI markerless tracking、ROM、MetricDefinition、文献エビデンスの妥当性を review する。
- Sports Mobile Architect: iOS/Android app、cloud analysis、worker、API contract、sharing、ADR の境界を設計する。

## 引き継ぎ

- scope が曖昧な場合は、design の前に requirements を固める。
- 対象プロダクトが曖昧な場合は、`.agents/docs/product-boundaries.md` を読み、Mini Datadog と Sports Motion App のどちらへ反映するか確認する。
- architecture、storage、API、security、deployment、performance に関する重要判断は、implementation の前に ADR を作る。
- release readiness の前に tests を確認する。
- final delivery または PR reporting の前に V&V を行う。

## 委譲

- Codex sub-agent は、ユーザーが sub-agent、delegation、parallel agent work を明示的に求めた場合だけ使う。
- それ以外は role perspective を local に適用し、作業を進める。
- 明示的な委譲依頼がある場合、role perspective は `sub-agent-harness.md` に従って bounded sub-agent task に昇格できる。
- Product Manager: 要件、受け入れ基準、スコープ外の整理を委譲できる。
- Software Architect: ADR 要否、API / DB / security boundary、代替案比較を委譲できる。
- Senior Engineer: disjoint write scope が明確な実装を委譲できる。
- QA Engineer: test plan、regression matrix、manual / E2E evidence の整理を委譲できる。
- Release Manager: V&V、PR readiness、rollback note の整理を委譲できる。
- Security Researcher、DB Tuner、SRE Specialist: auth、DuckDB、deployment など高リスク領域の専門 review を委譲できる。
