/**
 * Common database helper functions.
 */

 var dbPromise = openDatabase();
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    showCachedRestaurants().then(function(restaurants){

      if(restaurants.length == 0){
        fetch(DBHelper.DATABASE_URL)
        .then((response) => {
        if(response.ok)
        return response.json()

      }).then(function(restaurants){
      console.log(restaurants);

      dbPromise.then(function(db){
      let keyStore = db.transaction('restaurants', 'readwrite')
                        .objectStore('restaurants');
      for(const restaurant of restaurants){
        keyStore.put(restaurant);
      }
     });
      callback(null, restaurants);
      }).catch((e) => {
        console.log(e);
        callback(error, null);
      });
    }
    else {
      callback(null, restaurants);
    }

    }).catch(function(err){
      console.log(err);
    });
}
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.

    fetch(DBHelper.DATABASE_URL+`/${id}`).then(function(response){
      if(response.ok)
        return response.json();
    }).then(function(restaurant){
      if(restaurant) {
        callback(null, restaurant);
      }
      else {
        callback('restaurant does not exist', null);
      }
    }).catch(function(err){
      callback(null, restaurant);
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {

          DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
        callback(error, null);
        }
        else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });    // Fetch all restaurants
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {

        DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph)
    return (`images/${restaurant.photograph}.webp`);
    else
      return('images/10.webp')
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

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

function showCachedRestaurants(){

  return dbPromise.then(function(db){
    if(!db) return;
    let store = db.transaction('restaurants').objectStore('restaurants');

    return store.getAll();
  });
}

