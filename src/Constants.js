const CORS_ANYWHERE_BASE_URL = 'https://challenge-corsanywhere.herokuapp.com'
const GOOGLE_LOOKUP_PLACE_SEARCH = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
const GOOGLE_LOOKUP_PLACE_DIRECT = 'https://maps.googleapis.com/maps/api/place/details/json'
const YELP_LOOKUP_BUSINESS_SEARCH = 'https://api.yelp.com/v3/businesses/search'
const YELP_LOOKUP_BUSINESS_DIRECT = (id) => `https://api.yelp.com/v3/businesses/${id}`
const YELP_AUTOCOMPLETE = 'https://api.yelp.com/v3/autocomplete'

const GOOGLE_AUTH_TOKEN = ''
const YELP_AUTH_TOKEN = ''
const MAPBOX_TOKEN = ''

export { YELP_AUTH_TOKEN, CORS_ANYWHERE_BASE_URL, GOOGLE_LOOKUP_PLACE_DIRECT, GOOGLE_LOOKUP_PLACE_SEARCH, YELP_LOOKUP_BUSINESS_SEARCH, YELP_LOOKUP_BUSINESS_DIRECT, GOOGLE_AUTH_TOKEN, MAPBOX_TOKEN, YELP_AUTOCOMPLETE }
