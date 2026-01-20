# How to Deploy Your Free Status Dashboard

You have a complete custom server ready in `SomaticStatusServer`.
You can host this for FREE on platforms like **Render**, **Railway**, or **Glitch**.

### Option 1: Render.com (Recommended)
1.  **Push the `SomaticStatusServer` folder to GitHub**.
    - Initialize a git repo in that folder.
    - Create a new repository on GitHub.
    - Push the code.
2.  **Sign up for Render.com** (Free).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    - **Runtime**: Node
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
6.  Click **Deploy**.
7.  Copy your new URL (e.g. `https://somatic-status.onrender.com`).

### Option 2: Glitch.com
1.  Go to **Glitch.com**.
2.  Click **New Project** -> **Import from GitHub**.
3.  Enter your GitHub repo URL.

### Finish Setup
Once deployed, take your public URL (e.g., `https://somatic-status.onrender.com`) and add `/update` to the end.

**Example Webhook URL for Launcher:**
`https://somatic-status.onrender.com/update`

Paste this into the **Somatic Landscapes Launcher**.
Wait 5 seconds, and your dashboard should show **ONLINE** and live stats!
