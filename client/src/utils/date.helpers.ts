// date.helpers.ts

const seanceHours = ['14:00', '16:30', '19:00', '21:30'];

function formatDateToDDMMWithDash(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}-${month}`;
}

// Retourne une liste d'objets `{ date, time }` avec des dates et heures uniques
function formatSeances(
    startDate: Date,
    numberOfSeances: number
): { date: string; time: string }[] {
    const result: { date: string; time: string }[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < numberOfSeances; i++) {
        // Sélectionne l'heure en fonction de l'index de la séance (cyclique)
        const time = seanceHours[i % seanceHours.length];

        // Convertit la date actuelle en chaîne formatée
        const dateStr = formatDateToDDMMWithDash(currentDate);

        // Ajoute la date et l'heure actuelles à la liste des résultats
        result.push({ date: dateStr, time });

        // Incrémente la date après chaque rotation complète d'horaires
        if ((i + 1) % seanceHours.length === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return result;
}

export { formatDateToDDMMWithDash, formatSeances };
