import _ from 'lodash'
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import { connect } from 'react-redux'
import * as actions from '../actions'
import { withRouter } from '../utils/with-router'

class VideoSelectScreen extends Component {
  state = {
    hovering: false
  }

  onDrop = (files) => {
    console.dir(files[0], { showHidden: true })

    // invalid file types are not added to files object
    const videos = _.map(files, ({ name, path, size, type }) => {
      return { name, path, size, type }
    })

    if (videos.length) {
      this.props.addVideos(videos)

      if (!this.props.small) {
        this.props.router.navigate('/convert')
      }
    }
  }

  renderChildren({ isDragActive, isDragReject, getRootProps, getInputProps }) {
    return (
      <div
        {...getRootProps({
          className: `dropzone ${
            isDragActive ? 'dropzone-active' : isDragReject ? 'dropzone-reject' : ''
          }`
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <h4 className="drop-message">Omnomnom, let me have those videos!</h4>
        ) : isDragReject ? (
          <h4 className="drop-message">Uh oh, I don't know how to deal with that type of file!</h4>
        ) : (
          <h4 className="drop-message">Drag and drop some files on me, or click to select.</h4>
        )}
      </div>
    )
  }

  render() {
    return (
      <div className={this.props.small ? 'video-select-screen-small' : 'video-select-screen'}>
        <Dropzone onDrop={this.onDrop} multiple accept={{ 'video/*': [] }} useFsAccessApi={false}>
          {this.renderChildren}
        </Dropzone>
      </div>
    )
  }
}

export default withRouter(connect(null, actions)(VideoSelectScreen))
