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
    return `http://localhost:${port}/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    showCachedRestaurants().then(function(restaurants){

      if(restaurants.length == 0){
        fetch(DBHelper.DATABASE_URL + 'restaurants')
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

    fetch(DBHelper.DATABASE_URL+`restaurants/${id}`).then(function(response){
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

  static fetchReviewsByRestId(id) {
    return fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`)
    .then(response => response.json())
    .then(reviews => {
      dbPromise.then(db => {
        if(!db) return;

        let tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        for(const review of reviews)
          store.put(review);
      });
      console.log('Restaurant revs are', reviews);
      return Promise.resolve(reviews);
    }).catch((error) => {
      return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
      .then(storedReviews => {
        console.log('Looking for stored reviews', storedReviews);
        return Promise.resolve(storedReviews);
      })
    });
  }

  static getStoredObjectById(table, index, id){
    return dbPromise.then(function(db){
      if(!db) return;

      const store = db.transaction(table).objectStore(table);
      const indexId = store.index(index);
      return indexId.getAll(id);
    });
  }

  static addReview(review){

    let offline_obj = {
      name: 'addReview',
      data: review,
      object_type:'review'
    };

    if(!navigator.onLine && (offline_obj.name === 'addReview')){
      DBHelper.sendDataWhenOnline(offline_obj);
      return;
    }

    var fetch_options = {
      method: 'POST',
      body: JSON.stringify(review),
      headers: new Headers({
        'Content-Type':'application/json'
      })
    };

    fetch(DBHelper.DATABASE_URL+'reviews/', fetch_options).then(response => {
      if(response.ok)
        return response.json();
      else
        console.log('Enter proper data');
    }).then(data => {console.log('Review added successfully', data)})
      .catch(error => {console.log('error', error)});
  }

  static sendDataWhenOnline(offline_obj){
    console.log('Offline obj', offline_obj);

    localStorage.setItem('data', JSON.stringify(offline_obj.data));
    console.log(`Local storage: ${offline_obj.object_type} stored`);

    window.addEventListener('online', (event) => {
      console.log('Browser online again');
      let data = JSON.parse(localStorage.getItem('data'));

      if(data !== null)
        console.log(data);
      if(offline_obj.name === 'addReview'){
        DBHelper.addReview(offline_obj.data);
      }

      console.log('Local data sent to api');

      localStorage.removeItem('data');
      console.log(`Local storage: ${offline_obj.object_type} removed `);

    });
  }

}




function openDatabase() {
  if(!navigator.serviceWorker)
    return Promise.resolve();

  return idb.open('mws', 1, function(upgradeDb){
    let store = upgradeDb.createObjectStore('restaurants', {
      keyPath: 'id'
    });

    const reviewsStore = upgradeDb.createObjectStore('reviews', {
      keyPath: 'id'
    });
    reviewsStore.createIndex('restaurant', 'restaurant_id');

});
}

function showCachedRestaurants(){

  return dbPromise.then(function(db){
    if(!db) return;
    let store = db.transaction('restaurants').objectStore('restaurants');

    return store.getAll();
  });
}

