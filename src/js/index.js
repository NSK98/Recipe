import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/* Global state of the app
1 - Search Object
2 - Current recipe object
3 - Shopping list object
4 - Liked recipes
*/
const state = {};

/*
Search Controller
*/

const controlSearch = async () => {
  // 1 - Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2 - new search object and add to the state
    state.search = new Search(query);

    // 3 - prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    // 4 - search for recipes
    await state.search.getResults();

    // 5 - render the results in UI
    clearLoader();
    searchView.renderResults(state.search.result);
  }
};

elements.searchBtn.addEventListener("submit", cur => {
  cur.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", cur => {
  const btn = cur.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/*
Recipe Controller
*/

const controlRecipe = async () => {
  // Get ID from URL
  const id = window.location.hash.replace("#", "");
  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight the Selected Search Item
    if (state.search) searchView.highlightSelected(id);

    // Create new Recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcServings();
      state.recipe.calcTime();

      // Render Recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id));
    } catch (error) {
      alert("Error Loading Recipe!");
      console.log(error)
    }
  }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/*
Shop List Controller
*/

const controlList = () => {
  // create a new list if there is none
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list item events
elements.shopping.addEventListener("click", el => {
  const id = el.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (el.target.matches(".shopping__delete, .shopping__delete *")) {
    // delete item from state
    state.list.deleteItem(id);

    // delete item from UI
    listView.deleteItem(id);
  }

  // Handle the Update Button
  else if (el.target.matches(".shopping__count-value")) {
    const val = parseFloat(el.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/*
Like Controller
*/

const controlLike = () => {

  // create new like 
  if(!state.likes) state.likes = new Likes();

  const currentId = state.recipe.id;

  // Recipe is NOT liked yet
  if(!state.likes.isLiked(currentId)){

    // Add Like to state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
      )

      // Toggle the like buttom
      likesView.toggleLikeButton(true);

      // Add like to UI
      likesView.renderLike(newLike);

    // Recipe is LIKED by User
  } else {

    // Remove the like from state
    state.likes.deleteLike(currentId);

    // Toggle the like button
    likesView.toggleLikeButton(false);

    // Remove like from UI
    likesView.deleteLike(currentId);
  }

  likesView.toggleLikesMenu(state.likes.getNumOfLikes());
}

// Restore like recipes and shopping list on page load

window.addEventListener('load', () => {

state.likes = new Likes(); 

// restore likes
state.likes.readStorage();

// toggle like button if any likes
likesView.toggleLikesMenu(state.likes.getNumOfLikes());

// render existing likes
state.likes.likes.forEach(like => likesView.renderLike(like));

state.list = new List();

// restore list
state.list.readStorage();

state.list.items.forEach(item => listView.renderItem(item));
})


// Handling recipe serving button clicks
elements.recipe.addEventListener("click", el => {
  if (el.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      // Decrease button is clicked
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (el.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (el.target.matches(".recipe__btn--add, recipe__btn--add *")) {
    // Add Ingredients to Shopping List
    controlList();
  } else if (el.target.matches(".recipe__love, .recipe__love *")) {
    // Like COntroller
    controlLike();
  }
});
