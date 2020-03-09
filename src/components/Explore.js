import React from 'react'
import ReactMapGL, { FlyToInterpolator, Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import Geocoder from 'react-map-gl-geocoder'
import RatingSlider from './RatingSlider'
import { LocationOn, MyLocation, Room } from '@material-ui/icons'
import { Animated } from 'react-animated-css'
import './explore.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import CategoriesVisible from './CategoriesVisible'
import RestaurantIcon from '@material-ui/icons/Restaurant'
import { withRouter } from 'react-router-dom'
import Rating from '@material-ui/lab/Rating'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AsyncReviewCarousel from './AsyncReviewCarousel'

import { yelpSearchBusinesses, yelpGetBusinessDetails } from '../REST/yelp/helpers'
import { MAPBOX_TOKEN } from '../Constants'

class Explore extends React.Component {
  constructor (props) {
    super(props)
    this.mapRef = React.createRef()
    this.dragTimer = null
    this.state = {
      viewport: {
        latitude: 37.785164, // These are garbage values that will get replaced the moment the page loads
        longitude: -100,
        zoom: 3.5,
        bearing: 0,
        pitch: 0,
        width: 400,
        height: 400
      },
      businessMarkers: [],
      firstPageLoad: true,
      popupInfo: {},
      rating: 1,
      userPosition: {},
      rawBusinesses: [],
      categorizedBusinesses: {},
      navValue: null,
      pathBusiness: {},
      reviewsExpanded: false,
      reviewMap: {},
      geocoderBusinesses: []
    }
  }

  componentDidMount () {
    if (this.state.firstPageLoad) {
      window.addEventListener('load', this.setViewportOnLoad.bind(this)) // to make sure the map loads before transitioning
      navigator.geolocation.getCurrentPosition(pos => {
        this.getLocalRestaurants(pos)
          .then(businesses => {
            const markerArray = []
            businesses.forEach((business, index) => {
              markerArray.push((
                <div key={index}>
                  <Marker
                    key={`marker-${business.id}`} longitude={business.coordinates.longitude} latitude={business.coordinates.latitude}
                  >
                    <LocationOn // Location pin icon
                      key={business.id}
                      onClick={() => this.setState({ business: business, popupInfo: business })}
                      onMouseEnter={() => this.setState({ popupInfo: business })}
                      height={12}
                      viewBox='0 0 24 24'
                      style={{
                        cursor: 'pointer',
                        fill: '#d00',
                        stroke: 'none',
                        transform: `translate(${-20 / 2}px,${-20}px)`
                      }}
                    />
                  </Marker>
                </div>
              ))
            })
            this.setState({ rawBusinesses: businesses })
          })
        this.setState({ userPosition: pos.coords })
        this.setState({ firstPageLoad: false })
        if (this.props.location.pathname === '/explore') { // If the path is just /explore, no business was selected from the homepage
          this.setState({
            viewport: {
              longitude: pos.coords.longitude,
              latitude: pos.coords.latitude,
              zoom: 14,
              transitionInterpolator: new FlyToInterpolator({ speed: 3 }),
              transitionDuration: 'auto'
            }
          })
        }
      }, console.error)
    }
  }

  // Bound to execute when the page fully finishes loading
  async setViewportOnLoad () {
    const pathChunks = this.props.location.pathname.replace('/explore', '').split('/') // Get the current path, replace the base, and split
    if (pathChunks.length === 2) { // We want 2 chunks: the first is an empty character string (safety from React??), and the business id
      let pathBusiness
      try {
        pathBusiness = await yelpGetBusinessDetails(pathChunks[1])
      } catch (e) {
        console.log('Error while getting business details', pathChunks)
        return
      }
      // Tell the map to fly to new coordinates
      this.setState({
        viewport: {
          longitude: pathBusiness.coordinates.longitude,
          latitude: pathBusiness.coordinates.latitude,
          zoom: 16,
          transitionInterpolator: new FlyToInterpolator({ speed: 3 }),
          transitionDuration: 'auto'
        }
      })
      this.setState({ pathBusiness })
    }
  }

  renderPathBusiness () {
    const pathChunks = this.props.location.pathname.replace('/explore', '').split('/') // Get the current path, replace the base, and split
    if (pathChunks.length === 2) { // We want 2 chunks: the first is an empty character string (safety from React??), and the business id
      const { pathBusiness } = this.state
      if (pathBusiness.id) {
        return (
          <Marker key='marker-pageloadbusiness' longitude={pathBusiness.coordinates.longitude} latitude={pathBusiness.coordinates.latitude}>
            <Room
              color='primary' // primary === blue here
              fontSize='large'
              height={80}
              viewBox='0 0 24 24'
              style={{
                cursor: 'pointer',
                stroke: 'none',
                transform: `translate(${-20 / 2}px,${-20}px)`
              }}
              onClick={() => this.setState({ popupInfo: this.state.pathBusiness })}
              onMouseEnter={() => this.setState({ popupInfo: this.state.pathBusiness })}
            />
          </Marker>
        )
      }
    }
  }

  // Get restaurants local to the provided coordinates and return an array of them.
  async getLocalRestaurants (pos) {
    if (pos.coords) {
      const businessBody = await yelpSearchBusinesses(pos.coords)
      return businessBody.businesses
    } else return []
  }

  // Return the Marker object of where the user is on the map
  renderUserPin () {
    if (this.state.userPosition.longitude) { // make sure coordinates exist
      return (
        <Marker key={`marker-${this.state.userPosition.longitude}`} longitude={this.state.userPosition.longitude} latitude={this.state.userPosition.latitude}>
          <MyLocation
            height={20}
            viewBox='0 0 24 24'
            style={{
              cursor: 'pointer',
              fill: '#d00',
              stroke: 'none',
              transform: `translate(${-20 / 2}px,${-20}px)`
            }}
          />
        </Marker>
      )
    }
  }

  // Set categorizedBusinesses to an object with ratings for keys and businesses in an array as the value
  // Used in conjunction with the star review box to filter restaurants
  createAnimationGroups () {
    const ratingMap = {}
    this.state.rawBusinesses.forEach(business => {
      if (!ratingMap.hasOwnProperty(business.rating)) { // eslint-disable-line no-prototype-builtins
        ratingMap[business.rating] = []
      }
      ratingMap[business.rating].push(business)
    })
    this.setState({ categorizedBusinesses: ratingMap })
  }

  // Return an array of Markers for the map of businesses
  renderBusinesses () {
    if (this.state.rawBusinesses.length !== 0) { // if there are businesses to render
      if (Object.keys(this.state.categorizedBusinesses).length === 0) { // if the businesses have not been categorized yet
        this.createAnimationGroups()
      }
      const businessesToRender = []
      for (const rating in this.state.categorizedBusinesses) { // in newer versions of node, for in is much faster than Object.keys()
        businessesToRender.push(( // For each business rating, create an animated group so they can be hidden as one
          <Animated key={rating} animationIn='fadeInDown' animationOut='fadeOutUp' animationInDuration={800} animationOutDuration={800} isVisible={parseInt(rating) >= parseInt(this.state.rating)}>
            {this.state.categorizedBusinesses[rating].map(business => {
              return (
                <div key={business.id}>
                  <Marker
                    key={`marker-${business.id}`} longitude={business.coordinates.longitude} latitude={business.coordinates.latitude}
                  >
                    <RestaurantIcon
                      key={business.id}
                      style={{ color: '#E4324C' }}
                      onClick={() => this.setState({ business: business, popupInfo: business })}
                      onMouseEnter={() => { this.setState({ reviewsExpanded: false }); this.setState({ popupInfo: business }) }}
                      height={12}
                      viewBox='0 0 24 24'
                    />
                  </Marker>
                </div>
              )
            })}
          </Animated>
        ))
      }
      return businessesToRender
    }
  }

  // Redirect the user based on the selected business to directions
  getBusinessDirections (business) {
    const { userPosition } = this.state
    if (userPosition.latitude && business.name) {
      window.location.replace(`https://www.google.com/maps/dir/${userPosition.latitude},${userPosition.longitude}/${business.name},${business.location.display_address[0]}`)
    } else {
      window.location.replace(`https://www.google.com/maps/dir/${business.name},${business.location.display_address[0]}`)
    }
  }

  renderPopup () {
    const { popupInfo, reviewsExpanded } = this.state
    if (popupInfo.id) {
      return (
        <Popup
          className='popup-style'
          key={popupInfo.id}
          tipSize={5}
          anchor='top'
          longitude={popupInfo.coordinates.longitude}
          latitude={popupInfo.coordinates.latitude}
          closeOnClick={false}
          onClose={() => this.setState({ popupInfo: {} })}
        >
          <Card className='popup-style'>
            <CardActionArea>
              <CardMedia
                component='img'
                alt={popupInfo.name}
                height='140'
                image={popupInfo.image_url ? popupInfo.image_url : '/questionmark.png'}
                title={popupInfo.name}
              />
              <CardContent>
                <Typography gutterBottom variant='h5' component='h2'>
                  {popupInfo.name}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  <Rating name='half-rating' defaultValue={popupInfo.rating} precision={0.5} readOnly />
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size='small' color='primary'>
          Reviews
              </Button>
              <IconButton
                className='review-expand-arrow'
                onClick={() => this.setState({ reviewsExpanded: !reviewsExpanded })}
                aria-expanded={reviewsExpanded}
                aria-label='show more'
              >
                <ExpandMoreIcon />
              </IconButton>
              <Button size='small' color='primary' style={{ marginLeft: '0px', width: '20px' }} onClick={() => window.location.replace(`https://www.yelp.com/biz/${popupInfo.alias}`)}>
          Yelp
              </Button>
              <Button size='small' color='primary' style={{ marginLeft: '0px' }} onClick={() => this.getBusinessDirections(popupInfo)}>
          Directions
              </Button>
            </CardActions>
            <Collapse in={reviewsExpanded} timeout='auto' unmountOnExit>
              <CardContent>
                <AsyncReviewCarousel data={popupInfo} />
              </CardContent>
            </Collapse>
          </Card>
        </Popup>
      )
    }
  }

  // Search local businesses around these coords (passed from viewport, so where the user is looking)
  async updateBusinessData (coords) {
    let response
    try {
      response = await yelpSearchBusinesses(coords)
    } catch (e) {
      return
    }
    this.setState({ rawBusinesses: response.businesses }) // set new busineses
    this.setState({ categorizedBusinesses: {} }) // force the creation of animation groups
  }

  // Called whenever the map moves in the slightest by the user
  checkDragTime (newViewport) {
    if (this.dragTimer) clearTimeout(this.dragTimer) // if there is a pending business search, clear it
    clearTimeout(this.state.dragTimer)
    this.dragTimer = setTimeout(() => { // after the user stops dragging the map for atleast 1 second, search for businesses
      this.updateBusinessData(newViewport)
    }, 1000)
  }

  render () {
    const { viewport } = this.state
    return (
      <div>
        <ReactMapGL
          {...viewport}
          ref={this.mapRef}
          onViewportChange={viewport => { this.checkDragTime(viewport); this.setState({ viewport: viewport }) }}
          width='100vw'
          height='100vh'
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle='mapbox://styles/mapbox/dark-v10'
        >
          <Geocoder
            mapRef={this.mapRef}
            onViewportChange={viewport => { this.setState({ viewport: viewport }) }}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />

          {this.renderUserPin()}
          {this.renderBusinesses()}
          {this.renderPopup()}
          {this.renderPathBusiness()}

          <NavigationControl className='nav-icon-styles' onViewStateChange={v => this.setState({ viewport: v })} />
          <GeolocateControl className='nav-icon-styles' showUserLocation trackUserLocation onViewStateChange={v => this.setState({ userPosition: v })} />
        </ReactMapGL>
        <RatingSlider
          onRatingChange={r => this.setState({ rating: r })}
          rating={this.state.rating}
          containerComponent={this.props.containerComponent}
        />
        <CategoriesVisible data={this.state.rawBusinesses} />
      </div>
    )
  }
}

export default withRouter(Explore)
