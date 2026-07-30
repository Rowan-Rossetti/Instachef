# Correction de l'export du planificateur

- La feuille PDF n'est plus placée hors de la zone de rendu du navigateur, ce qui évite les PDF vides.
- Le navigateur attend deux cycles de rendu avant la capture.
- La capture est forcée à 1122 x 794 px, correspondant à une feuille A4 paysage.
- L'impression, le PDF et le document Word conservent une seule page avec un tableau compact.
