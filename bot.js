require("dotenv").config();

console.log("Instagram User:", process.env.INSTAGRAM_USER);
console.log("Instagram Password:", process.env.INSTAGRAM_PASSWORD);
const puppeteer = require("puppeteer");

async function run() {
  let browser;
  try {
    console.log("Opening the browser...");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: true
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    await page.goto("https://www.instagram.com/", { timeout: 60000 });

    // Accepter les cookies (vérifiez que le sélecteur est correct)
    const acceptCookiesSelector = "button._a9--._a9_1";
    await page.waitForSelector(acceptCookiesSelector, { timeout: 10000 });
    await page.click(acceptCookiesSelector);

    // Attendre que le formulaire de login apparaisse
    const loginFormSelector = "#loginForm";
    await page.waitForSelector(loginFormSelector, { timeout: 10000 });

    // Taper le nom d'utilisateur et le mot de passe
    if (process.env.INSTAGRAM_USER && process.env.INSTAGRAM_PASSWORD) {
      await page.type(
        "#loginForm > div > div:nth-child(1) > div > label > input",
        process.env.INSTAGRAM_USER,
        { delay: 100 }
      );

      await page.type(
        "#loginForm > div > div:nth-child(2) > div > label > input",
        process.env.INSTAGRAM_PASSWORD,
        { delay: 100 }
      );
    } else {
      throw new Error("Instagram credentials are not set in the .env file.");
    }

    // Cliquer sur le bouton de connexion
    const loginButtonSelector = "#loginForm > div > div:nth-child(3) > button";
    await page.click(loginButtonSelector);

    // Attendre la navigation ou une indication que le login est réussi
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

    console.log("Login successful!");

    // Attente pour que l'utilisateur entre le code manuellement et clique sur la page suivante
    console.log(
      "Please enter the verification code manually and click the desired page. The script will resume in 2 minutes."
    );
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Attendre que le bouton "Plus tard" apparaisse
    const laterButtonSelector = ".x1i10hfl";
    await page.waitForSelector(laterButtonSelector, { timeout: 30000 });
    await page.click(laterButtonSelector);

    const notificationsButtonSelector = "button._a9--._ap36._a9_1";
    await page.waitForSelector(notificationsButtonSelector, { timeout: 30000 });
    await page.click(notificationsButtonSelector);

    const notificationsFindButtonSelector =
      "div.x1iyjqo2.xh8yej3 > div:nth-child(2) > span > div > a > div > div > div";
    await page.click(notificationsFindButtonSelector);

    await page.type("input.x1lugfcp", "perruque", { delay: 200 });

    const targetSelector = 'div[aria-label="Non personnalisé"]';
    await page.waitForSelector(targetSelector, { timeout: 60000 });
    await page.click(targetSelector);

    const followerSetetor = 

    // await page.waitForSelector('div[aria-label="Non personnalisé"]', {
    //   timeout: 30000
    // });
    // await page.click('div[aria-label="Non personnalisé]"');
  } catch (err) {
    console.log("Could not create a browser instance => :", err);
  } finally {
    if (browser) {
      // await browser.close();
    }
  }
}

run();
