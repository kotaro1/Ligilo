# Ligilo

中国語の単語を暗記するための、1人用フラッシュカードアプリです。スマホでもPCでも開け、ステータスや進捗は同期されます。

- 方向は「中国語→ピンイン」と「ピンイン→中国語」の2つ。めくると正解と意味が出ます
- 単語ごとに方向別のステータス（なし／易／難）を付けられます
- 章・ステータスで絞り込み、ランダム／順番で出題できます
- 単語一覧で絞り込み・検索・ピンインと意味の編集ができます
- 前回の出題の続きを、別の端末から再開できます
- めくると中国語の読み上げが流れます（ブラウザ内蔵の音声。右上で ON/OFF、端末ごとに記憶）
- PC ではキーボードで操作できます: `Space`/`Enter` でめくる・次へ、`←` `→` で前後、`1` `2` `3` でステータス（なし／易／難）、`R` でもう一度聞く、`Esc` でやめる。ホームでは `Enter` で出題を始める

用語は [GLOSSARY.md](GLOSSARY.md)、設計判断は [docs/adr](docs/adr) を参照してください。

## 技術スタック

Next.js（App Router）+ TypeScript + Tailwind CSS / Supabase（Postgres・Auth）/ Vercel / Vitest

## セットアップ

1. `npm install`
2. [supabase.com](https://supabase.com) で新しいプロジェクトを作り、SQL Editor で [`supabase/schema.sql`](supabase/schema.sql) を実行
3. Authentication で、自分のメールのユーザーを作成し、サインアップ（Allow new users to sign up）を無効にする。Site URL と Redirect URLs（`http://localhost:3000/**` と本番URL）を設定
4. `.env.local.example` を `.env.local` にコピーし、プロジェクトの URL と anon（publishable）キーを入力
5. `npm run dev` で起動し、メールのログインリンクでログイン

## 単語データ

単語データは公開リポジトリに入れません（[ADR 0001](docs/adr/0001-db-is-source-of-truth.md)）。`data/` は `.gitignore` 対象です。

1. スプレッドシートを CSV で書き出して `data/sheet.csv` に置く
2. ピンインと意味を `data/fill.tsv`（`汉语<TAB>ピンイン<TAB>意味[<TAB>1=要確認]`）に書く
3. `node scripts/make-seed.mjs` で `data/seed.sql` を生成
4. 一度ログインしてから、`data/seed.sql` を Supabase の SQL Editor で実行（既存の単語は上書きされません）

## テスト

```bash
npm test
```
