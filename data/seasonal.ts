const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

const SEASONAL: Record<string, string[]> = {
  January: ["Kale", "Leeks", "Parsnips", "Oranges", "Lemons", "Beetroot", "Celeriac", "Swede", "Turnip", "Squash"],
  February: ["Kale", "Leeks", "Parsnips", "Oranges", "Lemons", "Beetroot", "Celeriac", "Swede", "Purple sprouting broccoli"],
  March: ["Purple sprouting broccoli", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Banana shallots"],
  April: ["Asparagus", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Rocket", "Morel mushrooms"],
  May: ["Asparagus", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Rocket", "New potatoes", "Peas", "Broad beans"],
  June: ["Peas", "Broad beans", "New potatoes", "Carrots", "Courgettes", "Strawberries", "Raspberries", "Cherries", "Fennel", "Mangetout"],
  July: ["Tomatoes", "Courgettes", "Peppers", "Aubergine", "Sweetcorn", "Strawberries", "Raspberries", "Blueberries", "Peaches", "Nectarines", "Green beans", "Basil"],
  August: ["Tomatoes", "Courgettes", "Peppers", "Aubergine", "Sweetcorn", "Plums", "Figs", "Blackberries", "Apples", "Green beans", "Chillies", "Melon"],
  September: ["Apples", "Pears", "Plums", "Blackberries", "Figs", "Mushrooms", "Pumpkin", "Squash", "Sweet potatoes", "Chard", "Grapes"],
  October: ["Pumpkin", "Squash", "Apples", "Pears", "Mushrooms", "Sweet potatoes", "Celeriac", "Parsnips", "Kale", "Beetroot", "Quince"],
  November: ["Pumpkin", "Squash", "Kale", "Brussels sprouts", "Parsnips", "Celeriac", "Swede", "Turnip", "Pears", "Cranberries", "Pomegranate"],
  December: ["Kale", "Brussels sprouts", "Parsnips", "Celeriac", "Swede", "Turnip", "Pears", "Cranberries", "Pomegranate", "Chestnuts", "Salsify"],
}

export function getCurrentSeasonalIngredients(): string[] {
  const month = MONTHS[new Date().getMonth()]
  return SEASONAL[month] ?? []
}

export function getAllSeasonal(): Record<string, string[]> {
  return SEASONAL
}

export { MONTHS }
