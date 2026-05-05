const express = require('express');
const router = express.Router();
const academicaController = require('../controllers/academicaController');

router.get('/', academicaController.getGeneraciones);
router.patch('/:id', academicaController.updateGeneracion);

module.exports = router;
