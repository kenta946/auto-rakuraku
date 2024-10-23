const puppeteer = require('puppeteer');
require('dotenv').config();

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

let browser; // ブラウザをグローバル変数として管理
let page; // ページもグローバル変数として管理

async function initializeBrowser() {
    if (!browser) {
        console.log('ブラウザを起動中...');
        browser = await puppeteer.launch({
            headless: false, // 変更：ブラウザの可視化
            devtools: true, // DevToolsを開く
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
        page = await browser.newPage();
        console.log('新しいページを開きました。');
    }
}

async function login() {
    try {
        console.log('ログイン処理を開始します');
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login', { waitUntil: 'networkidle2' });
        await page.type('input[name="loginId"]', userId);
        await page.type('input[name="password"]', password);
        await page.click('button.v-btn.v-btn--contained.primary');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('ログイン完了');
    } catch (error) {
        console.error('ログインエラー:', error);
    }
}

async function performClock(action) {
    // 位置情報を偽装
    try {
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top', ['geolocation']);
        await page.setGeolocation({
            latitude: 34.67536300091403,  // キャリスタ緯度
            longitude: 135.49971632649746, // キャリスタの経度
        });
        console.log('位置情報を設定しました。');
    } catch (error) {
        console.error('位置情報設定エラー:', error);
    }
    await login(); // ログインを実行
    await page.click(action); // 出勤または退勤を実行
    console.log('処理が完了しました。');
}

// 毎分現在時刻をチェック
setInterval(async () => {
    const date = new Date();
    const currentHour = date.getUTCHours() + 9; // UTCを日本時間に変換
    const currentMinute = date.getUTCMinutes();

    await initializeBrowser(); // ブラウザを初期化

    if (currentHour === 9 && currentMinute === 0) {
        console.log('9時出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === 12 && currentMinute === 0) {
        console.log('12時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else if (currentHour === 13 && currentMinute === 0) {
        console.log('13時再出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === 18 && currentMinute === 0) {
        console.log('18時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else {
        console.log('時間外です。'); // 時間外の場合のメッセージ
    }
}, 60000); // 1分ごとにチェック
