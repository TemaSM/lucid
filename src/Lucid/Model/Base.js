'use strict'

/*
 * adonis-lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const moment = require('moment')
const CollectionSerializer = require('../Serializers/Collection')
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * Lucid model is a base model and supposed to be
 * extended by other models.
 *
 * @class BaseModel
 */
class BaseModel {
  constructor () {
    this._instantiate()
    return new Proxy(this, require('./proxyHandler'))
  }

  /**
   * The attributes to be considered as dates. By default
   * @ref('Model.createdAtColumn') and @ref('Model.updatedAtColumn')
   * are considered as dates.
   *
   * @attribute dates
   *
   * @return {Array}
   *
   * @static
   */
  static get dates () {
    const dates = []
    if (this.createdAtColumn) { dates.push(this.createdAtColumn) }
    if (this.updatedAtColumn) { dates.push(this.updatedAtColumn) }
    return dates
  }

  /**
   * The attribute name for created at timestamp.
   *
   * @attribute createdAtColumn
   *
   * @return {String}
   *
   * @static
   */
  static get createdAtColumn () {
    return 'created_at'
  }

  /**
   * The attribute name for updated at timestamp.
   *
   * @attribute updatedAtColumn
   *
   * @return {String}
   *
   * @static
   */
  static get updatedAtColumn () {
    return 'updated_at'
  }

  /**
   * The serializer to be used for serializing
   * data. The return value must always be a
   * ES6 class.
   *
   * By default Lucid uses @ref('BaseSerializer')
   *
   * @attribute Serializer
   *
   * @return {Class}
   */
  static get Serializer () {
    return CollectionSerializer
  }

  /**
   * This method is executed for all the date fields
   * with the field name and the value. The return
   * value gets saved to the database.
   *
   * Also if you have defined a setter for a date field
   * this method will not be executed for that field.
   *
   * @method formatDates
   *
   * @param  {String}    key
   * @param  {String|Date}    value
   *
   * @return {String}
   */
  static formatDates (key, value) {
    return moment(value).format(DATE_FORMAT)
  }

  /**
   * This method is executed when toJSON is called on a
   * model or collection of models. The value received
   * will always be an instance of momentjs and return
   * value is used.
   *
   * NOTE: This method will not be executed when you define
   * a getter for a given field.
   *
   * @method castDates
   *
   * @param  {String}  key
   * @param  {Moment}  value
   *
   * @return {String}
   *
   * @static
   */
  static castDates (key, value) {
    return value.format(DATE_FORMAT)
  }

  /**
   * Tells whether model instance is new or
   * persisted to database.
   *
   * @attribute isNew
   *
   * @return {Boolean}
   */
  get isNew () {
    return !this.$persisted
  }

  /**
   * Returns a boolean indicating whether model
   * has been deleted or not
   *
   * @method isDeleted
   *
   * @return {Boolean}
   */
  get isDeleted () {
    return this.$frozen
  }

  /**
   * Instantiate the model by defining constructor properties
   * and also setting `__setters__` to tell the proxy that
   * these values should be set directly on the constructor
   * and not on the `attributes` object.
   *
   * @method instantiate
   *
   * @return {void}
   *
   * @private
   */
  _instantiate () {
    this.__setters__ = [
      '$attributes',
      '$persisted',
      'primaryKeyValue',
      '$originalAttributes',
      '$relations',
      '$sideLoaded',
      '$parent',
      '$frozen'
    ]

    this.$attributes = {}
    this.$persisted = false
    this.$originalAttributes = {}
    this.$relations = {}
    this.$sideLoaded = {}
    this.$parent = null
    this.$frozen = false
  }

  /**
   * Freezes the model instance for modifications
   *
   * @method freeze
   *
   * @return {void}
   */
  freeze () {
    this.$frozen = true
  }

  /**
   * Converts model instance toJSON using the serailizer
   * toJSON method
   *
   * @method toJSON
   *
   * @return {Object}
   */
  toJSON () {
    return new this.constructor.Serializer(this, null, true).toJSON()
  }
}

module.exports = BaseModel
