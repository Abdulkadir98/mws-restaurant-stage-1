
let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

var dbPromise = openDatabase();
if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then(function() {
    console.log('successfully registered')
  }).catch(function() {
    console.log('some error occured');
  });
}

window.addEventListener('load', function(event){
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImage.classList.add('fade-in');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
  }
});
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();

    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const imageUrl = DBHelper.imageUrlForRestaurant(restaurant);
  const placeholderUrl = 'images/1.jpg';
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.classList.add('lazy', 'restaurant-img');
  // image.src = placeholderUrl;
  image.alt = restaurant.name;
  //image.srcset = defaultImageUrl + " 800w, " + defaultImageUrl.slice(0, -4) + "-medium.jpg" + " 500w";
  image.setAttribute('data-src', imageUrl);
  image.setAttribute('data-srcset', imageUrl + " 800w, " + imageUrl.slice(0, -5) + "-medium.webp" + " 500w");

  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhoodContainer = document.createElement('div');
  neighborhoodContainer.className = 'neighborhood-container';
  const neighborhood = document.createElement('div');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhoodContainer.append(neighborhood);

  const addFavorite = document.createElement('button');


  if(restaurant.is_favorite === 'true'){
    addFavorite.className = 'favorite-btn';
    addFavorite.setAttribute('aria-label', `mark ${restaurant.name} as unfavorite`);

  }

  else{
    addFavorite.className = 'unfavorite-btn';
    addFavorite.setAttribute('aria-label', `mark ${restaurant.name} as favorite`);

  }

  addFavorite.style.cssFloat = 'right';

  addFavorite.onclick = function() {
    console.log(restaurant.is_favorite);
    let isFavNow;
    if(restaurant.is_favorite === 'true'){
      isFavNow = false;
      restaurant.is_favorite = 'false';
    }
    else {
      restaurant.is_favorite = 'true';
      isFavNow = true;
    }

    DBHelper.updateFavoriteStatus(restaurant.id, restaurant.is_favorite);

    changeFavoriteElementClass(this, isFavNow);
  };
  neighborhoodContainer.append(addFavorite);

  li.append(neighborhoodContainer);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const moreContainer = document.createElement('div');
  moreContainer.className = 'view-details-btn';
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View Details of ' + restaurant.name);

  moreContainer.append(more);
  li.append(moreContainer);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

function openDatabase() {
  if(!navigator.serviceWorker)
    return Promise.resolve();

  return idb.open('mws', 1, function(upgradeDb){
    let store = upgradeDb.createObjectStore('restaurants', {
      keyPath: 'id'
    });

  });
}

function changeFavoriteElementClass(el, isFav) {

  if(isFav){
    el.classList.remove('unfavorite-btn');
    el.classList.add('favorite-btn');
    el.setAttribute('aria-label', 'mark as favorite');
  }
  else {
    el.classList.remove('favorite-btn');
    el.classList.add('unfavorite-btn');
    el.setAttribute('aria-label', 'remove as favorite');

    }
}
