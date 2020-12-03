import { Router } from 'express'
import { dbGetAll, dbGetItem, dbPost, dbDelete, dbQueryTrusted } from '../services/orbitdb'
import { loadApi, conserveApi } from './partner-data/spotter-api'
import { csLoadSpreadsheet } from './partner-data/citizen-science-api'
import { omLoadSpreadsheet } from './partner-data/orca-map-api'
import user from './user'
import auth from './auth'
import passwordReset from './password-reset'
import dataIngestion from './data-ingestion'
import cors from 'cors'
import { token } from '../services/passport/index'
import cat from 'ipfs-http-client/src/cat'

const router = new Router()

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */

router.route('/')
  .get((req, res, next) => {
    res.send('Hello')
  })

/**
 *----- USER AND AUTHENTICATION ROUTING METHODS -----
 */

//  CORS Whitelist prod and local frontend URLs for the application
const corsWhitelist = {
  origin: ["ssemmi-api.typehuman.dev", "localhost:8082"]
}

router.use('/apiv1/users', cors(corsWhitelist), user)
router.use('/apiv1/auth', cors(corsWhitelist), auth)
router.use('/apiv1/password-resets', cors(corsWhitelist), passwordReset)
router.use('/apiv1/sightings', cors(corsWhitelist), dataIngestion)

router.get('/apiv1/import',
  token({ required: true, roles: ['admin'] }),
  async (req, res, next) => {
    try {
    await loadApi(conserveApi)
    // GOOGLE SHEETS DATA LOAD
    await omLoadSpreadsheet()
    await Promise.all(setTimeout(async () => {
        // Load data from CITIZEN SCIENCE after 5 seconds of loading the previous data
        // as Google has a maximum request calls with the same API.
        await csLoadSpreadsheet()
    }, 5000))
  } catch(e) {
    console.error(`There was an error loading the data ${e}`)
    res.sendStatus(500)
  }
})

/**
 *----- LOADING DATA FROM API INTO DB METHODS -----
 */
// Load data from CONSERVE.IO SPOTTER API
/* loadApi(conserveApi)
// GOOGLE SHEETS DATA LOAD
  .then(
    omLoadSpreadsheet)
  .catch((err) => console.log('Error Loading Spotter API:' + '\n' + err))
 .then( () => {
     setTimeout( () => {
         // Load data from CITIZEN SCIENCE after 5 seconds of loading the previous data
         // as Google has a maximum request calls with the same API.
         csLoadSpreadsheet()
     }, 5000)
 })
  .catch((err) => console.log(err + '\n' + 'Error Loading Google sheets'))
*/
export default router
