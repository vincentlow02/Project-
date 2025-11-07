// ------------------ 字幕控制 ------------------

const WAIT_AFTER_GROUP = 1000;

export class SubtitleController {
  constructor(configs, container) {
    this.configs = configs;
    this.container = container;
    this.started = false;
    this.paused = false;
    this.currentGroup = 0;
    this.stage = 'idle';
    this.titleIndex = 0;
    this.descIndex = 0;
    this.currentTimeout = null;
    this.waitRemaining = WAIT_AFTER_GROUP;
    this.waitStart = null;
  }

  clearCurrentTimeout() {
    if (this.currentTimeout !== null) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  prepareCurrentGroup() {
    const group = this.configs[this.currentGroup];
    if (!group) return;

    this.container.innerHTML = '';

    const titleLine = document.createElement('div');
    titleLine.className = 'subtitle-line subtitle-title';
    const titleText = document.createElement('span');
    titleText.className = 'subtitle-text';
    const titleCursor = document.createElement('span');
    titleCursor.className = 'subtitle-cursor';
    titleCursor.textContent = '|';
    titleLine.append(titleText, titleCursor);

    const descLine = document.createElement('div');
    descLine.className = 'subtitle-line subtitle-description';
    const descText = document.createElement('span');
    descText.className = 'subtitle-text';
    const descCursor = document.createElement('span');
    descCursor.className = 'subtitle-cursor';
    descCursor.textContent = '|';
    descLine.append(descText, descCursor);

    this.container.append(titleLine, descLine);

    this.titleLine = titleLine;
    this.titleText = titleText;
    this.descLine = descLine;
    this.descText = descText;

    this.titleLine.classList.remove('is-complete', 'is-typing');
    this.descLine.classList.remove('is-complete', 'is-typing');

    this.titleText.textContent = '';
    this.descText.textContent = '';
  }

  start() {
    if (!this.configs.length) return;
    this.started = true;
    this.paused = false;
    this.currentGroup = 0;
    this.stage = 'title';
    this.titleIndex = 0;
    this.descIndex = 0;
    this.waitRemaining = WAIT_AFTER_GROUP;
    this.prepareCurrentGroup();
    this.scheduleNextStep();
  }

  pause() {
    if (!this.started || this.paused) return;
    this.paused = true;
    if (this.stage === 'wait' && this.waitStart) {
      const elapsed = Date.now() - this.waitStart;
      this.waitRemaining = Math.max(0, this.waitRemaining - elapsed);
    }
    this.clearCurrentTimeout();
  }

  resume() {
    if (!this.started || !this.paused) return;
    this.paused = false;
    if (this.stage === 'wait') {
      if (this.waitRemaining <= 0) {
        this.advanceGroup();
      } else {
        this.waitStart = Date.now();
        this.currentTimeout = setTimeout(() => this.advanceGroup(), this.waitRemaining);
      }
      return;
    }
    this.scheduleNextStep();
  }

  reset() {
    this.clearCurrentTimeout();
    this.started = false;
    this.paused = false;
    this.currentGroup = 0;
    this.stage = 'idle';
    this.titleIndex = 0;
    this.descIndex = 0;
    this.waitRemaining = WAIT_AFTER_GROUP;
    this.waitStart = null;
    if (this.container) {
       this.container.innerHTML = '';
    }
  }

  scheduleNextStep() {
    if (!this.started || this.paused) return;
    const group = this.configs[this.currentGroup];
    if (!group) return;

    if (this.stage === 'title') {
      this.titleLine.classList.add('is-typing');
      if (this.titleIndex < group.title.length) {
        this.titleText.textContent += group.title[this.titleIndex++];
        this.currentTimeout = setTimeout(() => this.scheduleNextStep(), group.titleSpeed);
      } else {
        this.titleLine.classList.replace('is-typing', 'is-complete');
        this.stage = 'description';
        this.scheduleNextStep();
      }
      return;
    }

    if (this.stage === 'description') {
      this.descLine.classList.add('is-typing');
      if (this.descIndex < group.description.length) {
        this.descText.textContent += group.description[this.descIndex++];
        this.currentTimeout = setTimeout(() => this.scheduleNextStep(), group.descSpeed);
      } else {
        this.descLine.classList.replace('is-typing', 'is-complete');
        this.stage = 'wait';
        this.waitRemaining = WAIT_AFTER_GROUP;
        this.waitStart = Date.now();
        this.currentTimeout = setTimeout(() => this.advanceGroup(), this.waitRemaining);
      }
    }
  }

  advanceGroup() {
    this.clearCurrentTimeout();
    if (!this.started || this.paused) return;
    this.currentGroup = (this.currentGroup + 1) % this.configs.length;
    this.stage = 'title';
    this.titleIndex = 0;
    this.descIndex = 0;
    this.waitRemaining = WAIT_AFTER_GROUP;
    this.waitStart = null;
    this.prepareCurrentGroup();
    this.scheduleNextStep();
  }
}

// 字幕配置数据
export const subtitleConfigs = [
  {
    title: '北海道冬の魅力：札幌＆小樽',
    description: '小樽は、北海道を代表する港町で、レトロな運河や石造りの倉庫群が魅力です。冬には雪に包まれた街並みがロマンチックな雰囲気を醸し出し、夜には大都市にも負けないイルミネーションとグルメが楽しめます。',
    titleSpeed: 28,
    descSpeed: 34,
  },
  {
    title: '船見坂',
    description: '映画『Love Letter』のロケ地。坂の上から港と街並みを一望できる。',
    titleSpeed: 28,
    descSpeed: 40,
  },
  {
    title: 'すすきの交差点',
    description: '札幌最大の繁華街すすきの。NIKKAのネオンが輝き、飲食店やショップが並ぶにぎやかな夜の街。',
    titleSpeed: 28,
    descSpeed: 30,
  },
  {
    title: '藻岩山の夜景',
    description: '藻岩山は「日本新三大夜景」の一つ。ロープウェイで登ると、札幌の街が宝石のように輝く絶景を望めます。',
    titleSpeed: 30,
    descSpeed: 41,
  },
  {
    title: '白い恋人ソフトクリーム',
    description: '北海道を代表するお土産。',
    titleSpeed: 28,
    descSpeed: 24,
  },
  {
    title: 'うな重',
    description: 'うな重は全国で親しまれる日本料理の一つ。',
    titleSpeed: 42,
    descSpeed: 70,
  },
  {
    title: 'ジンギスカン',
    description: '北海道名物のジンギスカン。ラム肉と野菜を特製鍋で焼き、タレと相性抜群の一品。',
    titleSpeed: 40,
    descSpeed: 50,
  },
  {
    title: '元祖さっぽろラーメン横丁',
    description: '札幌は味噌ラーメン発祥の地。ラーメン横丁には昭和の雰囲気の老舗が並び、熱々の一杯が楽しめます。',
    titleSpeed: 30,
    descSpeed: 30,
  },
  {
    title: '大通公園＆さっぽろテレビ塔',
    description: '札幌中心の大通公園は市民の憩いの場。冬はホワイトイルミネーションや雪まつりで街が彩られます。',
    titleSpeed: 37,
    descSpeed: 30,
  },
];