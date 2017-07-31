import React from 'react'
import _ from 'lodash'
import ActionList from './action-list'
import styled from 'styled-components'


const Header = styled.h1`
  font-size: 2.4rem;
  line-height: 3.2rem;
  letter-spacing: 0;
  font-weight: 300;
  color: #212121;
  text-transform: inherit;
  margin-bottom: 1rem;
  text-align: center;
`

const SubHeader = styled.h2`
  font-size: 1.5rem;
  line-height: 2.8rem;
  letter-spacing: 0.01rem;
  font-weight: 400;
  color: #212121;
  text-align: center;
`

export default function StatsPage({ patterns }) {
  const actions = _.get(patterns, 'actions', [])
  return (
    <div>
      <Header>Service Patterns</Header>
      <SubHeader>{_.get(patterns, 'app')}</SubHeader>
      <ActionList actions={actions} />
    </div>
  )
}