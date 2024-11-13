import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_WYqAl9eSdeYwxHh8ogA8h2ShGNTGWOjg3GfTo2jYNI0gW2ouv1qQnAemMubeLeg7"; // Replace with your actual API key

// Set default headers for axios
axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.baseURL = "https://api.thecatapi.com/v1";

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using axios.
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad() {
  try {
    const response = await axios.get("/breeds");
    const breeds = response.data;

    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Call the event handler to create the initial carousel
    handleBreedSelect();
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}

initialLoad(); // Execute immediately

async function handleBreedSelect() {
  const breedId = breedSelect.value;

  try {
    const response = await axios.get(`/images/search?breed_ids=${breedId}`);
    const cats = response.data;

    // Clear the carousel and infoDump
    Carousel.clearCarousel();
    infoDump.innerHTML = "";

    // Create carousel items
    cats.forEach((cat) => {
      Carousel.addItem(cat.url, cat.id);
    });

    // Create information section (example)
    const breedInfo = cats[0].breeds[0]; // Assuming at least one cat is returned
    const infoHTML = `
      <h2>${breedInfo.name}</h2>
      <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
      <p><strong>Origin:</strong> ${breedInfo.origin}</p>
      <p><strong>Description:</strong> ${breedInfo.description}</p>
    `;
    infoDump.innerHTML = infoHTML;

    // Restart the carousel
    Carousel.startCarousel();
  } catch (error) {
    console.error("Error fetching cat data:", error);
  }
}

breedSelect.addEventListener("change", handleBreedSelect);

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 */
axios.interceptors.request.use(
  (config) => {
    console.log("Request started:", new Date());
    progressBar.style.width = "0%"; // Reset progress bar
    document.body.style.cursor = "progress"; // Show progress cursor
    config.onDownloadProgress = updateProgress; // Add progress event handler
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log("Request finished:", new Date());
    progressBar.style.width = "100%"; // Complete progress bar
    document.body.style.cursor = "default"; // Restore cursor
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    document.body.style.cursor = "default"; // Restore cursor in case of error
    return Promise.reject(error);
  }
);

/**
 * 6. Create a function "updateProgress" that receives a ProgressEvent object.
 */
function updateProgress(progressEvent) {
  console.log("Download progress:", progressEvent);
  const percentCompleted = Math.round(
    (progressEvent.loaded * 100) / progressEvent.total
  );
  progressBar.style.width = `${percentCompleted}%`;
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 */
export async function favourite(imgId) {
  try {
    // Check if the image is already favourited (you'll need to store this information somewhere)
    const isFavourited = checkIfFavourited(imgId); // Replace with your logic

    if (isFavourited) {
      // Delete the favourite
      await axios.delete(`/favourites/${imgId}`); // Replace with the correct endpoint
      console.log("Favourite removed:", imgId);
      // Update UI to reflect the change (e.g., change heart icon)
    } else {
      // Add the favourite
      await axios.post("/favourites", {
        image_id: imgId,
      });
      console.log("Favourite added:", imgId);
      // Update UI to reflect the change (e.g., change heart icon)
    }
  } catch (error) {
    console.error("Error favoriting/unfavoriting image:", error);
  }
}

// Placeholder function for checking if an image is favourited
function checkIfFavourited(imgId) {
  // Replace with your logic to check if the image is already favourited
  // This could involve storing favourites in local storage, or fetching
  // the user's favourites from the API and checking if this image ID exists.
  return false;
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 */
async function getFavourites() {
  try {
    const response = await axios.get("/favourites");
    const favourites = response.data;

    // Clear the carousel
    Carousel.clearCarousel();

    // Display favourites in the carousel
    favourites.forEach((fav) => {
      Carousel.addItem(fav.image.url, fav.image_id);
    });

    // Restart the carousel
    Carousel.startCarousel();
  } catch (error) {
    console.error("Error fetching favourites:", error);
  }
}

// Bind event listener to the "Get Favourites" button
getFavouritesBtn.addEventListener("click", getFavourites);
