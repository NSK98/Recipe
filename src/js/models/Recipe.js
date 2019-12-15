import axios from "axios";
import {key, proxy} from '../config';
// `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`


export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios
        (`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }
  // Assuming that we need 15 mins for each 3 ingredients
  calcTime() {
    const numIng = this.ingredients.length;
    const periords = numIng / 3;
    this.time = periords * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "cups",
      "teaspoons",
      "teaspoon",
      "pounds"
    ];
    const unitsShort = [
      "tbs",
      "tbs",
      "oz",
      "oz",
      "cup",
      "tsp",
      "tsp",
      "pound",
      "g",
      "kg"
    ];

    const newIngredients = this.ingredients.map(el => {
      // Uniforn Units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // 2) Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

      // Parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex(cur => unitsShort.includes(cur));

      let objIng;
      if (unitIndex > -1) {
        // There is Unit
        const arrCount = arrIng.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        // There is no Unit but 1st element is Number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex == -1) {
        // There is no unit and no number in 1st position
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      return objIng;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // update  servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    // update ingredients
    this.ingredients.forEach(el => {
      el.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
