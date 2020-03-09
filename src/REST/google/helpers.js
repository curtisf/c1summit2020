import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import { CORS_ANYWHERE_BASE_URL, GOOGLE_LOOKUP_PLACE_SEARCH, GOOGLE_LOOKUP_PLACE_DIRECT, GOOGLE_AUTH_TOKEN } from '../../Constants'

const PhoneNumberUtilInstance = PhoneNumberUtil.getInstance()

async function googleSearchByNumber (number) {
  // It's assumed that the number being passed to
  // this function looks like (804) 123-4567
  // It will be converted to E164 as mandated by Google
  const parsedNumber = PhoneNumberUtilInstance.parseAndKeepRawInput(number)
  const e164Number = PhoneNumberUtilInstance.format(parsedNumber, PhoneNumberFormat.E164)
  let phoneNumberSearch
  try {
    phoneNumberSearch = await fetch(`${CORS_ANYWHERE_BASE_URL}/${GOOGLE_LOOKUP_PLACE_SEARCH}?key=${GOOGLE_AUTH_TOKEN}&inputtype=phonenumber&input=${encodeURIComponent(e164Number)}`, { // eslint-disable-line no-undef
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        Origin: 'localhost'
      }
    })
  } catch (e) {
    console.error('There was an error while looking up the phone number!', e164Number, e)
    return
  }
  if (!phoneNumberSearch.ok) {
    console.error('Google returned a non-okay status code for the phone number lookup!', e164Number, phoneNumberSearch)
    return
  }
  const searchBody = await phoneNumberSearch.json()
  return searchBody
}

async function googleLookupByPlaceId (placeId) {
  let businessResponse
  try {
    businessResponse = await fetch(`${CORS_ANYWHERE_BASE_URL}/${GOOGLE_LOOKUP_PLACE_DIRECT}?key=${GOOGLE_AUTH_TOKEN}&place_id=${placeId}`, { // eslint-disable-line no-undef
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        Origin: 'localhost'
      }
    })
  } catch (e) {
    console.error('There was an error while looking up a business on Google!', placeId, e)
    return
  }
  const businessJson = await businessResponse.json()
  return businessJson
}

export { googleLookupByPlaceId, googleSearchByNumber }
