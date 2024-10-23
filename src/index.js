import puppeteer from 'puppeteer'; 
import dotenv from 'dotenv';
dotenv.config(); // dotenvをここで初期化

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

async function login(page) {    
    try {
        console.log('ログイン処理を開始します'); 
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login');
        await page.type('input[name="loginId"]', userId);
        await page.type('input[name="password"]', password);
        await page.click('button.v-btn.v-btn--contained.primary');
        await page.waitForNavigation({ timeout: 5000 });
        console.log('ログイン完了');
        return true; // ログイン成功
    } catch (error) {
        console.error('ログインエラー:', error);
        return false; // ログイン失敗
    }
}

async function setGeolocation(page) {
    try {
        const context = page.browser().defaultBrowserContext();
        await context.overridePermissions('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top', ['geolocation']);
        await page.setGeolocation({
            latitude: 34.67536300091403,
            longitude: 135.49971632649746,
        });
        console.log('位置情報を設定しました。');
    } catch (error) {
        console.error('位置情報設定エラー:', error);
    }
}

async function performClock(action) {
    console.log('ブラウザ起動中...');
    const browser = await puppeteer.launch({
        headless: true, // ヘッドレスモードで実行
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('新しいページを開きました。');

    // ログイン処理を実行
    const isLoggedIn = await login(page);
    if (!isLoggedIn) {
        await browser.close(); // ログイン失敗時にブラウザを閉じる
        return; // 処理を終了
    }

    // 位置情報を偽装
    await setGeolocation(page);
    
    // 現在時刻を取得
    const currentHour = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }).split(" ")[1].split(":")[0];
    
    // 現在の時刻によって処理を分ける
    if (currentHour === '09') {
        console.log('9時出勤');
        await clock(page, action); // 出勤ボタンを押す
    } else if (currentHour === '12') {
        console.log('12時退勤');
        await clock(page, action); // 退勤ボタンを押す
    } else if (currentHour === '13') {
        console.log('13時再出勤');
        await clock(page, action); // 出勤ボタンを押す
    } else if (currentHour === '18') {
        console.log('18時退勤');
        await clock(page, action); // 退勤ボタンを押す
    } else {
        console.log('時間外です。'); // 時間外の場合のメッセージ
    }

    await browser.close(); // ブラウザを閉じる
    console.log('ブラウザを閉じました。');
}

// メイン関数を実行
async function main() {
    await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
}

// メイン関数を実行
main().catch(console.error);
