import React, { PureComponent } from 'react'
import { Rating } from '@material-ui/lab'

class RatingSlider extends PureComponent { // Using a class here vs a hook because extending is easier
  render () {
    return (
      <div className='rating-slider'>
        <Rating name='half-rating' defaultValue={this.props.rating} precision={0.5} onChange={(_, val) => this.props.onRatingChange(val)} />
      </div>
    )
  }
}

export default RatingSlider
