import type { MealSummary, MealDetail, IngredientItem, RecipeIngredient } from "@/types/meal";
import { LOCAL_MEALS } from "@/data/local-recipes";

const BASE = "https://www.themealdb.com/api/json/v1/1";

const cache = new Map<string, MealSummary[]>();

function getLocalMealsByIngredient(ingredient: string): MealSummary[] {
  const normalized = ingredient.toLowerCase();
  return LOCAL_MEALS.filter(meal => {
    for (let i = 1; i <= 20; i++) {
      const ing = (meal as unknown as Record<string, string>)[`strIngredient${i}`];
      if (ing && ing.toLowerCase().includes(normalized)) return true;
    }
    return false;
  }).map(m => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strMealThumb: m.strMealThumb
  }));
}

function getLocalMealById(id: string): MealDetail | null {
  return LOCAL_MEALS.find(m => m.idMeal === id) ?? null;
}

function searchLocalMealsByName(name: string): MealSummary[] {
  const normalized = name.toLowerCase();
  return LOCAL_MEALS.filter(m => 
    m.strMeal.toLowerCase().includes(normalized)
  ).map(m => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strMealThumb: m.strMealThumb
  }));
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchMealsByIngredient(
  ingredient: string
): Promise<MealSummary[]> {
  const cached = cache.get(ingredient);
  if (cached) return cached;

  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  const remoteMeals = data?.meals ?? [];
  const localMeals = getLocalMealsByIngredient(ingredient);
  
  const allMeals = [...remoteMeals, ...localMeals];
  const seen = new Set<string>();
  const meals: MealSummary[] = [];
  
  for (const m of allMeals) {
    if (!seen.has(m.idMeal)) {
      seen.add(m.idMeal);
      meals.push(m);
    }
  }
  
  cache.set(ingredient, meals);
  return meals;
}

export async function fetchMealById(
  id: string
): Promise<MealDetail | null> {
  if (id.startsWith("local-")) {
    return getLocalMealById(id);
  }

  const data = await fetchJson<{ meals: MealDetail[] | null }>(
    `${BASE}/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data?.meals?.[0] ?? null;
}

export async function searchMealsByName(
  name: string
): Promise<MealSummary[]> {
  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/search.php?s=${encodeURIComponent(name)}`
  );
  const remoteMeals = data?.meals ?? [];
  const localMeals = searchLocalMealsByName(name);
  
  const allMeals = [...remoteMeals, ...localMeals];
  const seen = new Set<string>();
  const meals: MealSummary[] = [];
  
  for (const m of allMeals) {
    if (!seen.has(m.idMeal)) {
      seen.add(m.idMeal);
      meals.push(m);
    }
  }
  
  return meals;
}

export async function fetchIngredientList(): Promise<IngredientItem[]> {
  const data = await fetchJson<{ meals: IngredientItem[] | null }>(
    `${BASE}/list.php?i=list`
  );
  return data?.meals ?? [];
}

export async function getMealsByIngredients(
  ingredients: string[]
): Promise<MealSummary[]> {
  if (ingredients.length === 0) return [];

  const results = await Promise.all(
    ingredients.map((ing) => fetchMealsByIngredient(ing))
  );

  // 1. Try Strict Intersection (AND logic)
  const idSets = results.map((meals) => new Set(meals.map((m) => m.idMeal)));
  const intersectionIds = [...idSets[0]].filter((id) =>
    idSets.every((set) => set.has(id))
  );

  const verified: MealSummary[] = [];
  const normalizedUserIngs = ingredients.map((i) => normalizeIngredient(i));

  if (intersectionIds.length > 0) {
    for (const id of intersectionIds) {
      const detail = await fetchMealById(id);
      if (!detail) continue;

      const mealIngs = parseIngredients(detail).map((i) =>
        normalizeIngredient(i.name)
      );

      const hasAll = normalizedUserIngs.every((ui) =>
        mealIngs.some((mi) => ingredientMatches(ui, mi))
      );

      if (hasAll) {
        verified.push({ idMeal: detail.idMeal, strMeal: detail.strMeal, strMealThumb: detail.strMealThumb });
      }
    }
  }

  // 2. If no strict matches found, use OR logic (any ingredient) but prioritize more matches
  if (verified.length === 0) {
    const mealCounts = new Map<string, { meal: MealSummary; count: number }>();
    for (const ingredientMeals of results) {
      for (const meal of ingredientMeals) {
        const existing = mealCounts.get(meal.idMeal);
        if (existing) {
          existing.count++;
        } else {
          mealCounts.set(meal.idMeal, { meal, count: 1 });
        }
      }
    }

    return Array.from(mealCounts.values())
      .sort((a, b) => b.count - a.count)
      .map((item) => item.meal);
  }

  return verified;
}

export async function getExpandedMealsByIngredients(
  ingredients: string[]
): Promise<MealSummary[]> {
  if (ingredients.length === 0) return [];

  // Get all meals for each ingredient
  const results = await Promise.all(
    ingredients.map((ing) => fetchMealsByIngredient(ing))
  );

  // Flatten and count occurrences
  const mealCounts = new Map<string, { meal: MealSummary; count: number }>();
  for (const ingredientMeals of results) {
    for (const meal of ingredientMeals) {
      const existing = mealCounts.get(meal.idMeal);
      if (existing) {
        existing.count++;
      } else {
        mealCounts.set(meal.idMeal, { meal, count: 1 });
      }
    }
  }

  // Sort by count descending (most matches first)
  return Array.from(mealCounts.values())
    .sort((a, b) => b.count - a.count)
    .map((item) => item.meal);
}

function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ingredientMatches(user: string, meal: string): boolean {
  if (user === meal) return true;
  const uWords = user.split(" ");
  const mWords = meal.split(" ");
  // Every word in user selection must exist in the meal's ingredient name
  const everyUinM = uWords.every((uw) => mWords.some((mw) => mw === uw));
  return everyUinM;
}

export async function getRandomMeals(count = 8): Promise<MealSummary[]> {
  const promises = Array.from({ length: count + 4 }, () =>
    fetchJson<{ meals: MealSummary[] | null }>(`${BASE}/random.php`)
  );
  const results = await Promise.all(promises);
  const seen = new Set<string>();
  const meals: MealSummary[] = [];
  for (const r of results) {
    const meal = r?.meals?.[0];
    if (meal && !seen.has(meal.idMeal)) {
      seen.add(meal.idMeal);
      meals.push(meal);
    }
    if (meals.length === count) break;
  }
  return meals;
}

export function parseIngredients(meal: MealDetail): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal as unknown as Record<string, string>)[`strIngredient${i}`];
    const measure = (meal as unknown as Record<string, string>)[`strMeasure${i}`];
    if (name?.trim()) {
      ingredients.push({ name: name.trim(), measure: measure?.trim() ?? "" });
    }
  }
  return ingredients;
}

export function getIngredientThumb(name: string): string {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`;
}

const areaCache = new Map<string, MealSummary[]>();

export async function fetchMealsByArea(area: string): Promise<MealSummary[]> {
  const cached = areaCache.get(area);
  if (cached) return cached;

  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?a=${encodeURIComponent(area)}`
  );
  const meals = data?.meals ?? [];
  areaCache.set(area, meals);
  return meals;
}

export async function listAreas(): Promise<string[]> {
  const data = await fetchJson<{ meals: { strArea: string }[] | null }>(
    `${BASE}/list.php?a=list`
  );
  return data?.meals?.map((m) => m.strArea) ?? [];
}

const catCache = new Map<string, MealSummary[]>();

export async function fetchMealsByCategory(
  category: string
): Promise<MealSummary[]> {
  const cached = catCache.get(category);
  if (cached) return cached;

  const data = await fetchJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?c=${encodeURIComponent(category)}`
  );
  const meals = data?.meals ?? [];
  catCache.set(category, meals);
  return meals;
}

export async function listCategories(): Promise<string[]> {
  const data = await fetchJson<{ meals: { strCategory: string }[] | null }>(
    `${BASE}/list.php?c=list`
  );
  return data?.meals?.map((m) => m.strCategory) ?? [];
}

export const CONTINENT_AREAS: Record<string, string[]> = {
  Africa: [
    'Algerian', 'Angolan', 'Beninese', 'Botswanan', 'Burkinabe',
    'Burundian', 'Cameroonian', 'Cape Verdian', 'Central African', 'Chadian',
    'Congolese', 'Djibouti', 'Egyptian', 'Equatorial Guinean', 'Eritrean',
    'Ethiopian', 'Gabonese', 'Gambian', 'Ghanaian', 'Guinean',
    'Guinea-Bissauan', 'Ivorian', 'Kenyan', 'Liberian', 'Libyan',
    'Malagasy', 'Malawian', 'Malian', 'Mauritian', 'Moroccan',
    'Mozambican', 'Namibian', 'Nigerien', 'Nigerian', 'Rwandan',
    'Senegalese', 'Seychellois', 'Sierra Leonean', 'Somalian', 'South African',
    'South Sudanese', 'Sudanese', 'Tanzanian', 'Togolese', 'Tunisian',
    'Ugandan', 'Zambian', 'Zimbabwean', 'Motswana', 'Mosotho',
  ],
  Asia: [
    'Afghan', 'Armenian', 'Azerbaijani', 'Bahraini', 'Bangladeshi',
    'Bhutanese', 'Bruneian', 'Burmese', 'Cambodian', 'Chinese',
    'Emirati', 'Filipino', 'Georgian', 'Hong Konger', 'Indian',
    'Indonesian', 'Iranian', 'Iraqi', 'Israeli', 'Japanese',
    'Jordanian', 'Kazakhstani', 'Kirghiz', 'Korean', 'Kosovar',
    'Kuwaiti', 'Laotian', 'Lebanese', 'Malaysian', 'Maldivan',
    'Mongolian', 'Nepalese', 'North Korean', 'Omani', 'Pakistani',
    'Palestinian', 'Qatari', 'Saudi Arabian', 'Singaporean', 'South Korean',
    'Sri Lankan', 'Syrian', 'Taiwanese', 'Tadzhik', 'Thai',
    'Turkmen', 'Turkish', 'Tuvaluan', 'Uzbekistani', 'Vietnamese',
    'Yemeni',
  ],
  Europe: [
    'Albanian', 'Andorran', 'Austrian', 'Belarusian', 'Belgian',
    'Bosnian', 'British', 'Bulgarian', 'Channel Islander', 'Croatian',
    'Cypriot', 'Czech', 'Danish', 'Dutch', 'Estonian',
    'Faroese', 'Finnish', 'French', 'German', 'Gibraltar',
    'Greek', 'Greenlandic', 'Herzegovinian', 'Hungarian', 'Icelander',
    'Irish', 'Italian', 'Kosovar', 'Latvian', 'Liechtensteiner',
    'Lithuanian', 'Luxembourger', 'Macedonian', 'Maltese', 'Moldovan',
    'Monacan', 'Montenegrin', 'Norwegian', 'Polish', 'Portuguese',
    'Romanian', 'Russian', 'Sammarinese', 'Serbian', 'Slovak',
    'Slovene', 'Spanish', 'Swedish', 'Swiss', 'Ukrainian',
    'Vatican',
  ],
  'North America': [
    'American', 'Antiguan', 'Aruban', 'Bahamian', 'Barbadian',
    'Belizean', 'Bermudian', 'Canadian', 'Caymanian', 'Costa Rican',
    'Cuban', 'Dominican', 'Salvadoran', 'Grenadian', 'Guadeloupian',
    'Guatemalan', 'Haitian', 'Honduran', 'Jamaican', 'Mexican',
    'Nicaraguan', 'Panamanian', 'Puerto Rican', 'Saint Lucian',
    'Trinidadian',
  ],
  'South America': [
    'Argentine', 'Bolivian', 'Brazilian', 'Chilean', 'Colombian',
    'Ecuadorean', 'Guyanese', 'Paraguayan', 'Peruvian', 'Surinamer',
    'Uruguayan', 'Venezuelan',
  ],
  Oceania: [
    'Australian', 'Fijian', 'Guamanian', 'Kiribati', 'Marshallese',
    'Micronesian', 'Nauruan', 'New Zealander', 'Palauan',
    'Papua New Guinean', 'Samoan', 'Solomon Islander', 'Tongan',
    'Ni-Vanuatu',
  ],
}
