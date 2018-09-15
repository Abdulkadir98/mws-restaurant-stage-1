let restaurants,neighborhoods,cuisines;var map,markers=[];function openDatabase(){return navigator.serviceWorker?idb.open("mws",1,function(e){e.createObjectStore("restaurants",{keyPath:"id"})}):Promise.resolve()}function changeFavoriteElementClass(e,t){t?(e.classList.remove("unfavorite-btn"),e.classList.add("favorite-btn"),e.setAttribute("aria-label","mark as favorite")):(e.classList.remove("favorite-btn"),e.classList.add("unfavorite-btn"),e.setAttribute("aria-label","remove as favorite"))}navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(function(){console.log("successfully registered")}).catch(function(){console.log("some error occured")}),window.addEventListener("load",function(e){var t=[].slice.call(document.querySelectorAll("img.lazy"));if("IntersectionObserver"in window){let e=new IntersectionObserver(function(t,r){t.forEach(function(t){if(t.isIntersecting){let r=t.target;r.src=r.dataset.src,r.srcset=r.dataset.srcset,r.classList.remove("lazy"),r.classList.add("fade-in"),e.unobserve(r)}})});t.forEach(function(t){e.observe(t)})}}),document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),r=e.selectedIndex,n=t.selectedIndex,a=e[r].value,s=t[n].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=DBHelper.imageUrlForRestaurant(e),r=document.createElement("li"),n=document.createElement("img");n.classList.add("lazy","restaurant-img"),n.alt=e.name,n.setAttribute("data-src",t),n.setAttribute("data-srcset",t+" 800w, "+t.slice(0,-5)+"-medium.webp 500w"),r.append(n);const a=document.createElement("h2");a.innerHTML=e.name,r.append(a);const s=document.createElement("div");s.className="neighborhood-container";const o=document.createElement("div");o.innerHTML=e.neighborhood,s.append(o);const i=document.createElement("button");"true"===e.is_favorite?(i.className="favorite-btn",i.setAttribute("aria-label",`mark ${e.name} as unfavorite`)):(i.className="unfavorite-btn",i.setAttribute("aria-label",`mark ${e.name} as favorite`)),i.style.cssFloat="right",i.onclick=function(){let t;console.log(e.is_favorite),"true"===e.is_favorite?(t=!1,e.is_favorite="false"):(e.is_favorite="true",t=!0),DBHelper.updateFavoriteStatus(e.id,e.is_favorite),changeFavoriteElementClass(this,t)},s.append(i),r.append(s);const l=document.createElement("p");l.innerHTML=e.address,r.append(l);const c=document.createElement("div");c.className="view-details-btn";const u=document.createElement("a");return u.innerHTML="View Details",u.href=DBHelper.urlForRestaurant(e),u.setAttribute("aria-label","View Details of "+e.name),c.append(u),r.append(c),r}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});var dbPromise=openDatabase();class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/"}static fetchRestaurants(e){showCachedRestaurants().then(function(t){0==t.length?fetch(DBHelper.DATABASE_URL+"restaurants").then(e=>{if(e.ok)return e.json()}).then(function(t){console.log(t),dbPromise.then(function(e){let r=e.transaction("restaurants","readwrite").objectStore("restaurants");for(const e of t)r.put(e)}),e(null,t)}).catch(t=>{console.log(t),e(error,null)}):e(null,t)}).catch(function(e){console.log(e)})}static fetchRestaurantById(e,t){fetch(DBHelper.DATABASE_URL+`restaurants/${e}`).then(function(e){if(e.ok)return e.json()}).then(function(e){e?t(null,e):(console.log("restaurant does not exist"),t("restaurant does not exist",null))}).catch(function(e){console.log("error",e),t(null,restaurant)})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.cuisine_type==e);t(null,r)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.neighborhood==e);t(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,r){DBHelper.fetchRestaurants((n,a)=>{if(n)r(n,null);else{let n=a;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),r(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].neighborhood),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].cuisine_type),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`images/${e.photograph}.webp`:"images/10.webp"}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}static updateFavoriteStatus(e,t){console.log("Changing status to",t),fetch(DBHelper.DATABASE_URL+`restaurants/${e}/?is_favorite=${t}`,{method:"PUT"}).then(function(r){r.ok&&dbPromise.then(function(r){r.transaction("restaurants","readwrite").objectStore("restaurants").iterateCursor(r=>{if(r)if(r.value.id==e){let e=r.value;e.is_favorite="true"===t?"true":"false",r.update(e),console.log("Status changed")}else r.continue()})})})}static fetchReviewsByRestId(e){return DBHelper.getStoredObjectById("reviews","restaurant",e).then(t=>(console.log("Looking for stored reviews"),0==t.length?(console.log("No reviews stored"),fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${e}`).then(e=>e.json()).then(e=>(dbPromise.then(t=>{if(!t)return;let r=t.transaction("reviews","readwrite").objectStore("reviews");for(const t of e)r.put(t)}),console.log("reviews are",e),Promise.resolve(e)))):(console.log("returning cached reviews"),console.log("cached reviews",t),Promise.resolve(t))))}static getStoredObjectById(e,t,r){return dbPromise.then(function(n){if(!n)return;return n.transaction(e).objectStore(e).index(t).getAll(r)})}static addReview(e){let t={name:"addReview",data:e,object_type:"review"};if(navigator.onLine||"addReview"!==t.name){var r={method:"POST",body:JSON.stringify(e),headers:new Headers({"Content-Type":"application/json"})};fetch(DBHelper.DATABASE_URL+"reviews/",r).then(e=>{if(e.ok)return e.json();console.log("Enter proper data")}).then(e=>{console.log("Review added successfully",e)}).catch(e=>{console.log("error",e)})}else DBHelper.sendDataWhenOnline(t)}static sendDataWhenOnline(e){console.log("Offline obj",e),localStorage.setItem("data",JSON.stringify(e.data)),console.log(`Local storage: ${e.object_type} stored`),window.addEventListener("online",t=>{console.log("Browser online again");let r=JSON.parse(localStorage.getItem("data"));[...document.querySelectorAll(".reviews_offline")].forEach(e=>{e.classList.remove("reviews_offline"),e.querySelector(".offline_label").remove()}),null!==r&&console.log(r),"addReview"===e.name&&DBHelper.addReview(e.data),console.log("Local data sent to api"),localStorage.removeItem("data"),console.log(`Local storage: ${e.object_type} removed `)})}static saveReviewInDb(e){let t=e;t.restaurant_id=parseInt(e.restaurant_id),dbPromise.then(e=>{e||console.log("error in accessing db"),e.transaction("reviews","readwrite").objectStore("reviews").add(t)}).catch(e=>console.log("error",e))}}function openDatabase(){return navigator.serviceWorker?idb.open("mws",1,function(e){e.createObjectStore("restaurants",{keyPath:"id"});e.createObjectStore("reviews",{autoIncrement:!0}).createIndex("restaurant","restaurant_id")}):Promise.resolve()}function showCachedRestaurants(){return dbPromise.then(function(e){if(!e)return;return e.transaction("restaurants").objectStore("restaurants").getAll()})}