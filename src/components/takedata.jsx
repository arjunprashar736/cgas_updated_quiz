import React, { useState } from "react";
import { useState, useCallback, useContext } from "react";
import axios from "axios";

const takedata = () => {
  const [query, setQuery] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  const API_KEY = `9dfb0f4847a244b8a6e9285dc3bcae9a`;

  const fetchRecipe = async () => {
    try {
      setError("");
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&apiKey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch recipes. Check your API key and quota."
        );
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Use the first recipe from the results
        const recipe = data.results[0];
        setRecipe({
          name: recipe.title,
          description: recipe.summary.replace(/<[^>]+>/g, ""), // Remove HTML tags
          ingredients: recipe.extendedIngredients.map((item) => item.original),
          instructions: recipe.analyzedInstructions[0]?.steps.map(
            (step) => step.step
          ),
          diet: recipe.diets.join(", "),
        });
      } else {
        setError("No recipes found for the given query.");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Recipe Finder</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a recipe name"
        style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
      />
      <button
        onClick={fetchRecipe}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Search
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {recipe && (
        <div>
          <h2>{recipe.name}</h2>
          <p>
            <strong>Description:</strong> {recipe.description}
          </p>
          <p>
            <strong>Diet:</strong> {recipe.diet}
          </p>
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default takedata;
