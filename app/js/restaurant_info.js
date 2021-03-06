let restaurant;
var map;


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.map = new google.maps.Map(document.getElementById('map'), {
//         zoom: 16,
//         center: restaurant.latlng,
//         scrollwheel: false
//       });
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
//     }
//   });
}

/**
 * Fetch Restaurant when the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            if (typeof google !== 'undefined') {
                self.map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: restaurant.latlng,
                    scrollwheel: false
                });
            }
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
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

    const picture = document.getElementById('restaurant-img');
    picture.className = 'restaurant-img';

    if (typeof google !== 'undefined') {
        const source1 = document.createElement('source');
        source1.srcset = DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w400.webp 400w, ';
        source1.srcset = source1.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w600.webp 600w, ');
        source1.srcset = source1.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w800.webp 800w');
        source1.sizes = '(max-width: 600px) 90vw, (max-width: 90px) 60vw, (min-width: 901px) 45vw';
        source1.type = 'image/webp';
        picture.append(source1);

        const source2 = document.createElement('source');
        source2.srcset = DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w400.jpg 400w, ';
        source2.srcset = source2.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w600.jpg 600w, ');
        source2.srcset = source2.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w800.jpg 800w');
        source2.sizes = '(max-width: 600px) 90vw, (max-width: 90px) 60vw, (min-width: 901px) 45vw';
        source2.type = 'image/jpg';
        picture.append(source2);
    }

    const image = document.createElement('img');
    image.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
    image.alt = restaurant.name + ' restaurant';
    picture.append(image);

    const icon = document.getElementById('restaurant-fav-icon');
    if (restaurant.is_favorite === false || restaurant.is_favorite === "false") {
        icon.src = "/img/icons/fav-icon-o.png";
    } else {
        icon.src = "/img/icons/fav-icon.png";
    }

    icon.addEventListener('click', () => {
        if (icon.src.includes("fav-icon-o.png")) {
            DBHelper.addRestaurantToFav(restaurant.id, true, (err, res) => {
                icon.src = "/img/icons/fav-icon.png";
            });
        } else {
            DBHelper.addRestaurantToFav(restaurant.id, false, (err, res) => {
                icon.src = "/img/icons/fav-icon-o.png";
            });
        }
    });

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fetch reviews
    fillReviewsHTML();
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
fillReviewsHTML = (reviews = self.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.className = "reviewName";
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.className = "reviewDate";
    date.innerHTML = review.date;
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.className = "reviewRating";
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.className = "reviewComments";
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    li.setAttribute('aria-current', 'page');
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

