# Correction de compilation

L'option `pagebreak` a été retirée de la configuration `html2pdf.js`.

La version des types installée dans le projet ne déclare pas cette propriété dans `Html2PdfOptions`, ce qui provoquait l'erreur TS2353. La mise en page sur une seule feuille reste gérée par le CSS d'impression, le format A4 paysage et la structure compacte du planificateur.
