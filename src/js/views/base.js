export const elements = {
  searchBtn: document.querySelector(".search"),
  searchInput: document.querySelector(".search__field"),
  searchRes: document.querySelector(".results"),
  searchResList: document.querySelector(".results__list"),
  searchResPages: document.querySelector(".results__pages")
};

// Going to reuse it.. so passing parent parameter
export const renderLoader = parent => {
  const loader = `
    <div class = "loader">
     <svg>
      <use href = "img/icons.svg#icon-cw"></use>
     </svg>
    </div>
    `;
  parent.insertAdjacentHTML("afterbegin", loader);
};

export const clearLoader = () => {
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.parentElement.removeChild(loader);
  }
  
};
