# Gの部屋 星門シューティング MVP

Gの部屋の世界観を使った縦スクロールシューティング試作です。

総長を操作して、前方半円斬撃で敵を倒し、コインを拾い、ボスを倒すMVPとして制作しています。

## 現在実装済み

- タイトル画面
- ゲーム画面
- クリア画面
- ゲームオーバー画面
- PC操作：WASD / 矢印キー
- スマホ操作：ドラッグ移動
- 自動攻撃：前方半円斬撃
- 敵3種：小型敵 / 飛行敵 / 突進敵
- コインドロップと吸い寄せ回収
- HP制
- ボス戦
- 斬撃・ヒット・コイン回収演出

## 未実装/後続予定

- サポートキャラ
- 星門召喚
- サッグの鍛冶屋
- 武器ガチャ
- オーラ
- キャラ追加
- TCG/ポータル連携

## 開発コマンド

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Vercel設定

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## メモ

このプロジェクトは、Gの部屋TCGとは別の独立したViteプロジェクトです。

現時点では、TCG/ポータル連携、セーブ機能、課金要素、画像素材の本実装は含みません。
