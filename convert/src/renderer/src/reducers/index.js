import { createStore, combineReducers, applyMiddleware } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

import videosReducer from './videos-reducer'

const rootReducer = combineReducers({
  videos: videosReducer
})

const store = createStore(rootReducer, {}, applyMiddleware(thunk))

export default store
