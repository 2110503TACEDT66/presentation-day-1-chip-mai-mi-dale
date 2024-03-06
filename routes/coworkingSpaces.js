const express = require('express');
const {getCoworkingSpace, getCoworkingSpaces, createCoworkingSpace, updateCoworkingSpace, deleteCoworkingSpace} = require('../controllers/coworkingSpaces');

/**
 * @swagger
 * components:
 *   schemas:
 *     CoworkingSpace:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the co-working space
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         ลําดับ:
 *           type: string
 *           description: Ordinal number
 *         name:
 *           type: string
 *           description: CoworkingSpace name
 *         address:
 *           type: string
 *           description: House No., Street, Road
 *         district:
 *           type: string
 *           description: District
 *         province:
 *           type: string
 *           description: Province
 *         postalcode:
 *           type: string
 *           description: 5-digit postal code
 *         tel:
 *           type: string
 *           description: Telephone number
 *         openTime:
 *           type: string
 *           description: CoworkingSpace's open time
 *         closeTime:
 *           type: string
 *           description: CoworkingSpace's close time
 *       example:
 *         id: 609bda561452242d88d36e37
 *         ลําดับ: 121
 *         name: Happy Co-workingSpace
 *         address: 121 ถ.สุขุมวิท
 *         district: บางนา
 *         province: กรุงเทพมหานคร
 *         postalcode: 10110
 *         tel: 02-2187000
 *         open-time: 09:00
 *         close-time: 00:00
 */

/**
 * @swagger
 * tags:
 *   name: CoworkingSpaces
 *   description: The coworkingSpaces managing API
 */

/**
 * @swagger
 * /coworkingSpaces:
 *   get:
 *     summary: Return the list of all the coworkingSpaces
 *     tags: [CoworkingSpaces]
 *     responses:
 *       200:
 *         description: The list of all the coworkingSpaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoworkingSpace'
 */

/**
 * @swagger
 * /coworkingSpaces/{id}:
 *   get:
 *     summary: Get the coworkingSpace by id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The coworkingSpace id
 *     responses:
 *       200:
 *         description: The coworkingSpace description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoworkingSpace'
 *       404:
 *         description: The coworkingSpace was not found
 */

/**
 * @swagger
 * /coworkingSpaces:
 *   post:
 *     summary: Create a new coworkingSpace
 *     tags: [CoworkingSpaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpace'
 *     responses:
 *       201:
 *         description: The coworkingSpace was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoworkingSpace'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /coworkingSpaces/{id}:
 *   put:
 *     summary: Update the coworkingSpace by the id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The coworkingSpace id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpace'
 *     responses:
 *       200:
 *         description: The coworkingSpace was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoworkingSpace'
 *       404:
 *         description: The coworkingSpace was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /coworkingSpaces/{id}:
 *   delete:
 *     summary: Remove the coworkingSpace by the id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The coworkingSpace id
 *     
 *     responses:
 *       200:
 *         description: The coworkingSpace was deleted
 *       404:
 *         description: The coworkingSpace was not found
 */

//Include other resource routers
// const reservationsRouter = require('./reservations');
// const roomRouter = require('./rooms');

const router = express.Router();
const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
// router.use('/:coworkingSpaceId/reservations/', reservationsRouter);
// router.use('/:coworkingSpaceId/rooms', roomRouter);

router.route('/').get(getCoworkingSpaces).post(protect, authorize('admin'), createCoworkingSpace);
router.route('/:id').get(getCoworkingSpace).put(protect, authorize('admin'), updateCoworkingSpace).delete(protect, authorize('admin'), deleteCoworkingSpace);

module.exports=router;
