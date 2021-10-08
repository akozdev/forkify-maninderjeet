import * as model from "./model.js"
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from './views/paginationView.js'
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import 'core-js/stable';
import  'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlRecipes = async function () {
  try{
    //fetch hash from url
    const id = window.location.hash.slice(1);
    console.log(id);

    if(!id) return ;

    recipeView.renderSpinner();

    //0. Update selected reults view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //1.updating bookamrks view
    bookmarksView.update(model.state.bookmarks);

    //2. Loading the recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    //3. Rendering the recipe
    //because we cannot pass anything in recipeView, therefore it is
    //(object) is not changable but we can render the object with render
    //which inturn renders the object from initial value to new values
    recipeView.render(model.state.recipe);
  }
  catch(err){
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function (){
  try{
    resultsView.renderSpinner();

    //1. get search query
    const query = searchView.getQuery();
    if(!query) return;

    //2. Load search results
    await model.loadSearchResults(query);
    
    //3. Render results
    resultsView.render(model.getSearchResultsPage());

    //4. Render initial pagination
    paginationView.render(model.state.search);

  }catch(err){
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //Render NEW initial pagination
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  //Update the recipe servings
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlAddBookmark = function () {
  if(!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe)
  }
  else {
    model.deleteBookmark(model.state.recipe.id)
  };

  //recipe view render
  recipeView.update(model.state.recipe);

  //bookmarkview render
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  try{
    //show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //Display success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in url
    window.history.pushState(null, '', `${model.state.recipe.id}`)

    //close forum window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC * 1000)

  }catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  // controlServings();
};
init();