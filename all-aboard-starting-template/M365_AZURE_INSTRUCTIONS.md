# LAUNCHPAD: Azure & Microsoft 365 Team Guide

Welcome! This guide explains how to use the shared Azure / Microsoft 365 tenant during the hackathon. Please read it all the way through before you start building. It's short, and it will save you from the most common problems.

> [!IMPORTANT]
> **This repository is public, and so is your fork.** Never commit passwords, keys, connection strings, tokens, or the details from your printed team sheet. See [Secrets and your public fork](#secrets-and-your-public-fork).

---

## Contents

1. [What you get](#what-you-get)
2. [Your team sheet](#your-team-sheet)
3. [First sign-in](#first-sign-in)
4. [Set up your tools](#set-up-your-tools)
5. [Rules of the road (shared tenant)](#rules-of-the-road-shared-tenant)
6. [Naming and tagging](#naming-and-tagging)
7. [Creating Azure resources](#creating-azure-resources)
8. [Working with Entra ID and Microsoft 365](#working-with-entra-id-and-microsoft-365)
9. [Secrets and your public fork](#secrets-and-your-public-fork)
10. [Deploying from GitHub Actions (optional)](#deploying-from-github-actions-optional)
11. [Cost and quotas](#cost-and-quotas)
12. [Troubleshooting](#troubleshooting)
13. [End of the event](#end-of-the-event)
14. [Getting help](#getting-help)

## What you get

Each team receives:

- **One admin account**, you can create as many accounts as you need, if required. However please only consume 3 x M365 licenses.
- **One Azure resource group** where you create all your Azure resources.w
- **Access to the Microsoft 365 tenant** (Entra ID, Microsoft Graph, Teams, SharePoint) for building and testing, if you intend to use any M365 services as part of your solution.
- A budget of **£150** for the whole event for Azure resources.

All seven teams share **one tenant and one subscription**. You can see some things other teams create (for example, app registrations and users in Entra ID). Please read the [rules of the road](#rules-of-the-road-shared-tenant).

---

## Your team sheet

The organizers will hand your team a **printed sheet** with your sign-in details. Keep it with you, and **don't photograph it, paste it into chat, or commit it anywhere**.

This guide uses these placeholders for values from your sheet:

| Placeholder | Meaning |
|---|---|
| `<team-account>` | Your team's sign-in name |
| `<tenant-domain>` | The hackathon tenant's domain |
| `<subscription-name>` | The Azure subscription your resource group is in |
| `<resource-group>` | Your team's resource group |
| `NN` | Your two-digit team number, for example `03` |

Whenever you see one of them in a command, replace it with the value from your sheet.

---

## First sign-in

Azure requires multi-factor authentication (MFA) for the portal, the Azure CLI, and PowerShell. Because your team starts with one account, set MFA up deliberately **before** everyone tries to sign in.

1. **Pick one person** to do the first sign-in. Open a private/incognito browser window and go to <https://portal.azure.com>.
2. Sign in with the account and temporary password from your team sheet.
3. If asked to change the password, choose a new one and share it with your team **privately** (in person or by direct message, never in a public channel or in GitHub).
4. When prompted to register MFA, set up **Microsoft Authenticator** on that person's phone.
5. If you intend to share the admin account then - **Add backup methods** so the team isn't blocked when that person is away: go to <https://mysignins.microsoft.com/security-info>, choose **Add sign-in method → Authenticator app**, and register a second (and third) teammate's phone.
6. Check that the account can see your resource group: **Resource groups → `<resource-group>`**.

> [!TIP]
> Everyone should use a **private browser window or a separate browser profile** for the hackathon account. This keeps it apart from your work or personal Microsoft account and avoids "wrong tenant" confusion.

If you get locked out, contact the organizers. **Do not** keep retrying, because repeated failures can lock the account for a while.

---

## Set up your tools

You can do everything in the [Azure portal](https://portal.azure.com) or [Azure Cloud Shell](https://shell.azure.com), which needs no install. If you prefer working locally, install:

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI (`azd`)](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) (optional, good for templates)
- [VS Code](https://code.visualstudio.com/) with the **Azure Tools** extension pack (optional)

### Sign in with the Azure CLI

Always sign in **to the hackathon tenant explicitly**:

```bash
az login --tenant <tenant-domain>
```

If your browser is already signed in to a different account, use device code login instead:

```bash
az login --tenant <tenant-domain> --use-device-code
```

Then select the subscription and set your defaults, so you don't have to pass `--resource-group` and `--location` on every command:

```bash
az account set --subscription "<subscription-name>"
az config set defaults.group=<resource-group> defaults.location={{DEFAULT_REGION}}
```

Check that it worked:

```bash
az account show --query "{subscription:name, user:user.name}" -o table
az group show --name <resource-group> -o table
```

With `azd`, sign in the same way:

```bash
azd auth login --tenant-id <tenant-domain>
```

> [!WARNING]
> `az config` stores your defaults on your own machine, not in the repo. Don't copy CLI output (it includes tenant and subscription IDs) into issues, pull requests, or commits.

---

## Rules of the road (shared tenant)

Seven teams share this tenant. One team's mistake can break things for everyone, so:

**Do**

- ✅ Create Azure resources **only in your own resource group**.
- ✅ Prefix everything you create in Entra ID or Microsoft 365 with `teamNN-` (see [naming](#naming-and-tagging)).
- ✅ Stop or scale down expensive resources (VMs, GPU compute, large databases) when you aren't using them.
- ✅ Ask your facilitator if you aren't sure whether something is allowed.

**Don't**

- ❌ Touch, modify, or delete anything belonging to another team.
- ❌ Change **tenant-wide** settings: Conditional Access, security defaults, user settings, consent settings, domains, licensing, Teams/SharePoint/Exchange admin policies, or anything in the Microsoft 365 admin center that affects every user.
- ❌ Create, delete, or reset passwords for other teams' accounts, or change roles of any account.
- ❌ Change MFA methods for any account except your own team's.
- ❌ Create new subscriptions, management groups, or resources outside your resource group.
- ❌ Use the tenant for anything that isn't your hackathon project (crypto mining, load testing third-party sites, sending bulk email, and so on).
- ❌ Store real personal or customer data. Use sample or synthetic data only.

Breaking these rules may get your account disabled.

---

## Naming and tagging

Use your team number in every name so you (and the organizers) can tell what's yours.

| What | Pattern | Example |
|---|---|---|
| Azure resources | `<type>-teamNN-<purpose>` | `app-team03-api`, `kv-team03-secrets` |
| Globally unique names (storage, Key Vault, web apps) | add a short random suffix | `stteam03data7x2`, `kv-team03-a91f` |
| Entra ID app registrations | `teamNN-<purpose>` | `team03-web-frontend` |
| Test users | `teamNN-<name>` | `team03-alice` |
| Microsoft 365 groups, Teams, SharePoint sites | `TeamNN - <name>` | `Team03 - Demo Site` |

Tag your Azure resources:

```bash
az resource tag --tags team=teamNN event=hackathon --ids <resource-id>
```

Most `az ... create` commands also accept `--tags team=teamNN event=hackathon` directly.

> Storage account names allow only lowercase letters and numbers (3–24 characters). Key Vault names allow 3–24 characters.

---

## Creating Azure resources

Create everything inside your resource group. In the portal, pick it in the **Resource group** dropdown on every "Create" page. With the CLI defaults from [above](#sign-in-with-the-azure-cli) set, most commands target your group automatically.

A few examples:

```bash
# Storage account
az storage account create --name stteamNNdata<suffix> --sku Standard_LRS --tags team=teamNN

# Key Vault (RBAC mode)
az keyvault create --name kv-teamNN-<suffix> --enable-rbac-authorization true --tags team=teamNN

# App Service (Linux, Python)
az webapp up --name app-teamNN-<suffix> --runtime "PYTHON:3.12" --sku B1
```

**Prefer managed identities over keys.** Most Azure services (App Service, Container Apps, Functions) can use a managed identity to talk to Storage, Key Vault, Azure OpenAI and so on, with no secrets in your code. Assign roles to the identity **scoped to your resource group or to the individual resource**, never higher:

```bash
az role assignment create \
  --assignee <managed-identity-principal-id> \
  --role "Storage Blob Data Contributor" \
  --scope $(az storage account show --name stteamNNdata<suffix> --query id -o tsv)
```

If a role assignment fails with `AuthorizationFailed`, ask the organizers to create it for you.

### Things you can't do (and why)

Your account can only manage your own resource group. That means you **can't**:

- Create resource groups or move resources between groups.
- Register resource providers. If you see `MissingSubscriptionRegistration`, ask the organizers to register it for you.
- Raise quotas. Ask the organizers.

---

## Working with Entra ID and Microsoft 365

Use your account's Entra ID and Microsoft 365 access only for your own project.

### App registrations

If your app signs users in or calls Microsoft Graph, create an app registration:

1. Portal → **Microsoft Entra ID → App registrations → New registration**.
2. Name it `teamNN-<purpose>`.
3. Under **Owners**, make sure your team account is listed.
4. Prefer **delegated** Graph permissions with the least privilege you need (for example `User.Read` instead of `User.Read.All`).
5. Only grant admin consent for permissions your app actually uses.

If you need a client secret, keep its expiry short (for example 30 days) and store it in Key Vault or a local `.env` file that is **not committed** (see below). Better still, use a managed identity or a federated credential.

### Microsoft Graph

[Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) is the fastest way to try Graph calls. Sign in with your hackathon account, and check that the top right shows the hackathon tenant, not your own organization.

### Test users and sample data

- Create test users only if you need them, named `teamNN-<name>`.
- Don't assign admin roles to test users.
- Use synthetic data only. Never real people's details.

### Teams, SharePoint and Outlook

- Create Teams and SharePoint sites named `TeamNN - <name>`.
- To test a custom Teams app, upload it to **your own team** rather than publishing it to the org-wide app catalog.
- Don't send email outside the tenant from hackathon accounts.

---

## Secrets and your public fork

Forks of a public repo are **public**, and anything pushed to GitHub may be scraped by bots within minutes, **even if you delete it afterwards**.

**Never commit:**

- Passwords, keys, client secrets, connection strings, or SAS tokens.
- Your team account name, the tenant domain, tenant or subscription IDs, or anything else from your team sheet.
- CLI output, screenshots, or logs that show any of the above.

**Keep secrets out of git:**

1. Make sure `.gitignore` includes at least:

   ```gitignore
   .env
   .env.*
   !.env.example
   *.pfx
   *.pem
   local.settings.json
   appsettings.Development.json
   .azure/
   ```

2. Commit a `.env.example` with **placeholder values only**, and keep the real `.env` on your machine.
3. In your fork, turn on **Settings → Code security → Secret scanning** and **Push protection**, so GitHub blocks pushes that contain known secret formats.
4. Put runtime secrets in **Azure Key Vault** or App Service / Container Apps settings, not in code.
5. Put CI/CD values in **GitHub → Settings → Secrets and variables → Actions**.

**If you leak a secret:** tell the organizers right away and **rotate it** (regenerate the key, reset the password, or delete the client secret). Deleting the commit is **not** enough.

> [!NOTE]
> GitHub doesn't let you make a fork of a public repo private. If your team needs a private repo, create a new private repository and push this code to it (or use **Use this template** if the organizers have enabled it), instead of forking.

---

## Deploying from GitHub Actions (optional)

The safest way to deploy from GitHub is **OpenID Connect (OIDC)**, which needs no stored Azure password or client secret.

> Creating role assignments needs more permission than some team accounts have. If step 3 fails with `AuthorizationFailed`, ask the organizers to run it for you.

**1. Create an app registration and service principal**

```bash
az ad app create --display-name teamNN-github-deploy
# Note the "appId" in the output, then:
az ad sp create --id <appId>
```

**2. Add a federated credential for your fork's `main` branch**

Create a file called `credential.json` outside your repo folder:

```json
{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:<your-github-org-or-user>/<your-fork-name>:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}
```

```bash
az ad app federated-credential create --id <appId> --parameters credential.json
```

**3. Give it Contributor on your resource group only**

```bash
az role assignment create \
  --assignee <appId> \
  --role Contributor \
  --scope $(az group show --name <resource-group> --query id -o tsv)
```

**4. Add Actions secrets in your fork** (**Settings → Secrets and variables → Actions**):

| Secret | Where to find it |
|---|---|
| `AZURE_CLIENT_ID` | The `appId` from step 1 |
| `AZURE_TENANT_ID` | `az account show --query tenantId -o tsv` |
| `AZURE_SUBSCRIPTION_ID` | `az account show --query id -o tsv` |
| `AZURE_RESOURCE_GROUP` | Your team sheet |

**5. Use them in a workflow**

```yaml
name: deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - run: az group show --name "${{ secrets.AZURE_RESOURCE_GROUP }}" --query name -o tsv
      # ...your build and deploy steps
```

> GitHub disables Actions on new forks by default. Enable them under the **Actions** tab of your fork. Workflow logs in a public repo are public too, so don't print secrets or IDs in your steps.

---

## Cost and quotas

- Each team has a budget of **£150**. The organizers get alerts and may stop resources that run away.
- Prefer **Free / Basic / Consumption / serverless** tiers. You almost certainly don't need Premium SKUs for a demo.
- **Stop VMs** (`az vm deallocate`) and **scale down** databases when you aren't using them.
- **Quotas are shared** across all seven teams in one subscription, especially Azure OpenAI tokens-per-minute and VM vCPUs. Deploy AI models with modest capacity, and delete deployments you no longer use.
- Only deploy to the allowed regions: UK South or Italy North. Other regions may be blocked by policy.

See your spending in the portal under **Cost Management → Cost analysis**, scoped to your resource group.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `AuthorizationFailed` | You're working outside your resource group, or need a role you don't have | Check the `--resource-group` / scope. Ask the organizers if you really need more access. |
| `MissingSubscriptionRegistration` | The resource provider isn't registered | Ask the organizers to register it (you can't). |
| `RequestDisallowedByPolicy` | The region or SKU isn't allowed | Use UK South or Italy North and a smaller SKU. |
| `QuotaExceeded` / `InsufficientQuota` | Shared subscription quota is used up | Try a smaller size or another allowed region, or ask the organizers. |
| Name already taken | Storage, Key Vault and web app names are globally unique | Add a random suffix. |
| CLI shows the wrong subscription or none | You signed in to a different tenant | `az logout`, then `az login --tenant <tenant-domain>`. |
| Portal shows "no subscriptions" | Wrong directory selected | Click your account (top right) → **Switch directory** → choose the hackathon tenant. |
| MFA prompt goes to a teammate's phone | Shared account | Ask them to approve, or add your phone as an extra method (see [First sign-in](#first-sign-in)). |
| Account locked | Too many failed sign-ins | Wait 10–15 minutes, or contact the organizers. |
| Key Vault `Forbidden` on secrets | RBAC Key Vaults need a data-plane role | Assign yourself or your identity **Key Vault Secrets Officer/User** on the vault. |

---

## End of the event

- - On **13th November 2026**, the organizers will **delete all resource groups, app registrations, test users, and other team objects**, and disable the team accounts.
- Before then, make sure:
  - [ ] All your code is pushed to your fork (minus secrets!).
  - [ ] You've exported any data, screenshots or recordings you want to keep.
  - [ ] You've deleted any client secrets you created, and removed real secrets from your local machine if you no longer need them.
  - [ ] You've returned or securely destroyed your printed team sheet.

Nothing in the tenant will be kept after cleanup.

---

## Getting help

- **Organizer contact:** see your team sheet
- **Docs:** [Azure documentation](https://learn.microsoft.com/azure/) · [Microsoft Graph documentation](https://learn.microsoft.com/graph/) · [Azure CLI reference](https://learn.microsoft.com/cli/azure/)

When asking for help, include your **team number**, the **command or portal page** you used, and the **error message** (with any IDs, secrets or account names removed if you're posting somewhere public). Never paste passwords or keys into the help channel.

Good luck, and have fun building! 🚀