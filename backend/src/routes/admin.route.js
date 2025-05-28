import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { createSong, deleteSong , createAlbum, deleteAlbum, checkAdmin} from "../controllers/admin.controllers.js";


const router = Router();



router.get('/check',requireAdmin, checkAdmin)

router.post('/songs', createSong)
router.delete('/songs/:id', deleteSong)

router.post('/albums', createAlbum)
router.delete('/albums/:id', deleteAlbum)

export default router;