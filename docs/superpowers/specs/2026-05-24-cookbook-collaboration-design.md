# Cookbook Collaboration Feature — Design Spec

## Overview

Add a social cookbook system to Fridge Raid where users can create personal cookbooks, add recipes (from TheMealDB or custom), share cookbooks with other users via invite codes, and like/unlike recipes within shared cookbooks.

## Aesthetic Direction

**"Ember & Vellum"** — warm, tactile cookbook aesthetic extending the existing amber-on-dark design. Recipe cards styled as pinned index cards on a dark corkboard. Invite codes as hand-stamped metal tags. Empty cookbook = open blank journal.

## Data Model

### Firestore Collections

#### `cookbooks/{docId}`
| Field | Type | Description |
|---|---|---|
| `name` | string | Cookbook display name |
| `ownerId` | string | Firebase UID of creator |
| `inviteCode` | string | Unique 8-char alphanumeric code |
| `createdAt` | number | `Date.now()` timestamp |

#### `cookbookMembers/{docId}`
| Field | Type | Description |
|---|---|---|
| `cookbookId` | string | Reference to cookbook |
| `userId` | string | Firebase UID of member |
| `joinedAt` | number | `Date.now()` timestamp |

#### `cookbookRecipes/{docId}`
| Field | Type | Description |
|---|---|---|
| `cookbookId` | string | Reference to cookbook |
| `addedBy` | string | Firebase UID of the user who added it |
| `type` | `"meal" \| "custom"` | Recipe origin |
| `likes` | `string[]` | Array of userIds who liked this recipe |
| `addedAt` | number | `Date.now()` timestamp |
| `idMeal` | string (optional) | TheMealDB ID (if type="meal") |
| `strMeal` | string (optional) | Meal name (if type="meal") |
| `strMealThumb` | string (optional) | Meal thumbnail URL (if type="meal") |
| `name` | string (optional) | Custom recipe name (if type="custom") |
| `ingredients` | `string[]` (optional) | Custom recipe ingredients (if type="custom") |
| `instructions` | string (optional) | Custom recipe instructions (if type="custom") |
| `imageUrl` | string (optional) | Custom recipe image URL (if type="custom") |

### Composite Index
- `cookbookRecipes`: `cookbookId` (ascending) + `addedAt` (descending)

## Firestore Security Rules

- **Cookbooks:** Create if authenticated; read if owner or member; update/delete only by owner.
- **Members:** Read if member of cookbook; write only on join with valid invite code.
- **Recipes:** Read if member of cookbook; create if member; delete only if `addedBy === auth.uid`.

## Routes

| Route | Page | Description |
|---|---|---|
| `/cookbooks` | CookbooksListPage | List user's cookbooks, create new, join by code |
| `/cookbooks/[id]` | CookbookDetailPage | View cookbook with recipe grid, likes |
| `/cookbooks/[id]/add` | AddRecipePage | Add meal from TheMealDB or create custom recipe |

## Pages

### CookbooksListPage (`/cookbooks`)
- Two-column layout (desktop): left = cookbook list / right = create + join forms
- Cookbook cards showing name, member count, recipe count, invite code badge
- "Create Cookbook" form with name input
- "Join Cookbook" form with invite code input
- Empty state: open blank journal with scribble placeholder lines
- Responsive: stacks to single column on mobile

### CookbookDetailPage (`/cookbooks/[id]`)
- Header: cookbook name + member badges (first-letter avatars) + copyable invite code tag
- Filter bar: "All" / "MealDB" / "Custom"
- Recipe grid (same 2-4 col grid as existing app)
- Each recipe card: thumbnail (or gradient placeholder for custom), name, author, like button with count
- Floating "Add Recipe" FAB button at bottom-right
- Only recipe author sees delete option (long-press or context menu)

### AddRecipePage (`/cookbooks/[id]/add`)
- Two tabs: "From Meals" (TheMealDB search) and "Custom Recipe"
- Search tab: text input for search term + selectable result grid
- Custom tab: name input, ingredients textarea (one per line), instructions textarea, optional image URL
- Submit button adds recipe and redirects back to cookbook detail

## Components

| Component | Props | Description |
|---|---|---|
| `CookbookCard` | cookbook, memberCount, recipeCount | Card for cookbook list |
| `CookbookRecipeCard` | recipe, authorName, isLiked, onLike, onDelete, currentUserId | Recipe card with like button |
| `CreateCookbookForm` | onSubmit | Name input + submit |
| `JoinCookbookForm` | onSubmit | Invite code input + submit |
| `CookbookMemberBadge` | name, size | First-letter avatar circle |

## Hooks

### `useCookbooks()`
- Reads `cookbooks` where `ownerId === user.uid`
- Reads `cookbookMembers` where `userId === user.uid`
- Merges and deduplicates
- Returns: `{ cookbooks, isLoading, createCookbook(name), joinCookbook(code) }`

### `useCookbookRecipes(cookbookId)`
- Reads `cookbookRecipes` where `cookbookId === id`, ordered by `addedAt` desc
- `addRecipe(data)` — creates new recipe doc with `addedBy: user.uid`
- `removeRecipe(recipeId)` — deletes if user is the `addedBy` author
- `toggleLike(recipeId, currentUserId)` — uses `arrayUnion`/`arrayRemove` on `likes`
- Returns: `{ recipes, isLoading, addRecipe, removeRecipe, toggleLike }`

### `useCookbookMembers(cookbookId)`
- Reads `cookbookMembers` where `cookbookId === id`
- Enriches with user display names from Firebase Auth (or falls back to "Anonymous")
- Returns: `{ members, isLoading }`

## Firebase Setup

- Add `getFirestore()` to `lib/firebase.ts`, export `db`
- No additional npm packages needed (Firestore is bundled in firebase v12)

## Navigation

- Add "Cookbooks" link to `Navbar.tsx` between "Favorites" and "Profile"

## TheMealDB Integration

- Reuse existing `lib/mealdb.ts` search functionality for the "add from meals" tab
- Allow searching by name, displaying results as selectable cards

## Invite Code Generation

- 8 characters: alphanumeric (uppercase + digits)
- Check Firestore for uniqueness before saving
- Displayed with copy-to-clipboard button on cookbook detail page

## Edge Cases

- **User leaves cookbook:** Remove from members collection; recipes stay but show "unknown author"
- **Owner deletes cookbook:** Delete cookbook doc + all member docs + all recipe docs (batch delete)
- **Duplicate invite code:** Regenerate and retry
- **Recipe already in cookbook:** Allow duplicates (user may want same meal in different contexts)
- **Unliking:** Simply removes userId from `likes` array