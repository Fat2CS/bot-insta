require("dotenv").config();

console.log("Instagram User:", process.env.INSTAGRAM_USER);
console.log("Instagram Password:", process.env.INSTAGRAM_PASSWORD);
const puppeteer = require("puppeteer");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanDelay(min, max) {
  const delay = getRandomInt(min, max);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

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
    await humanDelay(1000, 3000); // Attente avant de cliquer
    await page.click(acceptCookiesSelector);

    // Attendre que le formulaire de login apparaisse
    const loginFormSelector = "#loginForm";
    await page.waitForSelector(loginFormSelector, { timeout: 10000 });

    // Taper le nom d'utilisateur et le mot de passe
    if (process.env.INSTAGRAM_USER && process.env.INSTAGRAM_PASSWORD) {
      await humanDelay(1000, 3000); // Attente avant de cliquer
      await page.type(
        "#loginForm > div > div:nth-child(1) > div > label > input",
        process.env.INSTAGRAM_USER,
        { delay: getRandomInt(100, 300) }
      );
      await humanDelay(1000, 3000); // Attente avant de cliquer
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
    await humanDelay(1000, 3000); // Attente avant de cliquer
    await page.click(laterButtonSelector);

    const notificationsButtonSelector = "button._a9--._ap36._a9_1";
    await page.waitForSelector(notificationsButtonSelector, { timeout: 30000 });
    await page.click(notificationsButtonSelector);

    const notificationsFindButtonSelector =
      "div.x1iyjqo2.xh8yej3 > div:nth-child(2) > span > div > a > div > div > div";
    await page.click(notificationsFindButtonSelector);

    await page.type("input.x1lugfcp", "perruque", { delay: 200 });

    const targetSelector = 'div[aria-label="Non personnalisé"]';
    await page.waitForSelector(targetSelector, { timeout: 50000 });
    await humanDelay(1000, 3000); // Attente avant de cliquer
    await page.click(targetSelector);

    // Cibler les liens des profils à partir d'une div spécifique
    const profileLinkSelector = 'div.xocp1fn a[href^="/"]'; // Simplifié pour cibler les liens internes
    await page.waitForSelector(profileLinkSelector, { timeout: 63000 });
    const profileLinks = await page.$$eval(profileLinkSelector, (links) =>
      links.map((link) => link.href)
    );
    console.log(profileLinks);

    let followCount = 0;
    const followLimit = 20;

    for (const link of profileLinks) {
      if (followCount >= followLimit) {
        break; // Stop if the follow limit is reached
      }

      // Ouvrir chaque lien de profil dans un nouvel onglet et cliquer sur le bouton "Follow" si non suivi
      await humanDelay(1000, 3000); // Attente avant d'ouvrir un nouvel onglet
      const newPage = await browser.newPage();
      await newPage.goto(link, { timeout: 60000 });

      // Sélectionner le bouton "Suivre"
      const followButtonContainerSelector = "button._acan:nth-child(1)";
      await newPage.waitForSelector(followButtonContainerSelector, {
        timeout: 60000
      });

      // Vérifier le texte du bouton à l'intérieur du conteneur
      const buttonText = await newPage.$eval(
        followButtonContainerSelector,
        (container) => {
          const button = container.querySelector(
            'div._ap3a._aaco._aacw._aad6._aade[dir="auto"]'
          );
          return button ? button.innerText : null;
        }
      );

      if (buttonText && buttonText.toLowerCase() === "suivre") {
        await humanDelay(1000, 4000); // Attente avant de cliquer
        await newPage.click(
          `${followButtonContainerSelector} div._ap3a._aaco._aacw._aad6._aade[dir="auto"]`
        );
        console.log(`Followed the profile: ${link}`);
        followCount++;
      } else {
        console.log(`Already following the profile: ${link}`);
      }

      await newPage.close(); // Fermer l'onglet après traitement
      await humanDelay(2000, 5000); // Ajoutez un délai entre le traitement des profils pour simuler un comportement humain
    }

    console.log(`Total profiles followed: ${followCount}`);
  } catch (err) {
    console.log("Could not create a browser instance => :", err);
  } finally {
    if (browser) {
      // await browser.close();
    }
  }
}

run();
