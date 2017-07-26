const store = require('./store')
const { size, isArray } = require('lodash')
const Joi = require('joi')

const eventSchema = Joi.object().keys({
  type: Joi.string().trim().regex(/\./).required()
})

function initEvents(options, next) {
  this.use(require('hemera-joi'))
  this.setOption('payloadValidator', 'hemera-joi')

  this.add(
    {
      topic: 'events',
      cmd: 'get',
      filter: Joi.object().required()
    },
    (msg, reply) => {
      reply(null, store.get(msg.filter))
    }
  )

  this.add(
    {
      topic: 'events',
      cmd: 'add',
      events: Joi.alternatives()
        .try(Joi.array().items(eventSchema), eventSchema)
        .required()
    },
    (msg, reply) => {
      const events = isArray(msg.events) ? msg.events : [msg.events]
      events.forEach(store.add)
      reply(null, { success: true })
      try {
        events.forEach(e => {
          const topic = e.type.split('.')[0]
          const publishEvent = {
            topic,
            type: e.type,
            pubsub$: true,
            event: e
          }
          if (size(this.list(publishEvent)) > 0) {
            this.act(publishEvent)
          }
        })
      } catch (e) {
        this.log.error(e)
      }
    }
  )
  next()
}

module.exports = {
  plugin: initEvents,
  options: {},
  attributes: {
    pkg: {
      name: 'eventstore'
    }
  }
}
