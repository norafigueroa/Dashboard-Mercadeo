const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');

router.get('/', contactoController.getContactos);
router.post('/', contactoController.createContacto);
router.put('/:id', contactoController.updateContacto);
router.delete('/:id', contactoController.deleteContacto);
router.get('/:id/historial', contactoController.getHistorial);

module.exports = router;
