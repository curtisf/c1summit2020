import { YELP_LOOKUP_BUSINESS_SEARCH, YELP_AUTH_TOKEN, CORS_ANYWHERE_BASE_URL, YELP_LOOKUP_BUSINESS_DIRECT, YELP_AUTOCOMPLETE } from '../../Constants'

async function yelpSearchBusinesses (coords, searchTerm) {
  let response
  try {
    response = await fetch(encodeURI(`${CORS_ANYWHERE_BASE_URL}/${YELP_LOOKUP_BUSINESS_SEARCH}?latitude=${coords.latitude}&longitude=${coords.longitude}&sort_by=distance${searchTerm ? `&term=${searchTerm}` : ''}`), { // eslint-disable-line no-undef
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        Origin: 'insertyourdomain',
        Authorization: YELP_AUTH_TOKEN
      }
    })
  } catch (e) {
    console.error('An error occurred while searching for busineses on Yelp', e)
    return
  }
  const responseJson = await response.json()
  return responseJson
}

async function yelpGetBusinessDetails (id) {
  if (!id) return
  let response
  try {
    response = await fetch(encodeURI(`${CORS_ANYWHERE_BASE_URL}/${YELP_LOOKUP_BUSINESS_DIRECT(id)}`), { // eslint-disable-line no-undef
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        Origin: 'insertyourdomain',
        Authorization: YELP_AUTH_TOKEN
      }
    })
  } catch (e) {
    console.error('An error occurred while looking up a business', id, e)
    return
  }
  const responseJson = await response.json()
  return responseJson
}

async function yelpAutocompleteText (text, coords) {
  // if (!coords || !coords.longitude || !coords.latitude) return
  let response
  try {
    response = await fetch(encodeURI(`${CORS_ANYWHERE_BASE_URL}/${YELP_AUTOCOMPLETE}?text=${text}&longitude=${coords.longitude}&latitude=${coords.latitude}`), { // eslint-disable-line no-undef
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        Origin: 'insertyourdomain',
        Authorization: YELP_AUTH_TOKEN
      }
    })
  } catch (e) {
    console.error('An error occurred while searching for busineses on Yelp', e)
    return
  }
  const responseJson = await response.json()
  return responseJson
}

export { yelpSearchBusinesses, yelpGetBusinessDetails, yelpAutocompleteText }
