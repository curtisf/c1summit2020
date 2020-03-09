import React, { PureComponent } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts'

export default class CategoriesVisible extends PureComponent { // Using a class here vs a hook because extending is easier
  getBarData () {
    const categoryData = {}
    this.props.data.forEach(restaurant => {
      restaurant.categories.forEach(category => {
        if (!categoryData.hasOwnProperty(category.alias)) { // eslint-disable-line no-prototype-builtins
          categoryData[category.alias] = {
            name: category.title,
            count: 20,
            total: 0 // The value incremented per-category
          }
        } else {
          categoryData[category.alias].total++
        }
      })
    })
    const categoryArray = []
    for (const category in categoryData) {
      categoryArray.push(categoryData[category])
    }
    // Copy the array, sort it by total counts, and get the first 5 (See sorting the function at bottom of the file)
    const sortedCategories = [...categoryArray].sort(compareCategories).slice(0, 5)
    return sortedCategories
  }

  render () {
    return (
      <div className='categories-component'>
        <BarChart
          width={400}
          height={300}
          data={this.getBarData()}
          layout='vertical'
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type='number' dataKey='count' />
          <YAxis type='category' dataKey='name' />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip />
          <Legend />
          <Bar dataKey='total' fill='#82ca9d' />
        </BarChart>
      </div>
    )
  }
}

function compareCategories (category1, category2) {
  return category2.total > category1.total ? 1 : -1
}
