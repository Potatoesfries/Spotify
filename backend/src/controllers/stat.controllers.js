import { Album } from "../models/album.model.js"
import { Song } from "../models/song.model.js"
import { User } from "../models/user.model.js"


export const getStat = async(req, res , next )=>{
    try {
        // const totalSongs = await Song.countDocuments()
        // const totalUsers = await User.countDocuments()
        // const totalAlbums = await Album.countDocuments()
        
        // better way to do this is to user a promise 

        const [totalSongs, totalUsers, totalAlbums,uniqueArtists] = await Promise.all([
            Song.countDocuments(),
            User.countDocuments(),
            Album.countDocuments(),

            // now for the uniqueArtist we need to do this 

            Song.aggregate([
                {
                    $unionWith:{
                        coll: "albums",
                        pipeline: [],
                    }
                },
                {
                    $group:{
                        _id: "$artist"
                    }
                },
                {
                    $count:"count"
                }
            ])
        ])

        res.status(200).json({
            totalSongs,
            totalAlbums,
            totalUsers,
            totalArtists: uniqueArtists[0]?.count || 0
        })
    } catch (error) {
        next(error)
    }
}