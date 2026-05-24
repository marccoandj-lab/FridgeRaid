export interface Cookbook {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: number;
}

export interface CookbookMember {
  id: string;
  cookbookId: string;
  userId: string;
  joinedAt: number;
  displayName?: string;
}

export interface CookbookRecipe {
  id: string;
  cookbookId: string;
  addedBy: string;
  type: "meal" | "custom";
  likes: string[];
  addedAt: number;
  authorName?: string;
  idMeal?: string;
  strMeal?: string;
  strMealThumb?: string;
  name?: string;
  ingredients?: string[];
  instructions?: string;
  imageUrl?: string;
}

export interface CookbookWithMeta extends Cookbook {
  memberCount: number;
  recipeCount: number;
}
