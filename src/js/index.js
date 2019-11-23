import Search from "./models/Search";
import * as searchView from "./views/searchView";
import { elements, renderLoader, clearLoader } from "./views/base";

/* Global state of the app
1 - Search Object
2 - Current recipe object
3 - Shopping list object
4 - Liked recipes
*/
const state = {};

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
