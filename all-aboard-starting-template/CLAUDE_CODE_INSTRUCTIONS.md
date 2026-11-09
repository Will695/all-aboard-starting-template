# Claude Code setup

Use the Claude Platform account you were invited to for this hackathon, in both the terminal and the Desktop app. Usage is billed to the hackathon organisation. Do not sign in with a personal Claude Pro, Max or Ultra account.

## Before you start

Claude Code and the Desktop app are already installed, and your account only has access to the workspace you need.

Find the invite email from Claude Console and accept it. You cannot sign in until you have.

## Terminal

1. Sign in to Claude Console. This also signs you out of any personal claude.ai login stored on the machine.

   ```bash
   claude auth login --console
   ```

2. Sign in in the browser with your invited account. If you are asked how you want to sign in, choose **Sign in with your Console account**.

3. Check that the organisation and email are correct:

   ```bash
   claude auth status --text
   ```

## Desktop app

1. Open the app. If it is already signed in to a personal account, sign out first.

2. On the sign-in screen, follow the link to **Use your Claude API account**, then click **Sign in with Claude Console**.

3. Sign in in the browser with your invited account and select the hackathon organisation.

4. Back in the app, open the **Code** tab.

The Desktop app keeps its own sign-in, so you need to do this even if the terminal is already signed in.

## Installing Matt Pocock's skills

Install [the skills](https://github.com/mattpocock/skills) from your terminal:

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

## Problems

| Problem | Fix |
| --- | --- |
| The browser does not open from the terminal | Press `c` to copy the login URL, then open it in your browser. |
| The browser shows a code instead of returning to the terminal | Paste it at the `Paste code here if prompted` prompt. |
| The terminal shows the wrong account or organisation | Run `claude auth logout`, then `claude auth login --console`. |
| The Desktop app asks you to upgrade your plan | You used the standard sign-in. Sign out and follow the Desktop steps above. |
| The Desktop app does not show **Use your Claude API account** | Ask an organiser. The app may be out of date, or a device management profile may be blocking this sign-in. |

claude.ai connectors and `/schedule` are not available with a Console sign-in.

## Sources

- [Claude Code authentication](https://code.claude.com/docs/en/authentication)
- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart)
- [Claude Desktop with the Claude API](https://claude.com/docs/third-party/claude-desktop/claude-api.md)
- [Code in Claude Desktop on third-party platforms](https://claude.com/docs/third-party/claude-desktop/code.md)
