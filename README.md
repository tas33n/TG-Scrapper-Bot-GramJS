# Telegram Scrapper Bot - GRAMJS

## Overview

Telegram Scrapper Bot - GRAMJS is a powerful tool designed to scrape members from Telegram groups, channels, and private chats. It also allows sending messages to the scraped members. This bot is built using the [GramJS](https://github.com/gram-js/gramjs) library.

- **Session Management**: Save and load sessions to avoid repeated logins.
- **Interactive CLI**: User-friendly command-line interface for easy interaction.

## Demo

![Preview](prev.gif)

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/tas33n/TG-Scrapper-Bot-GramJS.git
    cd TG-Scrapper-Bot-GramJS
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Create a `.env` file:**
    ```sh
    touch .env
    ```

4. **Add your Telegram API credentials to the `.env` file:**
    ```
    API_ID=your_api_id
    API_HASH=your_api_hash
    SESSION_FILE=session.txt
    DUMP_DIR=dump
    MESSAGE_TEMPLATE_PATH=msg.txt
    ```

## Usage

1. **Start the bot:**
    ```sh
    npm start
    ```

2. **Login:**
    - Enter your phone number.
    - Enter the code you received.
    - Enter your password (if 2FA is enabled).

3. **Main Menu:**
    - **Dump Members from Groups**: Scrape members from groups you are part of.
    - **Dump Members from Channels (Admin)**: Scrape members from channels where you are an admin.
    - **Dump Private Chats (DMs)**: Scrape members from your private chats.
    - **Send Messages to Dumped Members**: Send messages to the scraped members.
    - **Exit**: Exit the bot.


### Dumping Members

1. Select "Dump Members from Groups" from the main menu.
2. Choose the group you want to scrape members from.
3. The members will be saved in the `dump` directory as a JSON file.

### Sending Messages

1. Select "Send Messages to Dumped Members" from the main menu.
2. Choose the JSON file containing the members.
3. Enter the interval between messages (in milliseconds).
4. The bot will start sending messages to the members.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **Tas33n** - [GitHub](https://github.com/tas33n)

## Acknowledgements

- [GramJS](https://github.com/gram-js/gramjs) - Telegram client library for Node.js
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - A collection of common interactive command line user interfaces
- [Gradient String](https://github.com/bokub/gradient-string) - Beautiful color gradients in terminal output

## Credits

- **Tas33n** - [GitHub](https://github.com/tas33n)
- **GitHub Copilot**