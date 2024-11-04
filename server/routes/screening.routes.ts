import express from 'express';

import controller from '../controllers/screening.controller'
import verifyScreening from '../middlewares/verifyScreening'
import auth from '../middlewares/verifyAuth'

const router = express.Router();

router.post(
    '/add',
    [auth.verifyToken, auth.isAdmin, verifyScreening.checkDate],
    controller.addScreening
);

router.get("/",
  controller.getAllScreenings
);

router.get("/genres",
  controller.getGenres
);

router.get("/dates",
  controller.getDates
);

router.get("/:id",
  [
    verifyScreening.checkScreeningId
  ],
  controller.getOneScreening
);

// Route associée pour remplir la base de données une seule fois
router.post('/populate-once', async (req, res) => {
  try {
      await controller.populateDB();
      res.status(200).json({ message: 'Base de données mise à jour avec succès.' });
  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la base de données.', error });
  }
});

export default router;