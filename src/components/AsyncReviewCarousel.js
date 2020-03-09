import React from 'react'
import { Carousel } from 'antd'
import { googleLookupByPlaceId, googleSearchByNumber } from '../REST/google/helpers'
import MoodIcon from '@material-ui/icons/Mood'
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied'
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied'

export default class AsyncReviewCarousel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      predicted: false,
      reviews: []
    }
  }

  componentDidMount () {
    const { predicted } = this.state
    const { data } = this.props
    if (!predicted) {
      googleSearchByNumber(data.phone).then(i => {
        googleLookupByPlaceId(i.candidates[0].place_id).then(r => {
          const predictedReviews = []
          window.analyser.then(a => {
            r.result.reviews.forEach(review => {
              if (review.text) { // some reviews are just a rating and no text, ignore
                review.score = a.predict(review.text)
                predictedReviews.push({ name: 'Review', description: review.text, score: review.score })
              }
            })
            this.setState({ reviews: predictedReviews })
            this.setState({ predicted: true })
          })
        })
      })
    }
  }

  getEmojiForScore (score) {
    if (score > 0.6) {
      return <MoodIcon />
    } else if (score > 0.4) {
      return <SentimentDissatisfiedIcon />
    } else {
      return <SentimentVeryDissatisfiedIcon />
    }
  }

  getCarouselComponent () {
    const { predicted, reviews } = this.state
    if (predicted) {
      return (
        <Carousel autoplay>
          {reviews.map((review, index) => {
            return (
              <div key={index}>
                <h3>{'"' + review.description.substring(0, 200) + '..."'}</h3>
                {this.getEmojiForScore(review.score)} {Math.floor(review.score * 100)}% Positive
              </div>)
          })}
        </Carousel>)
    } else {
      return (
        <Carousel>
          <div>
            <h3>Loading...</h3>
          </div>
        </Carousel>
      )
    }
  }

  render () {
    return (
      <div>
        {this.getCarouselComponent()}
      </div>
    )
  }
}

/*
async getPredictedReviews(business) {
    // Expect an array of reviews from Google, return array of <Item> with predictions
    const { reviewMap } = this.state
      if (!reviewMap[business.id]) {
        let tempReviewMap = {}
      googleSearchByNumber(business.phone).then(i => {
        console.log('phone lokup', i)
        googleLookupByPlaceId(i.candidates[0].place_id).then(r => {
          console.log('Lookup result', r)
          const predictedReviews = []
          window.analyser.then(a => {
            r.result.reviews.forEach(review => {
              if (review.text) { // some reviews are just a rating and no text
                console.log('Prediction: ', a.predict(review.text), review.text)
                review.score = a.predict(review.text)
                predictedReviews.push({ name: 'Review', description: review.text + JSON.stringify(review.score) })
              }
            })
            tempReviewMap[business.id] = predictedReviews
          this.setState({ reviewMap: tempReviewMap })
          console.log('Set state, about to return')
          return tempReviewMap[business.id]
          })
        })
      })
    } else {
      console.log('Already found review map', reviewMap[business.id])
      return reviewMap[business.id]
    }
  }
  */
