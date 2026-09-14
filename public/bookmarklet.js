/**
 * Bookmarklet "Envoyer a Niches" (usage manuel uniquement).
 *
 * Ce script ne fait AUCUNE requete automatique vers Vinted : il lit
 * uniquement le contenu deja affiche dans la page que tu as toi-meme
 * ouverte, au moment ou tu cliques sur le bookmarklet. Utilise-le annonce
 * par annonce, pendant que tu navigues normalement, connecte a ton propre
 * compte.
 *
 * Installation : cree un nouveau favori dans ton navigateur, colle le
 * contenu du fichier bookmarklet-min.js (voir README) comme URL, et
 * remplace WEBHOOK_URL / WEBHOOK_SECRET par les tiens.
 *
 * Ce fichier est fourni en clair (non minifie) pour que tu puisses lire
 * exactement ce qu'il fait avant de l'utiliser.
 */
(function () {
  const WEBHOOK_URL = "https://ton-domaine.fr/api/webhooks/watcher";
  const WEBHOOK_SECRET = "colle-ta-cle-WATCHER_WEBHOOK_SECRET-ici";

  const title = document.title || prompt("Titre de l'annonce ?");
  const priceText = prompt("Prix affiche sur la page (ex: 7.00) ?");
  const price = parseFloat((priceText || "").replace(",", "."));
  const listingUrl = window.location.href;

  if (!title || !price) {
    alert("Titre ou prix manquant, envoi annule.");
    return;
  }

  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-watcher-secret": WEBHOOK_SECRET,
    },
    body: JSON.stringify({ title, price, listingUrl }),
  })
    .then((r) => r.json())
    .then((data) => {
      alert(
        data.opportunitiesCreated > 0
          ? `Ajoutee (${data.opportunitiesCreated} niche(s) correspondante(s)).`
          : "Recue, mais aucune niche active ne correspond."
      );
    })
    .catch(() => alert("Echec de l'envoi."));
})();
