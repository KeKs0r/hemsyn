import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'



const Shadow = styled.div`
  -webkit-box-shadow: 0 1px 3px 0 rgba(0,0,0,.12),
                      0 1px 2px 0 rgba(0,0,0,.24);
  -moz-box-shadow:    0 1px 3px 0 rgba(0,0,0,.12),
                      0 1px 2px 0 rgba(0,0,0,.24);
  box-shadow:         0 1px 3px 0 rgba(0,0,0,.12),
                      0 1px 2px 0 rgba(0,0,0,.24);
`

const transition = (trans) => {
  return `  
  -webkit-transition: ${trans};
       -o-transition: ${trans};
          transition: ${trans};
  `
}

const Table = styled.table`
  width: 100%;
  max-width: 100%;
  margin-bottom: 2rem;
  background-color: #fff;
`
const Tr = styled.tr`
  ${transition('all .3s ease')}
`

const Th = styled.th`
    font-weight: 600;
    color: #757575;
    padding: 1.6rem;;
    vertical-align: bottom;
    border-bottom: 1px solid rgba(0,0,0,.12);
`

const Td = styled.td`
    text-align: left;
    padding: 1.6rem;;
    vertical-align: top;
    border-top: 0;
    border-bottom: 1px solid #e0e0e0;
`



export default function StatsPage({ actions }) {
  const actionOut = actions.map(a => (
    <Tr><Td>{a.plugin}</Td><Td>{JSON.stringify(a.pattern)}</Td></Tr>
  ))
  return (
    <Shadow>
      <Table>
        <Tr>
          <Th>Service</Th><Th>Pattern</Th>
        </Tr>
        {actionOut}
      </Table>
    </Shadow>
  )
}