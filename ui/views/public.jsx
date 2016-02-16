'use babel'
import React from 'react'
import LeftNav from '../com/leftnav'
import RightNav from '../com/rightnav'
import MsgList from '../com/msg-list'
import Oneline from '../com/msg-view/oneline'
import app from '../lib/app'

export default class PublicPosts extends React.Component {
  constructor(props) {
    super(props)
    this.state = { channels: app.channels || [] }

    this.refresh = () => {
      this.setState({ channels: app.channels })
    }
    app.on('update:channels', this.refresh)
  }
  componentWillUnmount() {
    app.removeListener('update:channels', this.refresh)
  }

  onTogglePin(channel) {
    app.ssb.patchwork.toggleChannelPinned(channel, err => {
      if (err)
        app.issue('Failed to pin channel', err)
    })
  }

  render() {
    const channel = this.props.params.channel
    const channelData = findChannelData(channel)
    console.log(channel, channelData)
    const ThisRightNav = props => {
      if (channel) {
        return <RightNav>
          <hr className="labeled" data-label="channel" />
          <a className="btn" onClick={this.onTogglePin.bind(this, channel)}><i className="fa fa-thumb-tack" /> { (channelData && channelData.pinned) ? 'Unpin' : 'Pin' } this channel</a>
        </RightNav>
      }
      return <RightNav/>
    }

    // msg-list params
    const cursor = msg => {
      if (msg)
        return [msg.ts, false]
    }
    const source = (opts) => {
      if (channel)
        return app.ssb.patchwork.createChannelStream(channel, opts)
      return app.ssb.patchwork.createPublicPostStream(opts)
    }

    // render content
    return <div id="public-posts" key={channel||'*'}>
      <MsgList
        ref="list"
        threads
        dateDividers
        topNavProps={{ placeholder: 'Search your inbox' }}
        composerProps={{ isPublic: true, channel: channel }}
        LeftNav={LeftNav} leftNavProps={{location: this.props.location}}
        RightNav={ThisRightNav}
        ListItem={Oneline} listItemProps={{ userPic: true }}
        live={{ gt: [Date.now(), null] }}
        emptyMsg={(channel) ? ('No posts on "'+channel+'"... yet!') : 'Your feed is empty.'}
        source={source}
        cursor={cursor} />
    </div>
  }
}

function findChannelData(channel) {
  if (!channel)
    return null
  for (var i=0; i < app.channels.length; i++) {
    if (app.channels[i].name === channel)
      return app.channels[i]
  }
}