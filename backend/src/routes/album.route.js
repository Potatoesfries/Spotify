import { Router } from "express";
import {getAllAlbums, getAlbumById} from "../controllers/album.controllers.js"

const router = Router()

router.get('/', getAllAlbums)
router.get('/:albumId', getAlbumById)

export default router