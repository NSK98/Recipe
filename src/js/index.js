import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
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

elements.searchResPages.addEventListener('click', cur => {
  const btn = cur.target.closest('.btn-inline');
  if(btn){
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }

})

/*
Recipe Controller
*/

const controlRecipe = async () => {

  // Get ID from URL
   const id = window.location.hash.replace('#','');
   if(id){

    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight the Selected Search Item
    if(state.search)
    searchView.highlightSelected(id);

    // Create new Recipe object
    state.recipe = new Recipe(id);

    try{
         // Get recipe data
    await state.recipe.getRecipe();
    state.recipe.parseIngredients();

    // Calculate servings and time 
    state.recipe.calcServings();
    state.recipe.calcTime();

    // Render Recipe
    clearLoader();
    recipeView.renderRecipe(state.recipe);
    

    }
    catch(error){
      alert('Error Loading Recipe!');
    }

   }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));