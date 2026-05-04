# ロールマップ

role perspective は、焦点を絞った review lens として使う。これは Gemini agent ではなく、Codex sub-agent delegation を意味しない。

## ロール

- Product Manager: user value、scope、requirements、acceptance criteria、non-functional needs を明確化する。
- Software Architect: boundary、contract、ADR、storage choice、security posture、maintainability tradeoff を定義する。
- Senior Engineer: 既存 pattern、type safety、focused tests に沿って Rust / TypeScript 変更を実装する。
- QA Engineer: normal、boundary、failure、integration、E2E、regression risk 向けの deterministic tests を設計する。
- Release Manager: 仕様適合性を検証し、ユーザー意図の妥当性を確認し、証跡を要約し、release readiness を管理する。
- Agile Coach: phase flow、risk、blocker、handoff、delivery reporting を調整する。
- Security Researcher: auth、input validation、secret、dependency risk、OWASP 系 issue を非侵襲的に review する。
- DB Tuner: DuckDB ingestion、query plan、retention、file growth、migration / recovery risk を review する。
- SRE Specialist: Linux、Docker、resource limit、startup、shutdown、observability、SLO、recovery を review する。

## 引き継ぎ

- scope が曖昧な場合は、design の前に requirements を固める。
- architecture、storage、API、security、deployment、performance に関する重要判断は、implementation の前に ADR を作る。
- release readiness の前に tests を確認する。
- final delivery または PR reporting の前に V&V を行う。

## 委譲

- Codex sub-agent は、ユーザーが sub-agent、delegation、parallel agent work を明示的に求めた場合だけ使う。
- それ以外は role perspective を local に適用し、作業を進める。
