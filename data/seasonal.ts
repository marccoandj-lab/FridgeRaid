const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
] as const

const SEASONAL: Record<string, string[]> = {
  Januar: ["Kale", "Leeks", "Parsnips", "Oranges", "Lemons", "Beetroot", "Celeriac", "Swede", "Turnip", "Squash"],
  Februar: ["Kale", "Leeks", "Parsnips", "Oranges", "Lemons", "Beetroot", "Celeriac", "Swede", "Purple sprouting broccoli"],
  Mart: ["Purple sprouting broccoli", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Banana shallots"],
  April: ["Asparagus", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Rocket", "Morel mushrooms"],
  Maj: ["Asparagus", "Watercress", "Spring onions", "Radishes", "Spinach", "Rhubarb", "Rocket", "New potatoes", "Peas", "Broad beans"],
  Jun: ["Peas", "Broad beans", "New potatoes", "Carrots", "Courgettes", "Strawberries", "Raspberries", "Cherries", "Fennel", "Mangetout"],
  Jul: ["Tomatoes", "Courgettes", "Peppers", "Aubergine", "Sweetcorn", "Strawberries", "Raspberries", "Blueberries", "Peaches", "Nectarines", "Green beans", "Basil"],
  Avgust: ["Tomatoes", "Courgettes", "Peppers", "Aubergine", "Sweetcorn", "Plums", "Figs", "Blackberries", "Apples", "Green beans", "Chillies", "Melon"],
  Septembar: ["Apples", "Pears", "Plums", "Blackberries", "Figs", "Mushrooms", "Pumpkin", "Squash", "Sweet potatoes", "Chard", "Grapes"],
  Oktobar: ["Pumpkin", "Squash", "Apples", "Pears", "Mushrooms", "Sweet potatoes", "Celeriac", "Parsnips", "Kale", "Beetroot", "Quince"],
  Novembar: ["Pumpkin", "Squash", "Kale", "Brussels sprouts", "Parsnips", "Celeriac", "Swede", "Turnip", "Pears", "Cranberries", "Pomegranate"],
  Decembar: ["Kale", "Brussels sprouts", "Parsnips", "Celeriac", "Swede", "Turnip", "Pears", "Cranberries", "Pomegranate", "Chestnuts", "Salsify"],
}

export function getCurrentSeasonalIngredients(): string[] {
  const month = MONTHS[new Date().getMonth()]
  return SEASONAL[month] ?? []
}

export function getAllSeasonal(): Record<string, string[]> {
  return SEASONAL
}

export { MONTHS }
