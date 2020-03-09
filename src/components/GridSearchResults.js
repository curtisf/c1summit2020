import React from 'react'
import Rating from '@material-ui/lab/Rating'
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { Animated } from 'react-animated-css'

const EARTH_RADIUS = 6371e3 // 6,371km

class GridSearchResults extends React.Component {
  constructor ({ userPosition }) {
    super()
    this.state = { userPosition }
  }

  componentWillReceiveProps ({ userPosition }) {
    this.setState({ ...this.state, userPosition })
  }

  getHaversineDistance (businessCoords) {
    // Calculates the 'as-the-crow-flies' distance between these two coordinate pairs (Haversine distance)
    // Explanation found here: https://www.movable-type.co.uk/scripts/latlong.html
    const userPos = this.state.userPosition.coords
    const userLatRadians = userPos.latitude * (Math.PI / 180)
    const businessLatRadians = businessCoords.latitude * (Math.PI / 180)
    const diffLatRadians = (businessCoords.latitude - userPos.latitude) * (Math.PI / 180)
    const diffLongRadians = (businessCoords.longitude - userPos.longitude) * (Math.PI / 180)

    const squareOfHalfChordLength = Math.sin(diffLatRadians / 2) * Math.sin(diffLatRadians / 2) + Math.cos(userLatRadians) * Math.cos(businessLatRadians) * Math.sin(diffLongRadians / 2) * Math.sin(diffLongRadians / 2)
    const angularDistance = 2 * Math.atan(Math.sqrt(squareOfHalfChordLength), Math.sqrt(1 - squareOfHalfChordLength))
    const diameter = EARTH_RADIUS * angularDistance

    return Math.round(diameter / 100) / 10 // meters to kilometers
  }

  getGridListTiles () {
    return (
      <div>
        {this.props.data.map(tile => (
          <a href={`/explore/${tile.id}`} key={tile.id}>
            <GridListTile cols={1} rows={1} key={tile.id}>
              <img src={tile.image_url} alt={tile.name} className='tile-image' />
              <GridListTileBar
                key={tile.id}
                title={`${tile.name} - ${this.getHaversineDistance(tile.coordinates)}km`}
                titlePosition='top'
                actionIcon={
                  <Rating name='half-rating' defaultValue={tile.rating} precision={0.5} readOnly />
                }
                actionPosition='right'
                className='tile-titlebar'
              />
            </GridListTile>
          </a>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div className='gridlist-root'>
        <Animated animationIn='fadeIn' animationOut='fadeOut' animationInDuration={800} animationOutDuration={800} isVisible={this.props.visible}>
          <GridList padding={20} spacing='20' cols={1} className='gridlist-component'>
            {this.getGridListTiles()}
          </GridList>
        </Animated>
      </div>
    )
  }
}

export default GridSearchResults
