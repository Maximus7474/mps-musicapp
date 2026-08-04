# Beatr

Beatr is a parody music application inspired by Deezer, taking inspiration from it's layout and colour palette it's built to offer various features to players to stream music in game.

> [!IMPORTANT]
> Due to Cfx’s [Platform License Agreement](https://fivem.net/terms) and [YouTube’s Developer Policies](https://developers.google.com/youtube/terms/developer-policies#i.-additional-prohibitions), this application does not provide the ability to stream from YouTube.
> This is because:
> * Cfx/Rockstar terms restrict unauthorized use of copyrighted and other protected content,
> * YouTube policies prohibit features that play content from a background player or separate audio/video components of YouTube audiovisual content.

---

## 🚀 Installation Guide

**Important:** This resource **requires LB Phone** to function correctly.

1.  **Dependencies:** Ensure you have `LB-Phone` installed and running on your server.
2.  **Database Setup:** Execute the provided SQL file: `sql/tables.sql`
    * *Note:* If you encounter errors during table creation, please verify that you are using an up-to-date MariaDB version (v10.11.\* or newer is recommended).
3.  **Resource Deployment:**
    * Add the resource folder to your FiveM server's `resources` directory.
    * Add `ensure {resource_name}` to your `server.cfg`.

---

## 🙏 Credits

* 🎨 **UI Template:** [lb-scripts / lb-phone-app-template](https://github.com/lbphone/lb-phone-app-template)
* ⚙️ **TypeScript Boilerplate:** [Overextended / fivem-typescript-boilerplate](https://github.com/overextended/fivem-typescript-boilerplate)
* **Combined Boilerplate:** [Maximus7474 / lbphone-ts-apptemplate](https://github.com/Maximus7474/lbphone-ts-apptemplate)
