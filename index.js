import * as Carousel from "./Carousel.js";

const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

const API_KEY =
  " live_WYqAl9eSdeYwxHh8ogA8h2ShGNTGWOjg3GfTo2jYNI0gW2ouv1qQnAemMubeLeg7 ";
axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
axios.defaults.headers.common["x-api-key"] = API_KEY;

// step 1

async function initialLoad() {
  let response = await axios("breeds/");
  let breeds = await response.data;

  console.log(breeds);

  breeds.forEach((breed) => {
    const opt = document.createElement("option");
    opt.value = breed.id;
    opt.textContent = breed.name;

    breedSelect.appendChild(opt);
  });

  prepareCarosel();
}

initialLoad();

// step 2

breedSelect.addEventListener("change", prepareCarosel);

async function prepareCarosel() {
  const selectedBreedId = breedSelect.value;
  console.log("event");
  let response = await axios(
    `images/search?limit=25&breed_ids=${selectedBreedId}`,
    { onDownloadProgress: updateProgress }
  );

  let pictures = await response.data;
  console.log("pictures", pictures);
  caroselSetup(pictures);
}

async function caroselSetup(pictures, favorite) {
  Carousel.clear();

  pictures.forEach((picture) => {
    let element = Carousel.createCarouselItem(
      picture.url,
      breedSelect.value,
      picture.id
    );
    Carousel.appendCarousel(element);
  });

  console.log(pictures[0]);

  if (favorite) {
    console.log("favorites");
    infoDump.innerHTML = `
      <h2>Favorites</h2>`;
  } else if (pictures[0]) {
    console.log("image exisits");
    infoDump.innerHTML = `
      <h2>${pictures[0].breeds[0].name}</h2>
      <p>Description: ${pictures[0].breeds[0].description}</p>
      <p>Temperament: ${pictures[0].breeds[0].temperament}</p>
      <p>Origin: ${pictures[0].breeds[0].origin}</p>`;
  } else {
    infoDump.innerHTML =
      "<div class='text-center'>No information on this breed, sorry!</div>";
  }

  Carousel.start();
}

// step 3 4 5
axios.interceptors.request.use(
  function (config) {
    console.log("Request Started.");
    progressBar.style.width = "0%";
    config.metadata = { startTime: new Date() };
    document.body.style.cursor = "progress";
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    response.config.metadata.endTime = new Date();
    response.duration =
      response.config.metadata.endTime - response.config.metadata.startTime;
    console.log(`Request took ${response.duration} milliseconds.`);
    document.body.style.cursor = "default";
    return response;
  },
  function (error) {
    error.config.metadata.endTime = new Date();
    error.duration =
      error.config.metadata.endTime - error.config.metadata.startTime;
    console.log(`Request took ${error.duration} milliseconds.`);
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

//step 6
function updateProgress(progressEvent) {
  console.log("progess", progressEvent);

  progressBar.style.width = progressEvent.progress * 100 + "%";
}

// step 7 - 8

export async function favourite(imgId) {
  const isFavorite = await axios(`favourites?image_id=${imgId}`);
  console.log("is favorite", isFavorite);

  if (isFavorite.data[0]) {
    console.log("deleted favorite");
    await axios.delete(`/favourites/${isFavorite.data[0].id}`);
  } else {
    console.log("added favorite");
    await axios.post("favourites", { image_id: imgId });
  }
}

// step9

getFavouritesBtn.addEventListener("click", () => {
  getFavourites();
});

async function getFavourites() {
  const favourites = await axios(`/favourites`);
  console.log("step 9", favourites);

  const list = [];
  favourites.data.forEach((favorite) => {
    console.log(favorite.image);
    list.push(favorite.image);
  });
  console.log("favorites list:", list);
  caroselSetup(list, true);
}
