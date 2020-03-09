import React from 'react'
import Button from '@material-ui/core/Button'
import '../App.css'
import { TextField, CircularProgress } from '@material-ui/core'
import Sky from 'react-sky'
import Autocomplete from '@material-ui/lab/Autocomplete'
import GridSearchResults from './GridSearchResults'
import { yelpSearchBusinesses, yelpAutocompleteText } from '../REST/yelp/helpers'
import './explore.css'
import { withRouter } from 'react-router-dom'

const randomLabel = [
  'Discover...',
  'Search...',
  'Best Grill...',
  'Best Burgers...',
  'Breakfast...',
  'Lunch...'
]

class LandingPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      options: [],
      skyImageMap: {},
      loading: false,
      searchTerm: '',
      isGridVisible: false,
      firstPageLoad: true,
      businesses: [],
      userPosition: 0,
      typeTimer: 0
    }
  }

  componentDidMount () {
    const { firstPageLoad } = this.state

    if (firstPageLoad) {
      navigator.geolocation.getCurrentPosition(async pos => {
        if (pos) { // user might've denied it
          this.setPageBackground(pos)
          this.setState({ userPosition: pos })
        }
      }, () => alert('Please allow user position!')) // eslint-disable-line no-undef
      this.setState({ firstPageLoad: false })
    }
  }

  async setPageBackground (pos) {
    let backgroundBusinesses
    try {
      backgroundBusinesses = await yelpSearchBusinesses(pos.coords)
    } catch (e) {
      console.error('there was an error while fetching businesses on page load!', e)
    }
    const imageMap = {}
    backgroundBusinesses.businesses.forEach((business, index) => {
      imageMap[index] = business.image_url
    })
    this.setState({ skyImageMap: imageMap })
    this.setState({ businesses: backgroundBusinesses.businesses })
    this.setState({ options: backgroundBusinesses.businesses })
    this.setState({ isGridVisible: true })
  }

  // Take landing page text box input
  // After 1 second of not typing, fetch autocomplete suggestions
  async handleInput (val) {
    const { userPosition, typeTimer } = this.state
    if (val) {
      this.setState({ searchTerm: val })
    }
    if (typeTimer) clearTimeout(typeTimer)
    if (val.length > 3) { // probably not a term if it's 3 characters or less
      this.setState({
        typeTimer: setTimeout(async () => {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            if (!userPosition || !userPosition.coords) {
              this.setState({ userPosition: pos })
            }
            if (val && pos) {
              let autoCompleteBody
              try {
                autoCompleteBody = await yelpAutocompleteText(val, pos.coords)
              } catch (e) {
                console.error('Error while getting autocomplete suggestions!', e)
                return
              }
              if (autoCompleteBody.businesses.length !== 0) { // If there are businesses, show them as more relevant results ("Panda" -> "Panda Express")
                this.setState({ options: autoCompleteBody.businesses })
              } else { // Just show text-based autocompletions ("best bu" -> "Best Burger")
                this.setState({ options: autoCompleteBody.terms.map(t => { return { name: t.text } }) })
              }
            }
          })
        }, 1000)
      })
    }
  }

  // Reads the term in the landing page text box, does a localized search on it
  async fetchRestaurants () {
    const { userPosition, searchTerm } = this.state
    this.setState({ isGridVisible: false })
    let fetchedBusinesses
    try {
      fetchedBusinesses = await yelpSearchBusinesses(userPosition.coords, searchTerm)
    } catch (e) {
      console.error('error while fetching restaurants', e)
      return
    }
    const imageMap = {}
    fetchedBusinesses.businesses.forEach((business, index) => {
      imageMap[index] = business.image_url
    })
    this.setState({ skyImageMap: imageMap })
    this.setState({ businesses: fetchedBusinesses.businesses })
    this.setState({ isGridVisible: true })
  }

  // This could probably be condensed into a ternary, but for readability, it will stay
  handleKeyPress (event) {
    if (event.key === 'Enter') {
      this.fetchRestaurants()
    }
  }

  render () {
    const { businesses, isGridVisible, skyImageMap, open, options, loading } = this.state
    return (
      <div>
        <Sky
          images={skyImageMap}
          how={20}
          time={10}
          size='200px'
          background='#161921'
        />
        <div className='landing-box'>
          <div className='landing-box-wrapper'>
            <h1 className='landing-title'>Welcome to ChowMapper!</h1>
            <div className='landing-search-group'>
              <Autocomplete
                className='landing-input'
                spacing={20}
                onInputChange={(event, value) => { this.handleInput(value) }}
                open={open}
                onOpen={() => {
                  this.setState({ open: true })
                }}
                onClose={() => {
                  this.setState({ open: false })
                }}
                getOptionSelected={(option, value) => option.name === value.name}
                getOptionLabel={option => option.name}
                options={options}
                loading={loading}
                onKeyDown={e => e.key === 'Enter' && this.fetchRestaurants()}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={randomLabel[Math.round(Math.random() * randomLabel.length)]}
                    fullWidth
                    variant='outlined'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
              <Button variant='contained' color='primary' className='landing-search-button' onClick={() => this.fetchRestaurants()}>
          GO
              </Button>
            </div>
            <Button variant='contained' color='primary' className='landing-not-sure' href='/explore'>
          Not sure?
            </Button>
          </div>
        </div>
        <GridSearchResults userPosition={this.state.userPosition} data={businesses} visible={isGridVisible} style={{ backgroundColor: '#202531' }} />
      </div>
    )
  }
}

export default withRouter(LandingPage)
