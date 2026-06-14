/** Formate un montant en Francs Congolais : 10 500 FC */
export function formatCDF(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(montant)) + ' FC'
}
