/**
 * Common database helper functions.
 */
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
        // fetch restaurants
        fetch(DBHelper.DATABASE_URL)

        // if successful, parse the JSON
            .then(response => response.json())

            // then cache the restaurants
            .then(restaurants => {
                DBHelper.insertRestaurantsToIDB(restaurants);
                callback(null, restaurants);
            })

            // Fetch from indexdb in case network is not available
            .catch(e => {
                console.log('Fetch from network failed!: ' + e);
                console.log('Getting from IndexedDB...');
                DBHelper.getRestaurantsFromIDB((e, restaurants) => callback(null, restaurants));
            });
    }

    /**
     * Insert restaurants to DB.
     */
    static insertRestaurantsToIDB(restaurants) {
        const DB_NAME_REST = 'udacity-restaurants';
        const DB_VERSION_REST = 1;
        const DB_STORE_NAME_REST = 'restaurants';

        // Get correct IDB for all browsers
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        // Let us open our database
        const req = indexedDB.open(DB_NAME_REST, DB_VERSION_REST);

        // onupgradeneeded is the only place where you can alter the structure of the database
        // it is triggered when a database of a bigger version number than the existing stored database is loaded
        // or when there is no previous database
        // we execute it before onsucess to create the store
        req.onupgradeneeded = () => {
            const db = req.result;
            const store = db.createObjectStore(DB_STORE_NAME_REST, {
                keyPath: "id"
            });
        };

        // if success
        req.onsuccess = () => {
            // Start with a transaction to store values in the previously created objectStore.
            const db = req.result;
            const store = db.transaction(DB_STORE_NAME_REST, "readwrite").objectStore(DB_STORE_NAME_REST);

            // Store data
            restaurants.forEach(restaurant => {
                store.put(restaurant);
            });
        }

        // if error
        req.onerror = e => console.error('IDB error: ' + e);
    }

    /**
     * Get restaurants from IndexedDB.
     */
    static getRestaurantsFromIDB(callback) {
        const DB_NAME = 'udacity-restaurants';
        const DB_VERSION = 1;
        const DB_STORE_NAME = 'restaurants';

        // Get correct IDB for all browsers
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        // Let us open our database
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        // if success
        req.onsuccess = () => {
            // Start with a new transaction to read values
            const db = req.result;
            const transac = db.transaction(DB_STORE_NAME, "readwrite");
            const store = transac.objectStore(DB_STORE_NAME);
            const getData = store.getAll();

            getData.onsuccess = () => callback(null, getData.result);
        }
    }

    /**
     * Get reviews from IndexedDB.
     */
    static getReviewsFromIDB(id, callback) {
        const DB_NAME = 'udacity-reviews';
        const DB_VERSION = 1;
        const DB_STORE_NAME = 'reviews-' + id;

        // Get correct IDB for all browsers
        const indexedDB2 = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        // Let us open our database
        const req2 = indexedDB2.open(DB_NAME, DB_VERSION);

        // if success
        req2.onsuccess = () => {
            // Start with a new transaction to read values
            const db2 = req2.result;
            const transac2 = db2.transaction(DB_STORE_NAME, "readwrite");
            const store2 = transac2.objectStore(DB_STORE_NAME);
            const getData = store2.getAll();
            getData.onsuccess = () => callback(null, getData.result);
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch a reviews by its ID.
     */
    static fetchReviewsById(id, callback) {
        fetch(reviews_url)

        // if successful, parse the JSON
            .then(response => response.json())

            // then cache the reviews
            .then(reviews => {
                DBHelper.insertReviewsToIDB(id, reviews);
                callback(null, reviews);
            })

            // Fetch from indexdb in case network is not available
            .catch(e => {
                console.log('Fetch from network failed!: ' + e);
                console.log('Getting from IndexedDB...');
                DBHelper.getReviewsFromIDB(id, (e, id) => callback(null, id));
                // DBHelper.getReviewsFromIDB(id);
                // callback(null, id);
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
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
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
        return (`/img/${restaurant.photograph}`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        if (typeof google !== 'undefined') {
            const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            });
            return marker;
        }
    }

    /**
     * Add restaurant to favourites.
     */
    static addRestaurantToFav(restaurantId, isFav, callback) {
        const url = DBHelper.DATABASE_URL + '/' + restaurantId + '/?is_favorite=' + isFav;
        console.log(isFav);
        fetch(url, {
            method: 'put'
        })
            .then(res => callback(null, 1))
            .catch(err => callback(err, null));
    }



}