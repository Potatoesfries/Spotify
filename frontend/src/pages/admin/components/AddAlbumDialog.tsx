import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { axiosInstance } from "@/lib/axios"
import { Plus, Upload } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

const AddAlbumDialog = () => {

    const [albumDialogOpen, setAlbumDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const imageInputRef = useRef<HTMLInputElement>(null)
    
    const [files,setFiles] = useState<{image: File | null }>({
        image: null
    })

    const [newAlbum, setNewAlbum] = useState({
            title : "",
            artist: "",
            releaseYear: "",
    })

    const handleSubmit = async ()=>{
		setIsLoading(true)
		try {
			if(!files.image) return toast.error("please upload image files") 

			const formData = new FormData()
			formData.append("title", newAlbum.title)	
			formData.append("artist", newAlbum.artist)
	    formData.append("releaseYear", newAlbum.releaseYear)
			
			formData.append("imageFile", files.image)
			
			await axiosInstance.post("/admin/albums", formData, {
				headers:{
					"Content-Type": "multipart/form-data"
				}
			})

			setNewAlbum({
				title: "",
				artist: "",
				releaseYear: "",
			})
			setFiles({ image: null })
			
			toast.success("Album added successfully")
			
		} catch (error:any) {
			toast.error( "Failed to add Album")
		}finally{
			setIsLoading(false)
		}
	}

  return (
    <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen} >
        <DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Album
				</Button>
			</DialogTrigger>

            <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
            <DialogHeader>
					<DialogTitle>Add New Album</DialogTitle>
					<DialogDescription>Add a new Album to your collection</DialogDescription>
				</DialogHeader>

                <div className='space-y-4 py-4'>

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files![0] }))}
					/>

					{/* image upload area */}
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 20)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					{/* other fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={newAlbum.title}
							onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={newAlbum.artist}
							onChange={(e) => setNewAlbum({ ...newAlbum, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
          <div className='space-y-2'>
						<label className='text-sm font-medium'>Release year</label>
						<Input
							value={newAlbum.releaseYear}
							onChange={(e) => setNewAlbum({ ...newAlbum, releaseYear: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setAlbumDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600'
						disabled={isLoading || !File  || !newAlbum.title || !newAlbum.artist}
					>
						{isLoading ? "Creating..." : "Add Album"}
					</Button>
				</DialogFooter>

            </DialogContent>
    </Dialog>
  )
}

export default AddAlbumDialog
