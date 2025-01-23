const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const gradient = require("gradient-string");
const chalk = require("chalk");
const { stdout } = require("process");
const path = require("path");
require("dotenv").config();

/* 
===============================================
             Telegram SCRAPPER BOT - GRAMJS
                Author: Tas33n
      GitHub: https://github.com/tas33n/TG-Scrapper-Bot-GramJS
===============================================
  */

const apiId = parseInt(process.env.API_ID, 10); // Get API_ID from .env
const apiHash = process.env.API_HASH; // Get API_HASH from .env
const sessionFile = process.env.SESSION_FILE || "session.txt"; // Default fallback
const dumpDir = process.env.DUMP_DIR || "dump"; // Default fallback
const messageTemplatePath = process.env.MESSAGE_TEMPLATE_PATH || "msg.txt"; // Default fallback

// Ensure dump directory exists
fs.ensureDirSync(dumpDir);

function getTerminalSize() {
  return { width: stdout.columns || 80, height: stdout.rows || 24 };
}

function whoami(me) {
  const loggedInUser = chalk.greenBright(`Logged in as: ${me.id}`);
  const username = me.username
    ? chalk.blueBright(`(@${me.username})`)
    : chalk.gray("(No username)");

  console.log(loggedInUser, username);
  console.log("\n");
}
// Banner
function showBanner() {
  const { width } = getTerminalSize();
  const title = "Telegram SCRAPPER BOT - GRAMJS";
  const author = "Author: Tas33n";
  const github = "GitHub: https://github.com/tas33n/TG-Scrapper-Bot-GramJS";
  const divider = "=".repeat(width);

  console.clear();
  console.log(divider);
  console.log(
    chalk.bold.cyanBright(
      title.padStart(Math.floor(width / 2) + Math.floor(title.length / 2))
    )
  );
  console.log(
    chalk.gray(
      author.padStart(Math.floor(width / 2) + Math.floor(author.length / 2))
    )
  );
  console.log(
    chalk.gray(
      github.padStart(Math.floor(width / 2) + Math.floor(github.length / 2))
    )
  );
  console.log(divider + "\n");
}

// load the session
async function loadSession() {
  if (fs.existsSync(sessionFile)) {
    const sessionData = fs.readFileSync(sessionFile, "utf-8");
    return new StringSession(sessionData);
  }
  return new StringSession("");
}

//  save the session
async function saveSession(client) {
  fs.writeFileSync(sessionFile, client.session.save());
}

(async () => {
  showBanner();

  const stringSession = await loadSession();
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  if (!stringSession.value) {
    console.log(chalk.cyan("Logging in for the first time..."));
    await client.start({
      phoneNumber: async () =>
        inquirer
          .prompt([
            {
              type: "input",
              name: "phone",
              message: "Enter your phone number:",
            },
          ])
          .then((res) => res.phone),
      password: async () =>
        inquirer
          .prompt([
            {
              type: "password",
              name: "password",
              message: "Enter your password (if 2FA enabled):",
            },
          ])
          .then((res) => res.password),
      phoneCode: async () =>
        inquirer
          .prompt([
            {
              type: "input",
              name: "code",
              message: "Enter the code you received:",
            },
          ])
          .then((res) => res.code),
      onError: (err) => console.log(err),
    });
    console.log(gradient.pastel("Login successful!"));
    await saveSession(client);
  } else {
    await client.connect();
    console.log(gradient.pastel("Session loaded. Logged in!"));
  }

  // Fetch logged-in user info
  const me = await client.getMe();
  whoami(me);

  // display menu
  async function displayMenu() {
    showBanner();
    whoami(me);

    const menuOptions = [
      { name: "Dump Members from Groups", value: "dump_groups" },
      { name: "Dump Members from Channels(Admin)", value: "dump_channels" },
      { name: "Dump Private Chats (DMs)", value: "dump_dms" },
      { name: "Send Messages to Dumped Members", value: "send_messages" },
      { name: "Exit", value: "exit" },
    ];

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: gradient.mind("Select an option:"),
        choices: menuOptions.map((option) => option.name),
        loop: false,
      },
    ]);

    return menuOptions.find((option) => option.name === choice).value;
  }

  // Dump members to JSON
  async function dumpMembers(filter, dumpType) {
    const dialogs = await client.getDialogs();
    const filtered = dialogs.filter(filter);

    if (dumpType === "dm") {
      console.log(gradient.vice("Fetching all DM participants..."));
      const members = filtered.map((dialog) => ({
        id: dialog.id,
        username: dialog.entity.username || "",
        firstName: dialog.entity.firstName || "",
        lastName: dialog.entity.lastName || "",
      }));

      const filePath = path.join(dumpDir, `inbox_dm.json`);
      fs.writeJsonSync(filePath, members, { spaces: 2 });
      console.log(gradient.passion(`Saved all DM participants to ${filePath}`));
    } else {
      console.log(
        gradient.fruit(`\nYou are part of ${filtered.length} ${dumpType}:\n`)
      );

      const choices = filtered.map((dialog) => ({
        name: `${dialog.title || dialog.name} (ID: ${dialog.id})`,
        value: dialog,
      }));

      const { selectedDialog } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedDialog",
          message: gradient.mind(`Select a ${dumpType} to dump members:`),
          choices: [...choices, { name: "Return to Main Menu", value: null }],
          loop: false,
        },
      ]);

      if (!selectedDialog) return;

      console.log(gradient.vice("Fetching members..."));
      const participants = await client.getParticipants(selectedDialog.id);
      const members = participants.map((p) => ({
        id: p.id,
        username: p.username || "",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
      }));

      const filePath = path.join(
        dumpDir,
        `${selectedDialog.title.replace(/[^a-zA-Z0-9]/g, "_")}_${dumpType}.json`
      );
      fs.writeJsonSync(filePath, members, { spaces: 2 });
      console.log(gradient.passion(`Saved members to ${filePath}`));
    }

    console.log("\nReturning to the main menu...");
    await inquirer.prompt([
      {
        type: "input",
        name: "return",
        message: "Press Enter to return to the main menu...",
      },
    ]);
  }

  // Function to send messages
  async function sendMessages() {
    console.clear();
    const files = fs
      .readdirSync(dumpDir)
      .filter((file) => file.endsWith(".json"));
    if (files.length === 0) {
      console.log("No JSON files found in the dump directory.");
      console.log("\nReturning to the main menu...");
      await inquirer.prompt([
        {
          type: "input",
          name: "return",
          message: "Press Enter to return to the main menu...",
        },
      ]);
      return;
    }

    let selectedFile = files[0];
    if (files.length > 1) {
      const { fileChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "fileChoice",
          message: "Select a JSON file to use for sending messages:",
          choices: files,
        },
      ]);
      selectedFile = fileChoice;
    }

    const members = fs.readJsonSync(path.join(dumpDir, selectedFile));
    const message = fs.readFileSync(messageTemplatePath, "utf-8");

    const { interval } = await inquirer.prompt([
      {
        type: "number",
        name: "interval",
        message: "Enter the interval (ms) between messages:",
        default: 1000,
      },
    ]);

    console.log(gradient.cristal("Sending messages...\n"));
    for (const member of members) {
      try {
        await client.sendMessage(member.id, { message });
        console.log(
          gradient.mind(`Message sent to ${member.username || member.id}`)
        );
      } catch (err) {
        console.error(`Failed to send message to ${member.id}:`, err.message);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    console.log("\nReturning to the main menu...");
    await inquirer.prompt([
      {
        type: "input",
        name: "return",
        message: "Press Enter to return to the main menu...",
      },
    ]);
  }

  // Main menu loop
  while (true) {
    const choice = await displayMenu();
    if (choice === "dump_groups") await dumpMembers((d) => d.isGroup, "group");
    else if (choice === "dump_channels")
      await dumpMembers((d) => d.isChannel, "channel");
    else if (choice === "dump_dms") await dumpMembers((d) => d.isUser, "dm");
    else if (choice === "send_messages") await sendMessages();
    else if (choice === "exit") {
      console.log(gradient.morning("Exiting. Goodbye!"));
      break;
    }
  }

  await client.disconnect();
})();
