let restaurant;
var map;
let reviewsURL = 'http://localhost:1337/reviews/?restaurant_id=';
let id;

let modal = document.getElementById('myModal');
let span = document.getElementsByClassName('close')[0];
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
   id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = "restaurant";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML(restaurant.id);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (id) => {
  let reviews;
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  DBHelper.fetchReviewsByRestId(id)
  .then(function(reviews){
    if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  for(const review of reviews){
    ul.appendChild(createReviewHTML(review));
  }

  container.appendChild(ul);
  const addReviewBtn = document.createElement('button');
  const btnText = document.createTextNode('Add Review');
  addReviewBtn.className = 'add-review';
  addReviewBtn.appendChild(btnText);

  addReviewBtn.addEventListener('click', addReview);

  container.appendChild(addReviewBtn);
  });

}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');


  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.style.margin = '0 20px 0';
  name.style.color = "#FFFFFF";
  name.style.fontSize = "large";

  // const date = document.createElement('p');
  // date.innerHTML = timeConverter(review.updatedAt);
  // date.style.margin = '0 20px 0';
  // date.style.float = 'right';
  // date.style.color = '#A8A6A6';

  const header = document.createElement('div');
  header.appendChild(name);
  //header.appendChild(date);
  header.className = 'review-header';

  li.style.borderTopLeftRadius = '20px';
  li.style.borderBottomRightRadius = '20px';

  if(!navigator.onLine){
    const connection_status = document.createElement('p');
    connection_status.classList.add('offline_label');
    connection_status.innerHTML = '(OFFLINE)';
    header.appendChild(connection_status);
    li.classList.add('reviews_offline');
  }

  li.appendChild(header);



  // const ratingContainer = document.createElement('div');
  // ratingContainer.style.backgroundColor = "orange";
  const rating = document.createElement('div');
  rating.innerHTML = `RATING: ${review.rating}`;
  rating.className = 'rating-container';

  // ratingContainer.appendChild(rating);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function addReview(event){

  modal.style.display = 'block';

  let saveBtn = document.getElementById('savebtn');
  savebtn.onclick = function(event) {
    event.preventDefault();

    const restaurant_id = id;
    const name = document.getElementById('name').value;
    const rating = document.querySelector('#rating option:checked').value;
    const comments = document.getElementById('comment').value;

    if(name.length >0 && rating.length>0 && comments.length>0){
      let data = {
        restaurant_id,
        name,
        rating,
        comments
      }
        DBHelper.addReview(data);
        addReviewHtml(data);
        DBHelper.saveReviewInDb(data);
        modal.style.display = 'none';
        document.getElementById('review-form').reset();

    }
  }

}

function addReviewHtml(review){
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
}

window.onclick = function(event){
  if(event.target == modal)
    modal.style.display = 'none';
}
