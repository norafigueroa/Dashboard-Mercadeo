const express = require('express');
const router = express.Router();
const entrevistasController = require('../controllers/entrevistasController');

router.get('/', entrevistasController.getEntrevistas);
router.post('/', entrevistasController.createEntrevista);
router.get('/fases', entrevistasController.getFases);
router.get('/campus-days', entrevistasController.getCampusDays);
router.patch('/campus-days/:id', entrevistasController.updateCampusDay);

module.exports = router;
