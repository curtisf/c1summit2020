/*
 * This file is in public because React really hates tensorflow.js
 * Bare JavaScript works well with tensorflow.js
*/

const CNN_URLS = {
  model:
        'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
  metadata:
        'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
}

class SentimentAnalyser {
  async init (urls) {
    this.urls = urls
    console.log('Loading analyzer')
    this.model = await this.loadModel(urls.model)
    await this.loadMetadata()
    return this
  }

  async loadModel (url) {
    console.log('Loading pretrained model from ', url)
    try {
      const model = await tf.loadModel(url) // eslint-disable-line no-undef
      console.log('Done loading model')
      return model
    } catch (err) {
      console.error('Loading model failed!', err)
    }
  }

  async getMetadata (url) {
    console.log('Loading metadata from ', url)
    try {
      const metadata = await fetch(url) // eslint-disable-line no-undef
      const metadataJson = await metadata.json()
      console.log('Done loading metadata')
      return metadataJson
    } catch (err) {
      console.error('Loading metadata failed', err)
    }
  }

  async loadMetadata () {
    const sentimentMetadata = await this.getMetadata(this.urls.metadata)
    this.indexFrom = sentimentMetadata.index_from
    this.maxLen = sentimentMetadata.max_len
    console.log('indexFrom', this.indexFrom, 'maxLen', this.maxLen)
    this.wordIndex = sentimentMetadata.word_index
  }

  predict (str) {
    const inputWords = str.trim().toLowerCase().replace(/(\.|,|!)/g, '').split(' ')
    const wordBuffer = tf.buffer([1, this.maxLen], 'float32') // eslint-disable-line no-undef
    const inputWordLen = inputWords.length
    for (let i = 0; i < inputWordLen; ++i) {
      const word = inputWords[i]
      if (word in this.wordIndex) {
        wordBuffer.set(this.wordIndex[word] + this.indexFrom, 0, i)
      }
    }
    const input = wordBuffer.toTensor()
    const output = this.model.predict(input)
    const score = output.dataSync()[0]
    output.dispose()
    return score
  }
}

async function setupAnalyzer (urls) {
  const analyser = await new SentimentAnalyser().init(urls)
  return analyser
}

window.analyser = setupAnalyzer(CNN_URLS)
