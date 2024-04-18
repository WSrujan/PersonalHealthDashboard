document.getElementById("bmi-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var height = parseFloat(document.getElementById("height").value);
  var weight = parseFloat(document.getElementById("weight").value);
  var unitSystem = document.getElementById("unit-system").value;

  if (height > 0 && weight > 0) {
    if (unitSystem === "imperial") {
      // Convert height from inches to centimeters
      height *= 2.54;
      // Convert weight from pounds to kilograms
      weight *= 0.453592;
    }

    var bmi = weight / Math.pow(height / 100, 2);
    var resultText = "Your BMI is " + bmi.toFixed(1);

    if (bmi < 18.5) {
      resultText += " and you are in the underweight range.";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      resultText += " and you are in the normal range.";
    } else if (bmi >= 25 && bmi <= 29.9) {
      resultText += " and you are in the overweight range.";
    } else {
      resultText += " and you are in the obesity range.";
    }

    document.getElementById("result").textContent = resultText;
  } else {
    alert("Please enter valid numbers for height and weight.");
  }
});

let originalNutritionData = {};

function fetchNutritionData(query) {
  fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": "d9d79ae700",
      "x-app-key": "02bf1b82651f00ad424efc6ce88e157900",
    },
    body: JSON.stringify({ query }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayNutritionLabel((originalNutritionData = data.foods[0]));
    })
    .catch((error) => {
      console.error("Error fetching nutrition data:", error);
    });
}

function displayNutritionLabel(nutritionData, isUpdate = false) {
  const labelContainer = document.getElementById("nutrition-label");

  if (isUpdate) {
    const nutritionRows = labelContainer.querySelectorAll(".nutrition-row");
    nutritionRows.forEach((row) => row.remove());
  } else {
    labelContainer.innerHTML = "";
  }

  let productName = labelContainer.querySelector(".product-name");
  if (!productName) {
    productName = document.createElement("div");
    productName.className = "product-name";
    labelContainer.appendChild(productName);
  }
  productName.textContent = nutritionData.food_name || "Product Name";

  let productImage = labelContainer.querySelector(".product-image");
  if (!productImage) {
    productImage = document.createElement("img");
    productImage.className = "product-image";
    labelContainer.appendChild(productImage);
  }
  productImage.src = nutritionData.photo.thumb || "default-image.png";
  productImage.alt = nutritionData.food_name || "Product Image";

  let servingSizeInput = labelContainer.querySelector(".serving-size-input");
  if (!servingSizeInput) {
    servingSizeInput = document.createElement("input");
    servingSizeInput.type = "text"; // Change to "text" to allow decimal values
    servingSizeInput.className = "serving-size-input";
    servingSizeInput.pattern = "[0-9]*[.,]?[0-9]*"; // Pattern to allow numbers with decimal point or comma
    servingSizeInput.value = nutritionData.serving_qty;
    labelContainer.appendChild(servingSizeInput);

    let servingUnit = document.createElement("span");
    servingUnit.className = "serving-unit";
    servingUnit.textContent = nutritionData.serving_unit || "unit";
    labelContainer.appendChild(servingUnit);
  }

  servingSizeInput.oninput = function () {
    let newServingSize = parseFloat(this.value.replace(",", "."));
    if (!isNaN(newServingSize) && newServingSize > 0) {
      let multiplier = newServingSize / originalNutritionData.serving_qty;
      let updatedNutritionData = { ...originalNutritionData };
      for (let key in updatedNutritionData) {
        if (key.startsWith("nf_")) {
          updatedNutritionData[key] = (
            originalNutritionData[key] * multiplier
          ).toFixed(2);
        }
      }
      updatedNutritionData.serving_qty = newServingSize;
      displayNutritionLabel(updatedNutritionData, true);
    }
  };

  // Function to map nutrition facts to their units
  function mapUnits(nutrient) {
    const units = {
      Calories: "kcal",
      "Total Fat": "g",
      "Saturated Fat": "g",
      "Trans Fat": "g",
      Cholesterol: "mg",
      Sodium: "mg",
      "Total Carbohydrate": "g",
      "Dietary Fiber": "g",
      "Total Sugars": "g",
      "Added Sugars": "g",
      Protein: "g",
      "Vitamin D": "\u00b5g",
      Calcium: "mg",
      Iron: "mg",
      Potassium: "mg",
    };
    return units[nutrient] || "";
  }

  // Create and append nutrition rows
  let nutrients = [
    { name: "Calories", value: nutritionData.nf_calories },
    { name: "Total Fat", value: nutritionData.nf_total_fat },
    { name: "Saturated Fat", value: nutritionData.nf_saturated_fat },
    { name: "Trans Fat", value: nutritionData.nf_trans_fatty_acid },
    { name: "Cholesterol", value: nutritionData.nf_cholesterol },
    { name: "Sodium", value: nutritionData.nf_sodium },
    { name: "Total Carbohydrate", value: nutritionData.nf_total_carbohydrate },
    { name: "Dietary Fiber", value: nutritionData.nf_dietary_fiber },
    { name: "Total Sugars", value: nutritionData.nf_sugars },
    { name: "Added Sugars", value: nutritionData.nf_added_sugars },
    { name: "Protein", value: nutritionData.nf_protein },
    { name: "Vitamin D", value: nutritionData.nf_vitamin_d },
    { name: "Calcium", value: nutritionData.nf_calcium },
    { name: "Iron", value: nutritionData.nf_iron },
    { name: "Potassium", value: nutritionData.nf_potassium },
    // ... add other nutrients here
  ];

  nutrients.forEach((nutrient) => {
    if (nutrient.value !== undefined) {
      let row = createNutritionRow(
        nutrient.name,
        nutrient.value,
        mapUnits(nutrient.name)
      );
      if (row) {
        labelContainer.appendChild(row);
      }
    }
  });

  function createNutritionRow(name, value, unit) {
    if (value !== undefined) {
      let row = document.createElement("div");
      row.className = "nutrition-row";
      let nameDiv = document.createElement("div");
      nameDiv.textContent = name;
      let valueDiv = document.createElement("div");

      // Round the value to two decimal places using Math.round()
      const roundedValue = Math.round(value * 100) / 100;
      valueDiv.textContent = `${roundedValue} ${unit}`;

      row.appendChild(nameDiv);
      row.appendChild(valueDiv);
      return row;
    }
    return null;
  }
}

document.getElementById("search").addEventListener("click", function () {
  fetchNutritionData(document.getElementById("food-search").value);
});
